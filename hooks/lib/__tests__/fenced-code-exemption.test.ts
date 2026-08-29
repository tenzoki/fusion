// ---------------------------------------------------------------------------
// The fenced-code-block exemption of the citation scanner.
//
// WHY THIS EXISTS. `scanCitationTokens` judged every line on its own until
// 2026-08-20: the only multi-line construct it recognised was the blockquote,
// and that recognition is a test of one character at the start of one line. A
// verbatim transcript — the shape a record uses when its whole content is that
// some OTHER file spells a citation wrongly — therefore read as a pile of
// broken citations, and the record that reported a defect became a violation
// itself. See the answer at the foot of
// `circles/260819-1645-four-constraints-on-deep-change/issues/260820-0530_*_twenty-six-citations-in-the-corpus-are-statements-rather-than-pointers-and-no-exemption-expresses-that.md`,
// which chose rewriting those records over an allowlist and named the fenced
// block as the one place a verbatim citation may still stand.
//
// WHAT IS ASSERTED HERE, and the third one is the point. That a fence exempts
// its content is the easy half. That a fence STOPS exempting — at its closing
// marker, and at the end of a file it never closed — is the half that decides
// whether this is a gate or a switch, so the unclosed-fence negative control
// below is not a completeness test but the load-bearing one.
//
// The scanner's own doc comment on `fencedContentLines` carries the CommonMark
// citation, the three omissions and the one deliberate departure. This file
// tests behaviour and does not restate the reasoning.
// ---------------------------------------------------------------------------

import { describe, it, expect } from "vitest";
import {
  scanCitationTokens,
  scanRecordCitations,
  fencedContentLines,
  WORKBENCH_PRESENT,
  type CitationHit,
} from "./helpers/citation-scan.ts";

/** A citation that matches nothing on disk, so "judged" is unambiguous. */
const DEAD = "shared/issues/990101-0101_o_no-such-record.md";

/** A markdown document as lines, numbered from 1 the way both callers number. */
const doc = (...text: string[]) => text.map((t, i) => ({ line: i + 1, text: t }));

const scan = (...text: string[]): CitationHit[] => scanCitationTokens("fixture.md", doc(...text));

/** The reason reported for the token on the given 1-based line, or null. */
const reasonAt = (hits: CitationHit[], line: number): string | null =>
  hits.find((h) => h.line === line)?.reason ?? null;

const statusAt = (hits: CitationHit[], line: number): string | undefined =>
  hits.find((h) => h.line === line)?.status;

describe("citation scanner: the fenced-code-block exemption", () => {
  it("exempts a token inside a fence, naming the fence as the reason", () => {
    const hits = scan("prose", "```", `$ grep -r '${DEAD}'`, "```", "more prose");
    expect(statusAt(hits, 3)).toBe("exempt");
    expect(reasonAt(hits, 3)).toBe("fenced-code");
  });

  it("judges a token after a fence has closed", () => {
    const hits = scan("```", "irrelevant", "```", `and then ${DEAD}`);
    expect(statusAt(hits, 4)).not.toBe("exempt");
    expect(reasonAt(hits, 4)).toBeNull();
  });

  it("judges a token after a fence that never closes — the negative control", () => {
    // CommonMark would run this block to the end of the document and exempt
    // both tokens. It does not here, deliberately: a gate that one stray
    // backtick line can switch off for the rest of a file is not a gate.
    const hits = scan("```", `inside, or so the spec would say: ${DEAD}`, `and here too: ${DEAD}`);
    expect(statusAt(hits, 2)).not.toBe("exempt");
    expect(statusAt(hits, 3)).not.toBe("exempt");
    expect(fencedContentLines(doc("```", "a", "b"))).toEqual([false, false, false]);
  });

  it("judges the opening fence's own line and the closing fence's own line", () => {
    // The opening line carries the info string and the closing line carries
    // nothing; neither is content. A citation there is a citation, which is
    // what keeps a sentence from being exempted by the fence it introduces.
    const hits = scan(`\`\`\`${DEAD}`, "content", "```");
    expect(statusAt(hits, 1)).not.toBe("exempt");
    expect(fencedContentLines(doc("```x", "content", "```"))).toEqual([false, true, false]);
  });
});

