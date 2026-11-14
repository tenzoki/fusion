# Analysis: request 82, the hook rows on the 13.5.0 payload

**Date:** 2026-11-14 17:11
**Type:** Impact (measured rows on a built payload)
**Status:** Complete
**Requested by:** orchestrator, plan `261114-1656-plan-request-82-the-candidate-13-5-0-for-prior.md` step 3

## Question

Do the three hook rows of request 79's `#### The hooks` give on the 13.5.0 payload what they gave on 13.4.4, under the same three settings? And what does the one hook change step 1 found reachable on Prior do: the `staging-drift` record report on an uncommitted `campaigns/<id>/campaign.json` after a commit?

## Scope

**The payload.** Digest `sha256:2ba70dbeba8662212ef8312801da1c8103e90bfe42cf6a1ac8e34b71352ad643`, tarball `/Users/kai/.fusion-tmp/114caf11/request-82/out-a/fusion-13.5.0.tar`. `shasum -a 256 -c fusion-13.5.0.tar.sha256` in `out-a/` prints `fusion-13.5.0.tar: OK` (measured). The tarball was extracted afresh into `/Users/kai/.fusion-tmp/114caf11/request-82/hooks/payload/` (1 684 files). `diff -r` of that against step 2's `x135/` exits 0 (measured), so the two extractions are the same. Every row ran on the fresh one. `out-a/`, `x135/` and the delivered bundle were read and not modified.

**Fusion.** `HEAD` `c25bfba1faa515d8d46c82f61e6ca8b309030b91`, 2026-11-14 17:08:35 +0100, branch `main`. `git status -sb -- codec adapters catalog` prints `## main...origin/main` and no path (no fetch was run). Readings "at a tag" use `git show <tag>:<path>`. No whole-tree git command ran in the live tree, and no tag was checked out.

**Prior.** Read from committed objects only: `git -C /projects/productive/F09-Prior show 10e07d2:docs/design/fusion-entry-v2-request79-prior-response.md`. Nothing was written there.

**Not run.** No 13.4.4 hook ran (plan, `## Where this work stops`). Where a row states 13.4.4's behaviour, it cites request 79's table or reads 13.4.4's source with `git show`, and says which.

**Labels.** **measured**: a command ran and its output is stated. **read**: read in source, not run. *inference* is marked.

## Method

The method of request 79's `#### The hooks` (`REQUESTS.md:7299`), with the differences listed after it.

- **Script** `/Users/kai/.fusion-tmp/114caf11/request-82/hooks/scripts/rows.sh` (sha256 `f629fe2a02d9262a424bee2853ae3b221bc0c62506f4a7afa71487f858b8ca11`). It unsets `TMPDIR` and `CLAUDE_CODE_TMPDIR`. Each row group gets a fresh git repository holding `fusion-workbench/.fusion-setup` (version `13.5.0`) and `fusion-workbench/.checkout-id` (`c82hooks`) in one initial commit, and no `.check-stamps`. The hooks run with cwd at the repository and the stdin payload Claude Code sends (`session_id`, `cwd`, `hook_event_name`; for the tracker `tool_name` `Bash`, `tool_input.command`, `tool_response`).
- **Row 1**: the tracker on `cat /tmp/x`.
- **Row 2**: `session-start.js`, its `systemMessage`.
- **Row 3**: `fusion-workbench/.commit-msg-tmp` written; the tracker on `ls` (records HEAD); a commit of `notes.txt` outside the workbench moves HEAD; the tracker on `git commit`.
- **Row 4** (the step-1 change): the same sequence as row 3 with `fusion-workbench/campaigns/260929-0900-parser-lanes/campaign.json` in place of `.commit-msg-tmp`, its content the payload's `codec/fixtures/valid/campaign/with-lanes.json`. **4a** untracked; **4b** control without the file; **4c** the file committed, then changed by one byte and left unstaged.
- **Settings.**
  - **S1, image:** `docker run --rm --network none node@sha256:6449e19d8184d84062525b6a7524def03146c2cb04a7f08b076680d0e8e4240a`, the payload mounted read-only at `/opt/fusion`, both roots `/opt/fusion`, `HOME=/tmp`, uid 0, Node v24.22.1, git 2.39.5. The image's environment holds none of `TMPDIR`, `TMP`, `TEMP` or `CLAUDE_CODE_TMPDIR` (measured, `env | grep`). The repositories are created inside the container.
  - **S2, macOS:** both roots at the payload's own path, `HOME=/Users/kai`, Node v25.7.0.
  - **S3, macOS:** `FUSION_PLUGIN_ROOT=/opt/fusion` alone, `CLAUDE_PLUGIN_ROOT` unset. `/opt/fusion` does not exist on this Mac (measured, `ls`); node runs the payload's own `dist`.
