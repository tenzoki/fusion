# Orchestrator — Live

**Turn:** 2/5 | **Tasks:** 5/8 | **Commits:** 5 | **Errors:** 0
**Started:** 18:27 | **Domain:** code | **Elapsed Turns:** 1 | **Guard:** OK

## Current
  [RUNNING] coder -> T2-A close the two boundary breaks + the halt gap

## This Turn
  [RUNNING] coder -> T2-A canonicalise before the protected check; close the
            symlink grant route; halt check above the exemption

## Turn 1 (done)
  [DONE]    coder -> S1 harness for consuming-project fixtures ....... 768242c
  [DONE]    coder -> S2 exemption predicate, 60 cases ............... 6b3aa5c
  [DONE]    coder -> S3 the flag on the write-tool path ............. 0f341e0
  [DONE]    coder -> S4 the flag on the Bash path .................. 45f53d4
  [DONE]    coder -> S5 monitor renders advisories ................. bf75941
  [DONE]    coderev -> 4 findings, 2 of them High

## Snapshot
  Turn-start HEAD:    bf75941
  Suite:              green, 871 tests
  Circle issues:      6 open, 3 in progress

## Blocking findings
  The flag reaches every protected path via a symlink named inside rules/,
  and can clear an active halt in two commands.
  The protected-path check matches before collapsing, so a ./ prefix walks
  past the whole list. Pre-existing, ships today.

## Turn 3 (planned)
  S6 config loader, S7 template, S8 setup seeding, S9 docs, S10 release
