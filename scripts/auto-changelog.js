const { execFileSync } = require("child_process");

// ==========================================
// MONROE AUTO CHANGELOG
// GitHub Actions -> Groq -> Discord
// Components V2 / No Emoji
// ==========================================

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const DISCORD_TOKEN = process.env.DISCORD_TOKEN;
const CHANGELOG_CHANNEL_ID =
  process.env.CHANGELOG_CHANNEL_ID || "1550471458554380298";

const GROQ_MODEL = "openai/gpt-oss-120b";

// ==========================================
// HELPERS
// ==========================================

function runGit(args) {
  return execFileSync(
    "git",
    args,
    {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"]
    }
  ).trim();
}

function getLatestChangelogTag() {
  try {
    return runGit([
      "tag",
      "--list",
      "changelog-*",
      "--sort=-creatordate"
    ]).split("\n")[0] || null;
  } catch {
    return null;
  }
}

function getDiff() {
  const latestTag = getLatestChangelogTag();

  let range;

  if (latestTag) {
    range = `${latestTag}..HEAD`;
  } else {
    range = "HEAD~1..HEAD";
  }

  console.log(`Checking Git diff: ${range}`);

  try {
    return runGit([
      "diff",
      "--no-ext-diff",
      "--unified=3",
      range,
      "--",
      ".",
      ":(exclude)package-lock.json",
      ":(exclude).github/workflows/auto-changelog.yml"
    ]);
  } catch (error) {
    console.error("Git diff error:", error.message);
    return "";
  }
}

// ==========================================
// GROQ ANALYSIS
// ==========================================

async function analyzeChanges(diff) {
  const prompt = `
You are the release analyst for a Discord bot called MONROE COMMUNITY.

Analyze the Git diff below.

Your job is to identify ONLY genuine new user-facing features that were actually implemented.

COUNT AS A FEATURE:
- New Discord commands
- New bot systems
- New user-facing tools
- New automation
- New interaction systems
- New search systems
- New moderation systems
- New ticket systems
- New catalog systems
- New converter/calculator systems
- Major new functionality that users can actually use

DO NOT COUNT:
- Typos
- Variable renames
- Formatting
- Comments
- README changes
- Console.log changes
- Dependency-only changes
- package-lock changes
- Minor refactors
- Code cleanup
- Bug fixes
- Error handling improvements
- Internal restructuring
- Changing colors/text only
- Permission-only changes
- Small UI wording changes
- Removing features
- Configuration-only changes

IMPORTANT:
Only report features supported by actual code in the diff.
Do not invent features.
Do not assume planned features exist.

Return ONLY valid JSON.

Format:

{
  "features": [
    {
      "name": "Feature name",
      "description": "Short user-facing description",
      "evidence": "Short explanation of what in the code proves this feature exists"
    }
  ]
}

Git diff:

${diff}
`;

  const response = await fetch(
    "https://api.groq.com/openai/v1/chat/completions",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        temperature: 0,
        messages: [
          {
            role: "system",
            content:
              "You are a strict software release analyst. Return only valid JSON."
          },
          {
            role: "user",
            content: prompt
          }
        ]
      })
    }
  );

  if (!response.ok) {
    const errorText = await response.text();

    throw new Error(
      `Groq API error ${response.status}: ${errorText}`
    );
  }

  const data = await response.json();

  const content =
    data.choices?.[0]?.message?.content?.trim();

  if (!content) {
    throw new Error("Groq returned empty response.");
  }

  let cleaned = content;

  // Remove markdown code fences if Groq adds them
  cleaned = cleaned
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();

  try {
    return JSON.parse(cleaned);
  } catch {
    console.error(
      "Groq raw response:",
      content
    );

    throw new Error(
      "Groq returned invalid JSON."
    );
  }
}

// ==========================================
// DISCORD COMPONENTS V2
// ==========================================

function createTextDisplay(content) {
  return {
    type: 10,
    content
  };
}

function createSeparator() {
  return {
    type: 14,
    divider: true,
    spacing: 1
  };
}

function createContainer(components) {
  return {
    type: 17,
    components
  };
}

