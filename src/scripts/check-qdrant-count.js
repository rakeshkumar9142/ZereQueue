require("dotenv").config({ override: true });

const { QdrantClient } = require("@qdrant/js-client-rest");

const COLLECTION_NAME = "hubble-gift-cards";

const qdrant = new QdrantClient({
  url: process.env.QDRANT_URL,
  apiKey: process.env.QDRANT_API_KEY,
});

async function checkCollection() {
  try {
    const collection = await qdrant.getCollection(COLLECTION_NAME);

    console.log("📦 Collection:", COLLECTION_NAME);
    console.log("📊 Vector count:", collection.points_count);
    console.log("📐 Vector size:", collection.config.params.vectors.size);
    console.log("📏 Distance:", collection.config.params.vectors.distance);
    console.log("✅ Collection status:", collection.status);
  } catch (error) {
    console.error("❌ Verification failed:");
    console.error(error.message);
  }
}

checkCollection();