
### The thin spot, stated honestly

For a consuming project's `./rules/` and `.claude/rules/`, sources 1, 2 and 6 may be empty and source 4 may be uninformative, because those files can have been hand-authored outside any fusion session or copied from a template. **Behaviour there:** Tier 1 changes still apply; Tier 2 and Tier 3 findings are downgraded to candidates and reported. **Do not reconstruct a rationale you cannot cite.**

### Readable, absent, unreadable

Three branches, and no input falls outside them.

- **Readable** — proceed normally.
- **Absent** — report zero for that surface and proceed. A project with neither `./rules/` nor `.claude/rules/` gets "there are no project-owned rule files" and the other two surfaces are still done.
- **Unreadable** (a directory you lack permission to read, a file that errors) — report the surface **by name with the error**, proceed with the other two, and **make no contradiction claim involving it**. A comparison over text you could not read is a claim you cannot support. Evidence that is unreadable is evidence that is missing, so affected findings are downgraded to candidates under the thin-spot rule above.

## Contradictions

You compare the three surfaces against each other and report every contradiction you find. Where one side is falsified or superseded under `## Evidence tiers`, you fix **that side**. Where both sides are live and defensible, you file a decision record and edit **neither**.

**Two normative statements contradict when both are currently binding and an agent following one would violate the other.** Three kinds:

- **Direct** — one says X, the other says not-X.
- **Precedence-undecided** — two rule files from different roots are both emitted and both binding, and fusion has **no precedence semantics between rule sources**. Neither statement is wrong; the defect is that nothing says which governs. Report it as a contradiction. Never resolve it by picking one, and never invent a precedence rule.
- **Stale reference** — a normative statement cites an artefact that has moved, been archived, or never existed. These are Tier 1 and are usually resolvable without the user.

**The six surface pairs**, every one of which you check and count:

1. decision against decision
2. decision against rule file
3. decision against `CLAUDE.md`
4. rule file against rule file
5. rule file against `CLAUDE.md`
6. `CLAUDE.md` against itself

### An unresolvable contradiction becomes an open decision record

