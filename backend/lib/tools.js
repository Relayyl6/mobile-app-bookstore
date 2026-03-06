import { v2 as cloudinary } from "cloudinary";
import { getHeader } from "pdf-parse/node";
import { PDFParse } from "pdf-parse";
import { GoogleAIFileManager } from "@google/generative-ai/server";
import fs from "fs";
import path from "path";
import os from "os";
import axios from "axios";

/**
 * @param {Buffer} buffer
 * @param {"image"|"video"|"raw"} [resourceType="raw"]
 */
export default function uploadToCloudinary(buffer, resourceType = "raw") {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { resource_type: resourceType },
      (error, result) => {
        if (error) return reject(error);
        if (!result) return reject(new Error("No result from Cloudinary"));
        resolve(result.secure_url);
      }
    );

    stream.end(buffer);
  });
}

export async function checkPdf(url) {
  const result = await getHeader(url, true);

  if (!result?.status) throw new Error("File is not a valid PDF");

  return {
    size: result.size,
    status: result.status,
    headers: result.headers,
  };
}



export async function extractPdfInfo(url) {
  const parser = new PDFParse({ url });
  const info = await parser.getInfo();
  await parser.destroy();

  return {
    title: info.info?.Title || "Unknown Title",
    author: info.info?.Author || "Unknown Author",
    genre: [], // AI can fill later
    publishedYear: info.info?.CreationDate
      ? new Date(info.info.CreationDate).getFullYear()
      : null,
    language: info.info?.Language || "Unknown",
    totalPages: info.total
  };
}

export async function extractPdfText(url) {
  const parser = new PDFParse({ url });
  const result = await parser.getText();
  await parser.destroy();
  return result.text;
}

export function cleanExtractedText(text) {
  let cleaned = text

    // 1. Remove "-- N of N --" page markers
    .replace(/--\s*\d+\s*of\s*\d+\s*--/gi, "")

    // 2. Remove standalone page numbers on their own line
    .replace(/^\s*\d{1,4}\s*$/gm, "")

    // 3. Remove lines that are pure OCR garbage —
    //    lines containing NO Latin letters at all (just symbols, tabs, noise)
    .replace(/^[^a-zA-Z]+$/gm, "")

    // 4. Remove lines that are mostly garbage:
    //    fewer than 3 actual word-characters on the whole line
    .replace(/^.{0,20}$(?!\n)/gm, (line) =>
      (line.match(/[a-zA-Z]/g) || []).length < 3 ? "" : line
    )

    // 5. Common boilerplate/footer patterns
    .replace(/^www\..+$/gm, "")
    .replace(/^https?:\/\/.+$/gm, "")
    .replace(/^Digitized by.+$/gm, "")
    .replace(/^in \d{4} with funding.+$/gm, "")
    .replace(/^Kahle\/.+$/gm, "")
    .replace(/^Food for the mind\s*$/gm, "")
    .replace(/^Made in the USA.+$/gm, "")
    .replace(/^ISBN[\s\d]+$/gm, "")
    .replace(/^\d{13}$/gm, "")
    .replace(/^Strictly for personal use.+$/gm, "")
    .replace(/^Note: This book is brought.+$/gm, "")

    // 6. Collapse multiple blank lines into one
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  // 7. Strip garbage preamble — find where real prose starts.
  //    "Real prose" = a line with 6+ words that looks like a sentence.
  //    Everything before that line is likely cover/OCR noise.
  cleaned = stripGarbagePreamble(cleaned);

  return cleaned;
}

// ─────────────────────────────────────────────────────────────────
// stripGarbagePreamble
// Scans lines from the top and discards everything until it finds
// a line that looks like real prose (6+ words, mostly lowercase).
// Preserves title/author lines if they appear to be legitimate.
// ─────────────────────────────────────────────────────────────────
function stripGarbagePreamble(text) {
  const lines = text.split("\n");

  // Find the first line index that looks like real content:
  // - 6 or more words, OR
  // - looks like a clean title/author line (3+ words, mostly alpha)
  const realStartIdx = lines.findIndex((line) => {
    const words = line.trim().split(/\s+/).filter(Boolean);
    if (words.length < 3) return false;

    const alphaChars = (line.match(/[a-zA-Z]/g) || []).length;
    const totalChars = line.replace(/\s/g, "").length || 1;
    const alphaRatio = alphaChars / totalChars;

    // Reject lines that are mostly non-alpha (OCR garbage)
    if (alphaRatio < 0.6) return false;

    // Accept if 6+ words (likely prose) or 3+ words with high alpha ratio
    return words.length >= 6 || (words.length >= 3 && alphaRatio > 0.85);
  });

  if (realStartIdx <= 0) return text; // nothing to strip
  if (realStartIdx > 30) return text; // too aggressive — abort

  console.log(`🧹 Stripping ${realStartIdx} garbage preamble lines`);
  return lines.slice(realStartIdx).join("\n").trim();
}


