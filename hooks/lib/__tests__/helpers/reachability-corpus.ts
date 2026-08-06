/**
 * The measurement instrument for the shell reachability model — plan step 1 of
 * `circles/260804-1205-shell-reachability-model`.
 *
 * ## Why this file exists, and why it exists FIRST
 *
 * The parent Circle (`260801-1244-guard-rules-write`) shipped two enumerations
 * of what its change cost, and both were falsified within a day. Both had been
 * harvested from that Circle's own test suite. A corpus harvested from the
 * tests measures REPRODUCTION, not COST: it can only contain shapes somebody
 * already thought of, which is precisely the set the change was written
 * against. So this generator is written BEFORE the classifier moves, it is
 * built from a cross-product rather than from the suite, and its baseline is
 * captured at the commit the change is measured from (HEAD `38c5123`).
 *
 * Nothing here asserts what the classifier SHOULD say. It produces command
 * strings and records what the classifier DOES say. The verdicts are evidence
 * for the human gate at plan step 5, not a specification.
 *
 * ## Determinism
 *
 * Seedless and total. `generateCorpus()` walks the six dimension tables in a
 * fixed nested order and emits every combination once, so two runs produce the
 * same rows in the same order and a diff between two baselines is a diff about
 * verdicts rather than about ordering. `CorpusRow.id` is built from the
 * dimension values rather than from a counter, so inserting a dimension value
 * later renames nothing that already exists.
 *
 * ## The `{{ROOT}}` placeholder
 *
 * A row with an absolute operand cannot be a fixed string: the classifier is
 * measured against a stand-in project root (`/project`, mirroring
 * `bash-mutation-guard.test.ts`) while the witness runner executes the same row
 * against a throwaway directory under `os.tmpdir()`. So every row carries
 * `commandTemplate` with `{{ROOT}}` unexpanded, and `command` is that template
 * rendered against whatever root the caller asked for. `renderCommand()` is the
 * one way to expand it — `shell-witness.ts` calls it with the real temporary
 * root, and the safety check there depends on there being no other absolute
 * path in the template.
 *
 * ## Capturing a baseline
 *
 * Two artifacts, and they are deliberately different sizes:
 *
 *   - the FULL corpus baseline (~24k rows) goes to a scratch file outside this
 *     repository. It is the differential's left-hand side at plan step 5 and it
 *     is too large to be worth reading in a diff.
 *   - a BOUNDED subcorpus (`selectSubcorpus`, 448 rows) is committed as
 *     `fixtures/mutation-verdicts-head.json`, modelled on the existing
 *     `fixtures/git-verdicts-head.json`.
 *
 * Both are built by `buildBaseline`, so they cannot drift in shape:
 *
 * ```
 * cd hooks && node_modules/.bin/tsx -e '
 *   import { writeFileSync } from "node:fs";
 *   import { generateCorpus, selectSubcorpus, buildBaseline }
 *     from "./lib/__tests__/helpers/reachability-corpus.ts";
 *   const rows = generateCorpus();
 *   writeFileSync("/tmp/mutation-verdicts-full.json",
 *     JSON.stringify(buildBaseline(rows), null, 2));
 *   writeFileSync("lib/__tests__/fixtures/mutation-verdicts-head.json",
 *     JSON.stringify(buildBaseline(selectSubcorpus(rows)), null, 2) + "\n");
 * '
 * ```
 *
 * ## What the committed fixture means
 *
 * It is a BASELINE, not a pin. The git fixture next to it records a classifier
 * that must not move; this one records a classifier that plan step 3 is going
 * to move on purpose. `reachability-corpus.test.ts` asserts reproduction
 * anyway, because a baseline nobody compares against is a file rather than a
 * measurement — and the rows that stop reproducing at step 3 ARE the
 * measurement step 5 buckets and takes to the human gate. Regenerating this
 * fixture before that gate would destroy the only before-image of the change.
 */

import { classifyBashMutation } from "../../bash-mutation-guard.js";
import type { MutationOptions, MutationVerdict } from "../../bash-mutation-guard.js";

