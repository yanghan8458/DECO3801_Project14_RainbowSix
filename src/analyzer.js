const puppeteer = require("puppeteer");

async function analyzePage(url) {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  await page.goto(url, { waitUntil: "networkidle2", timeout: 0 });

  const data = await page.evaluate(() => {

    // ===== 元素提取 =====
    function extractElements() {
      return {
        headings: [...document.querySelectorAll("h1,h2,h3,h4,h5,h6")]
          .map(el => el.innerText.trim())
          .filter(t => t),

        paragraphs: [...document.querySelectorAll("p")]
          .map(el => el.innerText.trim())
          .filter(t => t),

        links: [...document.querySelectorAll("a")]
          .map(el => el.href),

        buttons: [...document.querySelectorAll("button")]
          .map(el => el.innerText.trim()),

        images: [...document.querySelectorAll("img")]
          .map(el => el.src)
      };
    }

    // ===== DOM结构 =====
    function extractDOM(node, depth = 0) {
      if (!node || depth > 5) return null;

      return {
        tag: node.tagName,
        children: [...node.children].slice(0, 10).map(child =>
          extractDOM(child, depth + 1)
        )
      };
    }

    // ===== 统计 + Cognitive Metrics =====
    function extractStats() {
      const text = document.body.innerText || "";
      const words = text.split(/\s+/).filter(Boolean);
      const sentences = text.split(/[.!?]/).filter(s => s.trim().length > 0);

      const headings = document.querySelectorAll("h1,h2,h3,h4,h5,h6");
      const paragraphs = document.querySelectorAll("p");
      const links = document.querySelectorAll("a");
      const buttons = document.querySelectorAll("button");
      const images = document.querySelectorAll("img");

      const allElements = document.querySelectorAll("*");

      // ===== Language Complexity =====
      const avgSentenceLength = sentences.length ? words.length / sentences.length : 0;

      // ===== Layout Density =====
      const layoutDensity = allElements.length;

      // ===== Navigation Clarity =====
      const navMenus = document.querySelectorAll("nav, ul, ol").length;
      const navDepth = Math.max(
        ...Array.from(document.querySelectorAll("ul")).map(ul => ul.children.length),
        0
      );

      // ===== Visual Hierarchy =====
      const headingLevels = [...headings].map(h =>
        parseInt(h.tagName.substring(1))
      );

      const hierarchyScore = headingLevels.length
        ? Math.max(...headingLevels) - Math.min(...headingLevels)
        : 0;

      // ===== Animation & Distraction =====
      const animationCount = [...allElements].filter(el => {
        const style = window.getComputedStyle(el);
        return style.animationName !== "none" ||
               style.transitionDuration !== "0s";
      }).length;

      // ===== Spacing & Chunking =====
      const avgParagraphLength = paragraphs.length
        ? words.length / paragraphs.length
        : 0;

      // ===== Consistency =====
      const buttonClasses = [...buttons].map(btn => btn.className);
      const consistencyScore = new Set(buttonClasses).size;

      // ===== Form Complexity =====
      const inputs = document.querySelectorAll("input, textarea, select");
      const formFieldCount = inputs.length;

      // ===== Error Prevention =====
      const requiredFields = document.querySelectorAll("[required]").length;
      const hasErrorMessage = text.toLowerCase().includes("error");

      return {
        // 基础统计
        headingCount: headings.length,
        paragraphCount: paragraphs.length,
        linkCount: links.length,
        buttonCount: buttons.length,
        imageCount: images.length,

        wordCount: words.length,
        avgSentenceLength,

        interactionLoad: links.length + buttons.length,

        layoutDensity,
        navigationMenuCount: navMenus,
        navigationDepth: navDepth,
        visualHierarchyScore: hierarchyScore,
        avgParagraphLength,
        consistencyScore,
        formFieldCount,
        requiredFieldCount: requiredFields,
        hasErrorMessage,
        animationCount
      };
    }

    return {
      elements: extractElements(),
      stats: extractStats(),
      domTree: extractDOM(document.body)
    };
  });

  await browser.close();

  return {
    url,
    ...data
  };
}

module.exports = { analyzePage };
