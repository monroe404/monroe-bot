const {
  EmbedBuilder
} = require("discord.js");

// ========================================
// REEFAPI REQUEST
// ========================================

async function reefRequest(endpoint, body) {

  const apiKey =
    process.env.REEF_API_KEY;

  if (!apiKey) {
    throw new Error(
      "REEF_API_KEY belum dipasang di Railway."
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

  const data =
    await response.json();

  if (!response.ok || !data.ok) {

    throw new Error(
      data?.error?.message ||
      `ReefAPI Error ${response.status}`
    );
  }

  return data.data;
}

// ========================================
// SEARCH PRODUCTS
// ========================================

async function searchProducts(query) {

  const data =
    await reefRequest(
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

  const data =
    await reefRequest(
      "detail",
      {
        url
      }
    );

  return data;
}

// ========================================
// CLEAN DESCRIPTION
// ========================================

function cleanDescription(value) {

  if (!value) {
    return null;
  }

  let text =
    String(value);

  // Hapus HTML
  text =
    text.replace(
      /<[^>]*>/g,
      " "
    );

  // Hapus whitespace berlebihan
  text =
    text.replace(
      /\s+/g,
      " "
    );

  text =
    text.trim();

  if (!text) {
    return null;
  }

  // Biar embed tidak terlalu panjang
  if (text.length > 600) {
    text =
      text.slice(0, 597) +
      "...";
  }

  return text;
}

// ========================================
// AMBIL DESKRIPSI DARI DETAIL
// ========================================

function getDescription(detail) {

  const possibleDescriptions = [

    detail?.description,

    detail?.product?.description,

    detail?.data?.description,

    detail?.product?.detail?.description,

    detail?.product_detail?.description,

    detail?.content?.description

  ];

  for (
    const value of possibleDescriptions
  ) {

    const cleaned =
      cleanDescription(value);

    if (cleaned) {
      return cleaned;
    }
  }

  return "Deskripsi produk tidak tersedia.";
}

// ========================================
// HANDLE !MARKET
// ========================================

async function handleMarket(message) {

  if (message.author.bot) {
    return false;
  }

  const content =
    message.content.trim();

  if (
    !content
      .toLowerCase()
      .startsWith("!market")
  ) {
    return false;
  }

  const query =
    content
      .slice(7)
      .trim();

  // ======================================
  // NO QUERY
  // ======================================

  if (!query) {

    await message.reply(
      "❌ Gunakan:\n\n" +
      "`!market <nama produk>`\n\n" +
      "Contoh:\n" +
      "`!market laptop axioo`"
    );

    return true;
  }

  try {

    await message.channel.sendTyping();

    // ====================================
    // SEARCH
    // ====================================

    const products =
      await searchProducts(query);

    if (!products.length) {

      await message.reply(
        `❌ Produk **${query}** tidak ditemukan.`
      );

      return true;
    }

    // ====================================
    // AMBIL 3 PRODUK
    // ====================================

    const selected =
      products.slice(0, 3);

    const embeds = [];

    // ====================================
    // DETAIL SETIAP PRODUK
    // ====================================

    for (
      const product of selected
    ) {

      let detail = null;

      try {

        detail =
          await getProductDetail(
            product.url
          );

      } catch (error) {

        console.error(
          `⚠️ DETAIL ERROR:`,
          error.message
        );

      }

      // ==================================
      // DESCRIPTION
      // ==================================

      const description =
        getDescription(detail);

      // ==================================
      // SHOP
      // ==================================

      const shopName =
        product?.shop?.name ||
        "Tokopedia";

      const shopCity =
        product?.shop?.city;

      const shopText =
        shopCity
          ? `${shopName} • ${shopCity}`
          : shopName;

      // ==================================
      // RATING
      // ==================================

      const rating =
        product?.rating ||
        "Belum ada";

      // ==================================
      // SOLD
      // ==================================

      const sold =
        product?.sold ||
        "Belum tersedia";

      // ==================================
      // EMBED
      // ==================================

      const embed =
        new EmbedBuilder()

          .setColor(0xff7a00)

          .setTitle(
            `📦 ${product.name || "Produk"}`
          )

          .setURL(
            product.url
          )

          // FOTO BESAR
          .setImage(
            product.image_url
          )

          .setDescription(
            `📝 **Deskripsi**\n` +
            `${description}`
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
                shopText,
              inline: true
            },

            {
              name: "⭐ Rating",
              value:
                String(rating),
              inline: true
            },

            {
              name: "📦 Terjual",
              value:
                String(sold),
              inline: true
            }

          )

          .setFooter({
            text:
              "MONROE MARKET • Tokopedia"
          });

      embeds.push(embed);
    }

    // ====================================
    // SEND RESULT
    // ====================================

    await message.reply({

      content:
        `🛒 **MONROE MARKET**\n` +
        `🔎 Hasil pencarian: **${query}**`,

      embeds: embeds

    });

  } catch (error) {

    console.error(
      "❌ MARKET ERROR:",
      error
    );

    await message.reply(
      "❌ Gagal mencari produk.\n" +
      "Coba lagi beberapa saat."
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