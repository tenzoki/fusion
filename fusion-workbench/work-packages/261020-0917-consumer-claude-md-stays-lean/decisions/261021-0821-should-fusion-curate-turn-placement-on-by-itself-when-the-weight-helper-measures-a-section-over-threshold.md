# Should `/fusion:curate` turn placement on by itself when the weight helper measures a section over threshold?

---
**Domain:** code
**Filed by:** orchestrator, Kai Stalmann <ks@qantr.com>
**Cross-references:** 261020-0917-consumer-claude-md-stays-lean, 261020-0927-plan-consumer-claude-md-stays-lean.md, 261020-0835-why-a-consumers-claude-md-grows-unchecked.md, 260916-1006_*_how-does-a-consuming-project-bring-its-claude-md-to-the-lean-convention-when-the-curator-asks-a-different-question.md, 260916-1326_*_step-7-runs-fusion-curate-which-passes-no-placement-line-so-it-can-propose-no-relocation.md

---

## Question

Plan step 4 of `261020-0927-plan-consumer-claude-md-stays-lean.md` made placement reachable as `/fusion:curate --placement`, opt-in, and step 7 names an over-threshold `CLAUDE.md` at every session start with a pointer to that flag. The opt-in rests on `agents/policy-curator.md` `## Dispatch parameters`, "Placement is asked for on the same principle": a relocation takes a passage out of a surface on a judgement no evidence tier grades, so it must be asked for. The user asked, on 2026-10-21, why placement is not curate's default. krk shows the cost of an opt-in nobody exercises: its `CLAUDE.md` reached 179 KB with a 124 KB section, and every curator run made it longer, because no run asked whether a passage belongs there. A session-start notice is a prompt a reader can pass over. The choice is whether the judgement gets a measured trigger that switches it on without the user typing the flag.

## Options

1. **Keep the opt-in** — placement only with `--placement`; the session-start line is the nudge.
   - Pros: no change; the curator's no-ungraded-judgement default stays absolute.
   - Cons: depends on a reader acting on a notice; krk's measured history is a curator that ran and never asked.
2. **Measured auto-on** — `/fusion:curate` runs `bin/fusion-claude-md-weight` first and adds `**Placement:** on` to both dispatches when `over > 0`, saying so in the approval question; `--no-placement` turns it off.
   - Pros: the judgement gets a decidable trigger (bytes over threshold); every proposed move still passes the user's per-entry approval and the blast-radius pause; nothing is moved unasked.
   - Cons: a plain curate run on an over file now proposes relocations, which widens its ledger; costs skill bytes (head-room 2 648 after the package: 228 028 against 225 380); the threshold (4000 B) becomes behaviour-bearing rather than advisory.
3. **Ask at run time** — when `over > 0` and no flag was given, `/fusion:curate` asks once whether to include placement.
   - Pros: no silent widening; the user decides with the measurement in front of them.
   - Cons: one more question per run on an over file; still skippable.

## Constraints

- No relocation is applied without the user's approval of that entry (the ledger contract).
- The curator's evidence tiers are unchanged: a placement entry remains a non-tier entry, asked for rather than assumed.
- Fits the growth bounds without a head-room raise, or names the ruling that allows one.

## Recommendation

Option 2. The principle the opt-in guards is that an ungraded judgement must be *asked for*; a measured weight over threshold is a decidable reason to ask, and the per-entry approval keeps the user's control where it already is. Option 3 is the fallback if a plain run widening its ledger is judged too surprising.

---
Deferred: work package `261021-0832-curate-placement-gets-a-measured-trigger` — for now fusion keeps the session-start notice and the `--placement` switch; the package also carries the point that option 2 would turn the helper's reporting cut-off into a behaviour trigger, against `260916-1126`; ruled by user, Kai Stalmann <ks@qantr.com>
