/**
 * Compliance Guard — PreToolUse hook for Claude Code.
 *
 * Before anything else, on ALL five guarded tools, it records a fingerprint of
 * every protected path (lib/protected-snapshot.ts). `tracker.ts` takes a second
 * one after the tool ran and restores whatever changed. That pair is the guard's
 * actual protection of those paths; the checks below are the explaining refusal
 * that keeps an agent from meeting a bare failure. See the call site in `main`
 * for why the BEFORE half is a condition of admissibility rather than a nicety.
 *
 * Intercepts Write/Edit/MultiEdit tool calls and checks them against:
 *   1. Halt state — if active, block ALL writes
 *   2. Protected paths — blocked, with one exemption: FUSION_ALLOW_RULES_WRITE
 *      lets a write to a project rule path through, recorded as an advisory.
 *      See lib/rules-write-exemption.ts. The match is TEXTUAL and
 *      CASE-INSENSITIVE — unconditionally, on every platform, so the boundary
 *      does not differ by filesystem. See lib/paths.ts `matchesAnyFolded`.
 *   3. Decision-governed categories — escalated based on sensitivity
 *
 * Also intercepts Bash tool calls, for ONE policy:
 *   a. Branch policy — DENIES branch/worktree-moving git operations. git is
 *      reachable only via Bash, so every attempt an agent can make passes
 *      through here; that makes this a choke-point on the tool CALL, not a
 *      proof of impossibility. The classifier reads the command text, so a
 *      command that hides the verb from its own text (`eval '…'`,
 *      `bash -c '…'`, a `case` arm, a script the agent invokes) is not seen.
 *      See lib/git-branch-guard.ts. Runs everywhere, including in the fusion
 *      plugin's own repo.
 * There used to be a second one: a classifier that read a shell command and
 * predicted whether it was about to write a protected path. It is gone, and
 * nothing replaces it on THIS side of the tool call. What a shell does to a
 * protected path is now answered after the fact, by the fingerprint pair at the
 * top of this comment — measured rather than predicted, because "will this
 * command write?" is not decidable from the command text. Decided by the user
 * on 2026-08-07: detect afterwards instead of predicting.
 * The branch policy does not touch the Bash allow path's zero-side-effect
 * property (no counter reset, no guard_allow event) — see guardBashCommand.
 *
 * Ported from fusion/reactor/pkg/guard/decision_guard.go.
 *
 * Protocol: reads JSON from stdin, writes JSON to stdout.
 *   Allow: {}
 *   Block: {"decision":"block","reason":"..."}
 *
 * ## Every verdict is written before it is recorded
 *
 * There is no bare `block(...)` or `allow()` after a state write anywhere below.
 * Each site goes through `answer` from lib/fail-open.ts — the verdict first,
 * then the escalation counter and the event rows as guarded reports — and the
 * few reports that cannot be moved after the verdict go through `bestEffort`.
 * Four denies used to be discarded by a throw in their own bookkeeping and
 * replaced with the fail-open ALLOW; that module's header carries the class, the
 * measurements and the records.
 */
