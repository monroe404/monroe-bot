const fs = require("fs");
const { execSync } = require("child_process");

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const DISCORD_TOKEN = process.env.DISCORD_TOKEN;
const CHANGELOG_CHANNEL_ID = process.env.CHANGELOG_CHANNEL_ID;

if (!GROQ_API_KEY) throw new Error("GROQ_API_KEY belum tersedia.");
if (!DISCORD_TOKEN) throw new Error("DISCORD_TOKEN belum tersedia.");
if (!CHANGELOG_CHANNEL_ID) {
  throw new Error("CHANGELOG_CHANNEL_ID belum tersedia.");
}

// =========================
// AMBIL COMMIT TERAKHIR
// =========================

let previousTag = "";

try {
  previousTag = execSync(
    'git tag --list "changelog-*" --sort=-creatordate | head -n 1',
    { encoding: "utf8" }
  ).trim();
} catch {}

let diffCommand;

if (previousTag) {
  diffCommand = `git diff ${previousTag} HEAD -- . ':!package-lock.json'`;
} else {
  diffCommand = "git diff HEAD~1 HEAD -- . ':!package-lock.json'";
}

let diff = "";

try {
  diff = execSync(diffCommand, {
    encoding: "utf8",
    maxBuffer: 10 * 1024 * 1024
  });
} catch {
  diff = "";
}

if (!diff.trim()) {
  console.log("ℹ️ Tidak ada perubahan kode yang perlu dianalisis.");
  process.exit(0);
}

// Batasi ukuran diff agar tidak terlalu besar
if (diff.length > 100000) {
  diff = diff.slice(0, 100000);
}

// =========================
// GROQ AI
// =========================

async function analyzeChanges() {
  const response = await fetch(
    "https://api.groq.com/openai/v1/chat/completions",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: "openai/gpt-oss-120b",
        temperature: 0.1,

        messages: [
          {
            role: "system",
            content: `
Kamu adalah AI analyzer untuk changelog sebuah Discord bot bernama Monroe.

Tugasmu hanya mendeteksi FITUR BARU yang benar-benar ditambahkan atau perubahan besar
yang menghasilkan kemampuan baru bagi pengguna.

JANGAN masukkan:
- typo
- perubahan nama variabel
- perubahan komentar
- README
- console.log
- formatting
- refactor internal kecil
- dependency update tanpa fitur baru
- perubahan kode yang tidak menghasilkan kemampuan pengguna
- bug fix biasa

Sebuah fitur harus mempunyai bukti kuat dari perubahan kode.

Contoh fitur valid:
- Pinterest Search
- Sales Statistics
- Calculator
- Currency Converter
- Claim Ticket
- sistem role baru
- sistem ticket baru
- AI assistant baru

Gunakan bahasa Indonesia.

Balas HANYA JSON valid dengan format:

{
  "features": [
    {
      "name": "Nama fitur",
      "description": "Penjelasan singkat fitur",
      "evidence": "Bukti dari perubahan kode"
    }
  ]
}

Kalau tidak ada fitur baru:

{
  "features": []
}
`
          },
          {
            role: "user",
            content: `Berikut perubahan kode terbaru:

${diff}`
          }
        ]
      })
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Groq API Error ${response.status}: ${errorText}`
    );
  }

  const data = await response.json();

  const content =
    data.choices?.[0]?.message?.content?.trim();

  if (!content) {
    throw new Error("Groq tidak memberikan hasil.");
  }

  return content;
}

// =========================
// PARSE JSON
// =========================

function parseAIResult(text) {
  try {
    return JSON.parse(text);
  } catch {}

  const match = text.match(/\{[\s\S]*\}/);

  if (!match) {
    throw new Error("AI mengembalikan JSON yang tidak valid.");
  }

  return JSON.parse(match[0]);
}

// =========================
// DISCORD
// =========================

async function sendDiscordMessage(content) {
  const response = await fetch(
    `https://discord.com/api/v10/channels/${CHANGELOG_CHANNEL_ID}/messages`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bot ${DISCORD_TOKEN}`
      },
      body: JSON.stringify({
        content
      })
    }
  );

  if (!response.ok) {
    const errorText = await response.text();

    throw new Error(
      `Discord API Error ${response.status}: ${errorText}`
    );
  }
}

// =========================
// MAIN
// =========================

async function main() {
  console.log("🔎 Menganalisis perubahan kode...");

  const aiText = await analyzeChanges();
  const result = parseAIResult(aiText);

  const features = Array.isArray(result.features)
    ? result.features
    : [];

  console.log(`📊 Fitur valid ditemukan: ${features.length}`);

  // Minimal 5 fitur baru
  if (features.length < 5) {
    console.log(
      "ℹ️ Belum mencapai 5 fitur baru. Changelog tidak dikirim."
    );

    process.exit(0);
  }

  // =========================
  // BUAT CHANGELOG
  // =========================

  let message =
    "## 📢 MONROE COMMUNITY — CHANGELOG\n\n" +
    "Berikut fitur baru yang telah ditambahkan:\n\n";

  features.forEach((feature, index) => {
    message +=
      `### ${index + 1}. ${feature.name}\n` +
      `${feature.description}\n\n`;
  });

  message +=
    "━━━━━━━━━━━━━━━━━━━━\n" +
    "🛠️ **MONROE COMMUNITY © 2026**";

  // Discord message limit
  if (message.length > 2000) {
    message = message.slice(0, 1950) + "\n\n...";
  }

  await sendDiscordMessage(message);

  console.log("✅ Changelog berhasil dikirim ke Discord.");

  // =========================
  // CHECKPOINT TAG
  // =========================

  const timestamp = new Date()
    .toISOString()
    .replace(/[-:]/g, "")
    .replace(/\..+/, "")
    .replace("T", "-");

  const tagName = `changelog-${timestamp}`;

  execSync(`git config user.name "github-actions[bot]"`);
  execSync(
    `git config user.email "41898282+github-actions[bot]@users.noreply.github.com"`
  );

  execSync(`git tag ${tagName}`);
  execSync(`git push origin ${tagName}`);

  console.log(`🏷️ Checkpoint dibuat: ${tagName}`);
}

main().catch(error => {
  console.error("❌ Auto Changelog Error:");
  console.error(error);
  process.exit(1);
});
