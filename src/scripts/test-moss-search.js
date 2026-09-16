const {
  searchKnowledgeBase
} = require("../services/retrieval.service");

async function testSearch() {
  try {
    const query = "How do I redeem my Domino's voucher?";

    console.log("\nSearching Moss...");
    console.log(`Query: ${query}\n`);

    const results = await searchKnowledgeBase(query, 3);

    console.log("Results:\n");

    results.docs.forEach((doc, index) => {
      console.log(`--- Result ${index + 1} ---`);
      console.log(`ID: ${doc.id}`);
      console.log(`Score: ${doc.score}`);
      console.log(`Text:\n${doc.text}\n`);
    });

  } catch (error) {
    console.error("Moss search failed:");
    console.error(error);
  }
}

testSearch();