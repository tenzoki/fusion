import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { pluginRoot, shippedPrompts } from "./helpers/citation-scan.js";

// ---------------------------------------------------------------------------
// Glob no-match lint gate (plan step 6, issue 260717-1903).
//
// The Bash tool runs zsh 5.9 with `nomatch` on by default. Under zsh an
// unmatched glob is a FATAL error raised during argument expansion — it kills
// the script before any `[ -e "$f" ] || continue` guard inside the loop body
// can fire. The dotglob idiom `dir/.[!.]*` (include-dotfiles-except-`.`/`..`)
// is the single most frequent and most silent trigger: it matches nothing in
// the common case (a directory with no dotfiles) and so aborts the whole block.
// Under bash the same glob expands to its literal string and the guard skips
// it — which is why these loops passed when a human re-ran them under bash.
//
// The fix (steps 1-5) replaced every vulnerable `for f in <glob>` loop with a
// `find -mindepth 1 -maxdepth 1 | while read` loop, which never expands a glob
// and so cannot abort. After that fix, `.[!.]*` appears NOWHERE in a fenced
// shell block in the tree, so this gate starts and stays green with zero
// exemptions.
//
// Scope is deliberately NARROW (plan "Guardrail" section): it targets the raw
// `.[!.]*` dotglob inside fenced ```bash / ```sh blocks only. It does not try
// to be a general "no glob in a for-loop" gate — many legitimate globs remain
// in `case` patterns, in prose, and in `-name` predicates, and a broad gate
// would need a large exemption list and drift into false positives. The
// per-step zsh verification in the plan is the primary correctness surface;
// this gate is a targeted backstop against the exact regression that hurt.
//
// This is a guard, not a fixer (rules/critical-stance.md §2): it reads and
// asserts, it never rewrites a prompt.
// ---------------------------------------------------------------------------


// The no-match-fatal dotglob idiom, in both its negation spellings:
//   .[!.]*   (POSIX)          .[^.]*   (bash/ksh equivalent)
// Both mean "dotfiles except `.` and `..`" and both abort under zsh nomatch.
const DOTGLOB = /\.\[(?:!|\^)\.\]\*/;

interface Violation {
  file: string;
  line: number;
  snippet: string;
}

/**
 * Return only the lines that live inside a fenced ```bash or ```sh code block,
 * each tagged with its 1-based line number in the original file. Prose lines
 * (including a documented "do not write `.[!.]*`" warning) are excluded, so the
 * gate fires on live shell only.
 */
function fencedShellLines(text: string): { line: number; text: string }[] {
  const out: { line: number; text: string }[] = [];
  let inShell = false;
  text.split("\n").forEach((raw, i) => {
    const fence = raw.match(/^\s*```+\s*([A-Za-z0-9_-]*)\s*$/);
    if (fence) {
      if (inShell) {
        inShell = false; // closing fence
      } else {
        const lang = fence[1].toLowerCase();
        inShell = lang === "bash" || lang === "sh" || lang === "shell";
      }
      return; // the fence line itself is never scanned
    }
    if (inShell) out.push({ line: i + 1, text: raw });
  });
  return out;
}

/** Every raw `.[!.]*` dotglob inside a fenced shell block in `text`. */
function scan(file: string, text: string): Violation[] {
  const out: Violation[] = [];
  for (const { line, text: body } of fencedShellLines(text)) {
    if (DOTGLOB.test(body)) {
      out.push({ file, line, snippet: body.trim().slice(0, 120) });
    }
  }
  return out;
}

/** An actionable, HYG-NO-SILENT-FAIL message: file, line, and the fix. */
function report(violations: Violation[]): string {
  return violations
    .map(
      (v) =>
        `  ${v.file}:${v.line}  raw no-match-fatal dotglob '.[!.]*' in a shell block\n` +
        `    ${v.snippet}\n` +
        `    -> replace the 'for f in <glob>' loop with a find-driven while loop:\n` +
        `       while IFS= read -r f; do BODY; done < <(find <root> -mindepth 1 -maxdepth 1 ...)\n` +
        `       (a glob that matches nothing aborts the whole block under zsh nomatch).`,
    )
    .join("\n");
}

describe("glob no-match lint: no raw .[!.]* dotglob in prompt/skill shell blocks", () => {
  it("passes on the whole tree — every fenced shell block is clean", () => {
    const all: Violation[] = [];
    for (const { rel, abs } of shippedPrompts()) {
      all.push(...scan(rel, readFileSync(abs, "utf-8")));
    }
    expect(
      all,
      `raw no-match-fatal dotglobs must be converted to find-driven loops:\n${report(all)}`,
    ).toEqual([]);
  });
});

describe("glob no-match lint: the gate fires on shell, not on prose", () => {
  it("catches a .[!.]* spliced into a fenced bash block", () => {
    const text = [
      "Some prose.",
      "```bash",
      'for f in "$WB/$d"/* "$WB/$d"/.[!.]*; do echo "$f"; done',
      "```",
    ].join("\n");
    const v = scan("fixture.md", text);
    expect(v.length).toBe(1);
    expect(v[0].line).toBe(3);
    expect(report(v)).toContain("find");
  });

  it("catches the .[^.]* equivalent negation spelling too", () => {
    const text = ["```sh", 'for f in dir/.[^.]*; do echo "$f"; done', "```"].join("\n");
    expect(scan("fixture.md", text).length).toBe(1);
  });

  it("does NOT fire on a .[!.]* mentioned in prose outside a shell block", () => {
    const prose = "A raw `dir/.[!.]*` glob is no-match-fatal under zsh; do not write it.";
    expect(scan("fixture.md", prose)).toEqual([]);
  });

  it("does NOT fire on a .[!.]* in a non-shell fenced block", () => {
    const text = ["```text", "example: dir/.[!.]*", "```"].join("\n");
    expect(scan("fixture.md", text)).toEqual([]);
  });

  it("does NOT fire on the find-driven replacement", () => {
    const text = [
      "```bash",
      'while IFS= read -r f; do echo "$f"; done < <(find "$WB/$d" -mindepth 1 -maxdepth 1)',
      "```",
    ].join("\n");
    expect(scan("fixture.md", text)).toEqual([]);
  });
});
