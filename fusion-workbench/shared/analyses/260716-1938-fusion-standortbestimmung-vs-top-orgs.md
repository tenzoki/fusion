# Analysis: fusion as an AI workbench — honest standing vs. top-tier practice

**Date:** 2026-07-16 19:38
**Type:** Comparative / Critique
**Status:** Complete
**Requested by:** user (Kai)

## Question

The user received a favourable assessment of fusion ("more mature than Level 2", "what both articles sell as *how far the top orgs are*, we already have in the Coordinator/Verifier/Gate design") and judges it "not the full truth". This analysis tests that assessment against fusion's actual implementation and against what top-tier organisations actually do — and consolidates with the prior critique of 2026-06-21.

## Scope

- fusion plugin source at HEAD (`6d4a88d`), full audit of `hooks/`, `agents/`, `rules/`, `bin/`, `settings.json`, `hooks/config.json`
- fusion's own dogfood telemetry: `fusion-workbench/orchestrator-events.jsonl`, `issues/`, `circles/`, `history/`
- Prior analysis: `fusion-workbench/analyses/260621-1316-fusion-vs-spec-driven-agentic-engineering-critique.md`
- External practice: 12 primary sources fetched and read this session (Anthropic, Cognition, METR, DORA, Chroma, arXiv, GitHub, AWS)

---

## Findings

### 1. The central finding: fusion's vocabulary describes enforcement it does not implement

fusion's documentation and prompts use mechanical language — *guard*, *gate*, *circuit breaker*, *verdict*, *measures*, *parses*, *detects cycles*, *verifier*. Mechanically, almost all of it is either (a) an LLM forming an opinion, or (b) an event appended to a log that nothing reads.

The enforcement surface, measured:

| Layer | Lines | Can it stop anything? |
|---|---|---|
| `hooks/guard.ts` + `git-branch-guard.ts` + `escalation.ts` | ~836 | **Yes** — real PreToolUse deny |
| `hooks/tracker.ts` + churn/cross-file libs | ~400 | **No** — PostToolUse is observation-only by construction |
| `agents/*.md` + `rules/*.md` + `skills/*` | **~6,700** | **No** — model compliance only |

`hooks/tracker.ts:8-9` states it in its own header: *"PostToolUse hooks are observation-only — they cannot block tool calls."*

So `docs/philosophy.md:54` — *"Beyond a configurable threshold the guard halts the session and surfaces the pattern"* — is **false for churn**, the case it describes. Churn thresholds (`config.json:34-39`) emit `churn_warning` / `churn_critical` events. No code path anywhere converts those into a block, a gate, or any behaviour change. It is telemetry with a safety-feature name.

### 2. What actually blocks, in a consumer project: essentially one thing

Four deny paths exist in `guard.ts`. Their live surface:

| Deny path | Status in a real consumer project |
|---|---|
| **Git branch/worktree** (`guard.ts:157`) | **Live and strong.** Deterministic classifier, fail-closed on ambiguity, segments on `; && \|\| \|`, recurses into `$(...)`. Double-belted by `settings.json:21-23`. |
| **Halt latch** (`guard.ts:257`) | Live, but reachable only via 3 *consecutive* blocked writes — which in practice requires 3 consecutive branch-switch or protected-path attempts. |
| **Protected paths** (`guard.ts:288`) | **Near-inert.** The shipped list (`config.json:8-19`) is *fusion's own repo layout* — `agents/**`, `rules/**`, `skills/**`, `.claude-plugin/plugin.json`, `bin/monitor`. In a consumer project only `rules/**` (incidentally) and `fusion-workbench/.guard-state/**` exist. |
| **Decision-governed categories** (`guard.ts:292-333`) | **Dead in every default install.** `config.json:21-25` ships `decisions: []`, `categoryPaths: {}`. `findRelevantDecisions` always returns `[]`. |

Worse, the config is loaded from the **plugin install directory**, not the project (`hooks/lib/config.ts:15,21-32` walks up from `__dirname`, i.e. `~/.fusion/hooks/config.json`) — and `hooks/config.json` is itself in `protectedPaths`. A consuming project **cannot** supply its own guard config without editing the installed plugin.

And the guard fails **open** everywhere: unparseable stdin → allow (`guard.ts:194`); any thrown error → allow (`guard.ts:353-358`).

**Honest statement of fusion's mechanical contribution:** agents cannot move git HEAD, plus a halt latch. That is real, well-engineered, and genuinely more than most Claude Code setups have. It is not "Coordinator/Verifier/Gate design".

### 3. The dogfood telemetry falsifies the maturity claim — and closes the prior analysis's open thread

The 2026-06-21 analysis listed as open work (line 139):

> *"Messung: Coherence-Gate-Auslösungsstatistik über die letzten N Sessions (validiert/falsifiziert die 'Drift-Kontrolle ist reif'-These)."*

**Measured now, from `orchestrator-events.jsonl` (48 events, 2026-07-06 → 2026-07-16):**

| Signal | Count | Meaning |
|---|---|---|
| `coherence_review` | **0** | The flagship Coherence gate has **never fired** — not once, in the entire logged history |
| `circuit_breaker` | **0** | Never tripped |
| `session_start` | 4 | |
| `session_end` | **1** | 3 of 4 sessions never closed cleanly |
| `turn_start` / `turn_end` | 2 / 1 | |

