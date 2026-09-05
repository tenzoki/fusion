// ---------------------------------------------------------------------------
// The growth instrument — one budget mechanism, several bounded surfaces.
//
// WHY THIS FILE EXISTS. `rules-emission-golden.test.ts` armed a failing bound
// over the always-on rule corpus on 2026-08-14. On 2026-08-15 the same bound was
// extended to three more surfaces — `agents/*.md`, `skills/*/SKILL.md` and the
// hook test lines — and the arithmetic they share was lifted here rather than
// copied. One budget mechanism, four surfaces, four INDEPENDENT budgets: growth
// in one surface can never be paid for by shrinkage in another, because each
// surface calls `growth()` with its own baseline map and its own head-room and
// asserts on its own result.
//
// WHY IT SITS UNDER `__tests__/helpers/` AND NOT IN `hooks/lib/`. Two reasons,
// and either is sufficient. `derivable-enumerations-lint.test.ts` holds
// `README-hooks.md`'s `hooks/lib` table in exact set equality with
// `hooks/lib/*.ts`, so a module at the top of `lib/` needs a documented row in
// the same commit — and a test helper is not a hook module and does not belong
// in that table. And `hooks/tsconfig.json` excludes `lib/__tests__`, so nothing
// here compiles into `hooks/dist/` and the build's orphan prune never sees it.
//
// WHAT IT DOES NOT DECIDE. Not the baselines, not the head-room figures, not the
// failure text. Each of those is a property of the surface it bounds and is
// declared in the test file that bounds it, next to the measurement that derived
// it. This file holds the arithmetic and the rule below, and nothing else.
//
// ## Re-baselining: the three events at which a baseline moves
//
// A baseline map is the reference a bound measures growth from: what each file
// weighed at the moment the surface was last settled. It is hand-edited, and it
// moves at the three kinds of moment named below and at no other.
//
//   1. AFTER A CLEANUP. Somebody has done the cut the bound asked for. Then, and
//      only then, copy the per-file sizes out of the regenerated golden into the
//      baseline map and say in a comment which cut produced them.
//
//   2. AT AN ARMING. A measurement that used to report starts blocking, and the
//      corpus it is armed on is already past the head-room the new gate would
//      enforce. Arming at the old baseline would ship a permanently red suite,
//      which is a suite nobody reads. This has happened twice: on 2026-08-14 for
//      the always-on rule core (`rules-emission-golden.test.ts`), and on
//      2026-08-15 for the three surfaces in `surface-growth-bound.test.ts`.
//
//   3. AT A MERGE OF TWO LINES THAT WERE EACH INSIDE THE BOUND. What this
//      instrument measures is addition per line of development. A merge adds
//      two lines' growth to one baseline at once, so two histories that were
//      each measured and each passed can join into one that is over — by a sum
//      neither of them wrote and no cut answers. Then, and only then, the
//      baseline moves to the MERGED figure, and the entry names the merge
//      commit and BOTH PARENT FIGURES it reconciles, the way a cleanup names
//      its cut and an arming names its gate.
//
//      THE CONDITION IS MEASURED, NEVER ASSUMED: each parent was inside the
//      bound at its own head, measured there and written down here beside the
//      merged figure, so a later reader can check that neither was over. A
//      merge whose parents were not each inside is A CUT AS BEFORE — event 1
//      and nothing else — because the line that was already over is over on
//      growth somebody made, and joining it to another line did not change
//      that. Nor does this event reach anything but the merged tree's own
//      figure: growth that arrived with the merge commit's conflict
//      resolution, and every edit made on top of it, is measured FROM the new
//      baseline like any other addition. That is why the number copied in is
//      the merged tree's and not the one the re-baselining commit leaves
//      behind.
//
//      AND IT IS NOT THE THIRD EVENT THAT WAS ALREADY REFUSED. A Circle that
//      needs room to do its work asked for one on 2026-08-22 and did not get it
//      (`260822-1102_*_what-happens-when-a-planned-circles-required-work-exceeds-the-remaining-head-room.md`,
//      option 1: the room was cut first). The two are not the same request. That
//      one asks to be absolved of growth somebody is about to choose to make;
//      this one reconciles two figures that were each already measured and each
//      already passed.
//
// Between those, the baseline stays where it is — a reference that followed the
// measurement would measure nothing. And no one of the three is the SILENT RAISE
// this section exists to prevent, for one reason: each is written down. A cleanup
// names the cut; an arming names the gate it armed and reproduces, AS TEXT, what
// the re-baseline absolved; a merge names its commit and both parent figures —
// so the request the instrument had been making survives the number moving.
// Editing a baseline to make a failing bound pass, with no cut, no arming, no
// merge and no log entry, is none of these and is the thing this file is asking
// you not to do.
//
// The governing record for the arming form is
// `circles/260801-1244-curator/decisions/260814-0738_*_how-is-the-always-on-growth-bound-armed-when-the-corpus-is-already-over-budget.md`
// (option 1, answered by the user on 2026-08-14). For the merge form it is
// `260905-1810_*_does-a-growth-bound-re-baseline-after-a-merge-of-two-lines-that-were-each-inside-it.md`
// (option 2, answered by the user on 2026-09-05), with the measurement that
// raised it in
// `260905-1755_*_the-merge-puts-two-surface-growth-budgets-over-while-neither-line-was-over-on-its-own.md`.
// ---------------------------------------------------------------------------

