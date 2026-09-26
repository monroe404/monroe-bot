const express = require("express");

const {
  Client,
  GatewayIntentBits
} = require("discord.js");

const {
  GUILD_ID
} = require("./config");

// ========================================
// ROLE
// ========================================

const {
  roleCommand,
  handleRoleFeature
} = require("./features/role");

// ========================================
// TICKET
// ========================================

const {
  sendTicketPanel,
  handleTicketFeature
} = require("./features/ticket");

// ========================================
// MODERATION
// ========================================

const {
  handleModeration
} = require("./features/moderation");

// ========================================
// AUTO RESPONSE
// ========================================

const {
  handleAutoResponse
} = require("./features/autoResponse");

// ========================================
// PINTEREST
// ========================================

const {
  handlePinterest
} = require("./features/pinterest");

// ========================================
// CATALOG
// ========================================

const {
  catalogCommand,
  setSlotCommand,
  handleCatalogCommand,
  handleCatalogInteraction,
  handleSetSlot
} = require("./features/catalog");

// ========================================
// CALCULATOR
// ========================================

const {
  handleCalculator
} = require("./features/calculator");

// ========================================
// CURRENCY
// ========================================

const {
  handleCurrency,
  handleCheckCurrency
} = require("./features/currency");

// ========================================
// SFL
// ========================================

const {
  handleSFL
} = require("./features/sfl");

// ========================================
// FREE ROLE
// ========================================

const {
  freeRoleCommand,
  handleFreeRoleCommand,
  handleFreeRoleInteraction
} = require("./features/freeRole");

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

app.get(
  "/",
  (req, res) => {
    res.send(
      "Monroe Bot is Online!"
    );
  }
);

app.listen(
  PORT,
  () => {
    console.log(
      "🌐 Web server berjalan di port " +
      PORT
    );
  }
);

// ========================================
// DISCORD CLIENT
// ========================================

const client =
  new Client({
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

    try {

      await client.application.commands.set(
        [
          roleCommand.toJSON(),
          catalogCommand.toJSON(),
          setSlotCommand.toJSON(),
          freeRoleCommand.toJSON()
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

    // ==================================
    // TICKET PANEL
    // ==================================

    await sendTicketPanel(
      client
    );
  }
);

// ========================================
// INTERACTION
// ========================================

client.on(
  "interactionCreate",
  async interaction => {

    try {

      // ==================================
      // FREE ROLE BUTTON
      // ==================================

      if (
        interaction.isButton() &&
        interaction.customId.startsWith(
          "free_role_"
        )
      ) {

        return await handleFreeRoleInteraction(
          interaction
        );

      }

      // ==================================
      // CATALOG BUTTON
      // ==================================

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

      // ==================================
      // SLASH COMMAND
      // ==================================

      if (
        interaction.isChatInputCommand()
      ) {

        // ------------------------------
        // FREE ROLE
        // ------------------------------

        if (
          interaction.commandName ===
          "setup-free-role"
        ) {

          return await handleFreeRoleCommand(
            interaction
          );

        }

        // ------------------------------
        // CATALOG
        // ------------------------------

        if (
          interaction.commandName ===
          "setup-catalog"
        ) {

          return await handleCatalogCommand(
            interaction
          );

        }

        // ------------------------------
        // ROLE
        // ------------------------------

        if (
          interaction.commandName ===
          "setup-role"
        ) {

          return await handleRoleFeature(
            interaction
          );

        }

        // ------------------------------
        // SET SLOT
        // ------------------------------

        if (
          interaction.commandName ===
          "setslot"
        ) {

          return await handleSetSlot(
            interaction
          );

        }

      }

      // ==================================
      // ROLE FEATURE
      // ==================================

      await handleRoleFeature(
        interaction
      );

      // ==================================
      // TICKET FEATURE
      // ==================================

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

        await interaction
          .reply({
            content:
              "❌ Terjadi kesalahan.",
            ephemeral: true
          })
          .catch(
            () => {}
          );

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

    if (
      message.author.bot
    ) {
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
      // MODERATION
      // ==================================

      await handleModeration(
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
      // ==================================

      await handleCalculator(
        message
      );

      // ==================================
      // CURRENCY
      // ==================================

      await handleCurrency(
        message
      );

      await handleCheckCurrency(
        message
      );

      // ==================================
      // SFL
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