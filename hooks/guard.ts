/**
 * Compliance Guard — PreToolUse hook for Claude Code.
 *
 * Intercepts Write/Edit/MultiEdit tool calls and checks them against:
 *   1. Halt state — if active, block ALL writes
 *   2. Protected paths — blocked, with one exemption: FUSION_ALLOW_RULES_WRITE
 *      lets a write to a project rule path through, recorded as an advisory.
 *      See lib/rules-write-exemption.ts.
 *   3. Decision-governed categories — escalated based on sensitivity
 *
 * Also intercepts Bash tool calls, for two independent policies:
 *   a. Branch policy — DENIES branch/worktree-moving git operations. git is
 *      reachable only via Bash, so every attempt an agent can make passes
 *      through here; that makes this a choke-point on the tool CALL, not a
 *      proof of impossibility. The classifier reads the command text, so a
 *      command that hides the verb from its own text (`eval '…'`,
 *      `bash -c '…'`, a `case` arm, a script the agent invokes) is not seen.
 *      See lib/git-branch-guard.ts. Runs everywhere, including in the fusion
 *      plugin's own repo.
 *   b. Protected-path policy — DENIES file-mutating shell commands (mv, rm,
 *      cp, sed -i, redirection, …) whose written operands land on
 *      guard.protectedPaths, the same list check 2 above applies to the write
 *      tools. See lib/bash-mutation-guard.ts. This IS a write-guard concern
 *      and therefore stands down in the plugin's own repo, exactly as the
 *      write tools do. It carries the SAME one exemption check 2 above does,
 *      FUSION_ALLOW_RULES_WRITE, because mv/rm/sed -i/`>` reach the rule files
 *      Edit reaches and a flag that lifted only one surface would control
 *      neither.
 * The policies are INDEPENDENT in both directions: an env override that lifts
 * policy (a) for a git operation is not consent to policy (b), so a command
 * pairing an overridden branch switch with a protected-path write still denies
 * on the write. See guardBashCommand for the evaluation order.
 * Neither policy touches the Bash allow path's zero-side-effect property (no
 * counter reset, no guard_allow event) — see guardBashCommand.
 *
 * Ported from fusion/reactor/pkg/guard/decision_guard.go.
 *
 * Protocol: reads JSON from stdin, writes JSON to stdout.
 *   Allow: {}
 *   Block: {"decision":"block","reason":"..."}
 */