/* ------------------------------------------------------------------ *
 * The protected list and the project root the classifier is measured on
 * ------------------------------------------------------------------ */

/**
 * The shipped `guard.protectedPaths`, mirrored from `hooks/config.json`.
 *
 * Mirrored rather than read, for the same reason `bash-mutation-guard.test.ts`
 * mirrors it: a generator that touches the filesystem is a generator whose
 * output depends on where it ran. `reachability-corpus.test.ts` pins this array
 * against the real file, so the mirror cannot silently drift.
 */
export const PROTECTED_PATHS: readonly string[] = [
  "agents/**",
  "rules/**",
  "hooks/config.json",
  "hooks/hooks.json",
  "settings.json",
  "bin/monitor",
  "skills/**",
  ".claude-plugin/plugin.json",
  "fusion-workbench/.guard-state/**",
];

/**
 * The stand-in project root every classification is measured against, and the
 * default expansion of `{{ROOT}}`.
 *
 * Same value `bash-mutation-guard.test.ts` uses, so a row from this corpus can
 * be pasted into that suite and mean the same thing.
 */
export const CLASSIFY_ROOT = "/project";

/**
 * `guard.ts`'s `normalizeToRelative`, mirrored: an absolute path under the
 * project root becomes project-relative, anything else is returned unchanged
 * and therefore matches no relative glob.
 */
export function makeNormalize(root: string): (raw: string) => string {
  return (raw: string): string => {
    if (!raw.startsWith("/")) return raw;
    if (raw === root) return "";
    if (raw.startsWith(root + "/")) return raw.slice(root.length + 1);
    return raw;
  };
}

/** The classifier options every baseline row is measured with. */
export function classifyOptions(root = CLASSIFY_ROOT): MutationOptions {
  return {
    protectedPaths: [...PROTECTED_PATHS],
    normalize: makeNormalize(root),
    // No `CDPATH`. Every row below asserts the behaviour of a shell with none
    // set, which is the environment fusion itself runs in and the one the
    // witness runner reproduces by stripping the variable from the child.
    env: {},
  };
}

/* ------------------------------------------------------------------ *
 * Dimension 1 — the head, and dimension 2 — the joiner that attaches it
 * ------------------------------------------------------------------ */

/**
 * The command standing in front of the construct, if any.
 *
 * `status` is what the head returns in a real shell, which is what decides
 * whether a `||` or `&&` after it reaches the construct at all. It is recorded
 * so a witness observation can be read against the shell's actual control
 * flow rather than against a guess.
 */
export interface HeadSpec {
  readonly id: string;
  /** `null` for the headless rows: the construct stands alone. */
  readonly text: string | null;
  readonly status: "zero" | "nonzero" | null;
}

export const HEADS: readonly HeadSpec[] = [
  { id: "none", text: null, status: null },
  { id: "true", text: "true", status: "zero" },
  { id: "false", text: "false", status: "nonzero" },
  // The control row from the parent Circle's ledger: reachability is a static
  // property and an exit status is not, so `[ -d nope ] || cd build && rm …`
  // denies before and after the change.
  { id: "test-d", text: "[ -d nope ]", status: "nonzero" },
  { id: "echo", text: "echo hi", status: "zero" },
  { id: "ls", text: "ls", status: "zero" },
];

/**
 * How the head is joined to the construct.
 *
 * `none` is not an operator — it is the absence of a head, and it pairs with
 * the `none` head and with nothing else. Every other value pairs with every
 * real head. `newline` is a literal newline, which bash's grammar treats as a
 * sequencing operator and which the lexer reports as its own joiner.
 */
export const JOINERS = [
  "none",
  "&&",
  "||",
  ";",
  "|",
  "&",
  "newline",
] as const;
export type JoinerId = (typeof JOINERS)[number];

/* ------------------------------------------------------------------ *
 * Dimension 3 — the directory builtin
 * ------------------------------------------------------------------ */

