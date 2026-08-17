# The HTTP code is still read from the noisy channel, and a `zshexit` hook writes after curl

---

**Severity:** Medium — the same defect class `7342fdd` closed for the body remains open for the status code, and the new header comment asserts it cannot.
**Domain:** code
**Filed by:** coderev, reviewing `7342fdd` (`shared/reviews/260813-1051-coderev-plane-curl-response-via-temp-file.md`)
**Affects:** `bin/fusion-plane:349-350` (the comment's claim), `bin/fusion-plane:375-377` (the `tail -n1` read)
**Cross-references:** `shared/issues/260813-0828_c_three-tests-fail-at-head-in-two-files-and-no-open-record-names-them.md`

---

## The claim under review

The header comment added by `7342fdd` says the code is

> still on its own last line — noise can only ever precede it, never follow it

and the inline comment at 375-376 repeats it: *"whatever the rc printed sits before curl's
leading `\n`, so `tail -n1` reads the code and nothing else."*

That holds for **startup** noise, which is what the fix was chasing. It does not hold for
output written when the shell **exits**. `zsh` runs `zshexit` (and `TRAPEXIT`) after the
command, and that output lands after curl's. Measured:

```bash
$ cat $ZDOTDIR/.zshrc
print "STARTUP-BANNER"
zshexit() { print "EXIT-HOOK-LINE" }

$ out="$(zsh -ic 'printf "BODY\n200\n"' 2>/dev/null)"
STARTUP-BANNER
BODY
200
EXIT-HOOK-LINE

$ printf '%s' "$out" | tail -n1
EXIT-HOOK-LINE
```

`PLANE_HTTP_CODE` becomes `EXIT-HOOK-LINE`, never matches any caller's `2*`, and every request
reads as an HTTP error. The body is now correct (it comes from the file), so this is strictly
less damaging than the defect that was fixed — but it is the same operator, the same rc, and
the same absence of a diagnostic.

`zshexit` is not exotic: session loggers, timing plugins and shell-history tools install one.
`plane_key_present` (`bin/fusion-plane:388`) is unaffected — it reads only the exit status, and
a `zshexit` returning non-zero does not change it (measured: rc stayed 0).

## Suggested remedy — either of two, the first preferred

1. **Take the code out of the shared channel too.** Redirect the command's stdout to a second
   temp file inside the `zsh` string, so nothing that shell writes is ever read:

   ```bash
   cmd="curl ${common} \"${url}\" > \"\$FUSION_PLANE_CODE\""
   ```

   Then `plane_curl` reads two files and the interactive shell's stdout is discarded entirely,
   which is what the fix's own reasoning argues for.

2. **Validate what `tail -n1` returned.** `case "$PLANE_HTTP_CODE" in [0-9][0-9][0-9]) ;; *)`
   → emit a named diagnostic ("the interactive shell wrote to stdout after the command"). This
   costs three lines and converts every variant of this failure — including the `mktemp` and
   `$TMPDIR` ones filed alongside — from a mysterious HTTP error into a sentence naming the
   cause.

The comment should be corrected either way: "noise can only ever precede it" is false as
written, and it is exactly the kind of stated absolute a later reader will build on.

---
Resolved: curl's `-w` output is redirected inside the `zsh -ic` string to its own temp file, and that shell's stdout is now discarded whole. Nothing structural is read from the noisy channel any more — not the body, which `7342fdd` moved, and not the status code. The false claim in the header comment is corrected in the same change rather than merely softened. A three-digit validation of the code stays in as a second line: it is the one check that can still name a curl which exits 0 having written no status at all, and without it that case lands on the caller's `2*` branch as a generic HTTP error, which is exactly how all three of this batch's faults used to present.

**`--write-out %output{file}` was declined, and the reason was measured rather than assumed.** That spelling would empty the channel just as completely, and it needs curl >= 8.3.0. Grepped: this repository states no curl floor anywhere — `README.md` `### Requirements` names Claude Code, Node 18+ and Python 3, and the dependency line in `bin/fusion-plane` names `curl` with no version. Adopting it would impose an undeclared requirement on every consuming project. A plain `>` redirect achieves the same thing and needs no such claim.

**This record's own reproduction was imprecise, and the correction matters more than the fix.** It demonstrated the defect with a `zshexit` hook running `printf`. Measured on zsh 5.9 while fixing: a **lone** `zshexit` never fires against this command, because zsh execs a single external command in its own place — the pre-fix code returned a clean `200`. The record's reproduction worked only because `printf` is a builtin, which suppresses that exec. `TRAPEXIT` alone does fire despite the exec, and glues itself to the code (`200TRAP-EXIT-LINE`), which a caller's `2*` case still matches — a quieter failure than the one filed. Only both hooks together produce the defect as described. The regression test therefore installs both; built on this record's reproduction alone, it would have been green against the defect it was written to catch.
