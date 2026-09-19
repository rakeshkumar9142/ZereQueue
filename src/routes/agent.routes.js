
const express = require("express");

const {
  chat,
} = require("../controllers/agent.controller");

const router = express.Router();

router.post("/chat", chat);

module.exports = router;