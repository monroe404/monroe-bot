const { EmbedBuilder } = require("discord.js");

// =========================
// CURRENCY DATA
// =========================

const currencyInfo = {
  USD: ["🇺🇸", "Amerika Serikat"],
  IDR: ["🇮🇩", "Indonesia"],
  JPY: ["🇯🇵", "Jepang"],
  AUD: ["🇦🇺", "Australia"],
  GBP: ["🇬🇧", "Inggris"],
  EUR: ["🇪🇺", "Zona Euro"],
  SGD: ["🇸🇬", "Singapura"],
  MYR: ["🇲🇾", "Malaysia"],
  CNY: ["🇨🇳", "Tiongkok"],
  KRW: ["🇰🇷", "Korea Selatan"],
  THB: ["🇹🇭", "Thailand"],
  PHP: ["🇵🇭", "Filipina"],
  VND: ["🇻🇳", "Vietnam"],
  INR: ["🇮🇳", "India"],
  CAD: ["🇨🇦", "Kanada"],
  NZD: ["🇳🇿", "Selandia Baru"],
  CHF: ["🇨🇭", "Swiss"],
  HKD: ["🇭🇰", "Hong Kong"],
  TWD: ["🇹🇼", "Taiwan"],
  BRL: ["🇧🇷", "Brasil"],
  MXN: ["🇲🇽", "Meksiko"],
  ZAR: ["🇿🇦", "Afrika Selatan"],
  RUB: ["🇷🇺", "Rusia"],
  TRY: ["🇹🇷", "Turki"],
  SAR: ["🇸🇦", "Arab Saudi"],
  AED: ["🇦🇪", "Uni Emirat Arab"],
  QAR: ["🇶🇦", "Qatar"],
  KWD: ["🇰🇼", "Kuwait"],
  BHD: ["🇧🇭", "Bahrain"],
  OMR: ["🇴🇲", "Oman"],
  ILS: ["🇮🇱", "Israel"],
  PLN: ["🇵🇱", "Polandia"],
  SEK: ["🇸🇪", "Swedia"],
  NOK: ["🇳🇴", "Norwegia"],
  DKK: ["🇩🇰", "Denmark"],
  CZK: ["🇨🇿", "Ceko"],
  HUF: ["🇭🇺", "Hungaria"],
  RON: ["🇷🇴", "Rumania"],
  ISK: ["🇮🇸", "Islandia"],
  ARS: ["🇦🇷", "Argentina"],
  CLP: ["🇨🇱", "Chili"],
  COP: ["🇨🇴", "Kolombia"],
  PEN: ["🇵🇪", "Peru"],
  UAH: ["🇺🇦", "Ukraina"],
  KZT: ["🇰🇿", "Kazakhstan"],
  PKR: ["🇵🇰", "Pakistan"],
  BDT: ["🇧🇩", "Bangladesh"],
  LKR: ["🇱🇰", "Sri Lanka"],
  NPR: ["🇳🇵", "Nepal"]
};

// =========================
// GET RATE
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

// =========================
// GET CURRENCIES
// =========================

async function getCurrencies() {
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

  return Object.keys(data.rates).sort();
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
      "❌ Format salah.\n\nContoh:\n`!convert 120 USD IDR`"
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
      "❌ Gunakan kode mata uang 3 huruf."
    );
  }

  try {
    const rate = await getRate(from, to);

    // Dibulatkan tanpa desimal
    const result = Math.round(amount * rate);

    const fromInfo =
      currencyInfo[from] ||
      ["💰", "Tidak diketahui"];

    const toInfo =
      currencyInfo[to] ||
      ["💰", "Tidak diketahui"];

    const fromFlag = fromInfo[0];
    const fromCountry = fromInfo[1];

    const toFlag = toInfo[0];
    const toCountry = toInfo[1];

    const embed = new EmbedBuilder()
      .setColor(0xF97316)
      .setTitle("💱 Currency Converter")
      .setDescription(
        `${fromFlag} **${from} — ${fromCountry}**\n` +
        `**${amount.toLocaleString("id-ID")} ${from}**\n\n` +
        `⬇️ **Dikonversi ke**\n\n` +
        `${toFlag} **${to} — ${toCountry}**\n` +
        `**${result.toLocaleString("id-ID")} ${to}**`
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

  const content =
    message.content.trim().toLowerCase();

  if (content !== "!cekuang") {
    return;
  }

  try {
    const currencies =
      await getCurrencies();

    const chunks = [];
    let current = "";

    for (const currency of currencies) {
      const info =
        currencyInfo[currency];

      const flag =
        info?.[0] || "💰";

      const country =
        info?.[1] || "Mata uang tersedia";

      const item =
        `${flag} **${currency}** — ${country}\n`;

      if (
        current.length + item.length > 1800
      ) {
        chunks.push(current);
        current = "";
      }

      current += item;
    }

    if (current) {
      chunks.push(current);
    }

    for (let i = 0; i < chunks.length; i++) {

      const embed =
        new EmbedBuilder()
          .setColor(0xF97316)
          .setTitle(
            i === 0
              ? "💰 Daftar Mata Uang"
              : `💰 Daftar Mata Uang — ${i + 1}`
          )
          .setDescription(
            i === 0
              ? `Tersedia **${currencies.length} kode mata uang**.\n\n${chunks[i]}`
              : chunks[i]
          )
          .setFooter({
            text:
              "Gunakan !convert <nominal> <FROM> <TO>"
          });

      if (i === 0) {
        await message.reply({
          embeds: [embed]
        });
      } else {
        await message.channel.send({
          embeds: [embed]
        });
      }
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

// =========================
// EXPORT
// =========================

module.exports = {
  handleCurrency,
  handleCheckCurrency
};