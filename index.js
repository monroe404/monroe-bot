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

// =========================
// AI BOT
// =========================

require("./features/aiBot");

// =========================
// EXPRESS
// =========================

const app = express();

const PORT =
  process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.send("Monroe Bot is Online!");
});

app.listen(PORT, () => {
  console.log(
    "🌐 Web server berjalan di port " + PORT
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
// READY
// =========================

client.once("ready", async () => {
  console.log("================================");
  console.log(
    "🤖 Bot login sebagai " +
      client.user.tag
  );
  console.log("================================");

  try {
    await client.application.commands.set(
      [
        // ROLE
        roleCommand.toJSON(),

        // CATALOG
        catalogCommand.toJSON(),

        // SLOT
        setSlotCommand.toJSON(),

        // FREE ROLE
        freeRoleCommand.toJSON(),

        // MODERATION
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

  try {
    await sendTicketPanel(client);
  } catch (error) {
    console.error(
      "❌ Gagal mengirim Ticket Panel:",
      error
    );
  }
});

// =========================
// INTERACTION CREATE
// =========================

client.on(
  "interactionCreate",
  async interaction => {
    try {

      // =========================
      // MODERATION
      // /clear
      // /kickm
      // /banm
      // /tom
      // /lockm
      // /unlockm
      // /warnm
      // /rolem
      // =========================

      if (interaction.isChatInputCommand()) {
        const handled =
          await handleModerationInteraction(
            interaction
          );

        if (handled) return;
      }

      // =========================
      // FREE ROLE BUTTON
      // =========================

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

      if (interaction.isChatInputCommand()) {

        // /setup-free-role
        if (
          interaction.commandName ===
          "setup-free-role"
        ) {
          return await handleFreeRoleCommand(
            interaction
          );
        }

        // /setup-catalog
        if (
          interaction.commandName ===
          "setup-catalog"
        ) {
          return await handleCatalogCommand(
            interaction
          );
        }

        // /setup-role
        if (
          interaction.commandName ===
          "setup-role"
        ) {
          return await handleRoleFeature(
            interaction
          );
        }

        // /setslot
        if (
          interaction.commandName ===
          "setslot"
        ) {
          return await handleSetSlot(
            interaction
          );
        }
      }

      // =========================
      // ROLE FEATURE
      // =========================

      await handleRoleFeature(
        interaction
      );

      // =========================
      // TICKET FEATURE
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
// MESSAGE CREATE
// =========================

client.on(
  "messageCreate",
  async message => {

    // Abaikan pesan bot
    if (message.author.bot) return;

    try {

      // =========================
      // AUTO RESPONSE
      // =========================

      await handleAutoResponse(
        message
      );

      // =========================
      // PINTEREST
      // !pin
      // =========================

      await handlePinterest(
        message
      );

      // =========================
      // CALCULATOR
      // !calc
      // =========================

      await handleCalculator(
        message
      );

      // =========================
      // CURRENCY
      // !convert
      // =========================

      await handleCurrency(
        message
      );

      // =========================
      // CEK UANG
      // =========================

      await handleCheckCurrency(
        message
      );

      // =========================
      // AUTO SKIPLINK
      // HANYA CHANNEL
      // 1551955190687731732
      // =========================

      await handleSFL(
        message
      );

      // =========================
      // JANGAN TAMBAHKAN
      // handleModeration(message)
      // DI SINI.
      //
      // MODERATOR SUDAH SLASH COMMAND.
      // =========================

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