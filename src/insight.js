const { WCAG_MAPPING } = require("./mapping");

function generateInsights(artifacts) {
  const insights = [];

  for (const [section, metrics] of Object.entries(artifacts)) {
    for (const [key, value] of Object.entries(metrics)) {

      const rule = WCAG_MAPPING[key];
      if (!rule) continue;

      let isProblem = false;

      if (typeof value === "boolean" && value === false) isProblem = true;

      if (typeof value === "number") {
        if (key === "sentenceAverageLength" && value > 20) isProblem = true;
        if (key === "animationCount" && value > 5) isProblem = true;
        if (key === "videosWithCaptionsRatio" && value < 1) isProblem = true;
        if (key === "h1Count" && value !== 1) isProblem = true;
      }

      if (isProblem) {
        insights.push({
          section,
          metric: key,
          value,
          problem: rule.issue,
          suggestion: rule.fix,
          mapping: {
            wcag: rule.wcag,
            iso: rule.iso
          }
        });
      }
    }
  }

  return insights;
}

module.exports = { generateInsights };