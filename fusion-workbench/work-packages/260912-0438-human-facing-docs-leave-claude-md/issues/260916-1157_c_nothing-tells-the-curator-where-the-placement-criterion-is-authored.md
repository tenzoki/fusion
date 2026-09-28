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

---
Resolved: option 2. `agents/curator.md` now cites `$FUSION_PLUGIN_ROOT/rules/context-lean-claude-md.md`
`## How to tell "always-on" from "on-demand"` at the site of the relocation instruction, and says in the
same sentence that `bin/fusion-rules` emits it to no agent, so the curator opens it rather than assuming
Setup already loaded it. The section anchor rather than the file alone, because that heading is the
criterion; the file's other sections are the manifest convention. Options 1 and 3 were both refused on
measurement rather than taste: emitting the rule charges 12 612 bytes to every curator dispatch whether
or not the run judges placement, and the skill-body surface had 2 bytes of room. Cost: +355 bytes on
`agents/curator.md`, leaving 49 666 under the `agents/` bound and 24 086 on the `curator` dispatch path;
the reference-resolution pin moved to `{ paths: 1570, anchors: 242, stampBare: 11 }`, appended to the
existing `BASELINE` comment line so the hook-test line surface stayed put, and the delta was attributed
to this one sentence by restoring HEAD's file in place with every other change standing.
