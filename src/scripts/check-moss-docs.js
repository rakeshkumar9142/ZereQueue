const dotenv = require("dotenv");
const { MossClient } = require("@moss-dev/moss");

dotenv.config();

const client = new MossClient(
  process.env.MOSS_PROJECT_ID,
  process.env.MOSS_PROJECT_KEY
);

async function checkDoc() {
  try {
    const docs = await client.getDocs("hubble-gift-cards", {
      docIds: ["dominos"]
    });

    console.dir(docs, { depth: null });

  } catch (error) {
    console.error(error);
  }
}

checkDoc();