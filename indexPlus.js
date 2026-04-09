const { analyzePage } = require("./src/analyzer");
const { calculateScores } = require("./src/scorer");
const { runLighthouseWithPlugin } = require("./utils/lighthouse");
const { buildLighthouseSummary } = require("./utils/lighthouseSummary");

const fs = require("fs").promises;
const path = require("path");

// Get URL and output argument from command line
const url = process.argv[2];
const outputArg = process.argv[3];

// Validate URL
if (!url) {
  console.log("❌ Please provide a URL");
  process.exit(1);
}

// Determine output directory
const outputDir = outputArg
  ? path.resolve(outputArg)
  : path.join(__dirname, "outputs");

analyzePage(url)
  .then(async (result) => {
    if (!result.artifacts) {
      console.error("❌ No artifacts returned");
      process.exit(1);
    }

    // Run Lighthouse with the plugin and build summary
    const lhr = await runLighthouseWithPlugin(url);
    const lighthouseSummary = buildLighthouseSummary(lhr);

    const scoring = calculateScores(result.artifacts);

    const finalOutput = {
      url,
      custom: {
        scores: scoring,
        artifacts: result.artifacts
      },
      lighthouse: lighthouseSummary
    };

    const output = JSON.stringify(finalOutput, null, 2);

    console.log(output);

    // Ensure output directory exists and save the result
    await fs.mkdir(outputDir, { recursive: true });

    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const filename = `analysis-${timestamp}.json`;
    const filePath = path.join(outputDir, filename);

    await fs.writeFile(filePath, output, "utf8");

    console.log(`✅ Saved to ${filename}`);
  })
  .catch((err) => {
    console.error("❌ Error:", err.message);
  });