/**
 * The four directory builtins, and what each one does with the target's
 * directory.
 *
 * `popd` takes no directory operand at all, which is why `takesDir` exists: a
 * `popd` row's write is measured from wherever the shell was already standing.
 * With an empty directory stack `popd` FAILS in both shells, so those rows are
 * the counter-example set for `cond-true` — a body reached only on success must
 * not be assumed to have run.
 *
 * `chdir` is a zsh builtin and is NOT a bash builtin. That disagreement is a
 * measurement, not a defect in the corpus: the witness runs both shells for
 * exactly this class of row.
 */
export interface DirBuiltinSpec {
  readonly id: string;
  readonly word: string;
  readonly takesDir: boolean;
}

export const DIR_BUILTINS: readonly DirBuiltinSpec[] = [
  { id: "cd", word: "cd", takesDir: true },
  { id: "chdir", word: "chdir", takesDir: true },
  { id: "pushd", word: "pushd", takesDir: true },
  { id: "popd", word: "popd", takesDir: false },
];

/* ------------------------------------------------------------------ *
 * Dimension 4 — the compound wrapper
 * ------------------------------------------------------------------ */

/**
 * How the directory builtin and the write are arranged relative to each other.
 *
 * Six of these are the wrappers the plan names. `pipe-head` is the seventh and
 * it is an addition rather than an oversight: the plan's own risk table names
 * `cd build | grep x && rm out.js` as the one shape where naive head-inheritance
 * would newly ALLOW, and an instrument that cannot produce the row the risk
 * table names cannot measure the risk. It is generated, bucketed under the
 * `pipeline` family, and carried in the committed subcorpus.
 */
export const WRAPPERS = [
  /** `MOVER && WRITE` — the flat chain the model already gets right. */
  "bare",
  /** `if MOVER; then WRITE; fi` — body reached on success. */
  "if",
  /** `while MOVER; do WRITE; done` — body reached on success. */
  "while",
  /** `until MOVER; do WRITE; done` — body reached on FAILURE. The counter-example. */
  "until",
  /** `{ MOVER; } && WRITE` — a group's status is its last command's status. */
  "brace",
  /** `MOVER && echo hi | WRITE` — the write is a pipeline TAIL. */
  "pipeline",
  /** `MOVER | cat && WRITE` — the MOVER is a pipeline element. */
  "pipe-head",
] as const;
export type WrapperId = (typeof WRAPPERS)[number];

/* ------------------------------------------------------------------ *
 * Dimension 5 — the write verb
 * ------------------------------------------------------------------ */

/**
 * Each verb is a SIMPLE command — no pipe, no `&&` — so that the pipeline
 * dimension is the only thing that introduces a `|`. Two spellings need a note:
 *
 *   - `sed -i.bak` rather than `sed -i`, because BSD `sed` (macOS, where this
 *     is measured) reads the token after a bare `-i` as the backup suffix and
 *     would consume the script. `-i.bak` is in-place on both platforms, and the
 *     guard's `isSedInPlaceFlag` reads the `i` out of it either way.
 *   - `tee` takes its input from `/dev/null` so it is a simple command that
 *     still truncates its operand. In the `pipeline` wrapper it gets a real
 *     upstream instead, which is the shape the plan's relief example uses
 *     (`cd hooks && npx tsc | tee typecheck.log`).
 */
export interface WriteVerbSpec {
  readonly id: string;
  /** Renders the write, given the operand as written and the `{{ROOT}}` token. */
  readonly render: (operand: string, rootToken: string) => string;
  /** Renders the write when it is a pipeline tail (stdin comes from upstream). */
  readonly renderPiped: (operand: string, rootToken: string) => string;
}