describe("citation scanner: what opens and closes a fence", () => {
  it("opens on tildes as well as backticks, and does not close on the other marker", () => {
    expect(fencedContentLines(doc("~~~", "a", "~~~", "b"))).toEqual([false, true, false, false]);
    // ``` cannot close a ~~~ fence, so this one never closes and exempts nothing
    expect(fencedContentLines(doc("~~~", "a", "```", "b"))).toEqual(Array(4).fill(false));
  });

  it("requires the closing fence to be at least as long as the opening one", () => {
    expect(fencedContentLines(doc("````", "a", "```", "b", "````"))).toEqual([
      false, true, true, true, false,
    ]);
    // and a longer close is fine
    expect(fencedContentLines(doc("```", "a", "`````"))).toEqual([false, true, false]);
  });

  it("does not close on a fence marker that carries trailing text", () => {
    expect(fencedContentLines(doc("```", "a", "``` and more", "b"))).toEqual(Array(4).fill(false));
    // trailing whitespace alone still closes
    expect(fencedContentLines(doc("```", "a", "```   "))).toEqual([false, true, false]);
  });

  it("does not open on a backtick fence whose info string carries a backtick", () => {
    // CommonMark's info-string rule, and the reason an inline span written on
    // its own line does not open a block that swallows the rest of the file.
    const hits = scan("```x``` is a span", `so this is judged: ${DEAD}`);
    expect(statusAt(hits, 2)).not.toBe("exempt");
    // a tilde fence has no such restriction
    expect(fencedContentLines(doc("~~~`x`", "a", "~~~"))).toEqual([false, true, false]);
  });

  it("does not open on a fence indented more than three spaces", () => {
    // The deliberate omission: a fence inside a list item sits at the item's
    // content column, and this tracker is flat. Such content stays judged,
    // which is the status quo and the safe direction.
    expect(fencedContentLines(doc("    ```", "a", "    ```"))).toEqual(Array(3).fill(false));
    expect(fencedContentLines(doc("   ```", "a", "   ```"))).toEqual([false, true, false]);
  });
});

describe("citation scanner: fences and blockquotes do not confuse each other", () => {
  it("does not let a fence marker inside a blockquote open a fence", () => {
    const hits = scan("> ```", `> quoted: ${DEAD}`, "> ```", `unquoted: ${DEAD}`);
    // the quoted line is exempt for being quoted, not for being fenced
    expect(reasonAt(hits, 2)).toBe("blockquote");
    // and the line after the quotation is judged, not swallowed by it
    expect(statusAt(hits, 4)).not.toBe("exempt");
    expect(reasonAt(hits, 4)).toBeNull();
  });

  it("treats a `>` line inside an open fence as fence content, not as a quotation", () => {
    // Inside a fence `>` is a literal character — a shell prompt, a diff
    // marker — so `fenced-code` is the true reason and `blockquote` would be a
    // coincidence of the first character.
    const hits = scan("```", `> ${DEAD}`, "```");
    expect(reasonAt(hits, 2)).toBe("fenced-code");
  });

  it("closes a fence on a marker that a blockquote never opened", () => {
    // A blockquoted marker opens nothing, so the later unquoted marker is an
    // OPENING fence, and the tracker must not have been left mid-block by the
    // quotation. Line 4 is content of the fence opened at line 3.
    expect(fencedContentLines(doc("> ```", "prose", "```", "a", "```"))).toEqual([
      false, false, false, true, false,
    ]);
  });
});

describe("citation scanner: the gate sees the exemption", () => {
  it.skipIf(!WORKBENCH_PRESENT)("reports no violation for a fenced dead citation", () => {
    const fenced = scanRecordCitations("fixture.md", doc("```", `$ grep '${DEAD}'`, "```"));
    expect(fenced.violations).toEqual([]);
    // the identical token in running prose is still a violation
    const bare = scanRecordCitations("fixture.md", doc(`see ${DEAD}`));
    expect(bare.violations.length).toBe(1);
  });

  it.skipIf(!WORKBENCH_PRESENT)("does not count a fenced citation as resolved either", () => {
    // An exempt token is not judged, in either direction: it must not inflate
    // the resolved count that the sibling lint pins a baseline on.
    const live = "260819-1645-four-constraints-on-deep-change";
    const prose = scanRecordCitations("fixture.md", doc(`see ${live}`));
    expect(prose).toEqual({ violations: [], resolved: 1 });
    const fenced = scanRecordCitations("fixture.md", doc("```", `see ${live}`, "```"));
    expect(fenced).toEqual({ violations: [], resolved: 0 });
  });
});
