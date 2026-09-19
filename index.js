const express = require("express");
const {
  Client,
  GatewayIntentBits,
  REST,
  Routes,
  SlashCommandBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder
} = require("discord.js");

const app = express();
const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.send("Monroe Bot is Online!");
});

app.listen(PORT, () => {
  console.log("Web server berjalan di port " + PORT);
});

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

const ROLE_ID = "1506592536372842517";
const GUILD_ID = "1505911450634289253";

client.once("ready", async () => {
  console.log("Bot login sebagai " + client.user.tag);

  const command = new SlashCommandBuilder()
    .setName("setup-role")
    .setDescription("Mengirim panel untuk mengambil role Human.");

  const rest = new REST({ version: "10" })
    .setToken(process.env.DISCORD_TOKEN);

  try {
    await rest.put(
      Routes.applicationGuildCommands(client.user.id, GUILD_ID),
      {
        body: [command.toJSON()]
      }
    );

    console.log("Slash command berhasil didaftarkan.");
  } catch (error) {
    console.error(error);
  }
});

client.on("interactionCreate", async (interaction) => {

  if (interaction.isChatInputCommand()) {

    if (interaction.commandName === "setup-role") {

      const embed = new EmbedBuilder()
        .setTitle("👤 Human Role")
        .setDescription(
          "**Klik tombol di bawah untuk mengambil role Human.**\n\n" +
          "Gunakan tombol tersebut untuk mengatur role kamu."
        );

      const button = new ButtonBuilder()
        .setCustomId("human_role")
        .setLabel("Human")
        .setEmoji("👤")
        .setStyle(ButtonStyle.Primary);

      const row = new ActionRowBuilder()
        .addComponents(button);

      await interaction.reply({
        embeds: [embed],
        components: [row]
      });
    }
  }

  if (interaction.isButton()) {

    if (interaction.customId === "human_role") {

      const member = interaction.member;
      const role = interaction.guild.roles.cache.get(ROLE_ID);

      if (!role) {
        return interaction.reply({
          content: "❌ Role Human tidak ditemukan.",
          ephemeral: true
        });
      }

      try {

        if (member.roles.cache.has(ROLE_ID)) {

          await member.roles.remove(role);

          await interaction.reply({
            content: "❌ Role Human telah dilepas.",
            ephemeral: true
          });

        } else {

          await member.roles.add(role);

          await interaction.reply({
            content: "✅ Kamu berhasil mendapatkan role Human!",
            ephemeral: true
          });
        }

      } catch (error) {

        console.error(error);

        await interaction.reply({
          content: "❌ Bot tidak bisa mengatur role.",
          ephemeral: true
        });
      }
    }
  }
});

client.on("messageCreate", async (message) => {

  if (message.author.bot) return;

  console.log("Pesan masuk: " + message.content);

  const youtubeRegex =
    /https?:\/\/(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/shorts\/)[^\s]+/i;

  const match = message.content.match(youtubeRegex);

  if (!match) return;

  const youtubeLink = match[0];

  console.log("YouTube terdeteksi: " + youtubeLink);

  await message.reply(
    "🎵 **Link YouTube terdeteksi!**\n\n" +
    "🔄 Converter sedang dipersiapkan..."
  );
});

client.login(process.env.DISCORD_TOKEN);