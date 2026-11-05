Request 78 question 3 understates what the model tool does to a block and counts two held parts
---
Question 3 states `toolLines` correctly. It leaves out that a multi-line block runs its first line and can report success, and that the array form the parts name is refused on every block. Its "16 parts" holds two parts not in the bundle. Severity: Medium; request text only.
---
**Filed by:** reviewer, Kai Stalmann <ks@qantr.com>
**Executor:** data-implementer, by an appended correction in `codec/fixtures/prior/REQUESTS.md`
**Cross-references:** 261105-1023-plan-fusion-13-4-2-corrected-candidate.md

**Bundle bytes:** no. `REQUESTS.md` may be appended to, and the bundle's copy stays at `ae7021e6…`. The section's own text stays as it is, since the file is append-only.

**What holds.** `Prior: internal/supervisor/general_tools.go:41` splits on `"\n"` and drops empty strings, `:75` applies it to `argv`, and Prior's issue `261104-2239-host-exec-model-tool-cannot-carry-a-multi-line-command.md` is open at `d04f457` and proposes the two forms the question names. Both line citations are right.

**What it leaves out.**

1. **The effect.** "Does not run as one argument" reads as a refusal or an error. The argv becomes `bash -c <line 1> <line 2> …`, so line 1 is the script and the other lines are its `$0`, `$1`. Run locally with a three-line block `printf 'first\n'`, `printf 'second\n'`, `exit 7`: it printed `first` and exited 0. A block that opens `if true; then` gave a syntax error and exit 2. This is plain `bash`, not Prior's container. So a run can lose a block's later lines with exit 0. 28 neutral shell fences hold more than one line (a scan of `catalog/profiles/*/parts/*-neutral.md` at C″, counting all profiles).
2. **The form.** `argv` is a JSON string at `general_tools.go:63` (`Argv string`), one argument per line, as the descriptor's text says at `internal/fusionhost/external_entry.go:508`. Run at the pin through `api.Decode`, `{"argv":["bash","-c","pwd"]}` answers `invalid module protocol`, and `{"argv":"bash\n-c\npwd"}` decodes. `moduleapi/v1/protocol.go` is unchanged from `08c57fb` to `d04f457`. `ExecToolExecutor.call` turns a decode error into `core.ErrPermissionDenied`. So the array the parts write is not the tool's form even for one line, and a model has to translate it. Prior's limit G3 means no run has shown what a model does here. Question 3 asks only about multi-line blocks.

**The count.** `grep -l '<the block>' catalog/profiles/*/parts/*-prior.md` lists 16 parts, and `skill-commit` and `skill-cleanup` are among them. They are held, and the delivered `profiles/*.md` hold the form in 14 files.

**Fix direction.** Append a short correction under the request: the effect, measured locally; the string form of `argv`; 14 parts in the bundle plus two held. Keep the question's verdict form. Name the correction to Prior with the file's new digest.

**Acceptance.** An appended passage states all three. `git diff --numstat` on the file shows additions only. No path of the plan's `CLAUDE-DIST`, `catalog`, `adapters` or `.claude-plugin` moves.
