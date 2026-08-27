/**
 * Compliance Guard — PreToolUse hook for Claude Code.
 *
 * The hook decides nothing. It receives the four write tools
 * (Write/Edit/MultiEdit/NotebookEdit), Bash, and the sub-agent dispatch tool
 * (Task/Agent), allows every one of them, and exists for three products:
 *
 *   1. The write trace — one `guard_allow` row per write-tool call in
 *      `.guard-state/events.jsonl`. That log is what the monitor's panel
 *      renders, and it is the only record of what the write surface did.
 *   2. The configuration diagnostic — one `guard_advisory` per problem the
 *      config loader hands back, on every guarded call, Bash included, for as
 *      long as the project's configuration file is broken or names a retired
 *      key.
 *   3. The dispatch trace (v10.8.0) — one machine-written `task_start` row in
 *      `fusion-workbench/orchestrator-events.jsonl` per sub-agent dispatch,
 *      while an orchestrator session is in flight. `lib/orchestrator-events.ts`
 *      carries the schema, the identity resolution and the gate, and why the
 *      row moved from a prompt mandate to a writer that cannot forget.
 *      Dispatch calls take this branch alone: they are not "guarded calls", so
 *      they see no configuration diagnostic and write no guard state.
 *
 * The name is historical and is kept because the event vocabulary, the state
 * directory and the monitor panel all carry it. Nothing here guards anything.
 *
 * Protocol: reads JSON from stdin, writes JSON to stdout.
 *   Allow: {}
 * There is no second verdict. Every path through `main` writes `{}`.
 *
 * ## What this hook used to check, and when each half went
 *
 * Written in the past tense and kept rather than deleted: a reader arriving
 * from an older tree, an older README, or an existing `events.jsonl` full of
 * `guard_block` and `guard_halt` rows needs somewhere to land.
 *
 *   - **Protected paths.** A deny reading `guard.protectedPaths`, softened by
 *     one exemption (`FUSION_ALLOW_RULES_WRITE`) and backed by a fingerprint of
 *     every protected path taken here and compared again in `tracker.ts`, with
 *     anything that moved written back. Removed 2026-08-12: in roughly 450
 *     records across this project and its largest consumer there was no
 *     instance of the failure it existed to prevent, and it stood down in
 *     fusion's own tree — the only tree whose patterns name what they say they
 *     name — from the first public release.
 *   - **The halt (CHECK 1) and the decision-governed escalation (CHECK 3).**
 *     CHECK 1 blocked every write while a halt was active. CHECK 3 blocked a
 *     write into a path matched by `guard.categoryPaths` at `high` sensitivity
 *     and counted the block toward the halt threshold. Once the protected-path
 *     half was gone, CHECK 3 was the only thing left that could raise a halt,
 *     and it was inert in every shipped configuration layer — so the halt was
 *     reachable only through a check that shipped switched off. Both went on
 *     2026-08-16, with `lib/escalation.ts` and `clear-halt.ts` behind them. A
 *     halt flag left in a consuming project's `escalation.json` by either
 *     mechanism blocks nothing at this version; `/fusion:setup` offers to
 *     delete the file.
 *   - **The fusion-repository stand-down.** `isFusionPluginCwd()` allowed every
 *     write when the working directory was the plugin's own repository, so a
 *     fusion developer could edit the files the protected-path deny covered. It
 *     outlived that deny by four days and was standing down only the two checks
 *     above, neither of which it was built for. It went with them on
 *     2026-08-16, which is why the guard now behaves identically in this tree
 *     and in a consuming project.
 *
 * Two policies before those read the *text* of a Bash command and asked the
 * same undecidable question of it: a classifier predicting whether a command
 * was about to write a protected path (retired 2026-08-07), and a branch policy
 * predicting whether a command was about to move HEAD (deleted 2026-08-09,
 * after five patches in one afternoon, 24 consecutive false blocks against the
 * agents' own verification commands, and no recorded true positive). Nothing
 * about a Bash command has been read here since.
 *
 * Ported from fusion/reactor/pkg/guard/decision_guard.go.
 *
 * ## The verdict is still written before it is recorded
 *
 * There is no bare `allow()` after a state write anywhere below. The one site
 * that reports goes through `answer` from lib/fail-open.ts — the verdict first,
 * then the event row as a guarded report — and the diagnostic loop, which
 * cannot be moved after the verdict, goes through `bestEffort`. That ordering
 * mattered most when a report could throw away a deny; it is kept now because
 * a report that throws must not cost the hook its stdout, which is how the
 * guard exits 1 with an empty verdict and stalls the tool call. That module's
 * header carries the class, the measurements and the records.
 */
import { loadConfig } from "./lib/config.js";
import { emitEvent, setEventSession } from "./lib/events.js";
import { answer, bestEffort, failOpen } from "./lib/fail-open.js";
import { emitDispatchEvent, isDispatchTool } from "./lib/orchestrator-events.js";
/**
 * Extract the file path from tool input, if present.
 *
 * It names the file in the `guard_allow` row and nothing else reads it. An
 * absolute path is written through unchanged: normalising it to the working
 * directory served the pattern matching in CHECK 3, and a trace is more useful
 * with the path the tool was actually given.
 */
