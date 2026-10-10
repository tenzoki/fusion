# In which language is the Prior module executable built, and how does it consume Prior's module API?

---
**Domain:** code
**Filed by:** implementation-planner, Kai Stalmann <ks@qantr.com>
**Cross-references:** 261009-1024-fusion-is-the-one-source-of-role-texts-and-workflow-rules-for-both-hosts.md, 261008-1215-fusion-as-an-external-prior-module-bundle.md, 261010-1235-plan-fusion-prior-module-bundle-explorer-then-four-role-repair.md

---

## Question

The bundle needs one executable that Prior starts as a separate process and that speaks module API v1 (`Prior: docs/design/prior-module-api-v1.md`). Four facts about Prior at `167c605` constrain it. The SDK `moduleapi/v1` is Go and is the reference implementation; the document says "cross-language vectors must be added before claiming a non-Go binding works". `internal/module.StartProcess` starts an absolute executable path with an explicit environment only, so no `PATH` reaches the child. The Go module path `github.com/kai/prior` is not fetchable: Prior's one remote is `file:////gbox/repo/git/F09-Prior.git`, and the delivery request forbids a local `replace`. `moduleapi/v1` imports the Go standard library alone (read from its import blocks at `167c605`). Fusion today builds with Node and has no Go code. The choice fixes fusion's build toolchain for the Prior bundle and how the bundle tracks Prior's API, so it binds every later bundle.

## Options

1. **Go, with a pinned vendored copy of `moduleapi/v1`.** The adapter is a Go module under `adapters/prior/`. The non-test files of `moduleapi/v1` at the pinned Prior revision (`git ls-tree --name-only <rev> moduleapi/v1/ | grep -v _test.go`) are copied into the adapter's tree, unchanged except for the import path, with a provenance file naming the revision and each file's sha256. A check compares the copy against `git show <rev>:moduleapi/v1/<file>` whenever a Prior checkout is given. The copy is removed once Prior publishes a fetchable module. The binary is static (`CGO_ENABLED=0`, `-trimpath`, `-buildvcs=false`), so the bundle is one self-contained file per platform.
   - Pros: the reference implementation, so authentication, framing and decoding match byte for byte with no cross-language vectors. No runtime prerequisite on Prior's machine. It meets the dual-host plan's rule for a temporary vendored copy (generated from a pinned upstream revision, carries a removal condition, accepts no independent fixes).
   - Cons: Go becomes a build prerequisite of the Prior bundle (never of the Claude install). A vendored copy must be kept equal to its pin by a check, not by trust.
2. **Node, reusing the codec's toolchain.** A bundled JavaScript entry point, started through a Node binary.
   - Pros: one language in fusion's repository.
   - Cons: Prior must first publish cross-language authentication vectors. With no `PATH`, the entry point cannot find `node`. The bundle then either ships a Node runtime, which is large and platform-bound, or names a machine-local interpreter path, which is not self-contained.
3. **Go, requiring `github.com/kai/prior` through a private-module setting** (`GOPRIVATE` plus a git URL rewrite to Prior's file remote).
   - Pros: no copy in fusion's tree.
   - Cons: the build resolves only on a machine that holds that remote. That is a local `replace` in effect, and the build identity would not be reproducible elsewhere.

## Constraints

- No shipped bundle depends on a local `replace` or on a path outside itself (the delivery request, item 1).
- The Claude installation keeps needing neither Go nor any Prior component.
- The executable's identity is reproducible from the pinned fusion revision: two fresh builds yield the same bytes.

## Recommendation

Option 1, contingent on Prior accepting a vendored copy as the consumption route until it publishes one; request 67 asks that question. Should Prior refuse, the fallback is Option 1 against whatever fetchable form Prior names, never Option 3.
