Nine of twelve line-number citations in shipped text name the wrong line, and no gate resolves one

---
Shipped prose cites source lines as `path:N` or `path:N-M` twelve times. Nine of those twelve name a
line that does not carry what the citing sentence says it carries, by margins from one line to a
hundred and ten. `reference-resolution-lint` resolves paths and heading anchors and never a line
number, so the class is invisible to every gate and drifts with every edit to a cited file.

---
**Filed by:** reconciler, Kai Stalmann <ks@qantr.com>
**Checkout:** 5e8248d7

**How it was found.** Loop 3's closure note on
`260904-2140_*_monitor-warnings-panel-test-fails-intermittently-on-the-dual-stack-bind.md` named one
instance and called it "a skill body cites a line range in the monitor that was already wrong before
this edit and is now further out". Verifying that note showed the same sentence carries a second such
citation, equally wrong; enumerating the surface showed the class.

**Measured at HEAD `b462d55d`**, over `skills/`, `agents/` and `rules/`, taking every backticked
`path:N` or `path:N-M` token and reading the cited line against the claim the citing sentence makes.
Two `pkg/foo.go:42` examples in `agents/consultant.md` and two format tokens in `agents/taskplanner.md`
are excluded: they cite nothing.

| citing site | cited | verdict | where the claim actually is |
|---|---|---|---|
| `skills/setup/SKILL.md:86` | `hooks/tracker.ts:33-36` | wrong | comment prose; the root-relative reads are elsewhere in the file |
| `skills/setup/SKILL.md:86` | `bin/monitor:72-75` | wrong | workbench-dir default; the reads are at `:142-144` |
| `agents/playmaker.md:110` | `agents/shaper.md:90` | wrong | the `Promoted:` line is at `:101` |
| `agents/playmaker.md:287` | `agents/shaper.md:90` | wrong | same |
| `skills/migrate/SKILL.md:18` | `bin/fusion-paths:245-248` | wrong | the workbench-root exit-1 block; `exit 3` is at `:263`, `:269`, `:275` |
| `rules/fusion-workbench-conventions.md:71` | `agents/playmaker.md:61` | wrong | a marker-rename prohibition, not a path exclusion |
| `rules/fusion-workbench-conventions.md:71` | `skills/log-activity/SKILL.md:82` | wrong | the `-not -path` find is at `:80` |
| `rules/fusion-workbench-conventions.md:71` | `skills/setup/SKILL.md:58` | wrong | blank line; the claim is at `:57` |
| `rules/fusion-workbench-conventions.md:71` | `skills/setup/SKILL.md:65` | wrong | closing fence; the probe is at `:64`, its rationale at `:57` |
| `rules/backlog-entries.md:16` | `agents/shaper.md:100` | holds | |
| `rules/fusion-workbench-conventions.md:71` | `skills/archive/SKILL.md:107` | holds | |
| `skills/setup/SKILL.md:57` | `skills/migrate/SKILL.md:54,87` | holds | both lines carry the candidate list |

Nine wrong, three right, across five citing files. The three that hold are not evidence of a working
mechanism: nothing keeps them right either, and two of the three cite files nobody has edited lately.

**Why no gate sees it.** `hooks/lib/__tests__/reference-resolution-lint.test.ts` checks two things,
stated in its own header: that a cited plugin path exists, and that a cited `` `file.md` `## Section` ``
anchor exists. A line number is neither. The gate's counted-token baseline can therefore be green
while every line number in the corpus points somewhere else, which is what it is doing now.

**Why this is worth a record and not a sweep.** The failure mode is silent and one-directional: an
edit anywhere above a cited line moves it, so the citations decay continuously while the gate that
watches this corpus reports nothing. Three of the nine were widened by this session's own commits
(`d2323105` moved `bin/monitor`'s reads down twenty lines, `b462d55d` moved `hooks/tracker.ts`'s), and
none of them was wrong *because* of this session — each was already wrong before the commit that made
it worse. That is the shape of a class that will keep arriving.

**Acceptance.** Either the nine are repaired **and** something keeps them repaired — a line-number
resolution added to `reference-resolution-lint`, checking that the cited line still carries a stated
token, is one route — or the project states that a line number in shipped text is decoration rather
than a pointer and the twelve are rewritten as heading anchors or as prose naming the symbol. Simply
repairing the nine is not acceptance: they were repaired into correctness once, by being written, and
they decayed with no one noticing.

Which of those two it is may be a decision rather than an executor's call, because the second route
touches a user-answered predicate's neighbouring gate and the first adds a check that will redden the
suite for whoever edits a cited file. This record states the defect and does not choose.

**Cross-references:**
`260904-2140_*_monitor-warnings-panel-test-fails-intermittently-on-the-dual-stack-bind.md`
(the closure note that named the first instance);
`260905-1228_*_does-a-resolution-line-cite-path-line-or-a-heading-anchor.md`
(the same question answered for a record's resolution line, where the anchor form won).
