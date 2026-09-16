The curator is told to name the placement criterion and nothing tells it where that criterion is authored

---
`agents/curator.md` now instructs that the citation line of a relocation "names the placement
criterion the passage was judged against". No shipped text tells the curator where that criterion
lives.

`bin/fusion-rules curator` emits six paths, measured at `1dc04c71`: `agent-setup.md`,
`fusion-workbench-conventions.md`, `critical-stance.md`, `user-facing-output.md` and the two voice
profiles. `rules/context-lean-claude-md.md`, which is the criterion's authoring home since
`1dc04c71`, is emitted to no agent at all, and `skills/curate/SKILL.md` does not name it in the
dispatch it composes.

The consequence is not a false statement — the prompt claims nothing about where the criterion is —
but an instruction whose subject the agent has no route to. It surfaces at step 7 of
`260916-1126_*_implementation-human-facing-docs-leave-claude-md.md`, which is two sessions away and
is the run that produces the classification for fusion's own file.

Three ways out, each with a different cost, and the choice is not made here:

1. Emit `rules/context-lean-claude-md.md` to the `curator` in `bin/fusion-rules`. It was 12 612
   bytes at `1dc04c71` and the `curator` dispatch path had 24 384 bytes of room at `92cd2491`, so it
   fits, but it is charged on every curator dispatch whether or not the run touches placement.
2. Cite the file by path in `agents/curator.md`. Cheapest in bytes and costs one token on the
   `paths` pin in `reference-resolution-lint.test.ts`, which then needs its baseline re-approved on
   its own line.
3. Name it in the dispatch `skills/curate/SKILL.md` composes, so it is carried only by a run that
   needs it. Costs bytes on the skill-body surface, which had 612 at `92cd2491`.

**Acceptance test:** a curator dispatched by `/fusion:curate` can reach the criterion's authoring
home without being told its path by hand in the dispatch prompt, or `skills/curate/SKILL.md` puts
that path in every dispatch it composes.

---
**Filed by:** orchestrator, Kai Stalmann <ks@qantr.com>

Found while reviewing step 2's return. The executor's report described its own wording as "the
placement criterion your emitted rules state"; the file does not say that, and the looser phrasing
it did write is what left the gap visible rather than false.
