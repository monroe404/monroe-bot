const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

async function handleAI(message) {
  if (message.author.bot) return;

  if (!message.mentions.has(message.client.user)) {
    return;
  }

  const prompt = message.content
    .replace(`<@${message.client.user.id}>`, "")
    .replace(`<@!${message.client.user.id}>`, "")
    .trim();

  if (!prompt) {
    return message.reply("👋 Halo! Ada yang mau ditanyakan?");
  }

  try {
    await message.channel.sendTyping();

    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": GEMINI_API_KEY
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt
                }
              ]
            }
          ]
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("Gemini Error:", data);

      return message.reply(
        "❌ AI sedang mengalami masalah."
      );
    }

    const answer =
      data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!answer) {
      return message.reply(
        "❌ AI tidak memberikan jawaban."
      );
    }

    return message.reply(
      answer.slice(0, 2000)
    );

  } catch (error) {
    console.error("❌ Gemini Error:", error);

    return message.reply(
      "❌ Gagal menghubungi AI."
    );
  }
}

module.exports = {
  handleAI
};