// ─────────────────────────────────────────────────────────────────
// splitIntoChapters
// ─────────────────────────────────────────────────────────────────
export function splitIntoChapters(text) {
  // Try to split by Chapter/Part headings
  const chapterRegex = /(?:chapter|part)\s+(?:\d+|one|two|three|four|five|six|seven|eight|nine|ten)[:\.\-\s]*/gi;
  const rawChapters = text.split(chapterRegex);

  const chapters = rawChapters
    .map((chunk, i) => {
      const trimmed = chunk.trim();
      const lines = trimmed.split("\n").filter(Boolean);
      return {
        chapterNumber: i + 1,
        title: lines[0]?.slice(0, 80) || `Chapter ${i + 1}`,
        content: trimmed,
        pages: splitChapterIntoPages(trimmed)
      };
    })
    .filter(c => c.content.length > 200);

  // No chapter headings found (short story, single-chapter book, etc.)
  // Treat the whole text as one chapter but try to find a real title
  // from the first non-garbage line
  if (chapters.length <= 1) {
    const lines = text.split("\n").filter(l => l.trim().length > 0);
    const title = lines.find(l => {
      const words = l.trim().split(/\s+/);
      return words.length >= 2 && words.length <= 12;
    }) || "Full Content";

    return [{
      chapterNumber: 1,
      title: title.trim().slice(0, 80),
      content: text,
      pages: splitChapterIntoPages(text)
    }];
  }

  return chapters;
}

export function splitChapterIntoPages(text, wordsPerPage = 300) {
  const words = text.split(/\s+/).filter(Boolean);
  const pages = [];

  for (let i = 0; i < words.length; i += wordsPerPage) {
    pages.push({
      pageNumber: pages.length + 1,
      text: words.slice(i, i + wordsPerPage).join(" ")
    });
  }

  return pages;
}

// Checks if extracted text is substantial enough to be real content
export function isTextExtractionUsable(text) {
  return text && text.trim().length > 500;
}

export async function embedText(genAI, text) {
  const embeddingModel = genAI.getGenerativeModel({ model: "gemini-embedding-001" });

  const result = await embeddingModel.embedContent(text);
  return result.embedding.values;
}


export function detectIntent(message) {
  const msg = message.toLowerCase();

  if (msg.includes("who is") || msg.includes("tell me about"))
    return "character";

  if (msg.includes("what happened") || msg.includes("remind me"))
    return "recap";

  if (msg.includes("why") || msg.includes("meaning") || msg.includes("theme"))
    return "theme";

  return "general";
}

