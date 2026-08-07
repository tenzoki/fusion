import { describe, it, expect } from "vitest";

import { parseCommand } from "../shell-parse.js";
import type { ParsedSegment } from "../shell-parse.js";
import { CARRYING_EDGES, SEGMENT_REACHES, annotateReach } from "../shell-reach.js";
import type { SegmentReach } from "../shell-reach.js";

/**
 * The reach layer — plan step 2 of `circles/260804-1205-shell-reachability-model`.
 *
 * This file reads `reach` as a TABLE, the way `shell-parse.test.ts` reads
 * `joiner`. It says nothing about whether a command allows or denies: the guard
 * does not consult this layer yet, and when it does (step 3) the argument about
 * verdicts belongs in `bash-mutation-guard.test.ts`. What is asserted here is
 * that the grammar was read correctly.
 *
 * The load-bearing block is "the two spellings". Every compound construct is
 * written twice — once on a line and once with its body broken across four —
 * and the edges the two produce must be the same. That equality is the defect
 * the plan's diagram evaluation found, expressed as a test rather than as a
 * claim.
 */

/* ------------------------------------------------------------------ *
 * Reading the table
 * ------------------------------------------------------------------ */

function segmentsOf(command: string): ParsedSegment[] {
  return parseCommand(command, { quoted: "capture" }).segments;
}

function reached(command: string): { text: string; reach: SegmentReach; depth: number }[] {
  return annotateReach(segmentsOf(command)).map((s) => ({
    text: s.text,
    reach: s.reach,
    depth: s.depth,
  }));
}

/** Every segment's edge, in source order. */
function edges(command: string): SegmentReach[] {
  return reached(command).map((s) => s.reach);
}

/**
 * The edges of the segments that actually RUN something.
 *
 * This is the projection the spelling comparison is made under, and the
 * projection is the point rather than a convenience: breaking a body across
 * lines adds grammar-only segments (`then`, `do`, `{`) that the single-line
 * spelling does not have, so the two segment lists cannot be compared
 * element-wise. What must match is what each COMMAND is reached by.
 */
function commandEdges(command: string): SegmentReach[] {
  return annotateReach(segmentsOf(command))
    .filter((s) => s.reach !== "transparent")
    .map((s) => s.reach);
}

/** The edge of the one segment whose text contains `needle`. */
function edgeOf(command: string, needle: string): SegmentReach {
  const hits = reached(command).filter((s) => s.text.includes(needle));
  expect(hits.length, `${JSON.stringify(needle)} in ${JSON.stringify(command)}`).toBe(1);
  return hits[0].reach;
}

/* ------------------------------------------------------------------ *
 * The vocabulary, one named case per edge
 * ------------------------------------------------------------------ */

/**
 * One command per edge, and the segment in it that carries that edge.
 *
 * Driven off `SEGMENT_REACHES` below, so an edge added to the type without a
 * case fails here rather than shipping unexercised — the shape the guard's
 * wrapper and joiner blocks already use.
 */
const EDGE_CASES: Record<SegmentReach, { command: string; segment: string }> = {
  start: { command: "cd build && rm out.js", segment: "cd build" },
  and: { command: "cd build && rm out.js", segment: "rm out.js" },
  seq: { command: "cd build; rm out.js", segment: "rm out.js" },
  or: { command: "false || cd build", segment: "cd build" },
  "cond-true": { command: "if cd build; then rm out.js; fi", segment: "then rm out.js" },
  "cond-false": {
    command: "until cd build; do rm out.js; done",
    segment: "do rm out.js",
  },
  branch: { command: "if true; then :; else rm out.js; fi", segment: "else rm out.js" },
  barrier: { command: "if cd build; then :; fi && rm out.js", segment: "rm out.js" },
  transparent: { command: "if cd build; then :; fi", segment: "fi" },
  "pipe-member": { command: "cd build | cat && rm out.js", segment: "cd build" },
  "pipe-unproven": { command: "false; cd build | cat", segment: "cd build" },
  "pipe-exit": { command: "{ cd build; } | cat && rm out.js", segment: "}" },
};

