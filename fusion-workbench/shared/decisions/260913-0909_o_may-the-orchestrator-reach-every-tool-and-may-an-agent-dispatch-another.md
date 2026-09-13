# May the orchestrator reach every tool, and may an agent dispatch another?

---
**Domain:** code
**Filed by:** orchestrator, Kai Stalmann <ks@qantr.com>
**Cross-references:** 260824-2013_*_does-the-orchestrators-tools-grant-of-askuserquestion-go-now-that-the-orchestrator-may-not-call-it.md, 260824-2013_*_do-the-nine-skill-bodies-that-present-dialogs-follow-the-dialog-ban.md

---

## Question

Two restrictions on what an agent may reach are in force, and neither is in the state its author
intended. A consuming project has now hit the first from outside, and the second has been
unenforced since it was written.

**The tool grant.** `agents/orchestrator.md:4` is the only `tools:` line in the plugin. It names
nine agents, six built-in tools, `Skill` and `AskUserQuestion`, and nothing else. Every tool that
is not enumerated is therefore unreachable from the orchestrator: MCP servers, `ToolSearch`,
`WebSearch`, `WebFetch`, and every tool any future plugin adds. The other ten prompts carry no
`tools:` line and inherit the session's tools, so the orchestrator is the **only** agent with a
restricted reach, which is the reverse of what a top-level dispatcher needs.

**The dispatch ban.** Four prompts of ten state that the agent does not dispatch another
(`agents/consultant.md:151`, `agents/curator.md:250`, `agents/editor.md:10` and `:51`,
`agents/planner.md:21`). The six that carry no such sentence include `coder`, `analyst` and
`reviewer`, which are the agents most likely to want one. Because none of the ten declares a
`tools:` line, all ten inherit the dispatch tool and can dispatch regardless of what their prose
says. The ban is prose in four files, unenforced in all ten, and absent where it would bite first.

## What prompted it

A consuming project reports that the orchestrator cannot reach the Pencil MCP server, and that the
delegated route through a front-end agent works but costs a dispatch. The reporter patched
`~/.fusion/agents/orchestrator.md` by hand and states that `fusion --update` reverts it, the
installer removing the install directory before copying; the reporter also notes as unverified
whether an `mcp__<server>__*` wildcard is even honoured in an agent `tools:` field, that form being
documented for command `allowed-tools` rather than for agent frontmatter. The report names the
first cross-referenced record above as related, which it is: that record asks whether the same
grant's `AskUserQuestion` entry should go now that the orchestrator may not call the tool.

**One claim in the surrounding discussion is false and is recorded here so it is not carried
forward.** The orchestrator *can* dispatch the shaper: `fusion:shaper` is in the grant and was
dispatched twice on 2026-09-11. The only agents absent from it are `consultant`, which is
user-initiated by design, and `orchestrator` itself, which is the no-recursion rule.

## Options

1. **Delete the `tools:` line.** The orchestrator inherits from the session like the other ten.
   - Pros: every MCP server, `ToolSearch`, `WebSearch` and every future tool become reachable with
     no enumeration to maintain. The reporter's unverified wildcard question does not arise, because
     no wildcard is written. The fix travels with the plugin, so no consuming project patches an
     install that the next update replaces. The `AskUserQuestion` grant disappears, which settles
     the first cross-referenced record as a side effect. And the orchestrator stops being the one
     agent with a narrower reach than the agents it dispatches.
   - Cons: the `Agent(...)` allowlist goes with it, so the two deliberate exclusions, `consultant`
     and the no-recursion rule, fall back to prose, which is exactly the unenforced state this
     record is filed about. `CLAUDE.md` states in two places that the orchestrator is the only agent
     declaring a `tools:` line, and both must move with it.
2. **Extend the `tools:` line** with `ToolSearch` and the MCP entries a project needs.
   - Pros: the allowlist and its two deliberate exclusions survive.
   - Cons: it enumerates a set that grows without this file knowing, so every new server is a
     plugin release. The wildcard form is unverified in this position. And it leaves the asymmetry
     in place: the dispatcher reaches less than the agents it dispatches.
3. **Make the reach a project setting.** `fusion.json` declares additional tools.
   - Pros: a project adds what it uses without a plugin release.
   - Cons: a new configuration surface and a loader leaf, against a configuration file whose only
     live leaf today is the citation paths; and nothing reads an agent's `tools:` from
     configuration, so this needs a mechanism that does not exist.

On the dispatch ban, three options that compose with any of the above:

4. **Drop the ban.** Remove the four prose sentences, state once that an agent may dispatch another
   operative agent, and keep the filing bound untouched: **no agent originates a work item**, the
   route being `/fusion:memo idee` so the idea lands in the backlog and is planned
   (`rules/fusion-workbench-conventions.md` `## Backlog entries — work items`).
   - Pros: ends a fiction that costs bytes in four files and protects nothing. A reading pass that
     could fan out over 58 files does so. The bound that actually matters, who may create work,
     is unaffected and is already enforced by where the store is written.
   - Cons: the token cost is real and is paid per nested dispatch; each dispatch path measured
     2026-09-12 carries between 152 400 and 253 696 bytes before the task text. And the gate hole
     below.
5. **Enforce the ban.** Give all ten prompts a `tools:` line without the dispatch tool.
   - Pros: the stated rule becomes the real one.
   - Cons: ten frontmatter edits in an area with a measured breakage (v2.8.1 added a frontmatter key
     on twelve agents and no agent loaded at all until it was rolled back), and it forecloses
     fan-out permanently.
6. **Leave it.** The current state, which is the worst of the three: unenforced, in four files of
   ten, and absent from the three agents most likely to reach for it.

## Constraints

- The filing bound is not in question under any option: no agent originates a work item, and the
  `/fusion:memo` route stays the only one.
- Whatever is chosen, the ten prompts end in the same state. The present asymmetry, a ban in four
  and silence in six, is a defect on its own and is not a middle position to settle on.
- `agents/orchestrator.md` `## Scope`, its `**Never invokes:**` list, and the two `CLAUDE.md`
  sentences about the single `tools:` line all move with option 1 or 5.

## The open point, which may need a record of its own

**Human gates belong to the orchestrator, and a nested dispatch does not pass one.** The gate list
in `agents/orchestrator.md` covers ontology changes, structural ontology edits, destructive
operations, spec and plan approval, and a work item's maintenance. Each fires in the orchestrator's
own loop. An agent that dispatches an executor reaches that same work one level down, where no gate
is evaluated: measured on this session, four gates fired and none of them would have fired from a
nested dispatch. Option 4 does not address this, and neither does option 6, under which the same
hole is open today and merely undeclared.

Three shapes an answer could take, stated so the next reader does not start from nothing: the gate
obligation is restated in every prompt that may dispatch, which duplicates a list that drifts; a
dispatching agent may only reach agents whose work cannot trip a gate, which needs that partition to
exist and be maintained; or an agent that meets a gate condition returns to its dispatcher instead
of proceeding, which is what the shaper already does with its clarification rounds and is the only
one of the three with a working precedent in the tree.

## Recommendation

Option 1 for the grant and option 4 for the ban, with the gate question answered before option 4 is
implemented rather than after. The grant and the ban are separable and the grant is the urgent half:
it blocks a consuming project today, its fix is a deletion, and it settles an older record on the
way. The ban is not urgent, because dropping it changes no behaviour that is not already possible;
what it changes is whether the project admits it.
