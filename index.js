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
  handleCatalogCommand,
  handleCatalogModal
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
  prayerCommand,
  handlePrayerCommand,
  startPrayerSystem
} = require("./features/prayer");

// =========================
// AI BOT TERPISAH
// =========================

require("./features/aiBot");

// =========================
// WEB SERVER
// =========================

const app = express();

const PORT = process.env.PORT || 3000;

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
// BOT READY
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
    roleCommand.toJSON(),
    catalogCommand.toJSON(),
    prayerCommand.toJSON()
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

  await sendTicketPanel(client);
});

// =========================
// INTERACTIONS
// =========================

client.on(
  "interactionCreate",
  async interaction => {

    try {

      // Slash command
      if (interaction.isChatInputCommand()) {

        if (
          interaction.commandName === "catalog"
        ) {
          return await handleCatalogCommand(
            interaction
          );
        }

        if (
          interaction.commandName === "setup-role"
        ) {
          return await handleRoleFeature(
            interaction
          );
        }

        if (
  interaction.commandName === "setup-prayer"
) {
  return await handlePrayerCommand(
    interaction
  );
}

      }

      // Catalog modal
      if (interaction.isModalSubmit()) {

        if (
          interaction.customId === "catalog_modal"
        ) {
          return await handleCatalogModal(
            interaction
          );
        }

      }

      // Buttons / Ticket / Role
      await handleRoleFeature(
        interaction
      );

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
          content: "❌ Terjadi kesalahan.",
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

    if (message.author.bot) return;

    try {

      await handleAutoResponse(
        message
      );

      await handleModeration(
        message
      );

      await handlePinterest(
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