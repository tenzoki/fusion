# Analysis: FJ05 step 21, the post-release proof from the `v13.0.0` tag

**Date:** 2026-10-10 08:53
**Type:** Feasibility (the post-release proof of plan step 21)
**Status:** Complete. Clauses 1, 3 and 4 pass. Clause 2 passes on the ref, on `--where` and on the user's real installs. Its wording "writes only its own home" does not hold for a bare `--update`. That behaviour is known and documented, and no byte differs from the tag, so it is no STOP. The user rules on the clause's wording.
**Requested by:** orchestrator, work package 260928-1338-json-control-data-and-markdown-artefacts
**Cross-references:** 261009-1021-plan-fj05-release-acceptance-of-13-0-0-with-the-claim-takeover.md (step 21, the step notes for C final and step 20, and the correction to the step-20 note); 261009-2148-fj05-re-migration-of-one-real-workbench-at-f2cc68f0.md (the copy harness and the figures compared against); 261004-2212_*_where-is-the-fj03d-windows-client-installed-from-which-ref-and-what-may-13-0-0-change-after-it.md (the `--update` behaviour, already recorded)

## Question

Does a fresh HTTPS install from the released tag hold every clause of plan step 21? The clauses are:

1. the installed bytes;
2. the launcher's update path;
3. a smoke test in a second project;
4. section 9's read-back of one real migrated workbench.

No Prior is present for any of them.

## Scope

**Live repository.** fusion, branch `fj-json-workbench`, HEAD `5bf2d3b0` (committed 2026-10-10T07:16:43+02:00), 1 ahead of `origin/fj-json-workbench`. The live tree was read for the plan, the 261009-2148 analysis and the rules. Its git object store was read with `git show`, `git archive v13.0.0`, `git rev-parse` and `git ls-remote`. **One whole-tree command ran there by mistake:** `git status -sb` at the start, which only reads, though git may refresh the index. Nothing was staged, committed or pushed. The only writes to the live tree are this report and its `-logs/` directory.

**The release.**

- `v13.0.0` is annotated tag object `7a5fc8f8`, which points at C = `468d8e870962988b22416ac2a4c1975ca7db2fb4`.
- `git ls-remote origin` shows `refs/heads/main` = `468d8e87` and `refs/tags/v13.0.0^{}` = `468d8e87`.

**The installer.** It was fetched from `https://raw.githubusercontent.com/tenzoki/fusion/v13.0.0/install.sh`. It is byte-identical to `git show v13.0.0:install.sh` (both sha256 `620f7031…bd7e`).

**Environment.**

- Every install, launcher and helper call ran under `env -i` with only `PATH`, `HOME` and the variables named for each step.
- `PATH` was one scratch directory of symlinks to node, git, curl and claude, plus `/usr/bin:/bin:/usr/sbin:/sbin`. Nothing on it matches `/prior/i`.
- `HOME` was a scratch directory. The one exception is the headless `claude` run, which needs the user's login, so it ran in the session's own environment with every `CLAUDE*`/`FUSION_*` variable removed, as `agent-dispatch-observation.test.ts` does.
- Versions: claude 2.1.296, node v25.7.0, git 2.53.0, macOS 26.6.2.

**Paths.** `<S>` in the logs stands for the scratch root, which has since been deleted.

## Findings

### Clause by clause

