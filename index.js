const express = require("express");
const {
  Client,
  GatewayIntentBits,
  REST,
  Routes,
  SlashCommandBuilder
} = require("discord.js");

const app = express();
const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.send("Monroe Bot is online! 🤖");
});

app.listen(PORT, () => {
  console.log(`Web server berjalan di port ${PORT}`);
});

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers
  ]
});

client.once("ready", () => {
  console.log(`Bot login sebagai ${client.user.tag}`);
});

client.login(process.env.DISCORD_TOKEN);