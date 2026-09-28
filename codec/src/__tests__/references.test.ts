// ---------------------------------------------------------------------------
// The reference contract: every citation form the conventions name, the two
// structured shapes, the store-prefixed refusal, and the render round trip.
// ---------------------------------------------------------------------------

import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { COMMON_SCHEMA, citationPatterns, parseReference, renderReference, type Reference } from "../references.js";

const WB = "5d6d15ba-5b44-45b2-8aa2-39dd3bf82964";
const REC = "591d5bf4-2219-46b6-a0d3-cbdb28d6af16";
const SHA = "sha256:" + "0".repeat(64);

/** The closed `artefact_ref.kind` enum, read from the schema so the test never carries a second copy of the list. */
function artefactKindEnum(): string[] {
  const defs = (JSON.parse(readFileSync(COMMON_SCHEMA, "utf-8")) as { $defs: { artefact_ref: { properties: { kind: { enum: string[] } } } } }).$defs;
  return defs.artefact_ref.properties.kind.enum;
}

function parsed(input: unknown): Reference {
  const r = parseReference(input);
  expect(r.ok, JSON.stringify(r)).toBe(true);
  if (!r.ok) throw new Error("unreachable");
  return r.reference;
}

function refused(input: unknown, reason: string): string {
  const r = parseReference(input);
  expect(r.ok, `expected a refusal for ${JSON.stringify(input)}`).toBe(false);
  if (r.ok) throw new Error("unreachable");
  expect(r.class).toBe("schema-invalid");
  expect(r.reason).toBe(reason);
  return r.detail;
}

describe("the patterns are the schema's", () => {
  it("reads legacy_marker_citation, legacy_markerless_citation and legacy_foreign_citation from common.schema.json", () => {
    const defs = (JSON.parse(readFileSync(COMMON_SCHEMA, "utf-8")) as { $defs: Record<string, { pattern: string }> }).$defs;
    const p = citationPatterns();
    expect(p.marker.source).toBe(defs["legacy_marker_citation"]!.pattern);
    expect(p.markerless.source).toBe(defs["legacy_markerless_citation"]!.pattern);
    expect(p.foreign.source).toBe(defs["legacy_foreign_citation"]!.pattern);
  });
});

describe("parseReference: the three prose forms", () => {
  it("a storeless basename with the marker wildcarded", () => {
    expect(parsed("260928-1341_*_does-the-json-codec-live-in-its-own-package-or-under-hooks.md")).toEqual({
      kind: "legacy-marker",
      basename: "260928-1341_*_does-the-json-codec-live-in-its-own-package-or-under-hooks.md",
      stamp: "260928-1341",
      marker: "*",
      topic: "does-the-json-codec-live-in-its-own-package-or-under-hooks",
    });
  });

  it.each(["o", "p", "c", "d", "a", "i", "s"])("a concrete marker _%s_ is a spelling, not a state", (m) => {
    const ref = parsed(`260922-1059_${m}_is-a-record-in-issues-a-candidate-or-an-admitted-work-item.md`);
    expect(ref).toMatchObject({ kind: "legacy-marker", marker: m, stamp: "260922-1059" });
  });

  it("a markerless basename: a work package, a review, an analysis", () => {
    expect(parsed("260928-1200-parser-fix.md")).toEqual({ kind: "legacy-markerless", basename: "260928-1200-parser-fix.md", stamp: "260928-1200", topic: "parser-fix" });
    expect(parsed("260905-2054-reviewer-codec-schemas.md")).toMatchObject({ kind: "legacy-markerless", topic: "reviewer-codec-schemas" });
    expect(parsed("260927-2304-fusion-dual-host-design-review.md")).toMatchObject({ kind: "legacy-markerless" });
  });

  it("foreign:<project>:<citation> with either inner form", () => {
    expect(parsed("foreign:menue-rs:260905-2054-reconciliation.md")).toEqual({
      kind: "foreign",
      project: "menue-rs",
      citation: { kind: "legacy-markerless", basename: "260905-2054-reconciliation.md", stamp: "260905-2054", topic: "reconciliation" },
    });
    expect(parsed("foreign:prior:260922-1114_*_does-the-transition-windows-legacy-read-live-at-one-site-per-runtime.md")).toMatchObject({
      kind: "foreign",
      project: "prior",
      citation: { kind: "legacy-marker", marker: "*" },
    });
  });
});

