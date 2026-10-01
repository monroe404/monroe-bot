const {
  EmbedBuilder
} = require("discord.js");

// ========================================
// MARKET CACHE
// ========================================

const marketCache = new Map();

// ========================================
// REEFAPI REQUEST
// ========================================

async function reefRequest(endpoint, body) {
  const apiKey = process.env.REEF_API_KEY;

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
// SEARCH PRODUCTS
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
// CLEAN TEXT
// ========================================

function cleanText(value) {
  if (
    value === null ||
    value === undefined
  ) {
    return null;
  }

  let text = String(value);

  text = text.replace(
    /<[^>]*>/g,
    " "
  );

  text = text.replace(
    /\s+/g,
    " "
  );

  text = text.trim();

  return text || null;
}

// ========================================
// CATEGORY
// ========================================

function getCategory(detail) {
  const categories =
    detail?.category_breadcrumb;

  if (
    Array.isArray(categories) &&
    categories.length
  ) {
    const names = categories
      .map(item =>
        cleanText(item?.name)
      )
      .filter(Boolean);

    if (names.length) {
      return names.join(" › ");
    }
  }

  if (Array.isArray(detail?.category)) {
    const names = detail.category
      .map(item =>
        cleanText(
          item?.name || item
        )
      )
      .filter(Boolean);

    if (names.length) {
      return names.join(" › ");
    }
  }

  return null;
}

// ========================================
// CONDITION
// ========================================

function getCondition(detail) {
  const condition =
    cleanText(detail?.condition);

  if (!condition) {
    return null;
  }

  if (
    condition.toUpperCase() === "NEW"
  ) {
    return "Baru";
  }

  if (
    condition.toUpperCase() === "USED"
  ) {
    return "Bekas";
  }

  return condition;
}

// ========================================
// STOCK
// ========================================

function getStock(detail) {
  if (
    detail?.stock === null ||
    detail?.stock === undefined
  ) {
    return null;
  }

  return String(detail.stock);
}

// ========================================
// SPECIFICATIONS
// ========================================

function getSpecifications(detail) {
  const possibleSpecs = [
    detail?.specifications,
    detail?.specs,
    detail?.attributes,
    detail?.product?.specifications,
    detail?.product?.specs,
    detail?.product?.attributes
  ];

  let specs = null;

  for (
    const value of possibleSpecs
  ) {
    if (
      Array.isArray(value) &&
      value.length
    ) {
      specs = value;
      break;
    }

    if (
      value &&
      typeof value === "object"
    ) {
      specs = Object.entries(value);
      break;
    }
  }

  if (!specs) {
    return [];
  }

  const result = [];

  for (
    const item of specs
  ) {
    let name;
    let value;

    if (Array.isArray(item)) {
      name = item[0];
      value = item[1];
    } else {
      name =
        item?.name ||
        item?.key ||
        item?.label;

      value =
        item?.value ||
        item?.values ||
        item?.text;
    }

    name = cleanText(name);

    value = cleanText(
      Array.isArray(value)
        ? value.join(", ")
        : value
    );

    if (
      name &&
      value
    ) {
      result.push({
        name,
        value
      });
    }
  }

  return result.slice(0, 5);
}

// ========================================
// CREATE DESCRIPTION
// ========================================

function createDescription(
  product,
  detail
) {
  const parts = [];

  const category =
    getCategory(detail);

  const condition =
    getCondition(detail);

  const stock =
    getStock(detail);

  const specs =
    getSpecifications(detail);

  if (category) {
    parts.push(
      `Kategori: **${category}**`
    );
  }

  if (condition) {
    parts.push(
      `Kondisi: **${condition}**`
    );
  }

  if (stock) {
    parts.push(
      `Stok: **${stock}**`
    );
  }

  if (specs.length) {
    parts.push(
      "**Spesifikasi:**"
    );

    for (
      const spec of specs
    ) {
      parts.push(
        `• ${spec.name}: ${spec.value}`
      );
    }
  }

  if (!parts.length) {
    return (
      `Produk **${product?.name || "ini"}** ` +
      `tersedia di Tokopedia.`
    );
  }

  return parts.join("\n");
}

// ========================================
// GET NEXT PRODUCT
// ========================================

async function getNextProduct(query) {
  const key =
    query.toLowerCase();

  let cache =
    marketCache.get(key);

  // Kalau belum ada cache, search dulu
  if (!cache) {
    const products =
      await searchProducts(query);

    if (!products.length) {
      return null;
    }

    cache = {
      products,
      index: 0
    };

    marketCache.set(
      key,
      cache
    );
  }

  // Kalau sudah sampai akhir,
  // search ulang untuk mendapatkan
  // urutan hasil terbaru
  if (
    cache.index >=
    cache.products.length
  ) {
    const products =
      await searchProducts(query);

    if (products.length) {
      cache.products = products;
      cache.index = 0;
    } else {
      cache.index = 0;
    }
  }

  const product =
    cache.products[
      cache.index
    ];

  cache.index++;

  return product;
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

    // ========================================
    // AMBIL PRODUK BERIKUTNYA
    // ========================================

    const product =
      await getNextProduct(query);

    if (!product) {
      await message.reply(
        `❌ Produk **${query}** tidak ditemukan.`
      );

      return true;
    }

    // ========================================
    // DETAIL
    // ========================================

    let detail = null;

    try {
      detail =
        await getProductDetail(
          product.url
        );
    } catch (error) {
      console.error(
        "⚠️ DETAIL ERROR:",
        error.message
      );
    }

    // ========================================
    // DATA
    // ========================================

    const description =
      createDescription(
        product,
        detail
      );

    const shopName =
      product?.shop?.name ||
      "Tokopedia";

    const shopCity =
      product?.shop?.city;

    const shopText =
      shopCity
        ? `${shopName} • ${shopCity}`
        : shopName;

    const rating =
      product?.rating ||
      "Belum ada";

    const sold =
      product?.sold ||
      "Belum tersedia";

    // ========================================
    // EMBED
    // ========================================

    const embed =
      new EmbedBuilder()
        .setColor(0xff7a00)

        .setTitle(
          `📦 ${product.name || "Produk"}`
        )

        .setURL(
          product.url
        )

        .setDescription(
          `📝 **Informasi Produk**\n` +
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

    if (
      product.image_url
    ) {
      embed.setImage(
        product.image_url
      );
    }

    // ========================================
    // SEND
    // ========================================

    await message.reply({
      content:
        `🛒 **MONROE MARKET**\n` +
        `🔎 Pencarian: **${query}**`,

      embeds: [
        embed
      ]
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