| Clause | Result | Evidence |
|---|---|---|
| 1a. Fresh install over HTTPS, `FUSION_REF=tags/v13.0.0`, scratch home and bin | **pass** | Installer exit 0, `fusion 13.0.0 installed.` (`00-install.log`) |
| 1b. Installed tree equals `git archive v13.0.0` on every path of the copy loop | **pass**: 0 differences | `diff -r` exit 0, 0 lines. 1 507 / 1 507 files, 265 / 265 dirs, the same 30 executable files. `LICENSE` is in the loop and absent at the tag, so it is absent on both sides |
| 1c. Every asset present, by `/fusion:check`'s asset block run verbatim from the installed file | **pass** | The prelude and the classification block of `skills/check/SKILL.md` print `case1-equal` for all four profiles, with no `case6-missing-shipped`. The `monitor` block copies `bin/monitor` (`01-assets.log`) |
| 1d. Bundle digest | **pass** | `codec/dist/fusion-record.js`, 699 011 bytes, `sha256:fb1703619c94bd2ed6ef8b753e70dd38e36dcb26da0775fb4e19274ed11bb66f` |
| 2a. The scratch launcher's `--where` | **pass** | Prints the scratch home, exit 0 |
| 2b. Which ref `--update` fetches | **pass**: `heads/main` = `468d8e87` | It downloads `main`'s `install.sh`, which is identical to `git show origin/main:install.sh`. That script prints `Downloading fusion (heads/main)`, and the tree it installs equals the tag's archive (`diff -r` exit 0) |
| 2c. `--update` "writes only its own home" | **does not hold for the bare form** (known, documented) | See the next section |
| 2d. `~/.fusion` and `~/.local/bin/fusion` unchanged; `~/.fusion`, `~/.local/bin/fusion` and `~/.fp` never written | **pass** | Before and after are equal: `~/.local/bin/fusion` `8a63f46e…`, `~/.fusion` `plugin.json` `3b89f1c4…` (12.2.1), the `~/.fusion` and `~/.fp` content trees, and `~/.fp-bin/fusion` (`07-real-installs-and-cleanup.log`) |
| 3a. `/fusion:setup`'s blocks verbatim create a JSON workbench | **pass** | `initialize` gives `result=initialized`. `workbench.json` is `fusion.workbench/v1` with `json-control-v1`. `marker=written` (`03-smoke-setup-and-wp.log`) |
| 3b. `/fusion:wp`'s blocks file a package; it is claimed | **pass** | `wp`'s Step 0 prints `"state":"json-control"`. Its filing block, with only the placeholders filled, lands two packages at `open`. `fusion-write claim` lands, and the claim is checkout `6be3efe7` |
| 3c. A headless analyst with Setup resolves `OUT_*` into the claimed container | **pass** | `OUT_ANALYSIS=work-packages/261010-0856-smoke-test-first-package/analyses`, and the same for every `OUT_*` and `SCAN_*`. Model `claude-haiku-5-5`, 4 turns, 9.3 s, **0.0081 USD** (`04-analyst-headless-run.log`) |
| 3d. One `bin/fusion-write` takeover of a package claimed by an absent checkout lands, with its consent record | **pass** | `result=landed`, exit 0. Claim `863f5f2f` → `6be3efe7`, one `claim_transfers` entry whose source is the answered consent decision. `validate` is valid, and `reconcile` resolves both references (`05-takeover.log`) |
| 4. Section 9's read-back on foreign workbench 1 | **pass** | 748 records valid, 0 findings. One open and one terminal package were read back through `show`, `fusion-paths` and `fusion-work-order`. The source's digests are equal across four readings (`06-foreign-workbench-1-read-back.log`) |

### Clause 2c: what `--update` writes

The launcher the tag's `install.sh` writes bakes its own home into `FUSION_DIR`, which a run and `--where` use. `--update` does not use it. It runs:

```
curl -fsSL "https://raw.githubusercontent.com/tenzoki/fusion/main/install.sh" -o /tmp/fusion-install.sh && bash /tmp/fusion-install.sh
```

It passes neither `FUSION_DIR` nor its own launcher directory to that script. Two runs measured this, each in a scratch `HOME`:

| Run | Environment | What it wrote |
|---|---|---|
| A | `HOME=<S>/home2`, no `FUSION_HOME`/`FUSION_BIN`: the form a user types | `<S>/home2/.fusion` (1 507 files), `<S>/home2/.local/bin/fusion` and `/tmp/fusion-install.sh`. **The launcher's own home was not touched** |
| B | `HOME=<S>/home3`, `FUSION_HOME`/`FUSION_BIN` = the launcher's own | Only `<S>/fhome` (same bytes as before) and `<S>/fbin/fusion` (same bytes). `<S>/home3` stayed empty |

So the bare `--update` of a second install writes `$HOME/.fusion` and `$HOME/.local/bin/fusion`. With the real `HOME`, those are the user's productive install. It writes `/tmp/fusion-install.sh` as well.

This is not new, and the release says so:

