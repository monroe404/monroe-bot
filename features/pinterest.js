const { EmbedBuilder } = require("discord.js");
const { HUMAN_ROLE_ID } = require("../config");

// =========================
// PINTEREST SEARCH
// Command: !pin <query>
// =========================

async function searchPinterest(query) {
  const options = {
    query: query,
    scope: "pins",
    bookmarks: []
  };

  const context = {};

  const sourceUrl =
    `/search/pins/?q=${encodeURIComponent(query)}`;

  const data = encodeURIComponent(
    JSON.stringify({
      options,
      context
    })
  );

  const url =
    `https://www.pinterest.com/resource/BaseSearchResource/get/` +
    `?source_url=${encodeURIComponent(sourceUrl)}` +
    `&data=${data}` +
    `&_=${Date.now()}`;

  const response = await fetch(url, {
    method: "GET",

    headers: {
      "Accept": "application/json, text/javascript, */*, q=0.01",
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/140 Safari/537.36",
      "X-Requested-With": "XMLHttpRequest",
      "x-pinterest-pws-handler": "www/search/pins.js"
    }
  });

  if (!response.ok) {
    const text = await response.text();

    throw new Error(
      `Pinterest HTTP ${response.status}: ${text.slice(0, 300)}`
    );
  }

  const json = await response.json();

  const results =
    json?.resource_response?.data?.results ||
    json?.resource_response?.data?.data?.results ||
    [];

  return results
    .map((pin) => {
      const images = pin?.images || {};

      const image =
        images?.orig?.url ||
        images?.["1200x"]?.url ||
        images?.["736x"]?.url ||
        images?.["564x"]?.url ||
        images?.["474x"]?.url ||
        images?.["236x"]?.url;

      return {
        id: pin?.id,
        title:
          pin?.title ||
          pin?.grid_title ||
          pin?.description ||
          "Pinterest",

        image,

        link:
          pin?.link ||
          (pin?.id
            ? `https://www.pinterest.com/pin/${pin.id}/`
            : "https://www.pinterest.com/")
      };
    })
    .filter((pin) => pin.image)
    .slice(0, 5);
}

// =========================
// MESSAGE HANDLER
// =========================

async function handlePinterest(message) {
  if (message.author.bot) return;

  if (
  !message.member?.roles.cache.has(HUMAN_ROLE_ID)
) {
  return message.reply(
    "❌ Kamu harus memiliki role **Human** untuk menggunakan fitur ini."
  );
}

  const content = message.content.trim();

  if (!content.toLowerCase().startsWith("!pin")) {
    return;
  }

  const query = content.slice(4).trim();

  if (!query) {
    return message.reply(
      "❌ Gunakan: `!pin <kata pencarian>`\n\nContoh:\n`!pin Kucing pake Topi Ferrari F1`"
    );
  }

  const loading = await message.reply(
    `🔎 **Mencari Pinterest...**\n> ${query}`
  );

  try {
    const results = await searchPinterest(query);

    if (!results.length) {
      return loading.edit(
        `❌ Tidak menemukan hasil Pinterest untuk **${query}**.`
      );
    }

    await loading.edit(
      `📌 **${results.length} hasil ditemukan** untuk **${query}**.\nMengirim gambar...`
    );

    for (const pin of results) {
      const embed = new EmbedBuilder()
        .setColor(0xF97316)
        .setImage(pin.image)
        .setURL(pin.link)
        .setFooter({
          text: "MONROE COMMUNITY © 2026"
        });

      if (pin.title) {
        embed.setTitle(
          pin.title.substring(0, 256)
        );
      }

      await message.channel.send({
        embeds: [embed]
      });
    }

    await loading.edit(
      `✅ Selesai! **${results.length} gambar** ditemukan untuk **${query}**.`
    );

  } catch (error) {
    console.error(
      "❌ Pinterest Search Error:",
      error
    );

    await loading.edit(
      "❌ Gagal mengambil hasil Pinterest. Coba lagi beberapa saat."
    );
  }
}

module.exports = {
  handlePinterest
};