function extractFilePath(toolInput) {
    // Write and Edit use "file_path"
    if (typeof toolInput.file_path === "string") {
        return toolInput.file_path;
    }
    // NotebookEdit uses "notebook_path"
    if (typeof toolInput.notebook_path === "string") {
        return toolInput.notebook_path;
    }
    // Bash has "command" — no file path to trace
    return null;
}
function allow() {
    process.stdout.write("{}\n");
}
async function main() {
    // Read hook input from stdin
    const chunks = [];
    for await (const chunk of process.stdin) {
        chunks.push(chunk);
    }
    const raw = Buffer.concat(chunks).toString("utf-8").trim();
    if (!raw) {
        allow();
        return;
    }
    let input;
    try {
        input = JSON.parse(raw);
    }
    catch {
        allow(); // Unparseable input — nothing is loaded
        return;
    }
    // Which Claude Code session this row belongs to. Measured non-empty on both
    // tool hooks and equal to the SessionStart value within one session, so the
    // field this interface has always declared and never read is populated rather
    // than vestigial — `circles/260825-2023-presence-travels-monitor-filters-own-checkout/analyses/260825-2214-can-a-hook-obtain-the-session-identifier.md`
    // finding (c). Set once here, before the first emit below and before the
    // top-level handler can reach one; `lib/events.ts` carries why the seam is a
    // module variable rather than a parameter, and why an unresolved value makes
    // the key absent instead of empty.
    setEventSession(input.session_id);
    // The dispatch trace: a machine-written `task_start` row per sub-agent
    // dispatch. Before the config load on purpose — a dispatch is not a "guarded
    // call", so it sees no advisory and writes no guard state. The verdict goes
    // first, the row after it, same order as the write trace below.
    if (isDispatchTool(input.tool_name)) {
        answer("guard", allow, () => emitDispatchEvent("task_start", input));
        return;
    }
    // Tools this hook handles: the four write operations, which it traces, plus
    // Bash, which it allows and records nothing about. Bash is still matched here
    // rather than falling into the line below, because the config diagnostics run
    // for it — see the loop below for why that is deliberate. Everything else is
    // allowed without even loading the config.
    const writeTools = ["Write", "Edit", "MultiEdit", "NotebookEdit"];
    const isWriteTool = writeTools.includes(input.tool_name);
    const isBash = input.tool_name === "Bash";
    if (!isWriteTool && !isBash) {
        allow();
        return;
    }
    const config = loadConfig();
    // A configuration source that exists but could not be read is reported, once
    // per diagnostic, never dropped in silence. The loader stays pure and hands
    // the problems back as data; this is the one place that turns them into
    // events. Since the checks went, this loop is the whole reason the config is
    // loaded at all.
    //
    // The cost, stated rather than discovered: a project left with a broken
    // configuration file gets one advisory per guarded tool call, Bash included,
    // which is a deliberate departure from the Bash allow path's zero-side-effect
    // property (issues 260707-0750 / 260707-0751). That property protects
    // ordinary work in a CORRECTLY configured project from flooding the log; this
    // is not that, and silence here is the failure the spec rejects. The noise
    // stops when the file is fixed. A VALID project config leaves the innocuous
    // Bash path writing nothing at all, which is pinned by its own case in
    // guard-project-config-integration.test.ts.
    //
    // Best effort, and this is the one site where that is about position rather
    // than order: the diagnostic has to precede the branch below, so it cannot be
    // moved after the verdict. What `bestEffort` removes is its ability to decide
    // one — an unwritable `.guard-state/` here used to throw before any check
    // ran, and while there were still checks that cost the guard its verdict.
    for (const diagnostic of config.diagnostics) {
        bestEffort("guard", () => emitEvent("guard_advisory", input.tool_name, undefined, diagnostic));
    }
    // Bash branch: nothing is inspected, and the call is allowed.
    //
    // `hooks.json` still registers Bash on the PreToolUse matcher, and the reason
    // is the diagnostic loop above rather than anything about the shell: a
    // project whose configuration is broken hears about it on every guarded call,
    // and Bash is most of them.
    //
    // The allow is BARE, and that is the property to preserve. An innocuous Bash
    // call must have zero side-effect on guard state: it MUST NOT emit a
    // guard_allow event, because one append per Bash call floods events.jsonl and
    // buries the guard_advisory rows the monitor exists to surface (issue
    // 260707-0751). Its sibling — that Bash must not reset the consecutive-block
    // counter (issue 260707-0750) — is satisfied by there being no counter. Only
    // the write-tool path below writes a row.
    if (isBash) {
        allow();
        return;
    }
    // The write trace. The verdict is unconditional; the row is a report.
    //
    // No file path in the tool input costs the row its `file` field and nothing
    // else — `emitEvent` drops an undefined field — so a malformed write payload
    // is traced rather than dropped.
    answer("guard", allow, () => emitEvent("guard_allow", input.tool_name, extractFilePath(input.tool_input) ?? undefined));
}
main().catch((err) => {
    // Fail open on unexpected errors — don't stall the agent.
    //
    // `allow` goes first and the reporting after it. `emitEvent` appends under
    // `.guard-state/`, which is where every other write above it goes, so an I/O
    // failure there is both the likeliest cause of `err` and, while it stood
    // ahead of the verdict, the one cause the handler could not survive: it threw
    // again and the guard exited 1 with empty stdout. See `lib/fail-open.ts` for
    // the order and why each reporting step is guarded on its own.
    failOpen("guard", err, allow, () => emitEvent("guard_error", undefined, undefined, `Guard error (fail-open): ${err}`));
});
