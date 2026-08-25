The `party=` line is unescaped tab-separated output, and a TAB or newline inside a person value breaks the record

---

`renderParty` joins five fields with a TAB and escapes nothing. A `person` value carrying a TAB shifts every later field by one; one carrying a newline splits the record in two. The module chose a NUL for its own internal key on exactly this reasoning and did not carry it to the output format.

---

**Filed by:** coderev, Kai Stalmann <ks@qantr.com>

**Severity:** Low

**Evidence.** `hooks/lib/events-query.ts:296-300`:

```ts
export function renderParty(p: Party): string {
  const person = p.person ?? "(not recorded)";
  return [`party=${p.kind}`, person, p.checkout, p.ts, p.circle].join("\t");
}
```

Measured with a person value holding a TAB and a newline:

```
party=person	Ev	il
Name <e@x>	bbbb2222	2026-08-25T10:00:00	C1
```

One party rendered as two lines, and the first of them carrying six fields.

**The reasoning already in the file.** `:205-210` chooses NUL for the map key: "the person value contains spaces by construction and any printable separator is something a git identity can legitimately hold". The same sentence is true of a TAB, and the output format is the surface a consumer parses.

**Reachability.** `person` originates in `git config user.name` and `user.email` on whichever machine wrote the line, so it is user-controlled but not attacker-controlled in any ordinary setting. It survives the round trip because JSON carries `\t` and `\n` and `JSON.parse` restores them.

**Fix direction.** Reject or escape a control character in the rendered fields. The cheapest form that keeps the record shape is to replace any TAB, CR or LF in `person` with a single space at render time and say so in the `bin/fusion-events` header beside the sentence that explains the separator choice.

**Scope.** `hooks/lib/events-query.ts`, `bin/fusion-events` header, and the parser plan step 6 has yet to write.
