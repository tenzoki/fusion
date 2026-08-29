# `/fusion:setup` and `/fusion:next` cite a prompt section they have no documented route to read

---

**Severity:** Medium
**Domain:** code
**Filed by:** coderev, review of `8960e1a..HEAD` (session `260810-0241-orchestrator-session.md`, Turn 1)
**Affects:** `skills/setup/SKILL.md:242`, `skills/next/SKILL.md:104` and `:160`
**Cross-references:** commit `ff70d3a`; `skills/cleanup/SKILL.md:11, 122, 128` (the correct precedent); `260810-0352_*_setup-step-5-now-calls-a-helper-the-installed-copy-does-not-have.md` (adjacent, different mechanism — do not merge)

---

## The defect

Both new sections delegate the whole procedure to a section of another file, named by a bare relative
path:

```
skills/setup/SKILL.md:242
  Run the check from `agents/orchestrator.md` `### The queue's ground` → `#### Reading a queue`.
  That section is the canonical implementation and carries the four-row verdict table; do not
  restate the branches here.

skills/next/SKILL.md:104
  run the check from `agents/orchestrator.md` `### The queue's ground` → `#### Reading a queue`.
  … do not restate the branches here.
```

`agents/orchestrator.md` does not exist at a consuming project's root. It ships inside the plugin, and
the only documented way a skill reaches a plugin file is `$FUSION_PLUGIN_ROOT`. `skills/cleanup/SKILL.md`
sets that precedent explicitly at `:11` — *"read that skill's body from
`$FUSION_PLUGIN_ROOT/skills/<name>/SKILL.md`"* — and applies it at `:122` and `:128`. Neither new site
does.

`bin/fusion-rules` does not close the gap either: it emits rule files, and `agents/orchestrator.md` is
emitted to no agent.

## Why the older bare citations survived and these two do not

Bare citations of this shape already existed — `skills/setup/SKILL.md:227` and
`skills/cleanup/SKILL.md:114` both name `agents/orchestrator.md` Setup Step 5. They survive because
each carries an inline fallback: `cleanup:114` restates the heuristic in one line (*"strategic if
decisions dominate, knowledge if analyses with no code, data if data files dominate, else code"*), and
`setup:227` names the variables precisely enough to reconstruct.

The two new sites remove that fallback deliberately — *"do not restate the branches here"* — which
makes an unresolvable citation load-bearing for the first time. A reader who cannot open the file has
nothing at all: no branches, no verdict table, no default.

## Second, time-limited problem

Verified at HEAD: the installed copy at `$FUSION_PLUGIN_ROOT` (`/Users/k1/.fusion`) contains **zero**
occurrences of `The queue's ground`, and zero of `Drift check`. A session running `/fusion:setup` right
now against the installed plugin resolves the citation to a file that does not carry the section, and
— unlike the missing helper in `260810-0352_*_setup-step-5-now-calls-a-helper-the-installed-copy-does-not-have.md`, which fails loudly with exit 127 — this one fails
**silently**: a file is found, the heading is not, and the step is likely to be skipped or improvised.

That is why this is filed separately from `260810-0352_*_setup-step-5-now-calls-a-helper-the-installed-copy-does-not-have.md` rather than folded into it. That record is
about a `bin/` helper invoked through `$FUSION_PLUGIN_ROOT` and its failure is an exit code; this is a
prose citation with no root at all and its failure is silence. Item 2 of that record ("any future
`bin/` helper a prompt calls inherits this") does not cover cross-file prompt citations.

## Fix direction

Give the citations a root: `$FUSION_PLUGIN_ROOT/agents/orchestrator.md`, matching
`skills/cleanup/SKILL.md:11`. That fixes the general case.

Worth deciding separately, and arguably the better answer: a procedure that three consumers must run
verbatim is a **rule**, not a section of one agent's prompt. Moving `#### Reading a queue` into a rule
file under `rules/` and emitting it to the three consumers would use the mechanism the project already
has for exactly this, and would remove the cross-file citation instead of repairing it. That is the
same partition the conventions file's own header table documents for four other topics.

---
Resolved: route 1, the citation is repaired rather than removed. One paragraph near the top of
`skills/setup/SKILL.md` and `skills/next/SKILL.md` states the convention once — a path into a file
the plugin ships carries the `$FUSION_PLUGIN_ROOT` root — and cites `skills/cleanup/SKILL.md:11` as
the site that gives the reason, rather than restating it. Every citation in both files is then
rooted: in `setup` at Step 2, the churn block at Step 3 (citation only, its content untouched), the
domain heuristic and the queue's-ground check; in `next` at Step 5 item 4 and Step 6.3. That covers
`skills/setup/SKILL.md:227` and `:228`, which were outside this record's stated scope but inside the
same file.

Both queue's-ground sites gained a presence check: it greps `$FUSION_PLUGIN_ROOT/agents/orchestrator.md`
for `#### Reading a queue` and prints `queue-check: UNAVAILABLE`, naming the install and telling the
user to run `fusion --update`. Setup reports that line in place of a verdict; `/fusion:next` renders
it even though it otherwise stays silent on a healthy queue, because silence there reads as a queue
in good standing.

One deliberate consequence, recorded because it is verification strength rather than a side effect:
rooting a citation takes it out of the reference lint's heading check, which needs a backtick
immediately before the file token. Nothing is lost — `queue-ground-lint` already pins
`### The queue's ground` to exactly one occurrence in the orchestrator prompt, and the rooted path
still resolves through that lint's path class. `#### Reading a queue` was never lint-checked at all;
the new runtime grep is the first thing that checks it, and it checks the copy that actually gets
read.

Route 2 — moving the section into a rule file under `rules/` — was judged the better structural
answer and was not executed. It carries an unresolved question about which consumers a rule file can
reach, filed as `$OUT_DECISION/260810-1822_o_should-the-queue-ground-procedure-become-a-rule-file-when-one-of-its-three-consumers-cannot-be-emitted-to.md`.

Verification: `npm test` from `hooks/` — exit 0, 41 files, 1096 tests.
