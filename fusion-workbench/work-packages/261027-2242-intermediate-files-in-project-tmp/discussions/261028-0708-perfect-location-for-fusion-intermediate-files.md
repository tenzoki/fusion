# Where is the right place for fusion's intermediate files: short, reboot-safe, immune to `git clean -xdf`, and writable without permission prompts?

---
**Domain:** code
**Partners:** orchestrator (first partner) and consultant
**Rounds:** 3
**Ceiling:** 8
**Outcome:** converged
**Cross-references:** 261027-2242-intermediate-files-in-project-tmp.md, 261027-2252-plan-intermediate-files-in-project-tmp.md, 261027-2320-step-1-measurements-temp-root-hooks-sandbox-deny-sockets.md

---

## Question

The user (2026-10-28, de): "Die Schreibpermissions sind echtes ein Problem. Und andererseits `git clean -xdf` auch. Was ist der perfecte Ort? Die Checkout ID scheint mir safe. Aber der Pfad davor ist ein Problem."

It comes from the work package `261027-2242-intermediate-files-in-project-tmp`. The approved plan put intermediate files in a gitignored `<root>/tmp/`. Step 1's measurements then showed that `AF_UNIX` binds fail for roots longer than about 67 to 81 bytes. The orchestrator proposed a short symlink, and the user proposed `~/.fusion-tmp/<checkout-id>` as the real location. The orchestrator then named two costs. A location outside the project prompts on every write without `bypassPermissions`, unless it is granted. A gitignored `<root>/tmp/` is deleted by `git clean -xdf`.

The requirements the location must meet: R1 survives a reboot; R2 survives `git clean -xdf` in the project; R3 is writable by Claude Code's Write/Edit tools and by Bash without per-write prompts in the default and `acceptEdits` modes; R4 has a short path, below about 40 bytes before the suffix tools append; R5 is writable by sandboxed Bash; R6 never enters a commit; R7 is per checkout.

All R3 measurements force `--permission-mode`, because the user's `~/.claude/settings.json` sets `"defaultMode": "auto"` (C12).

## What held up

### C1 — `git clean -xdf` removes an ignored symlink `<root>/tmp` but never the directory it points to.

- **Advanced by:** first partner
- **Entered:** round 0
- **Last moved:** round 1
- **Evidence:** scratch repository with `/tmp` ignored and `tmp` a symlink to an outside directory holding `f`. `git clean -xdf` printed `Lösche tmp`, and the outside directory still held `f`.

### C2 — No location meets R2, R3 and R4 together without a settings entry.

- **Advanced by:** first partner
- **Entered:** round 0
- **Last moved:** round 1
- **Evidence:** in default mode with `{}` settings, even `Write $P/x.txt` inside the project was DENIED, so R3 needs a settings entry everywhere. `permissions.md:76`: default "Prompts for permission on first use of each tool". Every location inside the project is at least as long as the root, which fails R4 for deep roots. The original reason was incomplete in one respect: a nested repository inside the project survives `git clean -xdf` (C9).

### C5 — Claude Code's working-directory check resolves symlinks, so writing through a symlink `<root>/tmp` → `~/.fusion-tmp/<id>` still counts as outside the project and still prompts.

- **Advanced by:** first partner
- **Entered:** round 0
- **Last moved:** round 1
- **Evidence:** in default mode, `Write $P/tmp/a.txt` was DENIED as resolving outside the working directories. `permissions.md:468`: "Allow rules: apply only when both the requested path and the file it resolves to match". With `Edit(//$T/**)` allowed, writing through the link was still DENIED.

### C8 — The ignore line for a `<root>/tmp` symlink must be `/tmp` (no trailing slash); `tmp/` leaves the link untracked and `git add -A` commits it.

- **Advanced by:** consultant
- **Entered:** round 1
- **Last moved:** round 1
- **Evidence:** with `tmp/` in `.gitignore`, `git status --porcelain --ignored` gave `?? tmp`, and `git add -A` gave `A  tmp`.

### C9 — A real directory `<root>/tmp` that is itself a git repository (`git -C tmp init`) and is ignored survives `git clean -xdf` (only `-ff` removes it), so it meets R2 inside the project; it still fails R4 for deep roots.

- **Advanced by:** consultant
- **Entered:** round 1
- **Last moved:** round 1
- **Evidence:** `mkdir tmp && git -C tmp init -q && echo k > tmp/keep && git clean -xdf` removed the other untracked entries, and `tmp/keep` remained. The R4 half follows from the path length.

### C10 — In default mode, the grant that meets R3 is a `permissions.allow` entry `Edit(//<absolute path>/**)`: it covers the Write and Edit tools and Bash redirects. `additionalDirectories` covers `acceptEdits` and the sandbox, but not default mode. Setup writes both into `.claude/settings.local.json`, which applies without the folder-trust step unless it is tracked in git.

