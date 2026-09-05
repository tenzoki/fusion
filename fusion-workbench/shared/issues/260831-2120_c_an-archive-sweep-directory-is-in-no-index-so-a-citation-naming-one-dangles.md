# An archive sweep directory is in no index, so a citation naming one dangles

---
A citation naming an archive sweep directory reports dangling although the directory exists. The
Circle-directory index holds the Circle directories a sweep contains, and not the sweep directory
itself, so a name that is correct as written resolves against an index it was never given.
---
**Filed by:** orchestrator, Kai Stalmann <ks@qantr.com>
**Reported by:** the consuming project `unite-co-creator`, 2026-08-31, as its own `260831-1340`

## Reproduced here

Against `hooks/lib/citation-scan.ts` at `8b0eda50`:

```
der Sweep 260817-1907-safe-cleanup-scoped hat        stamp-name/dangling
in archive/260817-1907-safe-cleanup-scoped/ liegt    no token
```

The first is the shape the reporter measured, six rows in its tree. The second shows the same
directory named with its path producing nothing at all, because the Circle-directory pattern requires
a literal `circles/`.

## One correction to the report, and it matters for the fix

The report says the index "indexes Circle directories under `circles/` and never the sweep
directories under `archive/`". The first half understates it. `circleDirs()` **does** walk
`archive/<sweep>/circles/` and index the Circle directories inside a sweep — measured here, 24 live
Circle directories and 6 archived ones, with an explicit branch and a comment saying an archived
Circle resolves wherever it is.

What it does not index is the **sweep directory itself**, and that is the whole defect. The count of
sweep directories in the index is 0. So this is one missing entry per sweep rather than a missing
tree, and the fix is small: the same walk already opens each sweep to reach the Circle directories
inside it.

## Why the citation is correct as written

An archive sweep directory is named `<stamp>-<slug>`, the shape a Circle directory has, and
`/fusion:archive` creates exactly one level of them. A record that names the sweep it was moved by is
naming a real thing at a real path. A rewrite would replace a true name with a false one, which is
why the reporter's own instrument was right to leave these alone.

## Acceptance

A citation naming an existing directory under `archive/` resolves, with no citing line edited. Two
things to hold while fixing: the resolver reports what a token resolved **to**, so a sweep directory
must report its own path rather than a Circle path inside it; and the sweep-directory pattern already
exists in the file and is read by this same index, so the fix reuses it rather than adding a second
spelling of the shape.

---
Resolved: `4f5834ef` made the sweep directory an index entry in its own right — step 2 of the plan
`260831-2144_*_repair-three-citation-grammar-defects.md`. `circleDirs()` in `hooks/lib/citation-scan.ts`
now adds each sweep's own name beside the Circle directories it already walked into, and its docstring
says so at `:803-808`, naming this record as the reason.

Verified at HEAD `5b84b13a`: a scanner probe over this workbench reads the sweep name cited bare as one
`stamp-name` token, status `resolved`, where the record measured `dangling`. `node hooks/dist/citation-check.js`
reports no row carrying that name. `cd hooks && npm test`: 50 files, 864 tests, green.

The correction this record made to the reporter — that the walk already indexed the Circle directories
*inside* a sweep and only the sweep itself was missing — is what the fix was built on, and the entry
resolves to the sweep's own path rather than to a Circle path inside it, as the acceptance required.

Out of scope then and still: a sweep named as a **path** produces no token, because every pattern's
left anchor refuses a slash in front of the stamp. That is unchanged behaviour, stated in the record's
own second probe.
