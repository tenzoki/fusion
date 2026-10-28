An unparseable settings layer reads as "no sandbox", so the deny is written under a sandbox fusion could not read
---
`hooks/lib/temp-paths.ts:179-187` `sandboxEnabled` catches every read or parse error and returns false for that file. If `~/.claude/settings.json`, the project's `settings.json` or a managed file enables the sandbox but does not parse for fusion, `grant` writes the four deny entries, which break the sandbox's `TMPDIR` (step 1 (c)), the case the user ruled out ("sandbox ohne deny").
---
**Filed by:** reviewer, Kai Stalmann <ks@qantr.com>

Acceptance: a present but unparseable layer makes `--sandbox` print `sandbox=unknown`, `grant` then writes no deny and prints `deny=skipped-unknown-sandbox` naming the file, and a test covers it. An absent file still reads as no sandbox.