- **Outputs**, stdout and stderr together, in `/Users/kai/.fusion-tmp/114caf11/request-82/hooks/`: `s1-image-both-opt.txt` (sha256 `b39f3825…fe30f`), `s2-macos-both-payload.txt` (`aa860ac2…7a06`), `s3-macos-fusion-root-alone.txt` (`00b8fa74…14d8`). Every hook exited 0 in every setting. No hook wrote to stderr.

**Differences from 79's method.** 79 used one scratch repository. This step uses one per row group, so a throttle record of one row cannot silence another. 79 ran only the tracker row under S3; this step ran all four, and S3's session-start row needs a caveat (below). The image ran on this Mac's arm64 Docker (`docker image inspect`: `arm64`), as 79's did.

**No row is a run on Prior's host, and no row is compared with a Claude Code baseline.** S1 is Prior's pinned image without Prior's executor: no read-only root, no tmpfs, no uid 65532, no `host.exec.v1`.

## Findings

### The three rows of request 79, on 13.5.0

| Setting | Row 1: tracker reply on `cat /tmp/x` | Row 2: session-start `systemMessage` | Row 3: commit-message sentence, where a message goes |
|---|---|---|---|
| S1, image, both at `/opt/fusion` | `{}` | the due line, twelve selectors (`monitor, concurrency, assets, config, permissions, gitattributes, identity, gitignore, upstream, leftovers, claude-md, tmp`); no `fusion` line | "On Prior a commit message goes to /tmp/fusion-commit-msg-<name>, which is outside every git tree;" |
| S2, macOS, both at the payload | `additionalContext`, the sentence naming `"$FUSION_PLUGIN_ROOT/bin/fusion-tmp" path` and `## Intermediate files` | the due line, the same twelve, and the `fusion` line ("CLAUDE_CODE_TMPDIR is unset, TMPDIR is unset … both should name /Users/kai/.fusion-tmp/c82hooks") | "The orchestrator's commit step writes the message to ~/.fusion-tmp/<checkout-id>/fusion-commit-msg-<session-id>-<task-id>.txt, in the directory bin/fusion-tmp path prints," |
| S3, macOS, `FUSION_PLUGIN_ROOT` alone at `/opt/fusion` | the same sentence as S2 | the `fusion` line only, **no due line** (see the caveat) | the same as S2 |

All measured. Row 3's sentence came as the tracker's `additionalContext` on `git commit`, and the tracker on `ls` answered `{}`. The text after "outside every git tree;" is byte-equal between S1 and S2 (`sha256` of the tail, `fea059f9…`, measured).

**Against request 79's table (`REQUESTS.md:7301-7307`).**

| Row | 13.4.4, as 79 states it | 13.5.0, measured here | Equal |
|---|---|---|---|
| S1 row 1 | `{}` | `{}` | yes |
| S1 row 2 | due line, twelve selectors; no `fusion` line | the same | yes |
| S1 row 3 | "On Prior a commit message goes to /tmp/fusion-commit-msg-<name>, which is outside every git tree;" | the same clause | yes |
| S2 row 1 | `additionalContext`, the sentence naming `bin/fusion-tmp path` | the same | yes |
| S2 row 2 | due line and the `fusion` line | the same | yes |
| S2 row 3 | "The orchestrator's commit step writes the message to ~/.fusion-tmp/<checkout-id>/…, in the directory bin/fusion-tmp path prints," | the same clause | yes |
| S3 row 1 | the same sentence | the same sentence | yes |
| S3 rows 2, 3 | not run | measured, above | no 79 row to compare |

**Why these rows cannot have moved, by bytes.** `cmp` of the extracted 13.4.4 tarball (`x1344/`) against this payload (measured): `hooks/hooks.json`, `hooks/dist/tracker.js`, `session-start.js`, `session-id.js`, `guard.js`, `subagent-stop.js`, `lib/temp-paths.js` and `lib/checks-due.js` are byte-equal. `lib/staging-drift.js`, `lib/stores.js`, `lib/orchestrator-events.js` and `lib/citation-corpus.js` differ. Step 1 item (e) found the last two changed in comments only, and `staging-drift.js` by the one `classify` branch row 4 measures. The `runsOnPrior` branch of the commit-message sentence (`staging-drift.ts:820` at the tag) and the temp-path job's gate (`tracker.ts:557`) are unchanged. *Inference,* now backed by the rows: step 1's prediction that the three rows equal 13.4.4's holds.

**S3's session-start row is an artefact of the setting.** `pluginRoot()` in `session-start.ts` takes `CLAUDE_PLUGIN_ROOT ?? FUSION_PLUGIN_ROOT` (read). With `CLAUDE_PLUGIN_ROOT` unset it takes `/opt/fusion`, which does not exist on this Mac, so `pluginVersion` finds no version and `checksDueLine` returns `null` (read). The missing due line says nothing about Prior. On Prior both roots are set (79's `#### The hooks`, read), which is S1. The `fusion` line appears because `runsOnPrior` needs both roots at `/opt/fusion` (`temp-paths.ts:73-75`, read).

