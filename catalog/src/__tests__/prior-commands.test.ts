// What a `prior` part's own commands may start, and that the two release help
// parts carry one list of versions.
//
// Prior's answer to request 76 question 6: Prior guarantees `bash`, `node`,
// `git`, `sed`, `head` and `od`, and a `prior` part may rely on those alone.
//
// This reads a watch list, so it proves nothing about a command outside the
// list, or about one built at run time, which no text scan can see. An include
// line is dropped and not expanded, so a rule it brings in is not read. It reads
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
  "Prior guarantees `bash`, `node`, `git`, `sed`, `head` and `od` in this container (request 76, question 6); the commands this binding names use those alone. A neutral block may run others, and one that ends with exit 127 has met a host gap: report the command it names, and never repair the gap. Where a rule says `date +%y%m%d-%H%M`, use `[\"bash\", \"-c\", \"printf '%(%y%m%d-%H%M)T\\\\n' -1\"]`.";

/** A hit here is not a command the part runs. Each row is one exact span of one file; the rest of the file is read. */
const EXEMPT: { file: string; span: string; word: string; why: string }[] = [
  { file: "skill-archive/parts/37-prior.md", span: "so a `mv` would leave", word: "mv", why: "names mv as what not to do to a record pair" },
  { file: "state-auditor/parts/18-prior.md", span: "between stores with `mv`.", word: "mv", why: "names mv as what not to do to a record pair" },
  { file: "skill-setup/parts/25-prior.md", span: "in the shape `shasum -a 256` prints", word: "shasum", why: "the shape shasum prints, in the provenance file's definition" },
  { file: "skill-archive/parts/29-prior.md", span: "`MMDD`) date prefix", word: "date", why: "a filename's date prefix in prose, after a closing parenthesis" },
  { file: "explorer/parts/02-prior.md", span: '"uncertainties": ["..."]', word: '["..."', why: "a JSON example of the role's answer, not an argv" },
];

/** Where a command can start: a line, an operator, a subshell, a case arm, a brace, a keyword, a backtick, a bash -c string. */
const POSITION = String.raw`(?:^[ \t]*|[|&;(][ \t]*|\)[ \t]+|\{[ \t]+|\b(?:if|elif|then|do|else|while|until)[ \t]+|!\s+|\bbash[ \t]+-c[ \t]+['"]|` + "`" + ")";
/** What may stand between the position and the name: assignments, a wrapper, a directory. */
const PREFIX = String.raw`(?:[A-Za-z_]\w*=[^ \t]*[ \t]+)*(?:(?:env|command|exec|builtin|nohup|nice|time)[ \t]+)*(?:[\w.-]*/)*`;
const WATCH_RE = new RegExp(`${POSITION}${PREFIX}(${WATCHED.join("|")})(?=[ \\t]|$|\`|\\)|[|;<>&])`, "gm");
/** An argv opening. With a space after the bracket only a comma tells it from the shell's `[ "$x" -eq 0 ]`. */
const ARGV_RE = /(?<![\w\]])\[(?:"([^"]*)"|\s+"([^"]*)"(?=\s*,))/g;
/** A `["bash", "-c", "<body>"]`, whose body is commands. */
const BASH_C_RE = /\[\s*"bash"\s*,\s*(?:"-\w+"\s*,\s*)*"((?:[^"\\]|\\.)*)"/g;

function withoutSanctioned(text: string): string {
  return text
    .split("\n")
    .filter((line) => !INCLUDE_DIRECTIVE.test(line))
    .join("\n")
    .split(BINDING_SENTENCE)
    .join("");
}

/** A bash -c span as the lines its body would run, one JSON string layer decoded. */
function withBashBodies(text: string): string {
  return text.replace(BASH_C_RE, (_span, body: string) => `\n${body.replace(/\\(.)/g, (_m, c: string) => (c === "n" ? "\n" : c))}\n`);
}

/** Watch-listed commands at a command position. */
export function commandHits(text: string): string[] {
  return [...withBashBodies(withoutSanctioned(text)).matchAll(WATCH_RE)].map((m) => m[1]);
}

