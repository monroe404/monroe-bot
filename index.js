const express = require("express");

const {
  Client,
  GatewayIntentBits
} = require("discord.js");

const {
  GUILD_ID
} = require("./config");

// =========================
// FEATURES
// =========================

const {
  roleCommand,
  handleRoleFeature
} = require("./features/role");

const {
  sendTicketPanel,
  handleTicketFeature
} = require("./features/ticket");

const {
  handleModeration
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
  handleCatalogCommand,
  handleCatalogInteraction,
  handleSetSlot
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

// =========================
// AI BOT TERPISAH
// =========================

require("./features/aiBot");

// =========================
// WEB SERVER
// =========================

const app = express();

const PORT =
  process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.send(
    "Monroe Bot is Online!"
  );
});

app.listen(PORT, () => {
  console.log(
    "🌐 Web server berjalan di port " +
    PORT
  );
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

// =========================
// BOT READY
// =========================

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
          setSlotCommand.toJSON()
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

    // =========================
    // TICKET PANEL
    // =========================

    await sendTicketPanel(
      client
    );
  }
);

// =========================
// INTERACTIONS
// =========================

client.on(
  "interactionCreate",
  async interaction => {

    try {

      // =========================
      // CATALOG BUTTON
      // =========================

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

      // =========================
      // SLASH COMMAND
      // =========================

      if (
        interaction.isChatInputCommand()
      ) {

        // =========================
        // CATALOG
        // =========================

        if (
          interaction.commandName ===
          "setup-catalog"
        ) {

          return await handleCatalogCommand(
            interaction
          );
        }

        // =========================
        // SETUP ROLE
        // =========================

        if (
          interaction.commandName ===
          "setup-role"
        ) {

          return await handleRoleFeature(
            interaction
          );
        }

        // =========================
        // SET SLOT
        // =========================

        if (
          interaction.commandName ===
          "setslot"
        ) {

          const {
            handleSetSlot
          } = require(
            "./features/catalog"
          );

          return await handleSetSlot(
            interaction
          );
        }
      }

      // =========================
      // CATALOG MODAL
      // =========================

      if (
        interaction.isModalSubmit()
      ) {

        if (
          interaction.customId ===
          "catalog_modal"
        ) {

          const {
            handleCatalogModal
          } = require(
            "./features/catalog"
          );

          return await handleCatalogModal(
            interaction
          );
        }
      }

      // =========================
      // ROLE
      // =========================

      await handleRoleFeature(
        interaction
      );

      // =========================
      // TICKET
      // =========================

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

// =========================
// MESSAGE
// =========================

client.on(
  "messageCreate",
  async message => {

    if (
      message.author.bot
    ) {
      return;
    }

    try {

      // =========================
      // AUTO RESPONSE
      // =========================

      await handleAutoResponse(
        message
      );

      // =========================
      // MODERATION
      // =========================

      await handleModeration(
        message
      );

      // =========================
      // PINTEREST
      // =========================

      await handlePinterest(
        message
      );

      // =========================
      // CALCULATOR
      // =========================

      await handleCalculator(
        message
      );

      // =========================
      // CURRENCY
      // =========================

      await handleCurrency(
        message
      );

      await handleCheckCurrency(
        message
      );

      // =========================
      // SFL
      // =========================

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

// =========================
// LOGIN
// =========================

client.login(
  process.env.DISCORD_TOKEN
);