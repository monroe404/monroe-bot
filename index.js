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

// =========================
// WEB SERVER
// =========================

const app = express();
const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.send("Monroe Bot is Online!");
});

app.listen(PORT, () => {
  console.log("Web server berjalan di port " + PORT);
});

// =========================
// DISCORD CLIENT
// =========================

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

// =========================
// BOT READY
// =========================

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

// =========================
// INTERACTION
// =========================

client.on("interactionCreate", async (interaction) => {

  // =========================
  // /setup-role
  // =========================

  if (interaction.isChatInputCommand()) {

    if (interaction.commandName === "setup-role") {

      const embed = new EmbedBuilder()
        .setTitle("👤 Human Role")
        .setDescription(
          "**Klik tombol di bawah untuk mengambil role Human.**\n\n" +
          "Ambil Role Human untuk mengakses lebih dalam file secara gratis."
        );

      const button = new ButtonBuilder()
        .setCustomId("human_role")
        .setLabel("Pencet ini")
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

  // =========================
  // HUMAN ROLE BUTTON
  // =========================

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

if (message.content.toLowerCase().includes("rasya")) {
  await message.reply("iya tau Rasya emang ganteng");
  return;
}

if (message.content.toLowerCase().includes("makasi")) {
  await message.reply("sama sama");
  return;
}

// =========================
// LOGIN
// =========================

client.login(process.env.DISCORD_TOKEN);