describe("the reach vocabulary", () => {
  it("produces every edge in the type, with a named case for each", () => {
    for (const edge of SEGMENT_REACHES) {
      const c = EDGE_CASES[edge];
      expect(c, `no case for ${edge}`).toBeDefined();
      expect(edgeOf(c.command, c.segment), `${edge}: ${c.command}`).toBe(edge);
    }
    // …and no case names an edge the type does not have.
    expect(Object.keys(EDGE_CASES).sort()).toEqual([...SEGMENT_REACHES].sort());
  });

  it("names the carrying edges without naming a pipeline row", () => {
    // `CARRYING_EDGES` duplicates one column of the guard's facts table on
    // purpose (see its docstring). What can be checked HERE is its shape: the
    // pipeline rows are the pass's own OUTPUT, so a pipeline head can never be
    // one and a lookup can never ask about one.
    for (const edge of CARRYING_EDGES) {
      expect([...SEGMENT_REACHES]).toContain(edge);
    }
    expect(CARRYING_EDGES.has("pipe-member")).toBe(false);
    expect(CARRYING_EDGES.has("pipe-unproven")).toBe(false);
    // `pipe-exit` is absent for the opposite reason: it IS asked about — a
    // compound element's closing segment is the pipeline head for whatever
    // follows the `|` — and the answer has to be no, because the subshell that
    // held the directory change ended there.
    expect(CARRYING_EDGES.has("pipe-exit")).toBe(false);
  });

  it("maps each raw operator to the edge the flat model already answered", () => {
    // Invariant 2's default branch. An ordinary command with no grammar word
    // and no pending edge reads its own operator, which is what the joiner
    // model did — so a shape this layer does not recognise cannot move.
    expect(edges("cd a && rm x")).toEqual(["start", "and"]);
    expect(edges("cd a; rm x")).toEqual(["start", "seq"]);
    expect(edges("cd a\nrm x")).toEqual(["start", "seq"]);
    expect(edges("cd a & rm x")).toEqual(["start", "seq"]);
    expect(edges("cd a || rm x")).toEqual(["start", "or"]);
  });
});

/* ------------------------------------------------------------------ *
 * The two spellings
 * ------------------------------------------------------------------ */

/**
 * The four compound wrappers, each written on one line and across four.
 *
 * `bare`, `pipeline` and `pipe-head` are absent because they have no body to
 * break: there is one spelling of `cd X && rm y`.
 */
const SPELLING_PAIRS: readonly {
  readonly id: string;
  readonly single: string;
  readonly multi: string;
}[] = [
  {
    id: "if",
    single: "if cd build; then rm out.js; fi",
    multi: "if cd build\nthen\nrm out.js\nfi",
  },
  {
    id: "while",
    single: "while cd build; do rm out.js; done",
    multi: "while cd build\ndo\nrm out.js\ndone",
  },
  {
    id: "until",
    single: "until cd build; do rm out.js; done",
    multi: "until cd build\ndo\nrm out.js\ndone",
  },
  {
    id: "brace",
    single: "{ cd build; } && rm out.js",
    multi: "{\ncd build\n} && rm out.js",
  },
];

/** Every operator a head can be attached with, plus the headless case. */
const HEAD_PREFIXES: readonly string[] = [
  "",
  "true && ",
  "false || ",
  "true; ",
  "echo hi | ",
  "true & ",
  "true\n",
];

