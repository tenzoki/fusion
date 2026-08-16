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
