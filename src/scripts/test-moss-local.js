const dotenv = require("dotenv");
const { MossClient } = require("@moss-dev/moss");

dotenv.config();

const INDEX_NAME = "hubble-gift-cards";

const mossClient = new MossClient(
  process.env.MOSS_PROJECT_ID,
  process.env.MOSS_PROJECT_KEY
);

async function testLocalSearch() {
  try {
    console.log("Loading Moss index...");

    await mossClient.loadIndex(INDEX_NAME);

    console.log("Index loaded successfully!");

    const results = await mossClient.query(
      INDEX_NAME,
      "How do I redeem my Domino's voucher?",
      {
        topK: 3
      }
    );

    console.log("Search results:");
    console.dir(results, { depth: null });

  } catch (error) {
    console.error("Local Moss search failed:");
    console.error(error);
  }
}

testLocalSearch();