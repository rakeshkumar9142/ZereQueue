
const {
  processCustomerQuery,
} = require("../services/agent.service");

async function chat(req, res) {
  try {
    const { query } = req.body;

    if (!query || typeof query !== "string") {
      return res.status(400).json({
        success: false,
        message: "Query is required and must be a string",
      });
    }

    const result = await processCustomerQuery(query);

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("❌ Agent controller error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to process your request",
    });
  }
}

module.exports = {
  chat,
};