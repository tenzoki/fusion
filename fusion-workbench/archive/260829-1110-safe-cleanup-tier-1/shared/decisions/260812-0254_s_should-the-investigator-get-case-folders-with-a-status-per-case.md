# Should the investigator get case folders with a status per case?

---
**Domain:** code
**Status:** open
**Filed by:** orchestrator (on the user's request)
**Cross-references:** `agents/investigator.md`; `templates/investigator-capture-layout.md`; `shared/analyses/260812-0022-...md`, which listed the investigator as a removal candidate on zero measured dispatches

---

## Question

The analysis of 260812 proposed removing the investigator on the evidence that it has never been
dispatched. **The user contradicts that from his own use:** it was built for large, complex failure
hunts and has been used several times in exactly that way. The measurement and the user disagree,
and the most likely explanation is that the measurement counted orchestrator dispatches while the
investigator is user-initiated by design — its prompt says so, and the orchestrator is forbidden to
dispatch it.

So the question is not whether to remove it but what it needs. The user's answer: an input folder
with one sub-folder per case in the workbench, and a status marker per folder. He notes the same
structure would serve for managing reported fusion defects.

## Options

1. **Case folders under a new `investigations/<case>/` layout**, each holding the capture, the
   evidence, the working notes and the report, with the state marker on a record inside the folder
   — the same shape a Circle already has.
   - Pros: one structural idea instead of two; `bin/fusion-paths` already resolves
     `SCAN_INVESTIGATIONS`; the marker-on-the-record convention is defined and tested.
   - Cons: a second container type invites the question why it is not simply a Circle.
2. **Make an investigation a Circle** with a domain or a kind field, reusing the container, the
   portfolio and the state vocabulary wholesale.
   - Pros: nothing new to build or document.
   - Cons: a Circle is defined as a unit of work bounded by a Directive; an investigation has a
     question, not a Directive, and forcing the vocabulary would blunt both.
3. **Leave the flat store and add only a status marker** to the investigation filename.
   - Pros: minimal.
   - Cons: does not solve what the user asked for, which is somewhere to put the *inputs* of a case.

## Constraints

- The investigator is user-initiated and must stay so; whatever is built cannot assume an
  orchestrator.
- The capture layout is project-supplied (`templates/investigator-capture-layout.md`), so the input
  side already varies per project and the new structure must not fight that.

## Recommendation

None yet, because the choice between 1 and 2 turns on a question nobody has asked: whether the
several real investigations the user ran would have been better as Circles. Read two of them before
deciding. What is not in doubt is that the removal recommendation for the investigator is withdrawn.

---
Superseded by: circles/260815-0007-remove-eight-mechanisms-and-cap-growth/_t_circle.md § Grounding snapshot item 5 — the question was what the investigator needs; the Circle's answer is that it needs nothing, because the agent is folded into `analyst` and its case-folder question has no subject left. Both options 1 and 2 assumed an agent that writes into an investigation store, and neither survives that.

**The record was not simply overtaken, and the disagreement it recorded was re-measured rather than ignored.** This record withdrew a removal recommendation on the user's own testimony that he had used the investigator several times, and reasoned that the earlier measurement had counted orchestrator dispatches while the agent is user-initiated by design. The Circle's Grounding snapshot re-took the measurement on the right population: four dispatches in the largest consuming project, all on two days, none in the eight weeks since, and the capture input surface the agent required was deleted in July. The user's recollection and the count agree once the count includes user-initiated runs — the runs happened, and they stopped. What settled it is where the heavy diagnostics went instead: to the `analyst`, in the same period, one of them typed *"Forensic investigation (4 sim runs)"*.

What the fold carries into `agents/analyst.md` is the remit this record was about — a ninth analysis type, Failure Investigation, with the capture as the object of study, the evidence inventory, the timeline and the primary-versus-contributing-cause split. What it does not carry is the case-folder structure, which stays unbuilt: nothing has asked for it since. `shared/investigations/` keeps every report already in it and takes nothing new.
