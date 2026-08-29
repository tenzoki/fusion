The live-cascade test asserts a git checkout, and fails in any tree that does not have one

---

`hooks/lib/__tests__/domain-cascade.test.ts:321-335` runs `bin/fusion-count-sources` against the
plugin root and asserts:

```ts
expect(run.status, `fusion-count-sources exited ${run.status}: ${run.stderr}`).toBe(0);
…
expect(measured.counted_by).toBe("git-ls-files");
expect(measured.code_files as number).toBeGreaterThan(0);
```

`bin/fusion-count-sources` documents exit 2 with `counted_by=none` for a root that "is not inside a
git work tree", and its header calls that "a real answer, not a failure". The test treats it as a
failure. So the test does not assert a property of the cascade or of the helper — it asserts that
the tree it runs in is a git work tree with `git` on PATH.

That is not always true of a tree carrying these files. `install.sh` unpacks the GitHub **tarball**
into `~/.fusion`, and the installer copies `hooks/` whole, `lib/__tests__/` included; a `git archive`
export, a Docker `COPY` of the source, and CI images without a `git` binary land in the same state.
`npm test` is step 0 of the release checklist (`CLAUDE.md` `## Release process`), so the failure
surfaces as a red release gate whose message points at the helper rather than at the environment.

The other five tests in the file are hermetic — they read `agents/orchestrator.md` off disk and
compute. This one is the only environmental dependency in the suite's new half.

---

**Failure scenario.** A contributor runs the suite inside a container built by `COPY . /app` from a
`.dockerignore` that excludes `.git`. `fusion-count-sources` exits 2, prints `counted_by=none`, and
the test fails with "fusion-count-sources exited 2:" and an empty stderr — the helper writes nothing
to stderr on the not-a-work-tree branch, by design. Nothing in the message says the cause is the
missing `.git`.

**Fix direction.** Keep the end-to-end pairing but let the environment decide which assertion runs:
on `status === 2`, assert instead that `countsFromHelperOutput` yields `counted_by === "none"`,
`code_files === "unavailable"`, and that the cascade answers `code` — which is a real property of the
pair and is exactly the branch the module's header calls load-bearing. Only on `status === 0` assert
the counted path. That covers both of the helper's documented outcomes rather than one of them.

**Filed by:** coderev, review of session `260810-1646` Turn 1, range `5ef92eb..940d522`.

---
Resolved: `hooks/lib/__tests__/domain-cascade.test.ts` now asserts the helper returned one of its two
documented outcomes (0 or 2) and branches on which. On 0 it asserts the counted path as before; on 2
it asserts `counted_by === "none"` with both counts `"unavailable"`. Both branches then assert the
cascade answers `code` — the one property that holds either way, and by different routes: a counted
tree because it holds source, an uncounted one because the absent-count branch is the cascade's
no-evidence exit. An exit outside {0,2} fails with a message naming both documented outcomes rather
than blaming the helper. The test's name lost "this repository", which was the assumption in prose.
