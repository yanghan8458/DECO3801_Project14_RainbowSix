
function calculateScores(analysis) {
  const details = []; // store each category as a "card" for the frontend
  let totalScore = 0;

  // helper function to decide the color/status for the frontend
  const getStatus = (score) => {
    if (score >= 90) return "good";     // frontend can show green
    if (score >= 60) return "warning";  // frontend can show yellow
    return "poor";                      // frontend can show red
  };

  // 1. check language complexity
  const avgSentence = analysis.language.avgSentenceLength;
  let languageScore = 100;
  let languageInsight = null; // null means no error
  
  if (avgSentence > 20) {
    languageScore -= 40;
    languageInsight = {
      issue: "Sentences are too long (average > 20 words). This increases cognitive load.",
      suggestion: "Break long sentences into shorter ones or use bullet points.",
      mapping: {
        wcag: "WCAG 3.1 Readable - Make text content readable and understandable.",
        iso9241: "Efficiency - Reduce reading cognitive load so users get info faster."
      }
    };
  }
  
  languageScore = Math.max(0, languageScore);
  totalScore += languageScore;
  
  // bundle score and insight together for the frontend
  details.push({
    category: "Language Complexity",
    score: languageScore,
    status: getStatus(languageScore),
    insight: languageInsight
  });

  // 2. check layout density
  const totalElements = analysis.layout.totalElements;
  let layoutScore = 100;
  let layoutInsight = null;
  
  if (totalElements > 800) {
    layoutScore -= 30;
    layoutInsight = {
      issue: "Too many elements on the page. High density distracts users.",
      suggestion: "Remove unnecessary decorative elements and focus on core functions.",
      mapping: {
        wcag: "WCAG 1.4.8 Visual Presentation - Provide readable typography for users with cognitive disabilities.",
        iso9241: "Effectiveness - Reduce visual clutter so users can find what they need."
      }
    };
  }
  
  layoutScore = Math.max(0, layoutScore);
  totalScore += layoutScore;
  
  details.push({
    category: "Layout Density",
    score: layoutScore,
    status: getStatus(layoutScore),
    insight: layoutInsight
  });

  // 3. check animations
  const animations = analysis.animation.animationCount;
  let animationScore = 100;
  let animationInsight = null;
  
  if (animations > 5) {
    animationScore -= 50;
    animationInsight = {
      issue: "More than 5 moving elements detected. This can easily distract users.",
      suggestion: "Provide a 'pause animation' button or reduce auto-playing media.",
      mapping: {
        wcag: "WCAG 2.2.2 Pause, Stop, Hide - Moving or scrolling elements should not distract users.",
        iso9241: "Satisfaction - Avoid causing user anxiety or discomfort."
      }
    };
  }
  
  animationScore = Math.max(0, animationScore);
  totalScore += animationScore;
  
  details.push({
    category: "Animation Usage",
    score: animationScore,
    status: getStatus(animationScore),
    insight: animationInsight
  });

  // 4. check visual hierarchy & structure
  const maxDepth = analysis.navigation.maxDepth;
  let hierarchyScore = 100;
  let hierarchyInsight = null;
  
  if (maxDepth > 3) {
    hierarchyScore -= 20;
    hierarchyInsight = {
      issue: "Navigation is nested too deeply (more than 3 levels). Users might get lost.",
      suggestion: "Flatten the navigation structure and provide clear breadcrumbs.",
      mapping: {
        wcag: "WCAG 2.4 Navigable - Provide ways to help users navigate and find content.",
        iso9241: "Efficiency - Reduce short-term memory load."
      }
    };
  }
  
  hierarchyScore = Math.max(0, hierarchyScore);
  totalScore += hierarchyScore;
  
  details.push({
    category: "Structure & Navigation",
    score: hierarchyScore,
    status: getStatus(hierarchyScore),
    insight: hierarchyInsight
  });

  // calculate the final average score
  const finalScore = Math.round(totalScore / 4);

  // return a very clean structure for the frontend
  return {
    overallScore: finalScore,
    overallStatus: getStatus(finalScore),
    details: details
  };
}

module.exports = { calculateScores };