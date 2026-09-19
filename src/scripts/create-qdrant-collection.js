
require("dotenv").config({ override: true });

const { QdrantClient } = require("@qdrant/js-client-rest");

const client = new QdrantClient({
  url: process.env.QDRANT_URL,
  apiKey: process.env.QDRANT_API_KEY,
});

const COLLECTION_NAME = "hubble-gift-cards";

async function createCollection() {
  try {
    const collections = await client.getCollections();

    const exists = collections.collections.some(
      (collection) => collection.name === COLLECTION_NAME
    );

    if (exists) {
      console.log(`ℹ️ Collection "${COLLECTION_NAME}" already exists.`);
      return;
    }

    await client.createCollection(COLLECTION_NAME, {
      vectors: {
        size: 3072,
        distance: "Cosine",
      },
    });

    console.log(`✅ Collection "${COLLECTION_NAME}" created successfully!`);
    console.log("Vector size: 3072");
    console.log("Distance: Cosine");
  } catch (error) {
    console.error("❌ Collection creation failed:");
    console.error(error.message);
  }
}

createCollection();