import { resolve } from "node:path";
import { existsSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { matchesAnyFolded, collapseSegments } from "./lib/paths.js";
import { projectRelative } from "./lib/project-relative.js";
import { isFusionPluginCwd } from "./lib/self-detect.js";
import { realFsLocator } from "./lib/fs-locator.js";
import { loadConfig, findRelevantDecisions, projectDeclaredProtectedPaths, sensitivityLevel, } from "./lib/config.js";
import { loadEscalation, saveEscalation, isHalted, recordBlock, resetBlockCounter, clearHaltCommand, } from "./lib/escalation.js";
import { emitEvent } from "./lib/events.js";
import { answer, bestEffort, failOpen } from "./lib/fail-open.js";
import { measurementRoot, saveSnapshot, takeSnapshot, } from "./lib/protected-snapshot.js";
import { classifyGitCommand, overridesFromEnv, overrideEnvFor, } from "./lib/git-branch-guard.js";
import { isProjectRulePath, rulesWriteDetail, rulesWriteExemptionActive, rulesWriteRefusalNote, } from "./lib/rules-write-exemption.js";
/**
 * Real filesystem + git-ref resolver for the ambiguous bare-`git checkout
 * <target>` form. Resolves paths and refs in the effective cwd (process cwd
 * plus any `-C <dir>` global options, applied in order — the same directory
 * git itself would use). Fails safe: any error → treat as "not a path / not a
 * ref", which fails the ALLOW conditions and lets the classifier deny.
 */
function effectiveCwd(cwdHints) {
    let dir = process.cwd();
    for (const hint of cwdHints)
        dir = resolve(dir, hint);
    return dir;
}
const checkoutResolver = {
    pathExists(target, cwdHints) {
        try {
            return existsSync(resolve(effectiveCwd(cwdHints), target));
        }
        catch {
            return false;
        }
    },
    isRef(target, cwdHints) {
        try {
            // Exit 0 (+ prints the resolved object) iff target is a valid ref/object.
            // stdio ignored; execFileSync throws on any non-zero exit → not a ref.
            execFileSync("git", ["-C", effectiveCwd(cwdHints), "rev-parse", "--verify", "--quiet", target], { stdio: "ignore" });
            return true;
        }
        catch {
            return false;
        }
    },
};
/**
 * The real filesystem the rules-write exemption's second gate consults —
 * symlinks, path folding and hard links, rooted at the project. Built once per
 * process, next to `checkoutResolver`, for the same reason: the modules that
 * decide policy stay pure and this file owns the environment.
 */
const fsLocator = realFsLocator(process.cwd());
/**
 * Is this a rule path the FUSION_ALLOW_RULES_WRITE flag exempts?
 *
 * TWO spellings, and both are load-bearing. `path` is the collapsed,
 * project-relative one the exempt set is computed on; `spelledAs` is what the
 * tool call actually said, which is the only place a `..` still exists by the
 * time either surface can match a path against `rules/**` at all. Gate 0 reads
 * the second one — see `rules-write-exemption.ts` `## Gate 0`. Passing `path`
 * for both would type-check and silently reopen the escape.
 *
 * `declared` is what THIS PROJECT wrote in its own `fusion-guard.json`, and it
 * comes from `projectDeclaredProtectedPaths` and from nowhere else. Handing over
 * `config.guard.protectedPaths` would compile and would end the exemption in
 * every project on earth: an omitted list inherits the plugin's, and the
 * plugin's contains `rules/**`. Decision `260803-1314` and gate 1b.
 *
 * Three arguments in a row rather than a curried form: the write path's call is
 * the one a reader checks against the rule, and it reads best that way. A
 * retired Bash mutation classifier used to take this as a two-argument closure
 * — that seam is gone, and the measurement side asks its own, narrower question
 * through `isObservedRulePath` instead.
 */
function isExemptRulePath(path, spelledAs, declared) {
    return isProjectRulePath(path, fsLocator, spelledAs, declared);
}
/**
 * Why the exemption refused this path, as a sentence to append to a deny
 * reason — or null when there is nothing to add.
 *
 * Null whenever the flag is unset, so a project that never uses the exemption
 * sees the deny it has always seen. Null too when the path is not a rule path
 * at all: the protected-path message is already complete for `agents/coder.md`,
 * and an exemption note there would advertise a grant that does not apply.
 *
 * Asked ONLY while a deny is being rendered, which is what makes it free: the
 * gates run a second time, on the one call in a session that was going to stop
 * anyway. The alternative — carrying the refusal out of the first evaluation —
 * would put a diagnostic field on the exemption seam that every allow pays for.
 */
function exemptionRefusalNote(path, spelledAs, declared) {
    if (!rulesWriteExemptionActive(process.env))
        return null;
    return rulesWriteRefusalNote(path, fsLocator, spelledAs, declared);
}
/**
 * Normalize a file path to the coordinate space `guard.protectedPaths` is
 * written in — this process's working directory.
 *
 * The arithmetic lives in `lib/project-relative.ts`, where it can be asked about
 * a working directory other than this process's own; this wrapper supplies the
 * one this process has. Claude Code sends absolute paths in
 * `tool_input.file_path`, so that is what arrives here.
 */
function normalizeToRelative(filePath) {
    return projectRelative(filePath, process.cwd());
}
/** Extract the file path from tool input, if present. */
function extractFilePath(toolInput) {
    // Write and Edit use "file_path"
    if (typeof toolInput.file_path === "string") {
        return toolInput.file_path;
    }
    // NotebookEdit uses "notebook_path"
    if (typeof toolInput.notebook_path === "string") {
        return toolInput.notebook_path;
    }
    // Bash has "command" — no file path to guard
    return null;
}
/** Determine if a change category should escalate at a given sensitivity. */
function shouldEscalate(sensitivity) {
    // Only block on high sensitivity. Low and medium emit advisory events
    // (logged by the tracker) but allow the write through.
    return sensitivity === "high";
}
function allow() {
    process.stdout.write("{}\n");
}
function block(reason) {
    process.stdout.write(JSON.stringify({ decision: "block", reason }) + "\n");
}
/**
 * Longest command or segment a detail string carries. Beyond this the reader
 * has what they need to recognise the call, and `events.jsonl` stays a log
 * rather than a transcript.
 */
const EVENT_DETAIL_MAX = 200;
/**
 * Fold a command or segment into one bounded line fit for an event detail.
 *
 * `emitEvent` serialises through `JSON.stringify`, so a newline could not break
 * the JSONL framing — it would arrive as a literal `\n` inside the string. The
 * collapse is for the reader and for the monitor's single-line row, not for the
 * file format. Truncation is what keeps an unbounded operand list out of the
 * log.
 */
function forEvent(text) {
    const oneLine = text.replace(/\s+/g, " ").trim();
    return oneLine.length <= EVENT_DETAIL_MAX
        ? oneLine
        : `${oneLine.slice(0, EVENT_DETAIL_MAX - 1)}…`;
}
/**
 * Emit the event for a `recordBlock` outcome: `guard_block`, or `guard_halt`
 * when THIS block is the one that raised the halt.
 *
 * ## Why the call sites share one function
 *
 * `guard_halt` reaches `events.jsonl` from two kinds of place — the write-tool
 * halt (CHECK 1) and a `recordBlock` that tripped the threshold. The monitor
 * renders both into one row type, so a reader reconstructing a stalled session
 * sees a run of identical-looking rows and has to guess which surface produced
 * each.
 *
 * They now say which they are, in the detail:
 *
 *   - `Halt active — write tool call blocked`     (a halted guard refusing a write)
 *   - `Halt raised by this block — <cause>`       (the block that turned the halt on)
 *
 * A third prefix, `Halt active — mutating Bash command blocked: <segment>`, is
 * no longer written by anything: the halt stopped reaching the shell when the
 * mutation classifier was retired. Historical rows in an existing
 * `events.jsonl` still carry it, which is why the monitor keeps rendering it.
 *
 * The last prefix is what this function adds. Writing it inline at each of the
 * four sites would mean four copies of one conditional, each free to drift; the
 * distinction is a property of the block/halt pair, so it lives with the pair.
 * The non-halt detail is passed through UNCHANGED, so an ordinary `guard_block`
 * row reads exactly as it always has.
 */
function emitBlockEvent(halted, tool, file, detail) {
    emitEvent(halted ? "guard_halt" : "guard_block", tool, file, halted ? `Halt raised by this block — ${detail}` : detail);
}
/**
 * Guard a Bash tool call against the one shell policy. Two outcomes are
 * sequenced, in this order:
 *
 *   1. GIT DENY. Classify the command (segmenting on ; && || | and inspecting
 *      subshells) and DENY any branch/worktree-moving git operation the env
 *      overrides do not cover. This runs first and returns, so at most one block
 *      is recorded per tool call. Recording two would double-count the
 *      consecutive-block counter that drives the halt.
 *   3. OVERRIDE ALLOW. Once the deny has passed, the override-used note is
 *      recorded and the call allowed.
 *
 * The step numbering skips 2 on purpose. A protected-path deny used to sit
 * there, reading the command text to predict which files it was about to write,
 * and a 2b recorded the FUSION_ALLOW_RULES_WRITE exemption that deny had
 * granted. Both are gone with the classifier: the protected paths are measured
 * after the call now (`lib/protected-snapshot.ts` + `tracker.ts`), and the
 * exemption is asked there, of a path that has actually changed, by
 * `isObservedRulePath`. The gap in the numbering is a marker, so a reader who
 * finds "step 3" in a comment elsewhere is not hunting for a step 2 that was
 * silently renumbered away.
 *
 * The innocuous allow path stays free of ALL write-guard bookkeeping.
 *
 * THE HALT IS NOT ONE OF THE OUTCOMES. A halted guard blocks the four write
 * tools and lets the shell through, because deciding whether a command mutates
 * anything is the same undecidable question the retired policy asked. What a
 * halt no longer does is stop `rm notes.txt` from running; the user confirmed
 * that cost explicitly on 2026-08-07, accepting the loss of the Bash halt on the
 * shell as the price of dropping the classifier. The protected paths
 * themselves are not left to the halt — they are measured after every tool call
 * and restored, halt or no halt.
 */
function guardBashCommand(input, config) {
    const command = typeof input.tool_input.command === "string"
        ? input.tool_input.command
        : "";
    const overrides = overridesFromEnv(process.env);
    const verdict = classifyGitCommand(command, overrides, checkoutResolver);
    // STEP 1 — git deny: a branch/worktree-moving git op with no override.
    // Returns, so exactly one block is recorded per tool call. An override does
    // NOT reach here: it leaves verdict.deny false and is handled at step 3.
    if (verdict.deny) {
        const reason = verdict.reason ??
            "fusion policy: agents never switch git branches autonomously.";
        // Loaded and mutated IN MEMORY ahead of the deny, and persisted after it.
        // Neither call touches the filesystem for writing — `loadEscalation`
        // coerces whatever it finds, including nothing — so the deny below cannot
        // be lost to them, while `halted` is still available to the event row.
        const escalation = loadEscalation();
        const halted = recordBlock(escalation, config.escalation.blocksBeforeHalt, "git_branch_switch", reason, "Bash", verdict.offendingSegment);
        // The branch policy is the one policy that runs in EVERY repository, this
        // one included, and with `.guard-state/` unwritable it used to allow the
        // switch it had just decided to refuse (`260809-2046`).
        answer("guard", () => block(reason), () => saveEscalation(escalation), () => emitBlockEvent(halted, "Bash", undefined, `Git branch-switch denied: ${forEvent(verdict.offendingSegment ?? command)}`));
        return;
    }
    // STEP 3 — override note: a normally-denied git op that an env flag allowed.
    // Recorded here rather than at step 1 so the note is written only for a call
    // that actually goes through.
    //
    // Not a deny — it emits the same allow() as the path below. It is also the one
    // conditional on this path that writes state without blocking, and it is
    // reachable ONLY when the user set an override, so an innocuous Bash call
    // still touches nothing.
    //
    // It RETURNS rather than falling through, and the return is what keeps the
    // final statement of this function a bare `allow()` — the textual form of
    // "an innocuous Bash call touches nothing", pinned by guard-bash-wiring.
    // The allow is written before the note, for the reason every other site here
    // writes its verdict first: an unwritable `.guard-state/` costs the note and
    // not the reply.
    if (verdict.overrideUsed && verdict.overrideKind) {
        const envVar = overrideEnvFor(verdict.overrideKind);
        const detail = `Override ${envVar} allowed normally-denied git op: ${verdict.overrideSegment ?? command}`;
        // Record the override in guard-state for visibility (same state surface
        // the block path writes to — recentEvents in escalation.json + events.jsonl).
        answer("guard", allow, () => {
            const escalation = loadEscalation();
            escalation.recentEvents.push({
                level: "clear",
                trigger: "git_branch_switch_override",
                message: detail,
                timestamp: new Date().toISOString(),
                toolName: "Bash",
            });
            saveEscalation(escalation);
        }, () => emitEvent("guard_advisory", "Bash", undefined, detail));
        return;
    }
    // Allow path: not a branch/worktree-moving git op the overrides left denied.
    // Both branches above RETURN, and each writes state only in the case it was
    // written for — step 1 when the classifier denies, step 3 when the user set an
    // override. So reaching this point means neither ran, and the call
    // participates in NONE of the write-guard bookkeeping. An innocuous Bash call
    // (ls, git status, an allowed `git checkout HEAD -- <files>`) must have zero
    // side-effect on guard state:
    //   - It MUST NOT reset the consecutive-block counter. Agents run Bash
    //     constantly between write attempts; resetting here would let any
    //     interleaved Bash zero the counter and defeat the write/branch halt
    //     escalation (see issue 260707-0750).
    //   - It MUST NOT emit a guard_allow event. One append per Bash call floods
    //     events.jsonl and buries the guard_block/guard_halt/guard_advisory
    //     entries the monitor exists to surface (see issue 260707-0751).
    // Only genuine forward progress on the guarded write surface (the write-tool
    // allow path below) resets the counter and emits guard_allow.
    allow();
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
        allow(); // Unparseable input — fail open
        return;
    }
    // Tools this guard inspects: write operations + Bash (for the git
    // branch-switch and protected-path policies). Everything else is allowed
    // unconditionally.
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
    // events.
    //
    // ABOVE the `enabled` check on purpose. A diagnostic says one layer of the
    // configuration was discarded, so the effective config — INCLUDING whether the
    // guard is on at all — is not the one the user wrote. That is exactly when
    // they need to hear about it.
    //
    // The cost, stated rather than discovered: a project left with a broken
    // `fusion-guard.json` gets one advisory per guarded tool call, Bash included,
    // which is a deliberate departure from the Bash allow path's zero-side-effect
    // property (issues 260707-0750 / 260707-0751). Those protect ordinary work in
    // a CORRECTLY configured project from flooding the log; this is not that, and
    // silence here is the failure the spec rejects. The noise stops when the file
    // is fixed. A VALID project config leaves the innocuous Bash path writing
    // nothing at all, which is pinned by its own case in
    // guard-rules-write-integration.test.ts.
    //
    // No escalation entry and no counter movement: a diagnostic is a diagnostic,
    // not an exemption and not a violation.
    //
    // Best effort, and this is the one site where that is about position rather
    // than order. The diagnostic has to precede every branch — it says the
    // effective configuration is not the one the user wrote, which is exactly what
    // the branches below decide on — so it cannot be moved after a verdict. What
    // `bestEffort` removes is its ability to DECIDE one: an unwritable
    // `.guard-state/` here used to throw before any check ran, and a protected
    // path was then allowed because the guard could not log a note about a broken
    // config file.
    for (const diagnostic of config.diagnostics) {
        bestEffort("guard", () => emitEvent("guard_advisory", input.tool_name, undefined, diagnostic));
    }
    // Guard disabled
    if (!config.guard.enabled) {
        allow();
        return;
    }
    // THE BEFORE-FINGERPRINT. One record of what every protected path currently
    // holds, so `tracker.ts` can tell afterwards what THIS tool call changed.
    //
    // This is not a second hook. It is the PreToolUse hook that already runs on
    // all five guarded tools, taking one more reading before it decides anything.
    //
    // ## It is the condition of admissibility, not a refinement
    //
    // Without it the measurement would have nothing to compare against but
    // `HEAD`, and it would revert every protected path that differs from `HEAD` —
    // including a rule file the human is editing in their own editor at that
    // moment. The guard would destroy human work on an unrelated tool call. With
    // it, only the difference this one call produced is ever touched.
    //
    // ## Above every branch
    //
    // Because all five tools can reach a protected path and the cheapest correct
    // rule is "always have a before-picture". A denied call simply leaves a
    // snapshot nobody compares against, which costs one file write.
    //
    // ## The root is `measurementRoot()`, not `process.cwd()`
    //
    // The patterns are project-relative, so they have to be matched against the
    // project — the workbench root the configuration already walks up to — and not
    // against wherever the session happened to start. Anchored at cwd, a session
    // one directory below the root watched nothing the project's list named. That
    // function also owns both stand-downs (no workbench, and the plugin's own
    // repository), so a null root here means "no measurement" for either reason;
    // its header carries the full argument and the measured evidence.
    //
    // ## Not a report, and deliberately NOT guarded
    //
    // A sweep for "what runs before a verdict here" finds this line, so what was
    // checked about it belongs next to it. It is not a record of a decision — it
    // is the input to the NEXT hook's decision, and it has to precede the tool
    // call by construction. It also cannot throw: `saveSnapshot` swallows its own
    // I/O failure by design, and `takeSnapshot` catches per directory and per
    // path, over patterns the loader has already validated as strings
    // (`isStringArray` in lib/config.ts).
    //
    // Wrapping it in `bestEffort` anyway would be wrong rather than merely
    // redundant. `saveSnapshot`'s catch does one thing a caller's catch could not:
    // it REMOVES the stale snapshot, so a failed save leaves no before-picture
    // instead of the previous call's. Swallowing the failure one level up would
    // hand `tracker.ts` a picture two calls old and revert a state no measurement
    // objected to — `260809-1108`, traded back for the fail-open this file just
    // closed.
    const measureRoot = measurementRoot();
    if (measureRoot !== null) {
        saveSnapshot(takeSnapshot(measureRoot, config.guard.protectedPaths));
    }
    // Bash branch: the git branch-switch policy, and nothing else. See the header
    // for what that does and does not bound.
    //
    // It runs unconditionally when the guard is enabled — INCLUDING in the fusion
    // plugin's own repo. This hook only ever gated the AGENT's Bash tool calls; a
    // human developer switches branches in their own terminal, which the hook
    // never sees. Standing the branch policy down for the plugin repo therefore
    // removed agent protection for zero human benefit (the branch-switch hole).
    // The override env vars (FUSION_ALLOW_BRANCH_SWITCH / FUSION_ALLOW_WORKTREE)
    // remain the deliberate escape hatch for a fusion developer who genuinely
    // wants an agent to switch branches here.
    //
    // The write-guard half of the Bash surface is no longer here at all: what a
    // shell did to a protected path is measured by the fingerprint pair above and
    // in `tracker.ts`, and THAT is what stands down in this repo.
    if (isBash) {
        guardBashCommand(input, config);
        return;
    }
    // Self-detect: if cwd is the fusion plugin's own repo, stand the WRITE guard
    // down. The protected paths (agents/**, rules/**, plugin.json, etc.) are the
    // very files a fusion developer needs to edit. Only write tools reach here —
    // the branch-switch policy above already ran and is intentionally NOT disabled.
    if (isFusionPluginCwd()) {
        answer("guard", allow, () => emitEvent("guard_allow", input.tool_name, extractFilePath(input.tool_input) ?? undefined, "Self-detect: cwd is fusion plugin repo — write guard standing down"));
        return;
    }
    const rawFilePath = extractFilePath(input.tool_input);
    if (!rawFilePath) {
        allow(); // No file path to guard
        return;
    }
    // Normalize absolute paths to relative (so glob patterns in config match),
    // then COLLAPSE `.` and `..` before either check reads the path.
    //
    // The collapse is not cosmetic and it is not only the exemption's business.
    // `normalizeToRelative` used to return a relative input UNCHANGED, and
    // `matchesAny` compiles a glob to a regex over the path's text, so CHECK 2
    // used to compare the raw spelling against the protected list:
    // `agents/coder.md` denied while `./agents/coder.md` and
    // `x/../agents/coder.md` allowed, writing the same file. That was the whole
    // protected list bypassable with a two-character prefix, and it was the
    // strictly worse half of the input class the exemption had already been taught
    // to collapse — `rules/../agents/coder.md` denied only by accident, because
    // `rules/**` happens to match its text.
    //
    // `normalizeToRelative` now resolves a relative input as well (`260804-1604`),
    // which collapses the same class one step earlier. The line below STAYS, and
    // not as belt and braces: the resolve answers a DIFFERENT question — which
    // directory the path hangs off — and it hands back an absolute path whenever
    // the answer is "not this one". Only this collapse guarantees that the
    // spelling CHECK 2 and the exemption both read is the narrowest text naming
    // the target, in the outside-the-tree case as well as the inside one.
    //
    // One collapse, one place, above both checks: the protected set and the
    // exempt set are read off the same spelling, and neither can be argued into a
    // different answer by rewriting the path. The exemption then applies its own
    // narrowing (the trailing-separator strip) on top, which is a grant-side step
    // and must not happen here — see `collapseSegments` in lib/paths.ts for why
    // shrinking the protected spelling would lose a deny.
    //
    // This widens the DENY side. A spelling that silently allowed now blocks.
    const filePath = collapseSegments(normalizeToRelative(rawFilePath));
    const escalation = loadEscalation();
    // CHECK 1: Halt mode — block everything
    if (isHalted(escalation)) {
        // The `cd` is not decoration. The halt is recorded in THIS project and the
        // clearing script finds it by walking up from its own working directory, so
        // a plugin-scoped command run from anywhere else reports "not halted" and
        // changes nothing — see `clearHaltCommand` in lib/escalation.ts.
        const reason = "[HALTED] All write operations blocked. " +
            "The guard has been halted after repeated violations. " +
            "The halt is recorded per project and the clearing script finds it by " +
            "walking up from its working directory, so the `cd` is part of the " +
            `command: ${clearHaltCommand()}`;
        // Names its surface, so a reader scanning a run of guard_halt rows can tell
        // this apart from the Bash halt and from a block that RAISED the halt. The
        // path is already the event's file field; repeating it here would only make
        // the row longer.
        //
        // This check is the one site in the class whose fail-open ran through
        // `emitEvent` rather than `saveEscalation` — measured at `{}` on a HALTED
        // project with `.guard-state/` at mode `0555`. It is the same defect through
        // a different call, which is why `260809-1825`'s enumeration by call name
        // was one site short of its own shape.
        answer("guard", () => block(reason), () => emitEvent("guard_halt", input.tool_name, filePath, "Halt active — write tool call blocked"));
        return;
    }
    // CHECK 2: Protected paths — blocked, with exactly ONE exemption.
    //
    // `matchesAnyFolded`, not `matchesAny`: the match folds case on both sides.
    // A glob compiles to a case-SENSITIVE regex, so `AGENTS/coder.md` missed
    // `agents/**` and wrote `agents/coder.md` on any case-insensitive filesystem
    // — the whole protected list, one letter. The exemption below keeps the
    // case-sensitive `matchesAny`, because folding a GRANT widens it. See
    // `matchesAnyFolded` in lib/paths.ts.
    if (matchesAnyFolded(filePath, config.guard.protectedPaths)) {
        // THE RULES-WRITE EXEMPTION. Both halves must hold: the user deliberately
        // set FUSION_ALLOW_RULES_WRITE, and the path is one of the rule paths that
        // flag names. lib/rules-write-exemption.ts owns the boundary — it
        // canonicalises the path lexically AND resolves it against the real
        // filesystem, because a grant read off text alone is spendable on a symlink
        // planted inside the rule directory. The measurement side asks the same
        // module its own, narrower question (`isObservedRulePath`), so a
        // security-relevant rule is not written twice, once per surface, and cannot
        // drift apart.
        //
        // Three properties a later editor must not break:
        //
        //   1. CHECK 1 STAYS ABOVE THIS. A halted guard blocks an exempted write
        //      like every other write. The flag grants exactly one permission, the
        //      way the two git overrides do, and lifting a halt is not it. Moving
        //      this branch above the halt check — or clearing the halt here — would
        //      turn the flag into a way out of halt.
        //   2. ONE SAVE PER CALL. The note is pushed into the IN-MEMORY escalation
        //      object and nothing more. Every path out of here persists it exactly
        //      once: CHECK 3's block, and the ordinary allow that CHECK 3's
        //      advisory and its no-match route both fall into. A saveEscalation at
        //      this site would write the file twice for one tool call.
        //   3. IT WAIVES THIS CHECK AND NOTHING ELSE. Execution falls through to
        //      CHECK 3, which still governs the write, and then to the allow path,
        //      which resets the consecutive-block counter and emits guard_allow. So
        //      one exempted Edit produces guard_advisory FOLLOWED BY guard_allow,
        //      not guard_advisory alone.
        //   4. THE EXEMPTION IS ASKED ABOUT THE RAW SPELLING TOO. `filePath` above
        //      is collapsed, and the collapse deletes the component that precedes a
        //      `..` — including a symlink planted in the rule directory, whose
        //      whole effect is to make the write land somewhere the collapsed
        //      string does not name. Gate 0 therefore reads `rawFilePath`, the last
        //      place the spelling still exists. Handing `filePath` twice would
        //      compile and reopen the escape in silence.
        //   5. THE PROJECT'S OWN DECLARED ENTRIES OUTRANK THE FLAG. `declared` is
        //      what this project wrote in its `fusion-guard.json`, and gate 1b in
        //      the exemption module refuses the grant for anything it names
        //      (decision 260803-1314). It must not be `config.guard.protectedPaths`:
        //      an omitted list inherits the plugin's, which contains `rules/**`, so
        //      that spelling would end the exemption everywhere and look right.
        const declared = projectDeclaredProtectedPaths(config);
        const exempted = rulesWriteExemptionActive(process.env) &&
            isExemptRulePath(filePath, rawFilePath, declared);
        if (!exempted) {
            // The note is empty for every deny in a project that does not use the
            // flag, and for every path the flag was never about — so this is the
            // message it has always been, plus a cause when there is one to name.
            // Measured before it existed: `Edit rules/retired/../x.md` with the flag
            // SET reported `Protected path: rules/x.md`, naming a file the same flag
            // does let the agent write, with nothing about the spelling that refused
            // it. The reason string is also what `recordBlock` stores, so the
            // escalation record carries the cause too.
            const note = exemptionRefusalNote(filePath, rawFilePath, declared);
            const reason = `Protected path: ${filePath} cannot be modified directly. This path is under compliance guard protection.` +
                (note === null ? "" : ` ${note}`);
            // In memory, both of them. The persistence is a report below, so the deny
            // this call has already reached cannot be lost to it — measured allowing a
            // protected-path Edit with `.guard-state/` at mode `0555` (`260809-1825`).
            const halted = recordBlock(escalation, config.escalation.blocksBeforeHalt, "protected_path", reason, input.tool_name, filePath);
            answer("guard", () => block(reason), () => saveEscalation(escalation), () => emitBlockEvent(halted, input.tool_name, filePath, "Protected path"));
            return;
        }
        // Same note the git override records at guardBashCommand STEP 3: one
        // clear-level escalation entry naming the variable and what it let through,
        // and one guard_advisory carrying the same string. This one also carries the
        // path, in both the entry and the event, because a rules-write exemption
        // always has one and a branch override does not.
        const detail = rulesWriteDetail([filePath]);
        escalation.recentEvents.push({
            level: "clear",
            trigger: "rules_write_exemption",
            message: detail,
            timestamp: new Date().toISOString(),
            toolName: input.tool_name,
            filePath,
        });
        // Best effort in place, for the same reason as the config diagnostics: the
        // verdict is still two checks away, so there is nothing to write first — but
        // a failed advisory must not decide what CHECK 3 and the allow path are
        // about to decide.
        bestEffort("guard", () => emitEvent("guard_advisory", input.tool_name, filePath, detail));
    }
    // CHECK 3: Decision-governed categories
    const relevant = findRelevantDecisions(filePath, config);
    if (relevant.length > 0) {
        // Find highest sensitivity among matched categories
        let highestSensitivity = config.guard.defaultSensitivity;
        for (const d of relevant) {
            const catSens = config.guard.categorySensitivity[d.category];
            if (catSens && sensitivityLevel(catSens) > sensitivityLevel(highestSensitivity)) {
                highestSensitivity = catSens;
            }
        }
        if (shouldEscalate(highestSensitivity)) {
            const decisionList = relevant
                .map((d) => `  [${d.id}] ${d.category}: ${d.statement}`)
                .join("\n");
            const reason = `Modification to ${filePath} affects area governed by ${relevant.length} decision(s):\n` +
                `${decisionList}\n\n` +
                `Sensitivity: ${highestSensitivity}. Review the decision(s) above before proceeding.`;
            const halted = recordBlock(escalation, config.escalation.blocksBeforeHalt, "decision_governed", reason, input.tool_name, filePath);
            answer("guard", () => block(reason), () => saveEscalation(escalation), () => emitBlockEvent(halted, input.tool_name, filePath, `Decision: ${relevant.map((d) => d.id).join(", ")}`));
            return;
        }
        // Low/medium sensitivity: emit advisory event but allow the write
        if (highestSensitivity !== "none") {
            bestEffort("guard", () => emitEvent("guard_advisory", input.tool_name, filePath, `Advisory (${highestSensitivity}): ${relevant.map((d) => d.id).join(", ")}`));
        }
    }
    // ALLOW — no rule matched, reset consecutive blocks.
    //
    // The counter reset is in memory; persisting it and logging the allow are
    // reports. An unwritable state directory here costs the reset and the row, and
    // the call is still allowed — which is what it was going to be, so unlike the
    // three denies above nothing about the verdict moves. It goes through `answer`
    // all the same: one rule for every site is what stops the next reader having
    // to work out which sites were exceptions and why.
    resetBlockCounter(escalation);
    answer("guard", allow, () => saveEscalation(escalation), () => emitEvent("guard_allow", input.tool_name, filePath));
}
main().catch((err) => {
    // Fail open on unexpected errors — don't block the agent.
    //
    // `allow` goes first and the reporting after it. `emitEvent` appends under
    // `.guard-state/`, which is where nearly every write above it goes, so an I/O
    // failure there is both the likeliest cause of `err` and, while it stood ahead
    // of the verdict, the one cause the handler could not survive: it threw again
    // and the guard exited 1 with empty stdout. See `lib/fail-open.ts` for the
    // order and why each reporting step is guarded on its own.
    failOpen("guard", err, allow, () => emitEvent("guard_error", undefined, undefined, `Guard error (fail-open): ${err}`));
});
