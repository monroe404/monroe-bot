const express = require("express");

const {
  Client,
  GatewayIntentBits
} = require("discord.js");

const {
  GUILD_ID
} = require("./config");

// ========================================
// FEATURES
// ========================================

const {
  roleCommand,
  handleRoleFeature
} = require("./features/role");

const {
  ticketCommand,
  sendTicketPanel,
  handleTicketFeature
} = require("./features/ticket");

const {
  moderationCommands,
  handleModerationInteraction
} = require("./features/moderation");

const {
  handleAutoResponse
} = require("./features/autoResponse");

const {
  handlePinterest
} = require("./features/pinterest");

const {
  handleCalculator
} = require("./features/calculator");

const {
  handleCurrency,
  handleCheckCurrency
} = require("./features/currency");

const {
  handleSFL
} = require("./features/sfl");

const {
  freeRoleCommand,
  handleFreeRoleCommand,
  handleFreeRoleInteraction
} = require("./features/freeRole");

const {
  handleTTSMessage
} = require("./features/tts");

const {
  handleMarket
} = require("./features/market");

// ========================================
// YOUTUBE DOWNLOADER
// ========================================

const {
  youtubeCommand,
  handleYoutube,
  handleYoutubeInteraction,
  handleYoutubeQuality
} = require("./features/youtube");

// ========================================
// AI IMAGE
// ========================================

const {
  imagineCommand,
  handleImagine
} = require("./features/ai-image");

// ========================================
// REMOVE BACKGROUND
// ========================================

const {
  removeBgCommand,
  handleRemoveBg
} = require("./features/removebg");

// ========================================
// AI BOT
// ========================================

require("./features/aiBot");

// ========================================
// EXPRESS
// ========================================

const app = express();

const PORT =
  process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.send("Monroe Bot is Online!");
});

app.listen(PORT, () => {
  console.log(
    "🌐 Web server berjalan di port " +
    PORT
  );
});

// ========================================
// DISCORD CLIENT
// ========================================

const client = new Client({

  intents: [

    GatewayIntentBits.Guilds,

    GatewayIntentBits.GuildMembers,

    GatewayIntentBits.GuildMessages,

    GatewayIntentBits.MessageContent

  ]

});

// ========================================
// READY
// ========================================

client.once(
  "ready",
  async () => {

    console.log(
      "================================"
    );

    console.log(
      "🤖 Bot login sebagai " +
      client.user.tag
    );

    console.log(
      "================================"
    );

    // ======================================
    // REGISTER SLASH COMMAND
    // ======================================

    try {

      await client.application.commands.set(
        [

          roleCommand.toJSON(),

          ticketCommand.toJSON(),

          freeRoleCommand.toJSON(),

          youtubeCommand.toJSON(),

          imagineCommand.toJSON(),

          removeBgCommand.toJSON(),

          ...moderationCommands

        ],

        GUILD_ID

      );

      console.log(
        "✅ Slash command berhasil didaftarkan."
      );

    } catch (error) {

      console.error(
        "❌ Gagal mendaftarkan slash command:",
        error
      );

    }

    // ======================================
    // TICKET PANEL
    // ======================================

    try {

      await sendTicketPanel(
        client
      );

    } catch (error) {

      console.error(
        "❌ Gagal mengirim Ticket Panel:",
        error
      );

    }

  }
);

// ========================================
// INTERACTION CREATE
// ========================================

client.on(
  "interactionCreate",
  async interaction => {

    try {

      // ====================================
      // YOUTUBE SELECT MENU
      // ====================================

      if (
        interaction.isStringSelectMenu()
      ) {

        const formatHandled =
          await handleYoutubeInteraction(
            interaction
          );

        if (formatHandled) {
          return;
        }

        const qualityHandled =
          await handleYoutubeQuality(
            interaction
          );

        if (qualityHandled) {
          return;
        }

      }

      // ====================================
      // MODERATION
      // ====================================

      if (
        interaction.isChatInputCommand()
      ) {

        const handled =
          await handleModerationInteraction(
            interaction
          );

        if (handled) {
          return;
        }

      }

      // ====================================
      // AI IMAGE
      // ====================================

      if (
        interaction.isChatInputCommand() &&
        interaction.commandName ===
          "imagine"
      ) {

        return await handleImagine(
          interaction
        );

      }

      // ====================================
      // REMOVE BACKGROUND
      // ====================================

      if (
        interaction.isChatInputCommand() &&
        interaction.commandName ===
          "removebg"
      ) {

        return await handleRemoveBg(
          interaction
        );

      }

      // ====================================
      // FREE ROLE
      // ====================================

      if (
        (
          interaction.isButton() ||
          interaction.isStringSelectMenu()
        ) &&
        interaction.customId?.startsWith(
          "free_role_"
        )
      ) {

        return await handleFreeRoleInteraction(
          interaction
        );

      }

      // ====================================
      // YOUTUBE SLASH COMMAND
      // ====================================

      if (
        interaction.isChatInputCommand()
      ) {

        const youtubeHandled =
          await handleYoutube(
            interaction
          );

        if (youtubeHandled) {
          return;
        }

        // -------------------------------
        // SETUP FREE ROLE
        // -------------------------------

        if (
          interaction.commandName ===
          "setup-free-role"
        ) {

          return await handleFreeRoleCommand(
            interaction
          );

        }

        // -------------------------------
        // SETUP ROLE
        // -------------------------------

        if (
          interaction.commandName ===
          "setup-role"
        ) {

          return await handleRoleFeature(
            interaction
          );

        }

      }

      // ====================================
      // ROLE FEATURE
      // ====================================

      await handleRoleFeature(
        interaction
      );

      // ====================================
      // TICKET FEATURE
      // ====================================

      await handleTicketFeature(
        interaction
      );

    } catch (error) {

      console.error(
        "❌ Interaction Error:",
        error
      );

      if (
        !interaction.replied &&
        !interaction.deferred
      ) {

        await interaction.reply({

          content:
            "❌ Terjadi kesalahan.",

          ephemeral: true

        }).catch(() => {});

      }

    }

  }
);

// ========================================
// MESSAGE CREATE
// ========================================

client.on(
  "messageCreate",
  async message => {

    if (message.author.bot) {
      return;
    }

    try {

      await handleAutoResponse(
        message
      );

      await handlePinterest(
        message
      );

      await handleMarket(
        message
      );

      await handleCalculator(
        message
      );

      await handleCurrency(
        message
      );

      await handleCheckCurrency(
        message
      );

      await handleTTSMessage(
        message
      );

      await handleSFL(
        message
      );

    } catch (error) {

      console.error(
        "❌ Message Error:",
        error
      );

    }

  }
);

// ========================================
// LOGIN
// ========================================

client.login(
  process.env.DISCORD_TOKEN
);