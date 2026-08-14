The curator's Setup cites the provenance rule by a path that resolves only in the plugin's own repo

---
`agents/curator.md` Setup step 5 says: "**Read `rules/rule-file-provenance.md`.**" That is a bare
relative path. In a consuming project it resolves against the project root, where `./rules/` is the
project's *own* rule directory and the file does not exist; the plugin's copy lives at
`$FUSION_PLUGIN_ROOT/rules/rule-file-provenance.md`, outside the project tree. `bin/fusion-rules`
emits that file to no agent, so the citation is the only route to it, and two rule files now assert
that this route works.

---
**What is verified.** `./bin/fusion-rules curator` emits five always-on files plus the two voice
profiles; `rule-file-provenance.md` is not among them. `rules/fusion-workbench-conventions.md`
`## Rule-file provenance` now reads "`bin/fusion-rules` emits it to no agent: the one agent whose
routine work includes writing normative rule text is the `curator`, and `agents/curator.md` reaches
this definition by citing it at Setup rather than by emission." `rules/rule-file-provenance.md`
carries the matching sentence: "`agents/curator.md` cites this file at Setup, which is how the one
agent that needs it gets it." Both statements depend on the citation resolving, and outside this
repository it does not.

**Why no gate caught it.** `hooks/lib/__tests__/reference-resolution-lint.test.ts` resolves a
plugin-file token such as `rules/rule-file-provenance.md` against *this repo's* tree, where the file
exists, so the citation passes the lint. The lint's own header states the bound: a `./rules/...`
spelling is the consuming project's directory "by convention and is never checked here". The
runtime failure is invisible to it by construction.

**The same shape, one step milder, at the preserve list.** `agents/curator.md` `## Preserve list`
cites `skills/revise-claude-md/SKILL.md` `## Pass guard — what to PRESERVE`, another plugin-shipped
file named by a bare relative path. That one degrades gracefully because the prompt inlines the five
categories in the same sentence, so a curator that cannot open the file still holds the list.

**The fix has precedent in the tree.** `agents/investigator.md:17` names a plugin-shipped file as
`$FUSION_PLUGIN_ROOT/templates/investigator-capture-layout.md`, and the variable is exported by the
SessionStart hook for exactly this. Rewriting Setup step 5 to
`$FUSION_PLUGIN_ROOT/rules/rule-file-provenance.md` is a one-line change; `ROOT_VARS` in the
reference lint already accepts a declared root variable in front of a plugin-shaped path. Note the
residual `CLAUDE.md` records for that variable: it names the *installed* copy and is pinned for the
session, so inside this repository it reads an install that may be older than the work tree. That
residual is the documented one and is smaller than a path that does not resolve at all.

**Filed by:** coderev, reviewing `d7786eb..5b81f5a`. Circle store per the Origin Rule.
