The citation rooting reached two of three skills, and the paragraph announcing the rule cites an unrooted path

---

`89b13f1` roots plugin-file citations through `$FUSION_PLUGIN_ROOT` in `/fusion:setup` and
`/fusion:next`. Two gaps remain, both mechanical.

**1. `/fusion:cleanup` was edited in the same session and did not get the treatment.**
`skills/cleanup/SKILL.md:114` still reads:

> Detect the workbench domain the same way the orchestrator does (Setup Step 5 in
> `agents/orchestrator.md`) …

That is the same defect issue `260810-0501` closed for the other two skills: in a consuming project
there is no `./agents/`, so the path resolves to nothing and the reader either invents the procedure
or skips it. `/fusion:cleanup` also carries no equivalent of the blanket paragraph the other two
gained (`skills/setup/SKILL.md:12`, `skills/next/SKILL.md:13`), so nothing in the file tells a reader
which root to use. (What that citation points *at* is a separate and larger defect —
`260810-1918_o_the-cleanup-skill-carries-a-second-domain-cascade…`.)

**2. The paragraph that states the rule breaks it in its last sentence.** Both copies end:

> `skills/cleanup/SKILL.md:11` takes that route for skill bodies and states the reason; it is not
> repeated at each site here.

`skills/cleanup/SKILL.md:11` is a bare `skills/…` path — the exact form the sentence before it says
"resolves to nothing there". The citation is accurate as to content (line 11 is indeed the
`$FUSION_PLUGIN_ROOT/skills/<name>/SKILL.md` instruction), which makes the omission harder to notice
rather than easier.

---

**Failure scenario.** A consuming project runs `/fusion:cleanup`. The reconcile step reaches line
114, tries to open `agents/orchestrator.md` relative to the project root, finds nothing, and falls
back to the prose summary in the same sentence — which is the pre-fix cascade. Meanwhile a reader
of `/fusion:setup` who wants to check what the rooting rule actually says follows
`skills/cleanup/SKILL.md:11` from the project root and finds nothing there either.

**Fix.** Root the citation at `skills/cleanup/SKILL.md:114`; add the blanket paragraph to
`skills/cleanup/SKILL.md` alongside its existing line 11; write the self-citation in both copies as
`$FUSION_PLUGIN_ROOT/skills/cleanup/SKILL.md:11`.

**Cross-references.** `shared/issues/260810-0501_c_two-skills-cite-a-prompt-section-they-have-no-
documented-route-to-read.md`; `shared/issues/260808-0030_o_line-number-citations-into-rule-files-go-
stale-and-no-gate-reads-them.md` (the `:11` and `:114` anchors here are exactly that class).

**Filed by:** coderev, review of session `260810-1646` Turn 1, range `5ef92eb..940d522`.

---
Partially resolved — half 1 done, half 2 blocked on file ownership, record stays `_p_`.

**Half 1 (done).** `skills/cleanup/SKILL.md:11` now carries the blanket rule, extended in place
rather than added beside it: `$FUSION_PLUGIN_ROOT` roots every path into a file the plugin ships,
an agent prompt as much as a skill body, and rule files are named-not-opened because
`bin/fusion-rules` prints them absolute. Kept at line 11 deliberately — `/fusion:setup` and
`/fusion:next` both cite `skills/cleanup/SKILL.md:11`, and inserting a paragraph above it would have
moved the anchor those two cite. Every plugin-file citation in the file is now rooted; the one at
`:114` went away entirely with the cascade paraphrase (see
`260810-1918_c_the-cleanup-skill-carries-a-second-domain-cascade…`), and the reconcile step's new
citation of Setup Step 5 is written `$FUSION_PLUGIN_ROOT/agents/orchestrator.md`.

---

Resolved — half 2 done, one substitution per file, and the cited line was checked before the edit.

`skills/setup/SKILL.md` and `skills/next/SKILL.md` now end the announcing paragraph with
`$FUSION_SRC/skills/cleanup/SKILL.md:11`. The anchor was verified against the file rather than
assumed from half 1's note: line 11 of `skills/cleanup/SKILL.md` still carries the rooting
instruction, so extending that paragraph in place instead of inserting above it did keep the citation
valid.

**One deviation from the prescribed fix, stated.** The record and half 1 both name
`$FUSION_PLUGIN_ROOT/skills/cleanup/SKILL.md:11`; what was written is `$FUSION_SRC/…`. The two
differ only inside the fusion plugin's own repository, and there `$FUSION_PLUGIN_ROOT` is the
installed copy while `$FUSION_SRC` is the work tree. The sentence being repaired sits three lines
below the paragraph that introduces `$FUSION_SRC`, whose whole argument is that citing the install
while reading the work tree hands you two versions of one file differing in silence — and this
citation carries a line number, which is exactly the kind of anchor a stale install gets wrong. Using
the root that paragraph just mandated makes the sentence obey the rule it announces. In a consuming
project the two roots are the same value, so nothing changes there.

The reference lint is unaffected either way: `ROOT_VAR_RE` only knows the `FUSION_PLUGIN_ROOT` and
`CLAUDE_PLUGIN_ROOT` spellings and checks existence, not rooting, so both forms pass — which is
`260810-2029`, still open.

**Resolved by:** coder, session `260810-1646`, Turn 3.

**Half 2 (not done).** The self-citation in the announcing paragraph is still bare in both copies —
`skills/setup/SKILL.md:12` and `skills/next/SKILL.md:13` each end with `skills/cleanup/SKILL.md:11`,
the exact form the sentence before it calls unresolvable in a consuming project. Both files were
held by other executors this Turn (Turn-2 dispatch: stay out of `skills/setup/SKILL.md` and
`skills/next/SKILL.md`), so the edit was not made. It is one substitution per file, to
`$FUSION_PLUGIN_ROOT/skills/cleanup/SKILL.md:11`, and the cited content at that line is still
correct after half 1.
