#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const mergeDeep = (target, source) => {
  for (const key in source) {
    if (
      source[key] &&
      typeof source[key] === "object" &&
      !Array.isArray(source[key])
    ) {
      if (!target[key] || typeof target[key] !== "object") {
        target[key] = {};
      }
      mergeDeep(target[key], source[key]);
    } else {
      target[key] = source[key];
    }
  }
  return target;
};

const createESLintPrettierProjectSettings = () => {
  const settingsTemplate = {
    languages: {
      TypeScript: {
        language_servers: [
          "!typescript-language-server",
          "!biome",
          "eslint",
          "vtsls",
          "...",
        ],
        code_actions_on_format: {
          "source.organizeImports": true,
          "source.fixAll.eslint": true,
        },
        prettier: {
          allowed: true,
        },
      },
      TSX: {
        language_servers: [
          "!typescript-language-server",
          "!biome",
          "eslint",
          "vtsls",
          "...",
        ],
        code_actions_on_format: {
          // "source.organizeImports": true,
          "source.fixAll.eslint": true,
        },
        prettier: {
          allowed: true,
        },
      },
      JavaScript: {
        language_servers: [
          "!typescript-language-server",
          "!biome",
          "eslint",
          "vtsls",
          "...",
        ],
        formatter: "prettier",
        format_on_save: "on",
        code_actions_on_format: {
          // "source.organizeImports": true,
          "source.fixAll.eslint": true,
        },
        prettier: {
          allowed: true,
        },
      },
      JSX: {
        language_servers: ["!biome", "eslint", "vtsls", "..."],
        formatter: "prettier",
        format_on_save: "on",
        code_actions_on_format: {
          // "source.organizeImports": true,
          "source.fixAll.eslint": true,
        },
        prettier: {
          allowed: true,
        },
      },
    },
  };

  const outputPath = path.join(process.cwd(), ".zed", "settings.json");

  // Create .zed directory if it doesn't exist
  const zedDir = path.dirname(outputPath);
  if (!fs.existsSync(zedDir)) {
    fs.mkdirSync(zedDir, { recursive: true });
    console.log(`Created directory: ${zedDir}`);
  }

  let existingSettings = {};

  // Read existing settings if file exists
  if (fs.existsSync(outputPath)) {
    try {
      const existingContent = fs.readFileSync(outputPath, "utf8");
      existingSettings = JSON.parse(existingContent);
      console.log(
        `Found existing settings, merging with ESLint + Prettier configuration...`,
      );
    } catch (error) {
      console.log(
        `Warning: Could not parse existing settings.json, creating new file...`,
      );
    }
  }

  // Merge existing settings with new template
  const mergedSettings = mergeDeep(existingSettings, settingsTemplate);

  // Write merged settings.json
  fs.writeFileSync(outputPath, JSON.stringify(mergedSettings, null, 2));
  console.log(
    `Created/updated ESLint + Prettier project settings at: ${outputPath}`,
  );
};

// Run the script
if (require.main === module) {
  createESLintPrettierProjectSettings();
}

module.exports = createESLintPrettierProjectSettings;
