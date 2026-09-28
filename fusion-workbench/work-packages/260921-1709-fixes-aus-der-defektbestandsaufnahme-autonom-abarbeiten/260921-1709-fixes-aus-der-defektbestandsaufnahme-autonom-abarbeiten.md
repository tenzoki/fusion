# Die Fixes aus der Defektbestandsaufnahme 260921-1653 als Paket autonom abarbeiten

---
**Domain:** code
**Status:** done
**Claim:** 5e8248d7 — Kai Stalmann <ks@qantr.com>, 260921-1709
**Mode:** autonomous
**Active spec/plan:** 260921-1726_*_the-33-open-defects-of-the-11-9-1-survey-worked-autonomously-as-one-package.md (the plan; no spec, planned from the directive)
**Cross-references:** 260921-1653-open-defect-survey-at-11-9-1.md, 260920-2151-sieben-neue-defekte-selbstaendig-abarbeiten.md
**Filed by:** user, Kai Stalmann <ks@qantr.com>

---

## Directive

Plane die Fixes als neues Paket zur autonomen Ausführung und starte es. Ich meine alle. Die Fixes sind die, die die Bestandsaufnahme 260921-1653-open-defect-survey-at-11-9-1.md über die 33 offenen Fehlerberichte an HEAD `3d02c7fd` (fusion 11.9.1) ausweist: alle 26 noch bestehenden; das Schließen der 6 bereits behobenen und des 1 gegenstandslosen Eintrags; und der Nebenfund in `hooks/vitest.config.mjs`. Wo ein Eintrag an einer offenen Entscheidungsfrage hängt, nimmt der Plan die Empfehlung des Entscheidungsdatensatzes (oder, wo keiner existiert, die vom Planer abgelegte Frage samt Empfehlung) als Arbeitsantwort; der Datensatz bleibt offen, bis der Nutzer mit der Umsetzung vor Augen entscheidet. Erreicht ist das Ziel, wenn jeder dieser Einträge geschlossen ist, mit Beleg im Commit, und jede dabei getroffene Arbeitsantwort in einem Entscheidungsdatensatz benannt ist.

---
Closed 260921-2058: done. Commit range `9f9e26e4..ec6fa273` (v11.9.1 to the closing review, 34 commits): 27 of 28 plan steps landed, one commit each, closing 29 of the 33 records the survey `260921-1653-open-defect-survey-at-11-9-1.md` placed (26 still-present rows less step 23's, plus the seven already-fixed or obsolete in `a33413f9`); the bump to 11.10.0 is `64b607a9`. Step 23 (the storeless bracket-marker reading, record `260831-0748_*_a-storeless-bracket-marked-citation-is-invisible-while-a-store-prefixed-one-is-reported.md`) was skipped because the reading would rewrite 37 archived records; the choice is `260921-2002_*_does-reading-the-bracket-marker-form-sweep-the-frozen-stores-or-does-the-sweep-first-learn-to-skip-them.md`, open. Eight working answers were taken and each stands as a `Working answer (plan 260921-1726)` line on its `_o_` decision record, no marker moved; step 11 replaces the gate mechanic of `260913-0909_*_may-the-orchestrator-reach-every-tool-and-may-an-agent-dispatch-another.md`, whose supersession is the user's call. The second opinion rejected one concept (step 21, reworked) and accepted nine. Review coverage: `260921-2049-reviewer-closing-pass-over-the-survey-fix-package-v11-9-1-to-11-10-0.md` over `9f9e26e4..64b607a9`, no release blocker, three defects filed in this container (`260921-2049_*`, three records); `ec6fa273` itself is uncovered. Two further defects filed here mid-run: `260921-1855_*_readme-hooks-says-the-two-re-baselines-are-logged-in-full-in-the-growth-bound-test-header-after-the-log-rolled-out.md` and `260921-1931_*_a-coder-ran-git-reset-hard-in-the-live-tree-and-an-hour-of-uncommitted-event-log-rows-is-gone.md` (the event-log rows between `73c11cfd` and `10124e3a` are lost; the commits are not). Under `**Mode:** autonomous` the plan's stop conditions were not put to the user; all twelve are carried here verbatim, none marked as failing:
1. Every step above is `[DONE]` with its record renamed to `_c_` and one commit per record (steps 2 and 27 with their several records in one commit each, steps 17 and 28 with a commit and no record), or is named in the final report's "skipped" part with the reason, and no step is left `[IN PROGRESS]`.
2. Step 2's experiment was run at step 1's commit and its figure out of twenty is stated in a commit message; on a figure above zero the five load records stay `_o_` with the measurement appended, and the report names that as the reason.
3. The second opinion has not rejected three concepts in a row. If it has, the package stops at that point: the remaining steps stay unstarted and are named as unstarted, the report names the three rejected concepts and what each rejection said, and step 28 still runs if at least one record commit landed.
4. Every working answer in `## Working answers` was taken as written, or the step names why it could not be; each record it hangs on carries the `Working answer (plan 260921-1726): …` line after its step landed; no decision marker moved.
5. The hook-test surface stayed inside its bound at every commit, funded by step 17 alone and never by a baseline edit; a test-bearing step whose case did not fit is named in the report as deferred with the lines it needed, and its record stays `_o_` with an `Also seen:` line saying so.
6. Step 20's line-number refusal found at most ten tokens beyond the two step 3 removed, all rewritten in that commit; or more, and the report names the files as deferred.
7. Nothing is pushed: `git status -sb` at the end shows `main` ahead of `origin/main` by the package's commits and no `git push` was run; no tag was written.
8. `/fusion:cleanup` was not run.
9. Every commit's suite run was one run, alone, on an idle tree, and exited 0.
10. The `Resolved:` line of every closed record cites its commit.
11. The version in `.claude-plugin/plugin.json` is `11.10.0` and the bump is the package's last commit.
12. The final report carries the directive's four parts: what is fixed, what was skipped and why, every working answer and non-trivial decision with one sentence of reasoning, and what waits on the user's ruling (the eight decision records in `## Working answers`, each `_o_`).
Closed by the user's word at the finish gate, which asked because step 23 stood open; ruled by user, Kai Stalmann <ks@qantr.com>.
