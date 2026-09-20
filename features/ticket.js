const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChannelType,
  ContainerBuilder,
  MediaGalleryBuilder,
  MediaGalleryItemBuilder,
  MessageFlags,
  PermissionFlagsBits
} = require("discord.js");

const {
  STAFF_ROLE_ID,
  FOUNDER_ROLE_ID,
  ORDER_CATEGORY_NAME,
  TICKET_PANEL_CHANNEL_ID
} = require("../config");

const MONROE_LOGO =
  "https://cdn.discordapp.com/attachments/1548176163845705781/1551244081940664440/Tak_berjudul40_20260917175945.png?ex=6ab14421&is=6aaff2a1&hm=bc5ca46f75a1fcb5a9182f50ea38a9f87259ae75d95054f9c1915c7868b948af";

// =========================
// STAFF CHECK
// =========================

function isStaff(member) {
  return (
    member.roles.cache.has(STAFF_ROLE_ID) ||
    member.roles.cache.has(FOUNDER_ROLE_ID)
  );
}

// =========================
// TICKET PANEL
// =========================

async function sendTicketPanel(client) {
  try {
    const channel = await client.channels.fetch(
      TICKET_PANEL_CHANNEL_ID
    );

    if (!channel || !channel.isTextBased()) return;

    const messages = await channel.messages.fetch({
      limit: 50
    });

    const alreadyExists = messages.some(
      message =>
        message.author.id === client.user.id &&
        message.flags.has(MessageFlags.IsComponentsV2)
    );

    if (alreadyExists) return;

    // =========================
    // BUTTONS
    // =========================

    const orderButton = new ButtonBuilder()
      .setCustomId("ticket_buy")
      .setLabel("ORDER")
      .setEmoji("🛒")
      .setStyle(ButtonStyle.Primary);

    const staffButton = new ButtonBuilder()
      .setCustomId("ticket_staff")
