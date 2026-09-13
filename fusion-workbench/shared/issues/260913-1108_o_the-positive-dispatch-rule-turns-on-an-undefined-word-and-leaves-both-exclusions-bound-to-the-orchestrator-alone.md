The positive dispatch rule turns on an undefined word, and both surviving exclusions bind the orchestrator alone

---
`rules/fusion-workbench-conventions.md:230` grants every agent the right to dispatch "another operative agent". The term is defined nowhere, and the two exclusions the deleted allowlist carried are stated only as the orchestrator's.

---
**Filed by:** reviewer, Kai Stalmann <ks@qantr.com>

**The word.** "operative agent" occurs in `rules/fusion-workbench-conventions.md:230`, `README-agents.md:264` and `skills/help/SKILL.md:96` — those three lines are the whole of it, and none defines the term, nor does any other rule file, prompt, README or doc. `grep -rn "operative agent" CLAUDE.md README*.md agents rules docs skills hooks/lib` returns those three lines and nothing else. So the one qualifier on an always-on grant carries no meaning a reader can apply, and it has already been copied into the release note a user reads.

**Both exclusions are orchestrator-scoped.** `agents/orchestrator.md:598` reads "**Never invokes — and this prose is the whole of the rule** …", and its two entries are written in the second person to the orchestrator: `consultant` — "never dispatched by the orchestrator"; `orchestrator` — "no recursion. You can now reach both; do not." `agents/consultant.md:150` states the same exclusion from its own side and also names only the orchestrator: "**Not dispatched by the orchestrator.** You are user-initiated only." Nothing anywhere says a `coder`, `analyst` or `reviewer` may not dispatch `consultant`, and nothing says one may not dispatch `orchestrator`.

**Why that is not merely theoretical.** Before `e422bf99` four prompts forbade a nested dispatch outright and the other six were silent; the reachable-but-unstated case was reachable only by an agent doing something no prompt described. The rule now tells every agent positively that it may dispatch, so the two cases the exclusions exist to prevent — the consultant reached without a human asking for it, and a second orchestrator started inside a dispatch — are now reachable by an agent following its instructions. The ruling accepted prose in place of the allowlist for the orchestrator's two exclusions; it did not say the exclusions stop at the orchestrator, and it did not define "operative".

**Acceptance test.** The always-on rule either defines which agents "operative" admits, or names the two exclusions as project-wide rather than orchestrator-scoped. A reader of `rules/fusion-workbench-conventions.md` `## Dispatching another agent` alone can answer "may a `coder` dispatch the `consultant`?" and "may a `coder` dispatch the `orchestrator`?" without opening another file. Any added always-on bytes are charged to all eleven dispatch paths at zero head-room (`hooks/lib/__tests__/dispatch-bytes.test.ts`).
