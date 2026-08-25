The "absent rather than empty" rule has no expression in any of the three event-emit templates

---

`agents/orchestrator.md` states that an unresolved `person` or `checkout` makes its field **absent, never empty**. All three places that show the agent how to emit a line carry both fields unconditionally with a placeholder inside the quotes, and none shows how to leave one out. An agent following the template with an unresolved half emits `"person":""`, which is the shape the rule forbids.

---

**Filed by:** coderev, Kai Stalmann <ks@qantr.com>

**Severity:** Medium

**Evidence.** The rule, stated once and correctly, at `agents/orchestrator.md:1274`:

> **A half that did not resolve makes its field absent rather than empty**, the rule the record templates already follow; an absent `checkout` reads as this checkout's own

The three templates that have to obey it:

- `agents/orchestrator.md:231` — `echo "{\"ts\":\"${TS}\",\"event\":\"session_start\",\"person\":\"<PERSON>\",\"checkout\":\"<CHECKOUT>\",...}"`
- `agents/orchestrator.md:1317` — `echo '{"ts":"...","event":"...","person":"...","checkout":"..."}'`
- `agents/orchestrator.md:949` — prose only: "Emit `session_end` event, carrying `person` and `checkout` as every line does."

Each is a substitution slot. None carries a branch, and no line anywhere in the prompt says "omit the key".

**Why the rule matters and where the miss shows.** `hooks/lib/events-query.ts:102-104` drops a field whose value is the empty string, so the two readers built in this same range degrade correctly. `bin/monitor` (plan step 7, not yet written) is specified to "drop the lines whose `checkout` is present and differs from this checkout's" — a reader written to that sentence literally, against a line carrying `"checkout":""`, drops nothing and is right by accident rather than by contract.

The unresolved half is not hypothetical: it is `bin/fusion-identity` exits 3, 4 and 5, and the missing-helper case that `shared/issues/260825-1329_*_every-session-runs-one-release-behind-on-a-bin-helper-the-same-repository-just-added.md` measures as the ordinary state of an install one release behind.

**Fix direction.** Show the omission in the one template that is executable, `:231`, rather than restating the rule a fourth time: build the two fields into a shell variable that is empty when the value did not resolve, or give the template a second form for the unresolved case. `agents/*.md` has 1 595 bytes of head-room left after this range, so the cheap form is the one to take.

**Scope.** `agents/orchestrator.md`; `skills/setup/SKILL.md` inherits the same template at plan step 4.
