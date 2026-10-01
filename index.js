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
  catalogCommand,
  setSlotCommand,
  addSlotCommand,
  handleCatalogCommand,
  handleCatalogInteraction,
  handleSetSlot,
  handleAddSlot,
  handleCatalogAutocomplete
} = require("./features/catalog");

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
// AI IMAGE GENERATOR
// ========================================

const {
  imagineCommand,
  handleImagine
} = require("./features/ai-image");

// ========================================
// REMOVE BAGROUND
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

          catalogCommand.toJSON(),

          setSlotCommand.toJSON(),

          addSlotCommand.toJSON(),

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
      // YOUTUBE INTERACTION
      // ====================================

      if (
        interaction.isStringSelectMenu()
      ) {

        const youtubeFormatHandled =
          await handleYoutubeInteraction(
            interaction
          );

        if (youtubeFormatHandled) {
          return;
        }

        const youtubeQualityHandled =
          await handleYoutubeQuality(
            interaction
          );

        if (youtubeQualityHandled) {
          return;
        }

      }

      // ====================================
      // CATALOG AUTOCOMPLETE
      // ====================================

      if (
        interaction.isAutocomplete()
      ) {

        return await handleCatalogAutocomplete(
          interaction
        );

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
      // AI IMAGE GENERATOR
      // ====================================

      if (
        interaction.isChatInputCommand() &&
        interaction.commandName === "imagine"
      ) {

        return await handleImagine(
          interaction
        );

      }

      // ====================================
      // REMOVE BAGROUND
      // ====================================

      if (
  interaction.isChatInputCommand() &&
  interaction.commandName === "removebg"
) {
  return await handleRemoveBg(interaction);
      }

      // ====================================
      // FREE ROLE
      // ====================================

      if (
        (
          interaction.isButton() ||
          interaction.isStringSelectMenu()
        ) &&
        interaction.customId.startsWith(
          "free_role_"
        )
      ) {

        return await handleFreeRoleInteraction(
          interaction
        );

      }

      // ====================================
      // CATALOG BUTTON
      // ====================================

      if (
        interaction.isButton() &&
        interaction.customId.startsWith(
          "catalog_"
        )
      ) {

        return await handleCatalogInteraction(
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
        // SETUP CATALOG
        // -------------------------------

        if (
          interaction.commandName ===
          "setup-catalog"
        ) {

          return await handleCatalogCommand(
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

        // -------------------------------
        // SET SLOT
        // -------------------------------

        if (
          interaction.commandName ===
          "setslot"
        ) {

          return await handleSetSlot(
            interaction
          );

        }

        // -------------------------------
        // ADD SLOT
        // -------------------------------

        if (
          interaction.commandName ===
          "addslot"
        ) {

          return await handleAddSlot(
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

    // Jangan proses pesan bot
    if (message.author.bot) {
      return;
    }

    try {

      // ==================================
      // AUTO RESPONSE
      // ==================================

      await handleAutoResponse(
        message
      );

      // ==================================
      // PINTEREST
      // ==================================

      await handlePinterest(
        message
      );

      // ==================================
      // CALCULATOR
      // !calc
      // ==================================

      await handleCalculator(
        message
      );

      // ==================================
      // CURRENCY
      // !convert
      // ==================================

      await handleCurrency(
        message
      );

      // ==================================
      // CHECK CURRENCY
      // !cekuang
      // ==================================

      await handleCheckCurrency(
        message
      );

      // ==================================
      // SFL AUTO SKIPLINK
      // ==================================

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