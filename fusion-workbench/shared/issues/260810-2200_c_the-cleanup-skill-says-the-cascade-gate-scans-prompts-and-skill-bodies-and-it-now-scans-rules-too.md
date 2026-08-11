The cleanup skill says the cascade gate scans prompts and skill bodies, and it now scans rules too

---

`skills/cleanup/SKILL.md:125` describes the single-definition gate as scanning "every agent prompt
and every skill body". Turn 3 added `rules/**` to the scanned set, so that sentence is now one third
short.

The reason for adding it is the reason the sentence needs updating: `rules/agent-setup.md` makes
reading every emitted rule mandatory, so a rule file is a consumer of the cascade exactly as a skill
body is. The measured cost of adding the thirteen rule files was zero false positives.

---

**Why this is a record and not a passing edit.** The sentence is a claim about a gate's reach, sitting
in a file the gate itself scans, and this session has now had three separate instances of a
hand-written reach claim drifting from the gate it describes. The Turn-3 change moved the claim into
`REACH` in `hooks/lib/domain-cascade.ts` as data, with probes the suite runs and `README-hooks.md`
rendered from it and compared byte-for-byte. This sentence is the one remaining hand-written copy of
that claim, and it is already wrong.

So the fix is not only to correct the words. Consider whether this sentence should cite the rendered
description rather than restate it, the way `README-hooks.md` now does. If it restates, it will drift
again on the next change to the file set.

**Scope note.** The executor that widened the gate found this and did not edit it, because another
executor held `skills/cleanup/SKILL.md` in the same Turn. That restraint is why this is filed rather
than fixed.

**Filed by:** orchestrator, session `260810-1646`, on the cascade-reach executor's report.

---
Resolved: `skills/cleanup/SKILL.md:125` no longer restates the reach (260811). It now cites it — the sentence names `REACH.fileSet` in `hooks/lib/domain-cascade.ts` as the file set, points at the `describeReach()` rendering the suite compares byte-for-byte against `README-hooks.md`, and tells the reader to read the reach off that block rather than off a copy in the skill. That is the option this record asked to be considered: a citation cannot go one file set short of the gate the way the removed restatement did. No glob is repeated in the skill body, so a fourth entry in `fileSet` needs no edit here.
