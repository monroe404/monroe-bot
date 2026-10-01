const {
  AttachmentBuilder,
  EmbedBuilder
} = require("discord.js");

// ========================================
// GENERATE TTS
// ========================================

async function generateTTS(text) {

  const encodedText =
    encodeURIComponent(text);

  const url =
    `https://translate.google.com/translate_tts` +
    `?ie=UTF-8` +
    `&q=${encodedText}` +
    `&tl=id` +
    `&client=tw-ob`;

  const response = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0"
    }
  });

  if (!response.ok) {
    throw new Error(
      `TTS Error ${response.status}`
    );
  }

  const buffer =
    Buffer.from(
      await response.arrayBuffer()
    );

  return buffer;
}

// ========================================
// HANDLE !TTS
// ========================================

async function handleTTSMessage(message) {

  if (message.author.bot) {
    return false;
  }

  if (!message.content.startsWith("!tts ")) {
    return false;
  }

  const text =
    message.content
      .slice(5)
      .trim();

  if (!text) {
    await message.reply(
      "❌ Gunakan: `!tts <teks>`"
    );

    return true;
  }

  if (text.length > 200) {
    await message.reply(
      "❌ Teks terlalu panjang. Maksimal **200 karakter**."
    );

    return true;
  }

  try {

    await message.channel.sendTyping();

    const audioBuffer =
      await generateTTS(text);

    const file =
      new AttachmentBuilder(
        audioBuffer,
        {
          name: "monroe-tts.mp3"
        }
      );

    const embed =
      new EmbedBuilder()
        .setTitle("🔊 MONROE TEXT TO SPEECH")
        .setDescription(
          `**Text:** ${text}`
        )
        .setFooter({
          text: "MONROE COMMUNITY © 2026"
        });

    await message.reply({
      embeds: [embed],
      files: [file]
    });

  } catch (error) {

    console.error(
      "❌ TTS ERROR:",
      error
    );

    await message.reply(
      "❌ Gagal membuat suara. Coba lagi."
    );
  }

  return true;
}

// ========================================
// EXPORT
// ========================================

module.exports = {
  handleTTSMessage
};