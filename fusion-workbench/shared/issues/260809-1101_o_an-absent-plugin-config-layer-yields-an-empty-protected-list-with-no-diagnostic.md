An absent plugin config layer yields an empty protected list with no diagnostic

---

`hooks/lib/config.ts:348` returns the empty layer for a configuration file that
does not exist, with no diagnostic. Applied to the plugin layer, that silently
drops the effective `guard.protectedPaths` to `DEFAULTS.guard.protectedPaths`,
which is the empty list (`hooks/lib/config.ts:280`). The guard then protects
nothing and says nothing, which contradicts the loader's own stated contract.

---

Context.

The loader's docstring commits to the opposite behaviour at
`hooks/lib/config.ts:112-119`: a configuration file that exists but cannot be
read is dropped and recorded, never dropped silently. The commitment is scoped
to a file that exists. An absent file is exempt by construction:

```ts
function readLayer(path: string, kind: ConfigLayer): Layer {
  if (!existsSync(path)) return EMPTY_LAYER;
```

`hooks/lib/config.ts:337-346` argues the exemption, and for the project layer it
is right: a project that has never written `fusion-guard.json` is the ordinary
case and must not be nagged. For the plugin layer the same silence has a
different meaning, because the plugin's own `hooks/config.json` is the only
thing carrying a non-empty default list. The seeded template says so in its own
words (`templates/fusion-guard.json`, `_override`): fusion's built-in default
for the protected list is also the empty list, and only the plugin's file stands
between an omitted list and no protection at all.

The failure is total and quiet. With the plugin layer missing and a project that
declared nothing, `pickGuard("protectedPaths")` returns `[]`, the self-protection
floor adds `fusion-guard.json` only if that file exists
(`hooks/lib/config.ts:685-692`), and `config.diagnostics` is empty, so
`hooks/guard.ts:470` emits no advisory. `hooks/guard.ts:623` then matches every
written path against a one-or-zero-entry list, and
`hooks/lib/protected-snapshot.ts` enumerates nothing.

`inference:` reachability is low. `install.sh` copies `hooks/` wholesale, and
`findConfigPath` (`hooks/lib/config.ts:143-154`) finds `hooks/config.json` on the
second iteration of its upward walk from `hooks/dist/lib/`. The plausible routes
are a partial install, a truncated tarball, a `hooks/config.json` removed by
hand, or a future layout change that moves the file beyond the five-level walk
so the fallback at `hooks/lib/config.ts:153` returns a path that does not exist.
None of these is measured.

The point of filing it is not the probability. It is that this is the one
silence in the loader that contradicts a contract the loader itself states, in a
direction that removes protection rather than adding it.

---

Severity: Low today, by reachability. High by consequence if reached, because
the guard reports normal operation while protecting nothing.

Fix direction: distinguish the two layers in `readLayer`. An absent project
layer stays silent; an absent plugin layer produces one diagnostic naming the
path that was searched, which `hooks/guard.ts:470` already turns into a
`guard_advisory` on every guarded call until it is fixed. That is the same
loudness the module already chose for a plugin file that exists but does not
parse.

Cross-references:
`shared/analyses/260809-1101-guard-support-layer.md` (finding 5);
`templates/fusion-guard.json` (`_override`, `_inherits`);
`circles/260801-1244-guard-rules-write/issues/260804-1603_c_the-project-config-layer-is-not-type-validated-so-a-wrong-type-fails-the-guard-open.md`.

---

**Reconciliation 260809-1651 (reconciler, domain `code`) — stays `_o_`. Untouched by the defect round.**
The six commits `451a07e..fb262d8` touch `hooks/tracker.ts`, `hooks/lib/protected-snapshot.ts`, `hooks/lib/git-branch-guard.ts` and the new `hooks/lib/reverted-copy.ts`. `hooks/lib/config.ts`, `hooks/lib/churn.ts`, `hooks/lib/cross-file.ts` and `hooks/lib/escalation.ts` are not in the diff, so every line this record cites still reads as filed and its acceptance criteria are unmet.