- **Advanced by:** consultant
- **Entered:** round 1
- **Last moved:** round 1
- **Evidence:** in default mode with `allow: ["Edit(//$T/**)"]`, `Write $T/g.txt` and `echo hi > $T/h.txt` both passed. `permissions.md:306`: a redirect's check "covers your `Edit` allow and deny rules". `permissions.md:780`: `.claude/settings.local.json` "applies its allow rules and additional directories without the trust step" unless it is tracked or `.claude` is a symlink.

### C11 — With the sandbox on, sandboxed Bash writes to an `additionalDirectories` path ran in default mode without a recorded denial.

- **Advanced by:** consultant
- **Entered:** round 1
- **Last moved:** round 1
- **Evidence:** `{"sandbox":{"enabled":true,"allowUnsandboxedCommands":false},"permissions":{"additionalDirectories":[T]}}` in default mode: a Python write printed `WROTE`, and `permission_denials` was empty. Without the entry the write failed with `PermissionError`. `sandboxing.md:82`.

### C12 — The user's `~/.claude/settings.json` sets `"defaultMode": "auto"`; any R3 measurement that does not force `--permission-mode` measures the auto classifier.

- **Advanced by:** consultant
- **Entered:** round 1
- **Last moved:** round 1
- **Evidence:** a read of `~/.claude/settings.json` gave `"permissions": {"defaultMode": "auto"}`. Unforced probes let both the outside write and the `.git` write through, and the forced reruns DENIED both.

### C6 — Among user-level prefixes, `$HOME/.fusion-tmp/` is the right one against `/tmp`, `/var/folders` and `~/Library/Application Support/…` (narrowed in round 2; the `~/Library/Caches` clause moved to C6a).

- **Advanced by:** first partner
- **Entered:** round 0
- **Last moved:** round 2
- **Evidence:** `/tmp` fails before any reboot. `man 8 tmp_cleaner` ("first appeared in macOS 14.0"; this machine runs 15.8.1); `/usr/libexec/tmp_cleaner:29` deletes files under `/tmp` that are `-atime +3 -mtime +3 -ctime +3`; `com.apple.tmp_cleaner.plist` runs daily. `/var/folders`: `com.apple.bsd.dirhelper.plist`, `CLEAN_FILES_OLDER_THAN_DAYS = 3`. `$HOME`: no shipped cleaner targets it, and files predating both reboots of 2026-10-27 survive. `Application Support` contains a space. Clearing `/tmp` at boot has no on-disk document, but it is no longer needed for the result.

### C13 — Writing directly to `~/.fusion-tmp/<id>` with both grants from C10 meets R3 in default and `acceptEdits`, and R5; R4 holds at 30 bytes; R2 and R6 hold because it is outside the project; R1 and R7 follow from it being a `$HOME` dotdir named by the checkout ID.

- **Advanced by:** consultant
- **Entered:** round 1
- **Last moved:** round 2
- **Evidence:** combined probe on `~/.fusion-tmp/probe-3612671` with both grants in a throwaway `.claude/settings.local.json`. The Write tool and a Bash redirect in `default` and in `acceptEdits`, and a sandboxed Python write in `default`, each had 0 denials and wrote its file. Controls with `{}` settings had 1 denial each and wrote nothing. R1 is from C6.

### C15 — Setup writes the two grants with `~/` paths, `Edit(~/.fusion-tmp/<checkout-id>/**)` and `additionalDirectories: ["~/.fusion-tmp/<checkout-id>"]`, into `.claude/settings.local.json`. It makes sure that file is git-ignored, through `git check-ignore` and otherwise the project's `.gitignore`, because Claude Code adds its global exclude only when it writes the file itself and a tracked file brings back the trust step. It merges instead of overwriting, because Claude Code saves "don't ask again" approvals to the same file.

- **Advanced by:** consultant
- **Entered:** round 2
- **Last moved:** round 3
- **Evidence:** both `~/` grants were measured with 0 denials (see C14). `permissions.md:369` names the `~/path` anchor. settings.md says the global exclude is added only "the first time Claude Code writes the file". Merge, from the docs (round 3): settings.md:79, "you choose 'Yes, and don't ask again', Claude Code saves that permission approval here as an `allow` rule"; settings.md:59 and :121. The docs save only Bash, WebFetch and WebSearch approvals permanently (permissions.md:29). The dialog could not be triggered under `-p`, so this was not measured.

### C6a — `~/Library/Caches` fails R1, because Apple says apps must never rely on cache files existing; `$HOME/.fusion-tmp` carries no such disclaimer (split from C6 in round 2, reworded in round 3).

- **Advanced by:** first partner
- **Entered:** round 2
- **Last moved:** round 3
- **Evidence:** Apple File System Programming Guide, macOS Library Directory page, Caches row: "Contains cached data that can be regenerated as needed. Apps should never rely on the existence of cache files." The round-3 wording "R1 asks for a guarantee" was narrowed, because `$HOME/.fusion-tmp` has no vendor guarantee either.