export const WRITE_VERBS: readonly WriteVerbSpec[] = [
  { id: "rm", render: (o) => `rm ${o}`, renderPiped: (o) => `rm ${o}` },
  { id: "rm-rf", render: (o) => `rm -rf ${o}`, renderPiped: (o) => `rm -rf ${o}` },
  {
    id: "mv",
    render: (o) => `mv ${o} ${o}.moved`,
    renderPiped: (o) => `mv ${o} ${o}.moved`,
  },
  {
    id: "sed-i",
    render: (o) => `sed -i.bak -e 's/seed/changed/' ${o}`,
    renderPiped: (o) => `sed -i.bak -e 's/seed/changed/' ${o}`,
  },
  {
    id: "cp",
    render: (o, root) => `cp ${root}/notes.txt ${o}`,
    renderPiped: (o, root) => `cp ${root}/notes.txt ${o}`,
  },
  {
    id: "redirect",
    render: (o) => `echo overwritten > ${o}`,
    renderPiped: (o) => `cat > ${o}`,
  },
  {
    id: "tee",
    render: (o) => `tee ${o} < /dev/null`,
    renderPiped: (o) => `tee ${o}`,
  },
];

/* ------------------------------------------------------------------ *
 * Dimension 6 — the target
 * ------------------------------------------------------------------ */

/**
 * A target names three things at once: the directory the mover changes into,
 * the operand the write is given, and where that operand LANDS.
 *
 * The two landing fields are the whole point of the corpus. A relative operand
 * lands in a different place depending on whether the directory change took
 * effect, and the guard's model of that is exactly what plan steps 2 and 3
 * change. An absolute operand lands in the same place either way and is
 * therefore the control: nothing about reachability may move those rows.
 */
export interface TargetSpec {
  readonly id: string;
  /** The directory the mover changes into (unused by `popd`). */
  readonly dir: string;
  /** The operand as written, possibly containing `{{ROOT}}`. */
  readonly operand: string;
  /** Project-relative landing site when the directory change took effect. */
  readonly landsWhenMoved: string;
  /** Project-relative landing site when the shell never moved. */
  readonly landsWhenStill: string;
  readonly protectedWhenMoved: boolean;
  readonly protectedWhenStill: boolean;
}

const ROOT_TOKEN = "{{ROOT}}";

export const TARGETS: readonly TargetSpec[] = [
  {
    id: "protected-relative",
    dir: "rules",
    operand: "x.md",
    landsWhenMoved: "rules/x.md",
    landsWhenStill: "x.md",
    protectedWhenMoved: true,
    protectedWhenStill: false,
  },
  {
    id: "protected-absolute",
    dir: "build",
    operand: `${ROOT_TOKEN}/rules/x.md`,
    landsWhenMoved: "rules/x.md",
    landsWhenStill: "rules/x.md",
    protectedWhenMoved: true,
    protectedWhenStill: true,
  },
  {
    id: "unprotected-relative",
    dir: "build",
    operand: "out.js",
    landsWhenMoved: "build/out.js",
    landsWhenStill: "out.js",
    protectedWhenMoved: false,
    protectedWhenStill: false,
  },
  {
    id: "unprotected-absolute",
    dir: "build",
    operand: `${ROOT_TOKEN}/build/out.js`,
    landsWhenMoved: "build/out.js",
    landsWhenStill: "build/out.js",
    protectedWhenMoved: false,
    protectedWhenStill: false,
  },
];

/* ------------------------------------------------------------------ *
 * The row
 * ------------------------------------------------------------------ */

/** Buckets a row belongs to. A row belongs to as many as apply. */
export const FAMILIES = [
  /** `if`, `while`, `until`, brace group — a body reached on a condition. */
  "compound",
  /** The write or the mover is a pipeline element. */
  "pipeline",
  /** The head is attached with `||`. */
  "or-joiner",
  /** The head is attached with `|`. */
  "pipe-joiner",
  /** `MOVER && WRITE`, no compound and no pipe. */
  "flat",
] as const;
export type FamilyId = (typeof FAMILIES)[number];

export interface CorpusDims {
  readonly head: string;
  readonly joiner: JoinerId;
  readonly builtin: string;
  readonly wrapper: WrapperId;
  readonly verb: string;
  readonly target: string;
}

