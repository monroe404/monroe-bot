const { HUMAN_ROLE_ID } = require("../config");

async function handleSFL(message) {
  if (message.author.bot) return;

  const content = message.content.trim();

  if (!content.toLowerCase().startsWith("!sfl")) {
    return;
  }

  if (!message.member?.roles.cache.has(HUMAN_ROLE_ID)) {
    return message.reply(
      "❌ Kamu harus memiliki role **Human**."
    );
  }

  const url = content.slice(4).trim();

  if (!url) {
    return message.reply(
      "❌ Masukkan link SFL.\n\nContoh:\n`!sfl https://contoh.com/xxxxx`"
    );
  }

  try {
    new URL(url);
  } catch {
    return message.reply("❌ Link tidak valid.");
  }

  try {
    await message.channel.sendTyping();

    const response = await fetch(url, {
      method: "GET",
      redirect: "follow",
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/140 Safari/537.36"
      }
    });

    const destination = response.url;

    if (!destination) {
      return message.reply(
        "❌ Destination URL tidak ditemukan."
      );
    }

    await message.reply(destination);

  } catch (error) {
    console.error("SFL ERROR:", error);

    await message.reply(
      "❌ Link tidak dapat diproses."
    );
  }
}

module.exports = {
  handleSFL
};