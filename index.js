const { analyzePage } = require("./src/analyzer");
const { calculateScores } = require("./src/scorer");
const { generateInsights } = require("./src/insight");

const fs = require("fs").promises;

const url = process.argv[2];

if (!url) {
  console.log("❌ Please provide a URL");
  process.exit(1);
}

analyzePage(url).then(async (result) => {
  const scores = calculateScores(result.artifacts);
  const insights = generateInsights(result.artifacts);

  const finalOutput = {
    url,
    scores,
    insights,
    artifacts: result.artifacts
  };

  const output = JSON.stringify(finalOutput, null, 2);

  console.log(output);

  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const filename = `analysis-${timestamp}.json`;

  await fs.writeFile(filename, output, "utf8");

  console.log(`✅ Saved to ${filename}`);
}).catch(err => {
  console.error("❌ Error:", err.message);
});