export interface CorpusRow {
  /**
   * Stable identity, built from the dimension values rather than from a
   * counter, so adding a dimension value renames nothing already recorded.
   */
  readonly id: string;
  readonly dims: CorpusDims;
  readonly families: readonly FamilyId[];
  /** The command with `{{ROOT}}` unexpanded. */
  readonly commandTemplate: string;
  /** The command rendered against the root this corpus was generated for. */
  readonly command: string;
  /** Where a relative operand lands if the directory change took effect. */
  readonly landsWhenMoved: string;
  /** Where it lands if the shell never moved. */
  readonly landsWhenStill: string;
  readonly protectedWhenMoved: boolean;
  readonly protectedWhenStill: boolean;
  /**
   * False for `popd`, which takes no directory operand and — with an empty
   * stack — moves nowhere in either shell.
   */
  readonly moverEstablishesDir: boolean;
}

/** Expand `{{ROOT}}` in a template. The only sanctioned way to do it. */
export function renderCommand(template: string, root: string): string {
  return template.split(ROOT_TOKEN).join(root);
}

function familiesFor(wrapper: WrapperId, joiner: JoinerId): FamilyId[] {
  const out: FamilyId[] = [];
  if (wrapper === "if" || wrapper === "while" || wrapper === "until" || wrapper === "brace") {
    out.push("compound");
  }
  if (wrapper === "pipeline" || wrapper === "pipe-head") out.push("pipeline");
  if (wrapper === "bare") out.push("flat");
  if (joiner === "||") out.push("or-joiner");
  if (joiner === "|") out.push("pipe-joiner");
  return out;
}

/** `cd rules`, `pushd build`, `popd`, … */
function moverPhrase(builtin: DirBuiltinSpec, target: TargetSpec): string {
  return builtin.takesDir ? `${builtin.word} ${target.dir}` : builtin.word;
}

function assemble(
  wrapper: WrapperId,
  mover: string,
  verb: WriteVerbSpec,
  operand: string,
): string {
  const write = verb.render(operand, ROOT_TOKEN);
  const piped = verb.renderPiped(operand, ROOT_TOKEN);

  switch (wrapper) {
    case "bare":
      return `${mover} && ${write}`;
    case "if":
      return `if ${mover}; then ${write}; fi`;
    case "while":
      // No `break`. A `break` would add a segment and change the shape being
      // measured; termination is the witness runner's problem, and it has a
      // hard timeout for exactly the rows that do not terminate (`until popd`).
      return `while ${mover}; do ${write}; done`;
    case "until":
      return `until ${mover}; do ${write}; done`;
    case "brace":
      return `{ ${mover}; } && ${write}`;
    case "pipeline":
      return `${mover} && echo hi | ${piped}`;
    case "pipe-head":
      // `| cat` rather than the plan's `| grep x`, and the difference matters
      // only to the WITNESS. `grep x` finds nothing in a `cd`'s (empty) output,
      // exits 1, and the `&&` short-circuits — so the row can never show
      // whether the shell moved, which is the one thing it exists to show. To
      // the classifier the two are the same three segments in the same order,
      // so the plan's literal spelling stays pinnable in the unit suite.
      return `${mover} | cat && ${write}`;
  }
}

function attachHead(head: HeadSpec, joiner: JoinerId, construct: string): string {
  if (head.text === null) return construct;
  if (joiner === "newline") return `${head.text}\n${construct}`;
  return `${head.text} ${joiner} ${construct}`;
}

/**
 * Every head/joiner pair the corpus uses.
 *
 * The headless row pairs only with `none`, and a real head pairs with every
 * operator — 1 + 5 × 6 = 31 prefixes.
 */
function headJoinerPairs(): { head: HeadSpec; joiner: JoinerId }[] {
  const pairs: { head: HeadSpec; joiner: JoinerId }[] = [];
  for (const head of HEADS) {
    if (head.text === null) {
      pairs.push({ head, joiner: "none" });
      continue;
    }
    for (const joiner of JOINERS) {
      if (joiner === "none") continue;
      pairs.push({ head, joiner });
    }
  }
  return pairs;
}