function buildChangelogComponents(features) {
  const components = [];

  components.push(
    createTextDisplay(
      "# MONROE CHANGELOG"
    )
  );

  components.push(
    createSeparator()
  );

  components.push(
    createTextDisplay(
      "## Update terbaru\n\n" +
      "Fitur baru yang telah ditambahkan ke Monroe Community."
    )
  );

  components.push(
    createSeparator()
  );

  components.push(
    createTextDisplay(
      "## NEW FEATURES"
    )
  );

  for (const feature of features) {
    components.push(
      createTextDisplay(
        `### ${feature.name}\n${feature.description}`
      )
    );

    components.push(
      createSeparator()
    );
  }

  components.push(
    createTextDisplay(
      "MONROE COMMUNITY © 2026"
    )
  );

  return [
    createContainer(components)
  ];
}

// ==========================================
// SEND TO DISCORD
// ==========================================

async function sendChangelog(features) {
  const components =
    buildChangelogComponents(features);

  const response = await fetch(
    `https://discord.com/api/v10/channels/${CHANGELOG_CHANNEL_ID}/messages`,
    {
      method: "POST",
      headers: {
        "Authorization": `Bot ${DISCORD_TOKEN}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        flags: 1 << 15,
        components
      })
    }
  );

  if (!response.ok) {
    const errorText = await response.text();

    throw new Error(
      `Discord API error ${response.status}: ${errorText}`
    );
  }

  console.log(
    "Changelog berhasil dikirim ke Discord."
  );
}

// ==========================================
// CREATE CHECKPOINT
// ==========================================

function createCheckpoint() {
  const now = new Date();

  const timestamp =
    now
      .toISOString()
      .replace(/[-:]/g, "")
      .replace(/\..+/, "")
      .replace("T", "-");

  const tagName =
    `changelog-${timestamp}`;

  console.log(
    `Creating checkpoint: ${tagName}`
  );

  runGit([
    "config",
    "user.name",
    "github-actions[bot]"
  ]);

  runGit([
    "config",
    "user.email",
    "41898282+github-actions[bot]@users.noreply.github.com"
  ]);

  runGit([
    "tag",
    "-a",
    tagName,
    "-m",
    "Automatic changelog checkpoint"
  ]);

  runGit([
    "push",
    "origin",
    tagName
  ]);

  console.log(
    `Checkpoint created: ${tagName}`
  );
}

// ==========================================
// MAIN
// ==========================================

async function main() {
  console.log(
    "========================================"
  );

  console.log(
    "MONROE AUTO CHANGELOG"
  );

  console.log(
    "========================================"
  );

  if (!GROQ_API_KEY) {
    throw new Error(
      "GROQ_API_KEY is missing."
    );
  }

  if (!DISCORD_TOKEN) {
    throw new Error(
      "DISCORD_TOKEN is missing."
    );
  }

  const diff = getDiff();

  if (!diff) {
    console.log(
      "Tidak ada perubahan untuk dianalisis."
    );

    return;
  }

  // Prevent enormous prompts
  const limitedDiff =
    diff.length > 100000
      ? diff.slice(0, 100000)
      : diff;

  console.log(
    `Diff size: ${limitedDiff.length} characters`
  );

  console.log(
    "Mengirim perubahan ke Groq..."
  );

  const analysis =
    await analyzeChanges(limitedDiff);

  const features =
    Array.isArray(analysis.features)
      ? analysis.features
      : [];

  console.log(
    `Valid features ditemukan: ${features.length}`
  );

  // ========================================
  // MINIMUM 5 FEATURES
  // ========================================

  if (features.length < 5) {
    console.log(
      "Kurang dari 5 fitur baru."
    );

    console.log(
      "Changelog tidak dikirim."
    );

    return;
  }

  // Limit to actual detected features
  const validFeatures =
    features
      .filter(
        feature =>
          feature &&
          typeof feature.name === "string" &&
          typeof feature.description === "string"
      )
      .slice(0, 20);

  if (validFeatures.length < 5) {
    console.log(
      "Setelah validasi, fitur kurang dari 5."
    );

    return;
  }

  console.log(
    "Fitur memenuhi syarat."
  );

  console.log(
    "Mengirim Components V2 ke Discord..."
  );

  await sendChangelog(
    validFeatures
  );

  // ========================================
  // ONLY CREATE CHECKPOINT AFTER SUCCESS
  // ========================================

  createCheckpoint();

  console.log(
    "========================================"
  );

  console.log(
    "AUTO CHANGELOG SELESAI"
  );

  console.log(
    "========================================"
  );
}

main().catch(error => {
  console.error(
    "AUTO CHANGELOG ERROR:"
  );

  console.error(error);

  process.exit(1);
});