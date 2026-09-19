
const {
  searchKnowledgeBase,
} = require("./retrieval.service");

const {
  generateResponse,
} = require("./llm.service");

/**
 * Process a customer query through the RAG pipeline.
 */
async function processCustomerQuery(query) {
  if (!query || typeof query !== "string") {
    throw new Error("A valid customer query is required");
  }

  // 1. Retrieve relevant knowledge-base documents
  const documents = await searchKnowledgeBase(query, 5);

  // 2. Generate response using retrieved context
  const response = await generateResponse(query, documents);

  return {
    query,
    response,
    retrievedDocuments: documents.map((document) => ({
      brandName: document.brandName,
      category: document.category,
      score: document.score,
    })),
  };
}

module.exports = {
  processCustomerQuery,
};