describe("the two spellings of a compound construct", () => {
  it("reach the same commands by the same edges, under every head", () => {
    for (const pair of SPELLING_PAIRS) {
      for (const prefix of HEAD_PREFIXES) {
        const single = prefix + pair.single;
        const multi = prefix + pair.multi;
        expect(
          commandEdges(multi),
          `${pair.id} @ ${JSON.stringify(prefix)}\n  ${JSON.stringify(single)}\n  ${JSON.stringify(multi)}`,
        ).toEqual(commandEdges(single));
      }
    }
  });

  it("types the body of each wrapper by its own condition", () => {
    expect(edgeOf(SPELLING_PAIRS[0].multi, "rm out.js")).toBe("cond-true");
    expect(edgeOf(SPELLING_PAIRS[1].multi, "rm out.js")).toBe("cond-true");
    // `until`'s body runs when the condition FAILED, so it is not relief.
    expect(edgeOf(SPELLING_PAIRS[2].multi, "rm out.js")).toBe("cond-false");
    expect(edgeOf(SPELLING_PAIRS[3].multi, "rm out.js")).toBe("and");
  });

  it("hands the grammar word's edge to the command on the next line", () => {
    // The pending rule, spelled out. The bare body word runs nothing and types
    // `transparent`; the command that follows it consumes what it handed on
    // rather than falling through to its own newline.
    expect(reached("if cd build\nthen\nrm out.js\nfi")).toEqual([
      { text: "if cd build", reach: "start", depth: 0 },
      { text: "then", reach: "transparent", depth: 0 },
      { text: "rm out.js", reach: "cond-true", depth: 0 },
      { text: "fi", reach: "transparent", depth: 0 },
    ]);
  });

  it("keeps an opener's own edge across the line break, in both directions", () => {
    // The clause the plan text left under-specified, and the reason it is not
    // optional: a bare `{` runs nothing and adds no condition, so the command
    // position it opens must be reached exactly as the `{` was.
    //
    // Dropping the edge would cost an ALLOW here — `||` says the group may not
    // have run at all…
    expect(edgeOf("false || { cd build; } && rm out.js", "cd build")).toBe("or");
    expect(edgeOf("false || {\ncd build\n} && rm out.js", "cd build")).toBe("or");
    // …and a DENY here, where `&&` proves the directory change succeeded and a
    // fall-through to the newline would throw that proof away.
    expect(edgeOf("cd hooks && { rm -rf dist; }", "rm -rf dist")).toBe("and");
    expect(edgeOf("cd hooks && {\nrm -rf dist\n}", "rm -rf dist")).toBe("and");
  });

  it("cuts the edge at a closing brace, so the operator after it is read", () => {
    // The mirror of the case above, and the reason the clause is about
    // TERMINATORS rather than about braces. A group's status is its last
    // command's status, so the `&&` after `}` is a real guarantee and must not
    // be shadowed by whatever operator stood inside the group.
    expect(edges("{ cd build; } && rm out.js")).toEqual([
      "start",
      "transparent",
      "and",
    ]);
    expect(edges("{\ncd build\n} && rm out.js")).toEqual([
      "transparent",
      "start",
      "transparent",
      "and",
    ]);
  });
});

/* ------------------------------------------------------------------ *
 * The head stack
 * ------------------------------------------------------------------ */

describe("the compound-head stack", () => {
  it("lets exactly one body word claim each head", () => {
    // A `for` body nested in a `while` body. `for` is in no grammar set, so its
    // `do` finds the `while` head already claimed and falls through to its raw
    // operator — which is today's answer, and the cheapest proof that the layer
    // models heads rather than pattern-matching the word `do`.
    expect(edges("while cd X; do A; for f in *; do B; done; done")).toEqual([
      "start",
      "cond-true",
      "seq",
      "seq",
      "transparent",
      "transparent",
    ]);
  });

  it("distinguishes `until` from `while` although both spell their body `do`", () => {
    expect(edgeOf("while cd build; do rm out.js; done", "do rm")).toBe("cond-true");
    expect(edgeOf("until cd build; do rm out.js; done", "do rm")).toBe("cond-false");
  });

  it("gives each arm of an if/elif/else chain its own edge", () => {
    expect(edges("if true; then :; elif cd b; then rm x; else rm y; fi")).toEqual([
      "start",
      "cond-true",
      "branch",
      "cond-true",
      "branch",
      "transparent",
    ]);
  });

  it("claims the inner head when a body word and a head share a segment", () => {
    // `do if cd X` — `do` claims the `while` and types the command position,
    // `if` opens a head for the `then` that follows. The first
    // candidate-bearing word wins and every word still moves the stack.
    expect(edges("while true; do if cd build; then rm out.js; fi; done")).toEqual([
      "start",
      "cond-true",
      "cond-true",
      "transparent",
      "transparent",
    ]);
  });

  it("delivers the degrade at the next command position after a terminator", () => {
    // `transparent` skipping the give-up at `fi` is only safe if `barrier`
    // delivers it one segment later. An `if` with no `else` returns zero when
    // its condition FAILS, so the `&&` after `fi` proves nothing about the `cd`.
    expect(edges("if cd hooks; then :; fi && rm -rf dist")).toEqual([
      "start",
      "cond-true",
      "transparent",
      "barrier",
    ]);
    expect(edges("if cd hooks\nthen\n:\nfi && rm -rf dist")).toEqual([
      "start",
      "transparent",
      "cond-true",
      "transparent",
      "barrier",
    ]);
  });
});

/* ------------------------------------------------------------------ *
 * Pipelines
 * ------------------------------------------------------------------ */

