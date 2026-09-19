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

// =========================
// YOUTUBE DETECTOR SAJA
// =========================

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

// =========================
// Convert BOT
// =========================

console.log('🚀 [Monroe Boombox] Memulai proses inisialisasi...');

const fs = require('fs');
const path = require('path');

const { ensurePackagesInstalled } = require('./utils/autoInstall');

ensurePackagesInstalled([
  '@distube/ytdl-core',
]);

process.on('unhandledRejection', err => {
  console.error('❌ [Global] Unhandled Promise Rejection:', err);
});

process.on('uncaughtException', err => {
  console.error('❌ [Global] Uncaught Exception:', err);
});

const { Client, Collection, GatewayIntentBits, Partials, REST, Routes } = require('discord.js');
const config = require('./config.json');

const { handleButtonInteraction } = require('./commands/bbHandler');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.DirectMessages
  ],
  partials: [
    Partials.Channel,
    Partials.Message
  ]
});

client.commands = new Collection();
client.pendingRequests = new Map();

console.log('✅ [Init] Module dan client Discord berhasil di-load.');

const commandsArray = [];
const foldersPath = path.join(__dirname, 'commands');

if (fs.existsSync(foldersPath)) {
  const commandFolders = fs.readdirSync(foldersPath);

  for (const folder of commandFolders) {
    if (!fs.statSync(path.join(foldersPath, folder)).isDirectory()) continue;
    
    const commandsPath = path.join(foldersPath, folder);
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

    for (const file of commandFiles) {
      const filePath = path.join(commandsPath, file);
      try {
        const command = require(filePath);
        if ('data' in command && 'execute' in command) {
          client.commands.set(command.data.name, command);
          commandsArray.push(command.data.toJSON());
          console.log(`✅ [Command] Berhasil dimuat: ${file}`);
        } else {
          console.warn(`⚠️ [Command] Format salah di: ${file}`);
        }
      } catch (err) {
        console.error(`❌ [Command] Gagal load ${file}:`, err);
      }
    }
  }

  if (commandsArray.length > 0) {
    const rest = new REST({ version: '10' }).setToken(config.token);
    rest.put(Routes.applicationCommands(config.clientId), { body: commandsArray })
      .then(() => console.log('📤 [Deploy] Slash commands berhasil di-deploy!'))
      .catch(err => console.error('❌ [Deploy] Gagal deploy commands:', err));
  }
} else {
  console.log('ℹ️ [Init] Folder commands tidak ditemukan.');
}

const eventsPath = path.join(__dirname, 'events');

if (fs.existsSync(eventsPath)) {
  const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

  for (const file of eventFiles) {
    const filePath = path.join(eventsPath, file);
    try {
      const event = require(filePath);
      const eventType = event.once ? 'once' : 'on';
      client[eventType](event.name, (...args) => event.execute(...args, client));
      console.log(`✅ [Event] Berhasil dimuat: ${file}`);
    } catch (err) {
      console.error(`❌ [Event] Gagal load ${file}:`, err);
    }
  }
} else {
  console.log('ℹ️ [Init] Folder events tidak ditemukan.');
}

client.on('interactionCreate', async interaction => {
  if (interaction.isButton()) {
    await handleButtonInteraction(interaction);
    return;
  }

  if (interaction.isAutocomplete()) {
    const command = client.commands.get(interaction.commandName);
    if (!command) return;
    try {
      await command.autocomplete(interaction);
    } catch (err) {
      console.error(`❌ [Autocomplete] Gagal pada: ${interaction.commandName}`, err);
      await interaction.respond([]).catch(() => null);
    }
    return;
  }

  if (interaction.isChatInputCommand()) {
    const command = client.commands.get(interaction.commandName);
    if (!command) {
      return interaction.reply({ 
        content: '❌ Command tidak ditemukan.', 
        ephemeral: true 
      }).catch(() => null);
    }

    try {
      await command.execute(interaction);
    } catch (err) {
      console.error(`❌ [Exec] Gagal eksekusi: ${interaction.commandName}`, err);
      
      if (!interaction.replied && !interaction.deferred) {
        await interaction.reply({ 
          content: `❌ Terjadi error: ${err.message || 'Unknown error'}`, 
          ephemeral: true 
        }).catch(() => null);
      } else if (interaction.deferred && !interaction.replied) {
        await interaction.followUp({ 
          content: `❌ Terjadi error: ${err.message || 'Unknown error'}`, 
          ephemeral: true 
        }).catch(() => null);
      }
    }
  }
});

client.login(config.token)
  .then(() => console.log('🔐 [Login] Bot berhasil login ke Discord!'))
  .catch(err => console.error('❌ [Login] Gagal login ke Discord:', err));

// =========================
// LOGIN
// =========================

client.login(process.env.DISCORD_TOKEN);