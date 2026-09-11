// ---------------------------------------------------------------------------
// The growth instrument — one budget mechanism, several bounded surfaces.
//
// WHY THIS FILE EXISTS. Five bounded surfaces run the same arithmetic, and it
// was lifted here rather than copied. The budgets are INDEPENDENT — growth in
// one can never be paid for by shrinkage in another — and `growth()` below is
// where that is enforced rather than promised.
//
// DO NOT MOVE IT UP INTO `hooks/lib/`. Two gates make that wrong, and
// `README-hooks.md` names them where it names this file.
//
// WHAT IT DOES NOT DECIDE. Not the baselines, not the head-room figures, not the
// failure text: each belongs to the surface it bounds and is declared in the
// test file that bounds it, beside the measurement that derived it. This file
// holds the arithmetic and the rule below, and nothing else.
//
// ## Re-baselining: the three events at which a baseline moves
//
// A bound is `floor + headRoom`, AND THE TWO HALVES MOVE ON DIFFERENT RULES. The
// floor is the baseline map — what each file weighed when its surface was last
// settled, the mark growth is measured FROM — hand-edited at the three events
// below and at NO OTHER; the heading is a count, meant literally. Head-room is
// how much a surface may then grow, and raising it is a named event too, set out
// after the three, but IT IS NOT A FOURTH WAY TO MOVE A FLOOR: a moved floor
// forgets the growth beneath it, a raised head-room leaves every byte counted.
//
//   1. AFTER A CLEANUP. Somebody has done the cut the bound asked for. Then, and
//      only then, copy the per-file sizes out of the regenerated golden into the
//      baseline map and say in a comment which cut produced them.
//
//      READ LITERALLY — "it cut, so it may re-baseline what it cut" — THIS EVENT
//      IS THE SILENT RAISE ARRIVING THROUGH THE DOOR THE RULE LEFT OPEN, and the
//      user REFUSED that reading on 2026-09-11: A CUT-ONLY PIECE OF WORK NEVER
//      RE-BASELINES, whatever it cut, and its head-room is what the cut leaves.
//      The floor stays fixed, so how much a surface has grown since it was last
//      settled stays answerable, and no size of cut absolves growth nobody
//      removed. THE REFUSAL IS A MEASUREMENT, NOT A CAUTION: taken over the four
//      surfaces at `e6703d51`, re-baselining is not one move with one sign.
//      Three would have GAINED margin nobody earned, while `agents/` — the
//      surface that had cut furthest below its floor — would have LOST that
//      shrink, falling from 61 378 to 18 000. A rule keyed on whether you cut
//      gives the wrong answer on the surface that cut most, which is what makes
//      the literal reading indefensible rather than merely risky; all four
//      figures are in `README-hooks.md`. What it does fire on is a cleanup that
//      SETTLES a surface, copying in what may be a floor that FELL (2026-08-17).
//
//   2. AT AN ARMING. A measurement that used to report starts blocking, and the
//      corpus it is armed on is already past the head-room the new gate would
//      enforce. Arming at the old baseline would ship a permanently red suite,
//      which is a suite nobody reads. AN ARMING TAKEN AT A CUT ABSOLVES THE CUT,
//      so it is taken before one. The armings are logged in `README-hooks.md`.
//
//      THE FIFTH SURFACE HAS A GAP IN THIS RULE AND IT IS NAMED, NOT CLOSED: two
//      of its three components belong to the consuming project, and no event
//      here covers a project that legitimately needs a larger `CLAUDE.md`. The
//      dispatch bound's own failure text says so, and says what offsets what.
//
//   3. AT A MERGE OF TWO LINES THAT WERE EACH INSIDE THE BOUND. This instrument
//      measures addition per line of development, and a merge adds two lines'
//      growth to one baseline at once, so two histories that were each measured
//      and each passed can join into one that is over by a sum neither wrote and
//      no cut answers. Then, and only then, the baseline moves to the MERGED
//      figure, and the entry names the merge commit and BOTH PARENT FIGURES.
//
//      THE CONDITION IS MEASURED, NEVER ASSUMED: each parent was inside the
//      bound at its own head, measured there and written down beside the merged
//      figure, so a later reader can check that neither was over. A merge whose
//      parents were not each inside is A CUT AS BEFORE — event 1 and nothing
//      else — because the line already over is over on growth somebody made.
//      Nor does the event reach past the merged tree's own figure: the conflict
//      resolution, and every edit on top of it, is measured from the new mark.
//
// AND BESIDE THE THREE, ONE NAMED EVENT THAT MOVES NO BASELINE AT ALL: THE
// HEAD-ROOM RAISE. When a ruling lets work land that a bound would otherwise
// stop, raise `headRoom` and leave every baseline untouched. It preserves
// exactly what event 1's refusal preserves — the floor still the last settled
// mark, the growth above it still charged, the surface's growth since it was
// settled still readable — while letting the work land. The entry names the
// raise WITH THE FIGURE BEFORE AND AFTER and DATES THE REDUCTION at which the
// derived figure is read back; both are logged in `README-hooks.md`, not here.
//
// IT IS ALSO HOW THE REQUEST REFUSED ON 2026-08-22 CAME BACK: that one asked to
// be absolved of growth somebody was about to choose to make, while this one
// asks for room and leaves every byte of that growth on the books.
//
// NONE OF THE FOUR IS THE SILENT RAISE THIS SECTION EXISTS TO PREVENT, for one
// reason: each names itself, in the terms its own paragraph sets. Between them
// neither number moves — a reference that followed the measurement would measure
// nothing. Editing either one to make a failing bound pass, with no event behind
// it and no log entry, is what this file is asking you not to do.
//
// TWO RESIDUALS, STATED RATHER THAN HIDDEN. Nothing detects a raised head-room
// any more than a raised baseline — the 2026-09-11 raises are visible only
// because each wrote itself down. And this rule cost lines on a surface standing
// at exactly zero margin, so its own implementation met the condition it governs.
//
// The governing records for all four events, and the undetected-raise question,
// are listed in `README-hooks.md` beside the logs.
// ---------------------------------------------------------------------------

/**
 * One file's contribution to a surface, in whatever unit that surface is
 * measured in. `size` is deliberately unit-neutral: four of the five bounded
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
  /** floor + head-room — the point past which the set is over. */
  budget: number;
  /** True only when the set has spent its whole head-room. */
  over: boolean;
  /** Per-file growth, biggest first. A file that shrank or held is absent. */
  grown: { rel: string; delta: number }[];
}

/**
 * The one function every bound reads. The baseline map and the head-room are
 * PARAMETERS rather than module state, which is what keeps the five budgets
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
