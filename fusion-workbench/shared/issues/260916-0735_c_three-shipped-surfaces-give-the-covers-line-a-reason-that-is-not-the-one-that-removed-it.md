Three shipped surfaces give the Covers line a reason that is not the one that removed it

---
The cadence digest's `**Covers:**` line named the writers of the session histories in the seven-day window. It went with the merge, and the release note, the help topic and the README each give the same reason: the session-history store is closed to writes, so the list is empty. That reason is measurably false today and is not the operative one. The merged body cannot produce the line because it never opens a session-history file at all.
---
**Filed by:** reviewer, Kai Stalmann <ks@qantr.com>
**Cross-references:** 260915-2309_*_merge-log-activity-into-cadence.md, 260915-2309_*_does-the-activity-log-keep-its-own-command-or-become-the-first-half-of-cadence.md

**Evidence.**

The three statements:

- `README.md:28` — *"the `**Covers:**` line is gone, because it counted session histories and that store has been closed to writes since v11."*
- `skills/help/SKILL.md`, `### 4. Update`, the 11.4.0 paragraph — *"because it named the writers of the session histories and that store has been closed to writes since v11."*
- `docs/upgrading-to-v11-4.md`, *"The `**Covers:**` line is gone"* — *"so that line described a frozen corpus and, on a workbench set up after v11, nothing at all."* The narrowest of the three, and still not the reason.

Why the stated reason does not hold:

1. **It is false at HEAD.** The store's newest file is `260909-1615-shaper-cut-fusion-to-a-working-minimum.md`; five files carry `260909`. `skills/cadence/SKILL.md:53` computes `week_start` as today − 7, so a run on 2026-09-16 has a window of `[2026-09-09, 2026-09-16]` and those five sit inside it. A consuming project that upgrades to v11.4 has up to seven days of the same. "Empty by construction" becomes true a day after each project's cut, not at it.
2. **It is not what removed the line.** The old body collected writers by reading each history file's `**Filed by:**` header (`git show v11.3.0:skills/cadence/SKILL.md`, step 3: *"A session history's header carries `**Filed by:** <agent>, <Name <email>>` … the person half is the writer"*). The merged body's only view of the tree is `find … -exec ls -l -T {} +` (`skills/cadence/SKILL.md:86`) — filenames and mtimes — and `:92` opens a header for date metadata alone. The writer half has no path into the digest whatever the window holds. That is the one-scan redesign, and it is irreversible without a second gather.

The removal is also outside both record surfaces that were supposed to carry it: the plan's step S1 `Delete:` list names four things and not this one, and the decision record's `## What the answer gives up` names three costs and not this one (the standalone command, the no-workbench mode, the churn grain).

The user-visible consequence nobody states: the digest can no longer name who wrote anything, in any window, ever. `skills/cadence/SKILL.md:267` is internally consistent about it (*"the only identity in the document is step 8b's own-checkout metrics"*); the three surfaces a user reads are not.

**Acceptance.** The three surfaces state the operative reason — the merged command reads the record it wrote rather than the history files, so the writer half is no longer an input — instead of, or beside, the frozen-store claim. `docs/upgrading-to-v11-4.md` says plainly that the digest no longer names writers. The decision record's `## What the answer gives up` gains the cost, or a line says why it does not belong there.

---
Resolved: the operative reason verified, then written in all three places. Verified: `grep -c 'Filed by' skills/cadence/SKILL.md` returns **0** — the merged body's only view of the tree is the `find … -exec ls -l -T {} +` block in step 3 plus a header read for date metadata, so a history file's `**Filed by:**` header is never opened and the writer half has no path into the digest whatever the window holds. The frozen-store claim was also checked and is false at HEAD: six files in `shared/history/` carry `260909`, all inside a run-today window of [2026-09-09, 2026-09-16]. `README.md`, `skills/help/SKILL.md` `### 4. Update` and `docs/upgrading-to-v11-4.md` now each state the operative reason and say plainly that the digest names no writers in any window; the upgrade note keeps the frozen-store fact in a parenthesis that says explicitly it does not by itself empty the window. The cost is added to `260915-2309_*_does-the-activity-log-keep-its-own-command-or-become-the-first-half-of-cadence.md` `## What the answer gives up` as a fourth bullet. The plan's S1 `Delete:` list is **not** edited — the plan is `_c_` and terminal — and its annotation says where the cost was recorded instead.
