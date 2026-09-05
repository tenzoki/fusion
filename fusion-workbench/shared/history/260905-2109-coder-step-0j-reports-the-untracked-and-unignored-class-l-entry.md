# Step 0j reports the class L entry that is untracked and covered by no ignore rule

**Status:** Complete
**Filed by:** coder, Kai Stalmann <ks@qantr.com>

## What was asked

One record: `260828-0853_*_setup-step-0j-misses-a-class-l-entry-that-is-untracked-but-not-ignored.md`.
Step 0j's class L loop reported an entry only when `git ls-files --error-unmatch` said it was
tracked, so an entry that is neither tracked nor ignored passed silently while standing as `??` in
`git status`, where the next `git add` of a directory would commit it. The measured instance was
`fusion-workbench/.cadence-anchors`, repaired by hand in session
`260828-0846-orchestrator-session.md`; what closes the record is the probe carrying the check.

Scope: `skills/setup/SKILL.md` alone. No build, no commit, no whole-tree git command; siblings were
editing `rules/agent-setup.md`, `skills/cadence/SKILL.md`, a hook test and four files under
`hooks/`.

## What changed

`skills/setup/SKILL.md` Step 0j, two places.

The class L loop became an if/elif over the same roster rather than a second loop, so the two
states are read once per entry and stay disjoint:

```bash
    if git ls-files --error-unmatch "fusion-workbench/$p" >/dev/null 2>&1; then echo "gitignore: class L entry $p is tracked — not repaired, report it"
    elif [ -e "fusion-workbench/$p" ] && ! git check-ignore -q "fusion-workbench/$p"; then echo "gitignore: class L entry $p is untracked and covered by no ignore rule — not repaired, report it"
    fi
```

`git check-ignore -q` is the question the two `260825-1030` decisions prescribe and the step's other
two loops already ask. The `[ -e ]` guard is what keeps the branch from firing on every entry a
workbench does not currently hold: `check-ignore` answers for a path that does not exist, so without
it a fresh workbench would report `.commit-lock`, `.session-marker` and the rest as departures.

The step's prose gained one sentence naming the new state, why it matters and why it is reported
rather than repaired. The repair mandate is untouched: nothing is tracked in this state, so the
direction-B criterion in
`260825-1030_*_may-a-project-depart-from-the-four-class-partition-deliberately-and-say-so-once.md`
(repair a wrong answer, report noise) has nothing to repair, and `.checkout-id` stays the single
repaired entry.

## What the probe measured

The block was extracted verbatim from the edited body with `awk` and run over three scratch git
roots, each with a tracked `fusion-workbench/`:

| Root | State of the class L entry | Output |
|---|---|---|
| 1 | `.cadence-anchors` present, untracked, in no ignore rule (the record's instance) | the new line, `.gitignore` untouched |
| 1 | `portfolio.md` present and ignored | silent |
| 2 | `portfolio.md` tracked | the old tracked line, unchanged |
| 2 | `.guard-state/` present, untracked, unignored | the new line |
| 3 | nothing on disk, conformant root | no output |

Block exit 0 in every case, and no root's `.gitignore` moved.

One wording repair came out of that run. The message first read `?? in git status`, which is false
for an empty `.commit-lock` directory: git shows nothing for one, while `check-ignore` correctly
reports that no rule covers it. The line now says `covered by no ignore rule`, which holds in both
cases, and the prose says the entry stands as `??` from the moment it holds a byte. Reporting the
empty directory is the mechanism working early, not a false positive: the rule is missing either way.

## Verification

`npx vitest run lib/__tests__/surface-growth-bound.test.ts` from `hooks/` — exit 1, on the golden
assertion only, which any edit to a bounded surface produces until the golden is regenerated. The
bound itself passes: `skills/` stands 4 624 bytes over its 240 614-byte baseline against 20 000 of
head-room, of which this edit is 645 bytes and the sibling's `skills/cadence/SKILL.md` the rest. No
baseline was touched.

`npx vitest run` over the citation, reference-resolution, path-literal and marker-format lints — the
dangling-reference assertion passes with the new record citation in place. The pinned-count
assertion in `reference-resolution-lint.test.ts` fails at 225 anchors / 1624 paths against a pinned
224 / 1622. That drift is **not** this edit: measured by reverting `skills/setup/SKILL.md` to `HEAD`,
re-running, and reading the same 225 / 1624, then restoring the file and confirming it byte-identical.
It is the sibling's `skills/cadence/SKILL.md`. Re-approving that pin is the batch's to do, in the
file a sibling is editing.

`bin/fusion-prose-metric skills/setup/SKILL.md` — 87 em-dashes over 5 605 prose words, the same 87
the file carried at `HEAD`. This edit added none in prose; the two in the shell sit inside a fenced
block, which the metric excludes. The file was already over the ceiling before the edit.

## What is left for the dispatcher

The `skills` golden in `hooks/lib/__tests__/surface-growth-bound.test.ts` needs regenerating once for
the whole batch, and the reference-resolution pin re-approving. Both files are outside this task's
scope and one of them has a sibling in it.

The defect record is left `_o_` and unedited, as dispatched.
