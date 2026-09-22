const { EmbedBuilder } = require("discord.js");
const { HUMAN_ROLE_ID } = require("../config");

// =========================
// CALCULATOR
// !calc 10+5*2
// =========================

function calculate(expression) {
  if (!/^[0-9+\-*/().%\s]+$/.test(expression)) {
    throw new Error("Invalid expression");
  }

  if (
    expression.includes("**") ||
    expression.includes("//")
  ) {
    throw new Error("Invalid expression");
  }

  const result = Function(
    `"use strict"; return (${expression})`
  )();

  if (!Number.isFinite(result)) {
    throw new Error("Invalid result");
  }

  return result;
}

async function handleCalculator(message) {
  if (message.author.bot) return;

  const content = message.content.trim();

  if (!content.toLowerCase().startsWith("!calc")) {
    return;
  }

  // =========================
  // HUMAN ONLY
  // =========================

  if (
    !message.member?.roles.cache.has(HUMAN_ROLE_ID)
  ) {
    return message.reply(
      "❌ Kamu harus memiliki role **Human** untuk menggunakan fitur ini."
    );
  }

  const expression = content
    .slice(5)
    .trim();

  if (!expression) {
    return message.reply(
      "❌ Masukkan perhitungan.\n\nContoh:\n`!calc 10+5*2`"
    );
  }

  try {
    const result = calculate(expression);

    const formattedResult =
      result.toLocaleString("id-ID");

    const embed = new EmbedBuilder()
      .setColor(0xF97316)
      .setTitle("🧮 Calculator")
      .addFields(
        {
          name: "Expression",
          value: `\`${expression}\``
        },
        {
          name: "Result",
          value: `**${formattedResult}**`
        }
      )
      .setFooter({
        text: "MONROE COMMUNITY © 2026"
      });

    await message.reply({
      embeds: [embed]
    });

  } catch (error) {
    return message.reply(
      "❌ Perhitungan tidak valid."
    );
  }
}

module.exports = {
  handleCalculator
};