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

client.once("ready", async () => {
  console.log("================================");
  console.log(
    "🤖 Bot login sebagai " +
      client.user.tag
  );
  console.log("================================");

  // ======================================
  // REGISTER SLASH COMMAND
  // ======================================

  try {
    await client.application.commands.set(
      [
        roleCommand.toJSON(),
        catalogCommand.toJSON(),
        setSlotCommand.toJSON(),
        freeRoleCommand.toJSON(),
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
    await sendTicketPanel(client);

  } catch (error) {
    console.error(
      "❌ Gagal mengirim Ticket Panel:",
      error
    );
  }
});

// ========================================
// INTERACTION CREATE
// ========================================

client.on(
  "interactionCreate",
  async interaction => {

    try {

      // ====================================
      // MODERATION SLASH COMMAND
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
      // FREE ROLE
      // BUTTON + SELECT MENU
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
      // SLASH COMMAND
      // ====================================

      if (
        interaction.isChatInputCommand()
      ) {

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