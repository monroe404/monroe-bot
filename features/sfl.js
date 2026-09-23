const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle
} = require("discord.js");

const { HUMAN_ROLE_ID } = require("../config");

const SFL_REGEX =
  /^https?:\/\/(?:www\.)?sfl\.gl\/[A-Za-z0-9_-]+(?:\?.*)?$/i;

async function resolvePublicRedirect(url) {
  const controller = new AbortController();

  const timeout = setTimeout(() => {
    controller.abort();
  }, 15000);

  try {
    const response = await fetch(url, {
      method: "GET",
      redirect: "follow",
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; MonroeBot/1.0)"
      },
      signal: controller.signal
    });

    const finalUrl = response.url;

    // Redirect langsung berhasil
    if (
      finalUrl &&
      !/sfl\.gl/i.test(finalUrl)
    ) {
      return finalUrl;
    }

    // Coba baca HTML untuk redirect publik
    const html = await response.text();

    // Meta refresh
    const metaRefresh =
      html.match(
        /<meta[^>]+http-equiv=["']?refresh["']?[^>]+content=["'][^"']*url=([^"']+)["']/i
      );

    if (metaRefresh?.[1]) {
      return new URL(
        metaRefresh[1],
        url
      ).href;
    }

    // window.location / location.href
    const jsRedirect =
      html.match(
        /(?:window\.)?location(?:\.href)?\s*=\s*["']([^"']+)["']/i
      );

    if (jsRedirect?.[1]) {
      return new URL(
        jsRedirect[1],
        url
      ).href;
    }

    return null;

  } finally {
    clearTimeout(timeout);
  }
}

async function handleSFL(message) {
  if (message.author.bot) return;

  // Human only
  if (
    !message.member?.roles.cache.has(
      HUMAN_ROLE_ID
    )
  ) {
    return;
  }

  const content =
    message.content.trim();

  if (
    !content.toLowerCase().startsWith("!sfl")
  ) {
    return;
  }

  const url =
    content
      .slice(4)
      .trim();

  if (!url) {
    return message.reply(
      "❌ Masukkan link SFL.\n\nContoh:\n`!sfl https://sfl.gl/TE6JwTK9`"
    );
  }

  if (!SFL_REGEX.test(url)) {
    return message.reply(
      "❌ Link yang diberikan bukan link SFL yang valid."
    );
  }

  const start =
    Date.now();

  const processing =
    await message.reply(
      "🔎 **Memproses link SFL...**"
    );

  try {
    const destination =
      await resolvePublicRedirect(
        url
      );

    const executionTime =
      (
        (Date.now() - start) /
        1000
      ).toFixed(2);

    if (!destination) {
      return processing.edit(
        "❌ **SFL tidak memberikan redirect publik.**\n\n" +
        "Link kemungkinan membutuhkan CAPTCHA, Cloudflare, " +
        "JavaScript challenge, login, atau mekanisme anti-bot."
      );
    }

    // Jangan menganggap SFL sebagai destination
    if (
      /sfl\.gl/i.test(destination)
    ) {
      return processing.edit(
        "❌ **Destination belum dapat ditemukan.**\n\n" +
        "SFL masih berada pada halaman perantara."
      );
    }

    const embed =
      new EmbedBuilder()
        .setColor(0x22c55e)
        .setTitle(
          "Bypass Success"
        )
        .addFields(
          {
            name: "Original Link",
            value: `\`${url}\``
          },
          {
            name: "Destination Link",
            value: `\`${destination}\``
          },
          {
            name: "Execution Time",
            value: `\`${executionTime}s\``
          }
        )
        .setFooter({
          text:
            `By ${message.author.username}`
        });

    const row =
      new ActionRowBuilder()
        .addComponents(
          new ButtonBuilder()
            .setLabel("Open Link")
            .setStyle(
              ButtonStyle.Link
            )
            .setURL(destination)
        );

    await processing.edit({
      content: "",
      embeds: [embed],
      components: [row]
    });

  } catch (error) {
    console.error(
      "❌ SFL Resolver Error:",
      error
    );

    if (
      error.name ===
      "AbortError"
    ) {
      return processing.edit(
        "❌ **SFL terlalu lama merespons.**"
      );
    }

    return processing.edit(
      "❌ **Gagal memproses link SFL.**\n" +
      "Coba lagi beberapa saat."
    );
  }
}

module.exports = {
  handleSFL
};