/**
 * Compliance Guard — PreToolUse hook for Claude Code.
 *
 * Intercepts Write/Edit/MultiEdit/NotebookEdit tool calls and checks them
 * against TWO things:
 *   1. Halt state — if active, block ALL writes until a human clears it
 *   2. Decision-governed categories — escalated based on sensitivity
 *
 * There used to be a third, between them: a protected-path deny reading
 * `guard.protectedPaths`, softened by one exemption (`FUSION_ALLOW_RULES_WRITE`)
 * and backed by a fingerprint of every protected path taken here and compared
 * again in `tracker.ts`. The whole half was removed on 2026-08-12. It is named
 * here because its absence is the thing a reader of an older tree, an older
 * README or an existing `events.jsonl` will come looking for: in roughly 450
 * records across this project and its largest consumer there was no instance of
 * the failure it existed to prevent, and it stood down in fusion's own tree —
 * the only tree whose patterns name what they say they name — from the first
 * public release. What it cost was 53 records in one consumer that exist only
 * because agents may not write files that project owns.
 *
 * A halt raised by that mechanism in a consuming project still blocks at CHECK 1
 * and still clears through `clear-halt.js`; that migration path is pinned by
 * `lib/__tests__/legacy-halt-clearing.test.ts`.
 *
 * It also RECEIVES Bash tool calls, and inspects them for nothing at all. Two
 * policies used to read the command text here, and both asked the same
 * undecidable question of the same input:
 *   - a classifier that predicted whether a command was about to write a
 *     protected path. Retired 2026-08-07 in favour of the measurement that has
 *     since been removed with it.
 *   - a branch policy that predicted whether a command was about to move HEAD.
 *     Deleted 2026-08-09 by the same reasoning, and on its own record: five
 *     patches in one afternoon, each closing a measured entrance and revealing
 *     the next, 24 consecutive false blocks against the agents' own verification
 *     commands, and no recorded true positive in its whole history.
 * A Bash call therefore allows immediately, participating in NO write-guard
 * bookkeeping (no counter reset, no guard_allow event). It now allows without
 * touching guard state at all; while the measurement existed it first wrote a
 * fingerprint file.
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
import { collapseSegments } from "./lib/paths.js";
import { projectRelative } from "./lib/project-relative.js";
import { isFusionPluginCwd } from "./lib/self-detect.js";
import { loadConfig, findRelevantDecisions, sensitivityLevel, } from "./lib/config.js";
import { loadEscalation, saveEscalation, isHalted, recordBlock, resetBlockCounter, clearHaltCommand, } from "./lib/escalation.js";
import { emitEvent } from "./lib/events.js";
import { answer, bestEffort, failOpen } from "./lib/fail-open.js";
/**
 * Normalize a file path to the coordinate space `guard.categoryPaths` is
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
    // Bash, which it allows unconditionally and decides nothing about. Bash is
    // still matched here rather than falling into the line below, because the
    // config diagnostics run for it — see the loop below for why that is
    // deliberate. Everything else is allowed without even loading the config.
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
    // guard-project-config-integration.test.ts.
    //
    // No escalation entry and no counter movement: a diagnostic is a diagnostic,
    // not an exemption and not a violation.
    //
    // Best effort, and this is the one site where that is about position rather
    // than order. The diagnostic has to precede every branch — it says the
    // effective configuration is not the one the user wrote, which is exactly what
    // the branches below decide on — so it cannot be moved after a verdict. What
    // `bestEffort` removes is its ability to DECIDE one: an unwritable
    // `.guard-state/` here used to throw before any check ran, and a write the
    // guard was about to deny was allowed instead, because the guard could not log
    // a note about a broken config file. Measured on a protected-path deny, which
    // is gone; the two denies below reach this site the same way.
    for (const diagnostic of config.diagnostics) {
        bestEffort("guard", () => emitEvent("guard_advisory", input.tool_name, undefined, diagnostic));
    }
    // Guard disabled
    if (!config.guard.enabled) {
        allow();
        return;
    }
    // Bash branch: nothing is inspected, and the call is allowed.
    //
    // Nothing here has any business with a shell any more. Both policies that used
    // to read the command text at this point are deleted — see the file header for
    // which, and why the question they shared is not answerable from that input —
    // and the fingerprint that replaced them, which was the last reason Bash
    // reached this hook at all, went with the protected-path half on 2026-08-12.
    // `hooks.json` still registers Bash on the PreToolUse matcher; leaving the
    // registration is deliberate, so the surface stays visible rather than being
    // rediscovered by whoever needs it next.
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
    // confirmed that cost explicitly on 2026-08-07. That cost used to be softened
    // by the measurement, which caught a protected path a shell had changed under
    // a halt as under anything else. It is not softened any more: a halted session
    // can still delete any file in the project from the shell.
    if (isBash) {
        allow();
        return;
    }
    // Self-detect: if cwd is the fusion plugin's own repo, stand the WRITE guard
    // down. Only write tools reach here — Bash returned above, having decided
    // nothing either way.
    //
    // ## What it stands down NOW, and why that is not what it was built for
    //
    // Until 2026-08-12 the answer was one sentence: the protected paths
    // (agents/**, rules/**, plugin.json, etc.) are the very files a fusion
    // developer needs to edit, so the deny below them had to yield here. That deny
    // is gone. What this branch now stands down is the two checks that remain —
    // CHECK 1, the halt, and CHECK 3, the decision-governed escalation — and
    // neither of them was ever the reason for it. A halt in this repository still
    // blocks the write tools everywhere else and is cleared the same way, so
    // standing it down here means a fusion developer's own session cannot be
    // halted by its own guard; and CHECK 3 is inert in every shipped layer, so
    // standing it down is currently standing down nothing at all.
    //
    // The code survives its subject deliberately and provisionally: removing a
    // stand-down is a behaviour change in the one tree where the guard is hardest
    // to test, and it was not argued for in either direction. The question is
    // filed as
    // `shared/decisions/260812-1232_o_does-the-write-guards-fusion-repo-stand-down-survive-the-loss-of-its-subject.md`
    // and is the user's to answer. Do not read the branch's continued existence as
    // that answer.
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
    // then COLLAPSE `.` and `..` before CHECK 3 reads the path.
    //
    // The collapse is not cosmetic. `normalizeToRelative` used to return a
    // relative input UNCHANGED, and `matchesAny` compiles a glob to a regex over
    // the path's TEXT, so a check comparing the raw spelling against a pattern
    // list answered differently for two spellings of one file:
    // `agents/coder.md` matched while `./agents/coder.md` and
    // `x/../agents/coder.md` did not, writing the same file. Measured on the
    // protected list, where it made the entire list bypassable with a
    // two-character prefix; that list is gone and `guard.categoryPaths` is matched
    // by the same `matchesAny` over the same text, so the property is the same
    // one and the collapse still has a subject.
    //
    // `normalizeToRelative` now resolves a relative input as well (`260804-1604`),
    // which collapses the same class one step earlier. The line below STAYS, and
    // not as belt and braces: the resolve answers a DIFFERENT question — which
    // directory the path hangs off — and it hands back an absolute path whenever
    // the answer is "not this one". Only this collapse guarantees that the
    // spelling CHECK 3 reads is the narrowest text naming the target, in the
    // outside-the-tree case as well as the inside one.
    //
    // One collapse, one place, above the check that matches on text. It used to be
    // above two — the protected set and the exempt set were read off this same
    // spelling, which is why `collapseSegments` in lib/paths.ts keeps a trailing
    // separator rather than stripping it. That asymmetry now has one side.
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