// Download the Cloudinary PDF to a temp file, upload to Gemini, analyze it
export const analyzePdfWithGemini = async (model, fileUrl) => {
  // 1. Download PDF from Cloudinary to temp file
  const tempPath = path.join(os.tmpdir(), `book_${Date.now()}.pdf`);
  const response = await axios.get(fileUrl, { responseType: "arraybuffer" });
  fs.writeFileSync(tempPath, response.data);

  // 2. Upload to Gemini File API
  const fileManager = new GoogleAIFileManager(process.env.GEMINI_API_KEY);
  const uploadResult = await fileManager.uploadFile(tempPath, {
    mimeType: "application/pdf",
    displayName: "book.pdf",
  });
  console.log("📎 Gemini file URI:", uploadResult.file.uri);

  // 3. Wait for Gemini to finish processing
  let file = await fileManager.getFile(uploadResult.file.name);
  while (file.state === "PROCESSING") {
    console.log("⏳ Waiting for Gemini to process file...");
    await new Promise(r => setTimeout(r, 2000));
    file = await fileManager.getFile(uploadResult.file.name);
  }

  if (file.state === "FAILED") {
    fs.unlinkSync(tempPath);
    throw new Error("Gemini failed to process the PDF file");
  }

  // 4. Send to Gemini with a prompt matching the old functions' return shapes
  const prompt = `
    You are a literary analysis AI. Analyze this book/document thoroughly.
    This may be a scanned PDF — use your vision capability to read all text.

    Return ONLY valid raw JSON with NO markdown, NO backticks, NO extra text.

    The JSON must follow this EXACT structure:

    {
      "info": {
        "title": "Book title from the document",
        "author": "Author name from the document",
        "publishedYear": null,
        "language": "Language of the document",
        "totalPages": 0
      },
      "overview": {
        "summary": "Overall plot/content summary of the entire book",
        "majorThemes": ["theme1", "theme2"],
        "tone": "Overall emotional tone of the book",
        "mainCharacters": [
          {
            "name": "Character Name",
            "description": "Who they are",
            "relationships": "Connections to other characters"
          }
        ]
      },
      "chapters": [
        {
          "chapterNumber": 1,
          "title": "Chapter title or Chapter 1 if none",
          "summary": "Concise summary of this chapter",
          "themes": ["theme1", "theme2"],
          "tone": "Emotional tone of this chapter",
          "characters": [
            {
              "name": "Character Name",
              "role": "Protagonist/Antagonist/Supporting",
              "description": "Short description of their role in this chapter"
            }
          ]
        }
      ]
    }

    Rules:
    - If the document has no clear chapters, split it into logical sections and treat each as a chapter
    - publishedYear should be a number or null
    - totalPages should be a number
    - Every chapter must have all fields filled
    - mainCharacters.relationships should describe how they connect to other characters
  `;

  const result = await model.generateContent([
    {
      fileData: {
        fileUri: uploadResult.file.uri,
        mimeType: "application/pdf",
      },
    },
    { text: prompt }
  ]);

  // 5. Clean up temp file
  fs.unlinkSync(tempPath);

  // 6. Parse and return 
  const raw = result.response.text().trim();
  const cleaned = raw.replace(/```json|```/g, "").trim();

  let parsed;
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    console.log("⚠️ Gemini PDF JSON parse failed, using fallback");
    return {
      info: {
        title: "Unknown Title",
        author: "Unknown Author",
        publishedYear: null,
        language: "Unknown",
        totalPages: 0
      },
      overview: {
        summary: "",
        majorThemes: [],
        tone: "",
        mainCharacters: []
      },
      chapters: []
    };
  }

  return {
    // Matches extractPdfInfo() return shape
    info: {
      title: parsed.info?.title || "Unknown Title",
      author: parsed.info?.author || "Unknown Author",
      publishedYear: parsed.info?.publishedYear || null,
      language: parsed.info?.language || "Unknown",
      totalPages: parsed.info?.totalPages || 0
    },
    // Matches analyzeBookOverview() return shape
    overview: {
      summary: parsed.overview?.summary || "",
      majorThemes: parsed.overview?.majorThemes || [],
      tone: parsed.overview?.tone || "",
      mainCharacters: (parsed.overview?.mainCharacters || []).map(c => ({
        name: c.name || "",
        description: c.description || "",
        relationships: c.relationships || ""
      }))
    },
    // Matches analyzeChapterWithAI() return shape per chapter
    chapters: (parsed.chapters || []).map((ch, i) => ({
      chapterNumber: ch.chapterNumber || i + 1,
      title: ch.title || `Chapter ${i + 1}`,
      summary: ch.summary || "",
      themes: ch.themes || [],
      tone: ch.tone || "",
      characters: (ch.characters || []).map(c => ({
        name: c.name || "",
        role: c.role || "",
        description: c.description || ""
      }))
    })) 
  };
};

export async function searchBookContent(genAI, bookId, query) {
  // 1. Embed the search query
  const queryEmbedding = await embedText(genAI, query);

  // 2. Fetch the book's knowledge
  const knowledge = await bookKnowledgeModel.findOne({ bookId });
  if (!knowledge) throw new Error("No content found for this book");

  // 3. Cosine similarity function
  const cosineSimilarity = (a, b) => {
    if (!a?.length || !b?.length || a.length !== b.length) return 0;
    const dot = a.reduce((sum, val, i) => sum + val * b[i], 0);
    const magA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
    const magB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
    if (magA === 0 || magB === 0) return 0;
    return dot / (magA * magB);
  };

  // 4. Score each chapter
  const chapterResults = knowledge.chapters
    .filter(ch => ch.embedding?.length > 0)
    .map(ch => ({
      chapterNumber: ch.chapterNumber,
      title: ch.title,
      summary: ch.summary,
      content: ch.content,
      score: cosineSimilarity(queryEmbedding, ch.embedding)
    }));

  // 5. Score each character
  const characterResults = knowledge.characters
    .filter(char => char.embedding?.length > 0)
    .map(char => ({
      name: char.name,
      description: char.description,
      relationships: char.relationships,
      score: cosineSimilarity(queryEmbedding, char.embedding)
    }));

  // 6. Sort by score and return top results
  return {
    chapters: chapterResults.sort((a, b) => b.score - a.score).slice(0, 3),
    characters: characterResults.sort((a, b) => b.score - a.score).slice(0, 2)
  };
}

