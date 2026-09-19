
require("dotenv").config({ override: true });

const {
  searchKnowledgeBase,
} = require("../services/retrieval.service");

const {
  generateResponse,
} = require("../services/llm.service");

async function main() {
  try {
    const query = "My Amazon voucher is not working. How can I redeem it?";

    console.log("🔍 Customer Query:");
    console.log(query);

    console.log("\n🔎 Searching Knowledge Base...");

    const documents = await searchKnowledgeBase(query, 5);

    console.log(`✅ Retrieved ${documents.length} documents`);

    documents.forEach((document, index) => {
      console.log(
        `${index + 1}. ${document.brandName} | Score: ${document.score}`
      );
    });

    console.log("\n🤖 Generating LLM Response...");

    const response = await generateResponse(query, documents);

    console.log("\n💬 Generated Response:\n");
    console.log(response);
  } catch (error) {
    console.error("\n❌ RAG test failed:");
    console.error(error.message);
  }
}

main();