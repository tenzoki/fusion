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
