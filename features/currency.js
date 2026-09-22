const { EmbedBuilder } = require("discord.js");

// =========================
// CURRENCY CONVERTER
// !convert 125 USD IDR
// !cekuang
// =========================

let cachedCurrencies = null;

// Ambil daftar mata uang
async function getCurrencies() {
  if (cachedCurrencies) {
    return cachedCurrencies;
  }

  const response = await fetch(
    "https://open.er-api.com/v6/latest/USD"
  );

  if (!response.ok) {
    throw new Error("Currency API error");
  }

  const data = await response.json();

  if (data.result !== "success") {
    throw new Error("Currency API failed");
  }

  cachedCurrencies = Object.keys(data.rates).sort();

  return cachedCurrencies;
}

// Ambil kurs
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

// =========================
// !convert
// =========================

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
      "❌ Format salah.\n\nContoh:\n`!convert 125 USD IDR`"
    );
  }

  const amount = Number(args[0]);
  const from = args[1].toUpperCase();
  const to = args[2].toUpperCase();

  if (!Number.isFinite(amount) || amount <= 0) {
    return message.reply(
      "❌ Nominal tidak valid."
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

    const result = Math.round(amount * rate);

    const formattedResult =
      result.toLocaleString("id-ID");

    const embed = new EmbedBuilder()
      .setColor(0xF97316)
      .setTitle("💱 Currency Converter")
      .setDescription(
        `**${amount.toLocaleString("id-ID")} ${from}**\n` +
        `≈ **${formattedResult} ${to}**`
      )
      .setFooter({
        text:
          "MONROE COMMUNITY © 2026 • Kurs dapat berubah"
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
      `❌ Mata uang **${from} → ${to}** tidak tersedia.`
    );
  }
}

// =========================
// !cekuang
// =========================

async function handleCheckCurrency(message) {
  if (message.author.bot) return;

  const content = message.content.trim().toLowerCase();

  if (content !== "!cekuang") {
    return;
  }

  try {
    const currencies = await getCurrencies();

    // Discord embed max field description cukup besar,
    // jadi kita bagi menjadi beberapa pesan.
    const chunks = [];

    let current = "";

    for (const currency of currencies) {
      const item = `\`${currency}\``;

      if (
        current.length + item.length + 1 > 1800
      ) {
        chunks.push(current);
        current = "";
      }

      current +=
        (current ? " • " : "") + item;
    }

    if (current) {
      chunks.push(current);
    }

    const total = currencies.length;

    await message.reply({
      embeds: [
        new EmbedBuilder()
          .setColor(0xF97316)
          .setTitle("💰 Daftar Mata Uang")
          .setDescription(
            `Tersedia **${total} mata uang**.\n\n` +
            chunks[0]
          )
          .setFooter({
            text:
              "Gunakan !convert <nominal> <FROM> <TO>"
          })
      ]
    });

    // Kirim halaman berikutnya
    for (let i = 1; i < chunks.length; i++) {
      await message.channel.send({
        embeds: [
          new EmbedBuilder()
            .setColor(0xF97316)
            .setTitle(
              `💰 Daftar Mata Uang — Halaman ${i + 1}`
            )
            .setDescription(chunks[i])
            .setFooter({
              text:
                "MONROE COMMUNITY © 2026"
            })
        ]
      });
    }

  } catch (error) {
    console.error(
      "❌ Check Currency Error:",
      error
    );

    await message.reply(
      "❌ Gagal mengambil daftar mata uang."
    );
  }
}

module.exports = {
  handleCurrency,
  handleCheckCurrency
};
