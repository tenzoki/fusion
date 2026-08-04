# Step 7 — the seeded template and this repository's own configuration file

**Agent:** ontocoder
**Circle:** `circles/260801-1244-guard-rules-write` — plan Step 7
**Date:** 260804, 14:45–15:05
**Status:** Complete
**Outcome:** Both JSON files written, three unit cases added, `npx vitest run` green at **1344 passed, 25 files** (baseline 1341 from Step 6). The three cases were each shown to fail under a deliberate mutation of the file they pin.

---

## The three sentences the prompt asked for first

**The underscore keys are genuinely ignored by the loader as built, and by construction rather than by convention.** `hooks/lib/config.ts` reads exactly five top-level keys off each layer (`:277-281`, against the `RawConfig` interface at `:137-143`); every other key on a parsed object is never looked at. The only thing that inspects the file as a whole is `readLayer` (`:216-241`), which rejects a non-object and reports a parse failure — an unrecognised key is neither. Measured as well as read: the seeded template loads with `diagnostics: []` and an effective configuration equal to the plugin's, which it could not do if any of its six keys were consumed or complained about.

**The root copy is byte-identical to the template**, sha256 `e5b66ef7dcd9db4af5fed0e7717d8ebd260a17e4a53197f621583e43777dc21c` for both, and that is now asserted in the suite rather than eyeballed — the case fails when either file is edited alone.

**`install.sh` ships what it should and only that.** Line 80 copies an explicit item list that includes `templates`, so `templates/fusion-guard.json` reaches `~/.fusion/templates/fusion-guard.json`, which is where Step 8's seeding `cp` will look for it. The root `fusion-guard.json` is not in that list, and nothing else in the script copies from `$SRC` (verified by reading the whole install block, `:58-93`, not only the loop) — so the development artifact does not ship. No finding, and no issue filed.

---

## What was written

### `templates/fusion-guard.json`, and `fusion-guard.json` at the repository root

Six documentation keys, no configuration keys, 13 lines. It carries all six things Step 7 names: what the file is; that it inherits the plugin's `hooks/config.json` and that the effective list lives there; how to override a top-level key; that it is git-tracked on purpose; that it protects itself once it exists; and the one sentence about the stand-down in fusion's own source tree.

**No commented-out copy of the default protected list**, per D-k, and the file says why in its own words rather than only obeying it — "a stale copy of a security-relevant list is worse than a pointer to the live one". Two smaller enumerations were avoided for the same reason and are worth recording, because both were tempting: the file does **not** list the five top-level keys (it says "the same shape the plugin's `hooks/config.json` uses"), and it does **not** carry an example override object. The five-key set is a schema that can gain a sixth member; an example carrying `blocksBeforeHalt` would have restated a live default.

Two claims in the file were checked in code before being written rather than taken from the plan:

- *"Once this file exists on disk the guard protects it, whatever this file itself says."* `hooks/lib/config.ts:287-292` — the floor keys on `existsSync`, appends whether or not the file lists itself, and is idempotent. Step 6's `describe("the self-protection floor, through the guard")` covers `Edit`, `rm`, `mv` and `>` on both surfaces.
- *"The escalation settings still apply, since the git branch-switch policy stays active even there."* `hooks/guard.ts:329-347` — STEP 1 of `guardBashCommand` reads `config.escalation.blocksBeforeHalt` at `:333`, and the self-detect gate is at `:378`, below it. So the sentence distinguishing the two halves is measured, not inferred from CLAUDE.md's prose.

### `hooks/lib/__tests__/config.test.ts` — three cases

Placed after the diagnostics and cache blocks, sharing the file's existing `tmp()`, `pluginConfig()` and `effective()` helpers. `effective()` matters here: `diagnostics` is a report about the load, not a setting, so it is excluded from the identity comparison and asserted separately.

1. **"merges to the plugin's configuration, plus the floor and nothing else"** — the template copied into a throwaway project root, loaded against the *shipped* `hooks/config.json`, compared to the same plugin config loaded with `projectRoot: null`. `protectedPaths` is asserted as a whole-list equality (`[...plugin, "fusion-guard.json"]`), so a reordering or a dropped path fails too; the rest is compared as a `JSON.stringify` with the floor entry taken back out.
2. **"inherits every top-level key, including paths added to the plugin later"** — the same load against a synthetic plugin layer whose every top-level key differs from `DEFAULTS`, including a `protectedPaths` of `["added-after-the-project-was-seeded/**"]`. This is the case that carries the acceptance criterion at `:328` operationally.
3. **"is what this repository's own fusion-guard.json is, byte for byte"** — string comparison for a readable failure, `Buffer.equals` for the claim actually made.

**Why case 2 exists, which is the part worth reading.** Case 1 alone cannot catch the most likely way this file goes wrong. A template that grew a `protectedPaths` key listing *today's* plugin paths verbatim still satisfies case 1 — the effective lists match — while silently ending the inheritance the whole step is for. Against a plugin layer that differs from `DEFAULTS` in all five keys, any top-level key the template declares gets replaced whole, falls back to `DEFAULTS`, and fails. That is the shape of the failure D-k was rejecting; the case is aimed at it rather than at the general idea of a wrong list.

---

## Anti-vacuity, by mutation

Every mutation was applied, run, and reverted; both files were restored from a scratch backup and re-verified with `cmp` and `shasum` afterwards.

| Mutation | Result |
|---|---|
| Template grows `guard.protectedPaths` listing today's nine plugin paths **verbatim** | Case 2 fails. Case 1 passes — the demonstration that case 1 is not sufficient on its own. |
| Template grows `escalation: {blocksBeforeHalt: 3}` — equal to `DEFAULTS` *and* to the shipped plugin value, so invisible to any comparison against the shipped config | Case 2 fails. |
| Root copy edited alone | Case 3 fails. |

The first row is the one that justifies the second case existing; without it the suite would have accepted a template that inherits nothing.

---

## Verification, against the plan's list

| Check | Result |
|---|---|
| `node -e "JSON.parse(…'templates/fusion-guard.json'…)"` | parses |
| same for the root copy | parses |
| `git check-ignore -v fusion-guard.json templates/fusion-guard.json` | exit 1, no match — both trackable |
| `grep -n "for item in" -A 2 install.sh` | `templates` in the list; root copy absent; no other copy from `$SRC` |
| One unit case on the merge | three cases, each mutation-checked |
| Root copy byte-identical | `cmp` clean, sha256 equal, and asserted in the suite |
| `npx vitest run` | **1344 passed, 25 files**, exit 0 |

`npm test` was deliberately not run: it builds first and would rewrite the `hooks/dist/` that plan Step 10 owns. `git status` shows `hooks/dist` carrying only the four untracked files that were already present when this session started.

---

## One bound worth stating, not a finding

The packaging check covers `install.sh`, which is what the plan asked for. The marketplace install path is different — `/plugin install` reads the marketplace's clone of this repository wholesale, so the root `fusion-guard.json` does sit inside a marketplace-installed plugin directory. It is inert there: the guard resolves its project layer with `findWorkbenchRoot(process.cwd())` from the *consuming* project's working directory (`hooks/lib/config.ts:257`), never from the plugin directory, so a copy inside the install is never read as anyone's project configuration. Recorded because "the root copy does not ship" is true of the installer and not quite true of the marketplace clone, and the difference should be visible rather than discovered later.

## Scope

Two JSON files and one test file. `hooks/lib/config.ts` untouched; `skills/setup/SKILL.md` (Step 8), `install.sh` and the documentation steps untouched. No commit made — the orchestrator commits after validation. No issue filed, no decision marker moved.
