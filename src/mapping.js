const WCAG_MAPPING = {
  titleExists: {
    wcag: "2.4.2 Page Titled",
    iso: "Effectiveness",
    issue: "Page has no title",
    fix: "Add a meaningful page title"
  },
  h1Count: {
    wcag: "2.4.6 Headings and Labels",
    iso: "Efficiency",
    issue: "Missing or multiple H1 headings",
    fix: "Use one clear H1 heading"
  },
  hasSkipLink: {
    wcag: "2.4.1 Bypass Blocks",
    iso: "Efficiency",
    issue: "No skip navigation link",
    fix: "Add 'Skip to main content'"
  },
  videosWithCaptionsRatio: {
    wcag: "1.2.2 Captions",
    iso: "Effectiveness",
    issue: "Videos missing captions",
    fix: "Provide captions for videos"
  },
  sentenceAverageLength: {
    wcag: "3.1.5 Reading Level",
    iso: "Efficiency",
    issue: "Sentences too long",
    fix: "Shorten sentences"
  },
  animationCount: {
    wcag: "2.2.2 Pause, Stop, Hide",
    iso: "Satisfaction",
    issue: "Too many animations",
    fix: "Reduce or pause animations"
  }
};

module.exports = { WCAG_MAPPING };