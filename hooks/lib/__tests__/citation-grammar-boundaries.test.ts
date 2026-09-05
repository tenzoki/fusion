/**
 * Where a citation token STARTS AND STOPS, and which directories a bare name
 * can resolve to — the two grammar boundaries repaired on 2026-08-31 against
 * 260831-2119_*_the-bare-record-tail-class-admits-a-full-stop-so-a-citation-ending-a-sentence-dangles.md
 * and
 * 260831-2120_*_an-archive-sweep-directory-is-in-no-index-so-a-citation-naming-one-dangles.md.
 *
 * The two blocks after them cover the exemptions that read the token's own
 * neighbourhood: the `foo` word test, and the `foreign:<project>:` qualifier.
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

  // The rows above are all `bare-record`, and only `REC_RE` admits a bracket, so
  // the stop derived from ITS tail class is reachable from no probe there.
  it("stops before the stop on a bracket-marked store-prefixed token, `fix` included", () => {
    const [hit] = toks(wb, "see shared/issues/260519-0438[o].");
    expect([hit.token, hit.kind]).toEqual(["shared/issues/260519-0438[o]", "record"]);
    expect(hit.fix).not.toContain("[o].");
  });

  // A Circle record carries no greedy tail: what refused the sentence's stop was
  // its trailing lookahead, and the token was not reported at all.
  it("reads a Circle-record citation that ends a sentence, and gives no `.md` back", () => {
    const hit = toks(wb, `see circles/${LIVE}/_t_circle.md.`);
    expect(hit.map((h) => [h.token, h.kind, h.status])).toEqual([
      [`circles/${LIVE}/_t_circle.md`, "circle-record", "store-prefixed"],
    ]);
    expect(toks(wb, `see circles/${LIVE}/_t_circle.mdx here`)).toEqual([]);
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

describe("the fabricated-name exemption reads a word, not a substring", () => {
  const wb = scratch();
  // [line, the reason the one token carries, or null when it must be judged]
  const rows: [string, string | null][] = [
    ["see shared/issues/260819-0836_o_the-templates-footer-stub-stands.md", null],
    ["see shared/issues/260101-0000_o_foo.md", "fabricated-name"],
    // `_` delimits a slug word, so the placeholder is exempt behind a marker too
    ["see 260811-1534_i_foo.md", "fabricated-name"],
  ];
  for (const [text, reason] of rows) {
    it(`${reason ?? "judges"}: ${text}`, () => {
      const [hit] = toks(wb, text);
      expect(hit.reason).toBe(reason ?? undefined);
      expect(hit.status).toBe(reason ? "exempt" : "store-prefixed");
    });
  }
});

describe("a citation the writer qualified as another project's is exempt, not dangling", () => {
  const wb = scratch();
  const FOREIGN = "260905-2054-reconciliation.md";

  it("exempts the qualified token and resolves nothing", () => {
    const [hit] = toks(wb, `its Source line names foreign:menue-rs:${FOREIGN}`);
    expect([hit.token, hit.status, hit.reason]).toEqual([FOREIGN, "exempt", "foreign-record"]);
    expect(hit.matches).toEqual([]);
  });

  it("dangles without it — the writer's marker decides, never the name", () => {
    expect(toks(wb, `its Source line names ${FOREIGN}`).map((h) => [h.status, h.reason])).toEqual([
      ["dangling", undefined],
    ]);
  });

  // The property that separates it from `fenced-code`: a foreign path is not
  // this project's to respell, and its sweep will never move that store segment.
  it("reaches the shape-decided verdict too, so no store-prefixed row survives it", () => {
    const path = `shared/history/${FOREIGN}`;
    expect(toks(wb, `see foreign:menue-rs:${path}`).map((h) => [h.status, h.reason])).toEqual([
      ["exempt", "foreign-record"],
    ]);
    expect(toks(wb, `see ${path}`).map((h) => h.status)).toEqual(["store-prefixed"]);
  });

  // Both segments are required. A bare `<word>:` in front of a stamp is the
  // legacy `I:`/`D:`/`CR:` task-id spelling, 214 of them in this corpus, every
  // one naming a LOCAL record.
  it("needs both segments, and the keyword whole", () => {
    const near = [`I:`, `menue-rs:`, `notforeign:menue-rs:`, `foreign:`];
    for (const p of near) expect(toks(wb, `see ${p}${FOREIGN}`)[0].reason, p).toBeUndefined();
  });

  // The residual, pinned rather than left to be claimed away later: no property
  // of the text separates a foreign record from a local one a writer mislabelled.
  it("exempts a qualified token that names a record sitting in THIS workbench", () => {
    const [hit] = toks(wb, `see foreign:elsewhere:${RECORD}`);
    expect([hit.status, hit.reason]).toEqual(["exempt", "foreign-record"]);
  });
});
