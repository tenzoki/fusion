The commit skill's heredoc example is indented, so a verbatim copy indents the message and never terminates

---

`skills/commit/SKILL.md:84-88`, inside numbered step 6, is indented three spaces by the surrounding
list:

```
   ```bash
   cat > <msg-file> <<'FUSION_MSG_EOF'
   <the confirmed message, verbatim>
   FUSION_MSG_EOF
   ```
```

The quoting is right — `<<'FUSION_MSG_EOF'` with a quoted delimiter is exactly what stops `$var`
expansion and backtick execution in the body, which is the defect `260810-1535_*_the-orchestrators-commit-procedure-truncates-any-message-containing-an-apostrophe.md` records. The
placement is not. A here-document introduced with `<<` (not `<<-`) requires its terminator at column
0; `<<-` strips leading **tabs** only, never spaces, so there is no drop-in fix at the operator.
And even where the terminator is dedented, three leading spaces on the body line become three
leading spaces on every line of the commit message.

`/fusion:commit` has `allowed-tools: [Bash, Read, Glob, AskUserQuestion]` — verified, no `Write` —
so the heredoc really is the only route this skill has to a message file, and this block really is
the one it will copy. `/fusion:cleanup` is not exposed the same way: it has `Write`
(`skills/cleanup/SKILL.md:4`) and its instruction offers `Write` first, with the heredoc as the
alternative and no worked block to copy.

This is a hazard, not a measured failure. I did not observe a truncated message from it; the reason
to file it is that the same file already documents the class ("a body written under a bare `<<EOF`
still substitutes `$var`…") and pays for the lesson in `045a14f`.

---

**Failure scenario.** The session copies the block as shown. `cat > /tmp/msg.txt <<'FUSION_MSG_EOF'`
starts a here-document; every subsequent line is body, including `   FUSION_MSG_EOF`, which does not
match the terminator. The heredoc consumes to EOF, the shell reports `unexpected EOF while looking
for matching FUSION_MSG_EOF` or blocks, and step 6 fails before the lock is taken. The gentler
variant — the agent dedents the terminator but not the body — writes a commit message whose every
line begins with three spaces, so `git log --oneline` shows an indented subject and the conventional-
commit `<type>(<scope>):` prefix no longer sits at the start of the line.

**Fix.** Put the block at column 0 (unindent it out of the list item, or restructure step 6 so the
fence is top-level), and add one sentence: *the closing delimiter must be the whole line, at column
0, with nothing before it.* Same for the body lines.

**Cross-references.** `260810-1535_*_the-orchestrators-commit-procedure-truncates-any-
message-containing-an-apostrophe.md`; `agents/orchestrator.md:405` (the orchestrator's route, which
avoids this entirely by using `Write`).

**Filed by:** coderev, review of session `260810-1646-orchestrator-session.md` Turn 1, range `5ef92eb..940d522`.

---

**Resolved:** the block in `skills/commit/SKILL.md` step 6 is at column 0, and the sentence the fix
direction asks for is there — with the reason attached, so the next author does not re-indent it to
match the list. It states that the terminator must be the whole line at column 0 with nothing
before it, that `<<-` strips tabs only and so rescues nothing, and that an indented body line puts
those spaces on that line of the commit message, subject line included.

The dedent is announced in the preceding sentence ("The block below sits at column 0 deliberately,
and a copy of it must too") rather than left to look like a formatting slip.
