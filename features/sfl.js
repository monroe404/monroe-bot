const SFL_API_URL =
  "https://zennq.my.id/api/bypass";

// ========================================
// SFL BYPASS
// ========================================

async function bypassSFL(url) {
  if (!url) {
    throw new Error(
      "URL belum diberikan."
    );
  }

  const apiKey =
    process.env.SFL_API_KEY;

  if (!apiKey) {
    throw new Error(
      "SFL_API_KEY belum dipasang di Railway."
    );
  }

  const response =
    await fetch(
      SFL_API_URL,
      {
        method: "POST",

        headers: {
          "Content-Type":
            "application/json",

          "x-api-key":
            apiKey
        },

        body: JSON.stringify({
          url
        })
      }
    );

  let data;

  try {
    data =
      await response.json();
  } catch {
    throw new Error(
      "API mengembalikan response yang tidak valid."
    );
  }

  if (!response.ok) {
    throw new Error(
      data?.message ||
      `API Error ${response.status}`
    );
  }

  const bypassedUrl =
    data?.data?.bypassedUrl;

  if (!bypassedUrl) {
    throw new Error(
      data?.message ||
      "API tidak mengembalikan bypassedUrl."
    );
  }

  return bypassedUrl;
}

// ========================================
// DISCORD MESSAGE
// ========================================

async function handleSFL(message) {
  if (
    !message ||
    message.author.bot
  ) {
    return;
  }

  const content =
    message.content.trim();

  if (
    !content.toLowerCase()
      .startsWith("!sfl ")
  ) {
    return;
  }

  const url =
    content
      .slice(5)
      .trim();

  if (!url) {
    await message.reply(
      "❌ Masukkan URL SFL.\n\nContoh: `!sfl https://sfl.gl/xxx`"
    );

    return;
  }

  try {

    const result =
      await bypassSFL(url);

    await message.reply(
      `✅ **SFL Result**\n${result}`
    );

  } catch (error) {

    console.error(
      "❌ SFL Error:",
      error
    );

    await message.reply(
      `❌ Gagal memproses URL.\n\`${error.message}\``
    );

  }
}

module.exports = {
  bypassSFL,
  handleSFL
};