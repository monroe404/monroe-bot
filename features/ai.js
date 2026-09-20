const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

async function handleAI(message) {
  if (message.author.bot) return;

  // Gunakan: !ai pertanyaan kamu
  if (!message.content.toLowerCase().startsWith("!ai ")) {
    return;
  }

  const prompt = message.content.slice(4).trim();

  if (!prompt) {
    return message.reply("❌ Contoh: `!ai siapa kamu?`");
  }

  try {
    await message.channel.sendTyping();

    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=" +
        GEMINI_API_KEY,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
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
      return message.reply("❌ AI sedang mengalami masalah.");
    }

    const answer =
      data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!answer) {
      return message.reply("❌ AI tidak memberikan jawaban.");
    }

    return message.reply(answer.slice(0, 2000));

  } catch (error) {
    console.error("❌ AI Error:", error);
    return message.reply("❌ Terjadi error saat menghubungi AI.");
  }
}

module.exports = {
  handleAI
};
