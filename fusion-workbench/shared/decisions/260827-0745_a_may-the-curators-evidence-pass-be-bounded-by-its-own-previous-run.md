# May the curator's evidence pass be bounded by its own previous run?

---
**Domain:** code
**Filed by:** claude-code (direct session, Phase 2 of `refactor/260827-0335-bookkeeping-cost-repair-plan.md`), Kai Stalmann <ks@qantr.com>
**Cross-references:** `agents/curator.md` `## Evidence` (the mandate this record asks to change, and its stated reason) · `bin/fusion-cadence-anchor` (the anchor mechanism the bounded form would read, shipped in v10.8.1 for the reconciler's precondition) · `skills/curate/SKILL.md` (the dispatch site) · `refactor/260827-0335-bookkeeping-cost-repair-plan.md` Phase 2.2 (the audit figures and the plan step)

---

## Question

`agents/curator.md:115` mandates, in bold and by name: "**Git-history reads are not bounded by the previous run.** Read the full `git log --follow` per file every time. … a July record overturning a June rule is invisible in a window that starts in August." Evidence source 7 (`:112`) reads the whole archive store on the same reasoning: "Skipping it makes you blinder the longer a project has run, which inverts your purpose."

Both sentences are internally sound, and together they make the curator's cost strictly monotonic in project age. Measured on this repository on 2026-08-27: the survey pass reads eight evidence sources totalling ~25 MB, of which the archive store is 10 MB and only ever grows (`skills/archive/SKILL.md` never deletes); the per-file `git log --follow` runs over 15 surface files against a 1,000-commit history, every run; and each run writes a 28–68 KB run file into `$SCAN_HISTORY`, which is evidence source 3 — the cost feeds itself. A further inversion: `/fusion:cleanup` Step 4 (archive) moves bytes from live stores the curator reads into the archive store the curator also reads, so archiving reduces the curator's cost by exactly nothing. This pass is the single largest fixed cost in the cleanup pipeline the user measures at ~10 minutes.

The question the mandate's own reason poses: is the July-overturns-June case worth a full pass on *every* run, or is it worth a full pass on a *schedule*, with the runs in between bounded by an anchor?

## Options

1. **Bound the pass by the anchor; a full pass on demand.** Evidence since `last_curator_run` (read through `bin/fusion-cadence-anchor`): git history since the anchored commit, records whose stamp or mtime postdates it, and the archive only for entries moved since it. `--full` on `/fusion:cleanup --only claude-md` forces the unbounded pass; a missing or unresolvable anchor forces it too (first run, fresh clone).
   - Pros: removes the monotonic term from every routine run; the user gate and the per-entry evidence tiers are untouched, so nothing lands with less scrutiny — the bounded pass proposes less, it does not approve more. The July-overturns-June record is not lost, only deferred: it surfaces on the next `--full`, or whenever the rule it overturns is next touched (a touch postdates the anchor by definition).
   - Cons: a contradiction between two *old* surfaces — neither touched since the anchor — stays invisible until someone runs `--full`, and nothing prompts them to. The mandate's sentence stops being true and has to be rewritten, not merely softened.
2. **Bound routine runs, force a periodic full pass.** As option 1, plus a written cadence: every Nth run (or first run of a calendar month) is unbounded, decided mechanically from the anchor's age, not by the user remembering.
   - Pros: caps the blindness window at the cadence length; keeps routine runs cheap; the old-vs-old contradiction case has a guaranteed discovery horizon.
   - Cons: a cadence is a new number the prompt has to carry and justify; the expensive pass still happens, just less often; and the run that happens to be the full one is unpredictable to the user who invoked cleanup expecting the cheap shape.
3. **Keep the mandate; pay the cost.** The status quo: every run reads everything.
   - Pros: no blindness window of any kind; the mandate's reasoning stands unedited.
   - Cons: the measured cost curve — strictly monotonic, self-feeding, immune to archiving — is what the repair plan exists to break, and this pass is its largest single term. At the measured trend the pass gets slower every week the project lives.

## Constraints

- **The gate does not move.** Whatever bounds the evidence, nothing reaches `CLAUDE.md`, the rule files, or the decision records without the survey→ledger→user-approval→apply shape; this record is about what the survey *reads*, never about what the apply pass may *do*.
- **A skipped read may only rest on a proven bound.** Same rule the reconciler's precondition ships with (`bin/fusion-cadence-anchor`'s header): an unresolvable anchor answers `unknown`, and `unknown` runs the full pass. Silent narrowing on a broken anchor is the failure mode this constraint forbids.
- **The `agents/` surface stands at 417,842 of 417,843 bytes.** The rewrite of `:112`/`:115` must pay for its own bytes inside `agents/curator.md`; the mandate paragraph it replaces is the budget.
- **The next full pass after this change must be unbounded regardless of the anchor**, so the transition itself hides nothing: the anchor starts counting from a pass that saw everything.

## Answer (260827, user, at the gate)

**Option 1 — bound the pass by the anchor; a full pass on demand.** Routine runs read evidence since `last_curator_run`; `--full` (dispatched as `**Scope:** full`) forces the unbounded pass; a missing or unresolvable anchor forces it too, which also satisfies the transition constraint by construction. Realised in `agents/curator.md` `## Evidence` and `skills/curate/SKILL.md` in the same change set as this answer.
