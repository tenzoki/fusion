`hooks-wiring.test.ts` was in step 9's Files list, was not edited, and justifies the Bash matcher by a mechanism removed on 2026-08-12

---

Step 9's Changes text names `hooks-wiring.test.ts` among its twelve files and says what it must
gain: "`hooks-wiring.test.ts` keeps its Bash assertion and gains the current reason for it, the
configuration diagnostic loop." The file was not touched in `1d1d3a3` and is not in the Turn's
diff at all. Step 9 is marked `[DONE]` and its execution note records three departures from the
step's text; this is a fourth and is recorded nowhere.

What the file still says, at `hooks/lib/__tests__/hooks-wiring.test.ts:33-40`:

```
  // Regression guard for 260707-0616[o]: the guard's PreToolUse matcher
  // omitted Bash, so the policy that then read shell commands never ran in
  // production even though its unit tests passed. Nothing reads a command any
  // more, and Bash is still wired here for a reason that outlives every
  // classifier: it is where the BEFORE-fingerprint of the protected paths is
  // taken. Drop Bash from this matcher and a shell write to a protected path
  // has nothing to be compared against — `tracker.ts` measures an `after` with
  // no `before` and the whole protection lapses on that surface.
```

Every clause after "and Bash is still wired here for a reason" is false, and was already false
before this Circle opened: the protected-path fingerprint, its `before` in `guard.ts` and its
`after` in `tracker.ts` were all deleted on 2026-08-12. `hooks/guard.ts:180-183` states the
reason that actually holds now — "`hooks.json` still registers Bash on the PreToolUse matcher,
and the reason is the diagnostic loop above rather than anything about the shell".

---

**Why this is not merely a stale comment.** This Turn made the configuration diagnostic the whole
of the v10 migration for every consuming project (`hooks/lib/config.ts:105-114`), and the
diagnostic reaches a project through the guarded-call loop at `hooks/guard.ts:172-176`, which runs
for Bash because Bash is on this matcher. So the two assertions in this file are now the only
thing pinning the delivery mechanism of the migration, and the comment above them tells the next
reader that the reason for the wiring is a mechanism they can verify does not exist. A reader who
checks the stated reason, finds it gone, and drops Bash from the matcher silences the migration
notice on the surface that carries most of a session's guarded calls, and both remaining
assertions in this file are what would stop them.

**Severity:** Medium. Nothing is broken at HEAD; what is wrong is the recorded justification for a
line that must not move.

**Scope:** the plugin's hook test surface. No consuming project sees it.

**Cross-references:**
- `260816-1915_*_the-compliance-guard-becomes-observation-only.md` step 9, Files list and Changes text
- `hooks/guard.ts:178-195` — the current reason, already written
- `hooks/lib/config.ts:105-114` — why the Bash surface now carries the migration

---

Resolved: the comment above the two assertions in `hooks/lib/__tests__/hooks-wiring.test.ts` keeps the `260707-0616[o]` regression history, then states plainly that the protected-path fingerprint that justified the wiring after the classifier went on 2026-08-12, and gives the reason that holds now — the configuration diagnostic loop in `guard.ts`, which emits one advisory per guarded call, Bash being most of them. It goes on to the point this record made about severity: since the configuration file was renamed, the retired-file diagnostic is the whole of the v10 migration for a consuming project, and this matcher is how it reaches one, so dropping Bash here means a project carrying a stale `fusion-guard.json` hears about it on write-tool calls alone — which is where a silently unapplied Turn budget comes from. The two assertions are named as what stops that edit. Landed with plan step 11.
