The relocated skills row points at a `## What this is` section that its new file does not have, and at a bullet that left the file that does

---

`README-agents.md:199` says the skills division is *"enumerated once, in the skill-bodies bullet under `## What this is`"*. `README-agents.md` has no `## What this is`. The file that has one — `CLAUDE.md` — no longer carries that bullet: it moved to `README-agents.md` in the same commit.

---

**Filed by:** reviewer, Kai Stalmann <ks@qantr.com>

**Evidence.** At `7ea6e40b`:

- `README-agents.md:199` (the `skills/<name>/SKILL.md` row, moved by `L09` into `## Plugin structure`): *"**How they divide … is enumerated once, in the skill-bodies bullet under `## What this is`** — this row deliberately does not restate it."*
- `grep -n '^#\{1,4\} ' README-agents.md` lists no `## What this is`.
- The bullet it names moved by `L04` into `README-agents.md:262`, `### skills/ — one file per slash command`. `CLAUDE.md:17` is now a pointer in its place.

So the reference is broken in both directions: the named section is absent from the row's own file, and in the file that does carry that heading the named bullet is gone.

The claim "enumerated once" is separately loose and was loose before the move — `README-agents.md:242` states the same division independently, and `L04` landed the bullet 20 lines below it, so `README-agents.md` now states it twice inside one section. That part is context, not this defect.

**Why no gate sees it.** `reference-resolution-lint` reads one anchor per path token; `` `## What this is` `` carries no path beside it, so there is nothing to resolve. Checked: this is the only one of the 22 relocated passages whose bare same-document heading fails to resolve at its destination — `## Project language`, `## Origin Rule` and `## Where this work stops` each name a heading in a file the surrounding prose identifies.

**Acceptance test.** `README-agents.md:199` names a heading that exists in the file it points at, and that heading's section carries the enumeration it claims. Verified by resolving the token against `grep '^#\{1,4\} '` over the named file.

**Cross-references:** 260916-1612-curator-run.md, 260908-1814_*_the-layout-rows-skill-split-still-reads-three-and-three-and-omits-post.md