export async function analyzeExtractedTextWithGemini(model, fullText, chaptersWithContent) {

  const totalWords = fullText.split(/\s+/).length;
  const totalPages = chaptersWithContent.reduce((sum, ch) => sum + ch.pages.length, 0);

  // ─────────────────────────────────────────────────────────────────
  // KEY INSIGHT:
  //   pdf-parse + splitIntoChapters() has ALREADY divided the book into
  //   chapters with real content. We trust that structure completely.
  //
  //   Gemini's ONLY job here is literary analysis:
  //     - Book metadata (title, author, etc.)
  //     - Overview (summary, themes, tone, characters)
  //     - Per-chapter analysis (summary, themes, tone, characters, significance)
  //
  //   We send Gemini a CONDENSED SAMPLE per chapter (not the full text) so
  //   it has enough to analyse — but we never ask it to return content back.
  //   Content comes directly from chaptersWithContent.
  // ─────────────────────────────────────────────────────────────────

  const condensed = buildCondensedSample(chaptersWithContent);

  const prompt = `
You are an expert literary analyst.

You have been given a condensed sample of a book, divided into chapters.
Each chapter sample contains its opening and closing text — enough for you to 
perform deep literary analysis.

Your job:
1. Identify the book's metadata (title, author, language, etc.) from the text.
2. Write an overall book summary, themes, tone, setting, and main characters.
3. For each chapter, write a detailed literary analysis.

Return ONLY valid raw JSON. No markdown. No backticks. No explanation outside the JSON.

JSON structure:

{
  "info": {
    "title": "Exact title as found in the text",
    "author": "Author's full name",
    "publishedYear": null,
    "language": "Language the book is written in",
    "totalPages": ${totalPages},
    "totalWords": ${totalWords},
    "structureType": "e.g. 'Novel with numbered chapters'"
  },
  "overview": {
    "summary": "Rich, detailed summary of the entire book",
    "majorThemes": ["theme1", "theme2"],
    "tone": "Overall emotional and stylistic tone",
    "setting": "Where and when the story takes place",
    "mainCharacters": [
      {
        "name": "Character full name",
        "description": "Who they are, personality, role in the story",
        "relationships": "How they connect to other characters"
      }
    ]
  },
  "chapters": [
    {
      "chapterNumber": 1,
      "title": "Chapter title as it appears, or a descriptive title",
      "summary": "Detailed summary of everything that happens in this chapter",
      "themes": ["theme specific to this chapter"],
      "tone": "Emotional and stylistic tone of this chapter",
      "setting": "Where and when this chapter takes place",
      "characters": [
        {
          "name": "Character name",
          "role": "Protagonist/Antagonist/Supporting/Mentioned",
          "description": "What this character does or experiences in THIS chapter"
        }
      ],
      "narrativeSignificance": "Why this chapter matters to the overall story",
      "startMarker": "A unique text snippet from the start of the chapter",
      "endMarker": "A unique text snippet from the end of the chapter"
    }
  ]
}

RULES:
- The chapters array MUST have exactly ${chaptersWithContent.length} entries, 
  one per chapter in the sample below, in the same order.
- Do NOT include a "content" field — content is handled separately.
- All analysis must be grounded in the sample text provided.
- publishedYear must be a number if determinable, otherwise null.
- Return ONLY the raw JSON object. No markdown. No backticks. No extra text.

CONDENSED BOOK SAMPLE (${chaptersWithContent.length} chapters):
============================================================
${condensed}
============================================================
`;

  const result = await model.generateContent(prompt);
  const raw = result.response.text().trim();
  const cleaned = raw.replace(/```json|```/g, "").trim();

  let parsed;
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    console.warn("⚠️ Gemini analysis JSON parse failed — using content-only fallback");
    return buildFallback(chaptersWithContent, totalPages, totalWords);
  }

  // ─────────────────────────────────────────────────────────────────
  // Merge: Gemini's analysis + pdf-parse's real content/pages
  // pdf-parse is the source of truth for content, wordCount, and pages.
  // Gemini is the source of truth for summary, themes, tone, characters, etc.
  //
  // Matching priority (guards against Gemini returning wrong chapter count/order):
  //   1. chapterNumber match
  //   2. title similarity (lowercase includes)
  //   3. index fallback
  // ─────────────────────────────────────────────────────────────────

  const aiChapters = parsed.chapters || [];

  const mergedChapters = chaptersWithContent.map((pdfChapter, i) => {
    const aiChapter =
      aiChapters.find(c => c.chapterNumber === pdfChapter.chapterNumber) || // 1. exact number
      aiChapters.find(c => c.title && pdfChapter.title &&
        c.title.toLowerCase().includes(pdfChapter.title.toLowerCase().slice(0, 15))) || // 2. title
      aiChapters[i] || // 3. index fallback
      {};
    return {
      chapterNumber: pdfChapter.chapterNumber ?? i + 1,
      title: aiChapter.title || pdfChapter.title || `Chapter ${i + 1}`,
      content: pdfChapter.content,                          // ✅ always from pdf-parse
      pages: pdfChapter.pages?.length
        ? pdfChapter.pages
        : splitChapterIntoPages(pdfChapter.content),        // ✅ always from pdf-parse
      wordCount: pdfChapter.content?.split(/\s+/).filter(Boolean).length || 0,
      summary: aiChapter.summary || "",                     // ✅ from Gemini
      themes: aiChapter.themes || [],                       // ✅ from Gemini
      tone: aiChapter.tone || "",                           // ✅ from Gemini
      setting: aiChapter.setting || "",                     // ✅ from Gemini
      characters: (aiChapter.characters || []).map(c => ({  // ✅ from Gemini
        name: c.name || "",
        role: c.role || "",
        description: c.description || ""
      })),
      narrativeSignificance: aiChapter.narrativeSignificance || "", // ✅ from Gemini
      startMarker: aiChapter.startMarker || "",
      endMarker: aiChapter.endMarker || ""
    };
  });

  return {
    info: {
      title: parsed.info?.title || "Unknown Title",
      author: parsed.info?.author || "Unknown Author",
      publishedYear: parsed.info?.publishedYear || null,
      language: parsed.info?.language || "Unknown",
      totalPages: parsed.info?.totalPages || totalPages,
      totalWords: parsed.info?.totalWords || totalWords,
      structureType: parsed.info?.structureType || "Unknown"
    },
    overview: {
      summary: parsed.overview?.summary || "",
      majorThemes: parsed.overview?.majorThemes || [],
      tone: parsed.overview?.tone || "",
      setting: parsed.overview?.setting || "",
      mainCharacters: (parsed.overview?.mainCharacters || []).map(c => ({
        name: c.name || "",
        description: c.description || "",
        relationships: c.relationships || ""
      }))
    },
    chapters: mergedChapters
  };
}


