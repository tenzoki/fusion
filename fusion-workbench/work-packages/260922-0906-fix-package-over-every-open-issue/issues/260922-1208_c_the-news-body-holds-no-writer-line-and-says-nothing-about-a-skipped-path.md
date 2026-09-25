The news body's hold list omits the `writer=` line Step 4 reads, and a `skipped=` path reaches no sentence the user sees
---
`bin/fusion-forum new` prints, since `cfb70cc5` (plan step 29), a `writer=<hex>` line under every `entry=` and zero or more `skipped=<git-path>` lines after them (`bin/fusion-forum:56-62`, "Reported, never rendered"). In `skills/news/SKILL.md`:

- `:51` still reads "Hold `ref=`, `head=`, `new=` and every `entry=` line", while Step 4 at `:77` reads "`$HEX` is the `writer=` line the helper printed under this entry". A body that holds what `:51` names has no `$HEX` at `:77`.
- `skipped=` appears nowhere in the body (`grep -c 'skipped' skills/news/SKILL.md` prints `0`). The helper's header says the path is reported, and the body it is reported to says nothing, so a `README.md` or a mis-shaped file in the store is invisible to the user.

Acceptance: `:51` names `writer=` and `skipped=` among what is held; Step 4 or Step 6 tells the user in one sentence which paths the helper skipped, where any were; `grep -c 'skipped=' skills/news/SKILL.md` is at least `2`; `cd hooks && npm test` exits 0 (`skills/` head-room is 72 bytes at `bf515cad`, so the edit names its cut).
---
**Filed by:** reviewer, Kai Stalmann <ks@qantr.com>
Executor: `coder`. Found in the closing review `260922-1208-reviewer-closing-pass-over-the-51-issue-package-451bb312-to-bf515cad.md`.

---
Resolved: `skills/news/SKILL.md` `## Step 2: ask what is new` holds `ref=`, `head=`, `new=`, every `entry=` line with the `writer=` line printed under it, and every `skipped=` line; `## Step 7: report` names the skipped paths in one sentence and says they are files the store holds that are not messages. Funded inside the `skills/` bound by cutting the two preamble bullets restated verbatim at Step 5 and Step 7, leaving the one bullet nothing else states and rewording the preamble's cardinality with it: net 8 373 -> 8 211 bytes.
