Cadence names its report after one person and reports every person's work

---
`/fusion:cadence` writes `cadence-$USER.md` and gathers every session history in `$SCAN_HISTORY` with no author filter and no per-person grouping. In a project with two people the file is named after one of them and digests both.

---
**Filed by:** analyst, Kai Stalmann <ks@qantr.com>

**Severity:** Low today, Medium under the multi-checkout arrangement. It misleads rather than fails.

**Cross-references:**
`260904-1058-identity-per-instance-and-the-checkout-registry.md` `### 2. /fusion:cadence aggregates nothing per person today`;
`260904-1058_*_four-tracked-workbench-filenames-are-keyed-by-the-os-account-name-the-identity-decision-rejected.md` (the filename half of the same site).

## Evidence

- `skills/cadence/SKILL.md:42`: "`$USER` fixes the output filename `cadence-$USER.md` and the activity-log filename `activity-log-$USER.md`." It is used for nothing else.
- `skills/cadence/SKILL.md:74`: source `h` is "every directory in `$SCAN_HISTORY`", unfiltered.
- `skills/cadence/SKILL.md:199-217`: the three report sections group by date and by churn, never by writer.
- `skills/cadence/SKILL.md:173`: the one identity filter in the skill is Step 7b's, and it filters by `checkout`, not by person.

## The ambiguity

Two readings are available and the file does not choose. Either the digest is a project digest saved per reader, in which case the content is right and the filename overpromises. Or it is a personal digest, in which case the filename is right and the gathering step is unfiltered. Session histories carry `**Filed by:**` with a person half, so the second reading is now implementable and was not when the skill was written.

## Acceptance test

The skill states which of the two it is. If personal, the gathering step filters on the person and the report says whose work it covers. If project-wide, the filename stops naming a person, or the report opens by saying it covers everyone.

---
Reconciled 260905-2015 (reconciler, HEAD `5b84b13a`): still open, and one half of the site moved
underneath it without settling the question.

`e1e72f77` rekeyed the personal log filenames from the operating-system account name to the minted
checkout identifier, which closed the sibling record this one names as the filename half. So
`skills/cadence/SKILL.md:9` and `:176` now write `cadence-$CO.md` and `:42` says `$CO` is that run's
checkout, never `$USER`. The report's own title line is `# Cadence — <$CO>`.

The gathering step did not move. `skills/cadence/SKILL.md:78` still names source `h` as "every
directory in `$SCAN_HISTORY`", unfiltered, and `:111` gathers them all; the three report sections at
`:199-217` still group by date and by churn and never by writer. The one identity filter in the skill
is still Step 7b's, at `:173`, and it filters the event lines by checkout while the histories beside
it are unfiltered — so the report now mixes two scopes in one document.

**The record's ambiguity is therefore not resolved, it is restated one level over.** The file is named
after a checkout rather than a person, and it still digests every checkout's sessions. The acceptance
asks the skill to say which of the two it is, and the skill still does not say.

---
Resolved: ea819262 — the digest states its scope, names the writers it covers via a new Covers line read from each history Filed by field, and labels the session-flow section as this checkout only. It does not filter or group by author, which is the project-wide branch of the acceptance: the cross-referenced analysis prices per-person aggregation as new capability for its own Circle, and the filename pattern is settled in the conventions. A history with no person half is unattributed, never assumed to be this checkout.