// ─────────────────────────────────────────────────────────────────
// HELPER: Build a condensed per-chapter sample for Gemini.
//
// For each chapter we send:
//   - The chapter heading/title
//   - First 300 words  (enough to establish setting, characters, tone)
//   - Last 150 words   (enough to understand how the chapter resolves)
//
// This gives Gemini real literary context without sending the full text.
// A 30-chapter book with 300+150 words per chapter = ~13,500 words to Gemini,
// vs potentially 100,000+ words if we sent everything.
// ─────────────────────────────────────────────────────────────────
function buildCondensedSample(chaptersWithContent) {
  const HEAD_WORDS = 300;
  const TAIL_WORDS = 150;

  return chaptersWithContent.map((ch, i) => {
    const words = (ch.content || "").split(/\s+/).filter(Boolean);
    const head = words.slice(0, HEAD_WORDS).join(" ");

    let tail = "";
    if (words.length > HEAD_WORDS + TAIL_WORDS) {
      tail = "\n[...]\n" + words.slice(-TAIL_WORDS).join(" ");
    }

    const label = ch.title
      ? `CHAPTER ${i + 1}: ${ch.title}`
      : `CHAPTER ${i + 1}`;

    return `--- ${label} ---\n${head}${tail}`;
  }).join("\n\n");
}


// ─────────────────────────────────────────────────────────────────
// HELPER: Full fallback when Gemini parse fails entirely.
// Returns the pdf-parse structure with empty analysis fields.
// ─────────────────────────────────────────────────────────────────
function buildFallback(chaptersWithContent, totalPages, totalWords) {
  return {
    info: {
      title: "Unknown Title",
      author: "Unknown Author",
      publishedYear: null,
      language: "Unknown",
      totalPages,
      totalWords,
      structureType: "Unknown"
    },
    overview: {
      summary: "",
      majorThemes: [],
      tone: "",
      setting: "",
      mainCharacters: []
    },
    chapters: chaptersWithContent.map((ch) => ({
      chapterNumber: ch.chapterNumber,
      title: ch.title || "",
      content: ch.content,
      pages: ch.pages?.length ? ch.pages : splitChapterIntoPages(ch.content),
      wordCount: ch.content?.split(/\s+/).filter(Boolean).length || 0,
      summary: "",
      themes: [],
      tone: "",
      setting: "",
      characters: [],
      narrativeSignificance: "",
      startMarker: "",
      endMarker: ""
    }))
  };
}