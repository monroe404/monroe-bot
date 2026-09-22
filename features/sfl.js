const { HUMAN_ROLE_ID } = require("../config");

function findDestination(html, baseUrl) {
  // Meta refresh
  const meta =
    html.match(
      /<meta[^>]+http-equiv=["']?refresh["']?[^>]+content=["'][^"']*url=([^"']+)/i
    ) ||
    html.match(
      /<meta[^>]+content=["'][^"']*url=([^"']+)["'][^>]+http-equiv=["']?refresh/i
    );

  if (meta?.[1]) {
    return new URL(
      meta[1].trim(),
      baseUrl
    ).href;
  }

  // location.href / location.replace / location.assign
  const jsPatterns = [
    /location\.href\s*=\s*["']([^"']+)["']/i,
    /location\.replace\s*\(\s*["']([^"']+)["']\s*\)/i,
    /location\.assign\s*\(\s*["']([^"']+)["']\s*\)/i,
    /window\.location\s*=\s*["']([^"']+)["']/i
  ];

  for (const pattern of jsPatterns) {
    const match = html.match(pattern);

    if (match?.[1]) {
      return new URL(
        match[1],
        baseUrl
      ).href;
    }
  }

  // Cari href yang terlihat seperti destination
  const links = [
    ...html.matchAll(
      /href\s*=\s*["']([^"']+)["']/gi
    )
  ];

  for (const match of links) {
    const href = match[1];

    try {
      const target = new URL(href, baseUrl).href;

      if (
        !target.includes(new URL(baseUrl).hostname)
      ) {
        return target;
      }
    } catch {}
  }

  return null;
}

async function resolveSFL(startUrl) {
  let currentUrl = startUrl;

  for (let i = 0; i < 5; i++) {
    const response = await fetch(currentUrl, {
      redirect: "follow",
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/140 Safari/537.36",
        "Accept":
          "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8"
      }
    });

    const finalHttpUrl = response.url;

    if (
      finalHttpUrl &&
      finalHttpUrl !== currentUrl
    ) {
      currentUrl = finalHttpUrl;
    }

    const contentType =
      response.headers.get("content-type") || "";

    if (!contentType.includes("text/html")) {
      return currentUrl;
    }

    const html = await response.text();

    const destination =
      findDestination(
        html,
        currentUrl
      );

    if (!destination) {
      return currentUrl;
    }

    if (destination === currentUrl) {
      return currentUrl;
    }

    currentUrl = destination;
  }

  return currentUrl;
}

async function handleSFL(message) {
  if (message.author.bot) return;

  const content = message.content.trim();

  if (!content.toLowerCase().startsWith("!sfl")) {
    return;
  }

  if (
    !message.member?.roles.cache.has(
      HUMAN_ROLE_ID
    )
  ) {
    return message.reply(
      "❌ Kamu harus memiliki role **Human**."
    );
  }

  const url = content
    .slice(4)
    .trim();

  if (!url) {
    return message.reply(
      "❌ Masukkan link SFL.\n\n" +
      "`!sfl https://contoh.com/xxxxx`"
    );
  }

  try {
    new URL(url);
  } catch {
    return message.reply(
      "❌ Link tidak valid."
    );
  }

  try {
    await message.channel.sendTyping();

    const destination =
      await resolveSFL(url);

    if (!destination) {
      return message.reply(
        "❌ Destination URL tidak ditemukan."
      );
    }

    await message.reply(destination);

  } catch (error) {
    console.error(
      "❌ SFL ERROR:",
      error
    );

    await message.reply(
      "❌ Link tidak dapat diproses."
    );
  }
}

module.exports = {
  handleSFL
};