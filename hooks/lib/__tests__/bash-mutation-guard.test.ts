import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import {
  classifyBashMutation,
  MUTATION_VERBS,
  MUTATION_GIT_SUBCOMMANDS,
  WRAPPER_PROGRAMS,
} from "../bash-mutation-guard.js";
import type { MutationOptions } from "../bash-mutation-guard.js";
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

function classify(command: string, extra: Partial<MutationOptions> = {}) {
  return classifyBashMutation(command, {
    protectedPaths: PROTECTED,
    normalize,
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
];

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

  it("denies the known double-quote false positive, so a change is visible", () => {
    // A double-quoted region is code to the parser (bash expands there), so the
    // `>` inside reads as a redirection. The single-quoted form allows.
    expect(denies('echo "x > rules/y.md"')).toBe(true);
    expect(denies("echo 'x > rules/y.md'")).toBe(false);
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
  it("is exactly { deny: false } on allow — no stray fields", () => {
    expect(classify("ls -la")).toEqual({ deny: false });
    expect(classify("")).toEqual({ deny: false });
    expect(classify("   ")).toEqual({ deny: false });
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
];

describe("MUST NEVER DENY — the ordinary-agent-command corpus", () => {
  it("holds at least the 42 commands the earlier matrices covered", () => {
    expect(ORDINARY_AGENT_COMMANDS.length).toBeGreaterThanOrEqual(42);
  });

  for (const cmd of ORDINARY_AGENT_COMMANDS) {
    it(`allows: ${cmd}`, () => {
      const v = classify(cmd);
      expect(v.deny, v.reason ?? "").toBe(false);
    });
  }
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
      "cd -P rules && rm x.md", // -L / -P are flags, not the directory
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
      "cd $D && echo x > out.log",
    ]);
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

  it("does not classify a command word glued to a ( — the paren-subshell gap", () => {
    // `(rm x)` tokenizes to `(rm` + `x)`, and neither the command word nor the
    // operand survives the parenthesis. The virtual cwd sees THROUGH the glued
    // `(cd`, because the scoping requires it, but the mutation verbs do not —
    // widening them is a reviewable change, not a side effect of this step.
    // Pre-dates step 4 and is filed as
    // `issues/260801-1610_o_paren-subshell-glues-its-parentheses-to-the-command-word-and-the-last-operand.md`.
    expect(denies("(rm rules/x.md)")).toBe(false);
    expect(denies("(rm rules/x.md )")).toBe(false); // the OPEN paren is enough
    expect(denies("( rm rules/x.md )")).toBe(true); // spaced: nothing is glued
  });
});
