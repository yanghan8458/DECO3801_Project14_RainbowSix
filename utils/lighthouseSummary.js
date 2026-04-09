function classifyAudit(audit, message) {
  if (!audit) {
    return null;
  }

  if (audit.scoreDisplayMode === "notApplicable") {
    return {
      status: "not_applicable"
    };
  }

  if (audit.score === 1) {
    return {
      status: "pass"
    };
  }

  return {
    status: "fail",
    title: audit.title,
    note: message
  };
}

function getConfidence(coverageRatio) {
  if (coverageRatio >= 0.75) return "high";
  if (coverageRatio >= 0.4) return "medium";
  return "low";
}

function buildLighthouseSummary(lhr) {
  const trackedAudits = {
    headingOrder: classifyAudit(
      lhr.audits?.["heading-order"],
      "Heading hierarchy may weaken structural clarity and make content harder to scan."
    ),
    linkName: classifyAudit(
      lhr.audits?.["link-name"],
      "Some links may be unclear out of context, which can reduce navigation clarity."
    ),
    label: classifyAudit(
      lhr.audits?.["label"],
      "Some form controls may lack clear labels, increasing interaction effort."
    ),
    imageAlt: classifyAudit(
      lhr.audits?.["image-alt"],
      "Some informative images may lack alternative text."
    ),
    colorContrast: classifyAudit(
      lhr.audits?.["color-contrast"],
      "Insufficient contrast may reduce readability and increase visual effort."
    ),
    htmlHasLang: classifyAudit(
      lhr.audits?.["html-has-lang"],
      "Missing page language metadata can reduce compatibility with assistive technologies."
    ),
    validLang: classifyAudit(
      lhr.audits?.["valid-lang"],
      "Invalid language codes may reduce interpretation accuracy for assistive tools."
    ),
    buttonName: classifyAudit(
      lhr.audits?.["button-name"],
      "Buttons without clear names may reduce action clarity."
    ),
    ariaValidAttr: classifyAudit(
      lhr.audits?.["aria-valid-attr"],
      "Invalid ARIA attributes may reduce accessibility support consistency."
    ),
    ariaValidAttrValue: classifyAudit(
      lhr.audits?.["aria-valid-attr-value"],
      "Invalid ARIA attribute values may weaken assistive technology support."
    )
  };

  const availableChecks = Object.fromEntries(
    Object.entries(trackedAudits).filter(([, value]) => value !== null)
  );

  const trackedAuditCount = Object.keys(trackedAudits).length;
  const availableAuditCount = Object.keys(availableChecks).length;
  const coverageRatio =
    trackedAuditCount > 0 ? availableAuditCount / trackedAuditCount : 0;

  const findings = Object.entries(availableChecks)
    .filter(([, value]) => value.status === "fail")
    .map(([key, value]) => ({
      key,
      title: value.title,
      note: value.note
    }));

  const simplifiedChecks = Object.fromEntries(
    Object.entries(availableChecks).map(([key, value]) => [key, value.status])
  );

  return {
    role: "supporting_reference",
    summary: {
      accessibilityScore: lhr.categories?.accessibility?.score ?? null,
      confidence: getConfidence(coverageRatio),
      availableAuditCount,
      trackedAuditCount,
      coverageRatio: Number(coverageRatio.toFixed(2))
    },
    findings,
    availableChecks: simplifiedChecks
  };
}

module.exports = {
  buildLighthouseSummary
};