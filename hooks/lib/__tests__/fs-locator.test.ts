import { describe, it, expect, beforeAll, afterAll } from "vitest";
import {
  linkSync,
  mkdirSync,
  mkdtempSync,
  realpathSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { resolve } from "node:path";
import { realFsLocator } from "../fs-locator.js";

// ---------------------------------------------------------------------------
// The one part of the rules-write exemption that talks to something outside the
// process, and therefore the one part that can lie.
//
// `rules-write-exemption.ts` is tested against a described filesystem, which
// proves its LOGIC and proves nothing about whether a real `realpath` behaves
// the way that description assumes. These cases run against a real temporary
// tree with real symlinks and real hard links, because every case below was a
// question with a wrong answer available:
//
//   - does `realpath` see a DANGLING symlink?            no — it throws ENOENT
//   - does it canonicalise CASE on a case-insensitive fs? only `.native` does
//   - does a hard link look different from an ordinary file? only via `nlink`
//   - does a directory have `nlink > 1`?                  always
//
// The third and fourth together are why `hasHardLinks` asks `isFile()` first: a
// check that read `nlink > 1` alone would refuse the grant for every directory,
// including `rules/retired`.
// ---------------------------------------------------------------------------

let base: string;
let root: string;
let locate: (p: string) => string | null;
let hasHardLinks: (p: string) => boolean;

beforeAll(() => {
  base = realpathSync(mkdtempSync(resolve(tmpdir(), "fusion-locator-")));
  root = resolve(base, "project");

  mkdirSync(resolve(root, "rules/retired"), { recursive: true });
  mkdirSync(resolve(root, "agents"), { recursive: true });
  mkdirSync(resolve(root, "hooks"), { recursive: true });
  mkdirSync(resolve(base, "shared-rules"), { recursive: true });

  writeFileSync(resolve(root, "rules/x.md"), "# rule\n");
  writeFileSync(resolve(root, "agents/coder.md"), "# agent\n");
  writeFileSync(resolve(root, "hooks/config.json"), "{}\n");
  writeFileSync(resolve(base, "shared-rules/s.md"), "# shared\n");

  // A link out of the rule directory, to the project root.
  symlinkSync("../", resolve(root, "rules/up"));
  // A link whose target does NOT exist. `realpath` refuses the whole path.
  symlinkSync("../fusion-workbench/.guard-state", resolve(root, "rules/gs"));
  // A chain, an absolute link, and a cycle.
  symlinkSync("b", resolve(root, "rules/a"));
  symlinkSync("../agents", resolve(root, "rules/b"));
  symlinkSync(resolve(root, "agents"), resolve(root, "rules/abs"));
  symlinkSync("loop", resolve(root, "rules/loop"));
  // A rule directory shared with another repository.
  symlinkSync(resolve(base, "shared-rules"), resolve(root, "shared"));
  // The same shared tree reached from INSIDE the rule directory, holding a
  // DANGLING relative link whose own target carries a `..`. The combination is
  // the one the link-expansion branch gets wrong when it collapses a target
  // lexically against an unresolved prefix — see the `..` describe block below.
  symlinkSync(resolve(base, "shared-rules"), resolve(root, "rules/shared"));
  mkdirSync(resolve(base, "sibling"), { recursive: true });
  symlinkSync("../sibling/missing.md", resolve(base, "shared-rules/gone"));
  // A protected inode under a second name inside the rule directory.
  linkSync(resolve(root, "hooks/config.json"), resolve(root, "rules/copy"));

  const fs = realFsLocator(root);
  locate = (p) => fs.locate(p);
  hasHardLinks = (p) => fs.hasHardLinks(p);
});

afterAll(() => {
  rmSync(base, { recursive: true, force: true });
});

describe("realFsLocator.locate — ordinary paths", () => {
  it("resolves an existing file under the project root", () => {
    expect(locate("rules/x.md")).toBe(resolve(root, "rules/x.md"));
  });

  it("resolves a path that does not exist yet", () => {
    // The everyday case: a rule file has no location until the write creates
    // it, so a resolver that failed here would refuse every new rule.
    expect(locate("rules/brand-new.md")).toBe(resolve(root, "rules/brand-new.md"));
    // `rules/a` is deliberately NOT reused here: it is a symlink in this tree,
    // and the resolver rightly follows it.
    expect(locate("rules/new/b/c/deep.md")).toBe(
      resolve(root, "rules/new/b/c/deep.md"),
    );
  });

  it("resolves the rule directory itself", () => {
    expect(locate("rules")).toBe(resolve(root, "rules"));
  });

  it("takes an absolute path as it stands", () => {
    expect(locate(resolve(root, "rules/x.md"))).toBe(resolve(root, "rules/x.md"));
  });
});

describe("realFsLocator.locate — symlinks", () => {
  it("follows a link out of the rule directory", () => {
    expect(locate("rules/up/agents/coder.md")).toBe(resolve(root, "agents/coder.md"));
    expect(locate("rules/up")).toBe(root);
  });

  it("follows a DANGLING link, which realpath cannot", () => {
    // The hole this closes: `realpath` throws ENOENT for the whole path, and a
    // resolver that read that as "not created yet" reported the LEXICAL
    // location — `rules/gs/escalation.json` — and the grant was given.
    expect(locate("rules/gs")).toBe(resolve(root, "fusion-workbench/.guard-state"));
    expect(locate("rules/gs/escalation.json")).toBe(
      resolve(root, "fusion-workbench/.guard-state/escalation.json"),
    );
  });

  it("follows a chain of links", () => {
    expect(locate("rules/a/coder.md")).toBe(resolve(root, "agents/coder.md"));
  });

  it("follows an absolute link", () => {
    expect(locate("rules/abs/coder.md")).toBe(resolve(root, "agents/coder.md"));
  });

  it("returns null for a cycle rather than looping", () => {
    // Fail-closed: null is "cannot prove", which refuses the grant.
    expect(locate("rules/loop")).toBeNull();
    expect(locate("rules/loop/x.md")).toBeNull();
  });

  it("resolves a rule directory that is itself a link to a shared tree", () => {
    expect(locate("shared/s.md")).toBe(resolve(base, "shared-rules/s.md"));
    expect(locate("shared")).toBe(resolve(base, "shared-rules"));
    // And a not-yet-created file inside it lands in the shared tree too, which
    // is what lets the exemption grant writes to a shared rule directory.
    expect(locate("shared/new.md")).toBe(resolve(base, "shared-rules/new.md"));
  });
});

describe("realFsLocator.locate — platform path folding", () => {
  it("resolves a case-variant spelling to the on-disk name where the filesystem folds case", () => {
    // Not asserted as a fixed answer, because it is a property of the
    // filesystem rather than of this module: on APFS/NTFS the two spellings are
    // one file and `realpathSync.native` says so; on a case-sensitive
    // filesystem `RULES/x.md` simply does not exist and resolves lexically.
    const folded = locate("RULES/x.md");
    const plain = locate("rules/x.md");
    expect(folded === plain || folded === resolve(root, "RULES/x.md")).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// A `..` belongs to the kernel, not to the string.
//
// `absolute()` used to join a relative path with `resolve(root, path)`, which is
// `normalize` with a root prepended — so a `..` was deleted LEXICALLY, together
// with the component before it, before `resolveLocation` saw anything. The
// resolver below it was audited and found kernel-faithful; it was simply never
// handed the path that was asked about.
//
// The truth column in every case below is built by CONCATENATION or written out
// literally, NEVER with `resolve()` on a `..` spelling — `resolve` collapses
// exactly the way the bug did, so a ground truth built with it agrees with the
// bug and the case passes while the defect stands. (The first version of the
// audit that found this made that mistake and was thrown away.)
// ---------------------------------------------------------------------------
describe("realFsLocator.locate — `..` is resolved by the kernel, not lexically", () => {
  /** Every spelling that reaches a `..`, and what the kernel says about it. */
  const dotDotRows = [
    "rules/up/../agents/coder.md",
    "rules/b/../agents/coder.md",
    "rules/a/../hooks/config.json",
    "rules/up/..",
    "rules/up/../agents/brand-new.md",
    "rules/retired/../x.md",
    "rules/gs/../x.md",
    "rules/loop/../x.md",
  ];

  it("gives the same answer for a relative spelling as for the absolute one", () => {
    // The defect in one property: `locate` promised to take a path
    // "project-relative or absolute" and answer the same thing, and for a `..`
    // it did not. Measured before the fix, on the same rows: 4 of the rows with
    // a kernel answer disagreed, every one of them a `..` row.
    for (const rel of dotDotRows) {
      expect(locate(rel), rel).toBe(locate(root + "/" + rel));
    }
  });

  it("agrees with the kernel wherever the kernel has an answer", () => {
    for (const rel of dotDotRows) {
      let truth: string | null = null;
      try {
        truth = realpathSync.native(root + "/" + rel);
      } catch {
        continue; // No kernel answer to be faithful to; covered below.
      }
      expect(locate(rel), rel).toBe(truth);
    }
  });

  it("takes the parent of a LINK'S TARGET, not the parent of the link", () => {
    // `rules/b -> ../agents`, so `rules/b/..` is the project root and NOT
    // `rules`. The lexical collapse answered `rules/agents/coder.md`, a path
    // that does not exist, for a write that lands on the real agent file.
    expect(locate("rules/b/../agents/coder.md")).toBe(root + "/agents/coder.md");
    // `rules/a -> b -> ../agents`, through the chain.
    expect(locate("rules/a/../hooks/config.json")).toBe(root + "/hooks/config.json");
    // `rules/up -> ../`, i.e. the project root, so `rules/up/..` is ABOVE it.
    expect(locate("rules/up/..")).toBe(base);
  });

  it("keeps a `..` faithful when the tail does not exist yet", () => {
    // The everyday reason this resolver tolerates a missing tail at all — the
    // combination with `..` is where the two behaviours had to agree.
    expect(locate("rules/up/../agents/brand-new.md")).toBe(
      base + "/agents/brand-new.md",
    );
  });

  it("collapses `..` between real directories, where the kernel does too", () => {
    // `rules/retired` is an ordinary directory, so here the lexical answer and
    // the kernel's coincide. Pinned so the fix is not read as "never collapse".
    expect(locate("rules/retired/../x.md")).toBe(root + "/rules/x.md");
  });

  it("returns null for a `..` through a CYCLE rather than a confident wrong answer", () => {
    // Fail-closed, and the case the JS `realpath` fallback got wrong on its
    // own: Node's `realpathSync` runs `path.resolve` on its argument before
    // resolving, so where the native call threw ELOOP the fallback answered
    // `rules/x.md` — a real file, inside the rule directory, for a path
    // `open(2)` refuses. The fallback is declined when a `..` is still present.
    expect(locate("rules/loop/../x.md")).toBeNull();
    expect(locate(root + "/rules/loop/../x.md")).toBeNull();
  });

  it("interprets a LINK TARGET's own `..` against the resolved prefix", () => {
    // The instance of this defect that is not merely a contract nicety, because
    // no `..` appears in the caller's spelling at all — it comes out of
    // `readlink`, so gate 0 never sees it and `canonicalise` never sees it.
    //
    //   rules/shared -> <base>/shared-rules       (a shared rule repository)
    //   <base>/shared-rules/gone -> ../sibling/missing.md   (dangling)
    //
    // Collapsing that target against the UNRESOLVED `<root>/rules/shared` gave
    // `<root>/rules/sibling/missing.md` — inside the rule directory, so gate 2
    // reported "resolves inside" and the exemption granted a write that lands
    // in `<base>/sibling/`, outside the project entirely.
    expect(locate("rules/shared/gone")).toBe(base + "/sibling/missing.md");
    // And the grant that answer would have produced is now refused, because the
    // real location is outside every rule directory.
    expect(locate("rules/shared/gone")!.startsWith(root + "/rules/")).toBe(false);
  });

  it("still collapses `.` and repeated separators, which the kernel agrees with", () => {
    // `resolve` was doing three jobs, and only the `..` one was wrong. Dropping
    // it must not lose the other two — the kernel does them.
    expect(locate("rules/./x.md")).toBe(root + "/rules/x.md");
    expect(locate("rules//x.md")).toBe(root + "/rules/x.md");
  });
});

describe("realFsLocator.hasHardLinks", () => {
  it("reports a regular file with a second name", () => {
    expect(hasHardLinks("rules/copy")).toBe(true);
  });

  it("sees the real file through a `..`, not the lexical one", () => {
    // The same defect on the other method, and the more pointed one: the check
    // exists to spot a second name on the file being written, and the lexical
    // collapse pointed `lstat` at `rules/hooks/config.json`, which does not
    // exist — so the answer was "no second name" for the very inode that has
    // one. `rules/a -> b -> ../agents`, so `rules/a/..` is the project root.
    expect(hasHardLinks("rules/a/../hooks/config.json")).toBe(true);
  });

  it("does not report an ordinary file", () => {
    expect(hasHardLinks("rules/x.md")).toBe(false);
  });

  it("does not report a DIRECTORY, whose link count is always above one", () => {
    // The false positive that would have refused the grant for every rule
    // subdirectory, `rules/retired` included.
    expect(hasHardLinks("rules")).toBe(false);
    expect(hasHardLinks("rules/retired")).toBe(false);
  });

  it("does not report a symlink — resolution owns those", () => {
    expect(hasHardLinks("rules/up")).toBe(false);
    expect(hasHardLinks("rules/gs")).toBe(false);
  });

  it("does not report a path that does not exist", () => {
    // An absent file has no second name, and this is the ordinary case for a
    // file about to be created.
    expect(hasHardLinks("rules/brand-new.md")).toBe(false);
  });
});
