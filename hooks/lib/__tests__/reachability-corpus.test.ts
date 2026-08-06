import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

import {
  CLASSIFY_ROOT,
  DIR_BUILTINS,
  FAMILIES,
  HEADS,
  JOINERS,
  PROTECTED_PATHS,
  SUBCORPUS_SLICES,
  TARGETS,
  WRAPPERS,
  WRITE_VERBS,
  buildBaseline,
  classifyRow,
  diffBaseline,
  generateCorpus,
  renderCommand,
  selectSubcorpus,
} from "./helpers/reachability-corpus.js";
import type { Baseline } from "./helpers/reachability-corpus.js";
import {
  assertConfinedToRoot,
  formatWitness,
  shellsAvailable,
  witnessRow,
} from "./helpers/shell-witness.js";

const HERE = dirname(fileURLToPath(import.meta.url));

/**
 * The measurement instrument for `circles/260804-1205-shell-reachability-model`,
 * and the tests that keep it from rotting — plan step 1.
 *
 * ## What this file is NOT
 *
 * It is not a specification of the guard's behaviour. Not one assertion below
 * says a particular command should allow or deny. `bash-mutation-guard.test.ts`
 * is where that argument lives; this file asserts that the INSTRUMENT is
 * total, deterministic, honest about the shell, and pinned to a before-image.
 *
 * ## Why the fixture is expected to fail at plan step 3
 *
 * `fixtures/mutation-verdicts-head.json` records the classifier's verdicts at
 * HEAD `38c5123` — the commit the change is measured FROM. Step 3 re-keys the
 * guard onto the reachability edge and moves verdicts on purpose, so the
 * reproduction test below will start failing there. That failure IS the
 * measurement: the rows it names are what step 5 buckets and takes to the human
 * gate. Regenerating the fixture before that gate destroys the only
 * before-image of the change, which is the failure mode the parent Circle hit
 * twice (`issues/260804-0840…`).
 */

/* ------------------------------------------------------------------ *
 * The mirror
 * ------------------------------------------------------------------ */

describe("the protected list the corpus is measured against", () => {
  it("mirrors the shipped hooks/config.json", () => {
    const config = JSON.parse(
      readFileSync(join(HERE, "..", "..", "config.json"), "utf8"),
    ) as { guard: { protectedPaths: string[] } };
    expect([...PROTECTED_PATHS]).toEqual(config.guard.protectedPaths);
  });
});

/* ------------------------------------------------------------------ *
 * The generator
 * ------------------------------------------------------------------ */

describe("the corpus generator", () => {
  const rows = generateCorpus();

  it("is seedless: two runs produce the same rows in the same order", () => {
    const again = generateCorpus();
    expect(again.length).toBe(rows.length);
    expect(again.map((r) => r.id)).toEqual(rows.map((r) => r.id));
    expect(again.map((r) => r.commandTemplate)).toEqual(
      rows.map((r) => r.commandTemplate),
    );
  });

  it("is the full cross-product, and each row is reachable exactly once", () => {
    // 1 headless prefix + 5 heads × 6 operators = 31 prefixes.
    const prefixes = 1 + (HEADS.length - 1) * (JOINERS.length - 1);
    expect(prefixes).toBe(31);
    expect(rows.length).toBe(
      prefixes *
        DIR_BUILTINS.length *
        WRAPPERS.length *
        WRITE_VERBS.length *
        TARGETS.length,
    );
    expect(new Set(rows.map((r) => r.id)).size).toBe(rows.length);
  });

  it("uses every value of every dimension", () => {
    const seen = {
      head: new Set(rows.map((r) => r.dims.head)),
      joiner: new Set(rows.map((r) => r.dims.joiner)),
      builtin: new Set(rows.map((r) => r.dims.builtin)),
      wrapper: new Set(rows.map((r) => r.dims.wrapper)),
      verb: new Set(rows.map((r) => r.dims.verb)),
      target: new Set(rows.map((r) => r.dims.target)),
      family: new Set(rows.flatMap((r) => r.families)),
    };
    expect([...seen.head].sort()).toEqual(HEADS.map((h) => h.id).sort());
    expect([...seen.joiner].sort()).toEqual([...JOINERS].sort());
    expect([...seen.builtin].sort()).toEqual(DIR_BUILTINS.map((b) => b.id).sort());
    expect([...seen.wrapper].sort()).toEqual([...WRAPPERS].sort());
    expect([...seen.verb].sort()).toEqual(WRITE_VERBS.map((v) => v.id).sort());
    expect([...seen.target].sort()).toEqual(TARGETS.map((t) => t.id).sort());
    expect([...seen.family].sort()).toEqual([...FAMILIES].sort());
  });

  it("leaves `{{ROOT}}` unexpanded in the template and expanded in the command", () => {
    const absolute = rows.filter((r) => r.commandTemplate.includes("{{ROOT}}"));
    expect(absolute.length).toBeGreaterThan(0);
    for (const row of absolute.slice(0, 200)) {
      expect(row.command).not.toContain("{{ROOT}}");
      expect(row.command).toContain(CLASSIFY_ROOT + "/");
    }
    // A different root is a different rendering and the same template.
    const other = generateCorpus({ root: "/elsewhere" });
    expect(other.map((r) => r.commandTemplate)).toEqual(
      rows.map((r) => r.commandTemplate),
    );
    expect(other.find((r) => r.commandTemplate.includes("{{ROOT}}"))!.command)
      .toContain("/elsewhere/");
  });

  it("names both landing sites for a relative operand, and one for an absolute", () => {
    const rel = rows.find(
      (r) => r.dims.target === "protected-relative" && r.dims.builtin === "cd",
    )!;
    expect(rel.landsWhenMoved).toBe("rules/x.md");
    expect(rel.landsWhenStill).toBe("x.md");
    expect(rel.protectedWhenMoved).toBe(true);
    expect(rel.protectedWhenStill).toBe(false);

    const abs = rows.find((r) => r.dims.target === "protected-absolute")!;
    expect(abs.landsWhenMoved).toBe(abs.landsWhenStill);

    // `popd` takes no directory, so its rows land where the shell already was.
    const popd = rows.find(
      (r) => r.dims.builtin === "popd" && r.dims.target === "protected-relative",
    )!;
    expect(popd.moverEstablishesDir).toBe(false);
    expect(popd.landsWhenMoved).toBe(popd.landsWhenStill);
  });
});