export interface CorpusOptions {
  /** What `{{ROOT}}` expands to in `command`. Defaults to `CLASSIFY_ROOT`. */
  root?: string;
}

/**
 * The corpus. Total, seedless, and in a fixed order.
 *
 * Nesting order is head/joiner → builtin → wrapper → verb → target, chosen so
 * that rows of one family sit together in the output and a truncated read of a
 * baseline is still a coherent slice.
 */
export function generateCorpus(opts: CorpusOptions = {}): CorpusRow[] {
  const root = opts.root ?? CLASSIFY_ROOT;
  const rows: CorpusRow[] = [];

  for (const { head, joiner } of headJoinerPairs()) {
    for (const builtin of DIR_BUILTINS) {
      for (const wrapper of WRAPPERS) {
        for (const verb of WRITE_VERBS) {
          for (const target of TARGETS) {
            const construct = assemble(
              wrapper,
              moverPhrase(builtin, target),
              verb,
              target.operand,
            );
            const commandTemplate = attachHead(head, joiner, construct);
            rows.push({
              id: [
                head.id,
                joiner === "none" ? "nojoin" : joinerSlug(joiner),
                builtin.id,
                wrapper,
                verb.id,
                target.id,
              ].join("/"),
              dims: {
                head: head.id,
                joiner,
                builtin: builtin.id,
                wrapper,
                verb: verb.id,
                target: target.id,
              },
              families: familiesFor(wrapper, joiner),
              commandTemplate,
              command: renderCommand(commandTemplate, root),
              landsWhenMoved: builtin.takesDir
                ? target.landsWhenMoved
                : target.landsWhenStill,
              landsWhenStill: target.landsWhenStill,
              protectedWhenMoved: builtin.takesDir
                ? target.protectedWhenMoved
                : target.protectedWhenStill,
              protectedWhenStill: target.protectedWhenStill,
              moverEstablishesDir: builtin.takesDir,
            });
          }
        }
      }
    }
  }

  return rows;
}

/** Filesystem- and id-safe spellings of the shell operators. */
function joinerSlug(joiner: JoinerId): string {
  switch (joiner) {
    case "&&":
      return "and";
    case "||":
      return "or";
    case ";":
      return "semi";
    case "|":
      return "pipe";
    case "&":
      return "amp";
    case "newline":
      return "newline";
    case "none":
      return "nojoin";
  }
}

/* ------------------------------------------------------------------ *
 * The bounded subcorpus that is committed
 * ------------------------------------------------------------------ */

/**
 * The four families the plan commits to a fixture, each projected onto one
 * slice so the file stays readable in a diff.
 *
 * The projection rule is stated once and applied uniformly: hold every
 * dimension the family is not ABOUT at a single representative value, and vary
 * the rest completely.
 *
 *   - the compound and pipeline families are about the WRAPPER, so the head is
 *     held at `none` and the builtin at `cd`, and every verb and target varies;
 *   - the `||` and `|` families are about the HEAD/JOINER, so the wrapper is
 *     held at `bare` and the builtin at `cd`, and every head, verb and target
 *     varies.
 *
 * 112 + 56 + 140 + 140 = 448 rows. The full corpus (24 304 rows) is the
 * differential's real left-hand side and lives in a scratch file; this is the
 * part a reviewer can read.
 */
export const SUBCORPUS_SLICES: readonly {
  readonly id: string;
  readonly select: (row: CorpusRow) => boolean;
}[] = [
  {
    id: "compound",
    select: (r) =>
      r.families.includes("compound") &&
      r.dims.head === "none" &&
      r.dims.builtin === "cd",
  },
  {
    id: "pipeline",
    select: (r) =>
      r.families.includes("pipeline") &&
      r.dims.head === "none" &&
      r.dims.builtin === "cd",
  },
  {
    id: "or-joiner",
    select: (r) =>
      r.dims.joiner === "||" && r.dims.wrapper === "bare" && r.dims.builtin === "cd",
  },
  {
    id: "pipe-joiner",
    select: (r) =>
      r.dims.joiner === "|" && r.dims.wrapper === "bare" && r.dims.builtin === "cd",
  },
];

