const {
  EmbedBuilder
} = require("discord.js");

// =========================
// PINTEREST SEARCH
// Command: !pin <query>
// =========================

async function searchPinterest(query) {
  const sourceUrl =
    `/search/pins/?q=${encodeURIComponent(query)}`;

  const postData = {
    options: {
      query,
      scope: "pins",
      bookmarks: []
    },
    context: {}
  };

  const body =
    `source_url=${encodeURIComponent(sourceUrl)}` +
    `&data=${encodeURIComponent(JSON.stringify(postData))}`;

  const response = await fetch(
    "https://id.pinterest.com/resource/BaseSearchResource/get/",
    {
      method: "POST",
      headers: {
        "Accept": "application/json, text/javascript, */*, q=0.01",
        "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
        "X-Requested-With": "XMLHttpRequest",
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/140 Safari/537.36"
      },
      body
    }
  );

  if (!response.ok) {
    throw new Error(
      `Pinterest HTTP ${response.status}`
    );
  }

  const data = await response.json();

  const results =
    data?.resource_response?.data?.results || [];

  return results
    .map(pin => ({
      id: pin.id,
      title: pin.title || pin.grid_title || "",
      link:
        pin.link ||
        `https://www.pinterest.com/pin/${pin.id}/`,
      image:
        pin.images?.orig?.url ||
        pin.images?.["736x"]?.url ||
        pin.images?.["564x"]?.url ||
        pin.images?.["474x"]?.url
    }))
    .filter(pin => pin.image)
    .slice(0, 5);
}

// =========================
// MESSAGE HANDLER
// =========================

async function handlePinterest(message) {
  if (message.author.bot) return;

  if (!message.content.toLowerCase().startsWith("!pin")) {
    return;
  }

  const query = message.content
    .slice(4)
    .trim();

  if (!query) {
    return message.reply(
      "❌ Contoh penggunaan: `!pin Kucing pake Topi Ferrari F1`"
    );
  }

  const loading = await message.reply(
    `🔎 Mencari **${query}** di Pinterest...`
  );

  try {
    const results = await searchPinterest(query);

    if (!results.length) {
      return loading.edit(
        `❌ Tidak menemukan hasil Pinterest untuk **${query}**.`
      );
    }

    await loading.edit(
      `📌 Menemukan **${results.length}** hasil untuk **${query}**.\n\nMengirim gambar...`
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
        embed.setTitle(pin.title.slice(0, 256));
      }

      await message.channel.send({
        embeds: [embed]
      });
    }

    await loading.edit(
      `✅ Selesai! **${results.length}** gambar ditemukan untuk **${query}**.`
    );

  } catch (error) {
    console.error("❌ Pinterest Error:", error);

    await loading.edit(
      "❌ Gagal mengambil hasil Pinterest. Coba lagi beberapa saat."
    );
  }
}

module.exports = {
  handlePinterest
};
