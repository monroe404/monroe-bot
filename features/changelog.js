const {
  SlashCommandBuilder,
  ChannelType,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder,
  ContainerBuilder,
  MediaGalleryBuilder,
  MediaGalleryItemBuilder,
  MessageFlags
} = require("discord.js");

const {
  GUILD_ID,
  STAFF_ROLE_ID,
  FOUNDER_ROLE_ID
} = require("../config");

const MONROE_LOGO =
  "https://cdn.discordapp.com/attachments/1528188606663884853/1551251020544344134/Tak_berjudul41_20260920221708.jpg?ex=6ab14a98&is=6aaff918&hm=6cdee5dcc024eb0d3fcf2ee06315e2991dc407ef58bb4b9579c52e1ca4aee0ec&";

const changelogCommand = new SlashCommandBuilder()
  .setName("changelog")
  .setDescription("Membuat changelog Monroe Community")
  .addChannelOption(option =>
    option
      .setName("channel")
      .setDescription("Channel untuk mengirim changelog")
      .setRequired(true)
      .addChannelTypes(ChannelType.GuildText)
  );

function isStaff(member) {
  return (
    member.roles.cache.has(STAFF_ROLE_ID) ||
    member.roles.cache.has(FOUNDER_ROLE_ID)
  );
}

async function handleChangelogFeature(interaction) {

  // =========================
  // /changelog
  // =========================

  if (
    interaction.isChatInputCommand() &&
    interaction.commandName === "changelog"
  ) {

    if (interaction.guildId !== GUILD_ID) {
      return interaction.reply({
        content: "❌ Command ini tidak tersedia di server ini.",
        ephemeral: true
      });
    }

    if (!isStaff(interaction.member)) {
      return interaction.reply({
        content:
          "❌ Kamu tidak mempunyai akses untuk menggunakan command ini.",
        ephemeral: true
      });
    }

    const channel =
      interaction.options.getChannel("channel");

    if (
      !channel ||
      channel.type !== ChannelType.GuildText
    ) {
      return interaction.reply({
        content: "❌ Pilih channel text yang valid.",
        ephemeral: true
      });
    }

    const modal =
      new ModalBuilder()
        .setCustomId(`changelog_modal_${channel.id}`)
        .setTitle("Monroe Changelog");

    const titleInput =
      new TextInputBuilder()
        .setCustomId("changelog_title")
        .setLabel("Judul Update")
        .setPlaceholder("Contoh: Monroe Community Update")
        .setStyle(TextInputStyle.Short)
        .setRequired(true)
        .setMaxLength(100);

    const versionInput =
      new TextInputBuilder()
        .setCustomId("changelog_version")
        .setLabel("Version")
        .setPlaceholder("Contoh: 1.2.0")
        .setStyle(TextInputStyle.Short)
        .setRequired(true)
        .setMaxLength(30);

    const changesInput =
      new TextInputBuilder()
        .setCustomId("changelog_changes")
        .setLabel("Perubahan")
        .setPlaceholder(
          "Contoh:\nAdded new ticket system\nAdded Monroe AI\nFixed verification role"
        )
        .setStyle(TextInputStyle.Paragraph)
        .setRequired(true)
        .setMaxLength(1500);

    const noteInput =
      new TextInputBuilder()
        .setCustomId("changelog_note")
        .setLabel("Catatan")
        .setPlaceholder("Catatan tambahan (opsional)")
        .setStyle(TextInputStyle.Paragraph)
        .setRequired(false)
        .setMaxLength(1000);

    modal.addComponents(
      new ActionRowBuilder().addComponents(titleInput),
      new ActionRowBuilder().addComponents(versionInput),
      new ActionRowBuilder().addComponents(changesInput),
      new ActionRowBuilder().addComponents(noteInput)
    );

    return interaction.showModal(modal);
  }

  // =========================
  // MODAL SUBMIT
  // =========================

  if (
    interaction.isModalSubmit() &&
    interaction.customId.startsWith("changelog_modal_")
  ) {

    if (interaction.guildId !== GUILD_ID) {
      return;
    }

    if (!isStaff(interaction.member)) {
      return interaction.reply({
        content: "❌ Kamu tidak mempunyai akses.",
        ephemeral: true
      });
    }

    const channelId =
      interaction.customId.replace(
        "changelog_modal_",
        ""
      );

    const channel =
      interaction.guild.channels.cache.get(channelId);

    if (
      !channel ||
      channel.type !== ChannelType.GuildText
    ) {
      return interaction.reply({
        content: "❌ Channel tujuan tidak ditemukan.",
        ephemeral: true
      });
    }

    const title =
      interaction.fields.getTextInputValue(
        "changelog_title"
      );

    const version =
      interaction.fields.getTextInputValue(
        "changelog_version"
      );

    const changes =
      interaction.fields.getTextInputValue(
        "changelog_changes"
      );

    const note =
      interaction.fields.getTextInputValue(
        "changelog_note"
      );

    const container =
      new ContainerBuilder()
        .setAccentColor(0xff8c00)

        .addTextDisplayComponents(
          text =>
            text.setContent(
              "## 📢 MONROE COMMUNITY\n\n" +
              `# ${title}\n` +
              `**Version ${version}**`
            )
        )

        .addSeparatorComponents(
          separator => separator
        )

        .addTextDisplayComponents(
          text =>
            text.setContent(
              "### ✨ CHANGES\n\n" +
              changes
            )
        );

    if (note.trim()) {
      container.addSeparatorComponents(
        separator => separator
      );

      container.addTextDisplayComponents(
        text =>
          text.setContent(
            "### 📌 NOTE\n\n" +
            note
          )
      );
    }

    container
      .addSeparatorComponents(
        separator => separator
      )
      .addTextDisplayComponents(
        text =>
          text.setContent(
            "-# MONROE COMMUNITY © 2026"
          )
      )
      .addMediaGalleryComponents(
        gallery =>
          gallery.addItems(
            new MediaGalleryItemBuilder()
              .setURL(MONROE_LOGO)
          )
      );

    await channel.send({
      components: [container],
      flags: MessageFlags.IsComponentsV2
    });

    return interaction.reply({
      content:
        `✅ Changelog berhasil dikirim ke ${channel}.`,
      ephemeral: true
    });
  }
}

module.exports = {
  changelogCommand,
  handleChangelogFeature
};