/** The committed slice of `rows`, in corpus order, deduplicated. */
export function selectSubcorpus(rows: readonly CorpusRow[]): CorpusRow[] {
  return rows.filter((row) => SUBCORPUS_SLICES.some((slice) => slice.select(row)));
}

/* ------------------------------------------------------------------ *
 * Classification and the baseline file
 * ------------------------------------------------------------------ */

/** Classify one row against the stand-in project root. */
export function classifyRow(
  row: CorpusRow,
  opts: MutationOptions = classifyOptions(),
): MutationVerdict {
  return classifyBashMutation(row.command, opts);
}

/** One recorded row of a baseline file. */
export interface BaselineEntry {
  id: string;
  command: string;
  families: readonly FamilyId[];
  verdict: MutationVerdict;
}

/**
 * A baseline file: the classifier's answer for every row, plus enough context
 * to read the file without regenerating the corpus.
 */
export interface Baseline {
  /** The commit the baseline was captured at, when the caller knows it. */
  capturedAt?: string;
  root: string;
  protectedPaths: readonly string[];
  rows: BaselineEntry[];
}

export function buildBaseline(
  rows: readonly CorpusRow[],
  meta: { capturedAt?: string; root?: string } = {},
): Baseline {
  const root = meta.root ?? CLASSIFY_ROOT;
  const opts = classifyOptions(root);
  return {
    ...(meta.capturedAt === undefined ? {} : { capturedAt: meta.capturedAt }),
    root,
    protectedPaths: [...PROTECTED_PATHS],
    rows: rows.map((row) => ({
      id: row.id,
      command: row.command,
      families: row.families,
      verdict: classifyBashMutation(row.command, opts),
    })),
  };
}

/* ------------------------------------------------------------------ *
 * The differential
 * ------------------------------------------------------------------ */

export interface MovedRow {
  id: string;
  command: string;
  families: readonly FamilyId[];
  before: MutationVerdict;
  after: MutationVerdict;
  direction: "deny-to-allow" | "allow-to-deny" | "reason-only";
}

export interface Differential {
  /** Rows present in the baseline and absent from `rows`, by id. */
  missing: string[];
  /** Rows present in `rows` and absent from the baseline, by id. */
  added: string[];
  moved: MovedRow[];
}

/**
 * Compare a baseline against the classifier as it stands now.
 *
 * `reason-only` is its own bucket rather than noise: a verdict whose deny
 * survives but whose reason changed is a documentation change an agent reads,
 * and plan step 5 has to be able to see it without it drowning out the two
 * buckets that move a permission.
 */
export function diffBaseline(
  baseline: Baseline,
  rows: readonly CorpusRow[],
  opts: MutationOptions = classifyOptions(baseline.root),
): Differential {
  const byId = new Map(baseline.rows.map((entry) => [entry.id, entry]));
  const seen = new Set<string>();
  const moved: MovedRow[] = [];
  const added: string[] = [];

  for (const row of rows) {
    const before = byId.get(row.id);
    if (before === undefined) {
      added.push(row.id);
      continue;
    }
    seen.add(row.id);
    const after = classifyBashMutation(row.command, opts);
    if (JSON.stringify(after) === JSON.stringify(before.verdict)) continue;
    moved.push({
      id: row.id,
      command: row.command,
      families: row.families,
      before: before.verdict,
      after,
      direction:
        before.verdict.deny && !after.deny
          ? "deny-to-allow"
          : !before.verdict.deny && after.deny
            ? "allow-to-deny"
            : "reason-only",
    });
  }

  return {
    missing: baseline.rows.map((e) => e.id).filter((id) => !seen.has(id)),
    added,
    moved,
  };
}
