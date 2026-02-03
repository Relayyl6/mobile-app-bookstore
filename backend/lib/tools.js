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

  const info = await parser.getInfo({ parsePageInfo: true });
  await parser.destroy();

  return {
    totalPages: info.total,
    title: info.info?.Title || null,
    author: info.info?.Author || null,
    creator: info.info?.Creator || null,
    producer: info.info?.Producer || null,
    creationDate: info.getDateNode().CreationDate,
    modifiedDate: info.getDateNode().ModDate,
    pages: info.pages, // width, height, labels, links
  };
}

export async function extractPdfText(url) {
  const parser = new PDFParse({ url });

  const result = await parser.getText();
  await parser.destroy();

  return result.text; // Entire book text
}

export function splitIntoChapters(text) {
  return text
    .split(/chapter\s+\d+/gi)
    .map((c, i) => ({
      chapterNumber: i + 1,
      content: c.trim(),
    }))
    .filter(c => c.content.length > 500); // remove tiny junk sections
}

export async function analyzeChapterWithAI(
  model,
  chapterText,
  chapterNumber
) {
  const prompt = `
    You are a literary analyst AI.
    
    Analyze the following chapter and return JSON:
    
    {
      "summary": "short summary",
      "characters": [
        { "name": "", "role": "", "relationships": "" }
      ],
      "themes": ["", ""],
      "tone": ""
    }
    
    CHAPTER ${chapterNumber}:
    ${chapterText.slice(0, 12000)}
  `;

  const result = await model.generateContent(prompt);
  const text = result.response.text();

  return JSON.parse(text); // Make sure to wrap in try/catch in real code
}

async function analyzeBookOverview(
  model,
  fullText
) {
  const prompt = `
    Analyze this entire book and return JSON:

    {
      "overallSummary": "",
      "mainCharacters": [
        { "name": "", "role": "", "description": "" }
      ],
      "majorThemes": [],
      "overallTone": ""
    }

    BOOK TEXT:
    ${fullText.slice(0, 20000)}
  `;

  const result = await model.generateContent(prompt);
  return JSON.parse(result.response.text());
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
