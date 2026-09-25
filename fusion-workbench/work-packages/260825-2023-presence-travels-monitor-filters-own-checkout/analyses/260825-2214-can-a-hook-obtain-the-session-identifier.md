# Analysis: can a hook obtain the Claude Code session identifier

**Date:** 2026-08-25 22:14
**Type:** Feasibility
**Status:** Complete
**Requested by:** orchestrator, as step 1 of `260825-2140_*_c4-presence-travels-and-the-monitor-reads-its-own-checkout.md`
**Filed by:** analyst, Kai Stalmann <ks@qantr.com>

## Question

Step 11 of the C4 plan adds `session_id` to the emitted event line under two independent conditionals, and neither branch may be taken without its own measured answer. Three questions decide them. Does the SessionStart hook's stdin payload carry a non-empty `session_id`? Can a SessionStart hook put a value in front of the model, through plain stdout or through `hookSpecificOutput.systemMessage`, such that the model reproduces it verbatim? Is `session_id` non-empty on PreToolUse and PostToolUse at run time? This report answers those three by measurement and proposes nothing.

## Scope

Measured in a throwaway project at `/tmp/fusion-hookprobe-260825`, created for this step and outside every git tree. It carries its own `.claude/settings.json` declaring four hook commands: one that writes its raw stdin to a capture file, one that emits a token on plain stdout, one that emits a token inside `hookSpecificOutput.systemMessage`, and one that writes into `$CLAUDE_ENV_FILE`. Each was driven with `claude -p ... --dangerously-skip-permissions --output-format json`. Nothing in the fusion repository was instrumented, read for behaviour, or changed: the installed hooks are pinned for the session, so an edit here would not have been the thing measured.

Claude Code version, from `claude --version`: `2.1.245 (Claude Code)`.

The fusion tree was read for two claims only, both cited below and neither measured through it: the `session_id` declarations in `hooks/guard.ts` and `hooks/tracker.ts`, and the output channel of `hooks/session-start.ts`.

Git tree read: HEAD `8119fc2659733b0ac6ba73f04092465e2ca3c644`, committed `Tue Aug 25 17:05:59 2026 +0200`, branch `main`, tracking `## main...origin/main` with no ahead or behind count, so the branch is level with its remote. Two files were modified in the working tree at the time of reading (`agents/orchestrator.md`, `fusion-workbench/orchestrator-events.jsonl`), neither of them a file this report reasons from.

## Findings

### (a) The SessionStart payload carries `session_id`, and it is non-empty

The hook's raw stdin, captured verbatim:

```
$ python3 -m json.tool /tmp/fusion-hookprobe-260825/capture/sessionstart-0.json
{
    "session_id": "dfa86931-ea0a-4397-8ced-d140df251c9b",
    "transcript_path": "/Users/k1/.claude/projects/-private-tmp-fusion-hookprobe-260825/dfa86931-ea0a-4397-8ced-d140df251c9b.jsonl",
    "cwd": "/private/tmp/fusion-hookprobe-260825",
    "hook_event_name": "SessionStart",
    "source": "startup"
}
```

The value is a UUID and it is the session's real identifier, not a placeholder. The same run's `--output-format json` result object reported `"session_id":"dfa86931-ea0a-4397-8ced-d140df251c9b"`, and the transcript file named in `transcript_path` carries that UUID in its own filename and in its `sessionId` fields. Three independent sightings of one value.

The payload also carries `source`, which distinguishes a fresh start from a resumption. It read `"source": "startup"` above and `"source": "resume"` on both resumed runs measured under (b).

**Answer: yes, and non-empty.** What it permits: any value derived from the session identifier can be computed inside a SessionStart hook. Obtaining it there is settled; the open half is delivery, which is question (b).

### (b) Plain stdout reaches the model verbatim; `systemMessage` does not reach it at all

Two SessionStart hooks ran side by side, each reading the same stdin and each emitting one token plus the session identifier. One wrote to plain stdout, the other wrote a `hookSpecificOutput.systemMessage` object.

The second hook's output is well-formed, which rules out a malformed-payload explanation for its result:

```
$ ./emit-sysmsg.sh < capture/sessionstart-0.json
{"hookSpecificOutput": {"hookEventName": "SessionStart", "systemMessage": "PROBE-SYSMSG-CHANNEL token=BRAVO-B4E2D608 session_id=dfa86931-ea0a-4397-8ced-d140df251c9b"}}
$ ./emit-sysmsg.sh < capture/sessionstart-0.json | python3 -c 'import sys,json; d=json.load(sys.stdin); print("valid JSON, systemMessage =", d["hookSpecificOutput"]["systemMessage"])'
valid JSON, systemMessage = PROBE-SYSMSG-CHANNEL token=BRAVO-B4E2D608 session_id=dfa86931-ea0a-4397-8ced-d140df251c9b
```

The session was then asked to search its own context for both tokens. Its reply, quoted whole:

````
**(1) ALPHA-7F3A9C21 — YES.** Line containing it:

```
SessionStart:startup hook success: PROBE-STDOUT-CHANNEL token=ALPHA-7F3A9C21 session_id=2098884c-c313-4c78-9d40-b4f55977257e
```

**(2) BRAVO-B4E2D608 — NO.** That string does not appear anywhere in my context.

**(3) session_id values visible:** exactly one —

```
session_id=2098884c-c313-4c78-9d40-b4f55977257e
```

(from the same SessionStart hook line quoted above).
````

A model's report about its own context is testimony, so the same question was put to the transcript, which is written by the harness rather than by the model. Both hook invocations are recorded there as `hook_success` attachments, and the two differ in exactly the field that becomes context:

```
{"attachment": {"type": "hook_success", "hookName": "SessionStart:startup", "hookEvent": "SessionStart",
  "content": "PROBE-STDOUT-CHANNEL token=ALPHA-7F3A9C21 session_id=2098884c-c313-4c78-9d40-b4f55977257e",
  "stdout": "PROBE-STDOUT-CHANNEL token=ALPHA-7F3A9C21 session_id=2098884c-c313-4c78-9d40-b4f55977257e\n",
  "stderr": "", "exitCode": 0, "command": "/tmp/fusion-hookprobe-260825/emit-stdout.sh", "durationMs": 96}}

{"attachment": {"type": "hook_success", "hookName": "SessionStart:startup", "hookEvent": "SessionStart",
  "content": "",
  "stdout": "{\"hookSpecificOutput\": {\"hookEventName\": \"SessionStart\", \"systemMessage\": \"PROBE-SYSMSG-CHANNEL token=BRAVO-B4E2D608 session_id=2098884c-c313-4c78-9d40-b4f55977257e\"}}\n",
  "stderr": "", "exitCode": 0, "command": "/tmp/fusion-hookprobe-260825/emit-sysmsg.sh", "durationMs": 147}}
```

The mechanism is visible in the pair. Plain stdout is copied into `content`; a recognised JSON object is parsed and its `systemMessage` is routed elsewhere, leaving `content` empty. The four textual occurrences of `BRAVO-B4E2D608` elsewhere in that transcript are all traceable to the prompt asking about the token and to the reply about it, never to a context insertion.

The reproduction is verbatim and it tracks a changing value. The first run reproduced `dfa86931-ea0a-4397-8ced-d140df251c9b`, the second `2098884c-c313-4c78-9d40-b4f55977257e`, each equal to that run's own identifier, so the model is reading the line rather than recalling a constant. What it reproduces is the harness's rendering of the line, `SessionStart:startup hook success: <stdout>`, with the hook's own text unaltered inside it.

**Answer: plain stdout, yes, verbatim and reproducibly. `hookSpecificOutput.systemMessage`, no, the model never receives it.** This matches what `hooks/session-start.ts:88-92` already states in prose, in the opposite direction and for its own purpose: it chooses `systemMessage` precisely because a warning only the model sees is not a warning. That comment and this measurement are the same fact read from two ends. Today fusion uses no plain-stdout SessionStart channel at all: of the three commands in `hooks/hooks.json`, the first redirects into `$CLAUDE_ENV_FILE` and emits nothing on stdout, the second emits a `systemMessage` object, and `session-start.ts` emits either `{}` or a `systemMessage` object.

What this permits: a value can be delivered to the model from SessionStart, on one channel and not the other, and the delivery is checkable after the fact from the transcript's `content` field rather than only by asking the model.

### (c) `session_id` is non-empty on PreToolUse and PostToolUse

Both hooks were fired by a `Bash` call and, in a separate run, by a `Write` call, covering both halves of the matcher `hooks/hooks.json` declares.

```
$ python3 -m json.tool capture/pretooluse-0.json
{
    "session_id": "dfa86931-ea0a-4397-8ced-d140df251c9b",
    "transcript_path": "/Users/k1/.claude/projects/-private-tmp-fusion-hookprobe-260825/dfa86931-ea0a-4397-8ced-d140df251c9b.jsonl",
    "cwd": "/private/tmp/fusion-hookprobe-260825",
    "prompt_id": "24a39316-8847-41e9-bc04-bab57ae80b4e",
    "permission_mode": "bypassPermissions",
    "effort": {"level": "high"},
    "hook_event_name": "PreToolUse",
    "tool_name": "Bash",
    "tool_input": {"command": "echo probe-ran", "description": "Echo probe-ran"},
    "tool_use_id": "toolu_01TpYtZ6BbMJz8156jwXUj47"
}
```

The PostToolUse payload from the same tool call carries the identical `session_id`, plus `tool_response`, `duration_ms` and the same `tool_use_id`.

The `Write` run, reduced to the three fields at issue:

```
emit-stdout-stdin.json | hook_event_name= SessionStart | tool_name= None | session_id= '45ad1dd9-e742-4eb6-a955-67b0d2e3fb4c'
emit-sysmsg-stdin.json | hook_event_name= SessionStart | tool_name= None | session_id= '45ad1dd9-e742-4eb6-a955-67b0d2e3fb4c'
posttooluse-0.json     | hook_event_name= PostToolUse  | tool_name= Write | session_id= '45ad1dd9-e742-4eb6-a955-67b0d2e3fb4c'
pretooluse-0.json      | hook_event_name= PreToolUse   | tool_name= Write | session_id= '45ad1dd9-e742-4eb6-a955-67b0d2e3fb4c'
```