- `docs/upgrading-to-v13.md` `## Two installations on one machine`: "Never run `fusion --update` from the v13 launcher. It … reinstalls `heads/main` into `~/.fusion`."
- Decision `261004-2212_*_…` records it in the same words.

The installed bytes equal the tag, and their behaviour matches the shipped documentation. **That is why this is no STOP.** The plan's clause asked for something the release never claimed. The clause holds only in run B's form, which is the form the upgrade guide prescribes ("run the installer again with the same three variables").

### Clause 3: how the smoke test was built

- **The project.** `<S>/proj`: `git init -b main`, a repo-local identity and one commit. It is not fusion.
- **Setup.** All ten `bash` blocks of the installed `skills/setup/SKILL.md` ran verbatim, one after another, each under `env -i`.
  - Block 9, the "helper in work tree, not in install" line, exits 1 with no output. Outside fusion's own repository, `fusion-plugin-cwd` answers non-zero and the `&&` chain ends there. This is expected.
- **Filing.** `/fusion:wp` has no claim block: it files, and claiming is the orchestrator's **Claim** row. So the claim was `bin/fusion-write claim` as that row names it. `wp`'s filing block ran with its two placeholders filled in (`<YYMMDD-HHMM>-<topic>` and `<code|data>`), and with nothing else changed (the diff is in the log).
- **The absent checkout.**
  1. The workbench was committed, with the class-L entries of `/fusion:check`'s gitignore selector ignored. That selector's block, run verbatim afterwards, printed nothing.
  2. A clone B minted its own identifier `863f5f2f` and claimed the second package.
  3. B committed. A fast-forwarded from B.
  4. B was deleted.
- **The consent record.** It follows the orchestrator's **Take over** row:
  1. A decision in the package's container. Its narrative holds the stand-in word naming the package, `863f5f2f` and `6be3efe7`.
  2. Its `Answered:` line, ruled by user.
  3. `transition --to answered`, with `--answer-ref` = `--source` = `{"workbench_id":…,"record_id":…}` of that decision.

  **The narrative says plainly that it is a smoke-test scaffold.** The words were written by this run and are no real approval.
- **The takeover.** `claim --take-over-from 863f5f2f --source <that JSON>` landed (operation `7c7312c0…`). The `record_change` row reads `from claimed, to claimed, previous_checkout_id 863f5f2f, checkout_id 6be3efe7`.
- **The headless run.** `claude --plugin-dir <S>/fhome --agent fusion:analyst --model haiku -p … --permission-mode bypassPermissions --output-format json` exited 0.
  - The transcript shows exactly three tool calls: `fusion-workbench-root`, `fusion-rules analyst` and `fusion-paths analyst`.
  - The `fusion-paths` block in the agent's reply equals a direct call (empty diff).
  - The only side effect is the installed SessionStart hook's `session_start` row.
  - Haiku was chosen as the cheapest model that runs Setup. The clause concerns path resolution, not reasoning.
  - At this point the second package was still claimed by the absent B, and the analyst resolved into A's own claim alone.

### Clause 4: section 9's read-back on foreign workbench 1

**What this clause became.** The plan says to "migrate a fresh copy". The user has since migrated the real checkout of foreign workbench 1 with the released build and pushed it. So this clause is **a read-back of the real migrated state through the tag install, not a migration run by this proof.** The migration evidence on a copy is still 261009-2148's (step 15).

**The wait.** There was none.

- 08:52:55, the first look: `workbench.json` was already present. That look's status call failed on a misspelt option and read nothing.
- 08:58:35, the first complete read-only check (`GIT_OPTIONAL_LOCKS=0`): `## main...origin/main`, with no ahead/behind count and no entry, so the checkout was level and clean.
- `HEAD` = `origin/main` = `3b1558e6`, committed 08:52:23. Its last four commits are the migration's.

**Source digests.** Three digests were taken, in 261009-2148's form: the workbench content tree, the `.git` content tree, and a stat list of the whole project (256 258 entries). They were read four times: before the copy (08:58:52), after it (08:59:52), at the end (09:01:23) and after the copy was deleted (09:02:00). **All four readings are equal.**

| Digest | Value |
|---|---|
| Workbench | `def71901…7817` (10 015 files, 1 212 dirs) |
| `.git` | `b5aacd31…b63a` (696 files, 277 dirs) |
| Stat list | `d8269a7b…f0cf7` |
| HEAD / origin/main | `3b1558e6` / `3b1558e6` |

