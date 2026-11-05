// What a `prior` part's own commands may start, and that the two release help
// parts carry one list of versions.
//
// Prior's answer to request 76 question 6: Prior guarantees `bash`, `node`,
// `git`, `sed`, `head` and `od`, and a `prior` part may rely on those alone.
//
// This reads a watch list, so it proves nothing about a command outside the
// list, or about one built at run time, which no text scan can see. It reads
// `prior` parts only: what a neutral block or a bin/ helper starts is
// 261105-1023-neutral-shell-blocks-and-carried-helpers-rely-on-commands-outside-priors-guaranteed-six.md,
// and request 78 asks Prior about those.

import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { catalogRoot, INCLUDE_DIRECTIVE } from "../render.js";

const CATALOG = catalogRoot();

/** Held `prior: unsupported`, see prior-held-unsupported.test.ts: their parts stay unchanged. */
const HELD = new Set(["skill-commit", "skill-cleanup"]);

/** The six, and the only bare first elements of an argv. */
const GUARANTEED = new Set(["bash", "node", "git", "sed", "head", "od"]);

/** The plan's list plus the three the image measurement found: comm, rmdir, uname. */
const WATCHED = "python3 shasum awk find sort mktemp date ls cat tail wc grep cut tr xargs stat mv cp rm mkdir tee uniq basename dirname touch chmod readlink realpath sleep comm rmdir uname".split(" ");

/** The sentence every Setup binding carries. It names `date` so that a rule's form is translated. */
const BINDING_SENTENCE =
  "Prior guarantees `bash`, `node`, `git`, `sed`, `head` and `od` in this container (request 76, question 6); this text's own commands use those alone. Where a rule says `date +%y%m%d-%H%M`, use `[\"bash\", \"-c\", \"printf '%(%y%m%d-%H%M)T\\\\n' -1\"]`.";

/** A hit here is not a command the part runs. Each row is one file and one word. */
const EXEMPT: { file: string; word: string; why: string }[] = [
  { file: "skill-archive/parts/37-prior.md", word: "mv", why: "names mv as what not to do to a record pair" },
  { file: "state-auditor/parts/18-prior.md", word: "mv", why: "names mv as what not to do to a record pair" },
  { file: "skill-setup/parts/25-prior.md", word: "shasum", why: "the shape shasum prints, in the provenance file's definition" },
  { file: "explorer/parts/02-prior.md", word: '["..."', why: "a JSON example of the role's answer, not an argv" },
];

const POSITION = String.raw`(?:^[ \t]*|&&[ \t]*|\|\|[ \t]*|\|[ \t]*|;[ \t]*|\$\([ \t]*|\{[ \t]+|\b(?:if|then|do|else)[ \t]+|!\s+|` + "`" + ")";
const WATCH_RE = new RegExp(`${POSITION}(${WATCHED.join("|")})(?=[ \\t]|$|\`|\\))`, "gm");
const ARGV_RE = /(?<![\w\]])\["([^"]*)"/g;

function withoutSanctioned(text: string): string {
  return text
    .split("\n")
    .filter((line) => !INCLUDE_DIRECTIVE.test(line))
    .join("\n")
    .split(BINDING_SENTENCE)
    .join("");
}

/** Watch-listed commands at a command position. */
export function commandHits(text: string): string[] {
  return [...withoutSanctioned(text).matchAll(WATCH_RE)].map((m) => m[1]);
}

/** An argv whose first element is neither one of the six nor an install-tree helper. */
export function argvHits(text: string): string[] {
  return [...withoutSanctioned(text).matchAll(ARGV_RE)]
    .map((m) => m[1])
    .filter((first) => !GUARANTEED.has(first) && !first.startsWith("$FUSION_PLUGIN_ROOT/"))
    .map((first) => `["${first}"`);
}

/** The release versions a help part names, in order. */
export function versionTokens(text: string): string[] {
  return text.match(/\d+\.\d+\.\d+/g) ?? [];
}