### Against Prior's measured rows (response to 79 at `10e07d2`, `## The bundle's hook changes on Prior's executor`)

Prior measured 13.4.4 on its executor in ten contained cases: 87 hook commands, every exit 0, no stderr (quoted from that section).

| Prior's row on 13.4.4 | This step's S1 row on 13.5.0 | Reading |
|---|---|---|
| Session start: due line, twelve selectors, `tmp` last, in all 10 cases; no launcher line | the same twelve, `tmp` last; no `fusion` line | same output. *Inference:* a Prior run on 13.5.0 gives Prior's 13.4.4 row, since the files that produce it are byte-equal |
| Tracker `{}` on 18 of 18 `PostToolUse` replies, five naming `/tmp/multi-line-block.txt` | `{}` on `cat /tmp/x` | same output |
| Commit-message sentence: **no case reached it**; three `git commit` calls answered `{}`, since no case writes `.commit-msg-tmp` | reached here only because the step writes `.commit-msg-tmp` itself; the Prior clause | not comparable to a Prior run: Prior's cases never meet the trigger. The clause equals 79's S1 row |

### Row 4: the `staging-drift` report on a campaign file (the change step 1 found)

| Case | S1, image | S2, macOS | S3, macOS |
|---|---|---|---|
| 4a, `campaign.json` untracked, HEAD moved | "fusion: HEAD moved and 1 record(s) under fusion-workbench/ are still uncommitted — campaigns/260929-0900-parser-lanes/campaign.json (untracked). No staging list named them, so no commit could carry them." then the staging-list paragraph | the same | the same |
| 4b, control, no campaign file | `{}` | `{}` | `{}` |
| 4c, `campaign.json` tracked, changed, unstaged | the same sentence with "(unstaged)" | the same | the same |

All measured. In 4a and 4c the tracker on `ls` answered `{}` and the sentence came on `git commit`. The 4a line is byte-equal in all three settings (one sha256, `07dd205c…c534`, over the three files' lines, measured). That fits the source: the record half of `stagingSentence` has no `runsOnPrior` branch (`staging-drift.ts:806-814` at the tag, read). Only the commit-message half has one.

The paragraph after the record sentence tells the model: "If you are the orchestrator, add these paths … to the next commit's staging list … If you are a dispatched child run, carry this line into your report — committing is the orchestrator's." On Prior, `59-prior.md` says a Prior run makes no commit (step 1 item (b), read). *Inference:* on Prior the sentence asks for a staging step no Prior role takes. Its record half was already reachable on 13.4.4 by any uncommitted record under a store. The campaign file is one more path that triggers it, not a new kind of text.

**On 13.4.4, read, not run.** `git show v13.4.4:hooks/lib/staging-drift.ts`: `classify` has no campaign branch. `campaigns/<id>/campaign.json` is not live state, not a root record (`ROOT_RECORDS` is empty, line 321), not a control file, and `campaigns` is not in `RECORD_STORES` (`v13.4.4:hooks/lib/stores.ts:29-42`: plans, issues, decisions, discussions, analyses, reviews, investigations, history, consultations, memos, forum, checkouts). The name does not match `COMMIT_MESSAGE` (`/commit[-._]?(msg|message)/i`, line 339). It ends as `unclassified` (line 565), which is never a fault. So 13.4.4 says nothing on 4a and 4c. Control 4b shows 13.5.0 says nothing either when the file is absent.

**When a Prior run meets it.** Both conditions of step 1 item (e) 1 hold: the workspace holds such a file, and a commit runs during the run. No Prior-supported entry writes `campaign.json` (step 1 item (b)), so the file can come only from a workbench prepared under Claude Code. Prior's cases on 13.4.4 committed in `contained-delivery-i-two-commits` and `contained-last-status-control-records` (Prior's response, quoted above). *Inference:* a case of that shape on a workspace with an uncommitted campaign file would get row 4's sentence on 13.5.0 and `{}` on 13.4.4. Not run on Prior.

**Hook-written files.** After rows 3 and 4 the scratch status shows `fusion-workbench/.guard-state/staging-drift.json` and `.guard-state/events.jsonl` untracked (measured). They are in-flight state (`LIVE_PREFIXES` `.guard-state/`, read) and not reported. Prior's 13.4.4 run saw the same two in `delta`. This step does not measure `orchestrator-events.jsonl`, which needs a dispatch payload.

### The rest of step 1 item (e)