**The copy.**

- Made with `cp -c -R -p` (an APFS clone): 43 s, no measurable disk.
- Remote `origin` removed.
- `core.hooksPath` re-pointed to an empty scratch directory. As in 261009-2148, the source holds it as an absolute path to its own `.githooks/`.
- No commit was made in the copy. It was deleted at 09:01:37.

**The read-back, through the tag install's helpers in the copy.**

| Reader | Result | 261009-2148 copy A, after its migration |
|---|---|---|
| `validate` | `valid:true`, `checked:748`, 0 findings | 748 valid, 0 findings |
| `list` | 748 records. Package 120 (55 open, 13 paused, 4 claimed, 34 done, 14 dropped); issue 437 (436 open, 1 in progress); decision 141 (3 open, 138 answered); plan 50 (42 open, 7 in progress, 1 closed) | identical, kind for kind and state for state |
| `show`, the open record (first package at `open` with source `imported`) | `ok:true`, kind `package`, status `open`, narrative present | both `ok` |
| `show`, the terminal record (first package at `done` with source `legacy-terminal`) | `ok:true`, kind `package`, status `done`, narrative present | both `ok` |
| `fusion-paths analyst <open>` / `<terminal>` | exit 0 / 0, each container named in every `OUT_*` | the same |
| `fusion-paths analyst` (no item) | exit 0. It resolves into the package the copied checkout identifier holds | exit 0 |
| `fusion-work-order --format tsv` | exit 0, 86 lines, open named, terminal not. Text form: 72 items, 19 edges, 0 unmet, 0 unresolved, 0 cycles | 86 rows, open named, terminal not |
| `fusion-claimed-package` | exit 0, `PACKAGE=` and `CONTAINER=` | exit 0, the same |
| Copy workbench after every read | `def71901…`, unchanged | |

The real migration carries exactly the record mix that step 15 produced on a copy of the same project at C. That is the evidence that stands in for step 20's missing precondition (the correction note).

**One harness correction, not a product finding.**

- In the first read-back pass, `fusion-paths` without an item and `fusion-claimed-package` exited 1. This was `fusion-identity`'s documented stop: the scratch `HOME` has no git identity, and the copy had no repo-local one.
- The pass also printed `kind=undefined`, from a field name in this run's own script.
- 261009-2148 had set a repo-local identity in its copies before reading. This run did the same, and the second pass is the one tabled.
- Both passes are in the log. Nothing failed in the shipped bytes, and nothing was retried into a pass.

### The confidentiality grep

Two strings were grepped over this report, its `-logs/` directory and everything under `fusion-workbench/`: the full source path, and the project's name. The result for this report and its logs is in the `Verification:` line.

## Implications

- **13.0.0 ships what it says.** A fresh HTTPS install from the tag reproduces the archive byte for byte, carries the qualified bundle `fb170361…` and has every asset. It sets up a JSON workbench in a foreign project, files and claims, dispatches an agent that resolves into the claim, and performs a consented takeover from an absent checkout. All of this ran with no Prior present.
- **The real migration of foreign workbench 1 is sound, read through the release.** It is valid on 748 records, and every reader answers. Its record mix equals step 15's copy, rule for rule.
- **Clause 2c.** The only place where the step's wording and the release part is the bare `--update` of a second install. The release documents it as a "never". Whether that stays documented or the launcher learns its own home in a 13.0.1 is the user's ruling. Until then, the user's `~/.fp` launcher must never be given `--update`.

## Recommendations

1. **Orchestrator, step note on step 21.** Clauses 1, 3 and 4 pass. Clause 4 is a read-back of the real migrated checkout with no wait. Clause 2 passes on the ref and on the real installs. Clause 2c is recorded as the documented `--update` limit, citing `docs/upgrading-to-v13.md` `## Two installations on one machine` and decision `261004-2212_*_…`. Step 22 may proceed.
2. **User ruling, clause 2c.** Choose one:
   - (a) accept the documented limit and correct the plan's wording;
   - (b) a 13.0.1 in which the launcher's `--update` passes its own `FUSION_DIR` and launcher directory to the installer, and uses a private temporary file instead of `/tmp/fusion-install.sh`. The executor would be code-implementer, and the change is small. One integral fix: the launcher already knows both values when it is written.

   No issue is filed here, because decision `261004-2212_*_…` and the upgrade guide already carry the fact. If the user picks (b), the planner files it.
