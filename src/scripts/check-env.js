require("dotenv").config({ override: true });

console.log("URL:", !!process.env.QDRANT_URL);
console.log("Key exists:", !!process.env.QDRANT_API_KEY);
console.log("Key length:", process.env.QDRANT_API_KEY?.length || 0);