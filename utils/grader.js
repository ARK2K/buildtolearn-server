const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const puppeteer = require("puppeteer");

/**
 * Level 1: Compare HTML structure
 */
function gradeHTMLStructure(expectedHTML, submittedHTML) {
  const expectedDOM = new JSDOM(expectedHTML).window.document.body;
  const submittedDOM = new JSDOM(submittedHTML).window.document.body;

  let total = 0;
  let matched = 0;

  function compareNodes(expectedNode, submittedNode) {
    if (!expectedNode || !submittedNode) return;

    if (expectedNode.nodeType === 1) {
      total++;
      if (
        expectedNode.tagName === submittedNode.tagName &&
        expectedNode.children.length === submittedNode.children.length
      ) {
        matched++;
      }
      for (let i = 0; i < expectedNode.children.length; i++) {
        compareNodes(expectedNode.children[i], submittedNode.children[i]);
      }
    }
  }

  compareNodes(expectedDOM, submittedDOM);

  const structureScore = total > 0 ? (matched / total) * 40 : 0; // Level 1 = 40%
  return { structureScore, totalElements: total, matchedElements: matched };
}

/**
 * Level 2: Compare basic CSS rules
 */
function gradeCSSRules(expectedCSSRules, submittedHTML, submittedCSS) {
  const dom = new JSDOM(
    `<!DOCTYPE html><html><head><style>${submittedCSS}</style></head><body>${submittedHTML}</body></html>`,
    { runScripts: "outside-only" }
  );
  const document = dom.window.document;

  let matched = 0;
  let total = expectedCSSRules.length;

  expectedCSSRules.forEach((rule) => {
    const element = document.querySelector(rule.selector);
    if (!element) return;

    const computed = dom.window.getComputedStyle(element);
    let allMatched = true;
    for (const [prop, expectedVal] of Object.entries(rule.styles)) {
      const submittedVal = computed.getPropertyValue(prop).trim();
      if (submittedVal !== expectedVal) {
        allMatched = false;
        break;
      }
    }
    if (allMatched) matched++;
  });

  const cssScore = total > 0 ? (matched / total) * 30 : 0; // Level 2 = 30%
  return { cssScore, matchedRules: matched, totalRules: total };
}

/**
 * Level 3: JavaScript behavior testing with Puppeteer
 * testCases = [{ action, selector, value?, expectedSelector, expectedValue }]
 */
async function gradeJSBehavior(submittedHTML, submittedCSS, submittedJS, testCases) {
  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();

  await page.setContent(`
    <html>
      <head><style>${submittedCSS}</style></head>
      <body>${submittedHTML}<script>${submittedJS}</script></body>
    </html>
  `);

  let passCount = 0;

  for (let test of testCases) {
    if (test.action === "click") {
      await page.click(test.selector);
    }
    if (test.action === "type") {
      await page.type(test.selector, test.value);
    }
    if (test.action === "waitFor") {
      await page.waitForSelector(test.selector);
    }

    const result = await page.evaluate((sel) => {
      const el = document.querySelector(sel);
      return el ? el.textContent.trim() : null;
    }, test.expectedSelector);

    if (result === test.expectedValue) {
      passCount++;
    }
  }

  await browser.close();

  const jsScore = testCases.length > 0 ? (passCount / testCases.length) * 30 : 0; // Level 3 = 30%
  return { jsScore, passedTests: passCount, totalTests: testCases.length };
}

/**
 * Final grading function – combines Level 1 + 2 + 3
 */
async function gradeSubmission({
  expectedHTML,
  expectedCSSRules,
  submittedHTML,
  submittedCSS,
  submittedJS,
  behaviorTests = []
}) {
  const { structureScore, totalElements, matchedElements } =
    gradeHTMLStructure(expectedHTML, submittedHTML);

  const { cssScore, matchedRules, totalRules } =
    gradeCSSRules(expectedCSSRules, submittedHTML, submittedCSS);

  const { jsScore, passedTests, totalTests } = await gradeJSBehavior(
    submittedHTML,
    submittedCSS,
    submittedJS,
    behaviorTests
  );

  const finalScore = structureScore + cssScore + jsScore;

  return {
    score: Math.round(finalScore),
    breakdown: {
      html: { matchedElements, totalElements, score: Math.round(structureScore) },
      css: { matchedRules, totalRules, score: Math.round(cssScore) },
      js: { passedTests, totalTests, score: Math.round(jsScore) }
    }
  };
}

module.exports = {
  gradeSubmission
};