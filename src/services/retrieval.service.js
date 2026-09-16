const dotenv = require("dotenv");
const { MossClient } = require("@moss-dev/moss");

dotenv.config();

const INDEX_NAME = "hubble-gift-cards";

const mossClient = new MossClient(
  process.env.MOSS_PROJECT_ID,
  process.env.MOSS_PROJECT_KEY
);

async function searchKnowledgeBase(query, topK = 3) {
  const results = await mossClient.query(
    INDEX_NAME,
    query,
    {
      topK
    }
  );

  return results;
}

module.exports = {
  searchKnowledgeBase
};