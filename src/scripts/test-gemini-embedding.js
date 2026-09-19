
const dotenv = require("dotenv");
const { GoogleGenerativeAI } = require("@google/generative-ai");

dotenv.config({ override: true });

const genAI = new GoogleGenerativeAI(
  process.env.GEMINI_API_KEY
);

async function testEmbedding() {
  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-embedding-001",
    });

    const result = await model.embedContent(
      "How do I redeem my Domino's voucher?"
    );

    const embedding = result.embedding.values;

    console.log("✅ Embedding generated successfully!");
    console.log("Vector dimensions:", embedding.length);
    console.log("First 5 values:", embedding.slice(0, 5));
  } catch (error) {
    console.error("❌ Embedding generation failed:");
    console.error(error.message);
  }
}

testEmbedding();