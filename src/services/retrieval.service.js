
require("dotenv").config({ override: true });

const { GoogleGenerativeAI } = require("@google/generative-ai");
const { QdrantClient } = require("@qdrant/js-client-rest");

const COLLECTION_NAME =
  process.env.QDRANT_COLLECTION || "hubble-gift-cards";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const embeddingModel = genAI.getGenerativeModel({
  model: "gemini-embedding-001",
});

const qdrant = new QdrantClient({
  url: process.env.QDRANT_URL,
  apiKey: process.env.QDRANT_API_KEY,
});

/**
 * Generate an embedding for a text query.
 */
async function generateEmbedding(text) {
  const result = await embeddingModel.embedContent(text);

  return result.embedding.values;
}

/**
 * Search the knowledge base using semantic similarity.
 */
async function searchKnowledgeBase(query, limit = 5) {
  if (!query || typeof query !== "string") {
    throw new Error("A valid search query is required");
  }

  const queryVector = await generateEmbedding(query);

  const response = await qdrant.query(COLLECTION_NAME, {
    query: queryVector,
    limit,
    with_payload: true,
  });

  const results = response.points || response;

  return results.map((result) => ({
    score: result.score,
    brandName: result.payload?.brand_name,
    category: result.payload?.category,
    text: result.payload?.text,
    sourceUrl: result.payload?.source_url,
    originalData: result.payload?.original_data,
  }));
}

module.exports = {
  generateEmbedding,
  searchKnowledgeBase,
};