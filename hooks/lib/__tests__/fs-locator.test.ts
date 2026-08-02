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

describe("realFsLocator.hasHardLinks", () => {
  it("reports a regular file with a second name", () => {
    expect(hasHardLinks("rules/copy")).toBe(true);
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
