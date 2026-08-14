The curator prompt is the one prose agent that does not enumerate its long-form outputs
---
`rules/user-facing-output.md:11` states, of the long-form writing profile: "Each long-form-prose agent's prompt enumerates which of its outputs the writing profile governs." Nine of the ten prose agents do. `agents/curator.md` does not, and it receives `default-voice-en.yaml` all the same, so the profile arrives with no statement of what it governs.
---
**Found by:** curator, survey run `circles/260801-1244-curator/history/260814-1332-curator-run.md` (candidate C08)
**Owner:** `coder` — the fix is in an agent prompt, which the curator's remit excludes.

**Verified 2026-08-14 at HEAD `ae21c87`:**

- The prose set is `orchestrator|consultant|shaper|planner|analyst|investigator|playmaker|conceptrev|editor|curator`, at `bin/fusion-rules:186` (`IS_PROSE_AGENT=1`).
- `for a in orchestrator consultant shaper planner analyst investigator playmaker conceptrev editor curator; do printf "%s: " $a; grep -c "Long-form prose vs short-form" agents/$a.md; done` returns `1` for the first nine and **`0` for `curator`**.
- `bin/fusion-rules curator` emits `./fusion-workbench/stilwerk/default-voice-en.yaml`, so the profile is loaded.
- `agents/curator.md` `## Output Style` carries four bullets and no long-form / short-form split.

**Why it matters rather than being cosmetic.** The curator's run file is a long-form persisted artifact — a change ledger with prose justifications — and its gate prompt and chat report are short-form. Those are exactly the two surfaces the split governs, and nothing in the prompt says which profile applies to which. `rules/agent-setup.md` `## Voice profiles` gives the general instruction, but the enumeration the rule promises is what tells an agent whether its *particular* outputs are in scope.

**The fix.** Add the `Long-form prose vs short-form` enumeration to `agents/curator.md` `## Output Style`, in the shape the other nine carry: name which of the curator's outputs the writing profile governs (the run file's prose sections, the decision records it files) and which take the chat profile (the gate prompt, the survey report, the chat summary).

**What must not be done instead.** Weakening `rules/user-facing-output.md:11` to say "most prose agents" would remove a constraint to accommodate a defect. The curator declined that explicitly and left the rule alone.
