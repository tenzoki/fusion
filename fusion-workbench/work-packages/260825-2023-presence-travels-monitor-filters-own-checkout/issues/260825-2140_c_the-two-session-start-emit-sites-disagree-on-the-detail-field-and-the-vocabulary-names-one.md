The two session_start emit sites disagree on the detail field, and the event vocabulary names one of them

---
`agents/orchestrator.md` Setup step 8 appends `session_start` with `history_file` and `detail`;
`skills/setup/SKILL.md` Step 5 appends the same event with `history_file` alone. The event
vocabulary in `agents/orchestrator.md` Observability section 2 declares the row as carrying the
history file, the Directive and the mode, so one of the two emitters writes what the vocabulary
declares and the other does not. Which fields a `session_start` line holds therefore depends on
which rendering of Setup the session ran.
---
**Filed by:** planner, Kai Stalmann <ks@qantr.com>
**Domain:** code
**Severity:** Low today and rising with this Circle. The `detail` string is read by no program; it is
read by a person, and by the Phase-4 sequence diagram. Capability C4 makes the same pair of sites the
carrier of the person and checkout fields, so a divergence that costs a sentence today becomes a
divergence in attribution if only one site is edited.
**Cross-references:**
`agents/orchestrator.md` `### 2. Structured Event Log` (the vocabulary, which is the authoring home);
`260825-2140_*_the-turn-count-defect-names-three-sites-and-a-fourth-carries-the-identical-whole-file-count.md`
(the same two-rendering divergence, in the reader rather than the writer);
`260825-2140_*_c4-presence-travels-and-the-monitor-reads-its-own-checkout.md`
steps 3 and 4, which edit both sites in the same Turn for exactly this reason

## What was measured

Read at HEAD on 260825.

`agents/orchestrator.md` Setup step 8:

```
echo "{\"ts\":\"${TS}\",\"event\":\"session_start\",\"history_file\":\"<the step 6 path>\",\"detail\":\"<Directive and mode>\"}" >> fusion-workbench/orchestrator-events.jsonl
```

`skills/setup/SKILL.md` Step 5:

```
echo "{\"ts\":\"${TS}\",\"event\":\"session_start\",\"history_file\":\"<the Step 4 path>\"}" >> ./fusion-workbench/orchestrator-events.jsonl
```

The vocabulary row both are instances of reads: `| session_start | Setup complete | history_file (the
session's identity), Directive and mode |`.

## What it costs

The live log in this repository shows both shapes. A reader of the merged log cannot tell a session
whose Directive was not recorded from a session that ran through the skill body, so the absence
carries no information about the session and the field's own documentation is false for some lines.

## Direction, not a prescription

The two sites are one contract with two spellings. Either the skill body carries `detail` as the
vocabulary declares, or the vocabulary stops declaring it. The first is the smaller change and is
what the plan cited above takes, because the Directive is what a person reads a `session_start` line
for.

---
Resolved: `skills/setup/SKILL.md` Step 5 now emits `session_start` with `detail` (the session
Directive and mode) beside `history_file`, so both emit sites write what the vocabulary in
`agents/orchestrator.md` `### 2. Structured Event Log` declares. The same edit adds `person` and
`checkout`, held from Step 0i's read, which is C4 plan step 4 rather than this defect. The field
contract stays authored in the orchestrator prompt and is cited from the skill body, not copied
into it.