### C16 — In a git worktree, setup writes the grants into `.claude/settings.local.json` at the main checkout's root, found through `git rev-parse --git-common-dir`, not at the worktree's root; several checkouts' entries then share that file, so merging and removing go entry by entry.

- **Advanced by:** consultant
- **Entered:** round 3
- **Last moved:** round 3
- **Evidence:** settings.md:85, "In a worktree, it uses the file at the main checkout's root"; permissions.md:29. Probe in default mode: a grant in the worktree's own file worked from the worktree root but was DENIED from a worktree subdirectory, while a grant in the main checkout's file worked from both. The exceptions where the file stays beside `.claude/settings.json` are at settings.md:88: outside a git repository, a repository rooted at `$HOME`, Windows, or files not owned by the user.

## What fell

### C3 — `<root>/.git/fusion-tmp/` meets R1, R2, R3 and R6, but fails R4 for deep roots, fails for worktrees whose `.git` is a file, and Claude Code may treat writes under `.git/` as protected.

- **Advanced by:** first partner
- **Entered:** round 0
- **Last moved:** round 1
- **Evidence:** the R3 half falls. `.git` is a protected path: `Write .git/fusion-tmp/c.txt` was DENIED in default and in `acceptEdits`. permission-modes.md, Protected paths: "`default`, `acceptEdits` | Prompted", and "`permissions.allow` rules in settings files do not pre-approve protected-path writes". The rest held: a worktree's `.git` is a 49-byte `gitdir:` file, and `.git/fusion-tmp/y` survived `git clean -xdf`.
- **Conceded:** first partner, round 1 — the protected-path rows cited above.

### C4 — `permissions.additionalDirectories` lets the Write/Edit tools write to `~/.fusion-tmp/<checkout-id>` without prompts in the default and `acceptEdits` modes, and a separate sandbox write allowance does the same for sandboxed Bash.

- **Advanced by:** first partner
- **Entered:** round 0
- **Last moved:** round 1
- **Evidence:** the default-mode half falls. With `additionalDirectories=[$T]`, `Write $T/d-default.txt` was DENIED, and only the `acceptEdits` write passed. `permissions.md:77`. The separate sandbox allowance is unnecessary: `sandboxing.md:82` and `:673` say `additionalDirectories` and `Edit` allow rules already grant sandboxed writes.
- **Conceded:** first partner, round 1 — the denied default-mode write and `permissions.md:77`.

### C7 — The best answer is the real directory `~/.fusion-tmp/<checkout-id>`, granted by setup through `additionalDirectories` and the sandbox allowance, with an optional gitignored convenience symlink `<root>/tmp` pointing at it.

- **Advanced by:** first partner
- **Entered:** round 0
- **Last moved:** round 1
- **Evidence:** as worded, the grants fail default mode (C4). Writes through the symlink are DENIED even under the allow rule (C5). The corrected grant is C10.
- **Conceded:** first partner, round 1 — C4 and C5. The corrected form is carried by C13.

### C14 — The `.claude/settings.local.json` entries from C10 must be absolute and written from the resolved `$HOME`, and the file is gitignored, so a fresh clone carries none.

- **Advanced by:** first partner
- **Entered:** round 2
- **Last moved:** round 2
- **Evidence:** `~/` paths work for both grants: `Edit(~/.fusion-tmp/<n>/**)` alone gave 0 denials in default mode, and `additionalDirectories:["~/.fusion-tmp/<n>"]` alone passed in acceptEdits and sandboxed Bash; `permissions.md:369`. That the file is gitignored is not guaranteed for a file setup writes: settings.md, "If you created the file by hand and Claude Code hasn't written to it yet, add it to `.gitignore` yourself."
- **Conceded:** first partner, round 2 — the two measurements and the settings.md sentence above.

## What could not be decided

## Open dissent

## Recommendation

This recommendation is qualified and binds nothing; the user's ruling and the revised plan are what bind.

The discussion converged on the real directory `~/.fusion-tmp/<checkout-id>` (C6, C6a, C13). No location meets the permission requirement without a settings entry (C2). Setup grants this one with two entries in `.claude/settings.local.json`: `Edit(~/.fusion-tmp/<checkout-id>/**)` for default mode, and `additionalDirectories` for `acceptEdits` and the sandbox (C10, C11, C15). It writes them by merging entry by entry, into the main checkout's file when it runs in a worktree (C16), and it makes sure the file is git-ignored (C15). A view-only symlink `<root>/tmp` may be added, ignored as `/tmp` without a trailing slash (C8). Agents must write through the real path, never through the link (C5).

The user chose option 1 on 2026-10-28: close, and revise the plan to `~/.fusion-tmp/<checkout-id>` with the view-only symlink and no deny entries when the sandbox is enabled.
