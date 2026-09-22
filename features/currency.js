const {
  EmbedBuilder
} = require("discord.js");

// =========================
// CURRENCY CONVERTER
// Command: !convert
// Contoh:
// !convert 100 USD IDR
// !convert 500 JPY IDR
// =========================

async function getRate(from, to) {
  const response = await fetch(
    `https://open.er-api.com/v6/latest/${from}`
  );

  if (!response.ok) {
    throw new Error("Currency API error");
  }

  const data = await response.json();

  if (data.result !== "success") {
    throw new Error("Currency API failed");
  }

  const rate = data.rates?.[to];

  if (!rate) {
    throw new Error("Currency not supported");
  }

  return rate;
}

async function handleCurrency(message) {
  if (message.author.bot) return;

  const content = message.content.trim();

  if (!content.toLowerCase().startsWith("!convert")) {
    return;
  }

  const args = content
    .slice(8)
    .trim()
    .split(/\s+/);

  if (args.length !== 3) {
    return message.reply(
      "❌ Format salah.\n\nContoh:\n`!convert 100 USD IDR`"
    );
  }

  const amount = Number(args[0]);
  const from = args[1].toUpperCase();
  const to = args[2].toUpperCase();

  if (!Number.isFinite(amount) || amount <= 0) {
    return message.reply(
      "❌ Jumlah uang tidak valid."
    );
  }

  if (
    !/^[A-Z]{3}$/.test(from) ||
    !/^[A-Z]{3}$/.test(to)
  ) {
    return message.reply(
      "❌ Gunakan kode mata uang 3 huruf.\nContoh: `USD`, `IDR`, `EUR`, `JPY`"
    );
  }

  try {
    const rate = await getRate(from, to);

    const result = amount * rate;

    const embed = new EmbedBuilder()
      .setColor(0xF97316)
      .setTitle("💱 Currency Converter")
      .addFields(
        {
          name: "From",
          value: `**${amount.toLocaleString("id-ID")} ${from}**`,
          inline: true
        },
        {
          name: "To",
          value: `**${result.toLocaleString("id-ID", {
            maximumFractionDigits: 6
          })} ${to}**`,
          inline: true
        },
        {
          name: "Exchange Rate",
          value:
            `1 ${from} = ${rate.toLocaleString("id-ID", {
              maximumFractionDigits: 8
            })} ${to}`
        }
      )
      .setFooter({
        text: "MONROE COMMUNITY © 2026 • Kurs dapat berubah"
      });

    await message.reply({
      embeds: [embed]
    });

  } catch (error) {
    console.error(
      "❌ Currency Error:",
      error
    );

    await message.reply(
      `❌ Tidak bisa mengonversi **${from} → ${to}**.\nPastikan kode mata uang tersedia.`
    );
  }
}

module.exports = {
  handleCurrency
};