| Item (e) entry | Result |
|---|---|
| 1, staging drift on a campaign file | measured, row 4 |
| 2, no new `runsOnPrior` branch, `systemMessage` or `additionalContext` path | measured through rows 1 to 3 in three settings, and by the `cmp` of the entry `dist` files above |
| 3, `bin/fusion-paths` | not measured here: a helper, not a hook. Step 1 measured it |
| `guard.js`, `session-id.js`, `subagent-stop.js` | not run. Byte-equal to 13.4.4's (measured, `cmp`), and they reach `orchestrator-events.js` only, changed in comments (step 1, read) |

### `profiles/skill-help.md` in the tarball

`tar -xOf out-a/fusion-13.5.0.tar profiles/skill-help.md | grep -n "asked and unanswered"` prints line **97** (measured). The extracted file gives the same line. The file's sha256 is `de86919ebf5adff678408c7ae367e9bf69c5168e6e1ecae2fd6de27dc9923f2c`. The line, in full:

> **Coming from 13.4.4:** 13.5.0 adds the campaign across checkouts, steered from a Claude Code session; the campaign entry is unsupported on this host. Its record sits in a store at the workbench root, the orchestrator's commit step runs `bin/fusion-campaign sync` under Claude Code, and `bin/fusion-write set-resources` declares a package's areas. A package carrying areas and a campaign record are each refused by an older codec, so every checkout runs `fusion --update` and restarts before either is written, and a workbench this host also reads takes either only after Prior has re-pinned the codec: that re-pin is request 81, asked and unanswered, and this text predicts nothing about it. Detail: `$FUSION_SRC/docs/campaign.md` and `$FUSION_SRC/docs/upgrading-to-v13.md`.

Step 1's finding 1 was an inference from the render rule. It is now measured: the bundle tells a Prior run that request 81 is "asked and unanswered".

## Implications

- **For request 82's `### What differs from 13.4.4 for a Prior run`:** the three rows of 79's table are unchanged on 13.5.0 in the settings 79 ran. One hook behaviour is new: an uncommitted `campaigns/<id>/campaign.json` is reported as a record after a commit, with the same text in all three settings. 13.4.4 stays silent on it (read).
- **For Prior's hook replay:** this step does not stand in for it. Nothing here ran on Prior's executor or against the 13.3.7 baselines. 82's request for the replay stands as the plan states it.
- **For `### Stated and not asked`:** the `skill-help.md` line is now measured at line 97 of the tarball's profile.

## Recommendations

1. **Step 4 (data-implementer):** carry the two tables under "The three rows of request 79, on 13.5.0" and row 4's table into `### What differs from 13.4.4 for a Prior run`, with the payload digest, the settings and the run date 2026-11-14. Name the S3 session-start caveat, and that no row ran on Prior's host. Quote `skill-help.md:97` under `### Stated and not asked`.
2. **Step 4, `### Questions for Prior`:** whether row 4's sentence on a Prior run is wanted, given that a Prior run makes no commit, is Prior's to judge. It can be asked or stated. This analysis does not decide which.

## Filed Issues

None. Row 4 is a designed behaviour of the tag (`4a81e482`), and the stale `skill-help` line is already recorded by step 1 as the user's choice.

## Sources

- Plan `261114-1656-plan-request-82-the-candidate-13-5-0-for-prior.md` step 3; analysis `261114-1704-request-82-delta-for-a-prior-run-and-campaign-material.md` items (b), (e), finding 1.
- `/Users/kai/.fusion-tmp/114caf11/request-82/build-report.md`; `out-a/fusion-13.5.0.tar` and its sidecar; `x135/`, `x1344/`.
- `codec/fixtures/prior/REQUESTS.md` at `HEAD`: `#### The hooks` (lines 7295-7309), the image digest (line 6900).
- Payload sources: `hooks/tracker.ts:438-477`, `:556-565`, `:567-684`; `hooks/session-start.ts:214-218`, `:327-333`, `:363-372`; `hooks/lib/staging-drift.ts:500-580`, `:609-675`, `:765-769`, `:798-829`; `hooks/lib/temp-paths.ts:73-75`, `:281-292`; `hooks/lib/checks-due.ts:18-71`.
- `git show v13.4.4:hooks/lib/staging-drift.ts` (lines 261-264, 321, 339, 565), `git show v13.4.4:hooks/lib/stores.ts` (lines 29-42).
- Prior at `10e07d2`: `docs/design/fusion-entry-v2-request79-prior-response.md`, `## The bundle's hook changes on Prior's executor` (lines 297-330).
- Scratch: `hooks/scripts/rows.sh`, `hooks/s1-image-both-opt.txt`, `hooks/s2-macos-both-payload.txt`, `hooks/s3-macos-fusion-root-alone.txt` under `/Users/kai/.fusion-tmp/114caf11/request-82/`.

## Open Questions

- [ ] Whether request 82 asks Prior about row 4's sentence on a run that makes no commit, or only states it (Recommendation 2). For step 4 and the orchestrator.