/* ------------------------------------------------------------------ *
 * The committed subcorpus
 * ------------------------------------------------------------------ */

describe("the bounded subcorpus", () => {
  const rows = generateCorpus();
  const sub = selectSubcorpus(rows);

  it("holds all four families the plan commits", () => {
    for (const slice of SUBCORPUS_SLICES) {
      expect(
        sub.filter(slice.select).length,
        `slice ${slice.id} is empty`,
      ).toBeGreaterThan(0);
    }
  });

  it("is a bounded projection, not the whole corpus", () => {
    expect(sub.length).toBe(448);
    expect(sub.length).toBeLessThan(rows.length / 10);
  });

  it("keeps corpus order and adds nothing", () => {
    const ids = new Set(rows.map((r) => r.id));
    for (const row of sub) expect(ids.has(row.id)).toBe(true);
    const positions = sub.map((row) => rows.findIndex((r) => r.id === row.id));
    expect(positions).toEqual([...positions].sort((a, b) => a - b));
  });
});

/* ------------------------------------------------------------------ *
 * The HEAD baseline
 * ------------------------------------------------------------------ */

describe("the HEAD verdict baseline", () => {
  const GOLD = JSON.parse(
    readFileSync(join(HERE, "fixtures", "mutation-verdicts-head.json"), "utf8"),
  ) as Baseline;

  it("holds enough rows, in both verdict directions, to be worth checking", () => {
    // Carried over from `git-verdicts-head.json`: a fixture that silently
    // emptied would pass vacuously. The two-direction check is the second half
    // of the same idea — a baseline of nothing but denies would keep passing if
    // the classifier started denying everything.
    expect(GOLD.rows.length).toBeGreaterThan(400);
    expect(GOLD.rows.filter((r) => r.verdict.deny).length).toBeGreaterThan(50);
    expect(GOLD.rows.filter((r) => !r.verdict.deny).length).toBeGreaterThan(50);
    expect(GOLD.root).toBe(CLASSIFY_ROOT);
    expect(GOLD.capturedAt).toBe("38c5123");
    expect([...GOLD.protectedPaths]).toEqual([...PROTECTED_PATHS]);
  });

  it("covers exactly the rows the generator still produces", () => {
    const sub = selectSubcorpus(generateCorpus());
    const diff = diffBaseline(GOLD, sub);
    expect(diff.missing, "rows the fixture has and the generator lost").toEqual([]);
    expect(diff.added, "rows the generator gained and the fixture never saw").toEqual(
      [],
    );
  });

  it("reproduces every recorded verdict", () => {
    // EXPECTED TO FAIL AT PLAN STEP 3 — see this file's header. The rows named
    // by the failure are the measurement, not a fixture that needs refreshing.
    const sub = selectSubcorpus(generateCorpus());
    const diff = diffBaseline(GOLD, sub);
    expect(
      diff.moved.map((m) => `${m.direction}  ${m.id}  ${JSON.stringify(m.command)}`),
    ).toEqual([]);
  });

  it("is rebuilt by the same function that wrote it", () => {
    const rebuilt = buildBaseline(selectSubcorpus(generateCorpus()), {
      capturedAt: "38c5123",
    });
    expect(rebuilt.rows.map((r) => r.id)).toEqual(GOLD.rows.map((r) => r.id));
    expect(rebuilt.rows.map((r) => r.command)).toEqual(
      GOLD.rows.map((r) => r.command),
    );
  });
});

