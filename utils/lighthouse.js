
// Minimal compatibility wrapper:
// - Avoid top-level require of the ESM-only `lighthouse` and `chrome-launcher` packages.
// - Use dynamic import() inside the async function so CommonJS callers can still use this module.
async function runLighthouseWithPlugin(url) {
  // Load the ESM lighthouse module dynamically
  const lighthouseModule = await import('lighthouse');
  const lighthouse = lighthouseModule.default || lighthouseModule;

  // Load chrome-launcher dynamically as it's ESM-only as well
  const chromeLauncherModule = await import('chrome-launcher');
  const chromeLauncher = chromeLauncherModule.default || chromeLauncherModule;

  const chrome = await chromeLauncher.launch({
    chromeFlags: ['--headless=new', '--no-sandbox'],
  });

  try {
    const options = {
      port: chrome.port,
      output: 'json',
      logLevel: 'info',
    };

    const config = {
      extends: 'lighthouse:default',
      settings: {
        plugins: ['lighthouse-plugin-cognitive'],
        onlyAudits: [
          "heading-order",
          "link-name",
          "label",
          "image-alt",
          "color-contrast",
          "html-has-lang",
          "valid-lang",
          "button-name",
          "aria-valid-attr",
          "aria-valid-attr-value"
        ],
      },
    };

    const runnerResult = await lighthouse(url, options, config);
    const lhr = runnerResult.lhr;

    return lhr;
  } finally {
    await chrome.kill();
  }
}

module.exports = { runLighthouseWithPlugin };