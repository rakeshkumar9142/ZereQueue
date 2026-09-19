const path = require("path");
const dotenv = require("dotenv");
const { QdrantClient } = require("@qdrant/js-client-rest");

dotenv.config({ override: true, path: path.resolve(process.cwd(), ".env") });

function sanitizeEndpoint(rawUrl) {
  try {
    const parsed = new URL(rawUrl);
    const port = parsed.port ? `:${parsed.port}` : "";
    return `${parsed.protocol}//${parsed.hostname}${port}`;
  } catch {
    return "(invalid URL)";
  }
}

function normalizeQdrantUrl(rawUrl) {
  const trimmed = String(rawUrl || "").trim().replace(/\/+$/, "");
  if (!trimmed) {
    return "";
  }

  const parsed = new URL(trimmed);
  if (!(parsed.protocol === "http:" || parsed.protocol === "https:")) {
    throw new Error("QDRANT_URL must start with http:// or https://");
  }

  // Qdrant Cloud REST is on 6333. The JS client also defaults missing ports to 6333.
  // Make that explicit so the resolved endpoint matches Cloud's documented format:
  // https://<cluster-id>.<region>.<provider>.cloud.qdrant.io:6333
  if (!parsed.port && parsed.hostname.endsWith("cloud.qdrant.io")) {
    parsed.port = "6333";
  }

  return parsed.origin;
}

function httpStatusFromError(error) {
  if (typeof error.status === "number") {
    return error.status;
  }
  if (typeof error.getActualType === "function") {
    const actual = error.getActualType();
    if (actual && typeof actual.status === "number") {
      return actual.status;
    }
  }
  return null;
}

function printDiagnostics({ endpoint, apiKeyPresent, status, error }) {
  console.error("❌ Qdrant connection failed");
  console.error(`HTTP status: ${status ?? "unknown"}`);
  console.error(`Sanitized endpoint: ${sanitizeEndpoint(endpoint)}`);
  console.error(`API key present: ${apiKeyPresent ? "yes" : "no"}`);
  if (error && error.message) {
    console.error(`Error: ${error.message}`);
  }

  if (status === 403) {
    console.error("");
    console.error("HTTP 403 means the cluster is reachable, but Qdrant Cloud rejected authentication.");
    console.error("A healthy cluster and the console Endpoint without a port are expected.");
    console.error("REST still uses that host (port 6333). An empty cluster is also fine.");
    console.error("Create a Database API key on this cluster (not an account/console token):");
    console.error("  1. Open cluster ZeroQueue → API Keys (on the Cluster Detail page).");
    console.error("  2. Create a key with manage/write (or read) permissions. Copy it once.");
    console.error("  3. Put it in .env as QDRANT_API_KEY (no quotes). Do not paste it into chat.");
    console.error("  4. If IP restrictions are enabled, allow your current public IP.");
  } else if (!apiKeyPresent) {
    console.error("Set QDRANT_API_KEY in .env. Do not commit or print the key.");
  }
}

async function testConnection() {
  const rawUrl = process.env.QDRANT_URL;
  const apiKey = String(process.env.QDRANT_API_KEY || "").trim();
  const apiKeyPresent = apiKey.length > 0;

  let endpoint;
  try {
    endpoint = normalizeQdrantUrl(rawUrl);
  } catch (error) {
    printDiagnostics({
      endpoint: String(rawUrl || ""),
      apiKeyPresent,
      status: null,
      error,
    });
    process.exitCode = 1;
    return;
  }

  if (!endpoint) {
    printDiagnostics({
      endpoint: "",
      apiKeyPresent,
      status: null,
      error: new Error("QDRANT_URL is missing"),
    });
    process.exitCode = 1;
    return;
  }

  const client = new QdrantClient({
    url: endpoint,
    apiKey: apiKeyPresent ? apiKey : undefined,
    checkCompatibility: false,
  });

  try {
    const collections = await client.getCollections();
    console.log("✅ Qdrant Cloud connected successfully!");
    console.log(`Sanitized endpoint: ${sanitizeEndpoint(endpoint)}`);
    console.log(`API key present: ${apiKeyPresent ? "yes" : "no"}`);
    console.log("Collections:", collections.collections);
  } catch (error) {
    printDiagnostics({
      endpoint,
      apiKeyPresent,
      status: httpStatusFromError(error),
      error,
    });
    process.exitCode = 1;
  }
}

testConnection();
