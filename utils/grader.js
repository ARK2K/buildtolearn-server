const jsdom = require("jsdom");
const { JSDOM } = jsdom;

/**
 * Compare HTML structure (Level 1)
 */
function gradeHTMLStructure(expectedHTML, submittedHTML) {
  const expectedDOM = new JSDOM(expectedHTML).window.document.body;
  const submittedDOM = new JSDOM(submittedHTML).window.document.body;

  let total = 0;
  let matched = 0;

  function compareNodes(expectedNode, submittedNode) {
    if (!expectedNode || !submittedNode) return;

    // Count only elements, skip text nodes
    if (expectedNode.nodeType === 1) {
      total++;

      if (
        expectedNode.tagName === submittedNode.tagName &&
        expectedNode.children.length === submittedNode.children.length
      ) {
        matched++;
      }

      // Recursively compare child nodes
      for (let i = 0; i < expectedNode.children.length; i++) {
        compareNodes(expectedNode.children[i], submittedNode.children[i]);
      }
    }
  }

  compareNodes(expectedDOM, submittedDOM);

  const structureScore = total > 0 ? (matched / total) * 50 : 0;
  return { structureScore, totalElements: total, matchedElements: matched };
}

/**
 * Compare basic CSS rules (Level 2)
 */
function gradeCSSRules(expectedCSSRules, submittedHTML, submittedCSS) {
  const dom = new JSDOM(`<!DOCTYPE html><html><head><style>${submittedCSS}</style></head><body>${submittedHTML}</body></html>`, { runScripts: "outside-only" });
  const document = dom.window.document;

  let matched = 0;
  let total = expectedCSSRules.length;

  expectedCSSRules.forEach(rule => {
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

  const cssScore = total > 0 ? (matched / total) * 50 : 0;
  return { cssScore, matchedRules: matched, totalRules: total };
}

/**
 * Final grading function – combines HTML + CSS scoring
 */
function gradeSubmission({ expectedHTML, expectedCSSRules, submittedHTML, submittedCSS }) {
  const { structureScore, totalElements, matchedElements } = gradeHTMLStructure(expectedHTML, submittedHTML);
  const { cssScore, matchedRules, totalRules } = gradeCSSRules(expectedCSSRules, submittedHTML, submittedCSS);

  const finalScore = structureScore + cssScore;

  return {
    score: Math.round(finalScore),
    breakdown: {
      html: { matchedElements, totalElements, score: Math.round(structureScore) },
      css: { matchedRules, totalRules, score: Math.round(cssScore) },
    }
  };
}

module.exports = {
  gradeSubmission
};