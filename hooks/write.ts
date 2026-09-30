/**
 * The write entry: one codec mutation per run, for `bin/fusion-write` and
 * nothing else.
 *
 *   write.js <subcommand> <workbench> <person> <checkout> [flags]
 *
 * `<workbench>` is the absolute path of `fusion-workbench/`, and `<person>`
 * and `<checkout>` are what `bin/fusion-identity` printed, each "" when
 * unread: the wrapper keeps the workbench and identity branches, and this
 * program decides nothing about either. The subcommands, their flags and the
 * exit table are the wrapper's header; the sequence is `lib/record-write.ts`.
 * `log-repair` sends no request: it appends rows an earlier call retained.
 * `initialize` is Setup's: `<workbench>` is the target it names, and
 * `<person>` and `<checkout>` are "" because nothing it sends carries them.
 *
 * Output: `KEY=value` lines on stdout, reasons on stderr prefixed
 * `fusion-write:`. The library is imported inside the `try`, so a module
 * missing from an install is exit 3 like any internal fault, never Node's
 * own 1, which the wrapper uses for "stop". No automatic hook runs this entry.
 */

import type { Outcome } from "./lib/record-write.js";

const CODES: Record<Outcome["kind"], number> = { landed: 0, usage: 2, install: 3, unread: 4, ownership: 5, refused: 6, unknown: 7 };
const err = (line: string): void => {
  process.stderr.write(`fusion-write: ${line}\n`);
};
const out = (lines: string[]): void => {
  process.stdout.write(lines.map((l) => `${l}\n`).join(""));
};

async function main(argv: string[]): Promise<number> {
  const [sub, workbench, person, checkout, ...rest] = argv;
  if (workbench === undefined || workbench === "" || checkout === undefined) {
    err("usage: write.js <subcommand> <workbench> <person> <checkout> [flags]; run it through bin/fusion-write");
    return 2;
  }
  const lib = await import("./lib/record-write.js");
  if (sub === "log-repair") {
    if (rest.length > 0) {
      err("log-repair takes no flags");
      return 2;
    }
    const { repairRetained } = await import("./lib/record-change.js");
    const r = repairRetained(workbench);
    out([`appended=${r.appended}`, `retained=${r.retained}`]);
    if (r.detail !== undefined) err(r.detail);
    return 0;
  }
  if (sub === "initialize") {
    // The wrapper hands the target as <workbench> and no flags: there is no marker to find it by yet.
    if (rest.length > 0) {
      err("initialize takes --workbench <dir> alone");
      return 2;
    }
    const { ask } = await import("./lib/record-client.js");
    const o = lib.initialize(workbench, ask);
    const id = o.operationId === undefined ? [] : [`operation_id=${o.operationId}`];
    if (o.kind === "ready") {
      out([`result=${o.how}`, ...(o.workbenchId === null ? [] : [`workbench_id=${o.workbenchId}`]), ...id]);
      return 0;
    }
    out([`result=${o.kind}`, ...id]);
    err(o.detail);
    return CODES[o.kind];
  }
  const parsed = lib.parseFlags(sub, rest);
  if ("usage" in parsed) {
    err(parsed.usage);
    return 2;
  }
  const { ask } = await import("./lib/record-client.js");
  const identity = { ...(person !== "" && { person }), ...(checkout !== "" && { checkout }) };
  const o = lib.write({ ...parsed.call, workbench, identity }, ask);
  switch (o.kind) {
    case "landed":
      out([`result=landed`, `operation_id=${o.operationId}`, ...Object.entries(o.revisions).flatMap(([p, r]) => [`path=${p}`, `revision=${r}`]), `event=${o.event}`]);
      if (o.detail !== undefined) err(o.detail);
      break;
    case "refused":
      out([`result=refused`, `operation_id=${o.operationId}`]);
      err(`the codec refused ${sub}: ${o.refusal.class}/${o.refusal.reason}${o.refusal.detail === undefined ? "" : `: ${o.refusal.detail}`}. Nothing landed and nothing is retried.`);
      break;
    case "unknown": {
      // `--expected-revision` prints as `expected_revision=`, `--id` as `id=`: one line per flag the re-send repeats.
      const again = Object.entries(o.resend);
      out([`result=unknown`, `operation_id=${o.operationId}`, ...again.map(([f, v]) => `${f.slice(2).replace(/-/g, "_")}=${v}`)]);
      err(`${o.detail}. The ${sub} may have landed; nothing was retried. To learn its outcome, send the same arguments again with --operation-id ${o.operationId} ${again.map(([f, v]) => `${f} ${v}`).join(" ")}.`);
      break;
    }
    default:
      err(o.detail);
  }
  return CODES[o.kind];
}

try {
  process.exitCode = await main(process.argv.slice(2));
} catch (e) {
  process.stderr.write(`fusion-write: an internal fault stopped the write entry, a fusion bug or an incomplete install. The library catches every fault of its own after the mutation is sent; a fault past that point (writing this output) leaves a sent mutation's outcome to be read with show.\n${e instanceof Error ? e.stack : String(e)}\n`);
  process.exitCode = 3;
}