describe("pipeline membership", () => {
  it("substitutes the head as well as the tail", () => {
    // bash subshells EVERY element of a multi-element pipeline, head included,
    // so a `cd` in the head does not move the calling shell. Under naive
    // head-inheritance this row would newly allow.
    expect(edges("cd build | cat && rm out.js")).toEqual([
      "pipe-member",
      "pipe-member",
      "and",
    ]);
    expect(edges("echo hi | cd build && rm out.js")).toEqual([
      "pipe-member",
      "pipe-member",
      "and",
    ]);
  });

  it("takes the carry answer from the head's edge, resolved into a literal row", () => {
    // The head is reached by `&&`, which carries → `pipe-member`.
    expect(edges("cd hooks && npx tsc | tee typecheck.log")).toEqual([
      "start",
      "pipe-member",
      "pipe-member",
    ]);
    // The head is reached by `;`, which does not → `pipe-unproven`.
    expect(edges("cd hooks; npx tsc | tee typecheck.log")).toEqual([
      "start",
      "pipe-unproven",
      "pipe-unproven",
    ]);
  });

  it("reads a head that leads with a body word", () => {
    // The pipeline substitution runs LAST for exactly this shape: the head's
    // own edge is `cond-true`, which carries, so its elements are `pipe-member`
    // — the condition's guarantee survives the carry question while the
    // subshell still answers the move question.
    expect(edges("if true; then cd build | cat && rm out.js; fi")).toEqual([
      "start",
      "pipe-member",
      "pipe-member",
      "and",
      "transparent",
    ]);
    // …and an `until` head does not carry, so its elements are `pipe-unproven`.
    expect(edges("until true; do cd build | cat; done")).toEqual([
      "start",
      "pipe-unproven",
      "pipe-unproven",
      "transparent",
    ]);
  });

  it("carries the pipeline row across an opener's line break", () => {
    // When the segment that OPENS a construct is a pipeline element, the whole
    // construct is that element — but the flat membership test only sees the
    // `|` on the `{`. Without carrying the row across the hand-on, the
    // multi-line spelling would say the mover moved the calling shell where the
    // single-line one says it did not, and the two would split on the one
    // question the pipeline rows exist to answer.
    expect(edgeOf("echo hi | { cd build; } && rm out.js", "cd build")).toBe(
      "pipe-member",
    );
    expect(edgeOf("echo hi | {\ncd build\n} && rm out.js", "cd build")).toBe(
      "pipe-member",
    );
  });

  it("does not read a single command as a pipeline", () => {
    expect(edges("cd build && rm out.js")).toEqual(["start", "and"]);
  });
});

/* ------------------------------------------------------------------ *
 * A compound command that is itself a pipeline element
 * ------------------------------------------------------------------ */

/**
 * The class the plan's second diagram evaluation reported, measured.
 *
 * Every command below was run in bash and zsh against a throwaway project
 * (`shell-witness.ts`) before these expectations were written, and the shell
 * result is quoted on each row. The verdict consequence was measured too: with
 * the reach layer's edges fed through the two-column model the guard already
 * uses, five of these commands DELETE `rules/x.md` in both shells while the
 * model resolves the write into a directory the shell never entered. With the
 * `pipe-exit` boundary all five degrade instead.
 *
 * The reported row is `{ cd build; } | grep x && rm out.js`. Its own operand is
 * harmless in either place, which is what made it look like a bookkeeping
 * detail; swapping the operand for `rules/x.md` is the same command and deletes
 * a protected rule.
 */