/**
 * One file's contribution to a surface, in whatever unit that surface is
 * measured in. `size` is deliberately unit-neutral: two of the four bounded
 * surfaces count bytes and one counts lines, and the arithmetic is the same.
 */
export interface Sized {
  /** The file's path, relative to the surface's own root. Also the baseline key. */
  rel: string;
  /** Bytes or lines — whichever unit the calling surface declares. */
  size: number;
}

/**
 * What a set of files weighs now against what it weighed at the last
 * re-baseline.
 *
 * `floor` is the baseline summed over the same files. A file with no baseline
 * entry contributes 0, so its whole current size reads as growth, which is
 * correct: nobody granted it a budget. A shrink gives a negative `delta` and is
 * never `over`, which is the other half of "this bounds the RATE of addition".
 */
export interface Growth {
  /** What the set measures today. */
  total: number;
  /** What the same files measured at the last re-baseline. */
  floor: number;
  /** total - floor. Negative when the set shrank. */
  delta: number;
  /** floor + budget — the point past which the set is over. */
  budget: number;
  /** True only when the set has spent its whole head-room. */
  over: boolean;
  /** Per-file growth, biggest first. A file that shrank or held is absent. */
  grown: { rel: string; delta: number }[];
}

/**
 * The one function every bound reads. The baseline map and the head-room are
 * PARAMETERS rather than module state, which is what keeps the four budgets
 * independent: nothing here can see another surface's numbers, so nothing here
 * can spend them.
 */
export function growth(
  files: Sized[],
  baseline: Record<string, number>,
  headRoom: number,
): Growth {
  const total = files.reduce((n, f) => n + f.size, 0);
  const floor = files.reduce((n, f) => n + (baseline[f.rel] ?? 0), 0);
  const budget = floor + headRoom;
  const grown = files
    .map((f) => ({ rel: f.rel, delta: f.size - (baseline[f.rel] ?? 0) }))
    .filter((g) => g.delta > 0)
    .sort((a, b) => b.delta - a.delta);
  return { total, floor, delta: total - floor, budget, over: total > budget, grown };
}

/** The per-file breakdown every bound and every report prints. */
export function grownLines(g: Growth): string[] {
  const width = Math.max(0, ...g.grown.map((x) => x.rel.length));
  return g.grown.map((x) => `  ${x.rel.padEnd(width)}  +${fmt(x.delta)}`);
}

/** Digit grouping with a space, so a report reads like the counts it quotes. */
export function fmt(n: number): string {
  return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}
