The heredoc example was de-indented to column 0, and that terminates the numbered list it sits in

---

`3016020` fixed the indented-heredoc defect in `skills/commit/SKILL.md` by moving the explanatory
paragraph (`:84-90`) and the fenced block (`:92-96`) to column 0. Both now sit inside step 6 of the
skill's numbered procedure, at an indentation the list cannot contain. In CommonMark a column-0
paragraph after a blank line ends the list, so:

- step 6's remaining instructions (`:98-110`) — the `-F` rationale and **both** `fusion-commit-lock`
  invocations — are no longer part of item 6;
- `7. **Show result**` at `:112` starts a fresh ordered list.

---

**The fix itself is right.** The heredoc terminator has to be at column 0 and the paragraph explains
exactly why, correctly (`<<-` strips tabs, never spaces). Nothing about the shell is wrong here.

**What it costs.** The two commands a reader most needs from step 6 — how to stage and commit under
the lock, and the bare form for an already-staged tree — now render outside the step that introduces
them, while the heredoc that is only the *first* half of step 6 renders as top-level document text.
The visual weight is inverted against the importance.

**Fix direction.** Keep the block at column 0 and pull it out of the list properly: promote step 6's
body to its own `### Stage and commit as one held pair` subsection, with the numbered list ending at
step 5 and `## Step 7` following the subsection. That gives the heredoc its column-0 home without
orphaning the lock commands.

An alternative worth one minute's thought: state the terminator rule and leave the fence indented,
since no agent copies the block byte-for-byte out of a skill body — it writes a `Bash` call from it.
The Turn-1 finding that motivated this change (`260810-1918`) assumed a verbatim copy. Whether that
assumption holds is the question that decides which of the two fixes is right, and it was not asked.

**Cross-references.** `skills/commit/SKILL.md:70-112`;
`260810-1918_*_the-commit-skills-heredoc-example-is-indented-so-a-verbatim-copy-never-terminates.md`.

**Filed by:** coderev, review of session `260810-1646-orchestrator-session.md` Turn 2, range `da8c9db..b3cc034`.

---

Resolved — the numbered list ends at step 5 and the last two steps became headed sections.

`skills/commit/SKILL.md` closes its `## Process` list after step 5, states in one paragraph why it
stops there, and continues as `### 6. Stage and commit as one held pair` and `### 7. Show result`.
The whole of step 6 now sits at column 0 inside its own section: the lock rationale, the heredoc
paragraph, the fenced heredoc, and **both** `fusion-commit-lock` invocations. Nothing renders outside
the step that introduces it, and `7. Show result` no longer starts a second list. The reader still
walks seven steps in order; two of them are headings rather than list items.

**The question the record left open was answered, not deferred.** It asked whether the verbatim-copy
assumption behind `260810-1918` holds, since an agent writes a `Bash` call from the block rather than
copying it byte-for-byte. *Inference, not measurement:* it holds for the part that decides the
outcome. The message body is a placeholder an agent substitutes, but the opener
`cat > <msg-file> <<'FUSION_MSG_EOF'` and the terminator line are literals with nothing to
substitute, and those are the two lines an agent reproduces as it found them, leading whitespace
included. The terminator is the line that has to be at column 0, so the fence stays at column 0 and
the document structure moved around it.

**Resolved by:** coder, session `260810-1646-orchestrator-session.md`, Turn 3.
