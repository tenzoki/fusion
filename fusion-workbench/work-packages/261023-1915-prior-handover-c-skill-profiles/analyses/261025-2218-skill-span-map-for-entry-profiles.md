# Analysis: span map of the sixteen skills, and the entry services of their profiles

**Date:** 2026-10-25 22:18
**Type:** Impact (span map) and Gap (entry services against `catalog/catalog.json`)
**Status:** Complete
**Requested by:** orchestrator, step 11 of `261023-1854-plan-prior-full-surface-handover-h1-to-h9.md`, for work package `261023-1915-prior-handover-c-skill-profiles`

## Question

Where can each `skills/<name>/SKILL.md` be cut, frontmatter included, so that every `neutral` part carries no `HOST_TOKENS` hit and the Claude render stays byte-equal? For each `claude` span, what must the `prior` replacement say in terms of `host.exec.v1`, `host.question.v1` and `host.dispatch.v1`? What `requires` set does each skill entry have, and where does it differ from `catalog/catalog.json`? Where does a skill body presume interactivity, a session or commits that an entry run on Prior cannot provide, and what should request 76 ask Prior about it?

## Scope

- **fusion.** The sixteen bodies were read with `git show HEAD:skills/<name>/SKILL.md`. HEAD is `eab95b30b7604084d1f4a7fff9e91d4a987ea2f2` ("feat(catalog): the renderer writes skills", step 12), committed 2026-10-25 22:11:48 +0100, branch `main`, `## main...origin/main [voraus 11]`. HEAD moved from `79c0c41e` to `eab95b30` while this ran; `git diff --stat 79c0c41e eab95b30 -- skills/ bin/` is empty, and `git diff --quiet HEAD -- skills/` exits 0, so tree and HEAD agree on every body. Also read: `catalog/src/render.ts` (`ENTRY_SERVICES`, `servicesNamed`, `checkEntries`), `catalog/src/__tests__/render.test.ts` (`HOST_TOKENS`, `CLAUDE_ONLY_TOKENS`), `catalog/README.md`, `catalog/catalog.json` (the sixteen skill entries), `catalog/profiles/analyst/parts/{01,03}-prior.md` and `consultant`/`requirements-designer` prior parts (binding wording), `rules/workbench-tracking.md` `## The four classes`, `rules/fusion-workbench-conventions.md` `## Record filing`, `bin/fusion-write` (header).
- **Method and shape.** As `261024-2111-agent-span-map-for-entry-profiles.md` (Findings 1 to 5 and `### Acceptance, as run`), with its addendum's lesson applied from the start. The departures are in Finding 1.
- **Prior (read only).** Read only through `git -C /Users/kai/Projects/productive/F09-Prior show 08c57fb:<path>` (`08c57fb4…`, 2026-10-23 10:03:24 +0200): `docs/design/fusion-full-surface-handover-to-fusion.md` (H4, H5, H8), `docs/qualification/fusion-surface/inventory.json` (entries 1 to 16, fusion 13.3.0), `moduleapi/v1/entry_wire.go` (calls, results, bounds), `internal/supervisor/exec.go` (the contained executor).
- **Prior facts after the pin** are cited only through fusion's own records: `261025-1117-every-fusion-write-in-a-prior-exec-container-stops-because-git-config-names-no-user.md` (the `.checkout-id` carry at Prior HEAD).
- **Rulings in force.** D3 (`261023-1854-how-does-a-skill-become-a-profile-when-its-body-carries-claude-mechanics.md`, option 1); D-B1 (`261024-2111-may-an-entry-profiles-prior-part-spell-the-helper-calls-its-host-exec-runs.md`: the lint is split by host, so a `prior` part may spell `$FUSION_PLUGIN_ROOT`, `bin/fusion-*` and the store keys, and refuses only `Agent(`, `AskUserQuestion` and slash commands); D-B2 (`261024-2111-does-an-entry-run-of-a-repair-role-write-the-workbench-on-prior.md`: the entry workflow grants the workbench write). requirements-designer and implementation-planner ask through `host.question.v1`.

## Findings

### 1. Tagging rule, and where it departs from 261024-2111

A line is `claude` when it meets either condition:

- **(a)** It carries a `HOST_TOKENS` hit. The regexes are those in `render.test.ts`, with the helper list read off the live `bin/`.
- **(b)** It states a Claude Code mechanic, or presumes something an entry run on Prior does not have. For skills that is:
  - the **frontmatter** (`description`, `argument-hint`, `allowed-tools`, `disable-model-invocation`);
  - a **dispatch instruction** ("Use the `Agent` tool with target `fusion:<id>`") and the namespaced agent name `fusion:<id>` where it names a dispatch target;
  - a **Claude tool surface** named as the run's mechanism (`Read` tool, `Write` tool, "each Bash call is a fresh shell");
  - a **Claude Code session mechanic**: the SessionStart line, the session id, "restart the session", `fusion --update`, `.claude/settings.local.json`;
  - a **persisting working directory** (`cd "$ROOT"` and the sentences that rely on it): a `host.exec.v1` `directory` is `.` or workspace-relative, given on every call, never absolute (Prior `entry_wire.go`, `DecodeExecCall`);
  - an **absolute scratch path** (`/tmp`, `${TMPDIR:-/tmp}`);
  - **the addendum's lesson:** a line that makes or presumes a commit, a push or a pull by the role. One entry run integrates once, at its end. "Commits nothing" stays `neutral`, because it is true on both hosts. "The record is uncommitted" or "carry it in your next commit" is `claude`, because on Prior the host's integration commits it;
  - a **conversation or session presumption**: a reference "from the chat" or "the preceding exchange", or state held "per session". An entry request carries `arguments` and `project_context` and no conversation.

Every other line is `neutral`.

Three departures from 261024-2111, all deliberate:

- **No Setup span.** A skill has no Setup section. The frontmatter span's `prior` part carries the **service binding** that the agent profiles put in their Setup part (Finding 3, `FM`).
- **Filler runs join the span before them.** A neutral run of blank lines and code-fence lines only (` ``` `, ` ```bash `) joins the `claude` span before it, so no part is a bare fence.
- **Cuts fall on whole lines, inside fences too.** A shell block that carries one `claude` line is cut around that line, as orchestrator span 9 was. The `prior` part replaces only that line, and the block's other lines stay neutral. The binding says how a block runs (Finding 3, `FM`).

### 2. Span counts

| Skill | Bytes | Spans | claude | neutral | Neutral bytes |
|---|---|---|---|---|---|
| setup | 16017 | 39 | 20 | 19 | 7661 (48 %) |
| check | 32828 | 44 | 22 | 22 | 20748 (63 %) |
| wp | 6337 | 15 | 8 | 7 | 2025 (32 %) |
| wp-order | 5591 | 12 | 6 | 6 | 3297 (59 %) |
| reconcile | 6792 | 22 | 11 | 11 | 4331 (64 %) |
| curate | 12587 | 28 | 14 | 14 | 8559 (68 %) |
| discuss | 15700 | 30 | 15 | 15 | 10023 (64 %) |
| commit | 6119 | 9 | 5 | 4 | 831 (14 %) |
| cleanup | 6911 | 17 | 9 | 8 | 1918 (28 %) |
| archive | 26184 | 52 | 26 | 26 | 18194 (69 %) |
| memo | 6824 | 22 | 11 | 11 | 3962 (58 %) |
| post | 6694 | 24 | 12 | 12 | 3517 (53 %) |
| news | 8223 | 26 | 13 | 13 | 4702 (57 %) |
| cadence | 23482 | 16 | 8 | 8 | 19512 (83 %) |
| migrate | 29643 | 33 | 17 | 16 | 18303 (62 %) |
| help | 17841 | 26 | 13 | 13 | 7930 (44 %) |
| **total** | 227773 | 415 | 210 | 205 | 135513 (59 %) |

Two skills are low for one reason. `commit` (14 %) and `cleanup` (28 %) exist to stage, commit and push, and an entry run on Prior does none of that (Finding 6, P1). What stays neutral is the message form (Conventional Commits, subject and body rules) and cleanup's split-by-concern paragraph. `wp` (32 %) is low because nearly every line names a helper, a store key or a slash command. `help` (44 %) is low because its topics cite `/fusion:*` commands on most lines. Mid-line cuts would raise these shares. They are optional and change nothing else.

### 3. Replacement classes: what each `prior` part must say

The tables in Finding 4 name one or more of these codes per `claude` span, plus a span-specific note where the class alone does not say it. The classes from 261024-2111 Finding 3 keep their meaning. Under D-B1 a `prior` part may spell the helper call itself, so `REC` usually means "this line again, run through `host.exec.v1`".