describe("a compound command that is itself a pipeline element", () => {
  it("ends the carry at the closing brace of a piped group", () => {
    // MEASURED: `{ cd build; } | cat && pwd` prints the project root in bash
    // and in zsh. The group is subshelled, so the `cd` never reached the shell
    // that runs the write — and `{ cd build; } | cat && rm rules/x.md` deletes
    // `rules/x.md` in both shells for exactly that reason.
    expect(edges("{ cd build; } | grep x && rm out.js")).toEqual([
      "start",
      "pipe-exit",
      "pipe-unproven",
      "and",
    ]);
  });

  it("ends it at the same place however the group's lines fall", () => {
    // The multi-line spelling of the row above. The `|` touches neither the
    // mover nor the opener in either spelling, which is why a membership test
    // that reads one adjacent operator cannot see the subshell at all.
    expect(edges("{\ncd build\n} | grep x && rm out.js")).toEqual([
      "transparent",
      "start",
      "pipe-exit",
      "pipe-unproven",
      "and",
    ]);
    expect(commandEdges("{\ncd build\n} | grep x && rm out.js")).toEqual(
      commandEdges("{ cd build; } | grep x && rm out.js"),
    );
  });

  it("ends it under every compound head, not just the brace group", () => {
    // MEASURED: each of these deletes `rules/x.md` in bash AND zsh when the
    // write is `rm rules/x.md`. None of them puts the `|` next to the mover.
    expect(edgeOf("if cd build; then echo y; fi | cat && rm x", "fi")).toBe("pipe-exit");
    expect(edgeOf("while cd build; do break; done | cat && rm x", "done")).toBe(
      "pipe-exit",
    );
    expect(edgeOf("until cd build; do break; done | cat && rm x", "done")).toBe(
      "pipe-exit",
    );
    // `for` and `case` reach this only because `SPAN_OPENERS` knows they opened
    // something. Their BODIES are still unmodelled — the `do` below falls
    // through to its raw operator, as it always has.
    expect(edges("for f in x; do cd build; done | cat && rm rules/x.md")).toEqual([
      "start",
      "seq",
      "pipe-exit",
      "pipe-unproven",
      "and",
    ]);
    expect(edgeOf("case x in x) cd build;; esac | cat && rm x", "esac")).toBe(
      "pipe-exit",
    );
  });

  it("ends it at the OUTERMOST close when groups nest", () => {
    // MEASURED: `{ { cd build; }; } | cat && pwd` prints the root in both
    // shells. The inner `}` is an ordinary group boundary inside the subshell;
    // the outer one is where the subshell ends.
    expect(edges("{ { cd build; }; } | cat && rm rules/x.md")).toEqual([
      "start",
      "transparent",
      "pipe-exit",
      "pipe-unproven",
      "and",
    ]);
  });

  it("ends it for an element in TAIL position too, where the `|` is at the front", () => {
    // The direction "the segment the operator touches" cannot reach: here the
    // `|` touches the OPENING segment and the boundary is still the `}`.
    // MEASURED: bash prints the root, zsh prints `<root>/build` — zsh runs the
    // last element of a pipeline in the calling shell. `pipe-exit` refuses to
    // carry for both, which is the pessimistic row the guard takes wherever the
    // two shells disagree.
    expect(edges("echo hi | { cd build; } && rm out.js")).toEqual([
      "pipe-member",
      "pipe-member",
      "pipe-exit",
      "and",
    ]);
  });

  it("leaves a group that is NOT a pipeline element carrying", () => {
    // The bound in the other direction, and the reason the rule cannot be
    // "a closing brace does not carry". MEASURED: `{ cd build; } && pwd`
    // prints `<root>/build` in both shells, so the `}` here really does carry
    // and `{ cd rules; } && rm x.md` really does delete a protected rule.
    expect(edges("{ cd build; } && rm out.js")).toEqual([
      "start",
      "transparent",
      "and",
    ]);
    // A group that merely CONTAINS a pipeline is not itself one.
    expect(edges("{ cd build; echo a | cat; } && rm out.js")).toEqual([
      "start",
      "pipe-unproven",
      "pipe-unproven",
      "transparent",
      "and",
    ]);
    // …and a group standing after a pipeline is joined by its own `&&`.
    expect(edgeOf("echo hi | cat && { cd build; } && rm out.js", "cd build")).toBe(
      "and",
    );
  });

  it("leaves the INSIDE of a piped element typed as if it were not piped", () => {
    // The clause that decides the whole shape of the repair. MEASURED:
    // `{ cd rules; rm x.md; } | cat` deletes `rules/x.md` in both shells — the
    // directory change is entirely real INSIDE the subshell. Typing the
    // interior as a pipeline row would say the write landed at the root and
    // allow it, so the subshell fact reaches the element's exit and not its
    // body.
    expect(edges("{ cd rules; rm x.md; } | cat")).toEqual([
      "start",
      "seq",
      "pipe-exit",
      "pipe-unproven",
    ]);
    expect(edges("{\ncd rules\nrm x.md\n} | cat")).toEqual([
      "transparent",
      "start",
      "seq",
      "pipe-exit",
      "pipe-unproven",
    ]);
  });

  it("keeps a `for` body's `do` falling through, as it always has", () => {
    // `SPAN_OPENERS` gave `for` an EXTENT and no CONDITION. The regression this
    // guards against is a span opener quietly becoming a head the layer models.
    expect(edges("for f in *; do cd build; done && rm out.js")).toEqual([
      "start",
      "seq",
      "transparent",
      "barrier",
    ]);
  });

  it("claims no boundary for an unbalanced fragment", () => {
    // A terminator with nothing to close pops an empty stack and reports
    // nothing, so the segment keeps the edge it would otherwise have had.
    expect(edges("fi | cat && rm out.js")).toEqual([
      "transparent",
      "pipe-member",
      "and",
    ]);
    expect(edges("{ cd build | cat && rm out.js")).toEqual([
      "pipe-member",
      "pipe-member",
      "and",
    ]);
  });

  it("does not let a span opened inside a substitution close outside it", () => {
    expect(reached("echo $( { cd build; } | cat ) && rm out.js")).toEqual([
      { text: "echo $(…)", reach: "start", depth: 0 },
      { text: "{ cd build", reach: "start", depth: 1 },
      { text: "}", reach: "pipe-exit", depth: 1 },
      { text: "cat", reach: "pipe-unproven", depth: 1 },
      { text: "rm out.js", reach: "and", depth: 0 },
    ]);
  });
});

