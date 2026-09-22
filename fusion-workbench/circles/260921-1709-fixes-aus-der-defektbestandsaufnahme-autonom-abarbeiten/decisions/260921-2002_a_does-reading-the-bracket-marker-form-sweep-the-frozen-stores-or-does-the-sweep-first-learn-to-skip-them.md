# Does reading the storeless bracket-marker form sweep the frozen stores, or does the sweep first learn to skip them?

---
**Domain:** code
**Filed by:** orchestrator, Kai Stalmann <ks@qantr.com>
**Cross-references:** 260921-1718_*_does-the-grammar-read-a-storeless-bracket-marked-citation-or-state-the-asymmetry-as-a-decision.md, 260831-0748_*_a-storeless-bracket-marked-citation-is-invisible-while-a-store-prefixed-one-is-reported.md, 260830-1842_*_may-the-grammar-resolve-a-bracket-marked-record-that-a-frozen-store-keeps-permanently.md, 260921-1726_*_the-33-open-defects-of-the-11-9-1-survey-worked-autonomously-as-one-package.md

---

## Question

Step 23 of the plan takes option 1 of `260921-1718_*_does-the-grammar-read-a-storeless-bracket-marked-citation-or-state-the-asymmetry-as-a-decision.md`: `BARE_RE` reads `[x]` in the marker position, a record found under the wildcard is `stale-marker`. The plan's risk table said the sweep skips the frozen stores. Measured by the coder and the consultant independently at `f0f4c9c6`: the sweep corpus includes `archive/`, and once the grammar reads the bracket form the workbench holds 142 unfenced bracket tokens in 51 files, 125 of which resolve under the wildcard (stale-marker, violations in the gate), 37 of them under `archive/`; 17 resolve to nothing (dangling), one in `260830-1842_*_…` line 12. The release gate `citation-sweep over fusion's own tree` (`rewrites=0`) turns red until the tree is swept, `bin/fusion-citation-check` reads `verdict=violations`, and `workbench-citation-lint` fails. Landing the step therefore means a code commit plus a sweep that rewrites 51 workbench files, frozen records among them, plus hand repair of 17 dangling tokens. `rules/fusion-workbench-conventions.md` `## Terminal states are history` says a terminal record is never reconciled in place, and the reach of that rule over an archive sweep's rewrite is what this question decides. It is filed rather than answered under `**Mode:** autonomous` because the directive's working-answer mechanism covers the reading of the grammar, not a rewrite of 37 archived records the user has not seen.

## Options

1. **Option 1 of the parent record, with the tree sweep** — land the grammar, run `bin/fusion-citation-sweep --write --yes` over the whole workbench in a second commit, repair the 17 dangling tokens by hand.
   - Pros: the grammar and the corpus agree at once; the gate stays green from the next commit.
   - Cons: 37 rewrites inside `archive/`, against the terminal-record rule as it reads today; two commits for one record, outside the plan's one-commit shape.
2. **Option 1 after the sweep learns to skip the frozen stores** — first give `bin/fusion-citation-sweep` and the check the same frozen-store exclusion the cadence and archive bodies carry (`archive/`, `stashes/`, `.migration-v2-backup/`), then land the grammar and sweep the live tree only (about 88 rewrites, 14 live files).
   - Pros: no archived record is rewritten; the exclusion is the one the conventions already name for two other consumers.
   - Cons: an extra step outside the plan; the archive keeps 37 tokens the grammar now reads as stale, so `verdict=` for a scan that includes the archive stays red unless the check excludes it too, which widens the change.
3. **Option 2 of the parent record** — keep the grammar as it is and state the asymmetry as decided: the storeless bracket form is not read, the store-prefixed one is reported, and the migrate skill is the route for a bracket-marked file.
   - Pros: nothing is rewritten; no gate moves.
   - Cons: `260831-0748_*` closes as won't-fix rather than fixed, and the class the record measured stays invisible at write time.

## Constraints

- A terminal record is read as evidence and never reconciled in place (`## Terminal states are history`); a sweep rewrite of a citation inside one is either exempt from that rule by decision or it is a violation.
- The release gate `rewrites=0` over fusion's own tree must be green at the package's bump commit.
- The one-commit-per-record shape of this package is the plan's, not a rule; leaving it is a reported deviation, not a fault.

## Recommendation

Option 2. The frozen-store exclusion is already the answer two other consumers carry, and the rewrite count it avoids (37) is the whole of what makes option 1 need the user's eyes. Step 23 stays skipped in this package; a follow-on package takes it with the exclusion in front.

---
Answered: 260922-0906-fix-package-over-every-open-issue.md, the session of 260922-1420 — option 1, the whole-tree sweep, against this record's own recommendation and with the reason stated: `## Terminal states are history` governs state (a step marker, a ticked criterion, a head field), and a citation rewritten from `[x]-` to `_*_` changes no state but respells the same pointer at the same target, which the sweep already does for spelled underscore markers inside closed records. The rule gains a clause saying citation form is not state. So: land the grammar, sweep the whole workbench including `archive/` in a second commit, repair the 17 dangling tokens by hand with their annotations, and add the sweep to `/fusion:migrate` as a closing step so a consuming project cleans up in one command after `fusion --update`; ruled by user, Kai Stalmann <ks@qantr.com>, 260922-1420.