This is not a "the gate ran and said Continue" result. The event is simply absent. And the spec leaves no discretion: `orchestrator.md:365,367` mandates a `coherence_review` emit **in every case**, including the skip cases (`verdict: "skipped-no-commits"`, `"skipped-no-anchor"`).

The one Turn in fusion's logged history that completed:

```
08:01:50 turn_start    resume interrupted guard side-effect fix
08:02:10 review_start   guard Bash-allow side-effect fix, 2 files
08:06:56 review_done    verdict clean; 0 new issues
08:06:56 commit         bf18fc0
08:06:56 task_done
08:06:56 turn_end       tasks_resolved=1, issues_closed=2
08:06:56 session_end
```

It had commits. Step 3c-bis sits between `review_done` and the circuit-breaker check. **The gate was mandatory, it was skipped, and nothing detected the omission.** This is the thesis in one trace: prompt-specified process is not reliably executed, and fusion has no mechanism that notices.

`fusion-workbench/circles/` is **empty**. The entire Circle portfolio apparatus — playmaker, ranking, Bounded Closure, the Rebalance gate, philosophy.md §5–§7, a large fraction of the 914-line orchestrator — has never run in 2.5 months of its author's own use.

### 4. The workbench's own metadata drifts, unvalidated

Cross-checking filename markers against body status in fusion's own `issues/`:

| Filename marker | Body says | File |
|---|---|---|
| `[c]` closed | **open** | `260707-0750[c]-bash-allow-resets-block-counter...` |
| `[c]` closed | **open** | `260707-0751[c]-guard-allow-bash-events-flood...` |
| `[c]` closed | **open** | `260707-1019[c]-fusion-plugin-root-unverified...` |

**Three of the seven marker-bearing issues contradict themselves.** Both `0750` and `0751` were "closed" by the very Turn traced in §3 — the Turn that also skipped its Coherence gate.

*Fair caveat:* in fusion's own repo `fusion-workbench/` is gitignored (`.gitignore:49`), so this is an untracked scratch area, and the drift is less consequential than it would be in a consumer project. But `docs/philosophy.md:42` claims *"Runs are auditable. Every agent's work leaves a paper trail… version-controllable"*, and the `reconciler` exists specifically to prevent this (`reconciler.md:8`: *"You never trust file headers or status markers at face value"*). The convention has no validator. Nothing checks it. It drifted in the hands of the person who wrote the convention.

### 5. No CI, no eval harness, and the tested part is the small part

- **No CI of any kind.** No `.github/`, no workflows, no pipeline. The 110 vitest tests run only if a human types `npm test`.
- **The tests cover `lib/` internals only.** `guard.ts`, `tracker.ts`, `clear-halt.ts` — the actual hook entry points, the stdin/stdout block protocol, config loading, self-detect — are untested end-to-end.
- **`dist/` is hand-built and committed.** Nothing verifies `dist/` matches source.
- **Zero evaluation harness.** No eval set, no benchmark, no golden outputs, no fixture sessions, no measurement of agent output quality. A repo-wide search returns nothing. The word "benchmark" does not appear in any agent prompt; every "eval" hit is "evaluate/evaluator" — i.e. an LLM judging, never a measurement.
- **~6,700 lines of prompt/prose — the actual product — have no test of any kind.** Release validation is `claude plugin validate .` plus a one-line smoke test (`CLAUDE.md:62`).

#### The consequence, demonstrated

Commit `4950ffa` (2026-06-24) shipped with the message *"The PreToolUse guard now intercepts Bash calls and DENIES branch/worktree-moving git operations."* The matcher in `hooks/hooks.json` did not include `Bash`. **The entire branch guard — fusion's single strongest control, 325 lines with 48 passing unit tests — was dead code in production for 13 days**, until an empirical probe caught it on 2026-07-07 (`issues/260707-0616[c]`). The unit tests passed the whole time. The regression test that would have caught it (`hooks-wiring.test.ts`) was written *with the fix*, 13 days late.

The fix then immediately introduced a second guard bug (`260707-0750`: any innocuous Bash call reset the halt escalation counter, defeating the latch). That is now fixed — and the invariant is **still unpinned by any test** (`260707-1006[o]`, open).

Two guard defects in 13 days, in the one component that matters, in a 1,900-line codebase, caught by manual probing rather than by any gate.

### 6. What is genuinely good — stated plainly

Being accurate cuts both ways. The following are real and better than typical:

1. **The git-branch guard is excellent work.** Deterministic, fail-closed, segment-aware, shell-substitution-aware, override-gated, and it correctly stays active in fusion's own repo (`guard.ts:225-243`) with a well-reasoned comment explaining why. `orchestrator.md:547` describes it accurately — *"you cannot work around it by rephrasing the command."* This is the one documented claim fully backed by code.

   **New defect found live, mid-analysis** (filed as `issues/260716-2005[o]`): the guard **denied this document being written**, because the prose contains backticked git commands. Three probes isolate it — `git switch` inside a quoted heredoc is allowed; the same string wrapped in **markdown backticks** is denied. The classifier's substitution-recursion (`git-branch-guard.ts:67-133`) reads markdown inline-code as shell command substitution and does not model heredoc quoting, where bash performs no substitution at all. Consequence: an agent asked to edit `rules/git-branch-discipline.md` — which contains those exact backticked strings — would be blocked by the rule it is documenting. This is a *precision* defect and fails in the safe direction, so it does not diminish the control. It does show that even fusion's one strong mechanism has an untested contract boundary: its 48 tests all feed it *commands*, never *data regions*.
