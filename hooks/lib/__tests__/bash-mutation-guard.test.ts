import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import {
  classifyBashMutation,
  MUTATION_VERBS,
  MUTATION_GIT_SUBCOMMANDS,
} from "../bash-mutation-guard.js";
import type { MutationOptions } from "../bash-mutation-guard.js";
import { GRAMMAR_PREFIXES, WRAPPER_PROGRAMS } from "../command-word.js";
import { parseCommand, tokenize } from "../shell-parse.js";

const HERE = dirname(fileURLToPath(import.meta.url));

/**
 * The shipped protected list, mirrored from `hooks/config.json`. Mirrored
 * rather than imported so the suite stays pure (no filesystem in the hot path,
 * per the plan's testing strategy) — and pinned against the real file by the
 * first test below, because the ancestor cases below are only meaningful
 * against the list this project actually ships.
 */
const PROTECTED = [
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

/** Stand-in project root for the absolute-path cases. */
const PROJECT_ROOT = "/project";

/**
 * The injected normaliser, mirroring `guard.ts`'s `normalizeToRelative`: an
 * absolute path under the project root becomes project-relative, anything else
 * is returned unchanged (and therefore matches no relative pattern).
 */
function normalize(raw: string): string {
  if (!raw.startsWith("/")) return raw;
  if (raw === PROJECT_ROOT) return "";
  if (raw.startsWith(PROJECT_ROOT + "/")) return raw.slice(PROJECT_ROOT.length + 1);
  return raw;
}

/**
 * `env: {}` is the DEFAULT, and it is a claim rather than a formality: every
 * case below that does not name an environment is asserting the behaviour of a
 * shell with no `CDPATH` set, which is the environment almost every user has.
 * A case that wants one passes `{ env: { CDPATH: "…" } }` and gets it for that
 * call only — nothing here touches `process.env`, so no case can leak into
 * another or into the process running the suite.
 */
function classify(command: string, extra: Partial<MutationOptions> = {}) {
  return classifyBashMutation(command, {
    protectedPaths: PROTECTED,
    normalize,
    env: {},
    ...extra,
  });
}

/** Denies? — the shorthand every table below is written in. */
function denies(command: string, extra: Partial<MutationOptions> = {}): boolean {
  return classify(command, extra).deny;
}

/** Assert a whole list of commands denies, naming the offender on failure. */
function expectAllDeny(commands: string[], extra: Partial<MutationOptions> = {}): void {
  for (const cmd of commands) {
    expect(denies(cmd, extra), `expected DENY: ${JSON.stringify(cmd)}`).toBe(true);
  }
}

/** Assert a whole list of commands allows, naming the offender on failure. */
function expectAllAllow(commands: string[], extra: Partial<MutationOptions> = {}): void {
  for (const cmd of commands) {
    const v = classify(cmd, extra);
    expect(v.deny, `expected ALLOW: ${JSON.stringify(cmd)} — ${v.reason ?? ""}`).toBe(
      false,
    );
  }
}

/* ------------------------------------------------------------------ *
 * The fixture is the real list
 * ------------------------------------------------------------------ */

describe("the protected-path fixture", () => {
  it("is the list hooks/config.json actually ships", () => {
    // A drifted fixture would silently weaken every ancestor and every
    // must-never-deny case below, so pin it rather than trust it.
    const raw = readFileSync(join(HERE, "..", "..", "config.json"), "utf8");
    const shipped = JSON.parse(raw).guard.protectedPaths as string[];
    expect(PROTECTED).toEqual(shipped);
  });
});

/* ------------------------------------------------------------------ *
 * 1. The verb table, exhaustively — both directions
 * ------------------------------------------------------------------ */

interface VerbCase {
  /** The key in MUTATION_VERBS (or MUTATION_GIT_SUBCOMMANDS) this row covers. */
  verb: string;
  /** Commands whose WRITTEN operand is protected. */
  deny: string[];
  /** Commands of the same verb that only READ the protected path, or miss it. */
  allow: string[];
}

/**
 * One row per verb, in both directions. The written/read distinction is the
 * point of the table, so every row carries at least one allow case where the
 * protected path appears as a READ operand — `cp rules/x.md /tmp/y` allows and
 * `cp /tmp/y rules/x.md` denies is the shape.
 */
const VERB_CASES: VerbCase[] = [
  {
    verb: "mv",
    deny: [
      "mv rules/x.md /tmp/y", // source: mv REMOVES it
      "mv /tmp/y rules/x.md", // destination
      "mv agents/coder.md agents/planner.md",
    ],
    allow: ["mv /tmp/a /tmp/b", "mv build/out.js build/out.min.js"],
  },
  {
    verb: "rm",
    deny: ["rm rules/x.md", "rm -f agents/coder.md", "rm -rf skills/setup"],
    allow: ["rm /tmp/x", "rm -rf build/out", "rm -f hooks/dist/guard.js"],
  },
  {
    verb: "cp",
    deny: ["cp /tmp/y rules/x.md", "cp -R /tmp/agents agents/sub"],
    allow: ["cp rules/x.md /tmp/y", "cp -R rules /tmp/backup", "cp hooks/config.json /tmp/c"],
  },
  {
    verb: "ln",
    deny: ["ln -s /tmp/y rules/x.md", "ln /tmp/y agents/coder.md"],
    allow: ["ln -s rules/x.md /tmp/link", "ln -s agents/coder.md /tmp/c.md"],
  },
  {
    verb: "install",
    deny: ["install -m 644 /tmp/y rules/x.md", "install /tmp/monitor bin/monitor"],
    allow: ["install -m 644 rules/x.md /tmp/y", "install -m 755 bin/monitor /tmp/monitor"],
  },
  {
    verb: "tee",
    deny: ["tee rules/x.md", "echo x | tee -a hooks/config.json"],
    allow: ["tee /tmp/log", "echo x | tee -a /tmp/build.log"],
  },
  {
    verb: "truncate",
    deny: ["truncate -s 0 rules/x.md", "truncate -s 0 fusion-workbench/.guard-state/churn.json"],
    allow: [
      "truncate -s 0 /tmp/log",
      "truncate -r rules/x.md /tmp/out", // -r READS the reference file
    ],
  },
  {
    verb: "dd",
    deny: ["dd of=rules/x.md", "dd if=/dev/zero of=hooks/config.json bs=1"],
    allow: ["dd if=rules/x.md of=/tmp/y", "dd bs=4M if=/dev/zero of=/tmp/x"],
  },
  {
    verb: "sed",
    deny: ["sed -i '' 's/MUST/may/' rules/x.md", "sed -i 's/a/b/' agents/coder.md"],
    allow: [
      "sed -i '' 's/a/b/' /tmp/notes.txt",
      "sed 's/MUST/may/' rules/x.md", // no in-place flag: reads only
      "sed -n '1,20p' rules/critical-stance.md",
    ],
  },
  {
    verb: "perl",
    deny: ["perl -pi -e 's/a/b/' rules/x.md", "perl -i.bak -pe 's/a/b/' agents/coder.md"],
    allow: [
      "perl -pi -e 's/a/b/' /tmp/notes.txt",
      "perl -pe 's/a/b/' rules/x.md", // no in-place flag: reads only
      "perl -I lib -e 'print' rules/x.md", // -I is not -i
    ],
  },
];

const GIT_VERB_CASES: VerbCase[] = [
  {
    verb: "mv",
    deny: [
      "git mv rules/x.md docs/",
      "git mv /tmp/y rules/x.md",
      "git -C /repo mv rules/x.md docs/",
    ],
    allow: ["git mv src/a.ts src/b.ts", "git mv build/a.js build/b.js"],
  },
  {
    verb: "rm",
    deny: ["git rm rules/x.md", "git rm --cached agents/coder.md", "git rm -r skills/setup"],
    allow: ["git rm build/out.js", "git rm --cached /tmp/x"],
  },
  {
    // `git clean -fdx rules` deletes every untracked file under a protected
    // directory. It mutates only under `-f`, so the dry run stays a read.
    verb: "clean",
    deny: ["git clean -fdx rules", "git clean -f agents/coder.md", "git clean -fd skills"],
    allow: [
      "git clean -n rules", // dry run: -n without -f writes nothing
      "git clean -fdx hooks/dist",
      "git clean -fdx build",
      "git clean -fdx -e rules/keep build", // the exclude PATTERN is not a target
      "git clean -fdx --exclude rules/keep build",
    ],
  },
  {
    // The bare form is `git checkout -- <paths>` under its modern name and MUST
    // stay allowed; `--source=<commit>` is a different operation.
    verb: "restore",
    deny: [
      "git restore --source=HEAD~1 rules/x.md",
      "git restore --source HEAD~1 agents/coder.md",
      "git restore -s HEAD~1 skills/setup/SKILL.md",
    ],
    allow: [
      "git restore rules/x.md",
      "git restore --staged agents/coder.md",
      "git restore --source=HEAD~1 build/out.js",
    ],
  },
  {
    // `git stash push <paths>` removes the named paths from the working tree —
    // and it is the ONLY stash form that names paths. Reading every positional
    // of every form made the sub-subcommand word itself a written path, so
    // `cd hooks && git stash pop` denied on `hooks/pop`
    // (`issues/260801-1956_c_the-git-stash-row-reads-its-sub-subcommand-and-refs-as-written-paths.md`).
    verb: "stash",
    deny: [
      "git stash push rules/x.md",
      "git stash push -u agents/",
      "git stash -- rules/x.md", // measured: the bare form with a pathspec IS push
      "git stash push -m msg rules/x.md",
      "git stash push -- rules/x.md",
    ],
    allow: [
      "git stash",
      "git stash list",
      "git stash pop",
      "git stash push build/out.js",
      // The sub-subcommand word is not a path, wherever it is run from.
      "cd hooks && git stash pop",
      "cd rules && git stash list",
      "cd agents && git stash drop",
      "cd hooks && git stash apply",
      "cd hooks && git stash clear",
      // A message and a ref are not paths either, so neither reaches the
      // fail-closed pass.
      'git stash push -m "$MSG"',
      'git stash show "$REF"',
      'git stash apply "$STASH"',
      'git stash branch "$NEW" "$STASH"',
      "git stash save 'work in progress on rules/x.md'",
      // Knock-on of the row: with no written operand the redirect target is no
      // longer dragged into the fail-closed pass, which is the exact case the
      // sibling fix set out to allow.
      'git stash list > "$LOG"',
      'git stash show > "$OUT"',
      // git refuses to assume `push` for an unexpected token, so a typo writes
      // nothing rather than denying on a phantom path.
      "cd hooks && git stash poop",
      // Measured against git 2.53.0: every non-push form with a path operand
      // is refused outright ("subcommand wasn't specified; 'push' can't be
      // assumed"), leaving the file untouched. `save` takes the path as its
      // MESSAGE.
      "git stash pop rules/x.md",
      "git stash apply rules/x.md",
      "git stash drop rules/x.md",
      "git stash show rules/x.md",
      "git stash list -- rules/x.md",
      "git stash save rules/x.md",
      "cd hooks && git stash show -- config.json",
    ],
  },
];

/**
 * The sub-subcommand decides which stash form this is, so one built at run time
 * leaves the guard unable to tell `push` from `pop`. Guessing "not push" is the
 * direction that loses a deny, so the word is fail-closed — and the rest of the
 * line is still read as the implicit form, which is what lets a visible
 * protected pathspec name the deny instead of the variable (the same pass
 * ordering that makes `mv $SRC rules/` report `rules/`).
 */
describe("git stash — a run-time sub-subcommand is fail-closed, a typo is not", () => {
  it("denies when the sub-subcommand cannot be resolved", () => {
    expectAllDeny([
      "git stash $X rules/x.md",
      'git stash "$X" rules/x.md',
      "git stash $SUB -- rules/x.md",
      "cd hooks && git stash $X -- x.md",
    ]);
  });

  it("names the visible protected pathspec rather than the variable", () => {
    expect(classify("git stash $X rules/x.md").targetPath).toBe("rules/x.md");
  });

  it("allows a literal word git will simply refuse", () => {
    expectAllAllow([
      "git stash poop",
      "cd hooks && git stash poop",
      "cd rules && git stash typo",
    ]);
  });
});

describe("verb table — every row denies a written protected operand", () => {
  it("covers every verb in MUTATION_VERBS", () => {
    // A verb added to the table without a test fails here rather than shipping
    // unexercised. This is what makes "exhaustively" a checkable claim.
    expect(new Set(VERB_CASES.map((c) => c.verb))).toEqual(
      new Set(Object.keys(MUTATION_VERBS)),
    );
  });

  it("covers every subcommand in MUTATION_GIT_SUBCOMMANDS", () => {
    expect(new Set(GIT_VERB_CASES.map((c) => c.verb))).toEqual(
      new Set(Object.keys(MUTATION_GIT_SUBCOMMANDS)),
    );
  });

  for (const c of VERB_CASES) {
    it(`${c.verb} — denies a written protected operand`, () => {
      expectAllDeny(c.deny);
    });
    it(`${c.verb} — allows when the protected path is only read`, () => {
      expectAllAllow(c.allow);
    });
  }

  for (const c of GIT_VERB_CASES) {
    it(`git ${c.verb} — denies a written protected operand`, () => {
      expectAllDeny(c.deny);
    });
    it(`git ${c.verb} — allows an unprotected operand`, () => {
      expectAllAllow(c.allow);
    });
  }

  it("ALLOWS git checkout HEAD -- <protected> (fusion's own revert strategy)", () => {
    expectAllAllow([
      "git checkout HEAD -- rules/x.md",
      "git checkout -- agents/coder.md",
      "git restore rules/x.md",
      "git restore --staged agents/coder.md",
    ]);
  });
});

describe("verb table — -t / --target-directory forms", () => {
  it("mv -t adds the target directory to the written set", () => {
    expectAllDeny([
      "mv -t rules/ /tmp/a",
      "mv --target-directory=rules/ /tmp/a",
      "mv --target-directory rules /tmp/a",
      "mv -t /tmp/ rules/x.md", // mv removes its sources, so the source is written too
    ]);
  });

  it("cp -t replaces the positionals: with -t they are all sources", () => {
    expectAllDeny([
      "cp -t rules/ /tmp/a",
      "cp --target-directory=rules /tmp/a",
      "cp --target-directory rules/ /tmp/a /tmp/b",
    ]);
    expectAllAllow(["cp -t /tmp/ rules/x.md", "cp --target-directory=/tmp rules/x.md"]);
  });

  it("ln -t and install -t behave like cp -t", () => {
    expectAllDeny(["ln -t rules/ /tmp/a", "install -t skills/ /tmp/a"]);
    expectAllAllow(["ln -t /tmp/ rules/x.md", "install -t /tmp/ rules/x.md"]);
  });

  it("does not read -t as a target directory for a verb that has none", () => {
    // `rm` has no targetDir row, so `-t` is an ordinary flag and `rules/` after
    // it is a positional — still denied, but through the positional path.
    expect(denies("rm -t rules/")).toBe(true);
  });
});

describe("verb table — in-place flag variants", () => {
  it("recognises every sed in-place spelling", () => {
    expectAllDeny([
      "sed -i 's/a/b/' rules/x.md",
      "sed -i '' 's/a/b/' rules/x.md",
      "sed -i.bak 's/a/b/' rules/x.md",
      "sed -ni 's/a/b/p' rules/x.md",
      "sed -in 's/a/b/' rules/x.md",
      "sed --in-place 's/a/b/' rules/x.md",
      "sed --in-place=.bak 's/a/b/' rules/x.md",
    ]);
  });

  it("leaves sed without an in-place flag alone", () => {
    expectAllAllow([
      "sed -n 's/a/b/p' rules/x.md",
      "sed -e 's/a/b/' rules/x.md",
      "sed -E 's/a/b/' agents/coder.md",
      "sed 's/a/b/' rules/x.md > /tmp/out",
    ]);
  });

  it("recognises every perl in-place spelling", () => {
    expectAllDeny([
      "perl -i -pe 's/a/b/' rules/x.md",
      "perl -pi -e 's/a/b/' rules/x.md",
      "perl -i.bak -pe 's/a/b/' rules/x.md",
      "perl -ni -e 'print' rules/x.md",
    ]);
  });

  it("leaves perl without an in-place flag alone", () => {
    expectAllAllow([
      "perl -pe 's/a/b/' rules/x.md",
      "perl -ne 'print' agents/coder.md",
      "perl -I lib -e 'print' rules/x.md",
    ]);
  });

  /**
   * A short flag's VALUE is not more flag letters. `-Ilib` used to read as the
   * letter run `Ilib`, whose lowercase `i` made every `perl -I<dir>` call an
   * in-place rewrite of its own script
   * (`issues/260801-1903_c_perl-include-flag-glued-to-its-value-is-misread-as-the-in-place-flag.md`).
   *
   * The FIRST fix truncated the run at any value-taking letter, and the note
   * closing that issue claimed the deny side lost "nothing the tools would
   * honour". That was false, and the two blocks below are why: `-Ilib` and
   * `-lpi` need OPPOSITE answers about the letter that follows, so one
   * category of "value letter" cannot serve both
   * (`issues/260801-1955_c_value-letter-truncation-loses-the-in-place-flag-for-perl-lpi.md`).
   *
   * THE DISCRIMINATING PAIR is `perl -lpi …` (deny) against `perl -Ilib …`
   * (allow). Either one alone is satisfiable by reverting or by leaving the
   * bug in; only both together prove the two classes are really distinguished.
   */
  it("THE DISCRIMINATING PAIR — an optional-value letter keeps the run, a mandatory one ends it", () => {
    expect(denies("perl -lpi -e 's/a/b/' rules/x.md")).toBe(true);
    expect(denies("perl -Ilib script.pl")).toBe(false);
  });

  it("does not read a MANDATORY glued flag value as more flag letters", () => {
    // Measured against perl 5.34.1: each of these leaves the file unchanged,
    // because the letters after the flag are its value. `-Ci`, `-Di` and `-xi`
    // are in this block on measurement, not on the filed issue's say-so — it
    // listed them as regressions, but perl reads `pi` in `-Cpi` as a Unicode
    // option list, `-xpi` as an extract directory, and neither edits anything.
    expectAllAllow([
      "perl -Ilib rules/gen.pl",
      "perl -Ilib -e 'print' rules/gen.pl",
      "perl -Mstrict rules/gen.pl",
      "perl -Ilib script.pl",
      "perl -Ci -e 'print' rules/x.md",
      "perl -Di -e 'print' rules/x.md",
      "perl -xi -e 'print' rules/x.md",
      "perl -Fi -e 'print' rules/x.md",
      "perl -mi -e 'print' rules/x.md",
      "perl -Mi -e 'print' rules/x.md",
      "perl -V:osname rules/x.md", // -V's value is a `:configvar`, so it ends here
      "sed -fscript.sed rules/x.md", // the `i` in `script` is not -i either
    ]);
  });

  it("an OPTIONAL-value letter does not hide the in-place flag behind it", () => {
    // Every one of these was measured MUTATING the file, and every one allowed
    // before this fix. `-lpi` is the canonical perl one-liner.
    expectAllDeny([
      "perl -lpi -e 's/a/b/' rules/x.md",
      "perl -lni -e 'print' rules/x.md",
      "perl -lpi.bak -e 's/a/b/' rules/x.md",
      "perl -l7pi -e 's/a/b/' rules/x.md", // the digit run is -l's whole value
      "perl -l07pi -e 's/a/b/' rules/x.md",
      "perl -Vpi -e 's/a/b/' rules/x.md", // -V without a colon takes no value
      "sed -li 's/a/b/' rules/x.md", // BSD -l takes no value: this really edits
    ]);
  });

  it("a LEADING DIGIT run is a flag value, not the end of the token", () => {
    // `/^-([A-Za-z]*)/` matched the empty string for `-0pi` and examined no
    // letter at all, so perl's record-separator form was invisible in every
    // build before this one — pre-existing rather than a regression.
    expectAllDeny([
      "perl -0pi -e 's/a/b/' rules/x.md",
      "perl -077pi -e 's/a/b/' rules/x.md",
    ]);
  });

  it("still denies when the in-place flag is genuinely there", () => {
    expectAllDeny([
      "perl -Ilib -i rules/gen.pl",
      "perl -Ilib -i.bak -pe 's/a/b/' rules/gen.pl",
      "perl -i -Ilib rules/gen.pl",
      "sed -fscript.sed -i '' rules/x.md",
    ]);
  });
});

describe("verb table — value-taking flags never become positionals", () => {
  it("a flag's value is not read as a written operand", () => {
    expectAllAllow([
      "install -m 644 -o root -g wheel /tmp/a /tmp/b",
      "truncate -s 0 /tmp/log",
      "truncate -r rules/x.md /tmp/out",
      "sed -i '' -e 's/a/b/' /tmp/notes.txt",
      "perl -i -f /tmp/script.pl /tmp/notes.txt",
    ]);
  });

  it("-- ends the flags and the rest are positionals", () => {
    expect(denies("rm -- rules/x.md")).toBe(true);
    expect(denies("rm -f -- rules/x.md")).toBe(true);
    expect(denies("mv -- /tmp/a rules/x.md")).toBe(true);
    expect(denies("rm -- /tmp/-weird-name")).toBe(false);
  });

  it("reads the destination of a multi-source copy or move", () => {
    expectAllDeny([
      "cp /tmp/a /tmp/b rules/",
      "mv /tmp/a /tmp/b rules/",
      "install -D /tmp/x rules/y.md",
      "tee -a rules/x.md",
    ]);
  });

  it("dd only writes what of= names", () => {
    expect(denies("dd if=rules/x.md of=/tmp/y")).toBe(false);
    expect(denies("dd if=/tmp/y of=rules/x.md")).toBe(true);
    expect(denies("dd of='rules/x.md'")).toBe(true);
  });
});

/* ------------------------------------------------------------------ *
 * 2. Wrappers
 * ------------------------------------------------------------------ */

/**
 * How each wrapper is invoked ahead of the command it runs. `timeout` needs its
 * duration; everything else takes the command word directly.
 */
const WRAPPER_INVOCATIONS: Record<string, string> = {
  sudo: "sudo",
  doas: "doas",
  env: "env",
  command: "command",
  exec: "exec",
  nice: "nice",
  ionice: "ionice",
  timeout: "timeout 5",
  xargs: "xargs",
  time: "time",
  nohup: "nohup",
  setsid: "setsid",
  stdbuf: "stdbuf -o0",
};

describe("wrappers — the verb underneath is still classified", () => {
  it("covers every program in WRAPPER_PROGRAMS", () => {
    expect(new Set(Object.keys(WRAPPER_INVOCATIONS))).toEqual(
      new Set(Object.keys(WRAPPER_PROGRAMS)),
    );
  });

  it("shares no name with the verb table (a wrapper cannot shadow a verb)", () => {
    const overlap = Object.keys(WRAPPER_PROGRAMS).filter((w) =>
      Object.hasOwn(MUTATION_VERBS, w),
    );
    expect(overlap).toEqual([]);
  });

  for (const [name, prefix] of Object.entries(WRAPPER_INVOCATIONS)) {
    it(`${name} — denies the wrapped mutation, allows the wrapped non-mutation`, () => {
      expect(denies(`${prefix} rm rules/x.md`), `${prefix} rm rules/x.md`).toBe(true);
      expect(denies(`${prefix} rm /tmp/x`), `${prefix} rm /tmp/x`).toBe(false);
    });
  }

  it("skipping a wrapper cannot manufacture a deny", () => {
    expectAllAllow([
      "sudo ls -la rules/",
      "command -v rm",
      "sudo -v",
      "env",
      "nohup npm test",
      "time make build",
    ]);
  });

  it("leaves an unrecognised program unrecognised through a wrapper (the residual)", () => {
    // `curl -o rules/x.md` is the documented residual on its own; a wrapper
    // does not change that.
    expectAllAllow([
      "sudo curl -o rules/x.md https://example.com/x",
      "sudo ./build.sh",
    ]);
  });
});

describe("wrappers — nesting and arbitrary chaining", () => {
  it("resolves a nested pair and a nested triple", () => {
    expectAllDeny([
      "sudo env rm rules/x.md",
      "sudo timeout 5 env rm rules/x.md",
      "nohup nice -n 10 rm rules/x.md",
      "sudo env FOO=1 xargs rm rules/x.md",
    ]);
  });

  it("resolves an arbitrarily long chain (a fixed hop cap was a published bypass)", () => {
    // The earlier implementation capped chaining at 8 hops, so `sudo` x 9 walked
    // straight through. Assert well past any plausible cap, in both directions.
    for (const n of [8, 9, 12, 40]) {
      const chain = "sudo ".repeat(n);
      expect(denies(`${chain}rm rules/x.md`), `sudo x${n} + protected`).toBe(true);
      expect(denies(`${chain}rm /tmp/x`), `sudo x${n} + unprotected`).toBe(false);
    }
  });

  it("does not loop forever on a chain of wrappers running nothing", () => {
    expect(denies("sudo ".repeat(30).trim())).toBe(false);
  });
});

describe("wrappers — their own flags do not swallow the command word", () => {
  it("consumes short value-taking flags", () => {
    expectAllDeny([
      "sudo -u root rm rules/x.md",
      "sudo -E -H rm rules/x.md",
      "env -u FOO rm rules/x.md",
      "nice -n 10 rm rules/x.md",
      "nice -5 rm rules/x.md",
      "ionice -c 3 rm rules/x.md",
      "xargs -n 1 rm rules/x.md",
      "xargs -I {} rm rules/x.md",
      "time -o /tmp/t rm rules/x.md",
      "stdbuf -o 0 rm rules/x.md",
      "stdbuf -o0 rm rules/x.md",
    ]);
  });

  it("consumes long flags as single tokens", () => {
    expectAllDeny([
      "sudo --user=root rm rules/x.md",
      "xargs --max-args=1 rm rules/x.md",
      "timeout --preserve-status 5 rm rules/x.md",
      "env --ignore-environment rm rules/x.md",
    ]);
  });

  it("consumes timeout's positional duration in every spelling", () => {
    expectAllDeny([
      "timeout 5 rm rules/x.md",
      "timeout 5s rm rules/x.md",
      "timeout 0.5 rm rules/x.md",
      "timeout -k 5 10 rm rules/x.md",
    ]);
  });

  it("consumes leading VAR=value assignments and a -- terminator", () => {
    expectAllDeny([
      "env FOO=1 rm rules/x.md",
      "sudo FOO=1 rm rules/x.md",
      "sudo -- rm rules/x.md",
      "sudo -i rm rules/x.md",
      "env -i rm rules/x.md",
    ]);
  });

  it("catches the privileged-write idiom (pipe into sudo tee)", () => {
    expectAllDeny([
      "echo x | sudo tee rules/x.md",
      "cat /tmp/new | sudo tee -a hooks/config.json",
    ]);
  });
});

/* ------------------------------------------------------------------ *
 * 3. Ancestors
 * ------------------------------------------------------------------ */

describe("ancestors — a directory that contains a protected path", () => {
  it("denies destroying or relocating an ancestor directory", () => {
    expectAllDeny([
      "rm -rf hooks",
      "rm -rf hooks/",
      "rm -rf ./hooks",
      "mv hooks /tmp",
      "rm -rf fusion-workbench",
      "rm -rf bin",
      "mv .claude-plugin /tmp",
      "rm -rf /project/hooks",
    ]);
  });

  it("denies writing INTO an ancestor directory", () => {
    // The wider form the user confirmed at the gate: a destination directory is
    // a written operand, so `cp /tmp/config.json hooks/` cannot overwrite a
    // protected file through a directory the classifier never inspects.
    expectAllDeny([
      "cp /tmp/x hooks/",
      "mv build/out.js hooks/",
      "cp -R /tmp/plugin .claude-plugin/",
      "install -m 755 /tmp/monitor bin/",
    ]);
  });

  it("leaves build output and unrelated directories alone", () => {
    expectAllAllow([
      "rm -rf node_modules",
      "rm -rf dist",
      "rm -rf hooks/dist",
      "rm -rf hooks/node_modules",
      "rm -rf build/out",
      "rm -rf fusion-workbench/shared",
      "mv dist /tmp/dist-backup",
    ]);
  });

  it("compares on a path-segment boundary, so rules-draft is not rules/**", () => {
    expectAllAllow([
      "rm -rf rules-draft",
      "mv rules-draft /tmp/",
      "mv rules-draft/x.md /tmp/",
      "rm -rf hooks-old",
      "rm -rf binaries",
    ]);
  });

  it("excludes the project root, so writing into . stays allowed", () => {
    expectAllAllow(["cp x .", "cp /tmp/x .", "mv /tmp/x .", "cp /tmp/x ./"]);
  });

  it("names the contained pattern in the deny reason", () => {
    const v = classify("rm -rf hooks");
    expect(v.targetPath).toBe("hooks");
    expect(v.reason).toContain("hooks/config.json");
    expect(v.reason).toContain("contains");
  });

  it("matches a protected directory named directly, not only a file inside it", () => {
    expectAllDeny([
      "rm -rf rules",
      "rm -rf agents",
      "rm -rf 'rules'",
      "mv rules /tmp/",
      "mv skills /tmp/",
    ]);
  });

  it("matches a protected DIRECTORY as itself, not only its contents", () => {
    // The sharpest case in the issue: `fusion-workbench/.guard-state/**` does
    // not match the bare directory name without the trailing separator.
    expect(denies("rm -rf fusion-workbench/.guard-state")).toBe(true);
    expect(denies("rm -rf fusion-workbench/.guard-state/")).toBe(true);
    expect(denies("rm fusion-workbench/.guard-state/escalation.json")).toBe(true);
    expect(denies("rm fusion-workbench/.guard-state/*")).toBe(true);
  });

  it("does not catch a whole-tree operand that names no directory (residual)", () => {
    // Documented in the module: a glob is matched as literal text and `.` is
    // the excluded root, so neither form is caught.
    expectAllAllow(["rm -rf *", "rm -rf ."]);
  });
});

/* ------------------------------------------------------------------ *
 * 4. Fail-closed, and its bound
 * ------------------------------------------------------------------ */

describe("fail-closed — an unresolvable operand of a recognised verb", () => {
  it("denies a parameter expansion, a substitution and a tilde", () => {
    expectAllDeny([
      "mv $A $B",
      "rm $OUT",
      'rm "$OUT"',
      "rm ${OUT}",
      "rm `cat /tmp/list`",
      "rm $(echo rules/x.md)",
      "rm -rf ~/scratch",
      "cp /tmp/a ~user/x",
      'mv /tmp/x "$(pwd)/y"',
      "truncate -s 0 $LOG",
    ]);
  });

  it("prefers the visible protected path over the unresolvable operand", () => {
    const a = classify("mv $SRC rules/");
    expect(a.deny).toBe(true);
    expect(a.targetPath).toBe("rules/");

    const b = classify("mv rules/x.md $DST");
    expect(b.deny).toBe(true);
    expect(b.targetPath).toBe("rules/x.md");
  });

  it("says fail-closed and how to fix it when nothing resolves", () => {
    const v = classify("mv $A $B");
    expect(v.reason).toContain("fail-closed");
    expect(v.reason).toContain("write the path out literally");
  });

  it("does NOT fail closed for an unrecognised program", () => {
    expectAllAllow([
      "curl -o $OUT https://example.com/x",
      "make $TARGET",
      "./build.sh $OUT",
      "cat ~/notes.txt",
      "tar -xf ~/archive.tar",
      "echo $HOME",
      "$CMD rules/x.md", // the command word itself is an expansion
    ]);
  });

  it("denies the substitution-as-operand form (it is unresolved, not invisible)", () => {
    // `rm $(echo rules/x.md)` used to reach the classifier as a bare `rm` with
    // no operands, while `rm $VAR` denied. Capture mode now leaves a token that
    // resolves unresolved.
    expect(denies("rm $(echo rules/x.md)")).toBe(true);
    expect(denies("rm `echo rules/x.md`")).toBe(true);
    expect(denies('rm -rf "$(pwd)/build"')).toBe(true);
    expect(denies('cp build/out.js "$(mktemp -d)/out.js"')).toBe(true);
  });

  it("denies the two known-and-accepted false positives, so a change is visible", () => {
    // Both follow from the fail-closed rule as approved. They are asserted, not
    // endorsed: if a later narrowing flips either, this test is where it shows.
    expect(denies('sed -i "s/$OLD/$NEW/" /tmp/notes.txt')).toBe(true);
    expect(denies("rm -rf ~/.cache/fusion")).toBe(true);
  });
});

/* ------------------------------------------------------------------ *
 * 5. Inertness
 * ------------------------------------------------------------------ */

const INERT_QUOTED = [
  "echo 'rm -rf rules/'",
  "echo '; rm -rf rules/'",
  "echo '&& rm -rf rules/'",
  "echo '| rm -rf rules/'",
  "echo '$(rm -rf rules/)'",
  "echo '`rm -rf rules/`'",
  "echo '> rules/x.md'",
  "echo 'a\nrm -rf rules/'",
  "echo 'mv rules/x.md /tmp/'",
  "printf '%s\\n' 'sed -i s/a/b/ rules/x.md'",
];

describe("inertness — quoted text is never a command", () => {
  it("allows every quoted form", () => {
    expectAllAllow(INERT_QUOTED);
  });

  it("leaves echo as the only command word in every quoted form", () => {
    // The allow above must hold for the RIGHT reason: the quoted region is one
    // opaque word, so nothing inside it ever reaches command position.
    for (const cmd of INERT_QUOTED.slice(0, 8)) {
      const parsed = parseCommand(cmd, { quoted: "capture" });
      const commandWords = parsed.segments.map((s) => tokenize(s.text)[0]);
      expect(commandWords, `command: ${JSON.stringify(cmd)}`).toEqual(["echo"]);
    }
  });

  it("allows a quoted-delimiter heredoc body that names a mutation", () => {
    expectAllAllow([
      "cat > /tmp/note <<'EOF'\nrm rules/x.md\nEOF",
      'cat > /tmp/note <<"EOF"\nmv rules/x.md /tmp/\nEOF',
      "cat > /tmp/note <<-'EOF'\n\trm -rf rules/\n\tEOF",
    ]);
  });

  it("still denies an UNQUOTED-delimiter heredoc body (bash expands there)", () => {
    expect(denies("cat > /tmp/note <<EOF\nrm rules/x.md\nEOF")).toBe(true);
  });

  it("still denies the real command the quoted form only mentions", () => {
    expectAllDeny(["rm -rf rules/", "mv rules/x.md /tmp/", "echo x > rules/x.md"]);
  });

  /**
   * WAS a known false positive, now fixed. A double-quoted region used to reach
   * the scanner as code, so a `>` in ordinary prose read as a redirection and
   * `git commit -m "docs: rules/a.md -> rules/b.md"` denied on `rules/b.md` —
   * a deny on the most-run write command in the system, with a reason no agent
   * could act on
   * (`issues/260801-1901_c_a-redirect-operator-inside-a-double-quoted-string-is-read-as-a-redirection.md`).
   * Capture mode now mints a placeholder for a double-quoted span that expands
   * nothing, which is what bash does with it: no redirection, no word
   * splitting, no segmentation.
   *
   * What the fix gives up is stated by the second block: a span carrying `$`, a
   * backtick or an escape is STILL code, because bash expands there. That is
   * the fail-closed direction and flipping it would let `"$(rm rules/x.md)"`
   * through.
   */
  it("treats a double-quoted span that expands nothing as prose", () => {
    expectAllAllow([
      'echo "x > rules/y.md"',
      "echo 'x > rules/y.md'",
      'git commit -m "docs: rules/a.md -> rules/b.md"',
      'echo "moved rules/a.md -> rules/b.md"',
      'gh pr create --body "moves a -> agents/b.md"',
      'echo "a; rm -rf rules/"',
      'echo "a && rm -rf rules/"',
      'echo "a | rm -rf rules/"',
    ]);
  });

  it("keeps an EXPANDING double-quoted span as code, so the hidden command still denies", () => {
    expectAllDeny([
      'echo "$(rm rules/x.md)"',
      'echo "`rm rules/x.md`"',
      'echo "x" > "rules/y.md"', // the operator itself is in code position
      'echo "x" >"rules/y.md"',
    ]);
  });
});

/* ------------------------------------------------------------------ *
 * 6. Redirection
 * ------------------------------------------------------------------ */

describe("redirection — the skip forms must never deny", () => {
  it("allows file-descriptor redirections", () => {
    expectAllAllow([
      "echo hi 2>&1",
      "echo err >&2",
      "cat a 1>&2",
      "echo hi 2>&1 >/tmp/log",
      "make 2>&1 | tee /tmp/build.log",
      "npm test 2>&1 | head -20",
      "node build.js >/tmp/out 2>&1",
    ]);
  });

  it("allows a target of - and an operator with no target at all", () => {
    expectAllAllow(["echo x > -", "echo hi 2>", "cat file >"]);
  });
});

describe("redirection — every writing form denies a protected target", () => {
  it("denies the separated, glued, appending and clobbering forms", () => {
    expectAllDeny([
      "echo x > rules/x.md",
      "echo x >rules/x.md",
      "echo x >> rules/x.md",
      "echo x >>rules/x.md",
      "echo hi >| rules/x.md",
      "echo hi >& rules/x.md",
      "echo x 2> rules/x.md",
      "echo x 1>> rules/x.md",
      "printf '' > rules/x.md",
      "cat > rules/x.md <<EOF\nbody\nEOF",
      "cat /tmp/new > hooks/config.json",
    ]);
  });

  it("makes ANY program a mutation, recognised or not", () => {
    expectAllDeny([
      "sort /tmp/a > rules/x.md",
      "curl -s https://example.com > rules/x.md",
      "./build.sh > agents/coder.md",
    ]);
  });

  it("allows the same forms against an unprotected target", () => {
    expectAllAllow([
      "echo x > /tmp/log",
      "echo done >> /tmp/session.log",
      "sort /tmp/a >/tmp/b",
      "./build.sh > build/out.js",
    ]);
  });

  /**
   * The fail-closed rule stops at the verb table's edge, and the redirection
   * scanner does not carry it across
   * (`issues/260801-1859_c_redirection-carries-fail-closed-into-unrecognised-programs-and-three-docs-deny-it.md`).
   * `npm test > "$LOG"` used to deny while three documents stated that an
   * unrecognised program is allowed however unparseable its arguments are.
   *
   * What this gives up, precisely: a segment with NO recognised verb whose
   * redirect target cannot be resolved. `echo x > "$F"`, `echo x > "rules/$F"`
   * and `cd $D && echo x > y.md` all allow now. The trade is deliberate — the
   * table's own baseline already allows `curl -o rules/x.md`, a LITERAL
   * protected path with an unrecognised program, so denying the invisible case
   * while allowing the visible one was the inconsistency. Both discriminating
   * neighbours are pinned below: a resolvable target still denies whatever the
   * program is, and a recognised verb still fails closed.
   */
  it("does NOT carry fail-closed into a program outside the table", () => {
    expectAllAllow([
      'npm test > "$LOG"',
      'npm test > "$TMPDIR/test.log"',
      "echo hi >> ~/notes.md",
      "cat report.md > ~/backup.md",
      'echo x > "$F"',
      'echo x > "rules/$F"',
      "echo x > $(mktemp)",
      "cd $D && echo x > y.md",
    ]);
  });

  it("still denies a RESOLVABLE target on the same programs", () => {
    expectAllDeny([
      "npm test > rules/x.md",
      "echo hi >> rules/x.md",
      "cat report.md > agents/coder.md",
      "cd rules && echo x > y.md",
    ]);
  });

  it("still fails closed once the segment names a recognised verb", () => {
    expectAllDeny([
      'rm /tmp/a > "$F"',
      'tee "$LOG"',
      'sed -i "" s/a/b/ /tmp/x > "$F"',
      'cd $D && rm -rf x > "$F"',
    ]);
  });

  it("never counts a redirection target as a positional of the verb", () => {
    // `rm a > b` must not read `b` as something rm deletes, and must not lose
    // `b` as a redirection target either.
    expect(denies("rm /tmp/a > /tmp/b")).toBe(false);
    expect(denies("rm /tmp/a > rules/x.md")).toBe(true);
    expect(denies("rm rules/x.md > /tmp/b")).toBe(true);
  });
});

/* ------------------------------------------------------------------ *
 * 7. Quoting, paths and shell grammar
 * ------------------------------------------------------------------ */

describe("quoting of the operand itself", () => {
  it("denies the single-quoted, double-quoted and bare forms alike", () => {
    expectAllDeny(["rm rules/x.md", "rm 'rules/x.md'", 'rm "rules/x.md"', "rm 'rules/'x.md"]);
  });

  it("allows an ordinary quoted path with a space in it", () => {
    expectAllAllow(["mv 'my file.txt' /tmp/", "cp '/tmp/my file.txt' '/tmp/other file.txt'"]);
  });

  it("keeps a quoted $ literal, because single quotes suppress expansion", () => {
    expect(denies("rm '$HOME'")).toBe(false);
    expect(denies("rm 'rules/'$X")).toBe(true); // glued expansion → unresolved
  });

  it("denies ANSI-C quoting fail-closed (the $ survives in code position)", () => {
    expect(denies("rm $'rules/x.md'")).toBe(true);
  });

  it("tokenises on any whitespace, not only spaces", () => {
    expect(denies("rm\trules/x.md")).toBe(true);
  });
});

describe("path normalisation and matching", () => {
  it("normalises traversal and ./ prefixes before matching", () => {
    expectAllDeny(["rm foo/../rules/x.md", "rm ./rules/x.md", "rm rules/./x.md"]);
  });

  it("relativises an absolute path under the project root", () => {
    expect(denies("rm /project/rules/x.md")).toBe(true);
    expect(denies("rm /tmp/rules/x.md")).toBe(false);
    expect(denies("rm /project/build/out.js")).toBe(false);
  });

  it("matches glob metacharacters as literal text (fail-closed direction)", () => {
    expect(denies("rm rules/*.md")).toBe(true);
    expect(denies("rm agents/*")).toBe(true);
    expect(denies("rm build/*.js")).toBe(false);
  });
});

describe("shell grammar around the command word", () => {
  it("sees through a program path and a quoted command word", () => {
    expectAllDeny([
      "/bin/rm rules/x.md",
      "/usr/bin/sed -i '' 's/a/b/' rules/x.md",
      "'rm' -rf rules/x.md",
    ]);
  });

  it("skips leading env assignments and grammar prefixes", () => {
    expectAllDeny([
      "FOO=1 rm rules/x.md",
      "{ rm rules/x.md; }",
      "if true; then rm rules/x.md; fi",
      "for f in a b; do rm rules/$f; done",
    ]);
  });

  /**
   * The set carried the BODY introducers (`then`, `else`, `do`) and not the
   * HEADS, so `while :; do rm rules/x.md; done` denied and
   * `if rm -rf rules; then :; fi` allowed — the mechanism understood in one
   * position and missing in the other.
   * (`issues/260801-1857_c_compound-command-head-hides-the-verb-from-both-bash-classifiers.md`)
   */
  it("sees the verb behind a compound-command head", () => {
    expectAllDeny([
      "if rm -rf rules/x.md; then echo ok; fi",
      "if rm -rf agents; then :; fi",
      "if true; then :; elif rm rules/x.md; then :; fi",
      "while rm rules/x.md; do :; done",
      "until rm rules/x.md; do :; done",
      "coproc rm rules/x.md",
      "if mv rules/x.md /tmp/; then :; fi",
      "while sudo rm rules/x.md; do :; done",
    ]);
  });

  it("covers every token in GRAMMAR_PREFIXES, in both directions", () => {
    // Driven off the set itself, so a token added without a case fails here
    // rather than shipping unexercised — the shape the wrapper block uses.
    for (const prefix of GRAMMAR_PREFIXES) {
      expect(denies(`${prefix} rm rules/x.md`), `${prefix} + protected`).toBe(true);
      expect(denies(`${prefix} rm /tmp/x`), `${prefix} + unprotected`).toBe(false);
    }
  });

  it("keeps ordinary conditionals and loops allowed", () => {
    expectAllAllow([
      "if [ -f hooks/config.json ]; then echo yes; fi",
      "if [ -d hooks/dist ]; then rm -rf hooks/dist; fi",
      "if ! command -v jq; then echo missing; fi",
      "while read -r f; do wc -l \"$f\"; done < /tmp/list",
      "until curl -sf http://localhost:3000; do sleep 1; done",
      "if git diff --quiet; then echo clean; fi",
    ]);
  });

  /**
   * A leading backslash suppresses alias expansion and runs the same program,
   * so `\rm` is `rm`. `resolveWord` emitted the escape pair verbatim, leaving a
   * command word in no table.
   * (`issues/260801-1858_c_a-backslash-escaped-command-word-is-unrecognised-by-both-classifiers.md`)
   */
  it("sees the verb behind a backslash escape", () => {
    expectAllDeny([
      "\\rm -rf rules",
      "\\rm -rf agents",
      "\\mv rules/x.md /tmp/",
      "\\cp /tmp/y rules/x.md",
      "\\sed -i '' 's/a/b/' rules/x.md",
      "r\\m -rf rules", // bash removes the backslash mid-word too
      "\\sudo \\rm rules/x.md", // through a wrapper that is itself escaped
    ]);
  });

  it("leaves an escaped non-verb and an escaped space alone", () => {
    expectAllAllow([
      "\\ls rules/",
      "\\cat rules/x.md",
      "\\rm /tmp/x",
      "rm my\\ file.txt", // an escaped space, not a protected path
    ]);
  });

  it("removes a backslash escape from an operand too", () => {
    // The residual this fix was scoped against reasoned that an escape in an
    // OPERAND is harmless because it can only shorten a word. It is not: an
    // escape KEPT in the word lengthens it, and a protected pattern with no
    // glob in it stops matching. `hooks/config\.json` was allowed.
    expect(denies("rm hooks/config\\.json")).toBe(true);
    expect(classify("rm hooks/config\\.json").targetPath).toBe(
      "hooks/config.json",
    );
    // `\$FOO` is a literal `$FOO` to bash and a fail-closed deny here: the
    // expansion test runs before the unescape, by design.
    expect(denies("rm \\$FOO")).toBe(true);
  });

  it("does not match an inherited Object.prototype member as a row", () => {
    expectAllAllow([
      "constructor rules/x.md",
      "toString rules/x.md",
      "hasOwnProperty rules/x.md",
      "constructor rm rules/x.md",
    ]);
  });
});

describe("compound commands and subshells", () => {
  it("denies if ANY segment writes a protected path", () => {
    expectAllDeny([
      "ls && rm rules/x.md",
      "git status; rm rules/x.md; git log",
      "npm test || rm -rf rules/",
      "cat /tmp/a | tee rules/x.md",
      "$(rm rules/x.md)",
      "echo `rm rules/x.md`",
      "echo $(mv rules/x.md /tmp/)",
      "echo $(cat /tmp/a > rules/x.md)",
      "ls; echo `sed -i '' 's/a/b/' rules/x.md`",
    ]);
  });

  it("reports the offending segment, not the whole command", () => {
    const v = classify("git status && rm -f rules/x.md && npm test");
    expect(v.deny).toBe(true);
    expect(v.offendingSegment).toBe("rm -f rules/x.md");
    expect(v.targetPath).toBe("rules/x.md");
  });

  it("allows a compound whose every segment is innocuous", () => {
    expectAllAllow([
      "ls && cat rules/x.md",
      "cd hooks && npm test",
      "git status; git diff --stat; git log --oneline -5",
    ]);
  });
});

/* ------------------------------------------------------------------ *
 * 8. Verdict shape and the deny reason
 * ------------------------------------------------------------------ */

describe("the verdict", () => {
  it("is exactly { deny: false, mutates: false } on an allow that writes nothing", () => {
    // `mutates` is always present; `exempted` still is not. The difference is
    // deliberate: `mutates` is a question every caller must ask, `exempted` is
    // a report of something that happened.
    expect(classify("ls -la")).toEqual({ deny: false, mutates: false });
    expect(classify("")).toEqual({ deny: false, mutates: false });
    expect(classify("   ")).toEqual({ deny: false, mutates: false });
  });

  it("carries the reason, the segment and the path on deny", () => {
    const v = classify("mv rules/x.md /tmp/");
    expect(v.deny).toBe(true);
    expect(v.offendingSegment).toBe("mv rules/x.md /tmp/");
    expect(v.targetPath).toBe("rules/x.md");
    expect(v.reason).toContain("mv rules/x.md /tmp/");
    expect(v.reason).toContain("rules/x.md");
  });

  it("tells the agent to stop rather than route around the guard", () => {
    const v = classify("rm rules/x.md");
    expect(v.reason).toContain("STOP and ask the user");
    expect(v.reason).toMatch(/Edit or Write/);
    expect(v.reason).toMatch(/Do not rephrase/);
  });

  it("renders a captured quoted operand back to readable text", () => {
    const v = classify("mv 'rules/x.md' /tmp/");
    expect(v.offendingSegment).toBe("mv rules/x.md /tmp/");
    expect(v.reason).not.toMatch(/[\u0001-\u0008]/);
    expect(v.targetPath).toBe("rules/x.md");
  });

  it("re-quotes a rendered operand that contains a space", () => {
    const v = classify("mv '/tmp/my file.txt' rules/x.md");
    expect(v.deny).toBe(true);
    expect(v.offendingSegment).toContain("'/tmp/my file.txt'");
  });

  it("uses distinct reasons for the three deny kinds", () => {
    const direct = classify("rm rules/x.md").reason ?? "";
    const ancestor = classify("rm -rf hooks").reason ?? "";
    const unresolved = classify("mv $A $B").reason ?? "";
    expect(direct).toContain("writes a protected path");
    expect(ancestor).toContain("CONTAINS a protected path");
    expect(unresolved).toContain("cannot be resolved before it runs");
    expect(new Set([direct, ancestor, unresolved]).size).toBe(3);
  });
});

/* ------------------------------------------------------------------ *
 * 9. The exempt seam and the empty list
 * ------------------------------------------------------------------ */

describe("the exempt predicate (the C5a seam)", () => {
  it("turns a would-be protected deny into an allow", () => {
    expect(denies("rm rules/x.md")).toBe(true);
    expect(denies("rm rules/x.md", { exempt: (p) => p.startsWith("rules/") })).toBe(false);
  });

  it("also lifts an ancestor deny", () => {
    expect(denies("rm -rf hooks")).toBe(true);
    expect(denies("rm -rf hooks", { exempt: (p) => p === "hooks" })).toBe(false);
  });

  it("receives the resolved, project-relative path", () => {
    const seen: string[] = [];
    classify("mv /project/rules/x.md /tmp/", {
      exempt: (p) => {
        seen.push(p);
        return false;
      },
    });
    expect(seen).toContain("rules/x.md");
  });

  it("does NOT lift the fail-closed deny — there is no path to exempt", () => {
    expect(denies("mv $A $B", { exempt: () => true })).toBe(true);
  });

  it("defaults to exempting nothing", () => {
    expect(denies("rm rules/x.md", { exempt: undefined })).toBe(true);
  });
});

describe("the exempt predicate — `ln` is not exemptible", () => {
  /**
   * `ln` is the one row in the table whose purpose is to give a file a SECOND
   * name, and a path-based grant is only sound while the path names one file.
   * Measured before the fix: with the flag set, `ln -s ../ rules/up` was itself
   * an exempted write, after which every `rules/up/…` spelling still matched
   * `rules/**` while the write landed anywhere in the project.
   *
   * The predicate below accepts every rule path, i.e. it is as permissive as
   * `FUSION_ALLOW_RULES_WRITE` ever gets. `ln` still denies.
   */
  const RULES = (p: string): boolean => p.startsWith("rules/");

  const linkForms = [
    "ln -s ../ rules/up",
    "ln -s /etc rules/etc",
    "ln -s ../fusion-workbench/.guard-state rules/gs",
    "ln hooks/config.json rules/copy",
    "ln -sf /dev/null rules/x.md",
    "ln -t rules/ /tmp/a",
    "sudo ln -s / rules/root",
  ];

  for (const command of linkForms) {
    it(`denies \`${command}\` even with every rule path exempt`, () => {
      expect(denies(command, { exempt: RULES })).toBe(true);
    });
  }

  it("names the rule path in the reason, so the deny explains itself", () => {
    const v = classify("ln -s ../ rules/up", { exempt: RULES });
    expect(v.targetPath).toBe("rules/up");
    expect(v.reason).toContain("rules/up");
  });

  it("reports nothing as exempted — nothing was", () => {
    expect(classify("ln -s ../ rules/up", { exempt: RULES }).exempted).toBeUndefined();
  });

  it("leaves the other write verbs exemptible, including the retirement move", () => {
    // The flag's headline use. `mv` must stay exemptible, which is also why
    // this row cannot be the whole answer to a planted alias — `mv` can
    // relocate an existing symlink into `rules/`. Gate 2 of the exemption
    // predicate is what makes that harmless.
    expect(denies("mv rules/x.md rules/retired/", { exempt: RULES })).toBe(false);
    expect(denies("rm rules/x.md", { exempt: RULES })).toBe(false);
    expect(denies("cp /tmp/a rules/x.md", { exempt: RULES })).toBe(false);
    expect(denies("sed -i '' 's/a/b/' rules/x.md", { exempt: RULES })).toBe(false);
    expect(denies("echo hi > rules/x.md", { exempt: RULES })).toBe(false);
  });

  it("still allows a link that writes an UNPROTECTED destination", () => {
    // Non-exemptible is not a ban on `ln`; the protected list still decides.
    expect(denies("ln -s rules/x.md /tmp/link", { exempt: RULES })).toBe(false);
    expect(denies("ln -s rules/x.md notes-link.md", { exempt: RULES })).toBe(false);
  });

  it("does not make a redirection in the same segment non-exemptible", () => {
    // Eligibility is per operand. `ln`'s destination is ineligible; the
    // redirect target is an ordinary write and stays eligible.
    expect(denies("ln -s /tmp/a /tmp/b > rules/log.txt", { exempt: RULES })).toBe(false);
  });
});

describe("the verdict's `mutates` field", () => {
  /**
   * Reported independently of `deny`, because a halted guard blocks WRITES
   * rather than protected writes — the Bash mirror of CHECK 1 on the write-tool
   * path. Deriving it from `deny` would halt-block only what was already
   * denied, which is no halt at all.
   */
  const mutates = (command: string, over: Partial<MutationOptions> = {}): boolean =>
    classify(command, over).mutates;

  it("is false for a command that writes no file", () => {
    for (const c of ["ls -la", "git status", "cat rules/x.md", "grep -r x .", ""]) {
      expect(mutates(c), c).toBe(false);
    }
  });

  it("is true for a recognised mutation of an UNPROTECTED path", () => {
    // The whole point: these allow, and a halted guard must still block them.
    for (const c of [
      "rm /tmp/scratch",
      "mv notes.txt /tmp/",
      "cp /tmp/a /tmp/b",
      "sed -i '' 's/a/b/' notes.txt",
      "echo hi > notes.txt",
      "dd of=/tmp/img",
      "git clean -fdx build",
    ]) {
      expect(mutates(c), c).toBe(true);
      expect(denies(c), c).toBe(false);
    }
  });

  it("is true on every kind of deny", () => {
    for (const c of ["rm rules/x.md", "rm -rf hooks", "mv $A $B"]) {
      expect(mutates(c), c).toBe(true);
      expect(denies(c), c).toBe(true);
    }
  });

  it("is true when the exemption let the write through", () => {
    // Otherwise the flag would be a way out of a halt: an exempted mutation
    // that reported itself as not mutating would pass the halt gate.
    const v = classify("rm rules/x.md", { exempt: (p) => p.startsWith("rules/") });
    expect(v.deny).toBe(false);
    expect(v.mutates).toBe(true);
  });

  it("is true with an EMPTY protected list, where nothing can deny", () => {
    // A project that protects nothing can still be halted, and a halt is about
    // writing rather than about the protected list.
    expect(mutates("rm notes.txt", { protectedPaths: [] })).toBe(true);
    expect(denies("rm notes.txt", { protectedPaths: [] })).toBe(false);
    expect(mutates("ls", { protectedPaths: [] })).toBe(false);
  });

  it("is sticky across a compound command", () => {
    expect(mutates("ls -la && rm /tmp/x && git status")).toBe(true);
    expect(mutates("ls -la && git status && cat notes.txt")).toBe(false);
  });

  it("is true for a mutation the guard cannot resolve", () => {
    expect(mutates("rm $TARGET")).toBe(true);
  });

  it("stays false for an unrecognised program, however it is called", () => {
    // The table's edge is the bound, and the halt gate inherits it.
    expect(mutates("curl -o rules/x.md https://example.com")).toBe(false);
    expect(mutates("npm run build")).toBe(false);
  });
});

describe("the exempt predicate — what the verdict reports back", () => {
  // `exempted` is how the caller learns a permission was exercised. Without it
  // the exemption is silent: the command runs and nothing in escalation.json or
  // events.jsonl says which protected paths the flag let through.
  const RULES = (p: string): boolean => p.startsWith("rules/");

  it("reports the exempted path on the allowing verdict", () => {
    expect(classify("rm rules/x.md", { exempt: RULES })).toEqual({
      deny: false,
      mutates: true,
      exempted: ["rules/x.md"],
    });
  });

  it("reports every distinct path across the whole command, in order", () => {
    const v = classify("rm rules/a.md && rm rules/b.md", { exempt: RULES });
    expect(v.deny).toBe(false);
    expect(v.exempted).toEqual(["rules/a.md", "rules/b.md"]);
  });

  it("deduplicates a path met twice in one segment", () => {
    // `mv` writes every positional, so the destination directory is met as a
    // written operand alongside the source — and `rm a a` names one path twice.
    const v = classify("rm rules/x.md rules/x.md", { exempt: RULES });
    expect(v.exempted).toEqual(["rules/x.md"]);
  });

  it("deduplicates a path met in two different segments", () => {
    const v = classify("rm rules/x.md; rm rules/x.md", { exempt: RULES });
    expect(v.exempted).toEqual(["rules/x.md"]);
  });

  it("reports the source and the destination of a move separately", () => {
    // The shape the retirement flow actually runs. Both operands are protected
    // and both are exempt, so both are named.
    const v = classify("mv rules/x.md rules/retired/", { exempt: RULES });
    expect(v.deny).toBe(false);
    expect(v.exempted).toEqual(["rules/x.md", "rules/retired/"]);
  });

  it("reports the resolved path, not the spelling the command used", () => {
    const v = classify("rm /project/rules/x.md", { exempt: RULES });
    expect(v.exempted).toEqual(["rules/x.md"]);
  });

  it("also reports a path exempted out of the ancestor pass", () => {
    const v = classify("rm -rf hooks", { exempt: (p) => p === "hooks" });
    expect(v.deny).toBe(false);
    expect(v.exempted).toEqual(["hooks"]);
  });

  it("is ABSENT when the predicate accepted nothing", () => {
    // Not `[]` — the allow verdict stays identical to the no-predicate one, so
    // no caller can branch on an empty list it never sees today.
    expect(classify("rm notes.txt", { exempt: () => false })).toEqual({
      deny: false,
      mutates: true,
    });
    expect(classify("rm notes.txt", { exempt: RULES })).toEqual({
      deny: false,
      mutates: true,
    });
  });

  it("is ABSENT on a deny — nothing was let through", () => {
    // The exemption happened, and then a later segment denied the whole call.
    // A note written here would claim a write that never ran.
    const v = classify("rm rules/x.md && rm agents/coder.md", { exempt: RULES });
    expect(v.deny).toBe(true);
    expect(v.targetPath).toBe("agents/coder.md");
    expect(v.exempted).toBeUndefined();
  });

  it("is ABSENT on a fail-closed deny, which pass 3 cannot exempt", () => {
    const v = classify("rm rules/x.md && mv $A $B", { exempt: RULES });
    expect(v.deny).toBe(true);
    expect(v.exempted).toBeUndefined();
  });
});

describe("an empty protectedPaths list", () => {
  const NOTHING: Partial<MutationOptions> = { protectedPaths: [] };

  it("never denies, not even fail-closed", () => {
    expectAllAllow(
      [
        "rm rules/x.md",
        "rm -rf hooks",
        "mv $A $B",
        "echo x > rules/x.md",
        "sudo rm -rf agents",
      ],
      NOTHING,
    );
  });
});

/* ------------------------------------------------------------------ *
 * 10. THE REGRESSION CORPUS — commands that must never deny
 * ------------------------------------------------------------------ */

/**
 * ORDINARY AGENT COMMANDS — THE MUST-NEVER-DENY CORPUS.
 *
 * A false positive here is felt by every agent on every shell call, and it is
 * the largest blast radius in this Circle. This list is the reconstruction of
 * the two scratch matrices the earlier steps ran and lost (42 commands), sampled
 * against work this repository actually does: build and test, the git read side
 * plus `git checkout HEAD --`, reads of protected paths, backups, build-output
 * destruction, the `2>&1` forms, the substitution idioms, and the fusion helpers.
 *
 * IF A CHANGE TRIPS THIS BLOCK, that change denies ordinary agent work. Widen
 * the classifier only with the user's explicit agreement, the way the three
 * approved widenings were taken at the plan's Q3 gate — and add the newly-denied
 * command to a labelled case above rather than deleting it from here.
 *
 * The corpus was measured against a catch-all protected list and found to be
 * unrepresentative in the one direction that matters
 * (`issues/260801-1900_c_the-must-never-deny-corpus-omits-the-largest-false-positive-family.md`):
 * not one entry put a VARIABLE OR SUBSTITUTION IN A WRITTEN-OPERAND POSITION,
 * which is the largest false-positive family the fail-closed rule produces. The
 * family is now split in two and both halves are here:
 *
 *   - the shapes that must allow — a redirect target on a program outside the
 *     verb table, prose containing a redirect operator — are in this list;
 *   - the shapes that still deny are in `KNOWN_FALSE_POSITIVES` below, asserted
 *     at their current behaviour so a later narrowing shows up as a test flip
 *     rather than as nothing.
 */
const ORDINARY_AGENT_COMMANDS = [
  // build and test
  "npm test",
  "npm run build",
  "npx tsc --noEmit",
  "cd hooks && npm test",
  "node hooks/dist/guard.js",
  "claude plugin validate .",
  "make 2>&1 | tee /tmp/build.log",
  "npm test 2>&1 | head -20",
  // git, read side
  "git status --short",
  "git diff --stat",
  "git log --oneline -10",
  "git stash list",
  "git branch --show-current",
  // git, write side that is not a path mutation
  "git add -A",
  "git commit -m 'feat: x'",
  "git push origin main",
  "git tag -a v5.8.0 -m 'fusion v5.8.0'",
  // the revert strategy
  "git checkout HEAD -- rules/x.md",
  "git restore --staged agents/coder.md",
  // reads of protected paths
  "cat rules/git-branch-discipline.md",
  "head -50 agents/coder.md",
  "grep -rn 'protectedPaths' hooks/",
  "jq '.guard.protectedPaths' hooks/config.json",
  "wc -l rules/*.md",
  "sed -n '1,20p' rules/critical-stance.md",
  "diff rules/a.md rules/b.md",
  "ls -la fusion-workbench/circles/",
  "find fusion-workbench -name '_t_circle.md'",
  // backups and copies OUT of a protected path
  "cp -R rules /tmp/backup",
  "cp hooks/config.json /tmp/config.json",
  "tar -czf /tmp/rules.tgz rules/",
  // build-output destruction
  "rm -rf node_modules",
  "rm -rf hooks/node_modules",
  "rm -rf hooks/dist",
  "rm -rf dist build",
  "rm -f /tmp/probe.txt",
  // workbench housekeeping
  "mkdir -p fusion-workbench/circles/260801-1244-x/planning",
  "touch fusion-workbench/tasklist.md",
  "date +%y%m%d-%H%M",
  // in-place edits outside the tree
  "sed -i '' 's/5.7.0/5.8.0/' /tmp/scratch.json",
  // substitution idioms
  "echo \"$(date) done\" >> /tmp/session.log",
  'cd "$(dirname "$0")" && npm test',
  "for f in rules/*.md; do wc -l \"$f\"; done",
  // the fusion helpers
  "bin/fusion-rules coder",
  "bin/fusion-paths coder",
  '"$FUSION_PLUGIN_ROOT/bin/fusion-workbench-root"',
  // wrappers over harmless programs
  "sudo ls -la /var/log",
  "xargs -n 1 echo < /tmp/list",
  // the documented residual, stated as a test
  "chmod +x bin/fusion-plane",
  "curl -sL https://example.com/x.tgz -o /tmp/x.tgz",
  // WORKING FROM A SUBDIRECTORY — added with virtual-cwd tracking (step 4),
  // which resolves every relative operand through whatever `cd` came before it
  // and therefore carries the step's own false-positive risk. Ordinary agent
  // work uses `cd` constantly, so the corpus has to exercise it.
  "cd hooks && npm run build",
  "cd hooks && npx vitest run 2>&1 | tail -20",
  "cd hooks && rm -rf dist && npm run build",
  "cd hooks && rm -rf node_modules && npm ci",
  "cd hooks && rm -f dist/guard.js",
  "cd hooks && sed -i '' 's/a/b/' dist/guard.js",
  "cd hooks && cp config.json /tmp/config.backup.json",
  "cd hooks && npm test > /tmp/test.log 2>&1",
  "cd rules && grep -rn MUST .",
  "cd rules && wc -l *.md",
  "cd fusion-workbench && ls circles",
  "cd fusion-workbench && rm -rf circles/old-circle",
  "cd /tmp && rm -rf probe",
  "cd /tmp && mkdir -p work && cd work && rm -rf out",
  "cd ../.. && ls",
  "cd $(git rev-parse --show-toplevel) && git status",
  "cd ~/Downloads && ls -la",
  "cd hooks; npm test; cd ..",
  "cd hooks && npm test; cd -",
  "pushd hooks > /dev/null && npm test; popd > /dev/null",
  "(cd hooks && rm -rf dist)",
  "cd node_modules && rm -rf .cache",
  // CONDITIONALS AND LOOPS — added with the compound-command heads
  // (`issues/260801-1857_c_…`), which put `if` / `elif` / `while` / `until` in
  // front of the same verb table `then` / `else` / `do` already fed. Ordinary
  // agent work is full of these, so widening the skip has to be checked here
  // rather than assumed.
  "if [ -f hooks/config.json ]; then echo present; fi",
  "if [ -d hooks/dist ]; then rm -rf hooks/dist; fi",
  "if ! command -v jq; then echo 'install jq'; fi",
  "if git diff --quiet; then echo clean; else echo dirty; fi",
  "while read -r f; do wc -l \"$f\"; done < /tmp/list",
  "until curl -sf http://localhost:3000; do sleep 1; done",
  "for f in rules/*.md; do head -1 \"$f\"; done",
  "if cd hooks && npm test; then echo ok; fi",
  "exec npm test",
  // A VARIABLE OR SUBSTITUTION AS THE THING BEING WRITTEN — the family the
  // corpus was missing entirely. These are the half that must allow: the
  // program is outside the verb table, so the fail-closed rule does not reach
  // its redirect target ("Fail-closed, and its bound"). The half that still
  // denies is `KNOWN_FALSE_POSITIVES`.
  'npm test > "$TMPDIR/test.log"',
  'npm test > "$LOG" 2>&1',
  "npm run build > $BUILD_LOG",
  "echo hi >> ~/notes.md",
  "cat report.md > ~/backup.md",
  'go build -o "$BIN" ./cmd/x',
  'cd "$(git rev-parse --show-toplevel)" && npm test > /tmp/build.log',
  "sed -n '1,20p' rules/critical-stance.md > /tmp/head.txt",
  "jq '.version' .claude-plugin/plugin.json > /tmp/v.txt",
  // PROSE CARRYING A REDIRECT OPERATOR — commit messages and PR bodies about
  // the very directories fusion protects.
  'git commit -m "docs: rules/a.md -> rules/b.md"',
  'echo "moved rules/a.md -> rules/b.md"',
  'gh pr create --body "moves a -> agents/b.md"',
  'git commit -m "fix: guard reads a > inside a string as a redirect"',
  // THE GIT SUBCOMMANDS ADDED TO THE TABLE — their non-mutating forms.
  "git clean -n rules",
  "git clean -fdx hooks/dist",
  "git stash",
  "git stash pop",
  "git restore rules/x.md",
  // THE STASH FAMILY, from wherever an agent happens to be standing. The row
  // used to read the sub-subcommand as a path, so every one of these denied
  // from inside a protected directory, and the message and ref forms denied
  // from anywhere. `/fusion:circle-stash` is built on these.
  "cd hooks && git stash pop",
  "cd rules && git stash list",
  "cd agents && git stash show",
  'git stash push -m "$MSG"',
  'git stash push -m "wip: rules/x.md and agents/coder.md"',
  'git stash show "$REF"',
  'git stash apply "$STASH"',
  'git stash list > "$LOG"',
  "git stash save 'wip on the guard'",
  // PERL'S INCLUDE FLAG, glued to its value — not the in-place flag.
  "perl -Ilib script.pl",
  "perl -Ilib rules/gen.pl",
  "perl -Ilib -e 'print' rules/gen.pl",
  // ...and the other side of that pair: a MANDATORY glued value ends the flag
  // letters, so these read no `i` and stay allowed, while `perl -lpi` denies.
  "perl -Mstrict -e 'print' rules/gen.pl",
  "perl -Ilib -Mstrict script.pl",
  "sed -fscript.sed rules/x.md",
  // THE IN-PLACE FORMS POINTED OUTSIDE THE TREE. These are the load-bearing
  // half of the flag-grammar change: the classifier must read the `i` (so the
  // operand really is resolved and matched) and still allow, which a rule that
  // simply stopped seeing `-lpi` would also pass. Running them under the
  // catch-all list is what tells the two apart.
  "perl -lpi -e 's/a/b/' /tmp/notes.txt",
  "perl -0pi -e 's/a/b/' /tmp/notes.txt",
  "sed -li 's/a/b/' /tmp/scratch.txt",
  "perl -Ilib -i.bak -pe 's/a/b/' /tmp/gen.pl",
  // The one stash form that DOES name paths, pointed at build output.
  "git stash push build/out.js",
];

/**
 * KNOWN FALSE POSITIVES — denied today, ACCEPTED rather than intended.
 *
 * The other half of the variable-in-written-position family. Each is a
 * legitimate command an agent might write, and each is denied because the
 * fail-closed rule reaches every operand of a recognised verb and cannot tell
 * `$TMPDIR` from `rules`. They are asserted, not endorsed: a later narrowing
 * that fixes one flips a test here instead of passing silently, which is what
 * `ORDINARY_AGENT_COMMANDS` cannot do for a behaviour it does not contain.
 *
 * The way through, for an agent that meets one, is in the deny reason: write
 * the path out literally, or name it absolutely, or drop the `cd`.
 */
const KNOWN_FALSE_POSITIVES = [
  'rm -f "$TMPDIR/probe.txt"',
  'rm -rf "$BUILD_DIR"',
  'mv "$f" /tmp/',
  'cp build/out.js "$DEST"',
  'truncate -s 0 "$LOG"',
  'npm test 2>&1 | tee "$LOG"',
  'for f in build/*.js; do rm "$f"; done',
  'while read -r f; do rm -f "$f"; done < /tmp/list',
  'cd "$TMPDIR" && rm -rf work',
  'cd "$(git rev-parse --show-toplevel)" && rm -rf hooks/dist',
  "rm -rf ~/.cache/fusion",
];

/**
 * The catch-all list: every path is protected, so a command denies under it iff
 * the classifier DETECTS A WRITE in it. That is the measurement the old count
 * floor could not make — `expect(ORDINARY_AGENT_COMMANDS.length)
 * .toBeGreaterThanOrEqual(42)` asserted on the fixture's own size and would
 * have passed with twenty hard commands swapped for twenty trivial ones.
 */
const EVERYTHING_PROTECTED = ["**"];

function exercisesADetectedWrite(cmd: string): boolean {
  return denies(cmd, { protectedPaths: EVERYTHING_PROTECTED });
}

describe("MUST NEVER DENY — the ordinary-agent-command corpus", () => {
  it("holds enough commands that actually exercise a detected write", () => {
    // A floor on the load-bearing half only. A command with no write the
    // classifier can see (`npm test`, `git status --short`, `date +%y%m%d`)
    // holds nothing down, however many of them there are — and roughly a third
    // of this corpus is that kind. 32 of the 119 entries carry a detected write
    // as this is written; the floor sits below that so a deliberate removal is
    // possible and a quiet substitution is not.
    //
    // The count fell to 27 when the `git stash` row learned its own
    // sub-subcommands: `git stash pop` and `git stash list` had been counting
    // as load-bearing only because the row read `pop` and `list` as written
    // paths, which is the bug. A phantom write is not coverage, so the four
    // in-place-outside-the-tree forms and `git stash push build/out.js` were
    // added to restore the margin with real ones rather than lowering the
    // floor to fit.
    const loadBearing = ORDINARY_AGENT_COMMANDS.filter(exercisesADetectedWrite);
    expect(loadBearing.length).toBeGreaterThanOrEqual(27);
  });

  for (const cmd of ORDINARY_AGENT_COMMANDS) {
    it(`allows: ${cmd}`, () => {
      const v = classify(cmd);
      expect(v.deny, v.reason ?? "").toBe(false);
    });
  }
});

describe("KNOWN FALSE POSITIVES — accepted, asserted so a narrowing is visible", () => {
  for (const cmd of KNOWN_FALSE_POSITIVES) {
    it(`still denies (accepted): ${cmd}`, () => {
      expect(denies(cmd)).toBe(true);
    });
  }

  it("each one is a recognised verb, which is why it is denied and the corpus half is not", () => {
    // The discriminator between the two blocks. If a command lands here with no
    // recognised verb in it, the fail-closed bound has been widened again.
    for (const cmd of KNOWN_FALSE_POSITIVES) {
      const v = classify(cmd);
      expect(v.reason, cmd).toMatch(/fail-closed/);
    }
  });
});

/* ------------------------------------------------------------------ *
 * 11. The issue's reproduction block
 * ------------------------------------------------------------------ */

describe("the reproduction block from issue 260801-1156", () => {
  it("denies every command the issue used to bypass the guard with", () => {
    expectAllDeny([
      "mv rules/git-branch-discipline.md /tmp/",
      "rm rules/git-branch-discipline.md",
      "sed -i '' 's/MUST/may/' rules/git-branch-discipline.md",
      "printf '' > rules/git-branch-discipline.md",
      "rm -rf fusion-workbench/.guard-state",
    ]);
  });
});

/* ------------------------------------------------------------------ *
 * 12. Named residuals — allowed, and asserted so they stay visible
 * ------------------------------------------------------------------ */

describe("the accepted residual (allowed by design, asserted so it stays visible)", () => {
  it("allows an unrecognised program writing a protected path", () => {
    expectAllAllow([
      "curl -o rules/x.md https://example.com/x",
      "./build.sh --out rules/x.md",
      "python3 -c 'open(\"rules/x.md\",\"w\")'",
    ]);
  });

  it("allows verbs deliberately left out of the table", () => {
    expectAllAllow([
      "chmod 000 rules/x.md",
      "chown root rules/x.md",
      "touch rules/new.md",
      "mkdir agents/sub",
      "rsync -a /tmp/x/ rules/",
      "patch -p1 < /tmp/x.patch",
      "tar -xf /tmp/x.tar -C rules/",
      "gzip rules/x.md",
    ]);
  });

  it("allows a mutation whose operands arrive on stdin", () => {
    // `xargs` is skipped, but the paths never appear in the command string.
    expectAllAllow(["find . -name '*.md' | xargs rm -rf", "xargs rm < /tmp/list"]);
  });

  it("allows the git subcommands that name their targets elsewhere", () => {
    // `git apply` / `git am` read their targets out of the patch file, which is
    // out of scope for a text classifier — the same residual `patch` sits in.
    // A `git clean` with no path operand names no directory to compare, exactly
    // as `rm -rf *` does not.
    expectAllAllow([
      "git apply /tmp/x.patch",
      "git am /tmp/x.mbox",
      "git clean -fdx",
      "git clean -fd",
    ]);
  });

  it("denies a redirect operator in a TRAILING COMMENT (the residual errs to deny)", () => {
    // The lexer has no notion of a comment, so `#` is an ordinary word and the
    // `>` after it is scanned as code. Stripping comments is a change to the
    // segmenter that blank mode — pinned byte-for-byte against the legacy one
    // the git classifier consumes — cannot take, so it stays stated rather than
    // half-fixed. It over-blocks, which is the safe direction.
    expect(denies("ls -la # writes > rules/x.md")).toBe(true);
    expect(denies("npm test # && rm rules/x.md")).toBe(true);
  });

  it("allows a shell expansion the classifier matches as literal text", () => {
    // Same family as `rm -rf *`: brace expansion is not a path the classifier
    // can compare, and treating `{`/`*` as unresolved would fail-closed on
    // `rm build/*.js` and every other ordinary glob.
    expectAllAllow(["rm -rf {rules,agents}", "rm -rf rules{,-draft}"]);
  });
});

/* ------------------------------------------------------------------ *
 * 12b. A backslash line continuation is one command, not two
 * ------------------------------------------------------------------ */

/**
 * Was a KNOWN GAP, now closed. `shell-parse` did not honour `\` at end of line:
 * the escape pair was emitted verbatim and the newline then terminated the
 * segment, so everything after the continuation stopped being an operand of the
 * verb before it. The git classifier had the same hole (`git worktree \` +
 * newline + `add …` was allowed; `git switch` survived only because the bare
 * verb denies on its own).
 *
 * Filed as
 * `issues/260801-1513_c_backslash-line-continuation-splits-a-command-and-hides-its-operands.md`
 * and fixed in `stripData`, which now splices the continuation out the way bash
 * does before tokenizing. These cases were written asserting the broken
 * (allowing) behaviour and are flipped here; the parser-level boundaries the fix
 * turns on — single vs double quotes, `\\` before a newline, heredoc bodies —
 * are pinned in `shell-parse.test.ts`.
 */
describe("a backslash line continuation is one command, not two", () => {
  it("denies a continued mutation", () => {
    expectAllDeny(["rm \\\n  rules/x.md", "mv \\\n  rules/x.md \\\n  /tmp/"]);
  });

  it("still denies the same command written on one line", () => {
    expectAllDeny(["rm   rules/x.md", "mv   rules/x.md   /tmp/"]);
  });

  it("does not treat an ESCAPED backslash before a newline as a continuation", () => {
    // `rm \\` + newline + `rules/x.md` is `rm \` (a file literally named
    // backslash) and then `rules/x.md` in command position — two commands,
    // neither of which writes a protected path. Splicing them would invent a
    // mutation bash never performs.
    expectAllAllow(["rm \\\\\n  rules/x.md"]);
  });

  it("keeps a continuation inside single quotes inert", () => {
    // Single quotes suppress the escape, so the two lines stay literal text —
    // and being quoted, they are an operand of `echo`, never a command.
    expectAllAllow(["echo 'rm \\\n rules/x.md'"]);
  });

  it("splices a continuation inside double quotes into the operand", () => {
    // Bash removes `\` + newline inside double quotes too, so this really is
    // `rm rules/x.md`.
    expectAllDeny(['rm "rules/\\\nx.md"']);
  });
});

/* ------------------------------------------------------------------ *
 * 13. The virtual working directory (plan step 4)
 * ------------------------------------------------------------------ */

/**
 * A relative operand means nothing without knowing where the shell is standing.
 * `cd fusion-workbench && rm -rf .guard-state` is the sharpest case the issue
 * names — the operand matches no protected pattern, and the escalation counter
 * that halts a misbehaving agent lives behind it.
 *
 * These cases were written in step 3 asserting the untracked (allowing)
 * behaviour and are flipped here; they are the plan's step-4 acceptance criteria
 * plus the forms the criteria do not name.
 */
describe("virtual cwd — a mutation reached through cd", () => {
  it("denies the headline case, naming the resolved path", () => {
    const v = classify("cd fusion-workbench && rm -rf .guard-state");
    expect(v.deny).toBe(true);
    expect(v.targetPath).toBe("fusion-workbench/.guard-state");
    expect(v.offendingSegment).toBe("rm -rf .guard-state");
  });

  it("resolves relative operands through the cd", () => {
    expectAllDeny([
      "cd rules && rm x.md",
      "cd hooks && rm config.json",
      "cd agents && mv coder.md /tmp/",
      "cd bin && rm monitor",
      "cd skills && rm -rf setup",
      "cd fusion-workbench/.guard-state && rm -f escalation.json",
      "cd rules; rm x.md", // `;` separates exactly as `&&` does
    ]);
  });

  it("resolves a `..` inside the operand against the cd, not the root", () => {
    expect(denies("cd hooks && rm ../rules/x.md")).toBe(true);
    expect(denies("cd hooks && rm ../README.md")).toBe(false);
    expect(denies("cd rules && rm ../build/out.js")).toBe(false);
  });

  it("applies to redirection targets, wrappers and the git subcommands alike", () => {
    expectAllDeny([
      "cd rules && echo x > x.md",
      "cd hooks && printf '' > config.json",
      "cd rules && tee x.md",
      "cd rules && sudo rm x.md",
      "cd hooks && sed -i '' 's/a/b/' config.json",
      "cd rules && git mv x.md /tmp/",
    ]);
  });

  it("keeps ordinary work in a subdirectory allowed", () => {
    expectAllAllow([
      "cd build && rm -rf out",
      "cd hooks && rm -rf dist",
      "cd hooks && rm -f dist/guard.js",
      "cd fusion-workbench && rm -rf circles",
      "cd node_modules && rm -rf .cache",
    ]);
  });
});

describe("virtual cwd — the forms a cd target can take", () => {
  it("reads every literal spelling of the same directory", () => {
    expectAllDeny([
      "cd rules && rm x.md",
      "cd ./rules && rm x.md",
      "cd rules/ && rm x.md",
      "cd 'rules' && rm x.md",
      'cd "rules" && rm x.md',
      "cd -L rules && rm x.md", // the modelled flag: -L IS bash's default
      "cd -- rules && rm x.md",
      "cd /project/rules && rm x.md", // absolute, back under the project root
      "cd /project && rm rules/x.md",
      "cd rules && cd /project/agents && rm coder.md", // absolute wins over the base
      "cd fusion-workbench && cd .guard-state && rm escalation.json",
    ]);
  });

  it("uses chdir as an alias of cd", () => {
    expect(denies("chdir rules && rm x.md")).toBe(true);
  });
});

describe("virtual cwd — walking out of the project", () => {
  it("allows a mutation under an absolute directory elsewhere", () => {
    expectAllAllow([
      "cd /tmp && rm -rf x",
      "cd /tmp && echo x > y.md",
      "cd /var/folders/t && rm -rf scratch",
      "cd rules && cd /tmp && rm -rf x", // the second cd replaces the first
    ]);
  });

  it("allows a mutation above the project root", () => {
    expectAllAllow([
      "cd ../.. && rm -rf y",
      "cd .. && rm -rf sibling",
      "cd rules && cd .. && cd .. && rm -rf y",
    ]);
  });

  it("treats a bare cd and a ~ as somewhere outside the tree, not as unknown", () => {
    // `~` is home expansion the shell performs from the environment. It is the
    // project root only if the project IS the home directory, so a relative
    // operand under it can match no relative pattern — and denying `cd &&
    // rm -rf junk` would be a false positive for nothing.
    expectAllAllow([
      "cd && rm -rf junk",
      "cd ~ && rm -rf junk",
      "cd ~/tmp && rm -rf junk",
      "cd ~/scratch && rm -rf out",
      "cd ~ && cd tmp && rm -rf junk", // a relative hop from outside stays outside
    ]);
  });

  it("still resolves an ABSOLUTE operand from an unnameable directory", () => {
    expect(denies("cd ~ && rm /project/rules/x.md")).toBe(true);
    expect(denies("cd $D && rm /project/rules/x.md")).toBe(true);
  });
});

describe("virtual cwd — cd - and the directory stack", () => {
  it("swaps back with cd -", () => {
    expect(denies("cd rules && cd - && rm x.md")).toBe(false);
    expect(denies("cd build && cd - && rm rules/x.md")).toBe(true);
    expect(denies("cd rules && cd /tmp && cd - && rm x.md")).toBe(true);
  });

  it("denies a leading cd - , whose $OLDPWD is inherited and unknowable", () => {
    expect(denies("cd - && rm -rf junk")).toBe(true);
  });

  it("tracks pushd and popd as the cd they are", () => {
    expect(denies("pushd rules && rm x.md")).toBe(true);
    expect(denies("pushd rules > /dev/null && rm x.md && popd")).toBe(true);
    expect(denies("pushd rules && popd && rm x.md")).toBe(false);
    expect(denies("pushd /tmp && rm -rf junk && popd")).toBe(false);
  });

  it("treats a popd on an empty stack as the no-op bash makes it", () => {
    // The stack starts empty in every Bash call, so `popd` errors and the
    // shell stays where it is.
    expect(denies("popd && rm x.md")).toBe(false);
    expect(denies("popd && rm rules/x.md")).toBe(true);
  });

  it("gives up on the stack rotations it does not model", () => {
    expectAllDeny(["pushd && rm x.md", "popd +1 && rm x.md"]);
  });
});

/* ------------------------------------------------------------------ *
 * 13a-bis. The working-directory model is an ALLOW-LIST
 * ------------------------------------------------------------------ */

/**
 * The fourth instance of one defect class in one Circle, and the first fix that
 * is not a narrowing of the previous one
 * (`issues/260803-1431_…cd-p…`, `issues/260803-1803_…cdpath-and-pushd-n…`,
 * `analyses/260803-1803-guard-path-model-root-cause.md`).
 *
 * `firstDirArg` used to skip anything shaped like a flag and then model
 * whatever followed with bash's DEFAULT logical semantics. That is correct for
 * a default `cd` and wrong the moment a modifier changes the resolution rule.
 * Five entrances were measured against the real guard, every one of them
 * allowing a delete or an overwrite of a protected file that real bash then
 * performed:
 *
 *     cd -P rules/L/.. && rm agents/coder.md          (grant side, flag set)
 *     set -P; cd rules/L/.. && rm agents/coder.md     (grant side, flag set)
 *     pushd -P rules/L/.. && rm agents/coder.md       (grant side, flag set)
 *     cd docs && CDPATH=.. cd agents && rm coder.md   (protection side, NO flag)
 *     pushd -n docs && rm agents/coder.md             (protection side, NO flag)
 *
 * The cases below are written against the STANCE rather than against those five
 * spellings, because enumerating the spellings is what the three previous fixes
 * did. What is asserted is that an unrecognised modifier reaches `CWD_UNKNOWN`
 * — the state `cd $D && rm notes.txt` has always denied through — and that the
 * modelled forms are untouched.
 */
describe("virtual cwd — an unmodelled modifier is fail-closed, not modelled", () => {
  it("denies after a flag whose effect on the directory is not modelled", () => {
    // Every one of these ALLOWED before the inversion, because the flag was
    // skipped and the operand modelled as a plain logical `cd`.
    expectAllDeny([
      "cd -P build && rm out.js",
      "cd -P docs && rm ../notes.txt",
      "pushd -P build && rm out.js",
      "pushd -n docs && rm agents/coder.md",
      "cd -e build && rm out.js",
      "cd -@ build && rm out.js",
      "pushd -q build && rm out.js",
    ]);
  });

  it("keeps modelling the flags it actually models", () => {
    // `-L` IS bash's default resolution, so spelling it out changes nothing;
    // `--` ends option processing. Both stay exact in BOTH directions.
    expectAllAllow([
      "cd -L build && rm out.js",
      "cd -- build && rm out.js",
      "pushd -L build && rm out.js",
    ]);
    expectAllDeny([
      "cd -L rules && rm x.md",
      "cd -- rules && rm x.md",
      "pushd -L rules && rm x.md",
    ]);
  });

  it("names the working directory as the cause, not the operand", () => {
    // The deny has to be diagnosable, or an agent meeting it starts rephrasing.
    // `protected-path-discipline.md` already tells it that an absolute path is
    // the way through, and this is the reason that says so.
    const v = classify("cd -P build && rm out.js");
    expect(v.deny).toBe(true);
    expect(v.reason).toContain("working directory the guard cannot determine");
  });

  it("gives up the whole state, not only the current directory", () => {
    // `pushd -n DIR` pushes onto the stack and STAYS PUT; `popd -n` removes a
    // stack entry and stays put. Both were measured allowing a protected delete
    // through a LATER `popd` or `cd -` that landed on an entry bash no longer
    // had. Zeroing the working directory alone leaves both open, which is why
    // `unmodelled()` is stated over `cwd`, `prev` AND `dirStack`.
    expectAllDeny([
      "cd docs && pushd -n .. && popd && rm agents/coder.md",
      "cd docs && pushd -n .. && cd - && rm agents/coder.md",
      "cd docs && pushd ..; popd -n; popd; rm agents/coder.md",
    ]);
    // And the modelled stack still works, so the give-up is not a blanket one.
    expect(denies("pushd rules && popd && rm x.md")).toBe(false);
    expect(denies("cd build && pushd /tmp && popd && rm out.js")).toBe(false);
  });
});

describe("virtual cwd — `set -P` puts bash somewhere the classifier cannot follow", () => {
  it("denies a relative mutation after a cd made in physical mode", () => {
    expectAllDeny([
      "set -P; cd build && rm out.js",
      "set -o physical; cd build && rm out.js",
      "set -eP; cd build && rm out.js", // a short-flag cluster sets every letter
      "set $FLAGS; cd build && rm out.js", // could expand to -P: fail closed
    ]);
  });

  it("costs nothing for the `set` forms an agent actually writes", () => {
    // `physical` is the ONLY `set -o` option that changes where a `cd` lands,
    // so the enumeration is complete over bash's option set rather than over
    // the flags this module happened to think of.
    expectAllAllow([
      "set -e; cd build && rm out.js",
      "set -euo pipefail; cd build && rm out.js",
      "set -o pipefail; cd build && rm out.js",
      "set -x; cd build && rm out.js",
      'set -- "$@"; cd build && rm out.js', // everything after `--` is positional
    ]);
  });

  it("does not degrade a directory no cd has moved", () => {
    // `set -P` changes how a LATER `cd` resolves; it moves nothing itself.
    expect(denies("set -P; rm build/out.js")).toBe(false);
    expect(denies("set -P; rm rules/x.md")).toBe(true);
  });

  it("keeps the mode inside the subshell that set it", () => {
    // A `(…)` subshell's directory state is discarded when it closes, and the
    // resolution mode is part of that state exactly as the cwd is.
    expect(denies("(set -P; cd docs); cd build && rm out.js")).toBe(false);
    expect(denies("set -P; (cd docs); cd build && rm out.js")).toBe(true);
  });
});

describe("virtual cwd — a CDPATH assignment makes a bare-word cd unknowable", () => {
  it("denies after every spelling of the assignment", () => {
    // `findCommandWord` skips a leading `VAR=value` so `FOO=1 rm x` classifies
    // as the `rm` it is — which is exactly what made the prefix form invisible.
    expectAllDeny([
      "cd docs && CDPATH=.. cd agents && rm coder.md",
      "cd docs && export CDPATH=.. && cd agents && rm coder.md",
      "cd docs && CDPATH=..; cd agents && rm coder.md",
      'cd docs && CDPATH=".." cd agents && rm coder.md',
      "cd docs && declare -x CDPATH=.. && cd agents && rm coder.md",
      "CDPATH=/tmp cd build && rm out.js",
    ]);
  });

  it("keeps the control an allow, so the deny is not for the wrong reason", () => {
    // The same command WITHOUT the assignment allows, and real bash leaves the
    // file alone because `docs/agents/coder.md` does not exist. The assignment
    // is the whole of what makes the allow consequential.
    expect(denies("cd docs && cd agents && rm coder.md")).toBe(false);
    expect(denies("FOO=1 cd build && rm out.js")).toBe(false);
    expect(denies("cd docs && export FOO=.. && cd agents && rm coder.md")).toBe(false);
  });

  it("leaves an explicitly-anchored operand modelled, in both directions", () => {
    // Verified against real bash rather than inferred: with `CDPATH=..` set,
    // `cd agents` lands outside the current directory while `cd ./agents`,
    // `cd ../junk/agents`, `cd .` and `cd ..` all resolve locally.
    expectAllAllow([
      "CDPATH=.. cd ./build && rm out.js",
      "CDPATH=.. cd /project/build && rm out.js",
      "CDPATH=.. cd .. && rm -rf sibling",
      "CDPATH=.. cd . && rm build/out.js",
      "cd build && CDPATH=.. cd ../build && rm out.js",
    ]);
    expectAllDeny([
      "CDPATH=.. cd ./rules && rm x.md",
      "CDPATH=.. cd /project/rules && rm x.md",
      "CDPATH=.. cd . && rm rules/x.md",
    ]);
  });
});

/* ------------------------------------------------------------------ *
 * 13a-ter. An AMBIENT CDPATH — the half no command text can show
 * ------------------------------------------------------------------ */

/**
 * `assignsCdpath` catches a `CDPATH` WRITTEN INTO the command. The Bash tool's
 * shell is initialised from the user's profile, so `export CDPATH=…` in a
 * `.zshrc` does the same thing with nothing in the command to give it away.
 *
 * Measured against real bash 3.2 and zsh before any of this was written, from a
 * directory holding no `only/`:
 *
 *     CDPATH=/decoy    cd only   -> /decoy/only     (bash AND zsh)
 *     CDPATH=/decoy    pushd only-> /decoy/only     (pushd searches it too)
 *     CDPATH=/decoy    cd ./x    -> local, or fails (anchored operands immune)
 *     CDPATH=          cd only   -> fails           (blank is not a search list)
 *
 * The user chose to degrade rather than to document the residual
 * (`decisions/260803-1803_a_…-cdpath-in-the-ambient-environment.md`): a user
 * with no `CDPATH` sees nothing change, and a user who has one gets a visible
 * denial instead of a silently weaker guard they have no way to detect.
 *
 * The environment reaches the classifier as `opts.env`, so every case here sets
 * it for ONE call. Nothing touches `process.env`.
 */
describe("virtual cwd — an ambient CDPATH makes a bare-word cd unknowable", () => {
  /** A profile-set `CDPATH`, as `guard.ts` would hand it over. */
  const AMBIENT = { env: { CDPATH: "/decoy" } };

  it("degrades a bare-word cd that no command text marks as suspect", () => {
    // Every one of these ALLOWS with no CDPATH set — the whole point is that
    // the command looks identical either way.
    expectAllAllow([
      "cd build && rm out.js",
      "cd docs && rm ../notes.txt",
      "cd junk/rules && rm x.md", // multi-component bare words are searched too
      "pushd build && rm out.js", // measured: pushd consults CDPATH as cd does
    ]);
    expectAllDeny(
      [
        "cd build && rm out.js",
        "cd docs && rm ../notes.txt",
        "cd junk/rules && rm x.md",
        "pushd build && rm out.js",
      ],
      AMBIENT,
    );
  });

  it("names CDPATH as the cause, because nothing in the command does", () => {
    // The constraint the decision record put on this option. A reason naming
    // only the working directory would send a user with CDPATH set reading a
    // command that contains no cause, and `protected-path-discipline.md` exists
    // to stop exactly that kind of blind rephrasing.
    const v = classify("cd rules && rm x.md", AMBIENT);
    expect(v.deny).toBe(true);
    expect(v.reason).toContain("CDPATH is set in this shell's environment");
    // And it says what to DO — both ways out, named.
    expect(v.reason).toContain("anchor the `cd` operand");
    expect(v.reason).toContain("unset CDPATH");

    // The same deny WITHOUT the ambient variable is a different reason, so the
    // two are told apart rather than merged into one vague message. Here it is
    // the protected path itself; for an unmodelled flag it is the working
    // directory.
    expect(classify("cd rules && rm x.md").reason).not.toContain("CDPATH");
    expect(classify("cd -P build && rm out.js").reason).not.toContain("CDPATH");
    expect(classify("cd -P build && rm out.js", AMBIENT).reason).toContain(
      "working directory the guard cannot determine",
    );
  });

  it("leaves an anchored operand IDENTICAL, verdict for verdict", () => {
    // The whole cost argument rests on this: a user who has CDPATH set can
    // anchor the operand and get the old behaviour exactly. Asserted as
    // equality of the entire verdict — deny, reason, offending segment and
    // target path — rather than by comparing two booleans and hoping.
    const anchored = [
      "cd ./rules && rm x.md",
      "cd ../rules && rm x.md",
      "cd /project/rules && rm x.md",
      "cd ./build && rm out.js",
      "cd . && rm build/out.js",
      "cd .. && rm -rf sibling",
      "cd /tmp && rm -rf x",
      "cd ./docs && rm ../notes.txt",
      "pushd ./rules && rm x.md",
    ];
    for (const cmd of anchored) {
      expect(classify(cmd, AMBIENT), `CDPATH changed: ${cmd}`).toEqual(
        classify(cmd),
      );
    }
  });

  it("leaves a command with no cd at all IDENTICAL", () => {
    // CDPATH changes where a `cd` LANDS. It cannot reach a command that never
    // moves, and a degrade that leaked into one would be a cost nobody agreed
    // to.
    const noCd = [
      "rm rules/x.md",
      "rm -rf node_modules",
      "mv build/out.js dist/",
      "echo hi > notes.txt",
      "npm test > /tmp/log",
      "rm -rf dist",
    ];
    for (const cmd of noCd) {
      expect(classify(cmd, AMBIENT), `CDPATH changed: ${cmd}`).toEqual(
        classify(cmd),
      );
    }
  });

  it("counts a blank CDPATH as unset", () => {
    // `export CDPATH=` in a profile has asked for nothing, and measured against
    // real bash it diverts nothing. Neither does a whitespace-only value.
    for (const blank of ["", " ", "\t", "\n  \t"]) {
      expect(
        classify("cd build && rm out.js", { env: { CDPATH: blank } }).deny,
        `blank CDPATH ${JSON.stringify(blank)} should not degrade`,
      ).toBe(false);
    }
    // And an environment carrying other variables is not an environment
    // carrying CDPATH.
    expect(
      classify("cd build && rm out.js", {
        env: { PATH: "/usr/bin", HOME: "/home/u", CDPATH_SUFFIX: "/decoy" },
      }).deny,
    ).toBe(false);
  });

  it("is not scoped by a subshell, and does not disturb the scoping", () => {
    // An exported variable is inherited by every subshell, so unlike `set -P`
    // there is no scope that could clear it. What the subshell still does is
    // discard the `cd`: the outer command is back at the project root either
    // way.
    expect(denies("(cd rules && ls) && rm x.md", AMBIENT)).toBe(false);
    expect(denies("(cd build && ls) && rm rules/x.md", AMBIENT)).toBe(true);
    // Inside the scope the degrade still applies.
    expect(denies("(cd build && rm out.js)", AMBIENT)).toBe(true);
  });

  it("reports the invisible cause first when both CDPATHs are in play", () => {
    // With an assignment in the command AND one in the environment, the user
    // can see the first and not the second, so the second is the one the reason
    // has to name. Anchoring the operand — the remedy it gives — clears both.
    const v = classify("cd docs && CDPATH=.. cd agents && rm coder.md", AMBIENT);
    expect(v.deny).toBe(true);
    expect(v.reason).toContain("CDPATH is set in this shell's environment");
  });
});

describe("virtual cwd — an unknowable directory is fail-closed", () => {
  it("denies a relative mutation after an unresolvable cd", () => {
    // Same discipline as `mv $SRC rules/`: the guard cannot prove the target is
    // outside the protected paths, so it does not guess. The cost is that
    // `cd "$(git rev-parse --show-toplevel)" && rm -rf hooks/dist` denies — the
    // agent's way out is an absolute path or no `cd` at all.
    expectAllDeny([
      "cd $D && rm -rf x",
      "cd $HOME && rm -rf tmp",
      "cd `pwd`/build && rm -rf out",
      'cd "$(git rev-parse --show-toplevel)" && rm -rf hooks/dist',
      "cd $D && tee out.log",
    ]);
  });

  it("does NOT reach a redirection whose program is outside the table", () => {
    // The narrowing from
    // `issues/260801-1859_c_redirection-carries-fail-closed-into-unrecognised-programs-and-three-docs-deny-it.md`:
    // fail-closed applies once a table verb is recognised, and `echo` is not
    // one. `cd $D && echo x > out.log` was the deny this costs — named here
    // rather than dropped, because it is the sharpest form of the give-up: the
    // operand is a perfectly ordinary relative path and only the directory is
    // unknown. The recognised-verb neighbour above still denies.
    expectAllAllow(["cd $D && echo x > out.log", 'cd "$(pwd)" && npm test > out.log']);
  });

  it("allows an absolute mutation after an unresolvable cd", () => {
    expectAllAllow(["cd $D && rm -rf /tmp/x", 'cd "$(dirname "$0")" && rm -f /tmp/y']);
  });

  it("allows a non-mutation after an unresolvable cd — the bound still holds", () => {
    expectAllAllow([
      'cd "$(dirname "$0")" && npm test',
      "cd $(git rev-parse --show-toplevel) && git status",
      "cd $D && ls -la",
    ]);
  });

  it("names the working directory, not the operand, in the reason", () => {
    const v = classify("cd $D && rm -rf x");
    expect(v.deny).toBe(true);
    expect(v.reason).toContain("working directory the guard cannot determine");
    expect(v.reason).toContain("cd");
    // Distinct from the plain unresolvable-operand reason, which would send the
    // agent off to rewrite an operand that is already literal.
    expect(v.reason).not.toBe(classify("rm $X").reason);
  });
});

describe("virtual cwd — a cd inside a subshell does not leak out", () => {
  it("discards a cd made inside a $(…) body", () => {
    expectAllAllow(["echo $(cd rules) && rm x.md", "echo `cd rules` && rm x.md"]);
  });

  it("discards a cd made inside a (…) subshell", () => {
    expectAllAllow([
      "(cd rules && ls) && rm x.md",
      "( cd rules && ls ) && rm x.md",
      "(cd rules); rm x.md",
      "(cd hooks && npm test) && rm dist/guard.js",
    ]);
  });

  it("still applies the enclosing cd INSIDE the subshell", () => {
    // A subshell inherits its parent's working directory; only its own changes
    // are discarded.
    expectAllDeny([
      "cd rules && echo $(rm x.md)",
      "$(cd rules && rm x.md)",
      "( cd rules && rm x.md )",
      "cd rules && ( rm x.md )",
    ]);
  });

  it("keeps a cd made in a loop body, which bash does not discard", () => {
    // `for … done` and `{ …; }` run in the current shell, so the cd persists.
    expect(denies("for d in a; do cd rules; done; rm x.md")).toBe(true);
    expect(denies("{ cd rules; }; rm x.md")).toBe(true);
  });
});

describe("virtual cwd — where it meets the ancestor rule", () => {
  it("catches `rm -rf .` once the cd has moved somewhere protected", () => {
    // At the project root `.` is excluded from the ancestor check by design
    // (`cp x .` must stay allowed, and `rm -rf .` is refused by `rm` itself).
    // A cd gives `.` a name, and the exclusion no longer applies.
    expect(denies("rm -rf .")).toBe(false);
    expect(denies("cd rules && rm -rf .")).toBe(true);
    expect(denies("cd hooks && rm -rf .")).toBe(true);
    expect(denies("cd build && rm -rf .")).toBe(false);
  });

  it("catches a write INTO the current directory once it is protected", () => {
    expect(denies("cp /tmp/x .")).toBe(false);
    expect(denies("cd rules && cp /tmp/x .")).toBe(true);
    expect(denies("cd build && cp /tmp/x .")).toBe(false);
  });

  it("names the directory the ancestor reason talks about", () => {
    const v = classify("cd fusion-workbench && rm -rf .");
    expect(v.deny).toBe(true);
    expect(v.targetPath).toBe("fusion-workbench");
    expect(v.reason).toContain("CONTAINS a protected path");
    expect(v.reason).toContain("fusion-workbench/.guard-state/**");
  });
});

/* ------------------------------------------------------------------ *
 * 13b. Residuals the virtual cwd does not close
 * ------------------------------------------------------------------ */

/**
 * Asserted at their current behaviour so they stay visible, in the shape of
 * section 12. None of them is a REGRESSION — each is a place the walk stops.
 */
describe("virtual cwd — the residuals, asserted so they stay visible", () => {
  it("cannot walk back INTO the project by name", () => {
    // The classifier is given a normaliser, not the project directory's own
    // name, so a path that leaves and returns is outside its coordinate space.
    expect(denies("cd .. && cd project && rm rules/x.md")).toBe(false);
  });

  it("shares one directory between sibling substitutions in ONE segment", () => {
    // `shell-parse` reports a depth but not a subshell identity, so two `$(…)`
    // bodies inside the same outer segment are indistinguishable from one body
    // with two segments. Separate outer segments are correctly independent.
    expect(denies("echo $(cd /tmp) $(rm rules/x.md)")).toBe(false);
    expect(denies("echo $(cd /tmp); echo $(rm rules/x.md)")).toBe(true);
  });

});

/* ------------------------------------------------------------------ *
 * 13c. The paren-subshell hole, closed
 * ------------------------------------------------------------------ */

/**
 * `(rm x)` used to tokenize to `(rm` + `x)`, and neither the command word nor
 * the operand survived the parenthesis — a one-character bypass of the whole
 * verb table. The virtual cwd already saw THROUGH the glued `(cd`, because the
 * scoping required it; widening the verbs was gated, and the gate passed.
 * `tokenize` now strips a subshell's parentheses for every consumer.
 * (`issues/260801-1610_c_paren-subshell-glues-its-parentheses-to-the-command-word-and-the-last-operand.md`)
 */
describe("a (…) subshell no longer hides its command or its last operand", () => {
  it("classifies a verb glued to the opening paren", () => {
    expectAllDeny([
      "(rm rules/x.md)",
      "(rm rules/x.md )",
      "( rm rules/x.md )", // the spaced form, which always worked
      "((rm rules/x.md))",
      "(mv rules/x.md /tmp/)",
      "echo ok && (rm agents/coder.md)",
    ]);
  });

  it("classifies an operand glued to the closing paren", () => {
    // The operand carried a trailing `)`, so it matched `rules/**` only by the
    // glob's accident and missed a non-glob pattern such as `hooks/config.json`
    // outright.
    expect(denies("(cd hooks && rm config.json)")).toBe(true);
    expect(denies("(rm hooks/config.json)")).toBe(true);
  });

  it("still discards the subshell's own cd", () => {
    // The strip is in the tokenizer; the scope counter reads the segment TEXT,
    // so it still sees both parentheses and still restores the directory.
    expect(denies("(cd /tmp && rm -rf x)")).toBe(false);
    expect(denies("(cd rules && ls) && rm x.md")).toBe(false);
    expect(denies("(cd hooks && rm -rf dist)")).toBe(false);
  });

  it("leaves a $(…) substitution's own parentheses alone", () => {
    // The filler carries a balanced pair that is not grammar. Stripping it
    // would change no verdict (it stays unresolved either way) but would put an
    // unbalanced `$(…` in front of a human in the deny reason.
    const v = classify("rm $(echo rules/x.md)");
    expect(v.deny).toBe(true);
    expect(v.targetPath).toBe("$(…)");
  });
});
