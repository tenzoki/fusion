The Prior bundle ships every tracked file under `codec/`, so `STATUS.md` and the frozen request log enter every bundle
---
Decision `261115-2310-how-does-the-prior-request-log-stop-growing-once-request-82-is-answered.md` (1b, question 4) and Prior's agreement at `ed81134` (`## Ruling`, point 3) say `codec/fixtures/prior/STATUS.md` is never placed in a bundle and a future bundle carries its own request file only, not the frozen `REQUESTS.md`. The bundle build does not implement that: it takes every file `git ls-files` lists under the entries of `install.sh`'s copy loop, `codec` among them, so `STATUS.md`, `REQUESTS.md` and every `requests/NNN-*.md` land in the next install and the next bundle.
---
**Filed by:** orchestrator, Kai Stalmann <ks@qantr.com>

**Evidence:** `adapters/prior/fusionmodule/cmd/fusion-bundle/main.go`, the `installEntries` list (it restates `install.sh`'s copy loop, `codec` included) and the `git ls-files -s -z -- <installEntries>` call that builds the install tree. `STATUS.md` is committed with this issue, so from that commit on it is in the install tree.

**Acceptance:** a bundle built from `main` holds no `codec/fixtures/prior/STATUS.md` and no `codec/fixtures/prior/REQUESTS.md`, and holds of `codec/fixtures/prior/requests/` only the file of the request it is built for; a test in `adapters/prior/fusionmodule/cmd/fusion-bundle/` fails otherwise. Whether `install.sh` (the Claude Code install) excludes the same files is decided with the fix and stated in it. No bundle for Prior is built until this is closed.