/* ------------------------------------------------------------------ *
 * Scopes
 * ------------------------------------------------------------------ */

describe("the pass is per scope", () => {
  it("hands nothing out of a `$(…)` body", () => {
    // The grammar words inside the substitution leave a pending `barrier`
    // behind at depth 1. The segment after the substitution closes is at depth
    // 0 and must read its own `&&`.
    expect(reached("echo $(if cd build; then echo y; fi) && rm out.js")).toEqual([
      { text: "echo $(…)", reach: "start", depth: 0 },
      { text: "if cd build", reach: "start", depth: 1 },
      { text: "then echo y", reach: "cond-true", depth: 1 },
      { text: "fi", reach: "transparent", depth: 1 },
      { text: "rm out.js", reach: "and", depth: 0 },
    ]);
  });

  it("does not let a head opened inside a substitution be claimed outside it", () => {
    // `if` opens a head at depth 1; the `then` outside is at depth 0 and finds
    // no head of its own, so it types from its raw operator.
    expect(reached("echo $(if true) ; then rm x")).toEqual([
      { text: "echo $(…)", reach: "start", depth: 0 },
      { text: "if true", reach: "start", depth: 1 },
      { text: "then rm x", reach: "seq", depth: 0 },
    ]);
  });

  it("starts a re-entered depth fresh", () => {
    expect(reached("$(then) && $(cd a) && rm x")).toEqual([
      { text: "$(…)", reach: "start", depth: 0 },
      { text: "then", reach: "transparent", depth: 1 },
      { text: "$(…)", reach: "and", depth: 0 },
      { text: "cd a", reach: "start", depth: 1 },
      { text: "rm x", reach: "and", depth: 0 },
    ]);
  });
});

/* ------------------------------------------------------------------ *
 * The parser is not touched
 * ------------------------------------------------------------------ */

describe("annotateReach and the parser", () => {
  const command = "if cd build\nthen\nrm out.js\nfi && echo $(ls) done";

  it("returns one annotated segment per parsed segment, in order", () => {
    const segments = segmentsOf(command);
    const annotated = annotateReach(segments);
    expect(annotated.length).toBe(segments.length);
    expect(annotated.map((s) => s.text)).toEqual(segments.map((s) => s.text));
    expect(annotated.map((s) => s.depth)).toEqual(segments.map((s) => s.depth));
    expect(annotated.map((s) => s.joiner)).toEqual(segments.map((s) => s.joiner));
  });

  it("annotates a copy and leaves the parser's segments alone", () => {
    const segments = segmentsOf(command);
    const before = JSON.parse(JSON.stringify(segments)) as ParsedSegment[];
    const annotated = annotateReach(segments);
    expect(segments).toEqual(before);
    expect(annotated[0]).not.toBe(segments[0]);
    expect("reach" in segments[0]).toBe(false);
  });

  it("is a total function on an empty command", () => {
    expect(annotateReach([])).toEqual([]);
    expect(annotateReach(segmentsOf(""))).toEqual([]);
  });

  it("is deterministic", () => {
    expect(edges(command)).toEqual(edges(command));
  });
});
