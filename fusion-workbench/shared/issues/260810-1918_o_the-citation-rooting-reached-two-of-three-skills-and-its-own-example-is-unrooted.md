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
