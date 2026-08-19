# Should a cited artifact path be absolute, so an editor can open it?

---
**Domain:** code
**Status:** answered
**Filed by:** orchestrator (on the user's request)
**Cross-references:** `rules/fusion-workbench-conventions.md` `## Path Resolution`, whose contract makes every emitted path workbench-relative except `WORKBENCH`; `bin/fusion-paths`

---

## Question

The user, verbatim: *"Specs, Analysis, and other files: render as absolute path, use project
specific env var, pointing to project root `<FUSION_PROJECT_ROOT>`, which needs to be set per
terminal, ideally by the fusion start script (`pwd`). Aim: allowing editor to directly open the
file with default text/markdown editor."*

The concrete want is small and daily: a path in a chat reply that can be clicked or pasted and
opens the file. Today an agent cites `planning/260811-0753_o_spec-....md`, which resolves against a
store the reader has to know, or `fusion-workbench/circles/…/planning/…`, which resolves against a
project root the reader has to be standing in.

## Options

1. **Absolute paths in user-facing output only**, with the stored artifacts keeping
   workbench-relative citations. The distinction is exactly the one `rules/user-facing-output.md`
   already draws between what the user reads and what persists.
   - Pros: nothing about the resolver contract or any stored record changes; the change is in how
     an agent *renders* a path in chat.
   - Cons: two forms of the same path, and the discipline of using the right one in the right place
     is prose, which is the class of defect this project produces most.
2. **An environment variable `FUSION_PROJECT_ROOT`**, set by the launcher from `pwd`, that agents
   prefix when rendering. Makes the absolute form derivable rather than hand-built.
   - Pros: one source; the launcher already knows the value; `$FUSION_PLUGIN_ROOT` is the working
     precedent for exactly this pattern.
   - Cons: a session started from a subdirectory sets it wrong, which is a failure this project has
     met before and now warns about at SessionStart. And an agent that renders `$FUSION_PROJECT_ROOT`
     literally instead of expanding it produces a path that opens nothing.
3. **`WORKBENCH` is already absolute** — `bin/fusion-paths` emits it that way — so an agent could
   render `$WORKBENCH/<relative>` today with no new mechanism at all.
   - Pros: zero new surface. The capability exists and is unused.
   - Cons: does not cover project files outside the workbench, which the user's wording ("and other
     files") may include.

## Constraints

- Stored artifacts must keep relative paths. An absolute path in a committed record breaks for
  every other machine and every clone, and this workbench is git-tracked.
- Whatever is chosen has to work from the chat surface of every agent, not just the orchestrator.

## Recommendation

Option 3 first, because it is available now and costs nothing: agents render `$WORKBENCH`-prefixed
absolute paths in chat and keep relative paths in files. If "other files" turns out to mean project
sources outside the workbench, option 2 becomes necessary and option 3 remains its inner half.

---
Answered: shared/history/260816-1500-orchestrator-session.md `## Decisions answered by the user` — option 3: render `$WORKBENCH`-prefixed absolute paths in chat, keep relative paths in stored records. User answered inline 2026-08-16.

---
**Reconciliation 260817-1836** (reconciler, domain `code`, HEAD `2552586`). Answer recorded, not yet realised — marker stays `_a_`. `rules/user-facing-output.md` carries no rule about rendering workbench-prefixed absolute paths in chat. The one absolute-path mandate in the shipped prompts is a different subject: `agents/orchestrator.md:537` requires absolute pathspecs for `git add` under the commit lock-s directory change.

---
**Reconciliation 260819-1400 (reconciler, domain `code`, HEAD `e435f03` / `v10.3.0`) — marker
unchanged at `_a_`; re-verified after 260817-1836.**

`rules/user-facing-output.md` still carries no rule about rendering a `$WORKBENCH`-prefixed absolute
path in chat, and no agent prompt carries one either. The capability the answer chose is present and
unused, exactly as the record's option 3 said it already was:
`rules/fusion-workbench-conventions.md:132` states that every emitted path is workbench-relative
**except `WORKBENCH` itself, which is absolute**, so an agent can render `$WORKBENCH/<relative>`
today with no new mechanism.

The answer's cost is therefore one paragraph in `rules/user-facing-output.md` and nothing else,
which makes this the cheapest unrealised answer in the store — and, since that rule file is
always-on for all sixteen agents, one whose bytes are charged sixteen times a session against the
12 000-byte always-on growth bound in `hooks/lib/__tests__/rules-emission-golden.test.ts`.

**What binds a deep change.** Stored records keep relative paths — an absolute path in a committed
record breaks for every clone, and this workbench is git-tracked. Any change that starts emitting
absolute paths must keep the split between what the user reads and what persists, which is the
distinction `rules/user-facing-output.md` already draws and the reason option 1 was not chosen
outright.