One value stands on all four payloads of one session, and it equals that run's reported identifier. The field the two fusion hooks declare and never read (`hooks/guard.ts:83-88`, `hooks/tracker.ts:131-137`) is therefore populated, not vestigial.

**Answer: yes, non-empty on both, for `Bash` and for `Write`, and equal to the SessionStart value within one session.** What it permits: a guard or tracker row can carry the session identifier without any new plumbing, since the value is already on the payload each hook parses.

### Supplementary, measured but not asked

Two facts fell out of the runs above. They are recorded because they bear on how step 11's first branch would be read, and this report takes no position on either.

**A resumed session keeps its identifier.** Step 11's note reasons that a resumed session keeps its history file while receiving a fresh `session_id`. Measured, it receives the same one. Under `--resume <id>` the returned identifier was `2098884c-c313-4c78-9d40-b4f55977257e`, unchanged from the run that created it, and the SessionStart payload read `"session_id": "2098884c-c313-4c78-9d40-b4f55977257e"` with `"source": "resume"`. Under `--continue`, which names no identifier, the result was the same: `45ad1dd9-e742-4eb6-a955-67b0d2e3fb4c` on both the original run and the continuation, with `"source": "resume"` on the second. Two resumption forms, both preserving. The note's factual premise does not hold at this version; whether its conclusion still does is a judgement this report does not make.

**A third delivery channel exists and was measured, because the scope of (b) is otherwise easy to mistake for the scope of the question.** `$CLAUDE_ENV_FILE`, which fusion's own first SessionStart command already writes to, is a shell file sourced into the environment the `Bash` tool runs in:

```
$ cat capture/envfile-probe.txt
CLAUDE_ENV_FILE=[/Users/k1/.claude/session-env/c925d4eb-8d77-46f5-80c9-366a0e04ba39/sessionstart-hook-3.sh]
```

A hook appending `export PROBE_SESSION_ID=$sid` to that file put the value in front of the shell rather than in front of the model, and the value survived:

```
result: PROBE_SESSION_ID=[c925d4eb-8d77-46f5-80c9-366a0e04ba39]
```

This is a different target from question (b), which asks about the model's context. Both were measured; neither is recommended here.

## Implications

Both conditionals in step 11 have their answers, and both come back positive. The first branch needs the identifier obtainable at SessionStart and deliverable to the model verifiably; it is obtainable, and it is deliverable on plain stdout, on the channel fusion does not currently use for anything. The second branch needs `session_id` non-empty on the two tool hooks; it is, on both, for both tool families in the declared matcher.

One negative result stands inside a positive answer and should not be lost in it. `hookSpecificOutput.systemMessage` reaches the user and never the model. A delivery built on that channel would emit correctly, log as a successful hook, and put nothing in front of the model, with no failure visible anywhere except an empty `content` field in the transcript. The distinction between the two channels is the whole of question (b)'s answer.

## Recommendations

None. This report answers three questions; step 11 of the plan is where the answers are acted on, and its branches are already written.

## Filed Issues

None. Nothing measured here is a defect: every claim the plan and the tree make about these fields held, apart from the step-11 note about resumption recorded under `### Supplementary, measured but not asked`, which is a note rather than a mechanism and is corrected in place by this report rather than by an issue.

## Sources

Measured, in `/tmp/fusion-hookprobe-260825` (settings, hook scripts and captures still on disk at the time of writing):

- `.claude/settings.json`, declaring SessionStart, PreToolUse and PostToolUse hooks
- `probe.sh`, `emit-stdout.sh`, `emit-sysmsg.sh`, `emit-envfile.sh`
- `capture/sessionstart-0.json`, `capture/pretooluse-0.json`, `capture/posttooluse-0.json`, `capture/envfile-probe.txt`
- `/Users/k1/.claude/projects/-private-tmp-fusion-hookprobe-260825/2098884c-c313-4c78-9d40-b4f55977257e.jsonl`, the transcript read for the two `hook_success` attachments
- Five `claude -p` runs, each with `--dangerously-skip-permissions --output-format json`; the fourth used `--resume <id>` and the fifth `--continue`

Read in this repository, for the two cited claims only:

- `hooks/guard.ts:83-88` and `hooks/tracker.ts:131-137`, the two `interface HookInput` declarations of `session_id`
- `hooks/session-start.ts:88-92`, the `## Channel` note
- `hooks/hooks.json`, the three SessionStart commands and the PreToolUse/PostToolUse matcher
- `260825-2140_*_c4-presence-travels-and-the-monitor-reads-its-own-checkout.md`, steps 1 and 11

## Open Questions

- [ ] None arising from this measurement. The question step 11 holds open is which of the two positive branches to take, and that is the plan's to answer, not this report's.
