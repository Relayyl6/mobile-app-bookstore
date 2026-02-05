import { v2 as cloudinary } from "cloudinary";
import { getHeader } from "pdf-parse/node";
import { PDFParse } from "pdf-parse";

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

  return result.text; // Entire book text
}

export function splitIntoChapters(text) {
  const rawChapters = text.split(/chapter\s+\d+[:.\-\s]*/gi);

  return rawChapters
    .map((chunk, i) => {
      const lines = chunk.trim().split("\n").filter(Boolean);

      return {
        chapterNumber: i + 1,
        title: lines[0]?.slice(0, 80) || `Chapter ${i + 1}`,
        content: chunk.trim(),
      };
    })
    .filter(c => c.content.length > 800); // filter junk
}


export async function analyzeChapterWithAI(model, chapterText, chapterNumber) {
  const prompt = `
    You are a literary analysis AI.

    Return ONLY valid JSON in this format:

    {
      "summary": "Concise summary of this chapter",
      "themes": ["theme1", "theme2"],
      "tone": "overall emotional tone",
      "characters": [
        {
          "name": "Character Name",
          "role": "Protagonist/Antagonist/Supporting",
          "description": "Short description of their role in this chapter"
        }
      ]
    }

    CHAPTER ${chapterNumber}:
    ${chapterText.slice(0, 12000)}
  `;

  const result = await model.generateContent(prompt);
  const text = result.response.text();

  try {
    return JSON.parse(text);
  } catch {
    console.log("⚠️ Chapter AI JSON parse failed, using fallback");
    return {
      summary: "",
      themes: [],
      tone: "",
      characters: []
    };
  }
}


export async function analyzeBookOverview(model, fullText) {
  const prompt = `
    You are a book analysis AI.

    Return ONLY valid JSON:

    {
      "summary": "Overall plot summary of the book",
      "majorThemes": ["theme1", "theme2"],
      "tone": "overall emotional tone of the book",
      "mainCharacters": [
        {
          "name": "Character Name",
          "description": "Who they are",
          "relationships": "Connections to other characters"
        }
      ]
    }

    BOOK TEXT:
    ${fullText.slice(0, 20000)}
  `;

  const result = await model.generateContent(prompt);

  try {
    return JSON.parse(result.response.text());
  } catch {
    console.log("⚠️ Book overview JSON parse failed");
    return {
      summary: "",
      majorThemes: [],
      tone: "",
      mainCharacters: []
    };
  }
}


export async function embedText(genAI, text) {
  const embeddingModel = genAI.getGenerativeModel({ model: "text-embedding-004" });

  const result = await embeddingModel.embedContent(text);
  return result.embedding.values;
}


export function splitChapterIntoPages(text, wordsPerPage = 300) {
  const words = text.split(" ");
  const pages = [];

  for (let i = 0; i < words.length; i += wordsPerPage) {
    pages.push({
      pageNumber: pages.length + 1,
      text: words.slice(i, i + wordsPerPage).join(" ")
    });
  }

  return pages;
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
