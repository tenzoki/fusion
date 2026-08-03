# A structurally wrong but JSON-valid `escalation.json` makes the whole guard fail open, on both surfaces

---

**Severity:** Medium
**Domain:** code
**Filed by:** coderev, reviewing Turn 2 of `circles/260801-1244-guard-rules-write` (`bf75941..HEAD`)
**Affects:** every guard check on both surfaces — protected path, decision-governed,
rules-write exemption, halt. Not the git branch policy, which returns above the failure.
**Status at HEAD:** pre-existing in `lib/escalation.ts`, unchanged by this diff. In scope
because the Turn's third judgement question is whether any failure mode fails open, and this
is the one that does.
**Cross-references:** `hooks/lib/escalation.ts:58-68` (`loadEscalation`),
`hooks/lib/escalation.ts:113`, `:126`, `:146` (the three `recentEvents.push` sites),
`hooks/guard.ts:715-718` (the fail-open catch),
`hooks/lib/__tests__/helpers/guard-harness.ts:392-395` (the harness check that exists
because of this behaviour)

---

## What was found

`loadEscalation` parses without validating the shape:

```ts
const content = readFileSync(paths.statePath, "utf-8");
return JSON.parse(content) as EscalationState;
```

The `catch` below it handles a missing file and unparseable text. It does not handle text
that parses to a **valid JSON value of the wrong shape**, and the `as` cast tells the type
checker not to care. Every later access — `state.haltActive`, `state.recentEvents.push(…)` —
then throws, and `main().catch` at `guard.ts:715` prints one stderr line and emits `{}`,
which Claude Code reads as **allow**.

## Evidence — measured

Real guard subprocess, throwaway project, one seeded `escalation.json` per row, no flag set,
attacking a plainly protected path:

```
  escalation.json content          Edit agents/coder.md   Bash rm agents/coder.md
  ------------------------------   --------------------   -----------------------
  {}                               ALLOW (fail-open)      ALLOW (fail-open)
  {…} without recentEvents         ALLOW (fail-open)      ALLOW (fail-open)
  {"recentEvents":{}}              ALLOW (fail-open)      ALLOW (fail-open)
  null                             ALLOW (fail-open)      ALLOW (fail-open)
  truncated JSON                   deny                   deny
  empty file                       deny                   deny
```

with, on stderr and nowhere else:

```
[guard] Error: TypeError: Cannot read properties of undefined (reading 'push')
[guard] Error: TypeError: state.recentEvents.push is not a function
[guard] Error: TypeError: Cannot read properties of null (reading 'haltActive')
```

The two rows that behave correctly are the two the `catch` was written for. Every row that
fails open is well-formed JSON.

The result is total: the entire protected list, both surfaces, every sensitivity, and an
active halt is not consulted either. `guard.enabled: false` is the documented way to stand
the guard down; `echo '{}' > escalation.json` is an undocumented one with no banner and no
event.

## How this file gets into that state

`escalation.json` lives under `fusion-workbench/.guard-state/**`, which is protected, so an
agent cannot write it — which is why this is Medium and not High. The reachable routes are
human and tooling:

- **A user clearing a halt by hand.** The halt message says to run `clear-halt.js`. A user
  who does not have the plugin root handy, or who is in a hurry, edits or truncates the file.
  `echo '{}' >` and `echo 'null' >` are the two most natural things to type, and both silently
  disable the guard for the rest of the project's life rather than clearing the halt.
- **A partial write from an older or a different writer.** `saveEscalation` is atomic
  (temp + rename), so the guard itself will not produce one — but any future tool, script or
  hand-edit that writes a subset of the fields produces exactly the `{…} without recentEvents`
  row.
- **A schema change.** Adding a field to `EscalationState` is safe; renaming or removing
  `recentEvents` in a future version turns every existing project's state file into a
  fail-open on first run, with no migration signal.

## The harness already knows

`guard-harness.ts:392-395` refuses to accept a result when stderr carries `[guard] Error:`,
with the comment "without this check a crashed guard would satisfy every allow-side assertion
in the suite". The test infrastructure treats a fail-open as a harness failure. Production
treats it as an allow. That gap is the finding in one sentence.

## Candidate directions, not decided here

1. **Validate the shape in `loadEscalation`.** Coerce rather than trust: require an object,
   default each field, force `recentEvents` to an array. Five lines, no behaviour change for
   a well-formed file, and it turns every row above into the empty state — which is the
   correct reading of "this file tells me nothing".
2. **Fail closed on an unreadable state file.** Stronger and a real behaviour change: if the
   state cannot be read, deny the write rather than allow it. It matches the classifier's own
   fail-closed rule, and it risks locking a user out of a project whose workbench is in an odd
   state, which is why it wants a decision record rather than a patch.
3. **Do not fail open on an unexpected exception at all.** The broadest version of 2 and the
   most disruptive — the fail-open catch is deliberate and protects the user from a broken
   hook blocking all work. Worth naming so the current choice is a choice.

Direction 1 is what I would file as the fix; it closes the measured cases without touching
the fail-open policy. Whether the fail-open policy itself is right is a separate question and
belongs in a decision record, not in this Circle.

## Test coverage this needs

There is no case anywhere in the suite that seeds a malformed `escalation.json`. Six rows,
one assertion each, against the shipped guard — the measurements above are already in that
shape.

## Origin

Found in `circles/260801-1244-guard-rules-write` while probing the new `FsLocator`'s failure
modes for a fail-open. The locator has none — every throw returns null or false and refuses
the grant, which leaves the path protected. The fail-open is one layer up, in a module this
diff did not touch but now calls on the Bash path as well as the write-tool path.

---
Resolved: Direction 1, as filed. `loadEscalation` now coerces rather than trusts
(`hooks/lib/escalation.ts`, `coerceState`): it requires an object, defaults every
field, and forces `recentEvents` to an array, so all four well-formed-but-wrong-shape
rows read as the empty state instead of throwing into the fail-open catch. Two
coercions lean restrictive on purpose — `haltActive` reads any truthy value as halted
(a halt is the restrictive state and `clear-halt.js` can always clear it), and
`consecutiveBlocks` is clamped to a non-negative integer so a hand-edited negative
cannot push the halt threshold away.

The fail-open policy in `guard.ts` is UNCHANGED, per the issue: whether an unreadable
state file should deny rather than allow is a separate question for a decision record.

Measured on the shipped guard, one seeded file per row, no flag set, attacking
`agents/coder.md`:

```
  escalation.json content        Edit   before → after      Bash rm   before → after
  {}                             ALLOW (fail-open) → deny   ALLOW (fail-open) → deny
  {…} without recentEvents       ALLOW (fail-open) → deny   ALLOW (fail-open) → deny
  {"recentEvents":{}}            ALLOW (fail-open) → deny   ALLOW (fail-open) → deny
  null                           ALLOW (fail-open) → deny   ALLOW (fail-open) → deny
  truncated JSON                 deny → deny                deny → deny
  empty file                     deny → deny                deny → deny
```

Covered by `hooks/lib/__tests__/guard-escalation-shape.test.ts`, 19 cases: the six rows
on both surfaces, an anti-vacuity control proving the seeded file is genuinely read, two
well-formed-file cases proving no behaviour change, and the two restrictive coercions.
Stubbing the coercion back out fails 10 of the 19.
