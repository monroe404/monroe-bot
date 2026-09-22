const {
  SlashCommandBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder,
  EmbedBuilder,
  ButtonBuilder,
  ButtonStyle
} = require("discord.js");

const {
  GUILD_ID,
  STAFF_ROLE_ID,
  FOUNDER_ROLE_ID,
  TICKET_PANEL_CHANNEL_ID
} = require("../config");

const DEFAULT_BANNER =
  "https://cdn.discordapp.com/attachments/1528188606663884853/1551910085880713276/Tak_berjudul41_20260922175607.jpg?ex=6ab3b065&is=6ab25ee5&hm=e0cd12887f8f08d3cc5e3a8e524381fddf14f1349bab5a71bb2baef8d8837c0c&";

const catalogCommand = new SlashCommandBuilder()
  .setName("catalog")
  .setDescription("Membuat catalog Monroe");

async function handleCatalogCommand(interaction) {
  if (!interaction.inGuild()) return;

  const member = interaction.member;

  const allowed =
    member.roles.cache.has(STAFF_ROLE_ID) ||
    member.roles.cache.has(FOUNDER_ROLE_ID);

  if (!allowed) {
    return interaction.reply({
      content: "❌ Kamu tidak memiliki akses menggunakan command ini.",
      ephemeral: true
    });
  }

  const modal = new ModalBuilder()
    .setCustomId("catalog_modal")
    .setTitle("Monroe Catalog");

  const titleInput = new TextInputBuilder()
    .setCustomId("catalog_title")
    .setLabel("Judul")
    .setPlaceholder("Contoh: MONROE COMMUNITY")
    .setStyle(TextInputStyle.Short)
    .setRequired(true)
    .setMaxLength(256);

  const textInput = new TextInputBuilder()
    .setCustomId("catalog_text")
    .setLabel("Text")
    .setPlaceholder("Masukkan deskripsi catalog...")
    .setStyle(TextInputStyle.Paragraph)
    .setRequired(true)
    .setMaxLength(4000);

  const bannerInput = new TextInputBuilder()
    .setCustomId("catalog_banner")
    .setLabel("Banner URL")
    .setPlaceholder("Kosongkan untuk menggunakan banner default")
    .setStyle(TextInputStyle.Short)
    .setRequired(false);

  const buttonInput = new TextInputBuilder()
    .setCustomId("catalog_button")
    .setLabel("Button Text")
    .setPlaceholder("Contoh: 🛒 ORDER NOW")
    .setStyle(TextInputStyle.Short)
    .setRequired(true)
    .setMaxLength(80);

  modal.addComponents(
    new ActionRowBuilder().addComponents(titleInput),
    new ActionRowBuilder().addComponents(textInput),
    new ActionRowBuilder().addComponents(bannerInput),
    new ActionRowBuilder().addComponents(buttonInput)
  );

  await interaction.showModal(modal);
}

async function handleCatalogModal(interaction) {
  if (interaction.customId !== "catalog_modal") return;

  const title =
    interaction.fields.getTextInputValue("catalog_title");

  const text =
    interaction.fields.getTextInputValue("catalog_text");

  const banner =
    interaction.fields.getTextInputValue("catalog_banner").trim() ||
    DEFAULT_BANNER;

  const buttonText =
    interaction.fields.getTextInputValue("catalog_button");

  const ticketURL =
    `https://discord.com/channels/${GUILD_ID}/${TICKET_PANEL_CHANNEL_ID}`;

  const embed = new EmbedBuilder()
    .setColor(0xF97316)
    .setTitle(title)
    .setDescription(text)
    .setImage(banner)
    .setFooter({
      text: "MONROE COMMUNITY © 2026"
    });

  const button = new ButtonBuilder()
    .setLabel(buttonText)
    .setStyle(ButtonStyle.Link)
    .setURL(ticketURL);

  const row = new ActionRowBuilder()
    .addComponents(button);

  await interaction.reply({
    content: "✅ Catalog berhasil dibuat!",
    ephemeral: true
  });

  await interaction.channel.send({
    embeds: [embed],
    components: [row]
  });
}

module.exports = {
  catalogCommand,
  handleCatalogCommand,
  handleCatalogModal
};
