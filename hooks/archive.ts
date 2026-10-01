/**
 * The archive entry: the host's archive move over a JSON-controlled
 * workbench, for `bin/fusion-archive` and nothing else.
 *
 *   archive.js survey  <workbench> --candidates <file>
 *   archive.js move    <workbench> --survey <file> --into <YYMMDD-HHMM>-<slug>
 *   archive.js resume  <workbench> --inventory <file>
 *   archive.js abandon <workbench> --inventory <file>
 *
 * `<workbench>` is the absolute path of `fusion-workbench/`, found by the
 * wrapper. The units, the holds, the move and the recovery are
 * `lib/record-archive.ts`; the exit table is the wrapper's header.
 *
 * Output: `KEY=value` lines on stdout, the reason on stderr prefixed
 * `fusion-archive:`. The library is imported inside the `try`, so a module
 * missing from an install is exit 3 like any internal fault, never Node's own
 * 1, which the wrapper uses for "no workbench". No automatic hook runs this
 * entry.
 */

import { readFileSync } from "node:fs";

const FLAG: Record<string, string> = { survey: "--candidates", move: "--survey", resume: "--inventory", abandon: "--inventory" };

function usage(line: string): number {
  process.stderr.write(`fusion-archive: ${line}\n`);
  return 2;
}

async function main(argv: string[]): Promise<number> {
  const [sub, workbench, ...rest] = argv;
  const flag = FLAG[sub ?? ""];
  if (flag === undefined || workbench === undefined || workbench === "") return usage("usage: archive.js survey|move|resume|abandon <workbench> [flags]; run it through bin/fusion-archive");
  const flags = new Map<string, string>();
  for (let i = 0; i < rest.length; i += 2) {
    const [f, v] = [rest[i], rest[i + 1]];
    if (f !== flag && !(sub === "move" && f === "--into")) return usage(`${sub} takes no ${JSON.stringify(f)}`);
    if (v === undefined || v === "" || flags.has(f)) return usage(`${f} needs one value`);
    flags.set(f, v);
  }
  const missing = [flag, ...(sub === "move" ? ["--into"] : [])].find((f) => !flags.has(f));
  if (missing !== undefined) return usage(`${sub} needs ${missing}`);

  const lib = await import("./lib/record-archive.js");
  const file = flags.get(flag)!;
  let text = "";
  if (sub !== "resume" && sub !== "abandon") {
    try {
      text = readFileSync(file, "utf-8");
    } catch (e) {
      return usage(`${file} could not be read: ${e instanceof Error ? e.message : String(e)}`);
    }
  }
  let o;
  if (sub === "survey") {
    const lines = text.split("\n").map((l) => l.trim()).filter((l) => l !== "" && !l.startsWith("#"));
    const s = lib.survey(workbench, lines);
    o = "stop" in s ? s.stop : lib.surveyOutcome(s.survey);
  } else if (sub === "move") o = lib.move(workbench, text, flags.get("--into")!);
  else if (sub === "resume") o = lib.resume(workbench, file);
  else o = lib.abandon(workbench, file);
  process.stdout.write(o.lines.map((l) => `${l}\n`).join(""));
  if (o.detail !== undefined) process.stderr.write(`fusion-archive: ${o.detail}\n`);
  return lib.EXIT[o.kind];
}

try {
  process.exitCode = await main(process.argv.slice(2));
} catch (e) {
  process.stderr.write(`fusion-archive: an internal fault stopped the archive entry, a fusion bug or an incomplete install. If a fence was taken, inspect names it and \`bin/fusion-archive resume\` or \`abandon\` closes it.\n${e instanceof Error ? e.stack : String(e)}\n`);
  process.exitCode = 3;
}
