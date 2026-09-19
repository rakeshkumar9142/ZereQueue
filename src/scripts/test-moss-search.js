const { searchKnowledgeBase } = require("../services/retrieval.service");

async function testSearch() {
  try {
    const query = "How do I redeem my Domino's voucher?";
    console.log("\nSearching Moss...");
    console.log(`Query: ${query}\n`);

    const results = await searchKnowledgeBase(query, 3);
    console.log(results);
  } catch (err) {
    console.error("Moss search failed:");
    console.error(err);
  }
}

testSearch();