The retired-file diagnostic's one chat-visible channel is a repeat mandate scoped to dropped keys, and a retired file is not a drop

---

**The migration text itself is correct and sufficient.** Verified end to end against a scratch
consuming project (a workbench marker, `fusion-guard.json` carrying
`{"orchestrator":{"maxTurns":12}}`, no `fusion.json`):

```
A. old file only        -> stderr: "…fusion-guard.json is no longer read — … copy
                           {"orchestrator": {"maxTurns": <n>}} into fusion.json first …
                           Then delete this file to stop this advisory."
                           stdout: max_turns=5
                           guard on Edit: one guard_advisory carrying the same text, one guard_allow
B. budget copied across -> max_turns=12, advisory still naming the leftover file
C. old file deleted     -> max_turns=12, no advisory
```

A project acting on that sentence alone completes the migration and keeps its budget. The text
names the key, the destination, and the order, and the order is the load-bearing half.

**What is not settled is who reads it.** `guard_advisory` has exactly one consumer in the whole
tree: `bin/monitor`'s warnings panel (`bin/monitor:172`, `:180`, `:597`). Nothing in any agent
prompt or skill body reads `.guard-state/events.jsonl`. So the per-guarded-call channel — the one
the user's option 1 was chosen for, on the ground that it "runs on every guarded tool call while
Setup runs once per session and only for a project that runs Setup at all"
(`hooks/lib/config.ts:105-114`) — delivers into a JSONL file that a human sees only by opening the
dashboard.

The one channel that puts the text in front of a user *in chat* is `bin/fusion-turn-budget`'s
stderr at Setup, and the mandate that repeats it is `agents/orchestrator.md:132`:

> It prints one line, `max_turns=<n>`, and puts on stderr **anything the configuration loader had
> to drop** — a budget that is not a whole number of 1 or more is dropped, named, and inherits the
> default. **Repeat any such line to the user in the Setup-complete summary.** A project that
> declared a budget of zero and was silently handed the default has a setting it believes is in
> force and is not.

"Any such line" has one stated antecedent and the em-dash clause narrows it to bad-budget values.
A retired file is not a drop — nothing was dropped, the file was never read — so under a literal
reading the migration notice is the one stderr line the orchestrator is not told to repeat. The
closing sentence describes the bad-budget case only, which is the weaker of the two losses it now
has to cover: a project that declared 12 and gets 5 is exactly the failure the whole channel
exists to prevent, and it is the case the mandate does not name.

`skills/setup/SKILL.md:292` delegates the whole block to this section and adds only "Report the
value, or the fact that it did not resolve and why", so it inherits the same scope.

**No step owns the line.** Step 11's entry for `agents/orchestrator.md` names `:122` *(filename)*,
`:150`, `:626` and `:644`. `:132` is not among them, and `turn-budget-lint.test.ts` pins the call
and the `[ -x ]` guard (`:194-207`) but nothing about repeating stderr.

**Two fixes, one decision.** Either widen `:132` so its antecedent is "anything on stderr" and name
the retired file among the cases (cheapest, and it is one sentence in a file step 11 already
opens), or give the advisory a second consumer that a session cannot miss. The first is enough if
the answer to "does a project that never runs Setup need to hear this?" is *no* — and it may well
be, because the budget is read only at Setup, so a project that never runs Setup loses nothing by
not hearing about it. That question is not recorded anywhere and is worth recording with the fix.

**Severity:** Medium.

**Scope:** `agents/orchestrator.md`, shipped to every consuming project.

**Cross-references:**
- `hooks/lib/config.ts:105-114`, `:324-327` (the diagnostic and the argument for the channel)
- `hooks/turn-budget.ts:92-94` (the stderr write)
- `260816-1916_*_does-setup-offer-to-move-a-projects-turn-budget-out-of-the-retired-configuration-file.md`

---
Reconciliation 2026-08-17, Phase 3. **Left OPEN, and it is the one open record against a surface
that has now shipped.**

`agents/orchestrator.md:132` is unchanged, verified by reading the line at HEAD. It still reads
"puts on stderr anything the configuration loader had to drop", still narrows that with the
em-dash clause to a budget that is not a whole number of 1 or more, and still closes on the
bad-budget case alone. `skills/setup/SKILL.md` still delegates to it. Neither of the two fixes
this record proposed was applied, and no step in the plan ever owned the line.

Why this matters more now than when it was filed: v10.0.0 is published — tag `v10.0.0` at
`e331332`, `main` at `9ae7974`, marketplace entry at 10.0.0. So the version in which
`fusion-guard.json` stops being read is the version that shipped with its migration notice
reaching a consuming project's chat through no mandate. The failure mode is the one the record
names and is not hypothetical: a project that declared 12 and is silently handed the built-in
default has a setting it believes is in force. The advisory itself is correct and was verified
end to end against a real consuming project at plan step 15; what is missing is a reader.

The unrecorded question this record identified is still unrecorded: *does a project that never
runs Setup need to hear this?* It is worth filing as a decision record beside the fix rather than
being answered inside it, because the answer decides which of the two fixes is enough.

---
**Resolved 2026-08-17 — fix 1 of the record's two, widened past the record's own proposal.**

`agents/orchestrator.md:132` no longer has an antecedent to narrow. It now reads "puts on stderr
**every diagnostic the configuration loader returned**, one per line" and mandates repeating *all*
of them, then names the four the loader can produce, checked against `hooks/lib/config.ts` rather
than against the record: the retired project file (`RETIRED_PROJECT_FILES`, `:322-327`), a retired
top-level key (`RETIRED_TOP_LEVEL_KEYS`, `:341-350`, reported at `:391-396`), a file that will not
parse or is not a JSON object (`readLayer`, `:235-255`), and the dropped leaf value the old text
was scoped to (`:415-419`). The retired file is named first and named as *not* a drop — nothing was
dropped, the file was never read — because that is the case the old antecedent excluded and it is
the expensive one.

`skills/setup/SKILL.md:292` had the same shape one level down: it delegates the block but then
enumerated what to report as "the value, or the fact that it did not resolve and why", which omits
a diagnostic that arrives *while the budget resolves fine*. It now names the stderr lines
explicitly, so the two surfaces cannot be read as disagreeing.

**Departure from the record's proposal.** The record framed the choice as widen-`:132`-or-add-a-
second-consumer, with the first sufficient only if a project that never runs Setup needs no notice.
Both were widened rather than one, and no second consumer was built: the second fix is a mechanism
change and this is a patch release against shipped text. The record's unanswered question is still
unanswered and still worth a decision record — it decides whether a second consumer is needed *at
all*, not whether this fix was correct. This fix stands either way, because a project that does run
Setup was losing the notice too, and that was never in question.

Verification: `npm test` in `hooks/` — exit 0, 653 passed. Both bounded surfaces stayed inside their
head-room (`agents/` +557 bytes, `skills/` +140; no baseline moved, the golden was regenerated).
