// ---------------------------------------------------------------------------
// The entry point of `dist/fusion-record.js`: one request, one response.
//
//   node dist/fusion-record.js            < request.json
//   node dist/fusion-record.js --file request.json
//
// The request is one JSON object on stdin, or in the file `--file` names; the
// response is one JSON object on stdout, followed by a newline. Exit codes:
//
//   0   a response was written, whatever its `ok`
//   2   usage: an unknown argument, `--file` without a path or with an
//       unreadable one; the reason is on stderr
//   3   the inlined schemas do not compile, so no request can be validated;
//       the reason is on stderr
//
// Nothing is written to stderr except on exit 2 and 3. A request that is not
// strict JSON is answered (`schema-invalid`, exit 0), not refused at the
// shell: the caller's protocol is JSON both ways. A `workbench` the request
// leaves out is taken from `FUSION_WORKBENCH`, which `bin/fusion-record`
// exports from `bin/fusion-workbench-root`.
// ---------------------------------------------------------------------------

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dispatch } from "./ops.js";
import { fail, type Response } from "./protocol.js";
import { installInlined } from "./schemas.js";
import { strictParse } from "../strict-json.js";

const USAGE = "usage: fusion-record [--file <request.json>]   (reads one JSON request from stdin otherwise; FUSION_WORKBENCH is the default workbench)";

interface Args {
  file: string | null;
}

function parseArgs(argv: string[]): Args | { usage: string } {
  const args: Args = { file: null };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--file") {
      const p = argv[i + 1];
      if (p === undefined || p.startsWith("--")) return { usage: "--file needs a path" };
      args.file = p;
      i++;
    } else {
      return { usage: `unknown argument ${JSON.stringify(a)}` };
    }
  }
  return args;
}

function readStdin(): Promise<Buffer> {
  return new Promise((resolvePromise, reject) => {
    const chunks: Buffer[] = [];
    process.stdin.on("data", (c: Buffer) => chunks.push(c));
    process.stdin.on("end", () => resolvePromise(Buffer.concat(chunks)));
    process.stdin.on("error", reject);
  });
}

function writeStdout(text: string): Promise<void> {
  return new Promise((resolvePromise) => {
    process.stdout.write(text, () => resolvePromise());
  });
}

export async function main(argv: string[], env: NodeJS.ProcessEnv = process.env): Promise<number> {
  const args = parseArgs(argv);
  if ("usage" in args) {
    process.stderr.write(`fusion-record: ${args.usage}\n${USAGE}\n`);
    return 2;
  }
  try {
    installInlined();
  } catch (e) {
    process.stderr.write(`fusion-record: the schemas do not load: ${e instanceof Error ? e.message : String(e)}\n`);
    return 3;
  }
  let bytes: Buffer;
  if (args.file !== null) {
    try {
      bytes = readFileSync(args.file);
    } catch (e) {
      process.stderr.write(`fusion-record: cannot read ${args.file}: ${e instanceof Error ? e.message : String(e)}\n${USAGE}\n`);
      return 2;
    }
  } else {
    bytes = await readStdin();
  }

  let response: Response;
  const parsed = strictParse(bytes);
  if (!parsed.ok) response = fail("schema-invalid", parsed.reason, `request: ${parsed.detail}`);
  else response = await dispatch(parsed.value, { defaultWorkbench: env.FUSION_WORKBENCH });
  await writeStdout(JSON.stringify(response) + "\n");
  return 0;
}

const invokedDirectly = (): boolean => {
  const entry = process.argv[1];
  if (entry === undefined) return false;
  try {
    return fileURLToPath(import.meta.url) === entry || import.meta.url.endsWith("/dist/fusion-record.js");
  } catch {
    return false;
  }
};

if (invokedDirectly()) {
  main(process.argv.slice(2)).then(
    (code) => {
      process.exitCode = code;
    },
    (e: unknown) => {
      process.stderr.write(`fusion-record: ${e instanceof Error ? (e.stack ?? e.message) : String(e)}\n`);
      process.exitCode = 1;
    },
  );
}
