/**
 * Where a citation token STARTS AND STOPS, and which directories a bare name
 * can resolve to — the two grammar boundaries repaired on 2026-08-31 against
 * 260831-2119_*_the-bare-record-tail-class-admits-a-full-stop-so-a-citation-ending-a-sentence-dangles.md
 * and
 * 260831-2120_*_an-archive-sweep-directory-is-in-no-index-so-a-citation-naming-one-dangles.md.
 *
 * Every case runs `createScanner()` over a scratch workbench, so none of it
 * depends on this repository's own tree — the tail rows are the probe table the
 * plan was written against, and they are here because a naive removal of `.`
 * from the tail class would pass the sentence-stop case and silently break the
 * ASCII ellipsis.
 */
import { describe, it, expect } from "vitest";
import { mkdirSync, mkdtempSync, realpathSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { createScanner, type CitationHit } from "../citation-scan.js";

const SWEEP = "260817-1907-safe-cleanup-scoped";
const SWEPT = "260810-1200-swept-circle";
const LIVE = "260820-0900-live-circle";
const RECORD = "260819-1645_o_what-defines-the-corpus.md";

/** A workbench with one record, one live Circle, and one Circle inside one sweep. */
function scratch(): string {
  const wb = join(realpathSync(mkdtempSync(join(tmpdir(), "grammar-"))), "fusion-workbench");
  mkdirSync(join(wb, "shared", "history"), { recursive: true });
  mkdirSync(join(wb, "circles", LIVE), { recursive: true });
  mkdirSync(join(wb, "archive", SWEEP, "circles", SWEPT), { recursive: true });
  writeFileSync(join(wb, ".fusion-setup"), "{}");
  writeFileSync(join(wb, "shared", "history", RECORD), "x");
  return wb;
}

/** Every token one line of prose produces, in order. */
function toks(wb: string, text: string): CitationHit[] {
  return createScanner(wb).scanCitationTokens("shared/history/260101-0101-probe.md", [{ line: 1, text }]);
}

describe("a record token stops at a word, never on the sentence's full stop", () => {
  // the plan's eight probes: [line, the one token it must produce]
  const rows: [string, string][] = [
    ["see 260819-1645_*_…corpus…md", "260819-1645_*_…corpus…md"],
    ["see 260819-1645_*_…corpus…md.", "260819-1645_*_…corpus…md"],
    ["truncated 260819-1645_o_", "260819-1645_o_"],
    ["truncated 260819-1645_d", "260819-1645_d"],
    ["truncated 260819-1645_…", "260819-1645_…"],
    ["ASCII ellipsis tail 260819-1645_*_what-defines...", "260819-1645_*_what-defines..."],
    ["Unicode ellipsis then stop 260819-1645_*_what-defines….", "260819-1645_*_what-defines…"],
    ["ASCII ellipsis then stop 260819-1645_*_what-defines....", "260819-1645_*_what-defines...."],
  ];
  const wb = scratch();
  for (const [text, token] of rows) {
    it(`reads one token out of: ${text}`, () => {
      const hits = toks(wb, text);
      expect(hits.map((h) => h.token)).toEqual([token]);
      expect(hits[0].kind).toBe("bare-record");
    });
  }

  it("resolves the citation that ends a sentence — the whole point of the trim", () => {
    const hits = toks(wb, "the corpus is 260819-1645_*_…corpus…md.");
    expect(hits[0].status).toBe("resolved");
    expect(hits[0].matches).toEqual([`shared/history/${RECORD}`]);
  });

  it("trims one stop and not a run, which is stated as a limit rather than widened", () => {
    expect(toks(wb, "see 260819-1645_o_slug..").map((h) => h.token)).toEqual(["260819-1645_o_slug.."]);
  });
});

describe("a bare directory name resolves to a Circle or to the archive sweep itself", () => {
  const wb = scratch();

  it("resolves a sweep to its own path and never to a Circle path inside it", () => {
    const hits = toks(wb, `moved by ${SWEEP} last week`);
    expect(hits.map((h) => [h.token, h.kind, h.status])).toEqual([[SWEEP, "stamp-name", "resolved"]]);
    expect(hits[0].matches).toEqual([`archive/${SWEEP}`]);
  });

  it("leaves the live and the swept Circle resolving exactly where they sit", () => {
    expect(toks(wb, `in ${LIVE}`)[0].matches).toEqual([`circles/${LIVE}`]);
    expect(toks(wb, `in ${SWEPT}`)[0].matches).toEqual([`archive/${SWEEP}/circles/${SWEPT}`]);
  });

  it("reports a name-shape collision as ambiguous, carrying both paths", () => {
    const wb2 = scratch();
    mkdirSync(join(wb2, "archive", LIVE), { recursive: true });
    const hit = toks(wb2, `the name ${LIVE} is held twice`)[0];
    expect(hit.status).toBe("ambiguous");
    expect(hit.matches.sort()).toEqual([`archive/${LIVE}`, `circles/${LIVE}`]);
  });

  it("still produces no token at all for a sweep cited as a path", () => {
    expect(toks(wb, `see archive/${SWEEP}/ for the move`)).toEqual([]);
  });
});
