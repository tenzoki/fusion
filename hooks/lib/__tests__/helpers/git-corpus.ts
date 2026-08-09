/**
 * The bounded command corpus behind the branch classifier's no-new-allow check.
 *
 * ## Why a corpus at all, and why this small one
 *
 * `260804-1344` closed the same defect in the mutation classifier and proved its
 * no-new-allow property against a generated cross-product of 181,115 commands.
 * That generator lived in the mutation classifier's suite and was deleted with
 * it in v6.0.0, so the property that survived the retirement had no instrument
 * left to measure it.
 *
 * This is deliberately NOT a rebuild of that instrument. The change it measures
 * is two edits in `git-branch-guard.ts` — a reorder in `classifyCheckout` and a
 * resumed walk in `classifySegment` — and the evidence should be proportionate
 * to it. A cross-product sized for a rewrite of git's argument grammar would be
 * a different piece of work, and the plan
 * (`shared/planning/260809-1229_o_plan-five-severe-guard-defects.md`, Step 3)
 * says so explicitly.
 *
 * ## What the corpus is a cross-product OF
 *
 * The two dimensions are the ones the two fixes actually move:
 *
 *   * GLOBALS — nothing, the two options the walk knows and consumes a value for
 *     (`-C`, `-c`), two valueless unknown options, two unknown options that take
 *     a SEPARATED value (the whole subject of `260804-1333`), and two
 *     combinations that put a known option BEHIND an unknown one's value (the
 *     residual `260804-1344` found).
 *   * TAILS — the three subcommands the classifier has rows for, in their
 *     denying and allowing spellings, plus four subcommands it has no row for.
 *
 * Every command is then classified under all four override combinations, with
 * and without a resolver, because the ambiguous bare-`checkout` form takes a
 * different path in each.
 *
 * ## The property, and its direction
 *
 * The fixture `fixtures/git-corpus-451a07e.json` holds one deny bit per verdict,
 * recorded against the UNMODIFIED classifier at HEAD `451a07e`. The suite
 * asserts one implication and only one: **a verdict that DENIED at the baseline
 * still denies.** New denies are expected and permitted — both fixes are
 * monotone in the safe direction and `checkout -b f --` is in the corpus
 * precisely so that one of them shows up. An allow that turned into a deny is
 * the cost side, stated in `rules/git-branch-discipline.md`; an allow that was
 * never there is the failure this file exists to catch.
 */

export interface CorpusOverrides {
  allowBranchSwitch: boolean;
  allowWorktree: boolean;
}

/** All four override combinations, in a fixed order the fixture depends on. */
export const OVERRIDE_COMBOS: CorpusOverrides[] = [
  { allowBranchSwitch: false, allowWorktree: false },
  { allowBranchSwitch: true, allowWorktree: false },
  { allowBranchSwitch: false, allowWorktree: true },
  { allowBranchSwitch: true, allowWorktree: true },
];

/**
 * The mock resolver every resolver-bearing row uses. Deterministic and tiny:
 * `f` is a file on disk, `main` is a ref, nothing else is either.
 */
export const CORPUS_RESOLVER = {
  pathExists: (t: string): boolean => t === "f",
  isRef: (t: string): boolean => t === "main",
};

/** git's global-option position — the dimension `classifySegment` walks. */
const GLOBALS = [
  "",
  "-C d",
  "-c k=v",
  "--no-pager",
  "--literal-pathspecs",
  "--namespace ns",
  "--attr-source HEAD",
  "--namespace ns -C d",
  "--no-pager -C d",
];

/** The subcommand position and its own arguments. */
const TAILS = [
  "switch main",
  "checkout -b f",
  "checkout -b f --",
  "checkout HEAD -- f",
  "checkout f",
  "checkout main",
  "worktree add ../wt f",
  "worktree list",
  "diff",
  "commit -m x",
  "status",
  "restore f",
];

/** The full cross-product, `git` prefixed, in a fixed order. */
export const CORPUS: string[] = GLOBALS.flatMap((g) =>
  TAILS.map((t) => (g === "" ? `git ${t}` : `git ${g} ${t}`)),
);
