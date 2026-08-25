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

---
Resolved: `renderParty` passes every field through `flattenField` before joining on the TAB. Any run of C0 control characters or DEL becomes a single space.

Two departures from the record's fix direction, both widenings and both deliberate. It covers **all five fields**, not `person` alone: `checkout`, `ts` and `circle` reach the renderer from the same JSON by the same route and can carry the same bytes for the same reason, and a rule that holds for one field of a record and not the others is a rule a later edit will get wrong. And it covers the **whole control range** rather than TAB, CR and LF by name, which costs nothing and needs no argument about which of the remaining thirty are harmless in a tab-separated record.

Flattening rather than escaping, which is the record's own reading of the cheapest form that keeps the record shape: one line of exactly five fields, no decoding step at the reader, at the cost of not being reversible. That price is stated at the function and in the `bin/fusion-events` header, beside the sentence that explains why the separator is a TAB in the first place.

Measured with the record's own fixture, a person value holding a TAB and a newline:

```
lines: 1   fields: 5
"party=person\tEv il Name <e@x>\tbbbb2222\t2026-08-25T10:00:00\tC1"
```

Before the change: two lines, the first of them carrying six fields.
