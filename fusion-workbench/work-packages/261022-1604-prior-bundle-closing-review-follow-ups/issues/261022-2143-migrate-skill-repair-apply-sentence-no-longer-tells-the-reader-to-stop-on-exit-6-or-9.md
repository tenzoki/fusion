The migrate skill's repair --apply sentence no longer tells the reader to stop on exit 6 or 9
---
`a740170a` (plan step 7) added exit 3 to the `repair --apply` sentence in `skills/migrate/SKILL.md` and, in doing so, moved the instruction "report … and stop" from exits 6 and 9 to exit 3 alone. A skill body is the user prompt, so the reader is left with no instruction on the two exits that had one.
---
**Filed by:** reviewer, Kai Stalmann <ks@qantr.com>
**Cross-references:** `261022-2142-reviewer-closing-review-of-the-prior-bundle-follow-ups.md`, `261014-0830-citation-sweep-gojson-and-migrate-repair-carry-three-small-checking-gaps.md`

## Defect

`skills/migrate/SKILL.md`, the paragraph after `> 2. Skip it: the migration stays blocked until it is fixed.` under the Repairs step.

Before `a740170a`:

> Exit 6 means it was not applied (stderr says why); exit 9 means the backup did not verify and nothing was repaired: report either and stop.

At `59992f23`:

> Exit 6 means it was not applied (stderr says why); exit 9 means the backup did not verify and nothing was repaired; exit 3 is any other fault, named on stderr: report it and stop.

"report it and stop" now binds to exit 3 only. Exits 6 and 9 are described and given no action, while the next sentence tells the reader to run `repair --list` again "after each applied repair". The exit-3 clause also drops what the code says about it: `hooks/migrate.ts` `repair` marks an exit-3 I/O error as one that "may follow a write", unlike exit 9's "nothing was repaired", and the skill does not tell the user to check the record before retrying.

## Fix direction

Code-implementer. One instruction covering all three exits, for example "Exit 6 …; exit 9 …; exit 3 is any other fault, named on stderr, and a file may already be written: report whichever it is and stop." Keep the surface-growth bound green by cutting, never by a baseline edit.

## Acceptance

- The sentence gives exits 6, 9 and 3 each the instruction to report and stop.
- `cd hooks && npm test` green, the growth bounds included.
