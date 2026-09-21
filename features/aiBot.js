const { Client, GatewayIntentBits } = require("discord.js");
const Groq = require("groq-sdk");

// =========================
// CONFIG
// =========================

const AI_CHANNEL_ID = "1551172381798826024";

// =========================
// GROQ
// =========================

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

// =========================
// DISCORD AI BOT
// =========================

const aiBot = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

// =========================
// BOT READY
// =========================

aiBot.once("clientReady", () => {
  console.log(`🧠 AI Bot online sebagai ${aiBot.user.tag}`);
});

// =========================
// MESSAGE HANDLER
// =========================

aiBot.on("messageCreate", async (message) => {
  // Abaikan bot
  if (message.author.bot) return;

  // Hanya aktif di channel AI
  if (message.channel.id !== AI_CHANNEL_ID) return;

  // Abaikan pesan kosong
  if (!message.content.trim()) return;

  try {
    await message.channel.sendTyping();

    const response = await groq.chat.completions.create({
      model: "openai/gpt-oss-120b",

      messages: [
        {
          role: "system",
          content:
            "Kamu adalah Monroe AI, asisten Discord yang ramah, santai, dan membantu. Jawab dalam bahasa yang digunakan pengguna."
        },
        {
          role: "user",
          content: message.content
        }
      ]
    });

    const answer =
      response.choices?.[0]?.message?.content?.trim();

    if (!answer) {
      return message.reply(
        "❌ AI tidak memberikan jawaban."
      );
    }

    // Discord maksimal 2000 karakter
    if (answer.length <= 2000) {
      await message.reply(answer);
    } else {
      const chunks = answer.match(/[\s\S]{1,1900}/g);

      for (const chunk of chunks) {
        await message.channel.send(chunk);
      }
    }

  } catch (error) {
    console.error("❌ Groq AI Error:", error);

    await message.reply(
      "❌ Maaf, AI sedang mengalami gangguan. Coba lagi beberapa saat."
    );
  }
});

// =========================
// LOGIN
// =========================

aiBot.login(process.env.AI_DISCORD_TOKEN);
