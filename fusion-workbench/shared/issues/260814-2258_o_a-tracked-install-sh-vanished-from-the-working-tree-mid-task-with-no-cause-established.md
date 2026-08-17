A tracked `install.sh` vanished from the working tree mid-task, with no cause established

---
During the v8.2.0 release preparation, `install.sh` was deleted from the working tree between two commands of a `coder` task that had just edited it. The file is tracked, was not staged for deletion, and no git operation ran. It was restored and the edit re-applied; the release shipped a verified-intact file. The cause was not established, and the ruling-out is what makes the record worth keeping rather than the incident.

---
**Found by:** `coder`, during the release task for v8.2.0, session `260814-2225`. Reported in `shared/history/260814-2250-coder-release-v8-2-0-pin-examples.md`.
**Owner:** unassigned — there is nothing to fix until a second occurrence gives the first one a shape.
**Severity:** Low as a defect, higher as a prior. `install.sh` is the recommended end-user install path, so a corrupted or missing copy reaching a tag would break the primary route into fusion for everyone.
**Cross-references:** `CLAUDE.md` `## Conventions`, the single-orchestrator-per-project advisory.

## What happened

The task edited two files, `install.sh:27` and `README.md:26`, each a one-token version substitution. A full test run passed after the edit. At the next command `install.sh` was absent from the working tree. `README.md` still carried its edit.

The file was restored from git and the edit re-applied. The orchestrator verified the result before committing rather than accepting the report: `git diff install.sh` showed exactly the one intended line, `git ls-files -s` showed mode `100755` preserved, and `bash -n install.sh` parsed clean. The committed blob carries mode `100755`, which is the property `install.sh`'s own tarball path depends on.

## What was ruled out, by measurement

- **A git operation.** `git stash list` was empty and the reflog was clean. A stash or a checkout would also have taken the `README.md` edit, which survived.
- **The test suite.** The file was restored and the full suite re-run with a watcher polling the path for the whole run; the file survived untouched. Every delete call in the test sources is scoped to a `mkdtemp` root.

## What was observed but proves nothing

`ps` showed three older `claude --plugin-dir ~/.fusion` sessions alive against this project alongside the one doing the work. That is precisely the condition `CLAUDE.md` already carries as an advisory: fusion has no concurrency lock, and a second session's file operations are not coordinated with the first's. Nothing ties the deletion to any of them, and this record does not claim it does. It is recorded because the coincidence is the only lead there is.

## Why this is filed despite being weak

A single tracked file vanishing once, with the cause unknown, is not actionable on its own, and the executing agent said so and declined to file. The judgement above it is that the record is cheap and the second occurrence is what makes it valuable: without a prior, a recurrence a month from now starts its investigation from zero, and the two measurements already ruled out here would be repeated. If a second instance appears, this record is the thing that turns it from an anomaly into a pattern with two data points and a suspect already named.

If no second instance appears, close this as not reproducible.

---
**Reconciliation 260817-1836** (reconciler, domain `code`). Re-verified reproducible at HEAD `2552586`: The record-s own closing condition is a second occurrence or an explicit close, and neither has happened. `install.sh` is intact at HEAD and no second instance appears anywhere in `shared/issues/` or `shared/history/`. This is a candidate for closing as not reproducible, which is the user-s call rather than a reconciler-s. Marker stays open. Log: `shared/history/260817-1836-reconciliation.md`.
