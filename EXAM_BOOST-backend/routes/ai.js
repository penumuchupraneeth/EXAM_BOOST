const express = require("express");
const router = express.Router();
const Anthropic = require("@anthropic-ai/sdk");

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
});

router.post("/", async (req, res) => {

  try {

    console.log("BODY:", req.body);

    const userMessage = req.body.message;

    if (!userMessage) {
      return res.status(400).json({
        error: "Message required"
      });
    }

    const response = await anthropic.messages.create({
      model: "claude-3-haiku-20240307",
      max_tokens: 500,
      messages: [
        {
          role: "user",
          content: userMessage
        }
      ]
    });

    console.log(response);

    const reply = response.content[0].text;

    res.json({
      reply: reply
    });

  } catch (err) {

    console.error("AI ERROR:", err);

    res.status(500).json({
      error: err.message
    });
  }
});

module.exports = router;