const dotenv = require("dotenv");
const { MossClient } = require("@moss-dev/moss");

dotenv.config();

const client = new MossClient(
  process.env.MOSS_PROJECT_ID,
  process.env.MOSS_PROJECT_KEY
);

async function checkIndex() {
  try {
    console.log("Checking Moss index...\n");

    const index = await client.getIndex("hubble-gift-cards");

    console.log("Index information:");
    console.dir(index, { depth: null });

  } catch (error) {
    console.error("Failed to get Moss index:");
    console.error(error);
  }
}

checkIndex();