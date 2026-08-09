# The churn half still runs before the reply, so any failure there discards the protected-path halt sentence

---

**Severity:** Medium — the revert and the halt land, the agent is told nothing; the failure class `260809-1101` was filed against, reached by a second cause
**Domain:** code
**Filed by:** coderev (incremental review of `6b94e17..HEAD`)
**Affects:** `hooks/tracker.ts:717-721` — `measured` is computed, then `trackChurn(input)` runs, then `respond(measured ?? undefined)`
**Cross-references:**
`fusion-workbench/shared/issues/260809-1101_c_churn-and-cross-file-state-are-cast-not-coerced-so-a-shape-valid-file-swallows-the-halt-message.md` (the same outcome, one cause, closed by `9bf7ca1`),
`hooks/lib/fail-open.ts` (states "verdict first, reporting after" for the top-level handler),
`fusion-workbench/shared/issues/260809-1825_o_an-unwritable-guard-state-directory-turns-the-protected-path-deny-into-an-allow.md` (the same shape on the PreToolUse side)

---

## What is wrong

`9bf7ca1` fixed one *cause* of the swallowed halt message — `loadChurn` casting
a shape-valid `churn.json` and throwing on the next field access. It did not
touch the *structure* that made that throw fatal:

```ts
const measured = measureProtectedPaths(input);   // revert + halt already done
trackChurn(input);                               // advisory heatmap; can throw
respond(measured ?? undefined);                  // the verdict, last
```

`measureProtectedPaths` has, by the time it returns, restored the protected
path, raised the halt and written it to disk. The one thing left to deliver is
the sentence that tells the model which file moved and how a human clears it.
That sentence is held until after an advisory metric has finished. Any throw in
`trackChurn` — `loadConfig`, `emitEvent`, `saveChurn` — reaches `main().catch`,
which calls `respond()` with no argument.

`lib/fail-open.ts` argues this exact ordering for the top-level handler: "a
failure in the reporting cannot withdraw a verdict that has already been
written." Inside `main` the order is the other way round.

The tracker's own header names the constraint this breaks: "The binding decision
makes the EXPLAINING refusal a constraint, because an agent that meets an
unexplained failure works around it… A revert the model never hears about would
satisfy the mechanism and violate the constraint."

## Measured

Scratch consuming project, `.guard-state/` writable, `churn.json` replaced by a
non-empty directory so `saveChurn`'s `renameSync` fails. `rules/x.md` protected
and modified during a `Write` call:

```
$ echo '<PostToolUse Write rules/x.md>' | node hooks/dist/tracker.js
{}
[tracker] Error: Error: EISDIR: illegal operation on a directory, rename '…/churn.json.tmp' -> '…/churn.json'
exit=0
--- file now: original          # reverted
--- haltActive: true            # halted
```

The same call with a writable `churn.json` returns the full
`hookSpecificOutput.additionalContext` sentence.

## Suggested direction

Deliver the measurement's sentence before the churn half runs, and treat the
churn half as reporting:

```ts
const measured = measureProtectedPaths(input);
respond(measured ?? undefined);
try { trackChurn(input); } catch (err) { /* report on stderr */ }
```

Note the ordering constraint `lib/fail-open.ts` documents: on a pipe
`process.stdout.write` is asynchronous, so nothing after the reply may throw
uncaught — hence the guarded call rather than a bare one.

Worth deciding at the same time, since it is the same seam: whether
`saveEscalation` inside `measureProtectedPaths` should also be best-effort, so
that an unwritable state directory costs the halt record but not the sentence.
That question is `260809-1825`'s, and this record should be resolved with it
rather than independently.

## Acceptance criteria

- [ ] With `churn.json` unwritable, a measured protected-path change still
      returns the `additionalContext` sentence and exits 0.
- [ ] The churn failure is reported (stderr and/or `guard_error`), not silent.
- [ ] A test in `hooks/lib/__tests__/hook-fail-open.test.ts` pins it, naming
      this record.
