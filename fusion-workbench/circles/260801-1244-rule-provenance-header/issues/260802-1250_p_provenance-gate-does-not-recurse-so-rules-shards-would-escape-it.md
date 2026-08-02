The provenance gate does not recurse, so a `rules/` subdirectory escapes it silently

---

**Severity: Medium.** No live defect today (`rules/` is flat, ten files, verified
`ls -la rules/`). The risk is dated and named: the very next Circle shards this corpus.

**Evidence.**

`hooks/lib/__tests__/provenance-header-lint.test.ts:77-82`:

```ts
function gatedFiles(): { rel: string; abs: string }[] {
  const dir = join(pluginRoot, "rules");
  return readdirSync(dir)
    .filter((f) => f.endsWith(".md"))
    .map((f) => ({ rel: `rules/${f}`, abs: join(dir, f) }));
}
```

`readdirSync` without `{ recursive: true }` reads one directory level. A file at
`rules/conventions/layout.md` is not in the set, carries no header, and the corpus test
at `:121-129` stays green while reporting nothing about it. The non-vacuity guard at
`:131-138` does not help: it asserts `gatedFiles().length > 0`, which the ten top-level
files satisfy regardless.

The header comment at `:19-21` states the property that fails: "The file set is
`rules/*.md`, derived by `readdirSync`, so a newly added rule file is in the set
automatically." True only for a file at the top level.

**Why it is dated.** `circles/260801-1244-curator/_a_circle.md:54` names this gate as the
check the shards must pass:

> The closing work partitions the conventions file into shards, every shard carries a
> provenance header, and the lint gate checks them. The partition is the first real
> exercise of that gate, so the gate has to exist before the shards do.

Whether the shards land as `rules/<name>.md` or `rules/<subdir>/<name>.md` is not settled
anywhere. Under the second shape the gate's first real exercise is a no-op that reports
success.

There is also a smaller latent crash: `readdirSync` without `withFileTypes` returns
directory names too, so a directory literally named `something.md` would reach
`readFileSync` and throw `EISDIR` rather than fail with the gate's own message.

**Fix.** Either of two, not both:

1. Recurse: `readdirSync(dir, { recursive: true, withFileTypes: true })`, keep only
   entries with `isFile()` and a `.md` suffix, and build `rel` from
   `join(parentPath, name)` relative to `pluginRoot`. This is the option that survives
   C9 whichever shape the shards take.
2. Assert flatness: add a test that `rules/` contains no subdirectory, so C9 fails loudly
   at the moment it nests rather than passing silently. Cheaper, and it converts a silent
   under-check into a deliberate decision.

Whichever is taken, correct the header-comment claim at `:19-21` to say what the file set
actually is. Sibling precedent for nesting exists: `path-literal-lint.test.ts` reads
`skills/*/SKILL.md`, one level down.
