const fs = require("fs");
const path = require("path");
const dotenv = require("dotenv");
const { MossClient } = require("@moss-dev/moss");

dotenv.config();

// ---------------------------------------------
// 1. Load Hubble Knowledge Base
// ---------------------------------------------

const kbPath = path.join(
  __dirname,
  "../data/hubble-gift-cards-top100.json"
);

if (!fs.existsSync(kbPath)) {
  throw new Error(`KB file not found: ${kbPath}`);
}

const kb = JSON.parse(
  fs.readFileSync(kbPath, "utf-8")
);

console.log(`Loaded ${kb.brands.length} brands from Hubble KB`);


// ---------------------------------------------
// 2. Check Moss credentials
// ---------------------------------------------

if (!process.env.MOSS_PROJECT_ID) {
  throw new Error("MOSS_PROJECT_ID is missing in .env");
}

if (!process.env.MOSS_PROJECT_KEY) {
  throw new Error("MOSS_PROJECT_KEY is missing in .env");
}


// ---------------------------------------------
// 3. Create Moss client
// ---------------------------------------------

const mossClient = new MossClient(
  process.env.MOSS_PROJECT_ID,
  process.env.MOSS_PROJECT_KEY
);


// ---------------------------------------------
// 4. Convert Hubble brands into Moss documents
// ---------------------------------------------

const documents = kb.brands.map((brand) => {

  const text = `
Brand: ${brand.brand_name}

Category:
${brand.category || "Not specified"}

About:
${brand.about || "Not specified"}

Discount:
${brand.discount_percentage ?? "Not specified"}%

Validity:
${Array.isArray(brand.validity)
    ? brand.validity.join("\n")
    : brand.validity || "Not specified"}

Highlights:
${Array.isArray(brand.highlights)
    ? brand.highlights.join("\n")
    : brand.highlights || "Not specified"}

Tips:
${Array.isArray(brand.tips)
    ? brand.tips.join("\n")
    : brand.tips || "Not specified"}

How to Redeem:
${JSON.stringify(brand.how_to_redeem || [], null, 2)}

Restrictions:
${Array.isArray(brand.restrictions)
    ? brand.restrictions.join("\n")
    : brand.restrictions || "Not specified"}

Terms and Conditions:
${Array.isArray(brand.terms_and_conditions)
    ? brand.terms_and_conditions.join("\n")
    : brand.terms_and_conditions || "Not specified"}

FAQs:
${JSON.stringify(brand.faqs || [], null, 2)}

Where to Use:
${JSON.stringify(brand.where_to_use || {}, null, 2)}

Balance Check Available:
${brand.balance_check_available ?? "Not specified"}

Source:
${brand.source_url}
`.trim();

  return {
    id: brand.brand_key || `brand-${brand.rank}`,
    text
  };
});

console.log(`Prepared ${documents.length} Moss documents`);


// ---------------------------------------------
// 5. Create Moss index
// ---------------------------------------------

async function createMossIndex() {
  const indexName =
    process.env.MOSS_INDEX_NAME || "hubble-gift-cards";

  try {

    console.log(`Creating Moss index: ${indexName}`);

    const result = await mossClient.createIndex(
      indexName,
      documents
    );

    console.log("Moss index created successfully!");
    console.log(result);

  } catch (error) {

    console.error("Failed to create Moss index:");
    console.error(error);

  } finally {

    await mossClient.close();

  }
}


// ---------------------------------------------
// 6. Run
// ---------------------------------------------

createMossIndex();