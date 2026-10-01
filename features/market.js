const {
  EmbedBuilder
} = require("discord.js");

// ========================================
// REEFAPI TOKOPEDIA
// ========================================

async function reefRequest(endpoint, body) {

  const apiKey =
    process.env.REEF_API_KEY;

  if (!apiKey) {
    throw new Error(
      "REEF_API_KEY belum dipasang."
    );
  }

  const response = await fetch(
    `https://api.reefapi.com/tokopedia/v1/${endpoint}`,
    {
      method: "POST",

      headers: {
        "x-api-key": apiKey,
        "content-type": "application/json"
      },

      body: JSON.stringify(body)
    }
  );

  const data = await response.json();

  if (!response.ok || !data.ok) {
    throw new Error(
      data?.error?.message ||
      `ReefAPI Error ${response.status}`
    );
  }

  return data.data;
}

// ========================================
// SEARCH PRODUCT
// ========================================

async function searchProducts(query) {

  const data = await reefRequest(
    "search",
    {
      q: query,
      page: 1
    }
  );

  return data?.products || [];
}

// ========================================
// PRODUCT DETAIL
// ========================================

async function getProductDetail(url) {

  const data = await reefRequest(
    "detail",
    {
      url
    }
  );

  return data;
}

// ========================================
// HANDLE !MARKET
// ========================================

async function handleMarket(message) {

  if (message.author.bot) {
    return false;
  }

  if (!message.content.toLowerCase().startsWith("!market")) {
    return false;
  }

  const query =
    message.content
      .slice(7)
      .trim();

  if (!query) {

    await message.reply(
      "❌ Gunakan:\n`!market <nama produk>`\n\nContoh:\n`!market laptop axioo`"
    );

    return true;
  }

  try {

    await message.channel.sendTyping();

    const products =
      await searchProducts(query);

    if (!products.length) {

      await message.reply(
        `❌ Produk **${query}** tidak ditemukan.`
      );

      return true;
    }

    // Ambil maksimal 2 produk
    const selected =
      products.slice(0, 2);

    const embeds = [];

    for (const product of selected) {

      let detail = null;

      try {
        detail =
          await getProductDetail(
            product.url
          );
      } catch (error) {
        console.error(
          "DETAIL ERROR:",
          error.message
        );
      }

      // Cari deskripsi dari beberapa kemungkinan field
      const description =
        detail?.description ||
        detail?.product?.description ||
        detail?.data?.description ||
        "Deskripsi produk tidak tersedia.";

      const shortDescription =
        String(description)
          .replace(/<[^>]*>/g, "")
          .replace(/\s+/g, " ")
          .trim()
          .slice(0, 500);

      const embed =
        new EmbedBuilder()
          .setColor(0xff7a00)
          .setTitle(
            `📦 ${product.name}`
          )
          .setDescription(
            `📝 **Deskripsi**\n${shortDescription}`
          )
          .addFields(
            {
              name: "💰 Harga",
              value:
                product.price ||
                "Tidak tersedia",
              inline: true
            },
            {
              name: "🏪 Toko",
              value:
                product.shop?.name ||
                "Tokopedia",
              inline: true
            },
            {
              name: "⭐ Rating",
              value:
                product.rating ||
                "Belum ada",
              inline: true
            }
          )
          .setURL(product.url)
          .setFooter({
            text:
              "MONROE MARKET • Tokopedia"
          });

      if (product.image_url) {
        embed.setThumbnail(
          product.image_url
        );
      }

      embeds.push(embed);
    }

    await message.reply({
      content:
        `🛒 **MONROE MARKET**\n` +
        `🔎 Hasil pencarian: **${query}**`,
      embeds
    });

  } catch (error) {

    console.error(
      "❌ MARKET ERROR:",
      error
    );

    await message.reply(
      "❌ Gagal mencari produk.\nCoba lagi beberapa saat."
    );
  }

  return true;
}

// ========================================
// EXPORT
// ========================================

module.exports = {
  handleMarket
};