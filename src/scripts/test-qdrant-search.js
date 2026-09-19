require("dotenv").config({ override: true });

const { GoogleGenerativeAI } = require("@google/generative-ai");
const { QdrantClient } = require("@qdrant/js-client-rest");

const COLLECTION_NAME = "hubble-gift-cards";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const embeddingModel = genAI.getGenerativeModel({
  model: "gemini-embedding-001",
});

const qdrant = new QdrantClient({
  url: process.env.QDRANT_URL,
  apiKey: process.env.QDRANT_API_KEY,
});

async function generateEmbedding(text) {
  const result = await embeddingModel.embedContent(text);
  return result.embedding.values;
}

async function searchKnowledgeBase(query) {
  console.log(`\n🔍 Query: ${query}\n`);

  const queryVector = await generateEmbedding(query);

  const response = await qdrant.query(COLLECTION_NAME, {
  query: queryVector,
  limit: 5,
  with_payload: true,
});

const results = response.points || response;

  results.forEach((result, index) => {
    console.log(`${index + 1}. ${result.payload.brand_name}`);
    console.log(`   Score: ${result.score.toFixed(4)}`);
    console.log(`   Category: ${result.payload.category}`);
    console.log("");
  });
}

async function main() {
  try {
    await searchKnowledgeBase(
      "My PVR voucher is not working. How can I redeem it?"
    );

    await searchKnowledgeBase(
      "Can I get a refund for an unused gift card?"
    );

    await searchKnowledgeBase(
      "What are the terms and conditions for Amazon shopping vouchers?"
    );

    await searchKnowledgeBase(
      "Where can I use my Zomato gift voucher?"
    );

    await searchKnowledgeBase(
      "My voucher has expired. Can it be extended?"
    );
  } catch (error) {
    console.error("❌ Search failed:");
    console.error(error.message);
  }
}

main();