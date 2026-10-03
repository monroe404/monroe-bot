const {
  REST,
  Routes
} = require("discord.js");

const {
  GUILD_ID,
  CLIENT_ID
} = require("./config");

// ========================================
// COMMANDS
// ========================================

const {
  roleCommand
} = require("./features/role");

const {
  ticketCommand
} = require("./features/ticket");

const {
  catalogCommand,
  setSlotCommand,
  addSlotCommand
} = require("./features/catalog");

const {
  freeRoleCommand
} = require("./features/freeRole");

const {
  youtubeCommand
} = require("./features/youtube");

const {
  imagineCommand
} = require("./features/ai-image");

const {
  removeBgCommand
} = require("./features/removebg");

const {
  moderationCommands
} = require("./features/moderation");

const {
  catalogCommand,
  setSlotCommand,
  addSlotCommand
} = require("./features/catalog");

// ========================================
// COMMAND LIST
// ========================================

const commands = [

  roleCommand.toJSON(),

  ticketCommand.toJSON(),

  catalogCommand.toJSON(),
  setSlotCommand.toJSON(),
  addSlotCommand.toJSON(),

  freeRoleCommand.toJSON(),

  youtubeCommand.toJSON(),

  imagineCommand.toJSON(),
  removeBgCommand.toJSON(),

  ...moderationCommands

];

// ========================================
// DEPLOY
// ========================================

const rest = new REST({
  version: "10"
}).setToken(
  process.env.DISCORD_TOKEN
);

(async () => {

  try {

    console.log(
      `🔄 Mendaftarkan ${commands.length} slash command...`
    );

    await rest.put(
      Routes.applicationGuildCommands(
        CLIENT_ID,
        GUILD_ID
      ),
      {
        body: commands
      }
    );

    console.log(
      "✅ Semua slash command berhasil didaftarkan!"
    );

  } catch (error) {

    console.error(
      "❌ Gagal deploy slash command:",
      error
    );

  }

})();