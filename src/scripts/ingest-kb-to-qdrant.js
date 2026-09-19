
require("dotenv").config({ override: true });

const fs = require("fs");
const path = require("path");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const { QdrantClient } = require("@qdrant/js-client-rest");

const COLLECTION_NAME = "hubble-gift-cards";

const KB_PATH = path.join(
  __dirname,
  "../data/hubble-gift-cards-top100.json"
);

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const embeddingModel = genAI.getGenerativeModel({
  model: "gemini-embedding-001",
});

const qdrant = new QdrantClient({
  url: process.env.QDRANT_URL,
  apiKey: process.env.QDRANT_API_KEY,
});

function stringifyValue(value) {
  if (value === null || value === undefined) {
    return "Not specified";
  }

  if (Array.isArray(value)) {
    return value.map(stringifyValue).join("\n");
  }

  if (typeof value === "object") {
    return Object.entries(value)
      .map(([key, nestedValue]) => {
        return `${key}: ${stringifyValue(nestedValue)}`;
      })
      .join("\n");
  }

  return String(value);
}

function createSearchText(brand) {
  return [
    `Brand: ${stringifyValue(brand.brand_name)}`,
    `Category: ${stringifyValue(brand.category)}`,
    `About: ${stringifyValue(brand.about)}`,
    `Discount Percentage: ${stringifyValue(
      brand.discount_percentage
    )}`,
    `Validity: ${stringifyValue(brand.validity)}`,
    `Highlights: ${stringifyValue(brand.highlights)}`,
    `Tips: ${stringifyValue(brand.tips)}`,
    `How to Redeem: ${stringifyValue(brand.how_to_redeem)}`,
    `Restrictions: ${stringifyValue(brand.restrictions)}`,
    `Terms and Conditions: ${stringifyValue(
      brand.terms_and_conditions
    )}`,
    `FAQs: ${stringifyValue(brand.faqs)}`,
    `Where to Use: ${stringifyValue(brand.where_to_use)}`,
    `Balance Check Available: ${stringifyValue(
      brand.balance_check_available
    )}`,
  ].join("\n\n");
}

async function generateEmbedding(text, retries = 5) {
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const result = await embeddingModel.embedContent(text);
      return result.embedding.values;
    } catch (error) {
      const isRateLimitError = error.message.includes("429");

      if (!isRateLimitError || attempt === retries - 1) {
        throw error;
      }

      const waitTime = 10000 * (attempt + 1);

      console.log(
        `⏳ Rate limit reached. Retrying in ${waitTime / 1000} seconds...`
      );

      await new Promise((resolve) => setTimeout(resolve, waitTime));
    }
  }
}

async function ingestKnowledgeBase() {
  try {
    const knowledgeBase = JSON.parse(
      fs.readFileSync(KB_PATH, "utf8")
    );

    if (!Array.isArray(knowledgeBase.brands)) {
      throw new Error("Invalid KB format: brands array not found");
    }

    console.log(
      `📚 Found ${knowledgeBase.brands.length} brands`
    );

    const points = [];

    for (const brand of knowledgeBase.brands) {
      console.log(
        `🔄 Processing ${brand.rank}: ${brand.brand_name}`
      );

      const text = createSearchText(brand);
      const vector = await generateEmbedding(text);

      points.push({
        id: brand.rank,
        vector,
        payload: {
          brand_key: brand.brand_key,
          brand_name: brand.brand_name,
          category: brand.category,
          source_url: brand.source_url,
          rank: brand.rank,
          text,
          original_data: brand,
        },
      });

      console.log(`✅ Embedded: ${brand.brand_name}`);

      // Small delay to reduce request bursts.
      await new Promise((resolve) => setTimeout(resolve, 3000));
    }

    await qdrant.upsert(COLLECTION_NAME, {
      wait: true,
      points,
    });

    console.log("\n🎉 KB ingestion completed successfully!");
    console.log(`📦 Total vectors uploaded: ${points.length}`);
  } catch (error) {
    console.error("\n❌ KB ingestion failed:");
    console.error(error.message);
  }
}

ingestKnowledgeBase();