/** An argv whose first element is neither one of the six nor an install-tree helper. */
export function argvHits(text: string): string[] {
  return [...withoutSanctioned(text).matchAll(ARGV_RE)]
    .map((m) => m[1] ?? m[2])
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

/** The file without its exempted spans, so a command anywhere else in it is still read. */
function withoutExempt(file: string, text: string): string {
  return EXEMPT.filter((e) => e.file === file).reduce((rest, e) => rest.split(e.span).join(""), text);
}

function partHits(file: string, text: string): string[] {
  const rest = withoutExempt(file, text);
  return [...commandHits(rest), ...argvHits(rest)];
}

describe("a prior part's own commands", () => {
  const parts = priorParts();

  it("start no watch-listed command outside the exemptions", () => {
    const hits = parts.flatMap(({ file, text }) => commandHits(withoutExempt(file, text)).map((h) => `${file}: ${h}`));
    expect(hits).toEqual([]);
  });

  it("give an argv only one of the six or an install-tree helper as its first element", () => {
    const hits = parts.flatMap(({ file, text }) => argvHits(withoutExempt(file, text)).map((h) => `${file}: ${h}`));
    expect(hits).toEqual([]);
  });

  it("every exemption is a span its file holds and a hit without the exemption", () => {
    for (const e of EXEMPT) {
      const text = parts.find((p) => p.file === e.file)?.text;
      expect(text, e.file).toBeDefined();
      expect(text, `${e.file}: ${e.why}`).toContain(e.span);
      expect([...commandHits(e.span), ...argvHits(e.span)], `${e.file}: ${e.why}`).toContain(e.word);
    }
  });

  it.each([
    ["skill-archive/parts/37-prior.md", "mv a b\n", "mv"],
    ["state-auditor/parts/18-prior.md", "mv a b\n", "mv"],
    ["skill-archive/parts/29-prior.md", "date +%s\n", "date"],
    ["skill-setup/parts/25-prior.md", "shasum -a 256 x\n", "shasum"],
    ["explorer/parts/02-prior.md", '`["...", "x"]`\n', '["..."'],
  ])("a real command inserted in the exempted file %s is a hit", (file, real, word) => {
    const text = parts.find((p) => p.file === file)!.text;
    expect(partHits(file, text)).toEqual([]);
    expect(partHits(file, `${text}\n${real}`)).toContain(word);
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
    ["in a bash -c argv", '["bash", "-c", "mv a b"]', "mv"],
    ["later in a bash -c argv", '`["bash", "-c", "a \\"b\\" | sort"]`', "sort"],
    ["in a spaced bash -c argv", '[ "bash", "-c", "mv a b" ]', "mv"],
    ["in a bash -c string", "bash -c 'mv a b'\n", "mv"],
    ["directly before a pipe", "ls|x\n", "ls"],
    ["directly before a semicolon", "x; ls;\n", "ls"],
    ["directly before a redirect", "a; ls>x\n", "ls"],
    ["directly before an ampersand", "a; ls&\n", "ls"],
    ["in a subshell", "(cut -c1 x)\n", "cut"],
    ["in a process substitution", "x <(sort y)\n", "sort"],
    ["after a background &", "a & sort y\n", "sort"],
    ["in a case arm", "case x in a) sort y ;; esac\n", "sort"],
    ["after elif", "elif grep -q x y\n", "grep"],
    ["after while", "while grep -q x y\n", "grep"],
    ["after until", "until grep -q x y\n", "grep"],
    ["after an assignment", "LC_ALL=C sort x\n", "sort"],
    ["after env", "env sort x\n", "sort"],
    ["after command", "command sort x\n", "sort"],
    ["by its path", "/usr/bin/sort x\n", "sort"],
  ])("a watch-listed command %s is a hit", (_where, text, word) => {
    expect(commandHits(text)).toContain(word);
  });

  it("a word in prose, the six and a sed form are no hit", () => {
    expect(commandHits("and find the one this checkout holds\n")).toEqual([]);
    expect(commandHits("a | sed -n '$p'\nnode -e 'x'\n")).toEqual([]);
    expect(commandHits('["bash", "-c", "pwd"] ["bash", "-c", "sed -n \'1,2p\' x"]')).toEqual([]);
    expect(commandHits("command -v sort\n")).toEqual([]);
  });

  it("an argv naming anything else is a hit, and the six and a helper are not", () => {
    expect(argvHits('`["cat", "<path>"]`')).toEqual(['["cat"']);
    expect(argvHits('`["pwd"]`')).toEqual(['["pwd"']);
    expect(argvHits('[ "cat", "x" ]')).toEqual(['["cat"']);
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
