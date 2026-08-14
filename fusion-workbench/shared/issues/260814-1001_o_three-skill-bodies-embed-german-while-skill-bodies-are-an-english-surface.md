Three skill bodies embed German user-facing text while skill bodies are an English surface

---
`rules/fusion-workbench-conventions.md` `## Project language` lists skill bodies under
**Exempt surfaces — English in every project, whatever either line says**, because they ship to
consuming projects of every language. `skills/next/SKILL.md`, `skills/direct/SKILL.md` and
`skills/seed-from-plane/SKILL.md` each embed German user-facing prose directly as the text to print.

---
**The distinction the rule turns on.** A skill body may *specify* what a prompt says and leave the
rendering to the project's chat language. What it may not do is ship one project's language as the
literal. The three bodies above do the second: a consuming project whose chat language is `en` gets
German gate prompts out of the box.

**Found while writing `skills/curate/SKILL.md`** (plan step 3 of Circle `260801-1244-curator`, on
2026-08-14). That body specifies its prompts in English and states that they render in the project's
chat language. The three older bodies read as the house convention until the rule is opened, which
is how the inconsistency propagates: the next skill author copies the nearest example.

**Not fixed here**, because all three files are outside the step's scope and the change is editorial
across three bodies rather than mechanical.

**Worth deciding rather than assuming.** Whether the German is a violation or a deliberate exception
for skills only this project runs is not recorded anywhere. If it is deliberate, the exempt-surfaces
list should say so; if it is not, the three bodies need the treatment `skills/curate/SKILL.md` got.
Either way the current state teaches the wrong pattern.

**Filed in the shared store** rather than in the Circle, per the Origin Rule: found next to this
Circle's work, not caused by its Directive.

**Filed by:** orchestrator, session `shared/history/260813-2345-orchestrator-session.md`.