| Code | Claude text | The `prior` replacement says |
|---|---|---|
| `FM` | frontmatter | **A profile header plus the service binding, the skill's counterpart of the agents' Setup part.** The header: "Skill profile `skill-<name>`, rendered by fusion for the Prior host from the same source as the Claude Code skill", run as an entry of `workflows/entry.v1.json` against the two entry schemas. The binding: (1) every shell block and helper call is one `host.exec.v1` call, `["bash", "-c", "<block>"]`, with the project root (workspace-relative, `.` when the project is the workspace) as `directory` on every call, and the `environment` names it needs. `FUSION_PLUGIN_ROOT` is set by the host. (2) A path under `$FUSION_PLUGIN_ROOT` or `$FUSION_SRC` is read through `host.exec.v1` in pieces under the 64 KiB output bound, and a project path through the host's file tools. (3) The entry's `arguments` (`{name, value}`) are what the body calls "the user's arguments". (4) Only where the entry requires it: "where this text puts an `AskUserQuestion`, call `host.question.v1` with the question, its options and `multi_select`; a typed answer comes back as `text`", and "where it dispatches an agent, call `host.dispatch.v1` with that agent's entry id and the dispatch text as its input". (5) A chat-text question ends the turn, and the host resumes the run with the reply (package B's binding, Prior step 14). The binding names exactly the services in the entry's `requires` (Finding 5) and no other. |
| `REC` | a `$FUSION_PLUGIN_ROOT`/`bin/fusion-*` call | The same call through `host.exec.v1`, exit code and stdout read as the text reads them. |
| `GUARD` | `[ -x ]` guard, `fusion --update` | The guarded form runs unchanged. An absent helper means a broken bundle and is reported. There is no `fusion --update` and no session restart on Prior. |
| `PLUGIN` | reads a file of the install tree (`rules/`, `templates/`, `stilwerk/`, `.claude-plugin/plugin.json`, `bin/monitor`, another skill's body) | Read it through `host.exec.v1` from the mounted tree, in chunks under 64 KiB. Setup reads the check entry's **Prior render**, not `skills/check/SKILL.md`. |
| `STORE` | a `$OUT_*`/`$SCAN_*` key | The same store, as the resolver's output named it, every directory of a `SCAN` value searched. |
| `SLASH` | `/fusion:<name>` | "the `<name>` entry". `/fusion:setup` is "the setup entry". |
| `QASK` | `AskUserQuestion` as an ask | `host.question.v1`: question (8 KiB at most), options (16 at most, 512 bytes each), `multi_select` where the text says `multiSelect`. A reply typed instead of an option comes back as `text`, which is what curate's id-list reply needs. |
| `QSTYLE` | `AskUserQuestion` text as a style surface | `host.question.v1` question text. |
| `QNEG` | "You have no `AskUserQuestion`" inside a dispatch to a child | "You hold no question service." Only discuss carries one, and discuss requires `host.question.v1`, so naming it there is allowed. |
| `QCHAT` | "plain chat text, never `AskUserQuestion`" | Every question is chat text and ends the turn. **Name no question service.** |
| `DISP` | "Use the `Agent` tool with target `fusion:<id>`" | `host.dispatch.v1` with `entry` the bare id (`state-auditor`, `policy-curator`, `consultant`) and the parameter lines plus the task as input. The call returns when the child run ends: no background dispatch. |
| `NS` | `fusion:<id>` as a dispatch target, the active-agent rule | The bare entry id. There is no plugin namespace and no active agent. |
| `TOOLS` | the `Read` or `Write` tool | The host's file tools within `tools_ceiling`. |
| `SHELL` | persisting `cd`, "each Bash call is a fresh shell", "the working directory persists" | No working directory and no shell variable persists between calls. Every `host.exec.v1` call gives the project root, workspace-relative, as `directory`, never an absolute path. |
| `TMP` | `/tmp/…`, `${TMPDIR:-/tmp}/…` | A scratch path the run's container provides, which request 76 must name (question 5), or none: commit and cleanup need none on Prior, because they write no message file. |
| `SESS` | SessionStart line, session id, "restart the session", "this session", the orchestrator session after setup | The entry run is the unit. A session id comes from the environment the host passes (Prior exports SessionStart's `CLAUDE_ENV_FILE` values to every command: `exec.go`, `Exports`). No restart. Nothing carries over between runs except what the workspace holds. |
| `CONV` | a reference "from the chat", "the preceding exchange", "conversational reference" | There is no conversation. The content is the entry's argument value. A reference that names content the arguments do not carry falls to the body's own "Empty" mode. |
| `CC` | the `permissions` selector (`.claude/settings.local.json`, `bypassPermissions`) | Not applicable on Prior: the host enforces `tools_ceiling`. Report "not applicable on this host", ask nothing, write nothing, stamp nothing. |
| `COMMIT` | stage, commit, lock, push, pull, "uncommitted", "your next commit" | The role stages, commits, pushes and pulls nothing. The host captures the workspace and integrates it as the run's commit, and pushes only when the entry declares a remote. "Commits nothing" is restated where the text says it. |
| `ARGS` | "the words the user gave after the command" | The entry's `arguments`, each `{name, value}`, rendered into the helper's argv as its declaration names them. |
| `ACTOR` | `--actor <your agent name, or claude>` | The actor of this run's role, never `claude` (request 76, question 9). |
| `ATTR` | `Co-Authored-By: Claude <…>` | The host's model, or no attribution line (question 9). |

### 4. Span maps

Offsets are bytes into `git show eab95b30:skills/<name>/SKILL.md`, half-open. Lines are 1-based. "Reason" names the tokens a span carries; "rule (b)" means it carries none. A blank "Replacement" cell means a neutral span. A replacement code with no note means the class definition in Finding 3 is the whole instruction.

#### setup (16017 bytes, 39 spans)

| # | Bytes [start, end) | Len | Lines | Tag | Reason | Replacement |
|---|---|---|---|---|---|---|
| 1 | [0, 240) | 240 | 1-5 | claude | frontmatter | FM — profile header and the binding: host.question.v1, host.exec.v1 |
| 2 | [240, 263) | 23 | 6-8 | neutral |  |  |
| 3 | [263, 377) | 114 | 9-9 | claude | rule (b) | NS — the active agent MUST be fusion:orchestrator: the setup entry runs as its own entry run, under no active agent |
| 4 | [377, 596) | 219 | 10-12 | neutral |  |  |
| 5 | [596, 807) | 211 | 13-13 | claude | /fusion:* | SLASH |
| 6 | [807, 2045) | 1238 | 14-32 | neutral |  |  |
| 7 | [2045, 2171) | 126 | 33-33 | claude | /fusion:* | SLASH |
| 8 | [2171, 2700) | 529 | 34-36 | neutral |  |  |
| 9 | [2700, 3242) | 542 | 37-39 | claude | /fusion:* | SLASH |
| 10 | [3242, 3375) | 133 | 40-42 | neutral |  |  |
| 11 | [3375, 3491) | 116 | 43-43 | claude | /fusion:* | SLASH |
| 12 | [3491, 3913) | 422 | 44-51 | neutral |  |  |
| 13 | [3913, 4041) | 128 | 52-52 | claude | $FUSION_PLUGIN_ROOT, bin/fusion-*, helper name | REC |
| 14 | [4041, 4211) | 170 | 53-55 | neutral |  |  |
| 15 | [4211, 5216) | 1005 | 56-57 | claude | /fusion:*, helper name | SLASH+REC |
| 16 | [5216, 6767) | 1551 | 58-73 | neutral |  |  |
| 17 | [6767, 6893) | 126 | 74-74 | claude | $FUSION_PLUGIN_ROOT | REC+PLUGIN |
| 18 | [6893, 7908) | 1015 | 75-87 | neutral |  |  |
| 19 | [7908, 8999) | 1091 | 88-93 | claude | $FUSION_PLUGIN_ROOT, bin/fusion-*, helper name | REC+SESS — 'until the session is restarted and Setup run again' becomes 'until Setup runs again in a later entry run' |
| 20 | [8999, 9889) | 890 | 94-101 | neutral |  |  |
| 21 | [9889, 10094) | 205 | 102-102 | claude | AskUserQuestion | QASK+QSTYLE — the chat profile governs question text: host.question.v1 question text |
| 22 | [10094, 10393) | 299 | 103-108 | neutral |  |  |
| 23 | [10393, 10463) | 70 | 109-109 | claude | $FUSION_PLUGIN_ROOT | REC |
| 24 | [10463, 10811) | 348 | 110-117 | neutral |  |  |
| 25 | [10811, 11374) | 563 | 118-120 | claude | /fusion:*, $FUSION_PLUGIN_ROOT | SLASH+REC |
| 26 | [11374, 11427) | 53 | 121-123 | neutral |  |  |
| 27 | [11427, 12033) | 606 | 124-126 | claude | /fusion:* | SLASH+PLUGIN — a skill body cannot invoke a slash command: on Prior read the Prior render of the check entry (bundle profiles/skill-check.md) through host.exec.v1, not skills/check/SKILL.md, and run the due selectors' sections from it |
| 28 | [12033, 12139) | 106 | 127-130 | neutral |  |  |
| 29 | [12139, 12366) | 227 | 131-132 | claude | $FUSION_PLUGIN_ROOT, bin/fusion-*, helper name | REC+GUARD |
| 30 | [12366, 12447) | 81 | 133-135 | neutral |  |  |
| 31 | [12447, 12829) | 382 | 136-136 | claude | bin/fusion-*, helper name | REC+SESS — the host sets FUSION_PLUGIN_ROOT on every host.exec.v1 call, so UNRESOLVED is a broken bundle: report it, no session restart |
| 32 | [12829, 12865) | 36 | 137-140 | neutral |  |  |
| 33 | [12865, 13921) | 1056 | 141-151 | claude | $FUSION_PLUGIN_ROOT, bin/fusion-*, helper name, store key | REC+STORE |
| 34 | [13921, 14080) | 159 | 152-154 | neutral |  |  |
| 35 | [14080, 14983) | 903 | 155-158 | claude | $FUSION_PLUGIN_ROOT, bin/fusion-*, helper name | REC+GUARD |
| 36 | [14983, 15362) | 379 | 159-170 | neutral |  |  |
| 37 | [15362, 15606) | 244 | 171-171 | claude | rule (b) | SESS — the session_start row is the host lifecycle runtime's (H9, D1); no row here, and no 'your Setup step 6' (no orchestrator session follows) |
| 38 | [15606, 15616) | 10 | 172-174 | neutral |  |  |
| 39 | [15616, 16017) | 401 | 175-175 | claude | rule (b) | SESS — the run ends with the Done report; no task begins inside this run, so drop 'only after ... may you begin the user's task'; the two next moves are named as entries the user starts next |

#### check (32828 bytes, 44 spans)

| # | Bytes [start, end) | Len | Lines | Tag | Reason | Replacement |
|---|---|---|---|---|---|---|
| 1 | [0, 286) | 286 | 1-4 | claude | frontmatter | FM — profile header and the binding: host.question.v1, host.exec.v1 |
| 2 | [286, 306) | 20 | 5-7 | neutral |  |  |
| 3 | [306, 1018) | 712 | 8-10 | claude | /fusion:* | SLASH |
| 4 | [1018, 2674) | 1656 | 11-34 | neutral |  |  |
| 5 | [2674, 3492) | 818 | 35-40 | claude | $FUSION_PLUGIN_ROOT, /fusion:* | REC+PLUGIN+SLASH |
| 6 | [3492, 3574) | 82 | 41-43 | neutral |  |  |
| 7 | [3574, 3988) | 414 | 44-44 | claude | /fusion:* | SLASH |
| 8 | [3988, 4064) | 76 | 45-48 | neutral |  |  |
| 9 | [4064, 4116) | 52 | 49-49 | claude | $FUSION_PLUGIN_ROOT, bin/fusion-*, helper name | REC |
| 10 | [4116, 4237) | 121 | 50-53 | neutral |  |  |
| 11 | [4237, 4964) | 727 | 54-62 | claude | $FUSION_PLUGIN_ROOT, bin/fusion-*, helper name | SESS+REC — an entry run is no orchestrator session: write no session marker for it; no marker write for an entry run (see span note on line 54); on running: report the marker contents as a warning and continue; no proceed/abort offer, because the run starts no orchestrator session |
| 12 | [4964, 5004) | 40 | 63-66 | neutral |  |  |
| 13 | [5004, 5046) | 42 | 67-67 | claude | $FUSION_PLUGIN_ROOT, bin/fusion-*, helper name | REC |
| 14 | [5046, 5874) | 828 | 68-75 | neutral |  |  |
| 15 | [5874, 6642) | 768 | 76-79 | claude | $FUSION_PLUGIN_ROOT, bin/fusion-*, helper name | REC |
| 16 | [6642, 6714) | 72 | 80-82 | neutral |  |  |
| 17 | [6714, 7111) | 397 | 83-83 | claude | /fusion:* | SLASH+SHELL — 'each Bash call is a fresh shell' becomes 'each host.exec.v1 call is a fresh process'; the prelude is still pasted into every block |
| 18 | [7111, 7162) | 51 | 84-86 | neutral |  |  |
| 19 | [7162, 7302) | 140 | 87-87 | claude | $FUSION_PLUGIN_ROOT, bin/fusion-*, helper name | REC+GUARD |
| 20 | [7302, 9277) | 1975 | 88-114 | neutral |  |  |
| 21 | [9277, 9528) | 251 | 115-115 | claude | bin/fusion-*, helper name, /fusion:* | REC+SLASH |
| 22 | [9528, 9722) | 194 | 116-117 | neutral |  |  |
| 23 | [9722, 10129) | 407 | 118-118 | claude | AskUserQuestion | QASK |
| 24 | [10129, 12817) | 2688 | 119-157 | neutral |  |  |
| 25 | [12817, 13021) | 204 | 158-158 | claude | $FUSION_PLUGIN_ROOT | REC+PLUGIN |
| 26 | [13021, 13344) | 323 | 159-162 | neutral |  |  |
| 27 | [13344, 17783) | 4439 | 163-209 | claude | $FUSION_PLUGIN_ROOT, AskUserQuestion | REC+CC+QASK — permissions selector: a Claude Code permission file has no Prior counterpart (the host enforces tools_ceiling); report 'permissions: not applicable on this host', ask nothing, write nothing, and do not stamp it |
| 28 | [17783, 20528) | 2745 | 210-240 | neutral |  |  |
| 29 | [20528, 21210) | 682 | 241-244 | claude | bin/fusion-*, helper name, $FUSION_PLUGIN_ROOT | REC+SESS+GUARD — the identity fragment's session_id comes from the environment the host passes (request 76, question 7), not from a SessionStart line |
| 30 | [21210, 21286) | 76 | 245-249 | neutral |  |  |
| 31 | [21286, 21335) | 49 | 250-250 | claude | $FUSION_PLUGIN_ROOT, bin/fusion-*, helper name | REC |
| 32 | [21335, 21723) | 388 | 251-256 | neutral |  |  |
| 33 | [21723, 21899) | 176 | 257-257 | claude | bin/fusion-*, helper name | REC |
| 34 | [21899, 24597) | 2698 | 258-272 | neutral |  |  |
| 35 | [24597, 24803) | 206 | 273-273 | claude | rule (b) | COMMIT — git rm --cached changes only the index: on Prior report '.checkout-id is tracked' and leave it, unless request 76 says capture carries index-only changes |
| 36 | [24803, 28921) | 4118 | 274-327 | neutral |  |  |
| 37 | [28921, 29575) | 654 | 328-328 | claude | AskUserQuestion | QASK |
| 38 | [29575, 30645) | 1070 | 329-344 | neutral |  |  |
| 39 | [30645, 30697) | 52 | 345-345 | claude | $FUSION_PLUGIN_ROOT, bin/fusion-*, helper name | REC |
| 40 | [30697, 30762) | 65 | 346-348 | neutral |  |  |
| 41 | [30762, 31240) | 478 | 349-349 | claude | /fusion:* | SLASH |
| 42 | [31240, 31634) | 394 | 350-356 | neutral |  |  |
| 43 | [31634, 31760) | 126 | 357-357 | claude | $FUSION_PLUGIN_ROOT | REC+PLUGIN |
| 44 | [31760, 32828) | 1068 | 358-375 | neutral |  |  |

#### wp (6337 bytes, 15 spans)

| # | Bytes [start, end) | Len | Lines | Tag | Reason | Replacement |
|---|---|---|---|---|---|---|
| 1 | [0, 285) | 285 | 1-6 | claude | frontmatter | FM — profile header and the binding: host.question.v1, host.exec.v1 |
| 2 | [285, 302) | 17 | 7-9 | neutral |  |  |
| 3 | [302, 626) | 324 | 10-10 | claude | /fusion:* | SLASH |
| 4 | [626, 668) | 42 | 11-14 | neutral |  |  |
| 5 | [668, 1415) | 747 | 15-19 | claude | $FUSION_PLUGIN_ROOT, bin/fusion-*, helper name, store key, /fusion:* | REC+STORE+SLASH |
| 6 | [1415, 1763) | 348 | 20-24 | neutral |  |  |
| 7 | [1763, 2262) | 499 | 25-27 | claude | /fusion:*, AskUserQuestion | SLASH+CONV+QASK — an entry run has no conversation: a reference names no content the arguments carry, so it is treated as mode 3 (Empty) |
| 8 | [2262, 2555) | 293 | 28-32 | neutral |  |  |
| 9 | [2555, 3225) | 670 | 33-33 | claude | store key | STORE |
| 10 | [3225, 4297) | 1072 | 34-60 | neutral |  |  |
| 11 | [4297, 4982) | 685 | 61-65 | claude | store key, $FUSION_PLUGIN_ROOT, bin/fusion-*, helper name | STORE+REC |
| 12 | [4982, 5219) | 237 | 66-70 | neutral |  |  |
| 13 | [5219, 5554) | 335 | 71-74 | claude | $FUSION_PLUGIN_ROOT, bin/fusion-*, helper name | REC |
| 14 | [5554, 5570) | 16 | 75-77 | neutral |  |  |
| 15 | [5570, 6337) | 767 | 78-79 | claude | bin/fusion-*, helper name, /fusion:* | REC+SLASH |

#### wp-order (5591 bytes, 12 spans)

| # | Bytes [start, end) | Len | Lines | Tag | Reason | Replacement |
|---|---|---|---|---|---|---|
| 1 | [0, 403) | 403 | 1-5 | claude | frontmatter | FM — profile header and the binding: host.exec.v1 |
| 2 | [403, 451) | 48 | 6-8 | neutral |  |  |
| 3 | [451, 1047) | 596 | 9-11 | claude | bin/fusion-*, helper name, /fusion:* | REC+SLASH |
| 4 | [1047, 1437) | 390 | 12-19 | neutral |  |  |
| 5 | [1437, 1647) | 210 | 20-23 | claude | $FUSION_PLUGIN_ROOT, bin/fusion-*, helper name, /fusion:* | REC+SLASH |
| 6 | [1647, 1695) | 48 | 24-27 | neutral |  |  |
| 7 | [1695, 1778) | 83 | 28-28 | claude | $FUSION_PLUGIN_ROOT, bin/fusion-*, helper name | REC+GUARD |
| 8 | [1778, 1817) | 39 | 29-32 | neutral |  |  |
| 9 | [1817, 1976) | 159 | 33-33 | claude | bin/fusion-*, helper name, /fusion:* | REC+SLASH+GUARD |
| 10 | [1976, 2125) | 149 | 34-39 | neutral |  |  |
| 11 | [2125, 2968) | 843 | 40-47 | claude | $FUSION_PLUGIN_ROOT, bin/fusion-*, helper name, /fusion:* | REC+ARGS+SLASH+GUARD — the entry's arguments, each {name, value}, become argv: --format <value> when given, else nothing; the helper stays the only validator; exit 3: the bundle's runtime tree is broken; report it as a defect of the installed bundle, never 'fusion --update' or a session restart |
| 12 | [2968, 5591) | 2623 | 48-76 | neutral |  |  |

#### reconcile (6792 bytes, 22 spans)

| # | Bytes [start, end) | Len | Lines | Tag | Reason | Replacement |
|---|---|---|---|---|---|---|
| 1 | [0, 420) | 420 | 1-5 | claude | frontmatter | FM — profile header and the binding: host.exec.v1, host.dispatch.v1 |
| 2 | [420, 483) | 63 | 6-8 | neutral |  |  |
| 3 | [483, 1089) | 606 | 9-11 | claude | /fusion:* | SLASH+COMMIT — every change is integrated with this run by the host; the cleanup entry commits nothing on Prior |
| 4 | [1089, 1424) | 335 | 12-16 | neutral |  |  |
| 5 | [1424, 1506) | 82 | 17-17 | claude | /fusion:* | SLASH |
| 6 | [1506, 2066) | 560 | 18-26 | neutral |  |  |
| 7 | [2066, 2337) | 271 | 27-31 | claude | $FUSION_PLUGIN_ROOT, bin/fusion-*, helper name, /fusion:* | REC+SLASH+SHELL — no cd persists: every host.exec.v1 call gives the project root, workspace-relative, as its directory |
| 8 | [2337, 2708) | 371 | 32-39 | neutral |  |  |
| 9 | [2708, 2876) | 168 | 40-40 | claude | $FUSION_PLUGIN_ROOT, bin/fusion-*, helper name | REC+GUARD |
| 10 | [2876, 3540) | 664 | 41-49 | neutral |  |  |
| 11 | [3540, 3672) | 132 | 50-50 | claude | $FUSION_PLUGIN_ROOT, bin/fusion-*, helper name | REC+GUARD |
| 12 | [3672, 3901) | 229 | 51-57 | neutral |  |  |
| 13 | [3901, 4043) | 142 | 58-58 | claude | $FUSION_PLUGIN_ROOT, bin/fusion-*, helper name | REC+GUARD |
| 14 | [4043, 4462) | 419 | 59-64 | neutral |  |  |
| 15 | [4462, 4659) | 197 | 65-65 | claude | rule (b) | DISP — call host.dispatch.v1 with entry 'state-auditor' and the parameter lines plus the one-sentence task as input |
| 16 | [4659, 5140) | 481 | 66-77 | neutral |  |  |
| 17 | [5140, 5296) | 156 | 78-78 | claude | $FUSION_PLUGIN_ROOT, bin/fusion-*, helper name | REC+GUARD+SESS — the mark lives in .cadence-anchors, class L: request 76, question 3 |
| 18 | [5296, 6265) | 969 | 79-91 | neutral |  |  |
| 19 | [6265, 6369) | 104 | 92-92 | claude | /fusion:* | SLASH+COMMIT — close with: the edits are integrated as this run's commit |
| 20 | [6369, 6385) | 16 | 93-95 | neutral |  |  |
| 21 | [6385, 6568) | 183 | 96-96 | claude | rule (b) | NS — dispatches the state-auditor entry once, through host.dispatch.v1 |
| 22 | [6568, 6792) | 224 | 97-99 | neutral |  |  |

#### curate (12587 bytes, 28 spans)

| # | Bytes [start, end) | Len | Lines | Tag | Reason | Replacement |
|---|---|---|---|---|---|---|
| 1 | [0, 388) | 388 | 1-4 | claude | frontmatter | FM — profile header and the binding: host.question.v1, host.exec.v1, host.dispatch.v1 |
| 2 | [388, 445) | 57 | 5-7 | neutral |  |  |
| 3 | [445, 963) | 518 | 8-10 | claude | /fusion:* | SLASH+COMMIT — nothing here commits; the host integrates the apply pass's edits at the run's end |
| 4 | [963, 1545) | 582 | 11-15 | neutral |  |  |
| 5 | [1545, 1991) | 446 | 16-16 | claude | AskUserQuestion | QASK — the curate entry holds host.question.v1 and the dispatched child holds no question service, so the child returns the question and this run puts it |
| 6 | [1991, 2320) | 329 | 17-22 | neutral |  |  |
| 7 | [2320, 2872) | 552 | 23-28 | claude | $FUSION_PLUGIN_ROOT, bin/fusion-*, helper name, store key, /fusion:* | REC+STORE+SLASH |
| 8 | [2872, 3104) | 232 | 29-33 | neutral |  |  |
| 9 | [3104, 3241) | 137 | 34-34 | claude | rule (b) | DISP — call host.dispatch.v1 with entry 'policy-curator'; the first non-empty line of the input is the mode parameter |
| 10 | [3241, 4522) | 1281 | 35-51 | neutral |  |  |
| 11 | [4522, 4728) | 206 | 52-52 | claude | rule (b) | TOOLS — read the run file with the host's file tools |
| 12 | [4728, 4902) | 174 | 53-55 | neutral |  |  |
| 13 | [4902, 5262) | 360 | 56-56 | claude | store key | STORE |
| 14 | [5262, 5629) | 367 | 57-62 | neutral |  |  |
| 15 | [5629, 5935) | 306 | 63-63 | claude | AskUserQuestion | QASK |
| 16 | [5935, 6366) | 431 | 64-70 | neutral |  |  |
| 17 | [6366, 6484) | 118 | 71-71 | claude | AskUserQuestion | QASK |
| 18 | [6484, 6958) | 474 | 72-77 | neutral |  |  |
| 19 | [6958, 7200) | 242 | 78-78 | claude | AskUserQuestion | QASK |
| 20 | [7200, 8134) | 934 | 79-88 | neutral |  |  |
| 21 | [8134, 8277) | 143 | 89-89 | claude | rule (b) | DISP — call host.dispatch.v1 with entry 'policy-curator'; the first three non-empty lines of the input are the three parameters |
| 22 | [8277, 9575) | 1298 | 90-104 | neutral |  |  |
| 23 | [9575, 9745) | 170 | 105-105 | claude | rule (b) | TOOLS — read the run file again with the host's file tools |
| 24 | [9745, 10175) | 430 | 106-110 | neutral |  |  |
| 25 | [10175, 10402) | 227 | 111-111 | claude | rule (b) | COMMIT — the apply pass's edits are integrated as this run's commit: the revert path is that commit's parent for the path (git checkout <integration>^ -- <path>), not a working-tree discard |
| 26 | [10402, 11060) | 658 | 112-119 | neutral |  |  |
| 27 | [11060, 11275) | 215 | 120-121 | claude | rule (b) | NS+COMMIT — dispatches only the policy-curator entry, twice at most; neither this run nor the child commits: the host integrates the run's edits once, at its end |
| 28 | [11275, 12587) | 1312 | 122-134 | neutral |  |  |

#### discuss (15700 bytes, 30 spans)

| # | Bytes [start, end) | Len | Lines | Tag | Reason | Replacement |
|---|---|---|---|---|---|---|
| 1 | [0, 441) | 441 | 1-5 | claude | frontmatter | FM — profile header and the binding: host.question.v1, host.exec.v1, host.dispatch.v1 |
| 2 | [441, 497) | 56 | 6-8 | neutral |  |  |
| 3 | [497, 881) | 384 | 9-9 | claude | /fusion:* | SLASH+NS — the second partner is the consultant entry, dispatched through host.dispatch.v1 once per round; 'whoever received it' is this entry run's role |
| 4 | [881, 1228) | 347 | 10-17 | neutral |  |  |
| 5 | [1228, 2663) | 1435 | 18-27 | claude | $FUSION_PLUGIN_ROOT, bin/fusion-*, helper name, /fusion:*, store key | REC+SLASH+STORE |
| 6 | [2663, 2718) | 55 | 28-30 | neutral |  |  |
| 7 | [2718, 2915) | 197 | 31-32 | claude | rule (b) | CONV — the reference is the --begin argument's value; there is no preceding exchange, so with no switch the topic and the reference both come from the argument text |
| 8 | [2915, 3110) | 195 | 33-35 | neutral |  |  |
| 9 | [3110, 3872) | 762 | 36-40 | claude | AskUserQuestion | SESS+QASK — no session spans entry runs: one run carries a discussion from --begin to its stop; resuming is not offered; the open discussion is the one this run began; --infer and --close in a later run find none (request 76, question 2) |
| 10 | [3872, 6530) | 2658 | 41-79 | neutral |  |  |
| 11 | [6530, 6726) | 196 | 80-80 | claude | bin/fusion-*, helper name | REC |
| 12 | [6726, 6764) | 38 | 81-83 | neutral |  |  |
| 13 | [6764, 7403) | 639 | 84-88 | claude | $FUSION_PLUGIN_ROOT, bin/fusion-*, helper name, store key | REC+GUARD+STORE |
| 14 | [7403, 8070) | 667 | 89-108 | neutral |  |  |
| 15 | [8070, 8152) | 82 | 109-109 | claude | rule (b) | CONV — template line: the entry argument it came from, not a point in the conversation |
| 16 | [8152, 8741) | 589 | 110-134 | neutral |  |  |
| 17 | [8741, 9249) | 508 | 135-139 | claude | store key, $FUSION_PLUGIN_ROOT, bin/fusion-*, helper name | STORE+REC+ACTOR — --actor names this run's role on Prior, never 'claude' (request 76, question 9) |
| 18 | [9249, 9509) | 260 | 140-144 | neutral |  |  |
| 19 | [9509, 9683) | 174 | 145-145 | claude | rule (b) | DISP — call host.dispatch.v1 with entry 'consultant'; the bare entry id, no namespace |
| 20 | [9683, 10037) | 354 | 146-153 | neutral |  |  |
| 21 | [10037, 10229) | 192 | 154-154 | claude | rule (b) | CONV — the material: paths, commit hashes and the entry argument the discussion came from |
| 22 | [10229, 10887) | 658 | 155-160 | neutral |  |  |
| 23 | [10887, 11097) | 210 | 161-161 | claude | AskUserQuestion | QASK+QNEG — 'You hold no question service': the consultant entry requires none |
| 24 | [11097, 13625) | 2528 | 162-190 | neutral |  |  |
| 25 | [13625, 13893) | 268 | 191-194 | claude | $FUSION_PLUGIN_ROOT, bin/fusion-*, helper name | REC |
| 26 | [13893, 14180) | 287 | 195-197 | neutral |  |  |
| 27 | [14180, 14254) | 74 | 198-198 | claude | rule (b) | COMMIT — the record is part of this run's integration, so tell the user it is committed with the run, not that it is uncommitted |
| 28 | [14254, 15019) | 765 | 199-208 | neutral |  |  |
| 29 | [15019, 15134) | 115 | 209-209 | claude | rule (b) | NS — dispatches the consultant entry and nothing else, once per round |
| 30 | [15134, 15700) | 566 | 210-213 | neutral |  |  |

#### commit (6119 bytes, 9 spans)

| # | Bytes [start, end) | Len | Lines | Tag | Reason | Replacement |
|---|---|---|---|---|---|---|
| 1 | [0, 148) | 148 | 1-5 | claude | frontmatter | FM — profile header and the binding: host.question.v1, host.exec.v1 |
| 2 | [148, 167) | 19 | 6-8 | neutral |  |  |
| 3 | [167, 1398) | 1231 | 9-36 | claude | /fusion:* | SLASH+COMMIT — steps 1-3 select and stage for a commit the role makes; on Prior the role makes none (request 76, question 1): read git status/diff through host.exec.v1 and put the selection question through host.question.v1, staging nothing |
| 4 | [1398, 1518) | 120 | 37-44 | neutral |  |  |
| 5 | [1518, 1568) | 50 | 45-45 | claude | rule (b) | ATTR — the Co-Authored-By line names Claude; on Prior it names the host's model or is left out (request 76, question 9) |
| 6 | [1568, 2197) | 629 | 46-69 | neutral |  |  |
| 7 | [2197, 6012) | 3815 | 70-148 | claude | $FUSION_PLUGIN_ROOT, bin/fusion-*, helper name | COMMIT+REC — steps 6-7 and the flags: no message file, no commit lock, no git add/commit, no hash; the confirmed message is the run's result for the host's integration; --amend is refused, because integration adds a commit |
| 8 | [6012, 6075) | 63 | 149-152 | neutral |  |  |
| 9 | [6075, 6119) | 44 | 153-153 | claude | rule (b) | COMMIT — --amend is refused on Prior, so there is nothing to warn about |

#### cleanup (6911 bytes, 17 spans)

| # | Bytes [start, end) | Len | Lines | Tag | Reason | Replacement |
|---|---|---|---|---|---|---|
| 1 | [0, 1237) | 1237 | 1-13 | claude | frontmatter; /fusion:* | FM — profile header and the binding: host.exec.v1; COMMIT+SLASH — title: on Prior the entry composes splits and messages; the host integrates; work left unfinished belongs in the run's result message |
| 2 | [1237, 1252) | 15 | 14-16 | neutral |  |  |
| 3 | [1252, 1457) | 205 | 17-19 | claude | rule (b) | COMMIT — argument meanings: commit and push are the host's (integrate, push when the entry declares a remote) |
| 4 | [1457, 1669) | 212 | 20-26 | neutral |  |  |
| 5 | [1669, 2320) | 651 | 27-31 | claude | rule (b) | COMMIT — guardrails about force-push, git add and amend: the role runs none of these on Prior; a merge or rebase in progress still stops the run |
| 6 | [2320, 2395) | 75 | 32-35 | neutral |  |  |
| 7 | [2395, 2546) | 151 | 36-37 | claude | $FUSION_PLUGIN_ROOT, bin/fusion-*, helper name, /fusion:* | REC+SLASH+SHELL — no cd persists: every host.exec.v1 call gives the project root, workspace-relative, as its directory |
| 8 | [2546, 3756) | 1210 | 38-56 | neutral |  |  |
| 9 | [3756, 4773) | 1017 | 57-59 | claude | $FUSION_PLUGIN_ROOT, bin/fusion-*, helper name | COMMIT+TMP+SESS+REC+TMP — no message file: no Write tool, no /tmp path, no Claude Code session id; each split's message is carried in the result |
| 10 | [4773, 4924) | 151 | 60-68 | neutral |  |  |
| 11 | [4924, 6053) | 1129 | 69-77 | claude | $FUSION_PLUGIN_ROOT, bin/fusion-*, helper name | COMMIT+REC — stage-and-commit under the lock and the event-log commit: the role stages and commits nothing; the host integrates once (request 76, question 1 on splits) |
| 12 | [6053, 6131) | 78 | 78-80 | neutral |  |  |
| 13 | [6131, 6474) | 343 | 81-83 | claude | rule (b) | COMMIT — push is the host's step, run only when the entry declares a remote |
| 14 | [6474, 6547) | 73 | 84-88 | neutral |  |  |
| 15 | [6547, 6688) | 141 | 89-90 | claude | rule (b) | COMMIT — report the splits and their messages, no hashes; push is reported by the host |
| 16 | [6688, 6792) | 104 | 91-92 | neutral |  |  |
| 17 | [6792, 6911) | 119 | 93-93 | claude | rule (b) | COMMIT — first line says the splits were handed to the host's integration |

#### archive (26184 bytes, 52 spans)

| # | Bytes [start, end) | Len | Lines | Tag | Reason | Replacement |
|---|---|---|---|---|---|---|
| 1 | [0, 346) | 346 | 1-5 | claude | frontmatter | FM — profile header and the binding: host.question.v1, host.exec.v1 |
| 2 | [346, 358) | 12 | 6-8 | neutral |  |  |
| 3 | [358, 682) | 324 | 9-9 | claude | /fusion:* | SLASH |
| 4 | [682, 1738) | 1056 | 10-26 | neutral |  |  |
| 5 | [1738, 1893) | 155 | 27-28 | claude | $FUSION_PLUGIN_ROOT, bin/fusion-*, helper name | REC |
| 6 | [1893, 1988) | 95 | 29-30 | neutral |  |  |
| 7 | [1988, 2116) | 128 | 31-32 | claude | bin/fusion-*, helper name, $FUSION_PLUGIN_ROOT | REC+GUARD |
| 8 | [2116, 2160) | 44 | 33-33 | neutral |  |  |
| 9 | [2160, 2341) | 181 | 34-35 | claude | $FUSION_PLUGIN_ROOT, bin/fusion-*, helper name | REC |
| 10 | [2341, 2627) | 286 | 36-45 | neutral |  |  |
| 11 | [2627, 4577) | 1950 | 46-55 | claude | /fusion:*, bin/fusion-*, helper name, store key | SLASH+REC+STORE |
| 12 | [4577, 5277) | 700 | 56-64 | neutral |  |  |
| 13 | [5277, 5386) | 109 | 65-65 | claude | AskUserQuestion | QASK |
| 14 | [5386, 6444) | 1058 | 66-76 | neutral |  |  |
| 15 | [6444, 6959) | 515 | 77-77 | claude | /fusion:* | SLASH |
| 16 | [6959, 8033) | 1074 | 78-85 | neutral |  |  |
| 17 | [8033, 8437) | 404 | 86-86 | claude | bin/fusion-*, helper name | REC |
| 18 | [8437, 11467) | 3030 | 87-105 | neutral |  |  |
| 19 | [11467, 11650) | 183 | 106-106 | claude | store key | STORE |
| 20 | [11650, 12858) | 1208 | 107-122 | neutral |  |  |
| 21 | [12858, 13168) | 310 | 123-123 | claude | store key | STORE |
| 22 | [13168, 13214) | 46 | 124-126 | neutral |  |  |
| 23 | [13214, 13332) | 118 | 127-127 | claude | store key | STORE |
| 24 | [13332, 13345) | 13 | 128-130 | neutral |  |  |
| 25 | [13345, 13491) | 146 | 131-131 | claude | rule (b) | SHELL — no cd persists: every host.exec.v1 call gives the project root, workspace-relative, as its directory |
| 26 | [13491, 13684) | 193 | 132-135 | neutral |  |  |
| 27 | [13684, 13786) | 102 | 136-136 | claude | AskUserQuestion | QASK |
| 28 | [13786, 14164) | 378 | 137-141 | neutral |  |  |
| 29 | [14164, 14385) | 221 | 142-142 | claude | store key | STORE |
| 30 | [14385, 14839) | 454 | 143-147 | neutral |  |  |
| 31 | [14839, 14980) | 141 | 148-148 | claude | bin/fusion-*, helper name | REC+GUARD |
| 32 | [14980, 16857) | 1877 | 149-164 | neutral |  |  |
| 33 | [16857, 17157) | 300 | 165-165 | claude | AskUserQuestion | QASK |
| 34 | [17157, 20538) | 3381 | 166-231 | neutral |  |  |
| 35 | [20538, 20850) | 312 | 232-232 | claude | rule (b) | COMMIT — the moves are integrated as this run's commit; do not tell the user to git add the archive |
| 36 | [20850, 20886) | 36 | 233-235 | neutral |  |  |
| 37 | [20886, 21451) | 565 | 236-236 | claude | bin/fusion-*, helper name | REC |
| 38 | [21451, 21731) | 280 | 237-240 | neutral |  |  |
| 39 | [21731, 22265) | 534 | 241-241 | claude | $FUSION_PLUGIN_ROOT, bin/fusion-*, helper name | REC |
| 40 | [22265, 22567) | 302 | 242-246 | neutral |  |  |
| 41 | [22567, 22655) | 88 | 247-247 | claude | helper name | REC+TMP |
| 42 | [22655, 23316) | 661 | 248-253 | neutral |  |  |
| 43 | [23316, 23516) | 200 | 254-254 | claude | $FUSION_PLUGIN_ROOT, bin/fusion-*, helper name | REC |
| 44 | [23516, 23931) | 415 | 255-261 | neutral |  |  |
| 45 | [23931, 24148) | 217 | 262-263 | claude | helper name, $FUSION_PLUGIN_ROOT, bin/fusion-* | REC+TMP |
| 46 | [24148, 24530) | 382 | 264-271 | neutral |  |  |
| 47 | [24530, 24716) | 186 | 272-272 | claude | bin/fusion-*, helper name | REC |
| 48 | [24716, 24777) | 61 | 273-276 | neutral |  |  |
| 49 | [24777, 24930) | 153 | 277-277 | claude | AskUserQuestion | QASK |
| 50 | [24930, 25212) | 282 | 278-279 | neutral |  |  |
| 51 | [25212, 25314) | 102 | 280-280 | claude | rule (b) | COMMIT — 'No git add, no git commit' stays; 'the user decides whether to commit the archive' becomes 'the host integrates it with the run' |
| 52 | [25314, 26184) | 870 | 281-284 | neutral |  |  |

#### memo (6824 bytes, 22 spans)

| # | Bytes [start, end) | Len | Lines | Tag | Reason | Replacement |
|---|---|---|---|---|---|---|
| 1 | [0, 363) | 363 | 1-5 | claude | frontmatter | FM — profile header and the binding: host.question.v1, host.exec.v1 |
| 2 | [363, 731) | 368 | 6-13 | neutral |  |  |
| 3 | [731, 1032) | 301 | 14-14 | claude | /fusion:* | SLASH |
| 4 | [1032, 1089) | 57 | 15-18 | neutral |  |  |
| 5 | [1089, 1510) | 421 | 19-22 | claude | $FUSION_PLUGIN_ROOT, bin/fusion-*, helper name, store key, /fusion:* | REC+STORE+SLASH |
| 6 | [1510, 1548) | 38 | 23-26 | neutral |  |  |
| 7 | [1548, 1627) | 79 | 27-27 | claude | $FUSION_PLUGIN_ROOT, bin/fusion-*, helper name | REC+GUARD |
| 8 | [1627, 2345) | 718 | 28-37 | neutral |  |  |
| 9 | [2345, 2563) | 218 | 38-39 | claude | store key | STORE |
| 10 | [2563, 3351) | 788 | 40-46 | neutral |  |  |
| 11 | [3351, 3474) | 123 | 47-47 | claude | rule (b) | CONV — no conversation: route to the task file by keyword or imperative content only |
| 12 | [3474, 3584) | 110 | 48-49 | neutral |  |  |
| 13 | [3584, 3720) | 136 | 50-50 | claude | AskUserQuestion | QASK |
| 14 | [3720, 3742) | 22 | 51-53 | neutral |  |  |
| 15 | [3742, 4296) | 554 | 54-56 | claude | /fusion:*, AskUserQuestion | SLASH+QASK |
| 16 | [4296, 4748) | 452 | 57-70 | neutral |  |  |
| 17 | [4748, 4823) | 75 | 71-71 | claude | rule (b) | CONV — template line: 'verbatim for captures'; there are no conversational references on Prior |
| 18 | [4823, 5394) | 571 | 72-89 | neutral |  |  |
| 19 | [5394, 5562) | 168 | 90-91 | claude | store key | STORE |
| 20 | [5562, 5713) | 151 | 92-93 | neutral |  |  |
| 21 | [5713, 6137) | 424 | 94-94 | claude | rule (b) | CONV — mode 2 does not exist on Prior (no conversation); modes 1 and 3 as written |
| 22 | [6137, 6824) | 687 | 95-104 | neutral |  |  |

#### post (6694 bytes, 24 spans)

| # | Bytes [start, end) | Len | Lines | Tag | Reason | Replacement |
|---|---|---|---|---|---|---|
| 1 | [0, 241) | 241 | 1-4 | claude | frontmatter | FM — profile header and the binding: host.question.v1, host.exec.v1 |
| 2 | [241, 298) | 57 | 5-7 | neutral |  |  |
| 3 | [298, 720) | 422 | 8-8 | claude | bin/fusion-*, helper name, /fusion:* | REC+SLASH |
| 4 | [720, 1009) | 289 | 9-16 | neutral |  |  |
| 5 | [1009, 1582) | 573 | 17-21 | claude | $FUSION_PLUGIN_ROOT, bin/fusion-*, helper name, store key | REC+STORE |
| 6 | [1582, 1788) | 206 | 22-29 | neutral |  |  |
| 7 | [1788, 1931) | 143 | 30-31 | claude | $FUSION_PLUGIN_ROOT, bin/fusion-*, helper name | REC+GUARD |
| 8 | [1931, 1992) | 61 | 32-35 | neutral |  |  |
| 9 | [1992, 2322) | 330 | 36-36 | claude | bin/fusion-*, helper name | REC |
| 10 | [2322, 2649) | 327 | 37-45 | neutral |  |  |
| 11 | [2649, 2937) | 288 | 46-46 | claude | rule (b) | SESS — no run remembers what earlier runs filed: the records are those that git log --name-status shows filed under the workbench in the --since range |
| 12 | [2937, 3772) | 835 | 47-51 | neutral |  |  |
| 13 | [3772, 3957) | 185 | 52-52 | claude | bin/fusion-*, helper name | REC |
| 14 | [3957, 4012) | 55 | 53-57 | neutral |  |  |
| 15 | [4012, 4235) | 223 | 58-58 | claude | /fusion:* | SLASH |
| 16 | [4235, 5059) | 824 | 59-71 | neutral |  |  |
| 17 | [5059, 5243) | 184 | 72-72 | claude | AskUserQuestion | QASK |
| 18 | [5243, 5384) | 141 | 73-78 | neutral |  |  |
| 19 | [5384, 5506) | 122 | 79-80 | claude | store key | STORE |
| 20 | [5506, 5949) | 443 | 81-88 | neutral |  |  |
| 21 | [5949, 6322) | 373 | 89-89 | claude | rule (b) | COMMIT — the entry is integrated with this run (pushed when the entry declares a remote): drop 'carry the file in your next commit' |
| 22 | [6322, 6478) | 156 | 90-94 | neutral |  |  |
| 23 | [6478, 6571) | 93 | 95-95 | claude | rule (b) | COMMIT — commits nothing itself; the host integrates the entry with the run |
| 24 | [6571, 6694) | 123 | 96-96 | neutral |  |  |

#### news (8223 bytes, 26 spans)

| # | Bytes [start, end) | Len | Lines | Tag | Reason | Replacement |
|---|---|---|---|---|---|---|
| 1 | [0, 242) | 242 | 1-4 | claude | frontmatter | FM — profile header and the binding: host.exec.v1 |
| 2 | [242, 292) | 50 | 5-7 | neutral |  |  |
| 3 | [292, 902) | 610 | 8-10 | claude | /fusion:*, bin/fusion-*, helper name | SLASH+REC |
| 4 | [902, 1046) | 144 | 11-13 | neutral |  |  |
| 5 | [1046, 1193) | 147 | 14-14 | claude | rule (b) | COMMIT — no pull inside an entry run: the workspace revision is the host's; the run says a pull is owed |
| 6 | [1193, 1364) | 171 | 15-19 | neutral |  |  |
| 7 | [1364, 2163) | 799 | 20-29 | claude | $FUSION_PLUGIN_ROOT, bin/fusion-*, helper name, /fusion:*, store key | REC+SLASH+STORE |
| 8 | [2163, 2211) | 48 | 30-33 | neutral |  |  |
| 9 | [2211, 2289) | 78 | 34-34 | claude | $FUSION_PLUGIN_ROOT, bin/fusion-*, helper name | REC+GUARD |
| 10 | [2289, 2328) | 39 | 35-38 | neutral |  |  |
| 11 | [2328, 2478) | 150 | 39-39 | claude | bin/fusion-*, helper name, /fusion:* | REC+SLASH+GUARD |
| 12 | [2478, 2799) | 321 | 40-45 | neutral |  |  |
| 13 | [2799, 2872) | 73 | 46-46 | claude | $FUSION_PLUGIN_ROOT, bin/fusion-*, helper name, store key | REC+STORE |
| 14 | [2872, 3176) | 304 | 47-50 | neutral |  |  |
| 15 | [3176, 3236) | 60 | 51-51 | claude | /fusion:* | SLASH |
| 16 | [3236, 5231) | 1995 | 52-69 | neutral |  |  |
| 17 | [5231, 5292) | 61 | 70-70 | claude | $FUSION_PLUGIN_ROOT, bin/fusion-*, helper name | REC |
| 18 | [5292, 5757) | 465 | 71-77 | neutral |  |  |
| 19 | [5757, 5925) | 168 | 78-79 | claude | $FUSION_PLUGIN_ROOT, bin/fusion-*, helper name | REC+GUARD |
| 20 | [5925, 5933) | 8 | 80-82 | neutral |  |  |
| 21 | [5933, 6189) | 256 | 83-83 | claude | bin/fusion-*, helper name | REC |
| 22 | [6189, 6338) | 149 | 84-89 | neutral |  |  |
| 23 | [6338, 6390) | 52 | 90-90 | claude | $FUSION_PLUGIN_ROOT, bin/fusion-*, helper name | REC+SESS — the seen mark lives in .cadence-anchors, class L: request 76, question 3 |
| 24 | [6390, 6848) | 458 | 91-94 | neutral |  |  |
| 25 | [6848, 7673) | 825 | 95-115 | claude | AskUserQuestion | COMMIT+QASK — Step 6: no pull offer and no git pull; when new entries were shown, say that a pull would bring them into the working tree and that it is the user's, outside this run |
| 26 | [7673, 8223) | 550 | 116-119 | neutral |  |  |

#### cadence (23482 bytes, 16 spans)

| # | Bytes [start, end) | Len | Lines | Tag | Reason | Replacement |
|---|---|---|---|---|---|---|
| 1 | [0, 432) | 432 | 1-7 | claude | frontmatter; /fusion:* | FM — profile header and the binding: host.exec.v1; SLASH — title: 'the cadence entry' |
| 2 | [432, 722) | 290 | 8-12 | neutral |  |  |
| 3 | [722, 1034) | 312 | 13-13 | claude | store key | STORE |
| 4 | [1034, 1825) | 791 | 14-22 | neutral |  |  |
| 5 | [1825, 2955) | 1130 | 23-31 | claude | $FUSION_PLUGIN_ROOT, bin/fusion-*, helper name, /fusion:*, store key | REC+SLASH+SHELL+STORE — no cd persists: every host.exec.v1 call gives the project root, workspace-relative, as its directory |
| 6 | [2955, 2986) | 31 | 32-35 | neutral |  |  |
| 7 | [2986, 3151) | 165 | 36-37 | claude | $FUSION_PLUGIN_ROOT, bin/fusion-*, helper name | REC+GUARD |
| 8 | [3151, 7236) | 4085 | 38-81 | neutral |  |  |
| 9 | [7236, 7340) | 104 | 82-83 | claude | store key | STORE |
| 10 | [7340, 8549) | 1209 | 84-92 | neutral |  |  |
| 11 | [8549, 9424) | 875 | 93-95 | claude | store key | SHELL+STORE — 'the Bash tool starts a fresh shell per call' becomes 'each host.exec.v1 call is a fresh process'; values are still written in literally |
| 12 | [9424, 18657) | 9233 | 96-208 | neutral |  |  |
| 13 | [18657, 19329) | 672 | 209-215 | claude | store key, /fusion:* | STORE+SHELL+SLASH — as span for line 93 |
| 14 | [19329, 22929) | 3600 | 216-273 | neutral |  |  |
| 15 | [22929, 23209) | 280 | 274-275 | claude | store key | STORE+COMMIT — both files are integrated as this run's commit |
| 16 | [23209, 23482) | 273 | 276-277 | neutral |  |  |

#### migrate (29643 bytes, 33 spans)

| # | Bytes [start, end) | Len | Lines | Tag | Reason | Replacement |
|---|---|---|---|---|---|---|
| 1 | [0, 656) | 656 | 1-4 | claude | frontmatter | FM — profile header and the binding: host.exec.v1 |
| 2 | [656, 1791) | 1135 | 5-19 | neutral |  |  |
| 3 | [1791, 2422) | 631 | 20-20 | claude | /fusion:* | SLASH+GUARD+SESS — route to the v11.11.1 tag is a Claude Code procedure (claude --plugin-dir); on Prior: refuse and name the tag, the conversion runs outside this host |
| 4 | [2422, 2957) | 535 | 21-23 | neutral |  |  |
| 5 | [2957, 3735) | 778 | 24-28 | claude | bin/fusion-*, helper name, /fusion:* | REC+SLASH |
| 6 | [3735, 3780) | 45 | 29-32 | neutral |  |  |
| 7 | [3780, 4209) | 429 | 33-36 | claude | $FUSION_PLUGIN_ROOT, bin/fusion-*, helper name, /fusion:* | REC+SLASH+SHELL — no working directory persists between host.exec.v1 calls: every call gives the project root, workspace-relative, as its directory, and shell variables do not persist either |
| 8 | [4209, 4242) | 33 | 37-39 | neutral |  |  |
| 9 | [4242, 5143) | 901 | 40-43 | claude | $FUSION_PLUGIN_ROOT, store key, /fusion:* | REC+STORE+SLASH+PLUGIN+GUARD |
| 10 | [5143, 6996) | 1853 | 44-58 | neutral |  |  |
| 11 | [6996, 7239) | 243 | 59-59 | claude | /fusion:* | SLASH+GUARD+SESS — as for line 20, inside the echo string |
| 12 | [7239, 14545) | 7306 | 60-118 | neutral |  |  |
| 13 | [14545, 14720) | 175 | 119-119 | claude | /fusion:* | SLASH |
| 14 | [14720, 18719) | 3999 | 120-151 | neutral |  |  |
| 15 | [18719, 19293) | 574 | 152-154 | claude | /fusion:* | SLASH+COMMIT — the host integrates the renames as this run's commit; 'tell the other checkouts to pull' stays; the setup entry is named, not a slash command; the run's integration is the one commit of renames; the citation repairs and Step 7 come in a later migrate entry run |
| 16 | [19293, 19544) | 251 | 155-160 | neutral |  |  |
| 17 | [19544, 19881) | 337 | 161-164 | claude | $FUSION_PLUGIN_ROOT, bin/fusion-*, helper name | REC+GUARD — SWEEP=absent: the bundle lacks the helper; report it, never 'fusion --update' or a restart |
| 18 | [19881, 20230) | 349 | 165-167 | neutral |  |  |
| 19 | [20230, 21205) | 975 | 168-170 | claude | $FUSION_PLUGIN_ROOT, bin/fusion-*, helper name | REC |
| 20 | [21205, 21258) | 53 | 171-173 | neutral |  |  |
| 21 | [21258, 22258) | 1000 | 174-179 | claude | $FUSION_PLUGIN_ROOT, bin/fusion-*, helper name, AskUserQuestion, /fusion:* | REC+QASK+GUARD+QCHAT+SLASH+PLUGIN — every question is chat text and ends the turn; this entry names no question service |
| 22 | [22258, 22635) | 377 | 180-186 | neutral |  |  |
| 23 | [22635, 23047) | 412 | 187-187 | claude | $FUSION_PLUGIN_ROOT, bin/fusion-*, helper name | REC |
| 24 | [23047, 23149) | 102 | 188-190 | neutral |  |  |
| 25 | [23149, 23558) | 409 | 191-191 | claude | $FUSION_PLUGIN_ROOT, bin/fusion-*, helper name | REC |
| 26 | [23558, 23811) | 253 | 192-193 | neutral |  |  |
| 27 | [23811, 25557) | 1746 | 194-196 | claude | $FUSION_PLUGIN_ROOT, bin/fusion-*, helper name | REC |
| 28 | [25557, 25644) | 87 | 197-200 | neutral |  |  |
| 29 | [25644, 26194) | 550 | 201-201 | claude | $FUSION_PLUGIN_ROOT, bin/fusion-*, helper name | REC |
| 30 | [26194, 26954) | 760 | 202-206 | neutral |  |  |
| 31 | [26954, 28361) | 1407 | 207-213 | claude | /fusion:*, $FUSION_PLUGIN_ROOT, bin/fusion-*, helper name | SLASH+REC |
| 32 | [28361, 29526) | 1165 | 214-221 | neutral |  |  |
| 33 | [29526, 29643) | 117 | 222-222 | claude | rule (b) | COMMIT — 'No git add, no git commit' stays; the host integrates the renames as this run's commit |

#### help (17841 bytes, 26 spans)

| # | Bytes [start, end) | Len | Lines | Tag | Reason | Replacement |
|---|---|---|---|---|---|---|
| 1 | [0, 335) | 335 | 1-5 | claude | frontmatter | FM — profile header and the binding: host.exec.v1 |
| 2 | [335, 365) | 30 | 6-8 | neutral |  |  |
| 3 | [365, 868) | 503 | 9-11 | claude | /fusion:* | SLASH |
| 4 | [868, 1471) | 603 | 12-19 | neutral |  |  |
| 5 | [1471, 1599) | 128 | 20-21 | claude | bin/fusion-*, helper name, $FUSION_PLUGIN_ROOT | REC+GUARD |
| 6 | [1599, 1643) | 44 | 22-22 | neutral |  |  |
| 7 | [1643, 1824) | 181 | 23-24 | claude | $FUSION_PLUGIN_ROOT, bin/fusion-*, helper name | REC |
| 8 | [1824, 1929) | 105 | 25-30 | neutral |  |  |
| 9 | [1929, 2513) | 584 | 31-31 | claude | bin/fusion-*, helper name | REC+SESS — as setup line 136: UNRESOLVED is a broken bundle, no session restart |
| 10 | [2513, 3448) | 935 | 32-46 | neutral |  |  |
| 11 | [3448, 3515) | 67 | 47-47 | claude | /fusion:* | SLASH |
| 12 | [3515, 4505) | 990 | 48-56 | neutral |  |  |
| 13 | [4505, 4801) | 296 | 57-57 | claude | /fusion:* | SLASH |
| 14 | [4801, 5730) | 929 | 58-64 | neutral |  |  |
| 15 | [5730, 6203) | 473 | 65-65 | claude | $FUSION_PLUGIN_ROOT, bin/fusion-*, helper name | REC |
| 16 | [6203, 7054) | 851 | 66-70 | neutral |  |  |
| 17 | [7054, 8392) | 1338 | 71-73 | claude | /fusion:* | SLASH |
| 18 | [8392, 8617) | 225 | 74-79 | neutral |  |  |
| 19 | [8617, 9266) | 649 | 80-81 | claude | /fusion:* | SLASH |
| 20 | [9266, 9921) | 655 | 82-88 | neutral |  |  |
| 21 | [9921, 14351) | 4430 | 89-93 | claude | /fusion:* | SLASH+GUARD |
| 22 | [14351, 16152) | 1801 | 94-105 | neutral |  |  |
| 23 | [16152, 16276) | 124 | 106-106 | claude | bin/fusion-*, helper name | REC |
| 24 | [16276, 16525) | 249 | 107-108 | neutral |  |  |
| 25 | [16525, 17328) | 803 | 109-109 | claude | bin/fusion-*, helper name | REC |
| 26 | [17328, 17841) | 513 | 110-119 | neutral |  |  |

### 5. The `requires` set per entry

As in 261024-2111 Finding 5: `host.exec.v1` replaces a helper call or shell block, `host.question.v1` an `AskUserQuestion`, `host.dispatch.v1` an Agent-tool dispatch. A chat question needs nothing. The set is read off what the `prior` parts must do after the replacements of Finding 4, because `checkEntries` compares `requires` with the services those parts name (`render.ts` `checkEntries`, `servicesNamed`).

| Entry | Class (catalog) | `requires` from this map | `catalog.json` `requires` | Agrees | Basis |
|---|---|---|---|---|---|
| setup | asks | `host.question.v1`, `host.exec.v1` | the same | yes | Setup's own body asks nothing (line 102 names `AskUserQuestion` text as a style surface). The questions come from the check selectors it runs inline (line 126): `assets` (check 118) and `leftovers` (check 328). The binding must say so, or no part names `host.question.v1`. |
| check | asks | `host.question.v1`, `host.exec.v1` | the same | yes | `assets` (118) and `leftovers` (328) through `AskUserQuestion`. `permissions` (171) becomes `CC`, with no question on Prior. The `identity` and `concurrency` asks are chat or dropped (254; spans for 54-62). |
| wp | **plain** | `host.question.v1`, `host.exec.v1` | `host.exec.v1` | **no** | Mode 3 "ask via `AskUserQuestion` for the title and the paragraph" (line 27), and on Prior mode 2 falls to mode 3 too (line 26, `CONV`). Prior's inventory: `other_asks` `title-and-paragraph`, channel `ask-user-question`. |
| wp-order | plain | `host.exec.v1` | the same | yes | "ask the user nothing, dispatch no agent" (line 76). |
| reconcile | dispatches | `host.exec.v1`, `host.dispatch.v1` | the same | yes | Dispatches the state-auditor (line 65). "Opens no approval and asks nothing" (line 99). |
| curate | asks | `host.question.v1`, `host.exec.v1`, `host.dispatch.v1` | `host.question.v1`, `host.exec.v1` | **no** | Two dispatches of the policy-curator (lines 34, 89). Prior's inventory lists `dispatches: policy-curator` for it. Three `AskUserQuestion` (63, 71, 78). |
| discuss | asks | `host.question.v1`, `host.exec.v1`, `host.dispatch.v1` | `host.question.v1`, `host.exec.v1` | **no** | One consultant dispatch per round (line 145). Prior's inventory: `dispatches: consultant`. `AskUserQuestion` at line 40. |
| commit | asks | `host.question.v1`, `host.exec.v1` | the same | yes, read as for the frontmatter grant | Steps 2 and 5 "ask" with fixed options (lines 22, 68). The body names no channel, but the frontmatter grants `AskUserQuestion`, and a chat question carries no options. Prior's inventory reads both as `unfixed`. If they are read as chat, `host.question.v1` drops out. |
| cleanup | plain | `host.exec.v1` | the same | yes | No ask, no dispatch. |
| archive | asks | `host.question.v1`, `host.exec.v1` | the same | yes | Lines 65, 136, 165, 277. |
| memo | asks | `host.question.v1`, `host.exec.v1` | the same | yes | Lines 50, 56. |
| post | asks | `host.question.v1`, `host.exec.v1` | the same | yes | Line 72. |
| news | asks | `host.exec.v1` | `host.question.v1`, `host.exec.v1` | **no** | Its one `AskUserQuestion` is the pull offer (line 109), inside Step 6, which is `COMMIT` here: no pull inside an entry run. If request 76 lets a run pull from a declared remote, the offer and `host.question.v1` come back and the entry agrees. |
| cadence | plain | `host.exec.v1` | the same | yes | No ask. |
| migrate | asks | `host.exec.v1` | `host.question.v1`, `host.exec.v1` | **no** | "Every question in this step is plain chat text with numbered options, never `AskUserQuestion`" (line 174), and Step 3 says the same (line 113). Prior's inventory gives all six question points `chat-text`. |
| help | plain | `host.exec.v1` | the same | yes | The topic question is chat (line 11; inventory `chat-text`). |

**Five disagreements:** `wp` lacks `host.question.v1`, `curate` and `discuss` lack `host.dispatch.v1`, and `news` and `migrate` carry a `host.question.v1` that no `prior` part may name. They come from plan step 2's fallback ("`asks` implies `host.question.v1`, `dispatches` `host.dispatch.v1`"), applied before this map existed. `curate` and `discuss` are `asks` by class C1 and also dispatch, and the fallback adds dispatch only for `dispatches`. `wp` is `plain` by C1, because its question is an input completion rather than a question point. `news` and `migrate` are `asks` by chat questions, or by a question this map removes. Step 15 writes this column, as 261024-2111 did for the agents. Until then `checkEntries` compares nothing, because all sixteen are `prior: unsupported`.

### 6. What a skill body presumes that an entry run on Prior does not provide

Each row is a property of the neutral text or of a skill's purpose. Most of these are not span questions: the cut is right, and the `prior` part cannot fix the presumption alone. The facts are Prior's at `08c57fb`.

| # | Presumption | Skills | Prior fact | Effect |
|---|---|---|---|---|
| P1 | **There is work to commit, and the role commits it.** | commit, cleanup; also the "uncommitted" lines of reconcile, curate, discuss, post, archive, cadence, migrate | The workspace is the project checked out at the run's base revision (package B binding, `analyst/parts/03-prior.md`). It is a linked worktree whose HEAD, index and objects are writable, so "a commit therefore lands on the worktree's detached HEAD" (`exec.go`, `GitDirectory`). `entry.v1` integrates once. | commit and cleanup find nothing uncommitted from an earlier session, because there is none in a fresh checkout. Their purpose has no subject on Prior unless the run itself produced the changes. Whether a run's own commits are integrated as made (cleanup's splits) or flattened is undefined. |
| P2 | **Per-checkout files survive between runs.** | reconcile (`.cadence-anchors` mark), news (seen mark), check and setup (`.check-stamps`), check (`.session-marker`, `monitor`), cadence (8b reads this checkout's rows) | Class L files (`rules/workbench-tracking.md` `## The four classes`) are untracked, so a checkout at the base revision has none. At Prior HEAD, after the pin, `.checkout-id` is carried read-only (issue `261025-1117-every-fusion-write-…`); the rest is not. | Each reconcile run dispatches, because no mark proves `changed=no`. Each news run shows the whole store again, and its `seen` write is lost. Setup finds every check due on every run. A mark written in the run is integrated only if the capture takes untracked files, which would put class L files into a commit. |
| P3 | **The executor has the network.** | news (`fusion-forum new` fetches), cleanup (push), check `upstream` (reads `FETCH_HEAD` age) | `Network: "none"`. A remote is mounted only when "the entry declares a push or fetch" (`exec.go`, `Remote`). | news ends at exit 6 (the fetch failed) unless the entry declares its remote. The age that check `upstream` reports describes the base checkout, not the user's. |
| P4 | **The shell has BSD and the full userland.** | cadence (`ls -l -T`, `date -v`, `python3`), setup, check and wp (`shasum`), cadence and archive (`find -newermt`), several (`awk`, `sort`, `mktemp`) | The image is `node:24-bookworm`, Debian with GNU coreutils. Prior names "bash, git, sed, head, od and Node" as what it provides (`exec.go`, `Image`). | `ls -l -T` errors under GNU `ls`, which cadence's own comment (line 85) warns about, and the block does not branch. `python3` and `shasum` are not on Prior's list. |
| P5 | **A scratch directory outside the workspace persists across calls.** | archive (`${TMPDIR:-/tmp}/fusion-archive-…` written in Step 4, read in Step 7), commit and cleanup (`/tmp` message files) | `HOME` is `/tmp` "on a fresh tmpfs". The root file system is read-only. The tool container starts with the run's first command. | Whether `/tmp` keeps archive's candidate and survey files from one call to the next is not stated. If the scratch goes into the workspace instead, the capture takes it. |
| P6 | **A read or write has no size bound.** | help (`README-agents.md` 98 437 bytes, `README-hooks.md` 263 153 bytes), archive (`cat` of `rules/workbench-tracking.md`, 22 326 bytes: within the bound) | `MaxExecOutputBytes` 64 KiB per stream, truncated with a notice. `MaxExecArgBytes` 32 KiB. | help's install, update and configure topics read past the bound. Already filed for the agents: `261025-1117-prior-parts-read-and-write-through-exec-past-its-64-kib-output-and-32-kib-argument-bounds.md`. The skills' binding must carry the same rule (Finding 3, `FM`). |
| P7 | **A git identity is configured.** | memo (`PERSON=` e-mail keys the file: "No e-mail, no write"), wp and discuss (`fusion-write create`), post and cadence (`CHECKOUT=` only) | The container's global git config holds only `safe.directory` (`exec.go`, `execPrelude`; issue `261025-1117-every-fusion-write-in-a-prior-exec-container-stops-because-git-config-names-no-user.md`). | memo halts on every run, and wp and discuss file nothing, until that issue is answered. |
| P8 | **A conversation precedes the command.** | wp mode 2, memo mode 2, discuss `--begin` with no reference, help "from the conversational context" | `entry-request.v1`: `{run_id, entry, arguments, project_context, …}`. There is no transcript. | Replaced by `CONV` spans. The modes still work when the argument carries the content. |
| P9 | **A session spans several commands.** | discuss (`--infer`, `--close` act on "the one this session began"), post ("this session's filed records"), setup (values "held by the orchestrator for the whole session", "begin the user's task") | One entry run is one invocation. A chat-text turn end resumes the same run (package B binding). | A discussion begun in one run cannot be inferred or closed from a later run: the body forbids scanning the store for it (line 38). A discuss run therefore has to carry the discussion from begin to stop, `--close` included, inside one run. |
| P10 | **The index carries meaning the tree does not.** | check `gitignore` (`git rm --cached .checkout-id`), migrate (`git mv`) | The capture is a tree fingerprint (`exec.go`, `TreeBefore`), and integration is the host's. | `git mv` also moves the file, so the tree shows it. `git rm --cached` changes only the index, and whether integration keeps that untrack is not stated. |
| P11 | **Setup inlines another skill's body.** | setup line 126 | The bundle carries the rendered Prior profiles (`profiles/*.md`) as data. Their path under the helper mount (`/opt/fusion`) is not stated. | Setup's `prior` part must read the check entry's Prior render, not the Claude `SKILL.md`. It can only name the path once Prior or package E fixes it. |
| P12 | **The actor and the attribution are Claude's.** | discuss (`--actor <your agent name, or claude>`), commit (`Co-Authored-By: Claude`) | `EntryBinding.Actor` is "the role run making the call". | Replaced by `ACTOR` and `ATTR`. The token Prior expects in `--actor`, and in an attribution line, is Prior's to name. |

### 7. Services each skill's `prior` parts must not spell

`servicesNamed` is `text.includes(s)` over all `prior` parts of a profile, so a negative sentence counts as naming a service (261024-2111 Finding 8, blocker 4). Under the Finding 5 column:

| Must not spell | Skills |
|---|---|
| `host.question.v1` | wp-order, reconcile, cleanup, news, cadence, migrate, help |
| `host.dispatch.v1` | setup, check, wp, wp-order, commit, cleanup, archive, memo, post, news, cadence, migrate, help |

The `QCHAT` span of migrate (line 174) and the `COMMIT` span of news (lines 95-115) are where this is easiest to break: the natural replacement sentence names the question service.

## Implications

Steps 13 and 14 can cut the parts from Finding 4 by copying byte ranges, and each Claude render then equals the committed `SKILL.md` by construction. The frontmatter is a `claude` part in every profile, as `catalog/README.md` now requires. Writing the `prior` parts is the real work. The `FM` binding of Finding 3 is shared text for all sixteen. Without it, the neutral shell blocks have no stated way to run.

Two skills have no faithful Prior counterpart yet. `commit` and `cleanup` act on uncommitted work and on commits the role makes. In a fresh checkout at the base revision there is no such work, and the host integrates once (P1). Their `prior` parts can be written to Finding 3's `COMMIT` class, but the result is an entry that inspects an unchanged tree and reports nothing to commit. Until request 76 answers question 1, the honest state for both is `prior: unsupported`, or a `prior` part that says on its first line that the entry has nothing to do on this host.

Three more depend on P2. Reconcile and news work on Prior, but their marks do not persist, so they run as if they were new every time. Setup and check stay correct and repeat every check on every run.

At step 15 the `requires` column of Finding 5 is the value to write: `wp` gains `host.question.v1`, `curate` and `discuss` gain `host.dispatch.v1`, and `news` and `migrate` lose `host.question.v1`. The class column stays C1's.

## Recommendations

1. **code-implementer, steps 13 and 14:** cut at the offsets in Finding 4 and add no other cut. Write each `prior` part to its Finding 3 class and its note. Give every profile one `FM` `prior` part, the header plus the binding, naming exactly that entry's Finding 5 services. Keep the Finding 7 table in view while writing.
2. **code-implementer, step 15:** write Finding 5's `requires` column for the sixteen skills. Mark `commit` and `cleanup` `prior: unsupported` unless request 76 has answered question 1.
3. **package F, request 76:** carry the twelve questions below.
4. **Reviewer of steps 13 and 14:** re-run the check in `### Acceptance, as run`. It reads a named revision, so pass the revision the parts were cut from.

### Questions for request 76

1. **Commits inside an entry run (P1).** Does `entry.v1` integrate commits a run makes on the worktree's detached HEAD as made, for example one per split (cleanup), or does capture flatten them into one integration commit? May the run give the integration its message (commit)? If neither, Prior is asked whether it wants `commit` and `cleanup` as entries at all.
2. **Workspace basis (P1).** Is every entry workspace a fresh checkout at the base revision, or can it carry the user's uncommitted working-tree changes?
3. **Per-checkout state (P2).** Does Prior keep a project's class-L files (`.cadence-anchors`, `.check-stamps`, `.session-marker`, `monitor`) between entry runs, as it now carries `.checkout-id`? If not, should a mark written inside a run be integrated, or dropped by the capture?
4. **Network and remotes (P3).** Can the news entry declare its remote for a fetch, and the cleanup entry for a push? What does the run see of the user's remote-tracking refs and `FETCH_HEAD`?
5. **Scratch space (P5).** Is `/tmp` (the container's `HOME`) kept across the `host.exec.v1` calls of one run, and is it outside the capture?
6. **Command set (P4).** Confirm the commands available beyond bash, git, sed, head, od and node: `python3`, `shasum`, `awk`, `find`, `sort`, `mktemp`, `date` (GNU), `ls` (GNU).
7. **Session id.** Is `FUSION_SESSION_ID`, exported by the SessionStart hook through `CLAUDE_ENV_FILE`, present on every `host.exec.v1` call of an entry run, so that check's identity fragment and the event-log rows carry it?
8. **The index (P10).** Does integration keep an index-only change such as `git rm --cached`?
9. **Actor and attribution (P12).** Which `--actor` token should a skill's entry run pass to `fusion-write` (the profile id, the entry id, or a host token), and what attribution line, if any, does Prior want on an integration commit?
10. **Rendered profiles in the mount (P11).** At what path under `/opt/fusion` will the setup entry find the check entry's Prior render?
11. **One run, several turns (P9).** Prior serves a chat question as a turn end and resumes the run with the reply (package B binding). Confirm that a run resumed this way keeps its workspace, its dispatch results and its context, so that discuss can run every round, the ceiling extension and `--close` in one run, and migrate can put six chat questions in sequence.
12. **Free-text answers.** Confirm that `QuestionResult.text` carries a reply typed instead of an option when options are given, so that curate's "reply with the ids, comma-separated" works through `host.question.v1`.

## Filed Issues

None. The brief limits this run to the report. The defects P6 and P7 touch are already filed in package B: `261025-1117-prior-parts-read-and-write-through-exec-past-its-64-kib-output-and-32-kib-argument-bounds.md` and `261025-1117-every-fusion-write-in-a-prior-exec-container-stops-because-git-config-names-no-user.md`. The rest are request-76 questions, not fusion defects. One item may deserve an issue on the Claude side as well: cadence's `ls -l -T` errors on GNU coreutils, and only a comment covers it (P4).

**No control file was written for this report.** `bin/fusion-write create` takes `--kind package|issue|plan|discussion|decision` (header, line 36), and no analysis in this workbench carries a control file, including 261024-2111. `rules/fusion-workbench-conventions.md` `## Record filing` lists analysis among the filed kinds, but the codec offers no kind for it. The brief asked for a control file; with this codec, none can be written.

## Sources

- `git show eab95b30:skills/{setup,check,wp,wp-order,reconcile,curate,discuss,commit,cleanup,archive,memo,post,news,cadence,migrate,help}/SKILL.md`
- `catalog/src/render.ts` (`ENTRY_SERVICES`, `servicesNamed`, `checkEntries`); `catalog/src/__tests__/render.test.ts` (`HELPER_SUFFIXES`, `HOST_TOKENS`, `CLAUDE_ONLY_TOKENS`, `priorTokenHits`); `catalog/README.md`; `catalog/catalog.json` (`.entries[] | select(.kind=="skill")`); `catalog/profiles/{analyst,consultant,requirements-designer}/parts/*-prior.md`
- `rules/workbench-tracking.md` `## The four classes`; `rules/fusion-workbench-conventions.md` `## Record filing`; `bin/fusion-write` header
- Plan `261023-1854-plan-prior-full-surface-handover-h1-to-h9.md` `## Approach`, steps 2, 5, 11-15; analysis `261024-2111-agent-span-map-for-entry-profiles.md` with its addendum; decisions D3, D-B1, D-B2; discussion `261025-0750-request-76-sequencing-and-prior-ask-channel.md`; issues `261025-1117-*` of package B cited above
- Prior at `08c57fb`: `docs/design/fusion-full-surface-handover-to-fusion.md` (H4, H5, H8); `docs/qualification/fusion-surface/inventory.json` (entries 1-16); `moduleapi/v1/entry_wire.go` (`QuestionCall`, `ExecCall`, `DispatchCall`, `QuestionResult`, the `Max*` bounds, `DecodeExecCall`); `internal/supervisor/exec.go` (header comment, `HelperRoot`, `HelperImage`, `execHome`, `ExecService` fields, `spec`, `mounts`)

### Acceptance, as run

The check is three scripts, and the full text of each is in the appendix below, so it can be re-run without this session's scratchpad. Save the four files of the appendix into one directory `$D`, then run:

```
python3 -I "$D/tile_check.py" /Users/kai/Projects/productive/F04-FUSION/fusion "$D/skill_spec.py" "$D" eab95b30
```

`tile_check.py` reads the span spec (`skill_spec.py`: the rule (b) lines and the notes), finds the rule (a) lines and the frontmatter itself, builds the spans and writes `$D/spans.json`. For each of the sixteen bodies it checks five things:

1. The spans start at 0 and end at the file size, with no gap, no overlap and no empty span.
2. The concatenated span bytes equal `git show <rev>:skills/<name>/SKILL.md` byte for byte.
3. Tags alternate, so no two neighbouring spans could have been one.
4. No neutral span carries a `HOST_TOKENS` hit.
5. As a positive control, the same regexes hit lines of the file.

Result for all sixteen: `tiling=ok concat=equal alternating=ok neutral_token_hits=0`. Control lines: setup 28, check 27, wp 16, wp-order 10, reconcile 11, curate 11, discuss 19, commit 4, cleanup 6, archive 32, memo 14, post 13, news 18, cadence 14, migrate 28, help 19. `REV eab95b30b7604084d1f4a7fff9e91d4a987ea2f2`, `RESULT PASS`, exit 0.

Two independent re-checks read `spans.json` and share none of its code:

```
bash "$D/shell_check.sh" "$D" /Users/kai/Projects/productive/F04-FUSION/fusion
node "$D/js_tokens.mjs" "$D" /Users/kai/Projects/productive/F04-FUSION/fusion
```

The first slices every span out of the committed file with `dd`, concatenates the slices and runs `cmp`. All sixteen report `cmp-equal` at the byte counts of Finding 2, exit 0. The second runs the `HOST_TOKENS` regexes in JavaScript, with the `m` flag on the slash-command regex as the test has it. All sixteen report `neutral-spans-with-hits=0`, exit 0.

The four appendix blocks were then extracted from this report file into an empty directory and run again. The result was the same `RESULT PASS`, 16 `cmp-equal` and 16 `neutral-spans-with-hits=0`, and a `spans.json` byte-identical to the first run's. So the appendix is the check, not a copy of it.

The Len columns of Finding 4 sum to each file's size. The span counts of Finding 2 are the row counts of Finding 4. Every `claude` span carries at least one replacement code, which the script asserts as well.

## Open Questions

- [ ] The twelve request-76 questions above, above all 1 to 3: they decide whether `commit` and `cleanup` get a working `prior` part, and whether reconcile's and news's marks mean anything on Prior.
- [ ] commit's two asks (lines 22, 68): `host.question.v1` (this map, from the frontmatter grant and the fixed options) or chat (Prior's `unfixed`)? A ruling of "chat" removes `host.question.v1` from the commit entry.
- [ ] The analysis kind has no `fusion-write create --kind`. Is a control file for analyses intended?

## Appendix: the check, as run


### `skill_spec.py`

````python
# Manual claude lines (rule b) per skill: (first_line, last_line, code, note). 1-based, inclusive.
# Rule (a) lines (HOST_TOKENS) and the frontmatter are found by the generator.
SPEC = {
"setup": [
 (9, 9, "NS", "the active agent MUST be fusion:orchestrator: the setup entry runs as its own entry run, under no active agent"),
 (93, 93, "SESS", "'until the session is restarted and Setup run again' becomes 'until Setup runs again in a later entry run'"),
 (126, 126, "PLUGIN", "a skill body cannot invoke a slash command: on Prior read the Prior render of the check entry (bundle profiles/skill-check.md) through host.exec.v1, not skills/check/SKILL.md, and run the due selectors' sections from it"),
 (171, 171, "SESS", "the session_start row is the host lifecycle runtime's (H9, D1); no row here, and no 'your Setup step 6' (no orchestrator session follows)"),
 (175, 175, "SESS", "the run ends with the Done report; no task begins inside this run, so drop 'only after ... may you begin the user's task'; the two next moves are named as entries the user starts next"),
],
"check": [
 (54, 54, "SESS", "an entry run is no orchestrator session: write no session marker for it"),
 (58, 62, "SESS", "on running: report the marker contents as a warning and continue; no proceed/abort offer, because the run starts no orchestrator session"),
 (83, 83, "SHELL", "'each Bash call is a fresh shell' becomes 'each host.exec.v1 call is a fresh process'; the prelude is still pasted into every block"),
 (165, 209, "CC", "permissions selector: a Claude Code permission file has no Prior counterpart (the host enforces tools_ceiling); report 'permissions: not applicable on this host', ask nothing, write nothing, and do not stamp it"),
 (273, 273, "COMMIT", "git rm --cached changes only the index: on Prior report '.checkout-id is tracked' and leave it, unless request 76 says capture carries index-only changes"),
],
"wp": [
 (26, 26, "CONV", "an entry run has no conversation: a reference names no content the arguments carry, so it is treated as mode 3 (Empty)"),
],
"wp-order": [
 (43, 43, "ARGS", "the entry's arguments, each {name, value}, become argv: --format <value> when given, else nothing; the helper stays the only validator"),
 (46, 46, "GUARD", "exit 3: the bundle's runtime tree is broken; report it as a defect of the installed bundle, never 'fusion --update' or a session restart"),
],
"reconcile": [
 (28, 29, "SHELL", "no cd persists: every host.exec.v1 call gives the project root, workspace-relative, as its directory"),
 (65, 65, "DISP", "call host.dispatch.v1 with entry 'state-auditor' and the parameter lines plus the one-sentence task as input"),
 (96, 96, "NS", "dispatches the state-auditor entry once, through host.dispatch.v1"),
],
"curate": [
 (34, 34, "DISP", "call host.dispatch.v1 with entry 'policy-curator'; the first non-empty line of the input is the mode parameter"),
 (52, 52, "TOOLS", "read the run file with the host's file tools"),
 (89, 89, "DISP", "call host.dispatch.v1 with entry 'policy-curator'; the first three non-empty lines of the input are the three parameters"),
 (105, 105, "TOOLS", "read the run file again with the host's file tools"),
 (111, 111, "COMMIT", "the apply pass's edits are integrated as this run's commit: the revert path is that commit's parent for the path (git checkout <integration>^ -- <path>), not a working-tree discard"),
 (120, 121, "NS+COMMIT", "dispatches only the policy-curator entry, twice at most; neither this run nor the child commits: the host integrates the run's edits once, at its end"),
],
"discuss": [
 (9, 9, "NS", "the second partner is the consultant entry, dispatched through host.dispatch.v1 once per round; 'whoever received it' is this entry run's role"),
 (31, 32, "CONV", "the reference is the --begin argument's value; there is no preceding exchange, so with no switch the topic and the reference both come from the argument text"),
 (36, 36, "SESS", "no session spans entry runs: one run carries a discussion from --begin to its stop; resuming is not offered"),
 (38, 38, "SESS", "the open discussion is the one this run began; --infer and --close in a later run find none (request 76, question 2)"),
 (109, 109, "CONV", "template line: the entry argument it came from, not a point in the conversation"),
 (145, 145, "DISP", "call host.dispatch.v1 with entry 'consultant'; the bare entry id, no namespace"),
 (154, 154, "CONV", "the material: paths, commit hashes and the entry argument the discussion came from"),
 (198, 198, "COMMIT", "the record is part of this run's integration, so tell the user it is committed with the run, not that it is uncommitted"),
 (209, 209, "NS", "dispatches the consultant entry and nothing else, once per round"),
],
"commit": [
 (11, 36, "COMMIT", "steps 1-3 select and stage for a commit the role makes; on Prior the role makes none (request 76, question 1): read git status/diff through host.exec.v1 and put the selection question through host.question.v1, staging nothing"),
 (45, 45, "ATTR", "the Co-Authored-By line names Claude; on Prior it names the host's model or is left out (request 76, question 9)"),
 (70, 148, "COMMIT", "steps 6-7 and the flags: no message file, no commit lock, no git add/commit, no hash; the confirmed message is the run's result for the host's integration; --amend is refused, because integration adds a commit"),
 (153, 153, "COMMIT", "--amend is refused on Prior, so there is nothing to warn about"),
],
"cleanup": [
 (7, 7, "COMMIT", "title: on Prior the entry composes splits and messages; the host integrates"),
 (13, 13, "COMMIT", "work left unfinished belongs in the run's result message"),
 (17, 19, "COMMIT", "argument meanings: commit and push are the host's (integrate, push when the entry declares a remote)"),
 (27, 31, "COMMIT", "guardrails about force-push, git add and amend: the role runs none of these on Prior; a merge or rebase in progress still stops the run"),
 (37, 37, "SHELL", "no cd persists: every host.exec.v1 call gives the project root, workspace-relative, as its directory"),
 (57, 59, "COMMIT+TMP+SESS", "no message file: no Write tool, no /tmp path, no Claude Code session id; each split's message is carried in the result"),
 (69, 77, "COMMIT", "stage-and-commit under the lock and the event-log commit: the role stages and commits nothing; the host integrates once (request 76, question 1 on splits)"),
 (81, 83, "COMMIT", "push is the host's step, run only when the entry declares a remote"),
 (89, 90, "COMMIT", "report the splits and their messages, no hashes; push is reported by the host"),
 (93, 93, "COMMIT", "first line says the splits were handed to the host's integration"),
],
"archive": [
 (131, 131, "SHELL", "no cd persists: every host.exec.v1 call gives the project root, workspace-relative, as its directory"),
 (232, 232, "COMMIT", "the moves are integrated as this run's commit; do not tell the user to git add the archive"),
 (280, 280, "COMMIT", "'No git add, no git commit' stays; 'the user decides whether to commit the archive' becomes 'the host integrates it with the run'"),
],
"memo": [
 (47, 47, "CONV", "no conversation: route to the task file by keyword or imperative content only"),
 (71, 71, "CONV", "template line: 'verbatim for captures'; there are no conversational references on Prior"),
 (94, 94, "CONV", "mode 2 does not exist on Prior (no conversation); modes 1 and 3 as written"),
],
"post": [
 (46, 46, "SESS", "no run remembers what earlier runs filed: the records are those that git log --name-status shows filed under the workbench in the --since range"),
 (89, 89, "COMMIT", "the entry is integrated with this run (pushed when the entry declares a remote): drop 'carry the file in your next commit'"),
 (95, 95, "COMMIT", "commits nothing itself; the host integrates the entry with the run"),
],
"news": [
 (14, 14, "COMMIT", "no pull inside an entry run: the workspace revision is the host's; the run says a pull is owed"),
 (95, 115, "COMMIT", "Step 6: no pull offer and no git pull; when new entries were shown, say that a pull would bring them into the working tree and that it is the user's, outside this run"),
],
"cadence": [
 (25, 25, "SHELL", "no cd persists: every host.exec.v1 call gives the project root, workspace-relative, as its directory"),
 (93, 93, "SHELL", "'the Bash tool starts a fresh shell per call' becomes 'each host.exec.v1 call is a fresh process'; values are still written in literally"),
 (213, 213, "SHELL", "as span for line 93"),
 (275, 275, "COMMIT", "both files are integrated as this run's commit"),
],
"migrate": [
 (36, 36, "SHELL", "no working directory persists between host.exec.v1 calls: every call gives the project root, workspace-relative, as its directory, and shell variables do not persist either"),
 (164, 164, "GUARD", "SWEEP=absent: the bundle lacks the helper; report it, never 'fusion --update' or a restart"),
 (222, 222, "COMMIT", "'No git add, no git commit' stays; the host integrates the renames as this run's commit"),
],
"help": [],
}

# Notes on rule-(a) lines whose replacement needs more than the token class says.
NOTES = {
 ("setup", 102): ("QSTYLE", "the chat profile governs question text: host.question.v1 question text"),
 ("check", 241): ("SESS", "the identity fragment's session_id comes from the environment the host passes (request 76, question 7), not from a SessionStart line"),
 ("reconcile", 11): ("COMMIT", "every change is integrated with this run by the host; the cleanup entry commits nothing on Prior"),
 ("reconcile", 92): ("COMMIT", "close with: the edits are integrated as this run's commit"),
 ("curate", 10): ("COMMIT", "nothing here commits; the host integrates the apply pass's edits at the run's end"),
 ("curate", 16): ("QASK", "the curate entry holds host.question.v1 and the dispatched child holds no question service, so the child returns the question and this run puts it"),
 ("discuss", 136): ("ACTOR", "--actor names this run's role on Prior, never 'claude' (request 76, question 9)"),
 ("discuss", 161): ("QNEG", "'You hold no question service': the consultant entry requires none"),
 ("migrate", 20): ("SESS", "route to the v11.11.1 tag is a Claude Code procedure (claude --plugin-dir); on Prior: refuse and name the tag, the conversion runs outside this host"),
 ("migrate", 59): ("SESS", "as for line 20, inside the echo string"),
 ("migrate", 152): ("COMMIT", "the host integrates the renames as this run's commit; 'tell the other checkouts to pull' stays; the setup entry is named, not a slash command"),
 ("migrate", 154): ("COMMIT", "the run's integration is the one commit of renames; the citation repairs and Step 7 come in a later migrate entry run"),
 ("migrate", 174): ("QCHAT", "every question is chat text and ends the turn; this entry names no question service"),
 ("cadence", 7): ("SLASH", "title: 'the cadence entry'"),
}
NOTES.update({
 ("setup", 136): ("SESS", "the host sets FUSION_PLUGIN_ROOT on every host.exec.v1 call, so UNRESOLVED is a broken bundle: report it, no session restart"),
 ("help", 31): ("SESS", "as setup line 136: UNRESOLVED is a broken bundle, no session restart"),
 ("check", 56): ("SESS", "no marker write for an entry run (see span note on line 54)"),
 ("reconcile", 78): ("SESS", "the mark lives in .cadence-anchors, class L: request 76, question 3"),
 ("news", 90): ("SESS", "the seen mark lives in .cadence-anchors, class L: request 76, question 3"),
})
````

### `tile_check.py`

````python
#!/usr/bin/env python3
# Span map of skills/<name>/SKILL.md at a git revision. Usage:
#   python3 -I tile_check.py <fusion-root> <spec.py> <out-dir> [rev]
# Builds the spans, writes <out-dir>/spans.json, checks the tiling and the token lint, exits 0 on PASS.
import json, os, re, subprocess, sys, importlib.util
root, specp, out = sys.argv[1], sys.argv[2], sys.argv[3]
rev = sys.argv[4] if len(sys.argv) > 4 else "HEAD"
s = importlib.util.spec_from_file_location("spec", specp); m = importlib.util.module_from_spec(s); s.loader.exec_module(m)
SKILLS = ["setup","check","wp","wp-order","reconcile","curate","discuss","commit","cleanup","archive","memo","post","news","cadence","migrate","help"]
helpers = sorted(n[7:] for n in os.listdir(os.path.join(root, "bin")) if n.startswith("fusion-"))
# HOST_TOKENS, transcribed from catalog/src/__tests__/render.test.ts (the slash regex carries the m flag there; Python applies it per line here and to whole spans with re.M)
TOK = [("$FUSION_PLUGIN_ROOT", r"\$FUSION_PLUGIN_ROOT"), ("bin/ helper path", r"bin/fusion-[a-z-]+"),
       ("bin/ helper bare word", r"\bfusion-(%s)\b" % "|".join(map(re.escape, helpers))), ("$OUT_*/$SCAN_*", r"\$?(OUT|SCAN)_[A-Z*]"),
       ("Agent(", r"Agent\("), ("AskUserQuestion", r"AskUserQuestion"), ("slash command", r"(^|[\s`(])/[a-z][a-z0-9-]*:[a-z]")]
TOK = [(n, re.compile(r, re.M)) for n, r in TOK]
CODE = {"$FUSION_PLUGIN_ROOT": "REC", "bin/ helper path": "REC", "bin/ helper bare word": "REC", "$OUT_*/$SCAN_*": "STORE",
        "Agent(": "FM", "AskUserQuestion": "QASK", "slash command": "SLASH"}
def git_show(path):
    return subprocess.run(["git", "-C", root, "show", f"{rev}:{path}"], capture_output=True, check=True).stdout
head = subprocess.run(["git", "-C", root, "rev-parse", rev], capture_output=True, text=True, check=True).stdout.strip()
result, ok = {"rev": head, "skills": {}}, True
for sk in SKILLS:
    data = git_show(f"skills/{sk}/SKILL.md")
    lines = data.split(b"\n")
    # byte offsets per line (the last element is the bytes after the final newline, empty here)
    offs, o = [], 0
    for i, l in enumerate(lines):
        n = len(l) + (1 if i < len(lines) - 1 else 0)
        offs.append((o, o + n)); o += n
    if lines and lines[-1] == b"": offs.pop(); lines = lines[:-1]
    text = [l.decode() for l in lines]
    tag, why = [None] * len(text), [[] for _ in text]
    # frontmatter: line 1 '---' through the next '---'
    assert text[0] == "---"; fm_end = text.index("---", 1)
    for i in range(fm_end + 1): tag[i] = "claude"; why[i].append(("FM", "frontmatter"))
    for i, t in enumerate(text):
        hits = [n for n, r in TOK if r.search(t)]
        if hits and tag[i] is None: tag[i] = "claude"
        for h in hits:
            if i > fm_end: why[i].append((CODE[h], h))
        if i > fm_end and hits:
            if "[ -x" in t and ("$FUSION_PLUGIN_ROOT" in t or "bin/fusion" in t): why[i].append(("GUARD", "[ -x ] guard"))
            if re.search(r"\$FUSION_PLUGIN_ROOT/(rules|templates|stilwerk|\.claude-plugin|codec|bin/monitor)", t): why[i].append(("PLUGIN", "reads the install tree"))
            if "fusion --update" in t: why[i].append(("GUARD", "fusion --update"))
            if re.search(r"/tmp|TMPDIR", t): why[i].append(("TMP", "scratch path outside the workspace"))
            if re.search(r'\bcd "', t): why[i].append(("SHELL", "persisting cd"))
            k = (sk, i + 1)
            if k in m.NOTES: why[i].append((m.NOTES[k][0], m.NOTES[k][1]))
    for a, b, code, note in m.SPEC[sk]:
        for ln in range(a, b + 1):
            i = ln - 1; tag[i] = "claude"; why[i].append((code, note))
    for i in range(len(text)):
        if tag[i] is None: tag[i] = "neutral"
    # merge runs; a neutral run of only blank and fence-delimiter lines joins the claude span before it
    runs = []
    for i, t in enumerate(tag):
        if runs and runs[-1][0] == t: runs[-1][2] = i
        else: runs.append([t, i, i])
    merged = []
    for r in runs:
        filler = r[0] == "neutral" and all(text[j].strip() == "" or re.fullmatch(r"\s*```[a-z]*\s*", text[j]) for j in range(r[1], r[2] + 1))
        if filler and merged and merged[-1][0] == "claude": merged[-1][2] = r[2]; continue
        if merged and merged[-1][0] == r[0]: merged[-1][2] = r[2]; continue
        merged.append(list(r))
    spans = []
    for n, (t, a, b) in enumerate(merged, 1):
        st, en = offs[a][0], offs[b][1]
        codes, notes = [], []
        for j in range(a, b + 1):
            for c, w in why[j]:
                if c not in codes: codes.append(c)
                if w not in notes: notes.append(w)
        spans.append({"n": n, "tag": t, "start": st, "end": en, "lines": [a + 1, b + 1], "codes": codes, "notes": notes})
    # checks
    tiling = spans[0]["start"] == 0 and spans[-1]["end"] == len(data) and all(spans[i]["end"] == spans[i + 1]["start"] for i in range(len(spans) - 1)) and all(s_["end"] > s_["start"] for s_ in spans)
    concat = b"".join(data[s_["start"]:s_["end"]] for s_ in spans) == data
    alt = all(spans[i]["tag"] != spans[i + 1]["tag"] for i in range(len(spans) - 1))
    nhits = [s_["n"] for s_ in spans if s_["tag"] == "neutral" and any(r.search(data[s_["start"]:s_["end"]].decode()) for _, r in TOK)]
    control = sum(1 for t in text if any(r.search(t) for _, r in TOK))
    nb = sum(s_["end"] - s_["start"] for s_ in spans if s_["tag"] == "neutral")
    uncoded = [s_["n"] for s_ in spans if s_["tag"] == "claude" and not s_["codes"]]
    good = tiling and concat and alt and not nhits and not uncoded and control > 0
    ok &= good
    print(f"{sk:10s} bytes={len(data):6d} spans={len(spans):3d} tiling={'ok' if tiling else 'FAIL'} concat={'equal' if concat else 'DIFF'} alternating={'ok' if alt else 'FAIL'} neutral_token_hits={len(nhits)} uncoded_claude={len(uncoded)} control_lines={control} neutral_bytes={nb} ({100*nb//len(data)} %)")
    result["skills"][sk] = {"bytes": len(data), "spans": spans}
json.dump(result, open(os.path.join(out, "spans.json"), "w"), indent=1)
print(f"REV {head}")
print("RESULT", "PASS" if ok else "FAIL"); sys.exit(0 if ok else 1)
````

### `shell_check.sh`

````bash
#!/bin/bash
# Independent re-check: slice every span out of the committed file with dd, concatenate, cmp.
# Usage: shell_check.sh <dir-with-spans.json> <fusion-root>
S="$1"; F="$2"; REV="$(jq -r .rev "$S/spans.json")"; T="$(mktemp -d)"; rc=0
for sk in $(jq -r '.skills|keys[]' "$S/spans.json"); do
  git -C "$F" show "$REV:skills/$sk/SKILL.md" > "$T/orig"; : > "$T/cat"
  jq -r --arg s "$sk" '.skills[$s].spans[] | "\(.start) \(.end)"' "$S/spans.json" | while read -r a b; do dd if="$T/orig" bs=1 skip="$a" count=$((b-a)) 2>/dev/null >> "$T/cat"; done
  if cmp -s "$T/orig" "$T/cat"; then echo "$sk cmp-equal $(wc -c < "$T/orig" | tr -d ' ')"; else echo "$sk cmp-DIFF"; rc=1; fi
done; rm -rf "$T"; exit $rc
````

### `js_tokens.mjs`

````javascript
// Independent re-check: the HOST_TOKENS regexes in JavaScript (slash regex with the m flag, as render.test.ts has it) over every span.
// Usage: node js_tokens.mjs <dir-with-spans.json> <fusion-root>
import { readFileSync, readdirSync } from "fs"; import { execFileSync } from "child_process"; import { join } from "path";
const [S, F] = process.argv.slice(2); const j = JSON.parse(readFileSync(join(S, "spans.json"), "utf8"));
const H = readdirSync(join(F, "bin")).filter((n) => n.startsWith("fusion-")).map((n) => n.slice(7));
const T = [/\$FUSION_PLUGIN_ROOT/, /bin\/fusion-[a-z-]+/, new RegExp(`\\bfusion-(${H.join("|")})\\b`), /\$?(OUT|SCAN)_[A-Z*]/, /Agent\(/, /AskUserQuestion/, /(^|[\s`(])\/[a-z][a-z0-9-]*:[a-z]/m];
let bad = 0;
for (const [sk, v] of Object.entries(j.skills)) {
  const buf = execFileSync("git", ["-C", F, "show", `${j.rev}:skills/${sk}/SKILL.md`]);
  let n = 0, c = 0;
  for (const s of v.spans) { const t = buf.subarray(s.start, s.end).toString("utf8"); const hit = T.some((r) => r.test(t)); if (s.tag === "neutral" && hit) n++; if (s.tag === "claude" && hit) c++; }
  bad += n; console.log(`${sk} neutral-spans-with-hits=${n} claude-spans-with-hits=${c}`);
}
process.exit(bad ? 1 : 0);
````