function priorParts(): { file: string; text: string }[] {
  const out: { file: string; text: string }[] = [];
  const profiles = join(CATALOG, "profiles");
  for (const id of readdirSync(profiles)) {
    if (HELD.has(id)) continue;
    for (const f of readdirSync(join(profiles, id, "parts"))) {
      if (!f.endsWith("-prior.md")) continue;
      const file = `${id}/parts/${f}`;
      out.push({ file, text: readFileSync(join(profiles, file), "utf8") });
    }
  }
  return out;
}

function exempted(file: string, hit: string): boolean {
  return EXEMPT.some((e) => e.file === file && e.word === hit);
}

describe("a prior part's own commands", () => {
  const parts = priorParts();

  it("start no watch-listed command outside the exemptions", () => {
    const hits = parts.flatMap(({ file, text }) => commandHits(text).filter((h) => !exempted(file, h)).map((h) => `${file}: ${h}`));
    expect(hits).toEqual([]);
  });

  it("give an argv only one of the six or an install-tree helper as its first element", () => {
    const hits = parts.flatMap(({ file, text }) => argvHits(text).filter((h) => !exempted(file, h)).map((h) => `${file}: ${h}`));
    expect(hits).toEqual([]);
  });

  it("every exemption still names something the file says", () => {
    for (const e of EXEMPT) {
      const text = parts.find((p) => p.file === e.file)?.text;
      expect(text, e.file).toBeDefined();
      expect([...commandHits(text!), ...argvHits(text!)], `${e.file}: ${e.why}`).toContain(e.word);
    }
  });

  it("every Setup binding states the six and the clock call", () => {
    const setup = parts.filter(({ text }) => text.includes('["bash", "-c", "pwd"]'));
    expect(setup.length).toBeGreaterThan(0);
    for (const { file, text } of setup) expect(text, file).toContain(BINDING_SENTENCE);
  });

  // The rows that show each check turns red on an inserted violation.
  it.each([
    ["line start", "cut -c1-64 x\n", "cut"],
    ["after &&", "a && mv x y\n", "mv"],
    ["after ||", "a || rm -f x\n", "rm"],
    ["after |", "a | grep -q x\n", "grep"],
    ["after ;", "a; find . -name x\n", "find"],
    ["in $(", 'x="$(date +%s)"\n', "date"],
    ["after a backtick", "run `shasum -a 256 x`\n", "shasum"],
    ["after {", "[ -f x ] || { cp a b; }\n", "cp"],
    ["after if", "if grep -q x y; then z; fi\n", "grep"],
  ])("a watch-listed command %s is a hit", (_where, text, word) => {
    expect(commandHits(text)).toContain(word);
  });

  it("a word in prose, the six and a sed form are no hit", () => {
    expect(commandHits("and find the one this checkout holds\n")).toEqual([]);
    expect(commandHits("a | sed -n '$p'\nnode -e 'x'\n")).toEqual([]);
  });

  it("an argv naming anything else is a hit, and the six and a helper are not", () => {
    expect(argvHits('`["cat", "<path>"]`')).toEqual(['["cat"']);
    expect(argvHits('`["pwd"]`')).toEqual(['["pwd"']);
    expect(argvHits('[ "$E" -eq 0 ] and v["record"]')).toEqual([]);
    expect(argvHits('`["bash", "-c", "pwd"]` `["sed", "-n", "1,2p", "x"]` `["$FUSION_PLUGIN_ROOT/bin/fusion-paths"]`')).toEqual([]);
  });

  it("an include line and the binding sentence are read as nothing", () => {
    expect(commandHits(`${BINDING_SENTENCE}\n`)).toEqual([]);
    expect(commandHits("{{include rules/user-facing-output.md}}\n")).toEqual([]);
  });
});

describe("the release help parts", () => {
  const part = (tag: string) => readFileSync(join(CATALOG, "profiles", "skill-help", "parts", `21-${tag}.md`), "utf8");

  it("name the same versions in the same order", () => {
    expect(versionTokens(part("prior"))).toEqual(versionTokens(part("claude")));
    expect(versionTokens(part("claude")).length).toBeGreaterThan(0);
  });

  it("a release that edits one part turns this red", () => {
    const claude = versionTokens(`${part("claude")} 99.0.1`);
    expect(claude).not.toEqual(versionTokens(part("prior")));
  });
});