import { resolve, relative, isAbsolute } from "node:path";
import { existsSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { matchesAny, collapseSegments } from "./lib/paths.js";
import { isFusionPluginCwd } from "./lib/self-detect.js";
import { realFsLocator } from "./lib/fs-locator.js";
import { loadConfig, findRelevantDecisions, sensitivityLevel } from "./lib/config.js";
import type { Sensitivity } from "./lib/config.js";
import {
  loadEscalation,
  saveEscalation,
  isHalted,
  recordBlock,
  resetBlockCounter,
} from "./lib/escalation.js";
import { emitEvent } from "./lib/events.js";
import {
  classifyGitCommand,
  overridesFromEnv,
  overrideEnvFor,
} from "./lib/git-branch-guard.js";
import type { CheckoutResolver } from "./lib/git-branch-guard.js";
import { classifyBashMutation } from "./lib/bash-mutation-guard.js";
import {
  isProjectRulePath,
  rulesWriteDetail,
  rulesWriteExemptionActive,
} from "./lib/rules-write-exemption.js";

/**
 * Real filesystem + git-ref resolver for the ambiguous bare-`git checkout
 * <target>` form. Resolves paths and refs in the effective cwd (process cwd
 * plus any `-C <dir>` global options, applied in order — the same directory
 * git itself would use). Fails safe: any error → treat as "not a path / not a
 * ref", which fails the ALLOW conditions and lets the classifier deny.
 */
function effectiveCwd(cwdHints: string[]): string {
  let dir = process.cwd();
  for (const hint of cwdHints) dir = resolve(dir, hint);
  return dir;
}

const checkoutResolver: CheckoutResolver = {
  pathExists(target: string, cwdHints: string[]): boolean {
    try {
      return existsSync(resolve(effectiveCwd(cwdHints), target));
    } catch {
      return false;
    }
  },
  isRef(target: string, cwdHints: string[]): boolean {
    try {
      // Exit 0 (+ prints the resolved object) iff target is a valid ref/object.
      // stdio ignored; execFileSync throws on any non-zero exit → not a ref.
      execFileSync(
        "git",
        ["-C", effectiveCwd(cwdHints), "rev-parse", "--verify", "--quiet", target],
        { stdio: "ignore" },
      );
      return true;
    } catch {
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
 */
function isExemptRulePath(path: string, spelledAs: string): boolean {
  return isProjectRulePath(path, fsLocator, spelledAs);
}

/** Hook input from Claude Code (PreToolUse). */
interface HookInput {
  session_id: string;
  hook_event_name: string;
  tool_name: string;
  tool_input: Record<string, unknown>;
}

/**
 * Normalize a file path to be relative to the project root (CWD).
 *
 * Claude Code sends absolute paths in tool_input.file_path, but the
 * guard config uses relative glob patterns (e.g. ".claude/agents/**").
 * This function strips the CWD prefix so patterns match correctly.
 */
function normalizeToRelative(filePath: string): string {
  if (!isAbsolute(filePath)) {
    return filePath;
  }
  const cwd = process.cwd();
  const resolved = resolve(filePath);
  // Only relativize if the path is under CWD
  if (resolved.startsWith(cwd + "/") || resolved === cwd) {
    return relative(cwd, resolved);
  }
  // Path is outside project root — return as-is (won't match any relative pattern)
  return filePath;
}

/** Extract the file path from tool input, if present. */
function extractFilePath(toolInput: Record<string, unknown>): string | null {
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
function shouldEscalate(sensitivity: Sensitivity): boolean {
  // Only block on high sensitivity. Low and medium emit advisory events
  // (logged by the tracker) but allow the write through.
  return sensitivity === "high";
}

function allow(): void {
  process.stdout.write("{}\n");
}

function block(reason: string): void {
  process.stdout.write(JSON.stringify({ decision: "block", reason }) + "\n");
}

/**
 * Guard a Bash tool call against the two shell policies. Three outcomes are
 * sequenced, in this order:
 *
 *   1. GIT DENY. Classify the command (segmenting on ; && || | and inspecting
 *      subshells) and DENY any branch/worktree-moving git operation the env
 *      overrides do not cover. This runs first and returns, so a call carrying
 *      both an un-overridden branch switch and a protected-path write denies on
 *      the branch: the sharper, better-established policy names the verdict, and
 *      one tool call records exactly ONE block. Recording two would double-count
 *      the consecutive-block counter that drives the halt.
 *   2a. HALT DENY. When the guard is halted, DENY any command the classifier
 *      recognises as a mutation — and allow everything else, so an agent can
 *      still read its way to understanding why it is halted. This mirrors
 *      CHECK 1 on the write-tool path, and it sits ABOVE the exemption for the
 *      same reason CHECK 1 sits above CHECK 2: the flag grants one permission
 *      and lifting a halt is not it. Until this existed the halt was a
 *      write-TOOL control — a halted guard blocked Edit and allowed
 *      `sed -i`, which is the surface an agent with a shell would have used.
 *   2. MUTATION DENY. DENY a file-mutating command whose written operands
 *      resolve onto config.guard.protectedPaths. Gated on the self-detect
 *      stand-down (see the comment at the check itself). It runs on BOTH routes
 *      out of step 1 — git-clean and git-override-allowed — because an override
 *      waives only what it names. FUSION_ALLOW_BRANCH_SWITCH authorises a branch
 *      switch; it is not consent to rewrite the protected paths, so
 *      `git switch main && rm rules/x.md` denies on the rm and the reason the
 *      user reads names the file, not the branch.
 *   2b. EXEMPTION NOTE. When FUSION_ALLOW_RULES_WRITE let a mutation of a rule
 *      file through step 2, record it: one clear-level escalation entry and one
 *      guard_advisory, the same note CHECK 2 writes on the write-tool path. It
 *      sits after the deny so it can only ever describe a command that ran, and
 *      before step 3 so a call carrying both permissions records both notes.
 *   3. OVERRIDE ALLOW. Only once both denies have passed is the override-used
 *      note recorded and the call allowed. Recording it later than step 2 keeps
 *      the note honest: it says a git op was let through, and after a step-2
 *      block nothing was let through.
 *
 * At most one block is recorded per call, on whichever deny fires first.
 * Both denies follow the same block/escalation/event pattern as the write-tool
 * checks. The innocuous allow path stays free of ALL write-guard bookkeeping.
 */
function guardBashCommand(
  input: HookInput,
  config: ReturnType<typeof loadConfig>,
): void {
  const command =
    typeof input.tool_input.command === "string"
      ? input.tool_input.command
      : "";

  const overrides = overridesFromEnv(process.env);
  const verdict = classifyGitCommand(command, overrides, checkoutResolver);

  // STEP 1 — git deny: a branch/worktree-moving git op with no override.
  // Returns, so the mutation check below never adds a second block for the same
  // tool call. An override does NOT reach here: it leaves verdict.deny false and
  // is handled at step 3, after the mutation check has had its say.
  if (verdict.deny) {
    const escalation = loadEscalation();
    const halted = recordBlock(
      escalation,
      config.escalation.blocksBeforeHalt,
      "git_branch_switch",
      verdict.reason ?? "",
      "Bash",
      verdict.offendingSegment,
    );
    saveEscalation(escalation);
    emitEvent(
      halted ? "guard_halt" : "guard_block",
      "Bash",
      undefined,
      `Git branch-switch denied: ${verdict.offendingSegment ?? command}`,
    );
    block(verdict.reason ?? "fusion policy: agents never switch git branches autonomously.");
    return;
  }

  // STEP 2 — protected-path check: a file-mutating shell command whose written
  // operands land on config.guard.protectedPaths — the same list, the same
  // "protected_path" trigger and the same escalation counter the write tools
  // use, so the monitor and the three-block halt treat both surfaces alike.
  //
  // REACHED ON BOTH ROUTES OUT OF STEP 1 — the git-clean one and the
  // git-override-allowed one. The override env vars grant exactly one
  // permission each: FUSION_ALLOW_BRANCH_SWITCH says "this agent may move HEAD",
  // FUSION_ALLOW_WORKTREE says "this agent may add a worktree". Neither says
  // anything about the protected paths, and a check that returned early on the
  // override would silently waive a permission nobody granted (it did, until
  // this was fixed: `git switch main && rm rules/x.md` ran in full).
  //
  // GATED ON THE SELF-DETECT STAND-DOWN, unlike the git policy above. This is a
  // WRITE-guard concern: the protected paths (agents/**, rules/**, plugin.json)
  // are exactly the files a fusion developer's agents legitimately move, delete
  // and rewrite, and they do so through a shell as often as through Edit.
  // Leaving it active here while the write tools stand down would be incoherent
  // — `Edit rules/x.md` allowed but `mv rules/x.md rules/retired/` denied,
  // which teaches an agent to route around the guard rather than respect it.
  // The branch policy's reasoning does NOT transfer: a human switches branches
  // in their own terminal (which this hook never sees), so gating the agent
  // there costs the developer nothing, whereas gating shell writes here costs
  // them the repo. Consumers of the plugin get the check unconditionally, which
  // is where it protects something.
  //
  // Deny-only: this check never allows, never resets the counter and never
  // emits guard_allow, so the allow path below keeps its stated property.
  if (!isFusionPluginCwd()) {
    const mutation = classifyBashMutation(command, {
      protectedPaths: config.guard.protectedPaths,
      // Same normalisation the write path applies before matchesAny, so the
      // relative globs in the config match a shell operand the same way they
      // match a tool_input.file_path. The classifier additionally runs
      // path.normalize() on the result, collapsing any `..` an operand carries.
      normalize: normalizeToRelative,
      // THE RULES-WRITE EXEMPTION, same predicate CHECK 2 asks on the write
      // tools (lib/rules-write-exemption.ts). Passed ONLY when the user set the
      // flag, so with it unset the classifier is called exactly as it was
      // before this existed and the deny side cannot drift.
      //
      // The flag has to reach BOTH surfaces or it controls neither. mv, rm,
      // sed -i and `>` write the same rule files Edit writes, so a flag that
      // only lifted CHECK 2 would be a polite route to a door left open, and
      // an agent that met the deny here after the Edit went through would
      // learn to route around the guard rather than respect it.
      //
      // The classifier hands the predicate TWO spellings — the resolved,
      // normalised operand and the operand as the command wrote it — because
      // its own `path.normalize` collapses `..` lexically and would otherwise
      // hand gate 0 a path with the escape already erased from it. See
      // `MutationOptions.exempt` and `rules-write-exemption.ts` `## Gate 0`.
      exempt: rulesWriteExemptionActive(process.env)
        ? isExemptRulePath
        : undefined,
    });

    // STEP 2a — HALT. A halted guard blocks every recognised mutation, and
    // nothing else. Three things about the placement are load-bearing:
    //
    //   - ABOVE the exemption's effect. The exemption is applied INSIDE
    //     classification, so this cannot be expressed by ordering two calls;
    //     it is expressed by reading `mutation.mutates`, which the exemption
    //     does not influence. `FUSION_ALLOW_RULES_WRITE` therefore cannot be
    //     the way out of a halt, exactly as it cannot be on the write-tool
    //     path where CHECK 1 returns above CHECK 2.
    //   - ABOVE the protected-path deny, so a halted guard reports the halt
    //     rather than the path. Same order the write-tool path uses, and the
    //     same reason: the halt is the condition the user has to clear, and
    //     naming the path would send an agent off rephrasing the command.
    //   - MUTATIONS ONLY. Blocking all Bash under a halt would stop an agent
    //     reading its way out of the situation — it could not even find the
    //     clear-halt instruction — which is worse for everyone and protects
    //     nothing extra. `ls`, `git status` and `cat` still run.
    //
    // Inside the self-detect gate, like the check below it: in the plugin's own
    // repo the write-tool path returns before CHECK 1 too, so the halt stands
    // down on both surfaces together rather than on one.
    //
    // No recordBlock: the halt is not a fresh violation, it is the standing
    // consequence of earlier ones. The write-tool halt does not count itself
    // either.
    if (mutation.mutates) {
      const escalation = loadEscalation();
      if (isHalted(escalation)) {
        const pluginRoot = process.env.CLAUDE_PLUGIN_ROOT ?? "<plugin-dir>";
        const reason =
          "[HALTED] All file-mutating shell commands are blocked. " +
          "The guard has been halted after repeated violations. " +
          "Read-only commands still run. " +
          `Run: node ${pluginRoot}/hooks/dist/clear-halt.js to reset.`;
        emitEvent(
          "guard_halt",
          "Bash",
          mutation.targetPath,
          "Halt active — mutating Bash command blocked",
        );
        block(reason);
        return;
      }
    }

    if (mutation.deny) {
      const reason =
        mutation.reason ??
        "Protected path: this command writes a path under compliance guard protection.";
      const escalation = loadEscalation();
      const halted = recordBlock(
        escalation,
        config.escalation.blocksBeforeHalt,
        "protected_path",
        reason,
        "Bash",
        mutation.targetPath,
      );
      saveEscalation(escalation);
      emitEvent(
        halted ? "guard_halt" : "guard_block",
        "Bash",
        mutation.targetPath,
        "Protected path",
      );
      block(reason);
      return;
    }

    // STEP 2b — the rules-write exemption note. Reached only when the check
    // above did NOT deny, so it records paths that genuinely went through.
    //
    // The same note CHECK 2 writes on the write-tool path: one clear-level
    // entry naming the variable and what it let through, and one guard_advisory
    // carrying the same string. Two deliberate differences from that site:
    //
    //   - It SAVES. CHECK 2 pushes into an escalation object a later branch
    //     always persists; on this path there is no later save, so the note
    //     would be lost. Loading, pushing, saving and emitting in one place is
    //     also what lets this note and the git override note below both survive
    //     one tool call: the second load reads what the first wrote.
    //   - The event's file field carries the exempted path only when there is
    //     exactly ONE. A shell command can write several, and a field typed as
    //     one path must not carry a list; the detail names all of them either
    //     way.
    //
    // Not a deny, and reachable only when the user set the flag AND a rule path
    // was actually exempted, so an innocuous Bash call still writes nothing.
    if (mutation.exempted !== undefined && mutation.exempted.length > 0) {
      const detail = rulesWriteDetail(mutation.exempted);
      const filePath =
        mutation.exempted.length === 1 ? mutation.exempted[0] : undefined;
      const escalation = loadEscalation();
      escalation.recentEvents.push({
        level: "clear",
        trigger: "rules_write_exemption",
        message: detail,
        timestamp: new Date().toISOString(),
        toolName: "Bash",
        filePath,
      });
      saveEscalation(escalation);
      emitEvent("guard_advisory", "Bash", filePath, detail);
    }
  }

  // STEP 3 — override note: a normally-denied git op that an env flag allowed,
  // and that survived the protected-path check above. Recorded here rather than
  // at step 1 so the note is written only for a call that actually goes through;
  // a step-2 block means nothing was allowed and there is nothing to note.
  //
  // Not a deny — it falls through to the same allow() below. It is also the one
  // conditional on this path that writes state without blocking, and it is
  // reachable ONLY when the user set an override, so an innocuous Bash call
  // still touches nothing.
  if (verdict.overrideUsed && verdict.overrideKind) {
    const envVar = overrideEnvFor(verdict.overrideKind);
    const detail =
      `Override ${envVar} allowed normally-denied git op: ${verdict.overrideSegment ?? command}`;
    // Record the override in guard-state for visibility (same state surface
    // the block path writes to — recentEvents in escalation.json + events.jsonl).
    const escalation = loadEscalation();
    escalation.recentEvents.push({
      level: "clear",
      trigger: "git_branch_switch_override",
      message: detail,
      timestamp: new Date().toISOString(),
      toolName: "Bash",
    });
    saveEscalation(escalation);
    emitEvent("guard_advisory", "Bash", undefined, detail);
  }

  // Allow path: not a branch/worktree-moving git op the overrides left denied,
  // and not a mutation of a protected path. Steps 1 and 2 are DENY-ONLY — each
  // either blocks and returns, or falls through having written nothing — and
  // step 3 writes only when the user set an override, which no innocuous call
  // does. So reaching this point on an ordinary command still means it
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

async function main(): Promise<void> {
  // Read hook input from stdin
  const chunks: Buffer[] = [];
  for await (const chunk of process.stdin) {
    chunks.push(chunk as Buffer);
  }
  const raw = Buffer.concat(chunks).toString("utf-8").trim();

  if (!raw) {
    allow();
    return;
  }

  let input: HookInput;
  try {
    input = JSON.parse(raw) as HookInput;
  } catch {
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

  // Guard disabled
  if (!config.guard.enabled) {
    allow();
    return;
  }

  // Bash branch: the git branch-switch policy (deterministic, on every tool
  // call — see the header for what that does and does not bound) and the
  // protected-path mutation policy. The two differ in where they stand
  // down, so guardBashCommand — not this dispatch — owns the self-detect call.
  //
  // The BRANCH policy runs unconditionally when the guard is enabled —
  // INCLUDING in the fusion plugin's own repo. This hook only ever gated the
  // AGENT's Bash tool calls; a human developer switches branches in their own
  // terminal, which the hook never sees. Standing the branch policy down for
  // the plugin repo therefore removed agent protection for zero human benefit
  // (the branch-switch hole). The override env vars
  // (FUSION_ALLOW_BRANCH_SWITCH / FUSION_ALLOW_WORKTREE) remain the deliberate
  // escape hatch for a fusion developer who genuinely wants an agent to switch
  // branches here.
  //
  // The MUTATION policy is a write-guard concern and does stand down here, for
  // the reasons given at the check itself.
  if (isBash) {
    guardBashCommand(input, config);
    return;
  }

  // Self-detect: if cwd is the fusion plugin's own repo, stand the WRITE guard
  // down. The protected paths (agents/**, rules/**, plugin.json, etc.) are the
  // very files a fusion developer needs to edit. Only write tools reach here —
  // the branch-switch policy above already ran and is intentionally NOT disabled.
  if (isFusionPluginCwd()) {
    emitEvent(
      "guard_allow",
      input.tool_name,
      extractFilePath(input.tool_input) ?? undefined,
      "Self-detect: cwd is fusion plugin repo — write guard standing down",
    );
    allow();
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
  // `normalizeToRelative` returns a relative input UNCHANGED, and `matchesAny`
  // compiles a glob to a regex over the path's text, so CHECK 2 used to compare
  // the raw spelling against the protected list: `agents/coder.md` denied while
  // `./agents/coder.md` and `x/../agents/coder.md` allowed, writing the same
  // file. That was the whole protected list bypassable with a two-character
  // prefix, and it was the strictly worse half of the input class the exemption
  // had already been taught to collapse — `rules/../agents/coder.md` denied
  // only by accident, because `rules/**` happens to match its text.
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
    const pluginRoot = process.env.CLAUDE_PLUGIN_ROOT ?? "<plugin-dir>";
    const reason =
      "[HALTED] All write operations blocked. " +
      "The guard has been halted after repeated violations. " +
      `Run: node ${pluginRoot}/hooks/dist/clear-halt.js to reset.`;
    emitEvent("guard_halt", input.tool_name, filePath, "Halt active — blocked");
    block(reason);
    return;
  }

  // CHECK 2: Protected paths — blocked, with exactly ONE exemption.
  if (matchesAny(filePath, config.guard.protectedPaths)) {
    // THE RULES-WRITE EXEMPTION. Both halves must hold: the user deliberately
    // set FUSION_ALLOW_RULES_WRITE, and the path is one of the rule paths that
    // flag names. lib/rules-write-exemption.ts owns the boundary — it
    // canonicalises the path lexically AND resolves it against the real
    // filesystem, because a grant read off text alone is spendable on a symlink
    // planted inside the rule directory. The Bash mutation path asks the same
    // module the same two questions through the same `isExemptRulePath`, so a
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
    const exempted =
      rulesWriteExemptionActive(process.env) &&
      isExemptRulePath(filePath, rawFilePath);

    if (!exempted) {
      const reason = `Protected path: ${filePath} cannot be modified directly. This path is under compliance guard protection.`;

      const halted = recordBlock(
        escalation,
        config.escalation.blocksBeforeHalt,
        "protected_path",
        reason,
        input.tool_name,
        filePath,
      );
      saveEscalation(escalation);

      emitEvent(
        halted ? "guard_halt" : "guard_block",
        input.tool_name,
        filePath,
        "Protected path",
      );
      block(reason);
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
    emitEvent("guard_advisory", input.tool_name, filePath, detail);
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

      const reason =
        `Modification to ${filePath} affects area governed by ${relevant.length} decision(s):\n` +
        `${decisionList}\n\n` +
        `Sensitivity: ${highestSensitivity}. Review the decision(s) above before proceeding.`;

      const halted = recordBlock(
        escalation,
        config.escalation.blocksBeforeHalt,
        "decision_governed",
        reason,
        input.tool_name,
        filePath,
      );
      saveEscalation(escalation);

      emitEvent(
        halted ? "guard_halt" : "guard_block",
        input.tool_name,
        filePath,
        `Decision: ${relevant.map((d) => d.id).join(", ")}`,
      );
      block(reason);
      return;
    }

    // Low/medium sensitivity: emit advisory event but allow the write
    if (highestSensitivity !== "none") {
      emitEvent(
        "guard_advisory",
        input.tool_name,
        filePath,
        `Advisory (${highestSensitivity}): ${relevant.map((d) => d.id).join(", ")}`,
      );
    }
  }

  // ALLOW — no rule matched, reset consecutive blocks
  resetBlockCounter(escalation);
  saveEscalation(escalation);
  emitEvent("guard_allow", input.tool_name, filePath);
  allow();
}

main().catch((err) => {
  // Fail open on unexpected errors — don't block the agent
  emitEvent("guard_error", undefined, undefined, `Guard error (fail-open): ${err}`);
  process.stderr.write(`[guard] Error: ${err}\n`);
  allow();
});
