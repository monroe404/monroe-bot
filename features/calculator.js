const {
  EmbedBuilder
} = require("discord.js");

// =========================
// CALCULATOR
// Command: !calc
// =========================

function calculate(expression) {
  // Hanya izinkan angka dan operator matematika
  if (!/^[0-9+\-*/().%\s]+$/.test(expression)) {
    throw new Error("Invalid expression");
  }

  // Tolak pola berbahaya
  if (
    expression.includes("**") ||
    expression.includes("//")
  ) {
    throw new Error("Invalid expression");
  }

  const result = Function(
    `"use strict"; return (${expression})`
  )();

  if (
    typeof result !== "number" ||
    !Number.isFinite(result)
  ) {
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

  const expression = content
    .slice(5)
    .trim();

  if (!expression) {
    return message.reply(
      "❌ Contoh: `!calc 100000 + 25000`"
    );
  }

  try {
    const result = calculate(expression);

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
          value: `**${result.toLocaleString("id-ID")}**`
        }
      )
      .setFooter({
        text: "MONROE COMMUNITY © 2026"
      });

    await message.reply({
      embeds: [embed]
    });

  } catch (error) {
    await message.reply(
      "❌ Perhitungan tidak valid.\n\nContoh: `!calc (100 + 50) * 2`"
    );
  }
}

module.exports = {
  handleCalculator
};