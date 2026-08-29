Setup Step 0g has no branch for a malformed settings file, and skips the allow list for a project already bypassing

---
`bdc0df9` closed the real defect: Step 0g no longer replaces a project's existing `permissions.defaultMode` without naming it in the question. Verified across four states, and the fix is disjoint and complete for all of them. Two states remain undefined, and neither is new — but the commit rewrote both the read half (`skills/setup/SKILL.md:206`) and the write half (`:227`) without closing them. A malformed `.claude/settings.local.json` reaches an instruction to "parse it and union" with no failure path, under a standing rule that forbids overwriting. And a project already at `bypassPermissions` skips straight to the report, so it never gets the `allow` list the same section calls load-bearing for tools the bypass mode still gates.

---

## What the commit fixed, verified case by case

| State of `.claude/settings.local.json` | Behaviour at `3a0408a` | Verdict |
|---|---|---|
| absent | plain question (`:202`); on yes, created with the JSON (`:226`) | complete |
| present, `defaultMode: "bypassPermissions"` | question skipped, jump to §3 (`:206`, `:237`) | complete |
| present, some other `defaultMode` | question names the existing value and says yes replaces it (`:206`); scalar set only on that consent (`:227`); old value named beside new in the report (`:234`) | **complete — this is the defect that was fixed** |
| present, no `defaultMode` key | falls past `:206`'s two branches to the plain question; `:227`'s first clause ("when the file carries no `defaultMode`") authorises the write | correct in effect; `:206` reads as an enumeration and silently omits the case `:227` names |

## Gap 1 — malformed JSON is undefined

`:206` says to read the file and note `permissions.defaultMode`. `:227` says *"parse it and union the `allow` list"*. `:210` says *"Merge into any existing file; never overwrite one."* Nothing branches on a parse failure, and §3 (`:232-238`) has no report line for one.

The agent is left improvising after having asked a question that promised a write. The two obvious improvisations are both bad: overwrite the file, which `:210` forbids and which silently discards whatever the project had; or write nothing and report success, which is the silent-failure shape the rest of this skill is careful about.

**Fix direction.** One branch, placed with the read at `:206`: if the file exists and does not parse, do not ask the question at all. Report it in §3 as a state the user must fix by hand, naming the path, and continue Setup — a broken settings file is not a reason to halt Setup, and it is very much a reason not to write over it.

## Gap 2 — the already-bypassing project never gets the allow list

`:206`: *"Already `bypassPermissions` — skip the question (§3)."* §3 is the report. §2, the write, is skipped with it.

`:223` says the `allow` list is *"belt-and-suspenders for tools the bypass mode still gates"*. If that is true, a project already at `bypassPermissions` is precisely the project that needs the list and is the one project that never receives it. If it is not true, the sentence should not say so. Either way the two statements do not stand together.

This predates `bdc0df9`; the skip condition is unchanged by it.

**Fix direction.** Decide which of the two sentences is right. If the allow list matters under bypass, the skip should be "skip the *question*, still union the list" and §3 should report the union. If it does not matter, `:223` should say it is redundant under bypass and kept for the non-bypass path.

## Not in scope here

The measurement behind "bare tool names only" (`:224`) is recorded and unaffected; do not touch it while fixing the above.

**Found by:** coderev, reviewing `f4f01b0..3a0408a` (commit `bdc0df9`), with the state-by-state read performed by a supporting analyst pass and re-verified against `skills/setup/SKILL.md:198-238`.

---
**Reconciliation 260817-1836** (reconciler, domain `code`). Re-verified reproducible at HEAD `2552586`: `skills/setup/SKILL.md` still says parse and union with no parse-failure branch, and the already-bypassing branch still skips the write, so such a project never receives the allow list. Marker stays open. Log: `260817-1836-reconciliation.md`.

---
Resolved: fixed — a settings file that does not parse gets no question and no write and is reported for the user to fix by hand; an already-bypassing project skips the question and still gets the allow list unioned and reported; `skills/setup/SKILL.md:279`, `:311`
