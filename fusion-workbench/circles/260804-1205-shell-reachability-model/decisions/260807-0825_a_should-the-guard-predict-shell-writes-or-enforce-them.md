# Should the guard predict which files a shell command writes, or make protected paths genuinely unwritable?

---
**Domain:** code
**Status:** open
**Filed by:** orchestrator (raised by the user mid-Turn, 260807-0825)
**Cross-references:**
- `circles/260804-1205-shell-reachability-model/_t_circle.md` — the Circle this question suspends
- `circles/260804-1205-shell-reachability-model/planning/260806-2353_o_plan-shell-reachability-model.md` — the plan, steps 1 and 2 landed, 3 through 11 unstarted
- `circles/260801-1244-guard-rules-write/issues/260805-1830_o_alle-17-guard-blocks-im-beobachteten-konsumprojekt-waren-fail-closed-fehlalarme.md` — the measured false-alarm rate
- `circles/260801-1244-guard-rules-write/reviews/260804-0845-coderev-turn7-separator-degrade-and-the-cause-bound.md` §`### The boundary, by coverage` — the standing statement of what is out of reach by nature
- `rules/protected-path-discipline.md` §`## Where this check does not reach` — the guard's own concession
- `circles/260804-1205-shell-reachability-model/decisions/260807-0250_i_does-a-pipelines-subshell-fact-reach-every-segment-of-a-compound-element.md` — a sub-question of the current approach, answered by measurement during this session

---

## Question

The guard decides, before a `Bash` command runs, whether that command writes a path on
`guard.protectedPaths`. Deciding this from the command's text is undecidable in general: a
path can be built at run time, arrive on standard input, or pass through `eval`, an alias, a
function, or an environment variable the classifier never sees. The guard's own rule file
already concedes the point, catalogues twenty-one residuals, and states that completeness is
not the target.

The question is whether to keep refining the prediction, or to change the mechanism so that
the prediction is not needed.

It is filed now because the cost and the benefit both became measurable in one session, and
they point in opposite directions.

## What this session measured

Verified during the session of 260806-2158, and cited rather than summarised:

1. **The approximation keeps producing holes as it grows.** The plan needed two repair passes
   before any classifier code moved. The design as approved by the user contained five holes
   that would have allowed a command to delete a protected rule file. `{ cd rules; } | cat &&
   rm x.md` removes the file in both `bash` and `zsh`. The holes surfaced only because plan
   step 1 built a measurement instrument before the change it measures.
2. **The instrument still cannot express the worst case.** The corpus generates 93,744
   commands and cannot produce the operand shape where those five holes lived: a path that is
   protected where the shell actually stands and harmless where the model thinks it stands.
   Filed at `circles/260804-1205-shell-reachability-model/issues/260807-0251_o_the-corpus-cannot-generate-the-operand-shape-where-the-worst-holes-were-measured.md`.
3. **The benefit does not reach the observed friction.** In four days of a real consuming
   project the guard fired seventeen times and every one was a false alarm. All seventeen
   belong to the unresolvable-operand class, which this Circle's Directive explicitly leaves
   untouched. The Circle would make 84 generated commands stop being blocked, none of which
   anyone was observed writing. Recorded in the cross-referenced issue; not re-derived in this
   session.

## Options

1. **Keep predicting, finish the reachability model.** Steps 3 through 11 of the standing
   plan.
   - Pros: the work is half done and green; the five holes found are already closed; the
     compound-command over-denies are real even if unobserved.
   - Cons: spends effort on an undecidable question; each pass so far has found new holes;
     does not move the only friction anyone has measured.
2. **Make protected paths genuinely unwritable for the agent's shell** — file permissions, a
   read-only mount, or running the agent's shell as a user without write access.
   - Pros: decidable by construction. The shell fails on its own and no classifier is
     consulted. Sound against exactly the cases the parser cannot reach.
   - Cons: needs a per-platform story; interacts with the plugin's own repo stand-down; the
     agent meets an operating-system error rather than an explaining deny message, which is
     the thing `protected-path-discipline.md` was written to avoid.
3. **Detect afterwards instead of predicting** — let the command run, notice that a protected
   path changed, revert it and halt.
   - Pros: also decidable; the guard already owns halt and churn-tracking machinery; the deny
     message can still explain.
   - Cons: the write happens before it is undone, so it is unsuitable for anything that is not
     recoverable from git; a destructive command that also destroys the evidence is not
     covered.
4. **Run the command in a sandbox and inspect what it touched.**
   - Pros: decidable, and the strongest of the four.
   - Cons: the heaviest to build; every read-only command pays for it unless the classifier
     still triages, which reintroduces a smaller version of the same problem.

## Constraints

- The guard's stated purpose is preventing an LLM agent's accidents, not defending against an
  adversary. Soundness against deliberate evasion was never the bar, which is why the residual
  catalogue is acceptable. Any answer may assume the same bar.
- Whatever is chosen must keep the explaining deny. An agent that meets an unexplained failure
  works around it, and that failure mode is the reason the rule file exists.
- The plugin's own repository stands the write guard down. Any enforcement mechanism needs the
  same stand-down, or fusion cannot be developed in it.
- Two commits of this Circle's work are already on `main` (`3dc5014`, `9a24c9b`). Neither
  changes a guard verdict: the differential reports zero rows moved across 93,744 commands.
  So no option here has to be sequenced around a live behaviour change.

## Recommendation

None offered. The trade-off is the user's: option 1 is defensible if the guard is read as an
accident speed bump whose precision matters for developer friction, and options 2 through 4
are better if it is read as a boundary that should hold. The session was stopped by the user
before this was decided, which is the correct place to stop.

What should not happen is starting step 3. That is the step where the classifier's verdicts
first move, and the measurement instrument still has the gap named above.

---
Answered:
Implemented:
Deferred:
Superseded by:

---
Answered: Der Nutzer hat am 260807-0923 im Chat Option 3 gewählt (nachher erkennen statt vorher
vorhersagen), erweitert um den vollständigen Rückbau des Klassifizierers. Umgesetzt wird sie im
Circle `circles/260807-0923-guard-misst-statt-orakelt/`, der diesen Circle ablöst. Zwei
Randbedingungen kamen mit der Antwort: die grobe Vorwarnung aus der vorgeschlagenen Variante C
entfällt ausdrücklich, weil sie der Keim wäre, aus dem das Orakel nachwächst; und das
MECE-Prinzip wird als Abschnitt in `rules/critical-stance.md` verankert statt als eigene
Regeldatei.
