# ontocoder — Plan Step 6: the guard-configuration template and the repository's own copy

**Status:** In progress
**Task:** Plan `planning/260804-1633_p_plan-c5b-remediation-and-ship.md` Step 6 — correct
`templates/fusion-guard.json` and the byte-identical root copy `fusion-guard.json` so their
documentation keys state what the loader actually does.

## What was done

Rewrote the underscore-prefixed documentation keys of `templates/fusion-guard.json` and
copied the result byte-identically to `fusion-guard.json`. The file grew from six keys to
seven: `_guardEnabled` is new and carries the one-key exception of decision `260804-1631`
(the plan step allowed "a key or clause"; a clause inside the already-long `_override` would
have buried it).

## The sentences changed, each with its backing

Test names cite `hooks/lib/__tests__/`; code lines cite `hooks/lib/config.ts` at working
tree state after plan Steps 1–4.

1. **`_what`** — "merge it over the plugin's own defaults" became "merge it over the
   plugin's own hooks/config.json and then over fusion's built-in defaults"; "Keys the
   parser does not recognise are ignored" became "carried through untouched and never
   reported". Backing: `config.test.ts` describe "merge — per leaf: project, then plugin,
   then DEFAULTS"; case "accepts unknown keys, including the template's documentation keys"
   (asserts empty diagnostics); `config.ts:545-551` (unknown keys carried through).
2. **`_inherits`** — added "plus this file itself (see _protectsItself)" to the effective
   protected-list sentence. Backing: `config.test.ts` "merges to the plugin's configuration,
   plus the floor and nothing else"; "inherits every top-level key, including paths added to
   the plugin later" (backs the unchanged final sentence).
3. **`_override`** — the whole key rewritten around the leaf rule; the false top-level
   replace-whole description is gone. New claims and their backing:
   - Declared key taken exactly, omitted key inherits plugin then DEFAULTS, even inside a
     declared object: `config.ts:628-631` (`pickGuard`); cases "an OMITTED leaf comes from
     the plugin layer, not from DEFAULTS", "mixes the two layers inside one object, leaf by
     leaf", "walks the same way through escalation, churn, crossFile and decisions".
   - The `defaultSensitivity: "high"` example: the exact shape of "an OMITTED leaf comes
     from the plugin layer" (issue `260804-1601`'s measured edit).
   - Declared empty list stays empty: "a DECLARED empty list is the empty list, not an
     inheritance"; `guard-rules-write-integration.test.ts` "blocks it even when the
     project's own list is empty" (proves the empty list took effect through the guard).
   - Built-in default for the protected list is the empty list, so only the plugin's file
     stands between an omitted list and no protection: `config.ts:280`; cases "validates the
     PLUGIN layer through the same function" and "says nothing about an absent PLUGIN file
     either" (both end at `protectedPaths: []`).
   - A declared entry outranks `FUSION_ALLOW_RULES_WRITE`; declaring `rules/**` withdraws
     the flag from the whole rule directory (decision `260803-1314`, option 2):
     `guard-rules-write-integration.test.ts` describe "a project's own protected entry
     outranks the rules-write flag"; `rules-write-exemption.test.ts` "a project that
     declares rules/** ITSELF loses the flag for rules/" and "HALF 2, stated: a project that
     declared nothing is unchanged".
   - Wrong-typed value dropped, named, inherits as if omitted: describe "a value that
     cannot be used is dropped, named, and inherited past".
   - Invalid JSON dropped and reported: describe "diagnostics — a dropped source is named,
     never silent"; integration "still REPORTS a broken configuration there".
4. **`_guardEnabled`** (new) — the one key a project may not set; read from the plugin
   layer and DEFAULTS only; declared true or false both ignored; reported in a guard
   advisory on every guarded call until removed. Backing: `config.ts:563-568, 697`; describe
   "the project layer may not set guard.enabled" (both directions, one diagnostic);
   integration "reports the ignored key, once, naming it — decision 260804-1631" and
   "STATED COST: that advisory repeats on every guarded call until the line is removed".
5. **`_gitTracked`** — kept, plus one sentence naming what the git tracking bounds: the
   pre-existence gap of the floor. Backing: `config.ts:104-110`; integration "does NOT
   block creating it when the project has none — the seeding case".
6. **`_protectsItself`** — the two falsified claims (issue `260804-1605`) are true again
   and now stated with their proof surface: holds under a declared empty list ("blocks it
   even when the project's own list is empty"), when it lists itself ("blocks it just the
   same when the file DOES list itself"), when unparseable (`config.test.ts` "applies even
   when the file is unparseable, because the file still exists"), under
   `guard.enabled: false` (integration "ignores guard.enabled: false and keeps denying on
   both write surfaces", which asserts the `fusion-guard.json` row), against the flag
   ("is not reachable through FUSION_ALLOW_RULES_WRITE"), on both surfaces ("blocks an Edit
   to fusion-guard.json…", "blocks a SHELL delete of it…"), and from a subdirectory working
   directory (describe "the self-protection floor reached from a subdirectory" — the Step 1
   settlement that the floor protects the file the loader actually read). The creation gap
   is stated rather than hidden ("does NOT block creating it when the project has none").
7. **`_inFusionsOwnSourceTree`** — the incompleteness the issue measured is closed from the
   other side: the key now says the self-protection stands down with the write guard there
   (integration "does not protect its own fusion-guard.json there"), that the file is still
   read and a broken one still reported there ("still REPORTS a broken configuration
   there"), and that `guard.enabled` cannot switch the branch policy off from this file
   anywhere ("ignores it in the plugin's own repo too"). The escalation sentence survives
   as written: `config.ts:633-638` (project escalation consulted) plus
   `guard-bash-integration.test.ts` "still denies a branch switch in the plugin's own repo"
   (escalation state recorded there).

## Verification

- `node -e "JSON.parse(...)"` on both files: both parse.
- `cmp templates/fusion-guard.json fusion-guard.json`: byte-identical.
- `cd hooks && npx vitest run lib/__tests__/config.test.ts`: 72 passed, 0 failed — includes
  the byte-identity case, the seeded-template merge cases and the anti-vacuity case against
  a plugin layer that differs from DEFAULTS in every key.

## Issues closed

- `issues/260804-1605_c_the-seeded-template-states-two-properties-the-loader-does-not-have.md`
  — `Resolved:` footer appended, renamed `_o_` → `_c_`.
- `issues/260805-1840_c_fusion-guard-template-beschreibt-top-level-merge-statt-leaf-merge.md`
  — `Resolved:` footer appended (German, matching the record), renamed `_o_` → `_c_`.

## Side effects / notes

- Plan Step 6 marked `[DONE — ontocoder, 260805-2222]` inline in
  `planning/260804-1633_p_plan-c5b-remediation-and-ship.md`.
- Not committed — the orchestrator commits (plan convention; Step 8 rebuilds `dist` and
  ships).
- `tasklist.md` carries no entry for this step (it belongs to an older plan); left
  untouched.

**Status:** Complete