describe("parseReference: the structured shapes", () => {
  it("record_ref with and without revision and display", () => {
    expect(parsed({ workbench_id: WB, record_id: REC })).toEqual({ kind: "record", ref: { workbench_id: WB, record_id: REC } });
    expect(parsed({ workbench_id: WB, record_id: REC, revision: SHA, display: "260928-1200-parser-fix.md" })).toEqual({
      kind: "record",
      ref: { workbench_id: WB, record_id: REC, revision: SHA, display: "260928-1200-parser-fix.md" },
    });
  });

  it("artefact_ref", () => {
    expect(parsed({ path: "work-packages/260928-1200-parser-fix/260928-1200-parser-fix.md", sha256: SHA, kind: "other" })).toEqual({
      kind: "artefact",
      ref: { path: "work-packages/260928-1200-parser-fix/260928-1200-parser-fix.md", sha256: SHA, kind: "other" },
    });
  });

  it.each(artefactKindEnum())("artefact_ref.kind %s, inside the schema's closed enum, passes", (kind) => {
    expect(parsed({ path: "shared/reviews/260905-2054-reviewer-topic.md", sha256: SHA, kind })).toMatchObject({ kind: "artefact", ref: { kind } });
  });

  it("artefact_ref.kind outside the closed enum is refused, the kind named: markdown is a format, not a kind", () => {
    const detail = refused({ path: "shared/reviews/260905-2054-reviewer-topic.md", sha256: SHA, kind: "markdown" }, "malformed-object");
    expect(detail).toContain('"markdown"');
    expect(detail).toContain("closed artefact-kind vocabulary");
  });

  it("the structured foreign_ref object", () => {
    expect(parsed({ project: "menue-rs", citation: "260905-2054-reconciliation.md" })).toEqual({
      kind: "foreign",
      project: "menue-rs",
      citation: { kind: "legacy-markerless", basename: "260905-2054-reconciliation.md", stamp: "260905-2054", topic: "reconciliation" },
    });
  });

  it("refuses a malformed object with the field named", () => {
    expect(refused({ workbench_id: "not-a-uuid", record_id: REC }, "malformed-object")).toContain("workbench_id");
    expect(refused({ workbench_id: WB, record_id: REC, revision: "abc" }, "malformed-object")).toContain("revision");
    expect(refused({ workbench_id: WB, record_id: REC, extra: 1 }, "malformed-object")).toContain("extra");
    expect(refused({ path: "/Users/kai/x.md", sha256: SHA, kind: "other" }, "malformed-object")).toContain("path");
    expect(refused({ path: "../x.md", sha256: SHA, kind: "other" }, "malformed-object")).toContain("path");
    expect(refused({ path: "a.md", sha256: "0".repeat(64), kind: "other" }, "malformed-object")).toContain("sha256");
    expect(refused({ path: "a.md", sha256: SHA, kind: "Markdown" }, "malformed-object")).toContain("kind");
    expect(refused({ project: "a:b", citation: "260905-2054-reconciliation.md" }, "malformed-object")).toContain("project");
    expect(refused({ project: "menue-rs", citation: "shared/issues/260905-2054-reconciliation.md" }, "store-prefixed")).toContain("shared/issues");
    expect(refused({ id: 1 }, "malformed-object")).toContain("neither");
    refused(null, "unrecognised");
    refused(42, "unrecognised");
  });
});

describe("parseReference refuses", () => {
  it("a store-prefixed citation, with the typed reason", () => {
    expect(refused("shared/issues/260928-1200_*_parser-fix.md", "store-prefixed")).toContain("storeless basename");
    refused("shared/decisions/260928-1341_o_topic.md", "store-prefixed");
    refused("work-packages/260928-1200-parser-fix/260928-1200-parser-fix.md", "store-prefixed");
    refused("archive/issues/260928-1200_c_parser-fix.md", "store-prefixed");
    refused("shared\\issues\\260928-1200_*_parser-fix.md", "store-prefixed");
    refused("foreign:menue-rs:shared/issues/260905-2054-reconciliation.md", "store-prefixed");
  });

  it("a bare stamp: it names no file", () => {
    expect(refused("260928-1200", "bare-stamp")).toContain("stamp");
  });

  it("anything else", () => {
    refused("parser-fix.md", "unrecognised");
    refused("260928-1200_x_topic.md", "unrecognised");
    refused("260928-1200-topic", "unrecognised");
    refused("foreign:menue-rs", "unrecognised");
    refused("foreign::260905-2054-reconciliation.md", "unrecognised");
    refused("foreign:a:foreign:b:260905-2054-reconciliation.md", "unrecognised");
    refused("", "unrecognised");
  });
});

describe("renderReference round trips", () => {
  it.each([
    "260928-1341_*_does-the-json-codec-live-in-its-own-package-or-under-hooks.md",
    "260922-1059_c_is-a-record-in-issues-a-candidate-or-an-admitted-work-item.md",
    "260928-1200-parser-fix.md",
    "foreign:menue-rs:260905-2054-reconciliation.md",
    "foreign:prior:260922-1114_*_topic.md",
  ])("%s renders back to itself", (text) => {
    const ref = parsed(text);
    expect(renderReference(ref)).toBe(text);
    expect(parsed(renderReference(ref))).toEqual(ref);
  });

  it("an artefact_ref renders as its path", () => {
    const ref = parsed({ path: "shared/reviews/260905-2054-reviewer-topic.md", sha256: SHA, kind: "review" });
    expect(renderReference(ref)).toBe("shared/reviews/260905-2054-reviewer-topic.md");
  });

  it("a record_ref renders its display, which parses as the citation it is", () => {
    const ref = parsed({ workbench_id: WB, record_id: REC, display: "260928-1341_*_does-the-json-codec-live-in-its-own-package-or-under-hooks.md" });
    const text = renderReference(ref);
    expect(text).toBe("260928-1341_*_does-the-json-codec-live-in-its-own-package-or-under-hooks.md");
    expect(parsed(text)).toMatchObject({ kind: "legacy-marker", stamp: "260928-1341", marker: "*" });
  });

  it("a record_ref without a display renders its record id and never invents a basename", () => {
    expect(renderReference(parsed({ workbench_id: WB, record_id: REC }))).toBe(REC);
  });
});
