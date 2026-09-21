const { Client, GatewayIntentBits } = require("discord.js");

const aiBot = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

// =========================
// CONFIG
// =========================

const AI_CHANNEL_ID = "1551172381798826024";

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

  console.log(
    `💬 ${message.author.username}: ${message.content}`
  );
});

// =========================
// LOGIN
// =========================

aiBot.login(process.env.AI_DISCORD_TOKEN);
