# The source-root resolution becomes one helper, and the four skill-body copies become four calls

---
**Severity:** Medium
**Domain:** code
**Filed by:** orchestrator, session 260811-0752, realising an answered decision
**Affects:** four skill bodies carrying the executable snippet; a new `bin/fusion-source-root`
**Cross-references:** `shared/decisions/260810-2145_a_should-a-repeated-skill-body-snippet-become-a-bin-helper...md` — the answer this realises; `shared/issues/260811-0109_o_the-source-root-rooting-reached-two-skills-and-two-more-still-cite-the-install-copy.md` — the instance that was paid for

---

Option 1 of the answered decision. `bin/fusion-source-root` prints the source root; the four
copies become four calls.

**The evidence is not hypothetical:** a correction to this fact reached two of the four copies and
left two standing, which is the cited open record. An executable duplicate can diverge in
behaviour without anyone reading the files.

The helper is called from skill bodies, so it meets the convention answered at
`shared/decisions/260810-1544_a_...`: the call is guarded and reports absence in the fixed
vocabulary, because the installed copy of the plugin need not carry a helper added between
releases. Write the guard at all four call sites.

**Out of scope by the same answer:** the domain-capture snippet. It is the weaker case (short,
read-only, fallback stated at every site) and is a separate call once this one has proved itself.

**Acceptance:** one helper, four guarded calls, no fifth copy anywhere in `agents/`, `skills/`,
`rules/` or `bin/`; the two skills that still cite the install copy are corrected with it; suite
green.

---
Resolved: `bin/fusion-source-root` is the one home for the criterion — it prints `$PWD` when
`bin/fusion-plugin-cwd` says cwd is the plugin's own repository and `$FUSION_PLUGIN_ROOT`
otherwise, exits 2 printing nothing when neither is available (the `UNRESOLVED` case), and
exits 1 on a usage error. All four behaviours exercised by hand. The no-upward-walk bound is
inherited from `bin/fusion-plugin-cwd`, not re-decided; the script adds no walk. Added to
`.gitignore` as `!bin/fusion-source-root` and confirmed untracked-not-ignored, per the WARNING
in that file.

**Call sites: four skill bodies, six guarded calls.** `skills/setup/SKILL.md` and
`skills/next/SKILL.md` each carry two (the announcing block plus the inline re-resolution a
later fresh shell needs); `skills/cleanup/SKILL.md` and `skills/help/SKILL.md` each carry one,
newly added, and their citations of shipped files moved from `$FUSION_PLUGIN_ROOT` to
`$FUSION_SRC` with them. All six use one shape — `[ -x "${FUSION_PLUGIN_ROOT:-}/bin/fusion-source-root" ]`,
an `elif` that falls back to the install copy and names the absence on stderr, and an `else`
that yields the empty root — three branches, disjoint and complete, per the fixed vocabulary
the churn-ranking and drift-check calls already use (decision `260810-1544_*_…` part (b),
option 3: prose convention, no lint).

**The acceptance's arithmetic does not close.** It asks for "four guarded calls" *and* for the
two skills still citing the install copy to be corrected; those two clauses cannot both hold
literally, because correcting `cleanup` and `help` adds a call each. `tasklist.md` task 4 is
the more explicit statement — "the call-site count is **four, not two**", enumerating setup,
next, cleanup and help — so "four" is read here as four skill *bodies*, and `260811-0109`'s
named behavioural defect (`cleanup:125` sending a reader to the installed orchestrator prompt
for the domain cascade) is closed rather than left standing.

No fifth copy of the criterion survives: `grep -rn 'fusion-plugin-cwd' agents/ skills/ rules/`
is empty, and the three siblings that enumerated the work-tree preference's consumers were
brought onto the new list — `bin/fusion-plugin-cwd`'s own `Consumers:` header,
`hooks/session-start.ts`'s no-upward-walk comment, and `CLAUDE.md` in two places (the Layout
table gained a `bin/fusion-source-root` row; the Release-process paragraph now says the
preference covers three helpers and that the third roots *documents*, never helper resolution,
because part (c) of `260810-1544` is unanswered).

Out of scope and untouched, per the answer: the domain-capture snippet.

Verification: `cd hooks && npm test` — exit 0, 1293 passed.
