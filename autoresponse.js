async function handleAutoResponse(message) {
  if (message.author.bot) return;

  const content = message.content.toLowerCase();

  if (
    content.includes("makasi") ||
    content.includes("makasih")
  ) {
    await message.reply("sama sama");
    return;
  }

  if (content.includes("rasya")) {
    await message.reply(
      "iya tau Rasya emang ganteng"
    );
  }
}

module.exports = {
  handleAutoResponse
};