/* ------------------------------------------------------------------ *
 * The differential
 * ------------------------------------------------------------------ */

describe("diffBaseline", () => {
  const rows = selectSubcorpus(generateCorpus()).slice(0, 40);

  it("reports nothing when the classifier has not moved", () => {
    const base = buildBaseline(rows);
    expect(diffBaseline(base, rows)).toEqual({ missing: [], added: [], moved: [] });
  });

  it("buckets a moved verdict by direction", () => {
    const base = buildBaseline(rows);
    const denied = base.rows.find((r) => r.verdict.deny)!;
    const allowed = base.rows.find((r) => !r.verdict.deny)!;
    denied.verdict = { deny: false, mutates: true };
    allowed.verdict = { deny: true, mutates: true, reason: "invented" };

    const diff = diffBaseline(base, rows);
    const byId = new Map(diff.moved.map((m) => [m.id, m.direction]));
    expect(byId.get(denied.id)).toBe("allow-to-deny");
    expect(byId.get(allowed.id)).toBe("deny-to-allow");
  });

  it("reports a row the generator no longer produces", () => {
    const base = buildBaseline(rows);
    expect(diffBaseline(base, rows.slice(1)).missing).toEqual([rows[0].id]);
  });
});

/* ------------------------------------------------------------------ *
 * The witness runner
 * ------------------------------------------------------------------ */

describe("the shell witness", () => {
  const rows = generateCorpus();
  const pick = (id: string) => {
    const row = rows.find((r) => r.id === id);
    if (row === undefined) throw new Error(`no corpus row ${id}`);
    return row;
  };

  it("refuses a command naming an absolute path outside the throwaway root", () => {
    // The corpus contains `rm -rf`. This check is the reason a rendering bug
    // cannot become a deletion somewhere real.
    expect(() => assertConfinedToRoot("rm -rf /etc/passwd", "/tmp/x")).toThrow(
      /outside the throwaway root/,
    );
    expect(() => assertConfinedToRoot("rm -rf /tmp/x/rules", "/tmp/x")).not.toThrow();
    // `/dev/null` is the one allowance, and a sed script is not a path.
    expect(() =>
      assertConfinedToRoot("tee /tmp/x/a < /dev/null", "/tmp/x"),
    ).not.toThrow();
    expect(() =>
      assertConfinedToRoot("sed -i.bak -e 's/seed/changed/' a.md", "/tmp/x"),
    ).not.toThrow();
  });

  it("expands the root token exactly where the template said", () => {
    expect(renderCommand("cp {{ROOT}}/notes.txt x.md", "/tmp/p")).toBe(
      "cp /tmp/p/notes.txt x.md",
    );
  });

  it("has both shells available on this machine", () => {
    // Loud rather than skipped: a measurement missing a shell is a measurement
    // that cannot see the pipeline disagreement it exists to see.
    expect(shellsAvailable()).toEqual({ bash: true, zsh: true });
  });

  it("observes a write landing inside a protected directory", () => {
    const result = witnessRow(pick("none/nojoin/cd/if/rm-rf/protected-relative"));
    for (const shell of ["bash", "zsh"] as const) {
      const o = result.observations[shell];
      expect(o.available, formatWitness(result)).toBe(true);
      expect(o.removed, formatWitness(result)).toContain("rules/x.md");
      expect(o.targetSurvived).toBe(false);
      expect(o.wroteProtected).toContain("rules/x.md");
    }
    expect(result.anyProtectedWrite).toBe(true);
  });

  it("records the bash/zsh disagreement about a pipeline's last element", () => {
    // `echo hi | cd build && rm out.js`: bash subshells every pipeline element
    // and never moves, zsh runs the LAST one in the calling shell and does.
    // This is the disagreement `JoinerFacts.movesCallingShell` takes the
    // pessimistic side of, and the reason a row must be witnessed in both.
    const result = witnessRow(pick("echo/pipe/cd/bare/rm/unprotected-relative"));
    const evidence = formatWitness(result);
    expect(result.observations.bash.removed, evidence).toEqual([]);
    expect(result.observations.zsh.removed, evidence).toEqual(["build/out.js"]);
  });

  it("survives a row that does not terminate, and says so", () => {
    // `until popd; do rm x.md; done` — `popd` fails forever against an empty
    // stack. The runner kills it and still reports the filesystem diff.
    const result = witnessRow(pick("none/nojoin/popd/until/rm/unprotected-relative"), {
      timeoutMs: 1_500,
    });
    expect(result.observations.bash.timedOut).toBe(true);
    expect(result.observations.zsh.timedOut).toBe(true);
  });

  it("classifies and witnesses the same string", () => {
    const row = pick("none/nojoin/cd/bare/rm/protected-relative");
    expect(classifyRow(row).deny).toBe(true);
    const result = witnessRow(row, { shells: ["bash"] });
    expect(result.observations.bash.command).toBe(
      renderCommand(row.commandTemplate, result.observations.bash.root),
    );
  });
});