2. **Step 3b mandates real test execution per task** (`orchestrator.md:322`: *"Execute the project's test suite and validation tools… All relevant checks must pass"*), with a bounded one-attempt bugfixer and revert-on-failure. This is the correct shape, and it demonstrably runs: `history/260707-0957` records *"hooks vitest suite 91/91 pass."* When the project has a suite, this is genuine verification — not LLM opinion.
3. **`bin/fusion-commit-lock`** is a real POSIX `mkdir` mutex with PID and stale detection. Sound primitive.
4. **The role separation is real and useful.** Reviewer-never-fixes, executor-scoped-writes, read-only analysts. This reduces a class of drift, cheaply.
5. **`CLAUDE.md:26,49` is admirably self-critical** — it names the concurrency races rather than hiding them. That honesty is a genuine asset and stands in contrast to the docs' more promotional register elsewhere.
6. **Bounded Closure** remains, as the prior analysis found, a real conceptual contribution with no counterpart in the source articles.

### 7. Consolidation with the 2026-06-21 analysis

The prior critique was **substantially right and holds up well**. Its two central findings are confirmed and now backed by hard data:

| Prior finding | Status now |
|---|---|
| §1 "Feature-Inventar statt Outcome" | **Confirmed and sharpened.** Not merely unmeasured — measurement shows the flagship feature never fired. |
| §2 "'über Level 2' ist ein Kategorienfehler"; fusion is Level-1-near on the spec axis, ahead on off-axes | **Holds.** The same category error recurs verbatim in the new feedback. |
| §5.1 Worktree scepticism | **Holds, and is now moot** — see below. |
| §5.6 Cost/model trace missing | **Still true.** Event log has no `model`, `tokens`, or `cost` field. |
| §139 open thread: measure Coherence-gate firings | **Closed by this analysis: zero.** |

**What changed since 2026-06-21 (the "partly outdated" parts):**

1. **Recommendation #2 (diagram-as-control) landed today** — `bd5f6e6`, v3.24.0: `conceptrev` + `rules/design-diagrams.md`. But in the **weaker form** than recommended: it chose **Mermaid, not D2** (the prior analysis argued D2 renders more stably, §112), and the "parsing" is an LLM reading text — `mmdc` is invoked only *"if available"* (`conceptrev.md:50`). `plugin.json` describes conceptrev as an agent that *"parses the Mermaid diagrams"*; there is no parser. The verdict is also explicitly toothless (`conceptrev.md:12`: *"You do not block anything yourself"*). Net: the recommendation was adopted in name, with the forcing-function mechanism — auto-layout exposing tangle — left dependent on the model's eyeball.
2. **Recommendations #1 (acceptance-criterion ↔ test/validator mapping) and #3 (cost/model trace) are not implemented.** #1 remains the highest-value, lowest-ceremony item, exactly as the prior analysis argued. `shaper.md:224` requires criteria be *"testable"*; nothing maps a criterion to a test.
3. **The worktree question inverted.** The prior analysis said *"zurückstellen"*. Three days later (`4950ffa`, 2026-06-24) fusion went further and **deterministically denied** `git worktree add` and `git switch` at the hook layer plus a `settings.json` deny belt. The prior analysis's §88 fact-correction (*"the commit lock makes parallelism more feasible"*) is still logically right, but the architecture has since moved the other way.

**One correction to the prior analysis:** its §19 lists the Coherence gate and Rebalance gate under *"Verifiziert gegen fusion-Quellen"*. They were verified as **specified in the prompt**, not as **implemented or exercised**. That distinction — specification vs. mechanism vs. actual behaviour — is what this analysis adds, and it is the same distinction the flattering feedback collapses.

### 8. Why the flattering feedback happened (the meta-finding)

The assessment you received was produced by an LLM reading fusion's own 6,700 lines of confident process vocabulary. It had no way to check whether any of it executes. **fusion is unusually good at describing itself, and it has no mechanism that tests the description against reality** — no CI, no eval, no assertion that the docs match the code. So the description is what gets graded.

This is not a fusion-specific pathology; it is the failure mode fusion's own `rules/critical-stance.md` §3 names ("calibrated certainty… an unchecked claim dressed as a checked one is the most damaging pattern"). The rule is loaded into every agent. It did not prevent the outcome, because a rule is a prompt, and prompts are not mechanisms. That is the whole thesis, recursively demonstrated.

---

## External comparison: what top organisations actually do

*Every source in this half was fetched and read this session. Where an earlier draft of this analysis was wrong, the correction is stated rather than quietly patched.*

### 9. The differentiator is not gate design — it is evaluation

The feedback claims *"what both articles sell as 'that's how far the top orgs are', we already have in the Coordinator/Verifier/Gate design."* Anthropic's own guidance says the opposite about what matters:

