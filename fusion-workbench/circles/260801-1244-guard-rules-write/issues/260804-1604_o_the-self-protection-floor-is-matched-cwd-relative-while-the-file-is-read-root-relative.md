# The self-protection floor is matched relative to the working directory while the file it protects is read relative to the project root

---

**Severity:** Medium
**Domain:** code (security control)
**Filed by:** analyst, independent assessment A1 of C5b
**Affects:** `hooks/lib/config.ts:256-265` (project root from `findWorkbenchRoot()`, which walks up) and `:287-292` (the floor, appended as the bare relative pattern `fusion-guard.json`); `hooks/guard.ts` `normalizeToRelative`, which relativises against `process.cwd()`
**Cross-references:**
`circles/260801-1244-guard-rules-write/analyses/260804-1600-c5b-independent-assessment.md` `### What a consuming project can now do to itself`,
`shared/planning/260801-1122_o_spec-normative-consolidation.md:301` (the floor stated as an invariant: "always includes the project configuration file itself"),
`circles/260801-1244-guard-rules-write/decisions/260802-1912_a_does-the-self-protection-floor-apply-before-the-config-file-exists.md`

---

## What is wrong

The project layer is read from `resolve(findWorkbenchRoot(process.cwd()), "fusion-guard.json")`.
`findWorkbenchRoot` walks **up** from the working directory looking for
`fusion-workbench/.fusion-setup`, so the file may sit above the working directory.

The floor then appends the bare pattern `"fusion-guard.json"` to `protectedPaths`, and every
protected pattern is matched against a path relativised to `process.cwd()`. When the working
directory is not the project root, the floor protects `<cwd>/fusion-guard.json` — a file that
does not exist — while the file actually governing the guard sits somewhere the pattern
cannot name.

## Measured

Same harness. Workbench marker and `fusion-guard.json` at the project root; the guard spawned
with `cwd` one directory below it:

```
project/
  fusion-workbench/.fusion-setup
  fusion-guard.json          <- {"guard":{"protectedPaths":["secret/**"]}}
  secret/a
  sub/                       <- the guard's working directory

  Edit  ../fusion-guard.json                 allow
  Edit  <abs>/project/fusion-guard.json      allow
  rm ../fusion-guard.json                    allow
  cd .. && rm fusion-guard.json              allow

  Edit  secret/a                             DENY    <- proves the root file WAS loaded
```

The last row is the point. The guard is enforcing a list it read out of a file it will not
defend. All four writes to that file are allowed, on both surfaces, with no flag.

## Why the other patterns are not the same case

`rules/**` degrades the same way from a subdirectory, and for `rules/**` that is arguably
correct: `sub/rules/` genuinely is a different directory from `project/rules/`, and the
protected list is documented as project-relative.

The floor is different in kind. It names one specific file at one specific place — the place
`findWorkbenchRoot` found it — and then looks for it somewhere else. It is the only pattern
in the effective list whose subject has an absolute location the loader already knows.

## Reachability

*Inference, not measured against a real Claude Code session:* the trigger is a session whose
working directory is a subdirectory of a fusion-set-up project. `CLAUDE.md` contemplates that
shape explicitly ("A subfolder may legitimately have its own independent workbench"), and
`findWorkbenchRoot` is built to walk up, so a subfolder without its own workbench inherits the
parent's configuration. I did not verify how Claude Code sets the hook's working directory
beyond the harness, which sets it explicitly.

## Suggested direction

Resolve the floor against the project root rather than the working directory. Two shapes:

1. Append the **absolute** path of the project configuration file to `protectedPaths` in
   addition to the bare name, and let the existing absolute-path handling in
   `normalizeToRelative` do the rest. Smallest change; makes the floor the one entry in the
   list with an absolute form, which needs a comment saying why.
2. Have the guard relativise against the project root rather than `process.cwd()` whenever a
   project root was found. Larger, touches every pattern, and changes behaviour for projects
   that today rely on the cwd-relative reading. Not obviously the right answer and should not
   be taken on inside this Circle.

Option 1 with a case in the integration suite is the proportionate fix.
