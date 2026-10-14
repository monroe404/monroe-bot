const express = require("express");
const crypto = require("crypto");

const router = express.Router();

const REPORT_CHANNEL_ID =
  "1559739025135243304";

const DUTY_ROLE_ID =
  "1371905140260601948";

const FINANCE_ROLE_ID =
  "1287287382877536267";

function authenticate(req, res, next) {
  const expected = process.env.SANEWS_API_KEY;
  const received = req.headers["x-api-key"];

  if (!expected || !received) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized"
    });
  }

  const a = Buffer.from(expected);
  const b = Buffer.from(received);

  if (
    a.length !== b.length ||
    !crypto.timingSafeEqual(a, b)
  ) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized"
    });
  }

  next();
}

router.post("/report", authenticate, async (req, res) => {
  try {
    const { type, content } = req.body || {};

    if (
      !["duty", "finance"].includes(type) ||
      typeof content !== "string" ||
      content.trim().length === 0 ||
      content.length > 4000
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid report"
      });
    }

    const client = req.app.locals.discordClient;

    if (!client) {
      return res.status(503).json({
        success: false,
        message: "Discord client unavailable"
      });
    }

    const channel = await client.channels.fetch(
      REPORT_CHANNEL_ID
    );

    if (!channel || !channel.isTextBased()) {
      return res.status(503).json({
        success: false,
        message: "Report channel unavailable"
      });
    }

    const roleId =
      type === "duty"
        ? DUTY_ROLE_ID
        : FINANCE_ROLE_ID;

    await channel.send({
      content:
        `<@&${roleId}>\n${content}`,
      allowedMentions: {
        parse: [],
        roles: [roleId]
      }
    });

    return res.json({
      success: true,
      message: "Report sent"
    });
  } catch (error) {
    console.error("SA News API error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to send report"
    });
  }
});

module.exports = router;