> *"Start with simple prompts, optimize them with **comprehensive evaluation**, and add multi-step agentic systems only when simpler solutions fall short."*
> — [Building effective agents](https://www.anthropic.com/engineering/building-effective-agents), 2024-12-19

And decisively: *"consider adding complexity **only** when it demonstrably improves outcomes."* On frameworks specifically, they warn that abstraction layers *"obscure the underlying prompts and responses, making them harder to debug."*

fusion is a 15-agent, ~10,000-line framework built with **zero evaluation**, whose value has never been demonstrated to improve any outcome. Measured against the model vendor's own criterion, fusion is not "where the top orgs are". It is the specific artifact that guidance says not to build until you have evidence.

**The honest answer to "where does fusion stand":** the architecture is competitive. The epistemics are not. Those are different axes, and the feedback conflated them.

### 10. On architecture, fusion is genuinely at parity — credit where due

GitHub **Spec Kit** ships `/speckit.constitution`, `specify`, `plan`, `tasks`, `implement`, `clarify`, `analyze`, `checklist`, `converge`. That maps nearly one-to-one onto fusion's rules → shaper → planner → taskplanner → coder → reconciler. fusion reached the same decomposition independently and carries two things Spec Kit does not: **Bounded Closure** and the **Coherence triangle**. The prior analysis was right that these are real contributions.

**AWS Kiro** (GA Nov 2025) ships requirements/design/tasks documents with EARS notation (`WHEN [condition] THE SYSTEM SHALL [behavior]`) and approval gates — plus the one genuinely novel mechanism in the whole spec-driven field: **property-based testing for spec correctness**, the only shipped mechanical spec-to-code check anywhere.

**Crucially, spec-driven development has no controlled evidence either.** The most-cited "56% productivity improvement, MIT Sloan/Microsoft/GitHub study" traces to an HBR piece about **Copilot autocomplete** and has nothing to do with specs. The strongest advocate paper (arXiv 2605.01160) reports **+98% PRs, +91% review time, delivery outcomes unchanged** across 10k+ developers, then proposes spec governance as the fix via a **no-control-arm** pilot.

So fusion is not behind the spec-driven field. **The field it was compared against has the same evidentiary vacuum fusion does.** The feedback's maturity ladder ranks vocabulary, not outcomes.

### 11. CORRECTION: Cognition reversed itself, and the reversal partly vindicates fusion

**An earlier draft of this analysis got this wrong.** I cited Cognition's [Don't Build Multi-Agents](https://cognition.com/blog/dont-build-multi-agents) (2025-06-12) as their current position and concluded fusion's design bet was "contested by top-tier practice". That essay's Principle 1 — *"Share context, and share full agent traces, not just individual messages"* — is no longer their position.

[**Multi-Agents: What's Actually Working**](https://cognition.com/blog/multi-agents-working) (Walden Yan, **2026-04-22**):

> *"we've found a narrower class of patterns that do [work]: setups where multiple agents contribute intelligence to a task while **writes stay single-threaded**."*

And, reversing Principle 1 for review specifically:

> *"we found this technique to work best when the coding and review agents **do not share any context beforehand**"*

Their reasoning: a clean-context reviewer is not anchored by the spec and sidesteps context rot. Devin Review *"catches an average of 2 bugs per PR, of which roughly 58% are severe."*

**On Cognition's current axis, fusion's architecture scores well:**

| Cognition's 2026 rule | fusion |
|---|---|
| Writes stay single-threaded | Yes — strictly sequential Turn loop, one task at a time (`orchestrator.md:284-296`) |
| Reviewer shares no context with author | Yes — by construction; Claude Code sub-agents share no context |
| Read-heavy parallelises; write-heavy does not | Yes — fusion never parallelises writes |

fusion's sub-agent isolation, which `philosophy.md:25` frames as making a virtue of a platform constraint, turns out to match what Cognition arrived at after shipping the opposite and retracting it. **That is a genuine, non-trivial point in fusion's favour, and I owe it the correction.**

Two caveats keep it from being a clean win. Cognition concedes the failure mode reappeared in their own parallel-writing product: *"Agents assume they share state with their children when they don't."* And Anthropic states plainly that coding is the wrong domain for multi-agent:

> *"most coding tasks involve fewer truly parallelizable tasks than research, and LLM agents are not yet great at coordinating and delegating to other agents in real time."*

Their 90.2% multi-agent result is on **research**, at ~15x token cost, in a setting where *"token usage by itself explains 80% of the variance."*

### 12. The review layer sits on instrumentation that is near-chance on code

fusion's coderev reviews coder's output and executes nothing (`coderev.md:27` READ-ONLY; it *flags* missing tests at `:63` and never runs them). All 14 non-orchestrator agents *"inherit tools and model from the parent session"* (`CLAUDE.md:20`); no agent pins a model. Reviewer and author are the same weights.

**A correction on the literature, since the ecosystem miscites it:** Zheng et al. (2306.05685) is routinely cited as proving LLM self-preference. It does not. The body says verbatim that *"GPT-3.5 does not favor itself… our study cannot determine whether the models exhibit a self-enhancement bias."* The real controlled evidence is [Panickssery et al. (2404.13076)](https://arxiv.org/abs/2404.13076): a *"linear correlation between self-recognition capability and the strength of self-preference bias."*

**The harder finding is domain-specific.** Benchmarked against test execution as ground truth, LLM judges on code collapse (arXiv 2507.16587, 8 models): best judge **Cohen's kappa = 0.21 (Java), 0.10 (Python)** — near chance. It **misjudged 50% of incorrect Java and 35% of incorrect Python as correct.**

Anthropic says the same thing operationally. Their Agent SDK ranks verification **rules-based > visual > LLM-judge**, calling the last *"generally not a very robust method."* And their harness guidance names fusion's exact symptom:

> *"Agents tend to respond by **confidently praising the work — even when, to a human observer, the quality is obviously mediocre**."*

**That is the report you received, described by the model vendor as a known failure mode of asking a model to assess work.**

Cognition's clean-context reviewer is the honest counterweight: it works by *removing* shared state, which fusion has for free. So fusion's review layer is better-positioned than the naive case. But it remains a model judging code without executing it, and that instrument reads near chance.

### 13. The scaffold premium is collapsing — the strategic finding

This is the most consequential external fact for fusion, and neither the feedback nor the June analysis contains it.

**SWE-agent's own authors publicly retracted their scaffold thesis.** The mini-swe-agent README:

> *"one year later, as language models have become more capable, **a lot of this is not needed at all**."*

The measured scaffold premium over a bare shell: **2024 GPT-4 Turbo +64% → 2026 Opus 4.5 +3.1%.** A roughly 20x collapse in two years.

Anthropic states the principle directly ([harness design](https://www.anthropic.com/engineering/harness-design-long-running-apps), 2026-03-24):

> *"Every component in a harness encodes an assumption about what the model can't do on its own."*

They report that with Opus 4.6, their own mandatory context-reset machinery became unnecessary and *"the evaluator became unnecessary overhead"* for tasks within model competence.

Supporting evidence that structure often measures compute rather than architecture:

- **Matched compute erases the gains** (arXiv 2604.02460, Stanford): *"many reported advantages of multi-agent systems are better explained by **unaccounted computation and context effects rather than inherent architectural benefits**."*
- **Debate fails a placebo trial** (2606.02646): feeding agents rationales **from unrelated problems** works as well as real peer input. *"The gain commonly attributed to 'debate' comes from re-evaluation, not peer content."*
- **Negative returns to compute** (2406.06461, EMNLP 2024, peer-reviewed): multi-agent debate and Reflexion *"can become **worse** if more compute budget is utilized."*
- **Agentless** (2407.01489): *"Do we really have to employ complex autonomous software agents?"* — localise, repair, validate, with no agentic decisions: **32.0% on SWE-bench Lite at $0.70 per issue.**

**What this means for fusion concretely:** its ~6,700 lines of prompt encode assumptions about what models could not do in mid-2025. Every model release depreciates that inventory. fusion has no way to detect the depreciation, because it has no eval — so obsolete scaffolding cannot be identified and retired, only accumulated. The 914-line orchestrator is not a moat. It is a maintenance liability with a shelf life.

### 14. The epistemics: why "nice feedback" is exactly what to distrust

[METR's RCT](https://metr.org/blog/2025-07-10-early-2025-ai-experienced-os-dev-study/) (arXiv 2507.09089): 16 experienced open-source developers, 246 real issues, mature repositories.

- Predicted **+24% faster**
- Measured **19% slower**
- **After** experiencing it, still believed **+20% faster**

**Calibration caveat, stated because this analysis demands it of itself:** METR is explicit that this does *not* establish "AI does not speed up developers" in general. It is one setting with early-2025 tooling, and **METR labels it historical and is redesigning the experiment.** It does not prove fusion is slow. What it establishes is narrower and sufficient: **in this domain, expert self-assessment got the sign wrong and stayed wrong after direct contrary experience.**

That is fusion's entire evidence base — your perception, and an LLM's. [DORA 2025](https://dora.dev/dora-report-2025) (~5,000 respondents) adds the structural version: AI adoption now relates **positively to throughput but continues to relate negatively to delivery stability**. *"AI doesn't fix a team; it amplifies what's already there."*

Your instinct that the feedback "is not the full truth" is not modesty. It is the only correctly calibrated instrument currently in the loop.

### 15. Context engineering: Anthropic's guidance predicts the failure measured in §3

The orchestrator loads **~20,000 words (about 27k tokens)** of instruction before reading a project file. Anthropic's [context engineering](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents): context is *"a finite resource"* with an *"attention budget… Every new token introduced depletes this budget"*; the goal is *"the smallest possible set of high-signal tokens."* Hardcoding complex logic into prompts *"creates fragility and increases maintenance complexity"*; avoid *"stuffing a laundry list of edge cases into a prompt."*

**Context rot has a real primary source:** [Chroma](https://research.trychroma.com/context-rot) (Hong/Troynikov/Huber, 2025-07-14), 18 models — uniform degradation with length, steeper at low needle-question similarity, and models did **better on shuffled haystacks than coherent ones**. Anthropic's 2026 harness post adds *"context anxiety"*: models *"wrap up prematurely as context limits approach"* — and their fix is **reset, not compaction**, because *"compaction preserves continuity, [but] doesn't give the agent a clean slate."*

fusion's orchestrator is a laundry list of edge cases hardcoded into a prompt: skip-no-commits, skip-no-anchor, Rebalance bounding, directive-revision budgets, defensive anchor cases. **The predicted failure is exactly what §3 measured** — the model silently skipped a step its own prompt declares mandatory in every case. *Inference, labelled:* context rot is the most plausible cause; the trace proves the skip, not the mechanism.

### 16. What top orgs actually do that fusion does not

Stripped of vocabulary, the practices that separate serious agentic engineering from structured prompting:

| Practice | Top-tier | fusion |
|---|---|---|
| **Benchmark with executable ground truth** | SWE-bench Verified (93 developers, 1,699 samples, 3 annotators each); Terminal-Bench (89 tasks, 32,155 trials, with a `Hacks` deduction column on the leaderboard) | None |
| **Adversarial eval hygiene** | SWE-Bench+ found **32.67%** of "successful" patches cheated on solutions leaked in the issue text; SWE-Bench Illusion: **76%** buggy-file accuracy **from the issue text alone, with no repo access** | Not applicable — nothing to game, because nothing is measured |
| **Reward-hacking detection** | Anthropic's Claude 3.7 card §6 documents the model special-casing tests; METR found o3 hacks **43x more** when it can see the scoring function, and prompt mitigations made it **worse** (95%) | Not considered |
| **A near-perfect external oracle** | Anthropic's C compiler: 16 parallel Claudes only worked once a **GCC differential oracle** existed. *"It's important that the task verifier is nearly perfect."* | Step 3b test execution — the one real verifier |
| **Cost and model accounting** | Token usage explains **80% of variance** in Anthropic's multi-agent results | Event log has no model, token, or cost field |
| **Reproducibility** | Princeton's *AI Agents That Matter* (2407.01502): *"the community has reached mistaken conclusions about the sources of accuracy gains"*; evals run once, no error bars | Sessions are not reproducible at all |

The pattern: **top orgs spend their effort on the oracle. fusion spends its effort on the process.**

### 17. The one durable pattern in the entire literature

Two things ablate positively and consistently across every source read: **bounding what enters context**, and **a real external verifier** (tests, compiler, linter, differential oracle).

Everything that ablates to zero or negative shares one defect — **it asks the model to be its own oracle**: reflection, self-critique, debate, critic subagents, LLM-judged process compliance. Reflexion's gains *"vanish when oracle labels are not available"*, and the model *"is more likely to modify a correct answer to an incorrect one than to revise an incorrect answer to a correct one."*

**fusion's portfolio, sorted by that test:**

| fusion component | Durable? |
|---|---|
| Step 3b mandated test execution (`orchestrator.md:322`) | **Yes — a real external verifier.** The best thing in fusion. |
| Branch guard (deterministic, fail-closed) | **Yes — rules-based**, Anthropic's top-ranked verification tier. |
| Sequential writes plus clean-context reviewers | **Yes** — matches Cognition 2026. |
| Scoped agent roles, workbench handoff | Plausible context-bounding, unmeasured. |
| Coherence gate, Rebalance, conceptrev verdict, coderev opinion, reconciler judgement | **No — model as its own oracle.** The category that ablates to zero. And the Coherence gate has never fired (§3). |

The uncomfortable read: fusion's *conceptual crown jewels* — the Coherence triangle, the Rebalance gate, the hermeneutic apparatus — sit squarely in the category the literature says does not survive ablation. Its *unglamorous* parts — a hook that denies a branch switch, and one line saying "run the tests" — are the parts with support.

---

## Implications

**Fusion's honest standing, in one paragraph.** The architecture is at parity with GitHub Spec Kit and AWS Kiro, and ahead on two real contributions. Its concurrency design — single-threaded writes, zero-context reviewers — independently matches what Cognition arrived at after shipping and retracting the opposite, which is a genuine win an earlier draft of this analysis missed. It has one excellent deterministic control and one correct verification link. Against that: the gap to top-tier practice is not architecture at all. Top orgs build oracles and measure; fusion builds process and asks. fusion has no CI, no eval, no benchmark, no cost trace, one user, and a flagship feature that has never fired.

**The strategic risk is larger than the quality risk.** The scaffold premium collapsed from +64% to +3.1% in two years, and SWE-agent's authors retracted their own thesis. Anthropic reports their evaluator becoming *"unnecessary overhead"* as models improved. fusion's 6,700 lines encode assumptions about mid-2025 model weakness, and fusion cannot detect which ones have expired, because it has no eval. That is the real cost of the missing measurement: not that fusion might be wrong today, but that it **cannot notice when it becomes wrong**, and so accumulates scaffolding the model no longer needs.

**The recursive point stands.** `rules/critical-stance.md` mandates calibrated certainty and warns that *"an unchecked claim dressed as a checked one is the most damaging pattern."* It was loaded when the flattering report was produced. It did not help, because a rule is a prompt and a prompt is not a mechanism. Anthropic names the same phenomenon as a known model behaviour: agents *"confidently praising the work."* You cannot fix that by adding an instruction telling the model not to.

## Recommendations

Reordered after the research. The literature changes the priority: **stop growing the process layer; invest in the oracle.**

1. **Build one eval before building anything else.** A fixture project plus a scripted session, asserting that specified events actually fire (a `coherence_review` present whenever commits exist), that markers match bodies, that sessions close. You already have 48 events and they falsified a flagship feature. This is the only recommendation that changes fusion's category, and it is the precondition for safely retiring scaffolding as models improve. → `planner`
2. **Add CI.** No `.github/` exists. Run the 110 tests, `claude plugin validate`, and a check that `dist/` matches source, on every push. The branch guard was dead for 13 days because nothing ran. Hours of work; closes the defect class. → `coder`
3. **Invest in the verifier, not the process.** Step 3b is fusion's best feature and it is one line of prompt. Make it structural: map acceptance criteria to tests and validators (the June analysis's rec #1, still unimplemented, now backed by the whole §17 literature). For ontology work it maps onto the existing `uif-validate-*` validators. Anthropic's C compiler only worked once a near-perfect oracle existed. → `planner`
4. **Shrink the orchestrator prompt, and treat every component as depreciating.** 914 lines is a liability per Anthropic's own guidance and has already cost the Coherence gate. Anything that must happen deterministically belongs in a hook. Anything that exists because a 2025 model needed hand-holding should be re-tested against the current model and deleted if it no longer earns its tokens. → `planner`
5. **Downgrade the vocabulary to match the mechanism.** README says 14 agents, `plugin.json` says 15, conceptrev appears in neither README nor philosophy. `philosophy.md:54` says churn halts sessions; it cannot. `plugin.json:4` says conceptrev "parses"; there is no parser. Each overstatement is an input to the next flattering assessment. → `coder`
6. **Add model, token, and cost fields to the event log** (June rec #3, unimplemented). Token usage explained **80%** of variance in Anthropic's multi-agent results; without it, no fusion result is interpretable. → `coder`
7. **Fix the branch-guard false positive** (`issues/260716-2005[o]`, filed this session). Small, well-scoped, and it protects the one control that works. → `coder`
8. **Do not implement parallel worktrees.** The verdict is now stronger than June's: Anthropic says coding has *"fewer truly parallelizable tasks than research"*; Cognition's current rule is writes-single-threaded, which fusion already satisfies; and Anthropic's own parallel Claudes *"overwrite each other's changes"* until a GCC oracle was built to manufacture independence. fusion has no oracle. The recommendation asks you to dismantle your strongest control to adopt the one pattern every source warns about. → no action

**What to stop doing:** asking an LLM to assess fusion by reading fusion. That loop produced the report you distrusted. Anthropic documents it as a known failure mode, and the code-judge literature puts the instrument near chance (kappa = 0.10–0.21). The June analysis, this analysis, and the flattering report were all produced that way. Only the parts that ran commands and fetched primary sources are worth much — which is exactly why this one filed a bug it discovered by being blocked, rather than by reading about it.

---

## Sources

**fusion source, HEAD `6d4a88d`** (read directly; every claim in §1–§8 is citable to these):
- `hooks/guard.ts:93-95,140-159,157,194,225-243,256-266,269-290,292-333,353-358`
- `hooks/tracker.ts:8-9,135-180`
- `hooks/lib/config.ts:15,21-32,85-89,187-201`; `hooks/config.json:8-25,34-39`
- `hooks/hooks.json:17-41`; `settings.json:21-23`
- `hooks/lib/git-branch-guard.ts:67-133,243-245,267-305,315-320`
- `hooks/lib/escalation.ts:100-135`
- `agents/orchestrator.md` (914 lines; esp. `:284-296,322-330,355-384,365,367,547,564`)
- `agents/conceptrev.md:12,50,54-62,116`; `agents/reconciler.md:8,40-43`; `agents/coderev.md:10,27,63,72,102`; `agents/shaper.md:207,224`
- `docs/philosophy.md:11,21,25,42,54`; `README.md:3`; `CLAUDE.md:3,10,20,26,49,62,107`
- `.claude-plugin/plugin.json:4`

**fusion dogfood telemetry (commands run this session):**
- `fusion-workbench/orchestrator-events.jsonl` — 48 events; 0 `coherence_review`, 0 `circuit_breaker`, 4 `session_start` / 1 `session_end`, 2 `turn_start` / 1 `turn_end`
- `fusion-workbench/issues/` — 3 of 7 marker/body contradictions
- `fusion-workbench/circles/` — empty
- `fusion-workbench/history/260707-0957-orchestrator-session.md:17` — "hooks vitest suite 91/91 pass"
- `npx vitest run` → 7 files, 110 tests, all pass, 1.39s
- `git log` → 184 commits, single author, 29 version bumps, 2026-05-04 → 2026-07-16
- Live guard probes 1–3 (§6.1) → issue `260716-2005[o]`

**Prior analysis:**
- `fusion-workbench/analyses/260621-1316-fusion-vs-spec-driven-agentic-engineering-critique.md` (esp. §1, §2, §5.1, §5.6, §112, §139)

**External primary sources (fetched and read this session):**
- Anthropic, [Building effective agents](https://www.anthropic.com/engineering/building-effective-agents) (2024-12-19)
- Anthropic, [Effective context engineering for AI agents](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents) (2025-09-29)
- Anthropic, [Harness design for long-running apps](https://www.anthropic.com/engineering/harness-design-long-running-apps) (2026-03-24) — "every component encodes an assumption about what the model can't do"
- Anthropic, [Multi-agent research system](https://www.anthropic.com/engineering/multi-agent-research-system) (2025-06-13) — coding is a poor multi-agent fit; token usage explains 80% of variance
- Anthropic, [Building a C compiler with parallel Claudes](https://www.anthropic.com/engineering/building-c-compiler) (2026-02-05) — overwrite problem; GCC differential oracle
- Anthropic, Claude 3.7 Sonnet system card §6 — documented test special-casing / reward hacking
- Cognition, [Don't Build Multi-Agents](https://cognition.com/blog/dont-build-multi-agents) (2025-06-12)
- Cognition, [Multi-Agents: What's Actually Working](https://cognition.com/blog/multi-agents-working) (2026-04-22) — **supersedes the above; the correction in §11**
- METR, [Measuring the impact of early-2025 AI on experienced OS developer productivity](https://metr.org/blog/2025-07-10-early-2025-ai-experienced-os-dev-study/) (arXiv 2507.09089)
- METR, [Recent reward hacking](https://metr.org/blog/2025-06-05-recent-reward-hacking/) — o3 hacks 43× more with a visible scoring function
- [DORA 2025](https://dora.dev/dora-report-2025) — ~5,000 respondents; throughput up, stability down
- Chroma, [Context Rot](https://research.trychroma.com/context-rot) (2025-07-14) — 18 models
- Panickssery et al., [LLM Evaluators Recognize and Favor Their Own Generations](https://arxiv.org/abs/2404.13076) (NeurIPS 2024)
- Zheng et al., [Judging LLM-as-a-Judge](https://arxiv.org/abs/2306.05685) — **cited for what it does *not* say** (§12)
- arXiv 2507.16587 — LLM judges on code vs test execution; κ = 0.21 Java / 0.10 Python
- Xia et al., [Agentless](https://arxiv.org/abs/2407.01489) — 32.0% SWE-bench Lite at $0.70
- OpenAI, [Introducing SWE-bench Verified](https://openai.com/index/introducing-swe-bench-verified/) (2024-08-13)
- SWE-Bench+ (2410.06992); SWE-Bench Illusion (2506.12286); Princeton *AI Agents That Matter* (2407.01502)
- Stanford, matched-compute multi-agent critique (2604.02460); debate placebo (2606.02646); negative returns to compute (2406.06461, EMNLP 2024)
- `mini-swe-agent` README — SWE-agent authors' own scaffold retraction
- GitHub, [Spec Kit](https://github.com/github/spec-kit); AWS, [Kiro](https://kiro.dev) (GA Nov 2025)

## Verification status (honesty clause)

- **Verified by reading source or running commands:** every fusion mechanism claim in §1–§8, §13 recommendations table, and §17 (file:line cited); the 110-test run; the event-log counts; the marker/body contradictions; the empty `circles/`; the deny belts; the single-author history; the three live guard probes.
- **Verified by fetching the primary source:** every external citation above, quoted from fetched text.
- **Corrected mid-analysis:** §11. An earlier draft cited Cognition's 2025 essay as their current position and concluded fusion's design bet was "contested". Cognition reversed in 2026-04, and the reversal partly *vindicates* fusion. The error is stated rather than patched, because the same error class (citing an outdated position confidently) is what this analysis criticises.
- **Inference (labelled):** that context rot *caused* the skipped `coherence_review` (§15). The trace proves the skip, not the mechanism.
- **Not established:** whether fusion improves outcomes. No evidence exists in either direction. This analysis does **not** claim fusion makes things worse. It claims nobody knows, which is the point.
- **Second-hand, not verified — do not cite on this analysis's say-so:** the arXiv IDs for the matched-compute critique (2604.02460), debate placebo (2606.02646), and the SDD advocate paper (2605.01160) come from a research subagent and were not independently fetched. The *pattern* they describe is corroborated by the peer-reviewed 2406.06461 and by Anthropic's own harness post, both of which were fetched. Treat the specific numbers as indicative.
- **Bias disclosure:** this analysis was produced by an LLM reading fusion — the same loop §14 warns about. It is grounded in executed commands, file:line citations, and fetched primaries specifically to reduce that exposure, and it found one bug by being blocked by it rather than by reading about it. The framing choices remain a model's.

## Filed Issues

- `fusion-workbench/issues/260716-2005[o]-branch-guard-false-positive-on-markdown-backticks-in-heredoc.md` — the branch guard denies prose containing backticked git commands; isolated to markdown backticks read as shell command substitution, with no heredoc-quoting model. Found live while writing this document.

Recommendations 1–8 are not filed as issues; queue them if you want them in the work stream.

## Open Questions

- [ ] Does fusion improve outcomes? Unanswerable today. Recommendation 1 is the cheapest path to a first data point.
- [ ] Which of fusion's 6,700 prompt lines are now obsolete against the current model? Unanswerable without an eval — and per §13 this is the question that compounds with every model release.
- [ ] Is the sequential Turn loop (§11) a deliberate answer to the multi-agent critique or an accident of implementation? If deliberate, it deserves to be stated in `philosophy.md` as a design position rather than left implicit — it is one of fusion's better-supported choices and is currently uncredited.
- [ ] Would a second model as reviewer measurably change review quality (§12)? Testable once recommendation 1 exists.