3. **Step 23's closing report** can cite this report for "step 21's results".

## Filed Issues

None. The one gap found (clause 2c) is already recorded in decision `261004-2212_*_where-is-the-fj03d-windows-client-installed-from-which-ref-and-what-may-13-0-0-change-after-it.md` and in `docs/upgrading-to-v13.md`.

## Sources

- Plan `261009-1021-plan-fj05-…`: step 21, the step notes (C final, step 20) and the correction to the step-20 note.
- Analysis `261009-2148-fj05-re-migration-of-one-real-workbench-at-f2cc68f0.md`: the harness, the copy method and every figure compared.
- At `v13.0.0`:
  - `install.sh` (and the launcher it writes);
  - `skills/setup/SKILL.md`, `skills/wp/SKILL.md`, `skills/check/SKILL.md` (assets, monitor, gitignore);
  - `agents/orchestrator.md` `## Work packages` (Claim, Take over);
  - `rules/fusion-workbench-conventions.md` (decision lines, takeover paragraph);
  - the headers of `bin/fusion-write`, `bin/fusion-record`, `bin/fusion-identity`, `bin/fusion-paths` and `bin/fusion-work-order`;
  - `docs/upgrading-to-v13.md` `## Two installations on one machine`;
  - `hooks/lib/__tests__/agent-dispatch-observation.test.ts` (the environment filter and the takeover cases).
- Decision `261004-2212_*_…`, its install-ref paragraph.
- Logs, beside this report in `261010-0853-fj05-post-release-proof-from-the-v13-0-0-tag-logs/`:
  - `00-install.log`
  - `01-assets.log`
  - `02-update-path.log`
  - `03-smoke-setup-and-wp.log`
  - `04-analyst-headless-run.log`
  - `05-takeover.log`
  - `06-foreign-workbench-1-read-back.log`
  - `07-real-installs-and-cleanup.log`
- Scratch, all deleted at the end of the run:
  - the scratch homes `fhome`, `home`, `home2` (with its `.fusion` and launcher) and `home3`;
  - `fbin`;
  - the scratch project and its clone;
  - the copy of foreign workbench 1;
  - the scripts (`skillblk.sh`, `fx.sh`, `ex.sh`, `realhash.sh`, `treehash.mjs`, `srchash.sh`, `readback.mjs`);
  - `/tmp/fusion-install.sh`;
  - the headless run's session transcript.

## Open Questions

- [ ] Clause 2c: accept the documented `--update` limit and correct the clause's wording, or plan a 13.0.1 launcher fix? This is the user's ruling.

Verification: installer from raw `v13.0.0` = `git show v13.0.0:install.sh` (cmp exit 0); `install.sh` exit 0; `diff -r` against `git archive v13.0.0` exit 0 (0 lines, 1 507 files); bundle `fb170361…` (699 011 bytes); check's asset block exit 0 (4 × `case1-equal`); `--where` exit 0; `--update` A exit 0 (wrote `$HOME/.fusion`, scratch HOME), `--update` B exit 0 (own home only); real `~/.local/bin/fusion` `8a63f46e…`, `~/.fusion` 12.2.1, `~/.fp`, `~/.fp-bin` before = after; setup blocks 1–8, 10 exit 0, block 9 exit 1 (expected); `initialize` `result=initialized`; `wp` create ×2 exit 0; `claim` exit 0; headless analyst exit 0, `is_error:false`, 0.0081 USD, haiku; decision create and `transition --to answered` exit 0; takeover `claim --take-over-from` exit 0 (`result=landed`); scratch `validate` valid (3); foreign workbench 1: readiness at the first complete check (wait 0 min), 4 × 3 source digests equal, copy `validate` valid (748, 0 findings), readers exit 0 (second pass; first pass exit 1 on the scratch git identity, a harness gap); confidentiality grep over this report and its logs for the source path and for the project's name: exit 1 / exit 1 (no match).
