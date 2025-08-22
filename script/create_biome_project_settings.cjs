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

const createBiomeProjectSettings = () => {
  const settingsTemplate = {
    languages: {
      TypeScript: {
        language_servers: [
          "!typescript-language-server",
          "!eslint",
          "biome",
          "vtsls",
          "...",
        ],
        formatter: {
          language_server: {
            name: "biome",
          },
        },
        code_actions_on_format: {
          "source.fixAll.biome": true,
          "source.organizeImports.biome": true,
        },
        prettier: {
          allowed: false,
        },
      },
      TSX: {
        language_servers: [
          "!typescript-language-server",
          "!eslint",
          "biome",
          "vtsls",
          "...",
        ],
        formatter: {
          language_server: {
            name: "biome",
          },
        },
        code_actions_on_format: {
          "source.fixAll.biome": true,
          "source.organizeImports.biome": true,
        },
        prettier: {
          allowed: false,
        },
      },
      JavaScript: {
        language_servers: ["!eslint", "biome", "vtsls", "..."],
        formatter: {
          language_server: {
            name: "biome",
          },
        },
        code_actions_on_format: {
          "source.fixAll.biome": true,
          "source.organizeImports.biome": true,
        },
        prettier: {
          allowed: false,
        },
      },
    },
    lsp: {
      biome: {
        settings: {
          require_config_file: true,
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
        `Found existing settings, merging with Biome configuration...`,
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
  console.log(`Created/updated Biome project settings at: ${outputPath}`);
};

// Run the script
if (require.main === module) {
  createBiomeProjectSettings();
}

module.exports = createBiomeProjectSettings;
