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
 * It also RECEIVES Bash tool calls, and inspects them for nothing at all. Two
 * policies used to read the command text here, and both asked the same
 * undecidable question of the same input:
 *   - a classifier that predicted whether a command was about to write a
 *     protected path. Retired 2026-08-07; what a shell does to a protected path
 *     is now answered after the fact, by the fingerprint pair at the top of this
 *     comment — measured rather than predicted.
 *   - a branch policy that predicted whether a command was about to move HEAD.
 *     Deleted 2026-08-09 by the same reasoning, and on its own record: five
 *     patches in one afternoon, each closing a measured entrance and revealing
 *     the next, 24 consecutive false blocks against the agents' own verification
 *     commands, and no recorded true positive in its whole history.
 * A Bash call therefore reaches the before-fingerprint and then allows,
 * participating in NO write-guard bookkeeping (no counter reset, no
 * guard_allow event).
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
import { matchesAnyFolded, collapseSegments } from "./lib/paths.js";
import { projectRelative } from "./lib/project-relative.js";
import { isFusionPluginCwd } from "./lib/self-detect.js";
import { realFsLocator } from "./lib/fs-locator.js";
import { loadConfig, findRelevantDecisions, projectDeclaredProtectedPaths, sensitivityLevel, } from "./lib/config.js";
import { loadEscalation, saveEscalation, isHalted, recordBlock, resetBlockCounter, clearHaltCommand, } from "./lib/escalation.js";
import { emitEvent } from "./lib/events.js";
import { answer, bestEffort, failOpen } from "./lib/fail-open.js";
import { measurementRoot, saveSnapshot, takeSnapshot, } from "./lib/protected-snapshot.js";
import { isProjectRulePath, rulesWriteDetail, rulesWriteExemptionActive, rulesWriteRefusalNote, } from "./lib/rules-write-exemption.js";
/**
 * The real filesystem the rules-write exemption's second gate consults —
 * symlinks, path folding and hard links, rooted at the project. Built once per
 * process, for the reason this file builds every such object: the modules that
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
 * The last prefix is what this function adds. Writing it inline at each site
 * would mean a copy of one conditional per site, each free to drift; the
 * distinction is a property of the block/halt pair, so it lives with the pair.
 * The non-halt detail is passed through UNCHANGED, so an ordinary `guard_block`
 * row reads exactly as it always has.
 */
function emitBlockEvent(halted, tool, file, detail) {
    emitEvent(halted ? "guard_halt" : "guard_block", tool, file, halted ? `Halt raised by this block — ${detail}` : detail);
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
    // Tools this guard handles: the four write operations, which it decides, plus
    // Bash, which it only fingerprints protected paths around. Everything else is
    // allowed unconditionally.
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
    // Bash branch: nothing is inspected, and the call is allowed.
    //
    // Bash is here for the before-fingerprint above and for nothing else. A shell
    // reaches protected paths like any other tool, so it needs a before-picture;
    // what it then DID to them is answered by `tracker.ts` afterwards. Both
    // policies that used to read the command text at this point are deleted — see
    // the file header for which, and why the question they shared is not
    // answerable from that input.
    //
    // The allow is BARE, and that is the property to preserve. An innocuous Bash
    // call must have zero side-effect on guard state:
    //   - It MUST NOT reset the consecutive-block counter. Agents run Bash
    //     constantly between write attempts; resetting here would let any
    //     interleaved Bash zero the counter and defeat the write-halt escalation
    //     (see issue 260707-0750).
    //   - It MUST NOT emit a guard_allow event. One append per Bash call floods
    //     events.jsonl and buries the guard_block/guard_halt/guard_advisory
    //     entries the monitor exists to surface (see issue 260707-0751).
    // Only genuine forward progress on the guarded write surface (the write-tool
    // allow path below) resets the counter and emits guard_allow.
    //
    // THE HALT DOES NOT REACH HERE either. A halted guard blocks the four write
    // tools and lets the shell through, because deciding whether a command
    // mutates anything is the same undecidable question both retired policies
    // asked. What a halt does not do is stop `rm notes.txt` from running; the user
    // confirmed that cost explicitly on 2026-08-07. The protected paths
    // themselves are not left to the halt — they are measured after every tool
    // call and restored, halt or no halt.
    if (isBash) {
        allow();
        return;
    }
    // Self-detect: if cwd is the fusion plugin's own repo, stand the WRITE guard
    // down. The protected paths (agents/**, rules/**, plugin.json, etc.) are the
    // very files a fusion developer needs to edit. Only write tools reach here —
    // Bash returned above, having decided nothing either way.
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
        // this apart from a block that RAISED the halt, and from the historical
        // Bash-halt rows an older `events.jsonl` still carries. The path is already
        // the event's file field; repeating it here would only make the row longer.
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
        // One clear-level escalation entry naming the variable and what it let
        // through, and one guard_advisory carrying the same string. Both carry the
        // path, because a rules-write exemption always has one.
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
