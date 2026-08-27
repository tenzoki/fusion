# The event line contract's own rule sentence says "a half" of a set this Circle grew to three

---

`agents/orchestrator.md` `### 2. Structured Event Log` is the authoring home for the event line: the
schema block, the field list, and the absent-rather-than-empty rule. This Circle grew the identity
part of that line from two fields to three. The paragraph's heading was updated and its rule sentence
was not, so the one place the rule is authored states it over **a half** of a **three**-member set.

---

**Filed by:** reconciler, Kai Stalmann <ks@qantr.com>, checkout 5e8248d7

**Severity:** Medium. Nothing behaves wrongly and no emitted line is malformed. What is wrong is the
authoring home for a rule two other files cite rather than restate, which is the same placement the
Circle's two earlier count defects had.

**Evidence, read at HEAD `e66f7d5`.**

`agents/orchestrator.md:1279`, one paragraph, three sentences in tension:

- Heading: **"`person`, `checkout` and `session_id` stand on every line, not only on the session
  boundaries."** Three fields.
- Two sentences later: "none of the three is composed anywhere else." Three again, said explicitly.
- Then the rule: **"A half that did not resolve makes its field absent rather than empty."** A half
  is one of two.

Either the rule covers two of the three and does not say which is excluded, or it means "one of the
three" and uses a word that cannot mean that. Both readings are defects and the sentence does not let
a reader choose between them.

**The Circle's own commit made it wrong, and its correction commit rewrote the same line.**
`git log -L 1279,1279:agents/orchestrator.md` gives three touches:

- `8655ec2` (2026-08-25) wrote the paragraph with **two** fields — "`person` and `checkout` stand on
  every line" — where "a half" was exactly right.
- `72a9561` (2026-08-26, this Circle's Turn 2) changed the heading to the three-field form and left
  "a half" standing.
- `6deeb33` (2026-08-26, this Circle's Turn 3, the commit whose subject is *"the count of emit
  templates, of Turn-count sites and of SessionStart commands is right in every place that states
  it"*) touched this same line again and did not see it.

**Three fields, three independent ways to be absent, and the paragraph is cited as the authority for
all three.** The unresolved paths do not pair up: `person` and `checkout` come from
`bin/fusion-identity` and are the two halves that helper's exit table splits (Setup step 2,
`agents/orchestrator.md:139`, "an unresolved half's key **left out**" — correct there, because its
referent really is the pair). `session_id` comes from a SessionStart line and has its own rule one
bullet below at `:140`, "**No line, no key**". So three fields fail independently, and the sentence
that generalises the rule names two of them.

That generalisation is load-bearing rather than decorative, because two shipped files cite it instead
of restating it:

- `hooks/lib/events.ts:90` — "That is the same rule `agents/orchestrator.md` `### 2. Structured
  Event Log` states for `person` and `checkout` on the orchestrator's own log" — written to justify
  applying the rule to `session_id`, citing an authority that names only the pair.
- `rules/workbench-tracking.md:55` — "How a line comes by that identity is not this file's contract:
  it is authored in `agents/orchestrator.md` `### 2. Structured Event Log` (commit `8655ec2`)."

**How this was found, since the method matters more than the instance.** The Turn 3 sixth pass swept
every count word (`two`…`ten`, plus digits) within 110 characters of the mechanism's vocabulary across
`rules/`, `agents/`, `skills/`, `bin/`, the untested hook sources, `CLAUDE.md`, three READMEs and
`docs/` — 108 candidate lines, each read — and reported nothing further. This line was inside that
scope and its instrument could not see it: `half` is not a count word in the `two`…`ten` list, and the
heading enumerates its three members **by name** rather than by a number. A count-word sweep is blind
to a cardinality carried by a bare enumeration or by a word like *half*, *pair*, *both*, *either*,
*neither*, *the other*. This is the seventh instance of the Circle's recurring fault and the first
found from the referent rather than from a count word.

**Fix direction, not taken here.** One word in `agents/orchestrator.md:1279`: "A half" → "A field"
(or "Any of the three"), which makes the rule cover what the heading already claims. A second reading
is available and is the reason this is filed rather than corrected in passing — if the rule genuinely
is meant to apply to the identity pair only, with `session_id`'s absence governed solely by `:140`,
then the fix is to say so, and that is a decision about the contract rather than a typo.

**A companion observation, lower confidence, not part of this defect.** `CLAUDE.md:46`
(`bin/fusion-staging-drift`) says "There were three of these thin wrappers until 2026-08-15 … and
`bin/fusion-review-coverage` is the other survivor." Four scripts carry the identical
"The work is hooks/dist/…, resolved relative to this script" boilerplate at HEAD —
`bin/fusion-events` (added by this Circle), `bin/fusion-review-coverage`, `bin/fusion-staging-drift`
and `bin/fusion-turn-budget` — and all four of the originals were created on 2026-08-11, so four
existed on the date the sentence counts three. The sentence is not clearly wrong: "these thin
wrappers" may scope to the drift-and-coverage report family, which is three and has one other
survivor. It is recorded because this Circle added a member to the class under the broad reading and
did not look at the sentence, and because the antecedent is now ambiguous where it was not.

Resolved: the three-field reading is the contract, and the sentence now says so ("Any of the three that did not resolve is absent rather than empty", `agents/orchestrator.md` `### 2. Structured Event Log`). The pair-only reading was rejected because both citing files (`hooks/lib/events.ts`, `rules/workbench-tracking.md`) already apply the rule to `session_id`, and Setup step 2's "No line, no key" states the same rule for it, so the generalisation was always meant to cover three. The companion observation on `CLAUDE.md`'s "three thin wrappers" sentence is not addressed here: `CLAUDE.md` is outside this task's scope, and the sentence is ambiguous rather than wrong.
