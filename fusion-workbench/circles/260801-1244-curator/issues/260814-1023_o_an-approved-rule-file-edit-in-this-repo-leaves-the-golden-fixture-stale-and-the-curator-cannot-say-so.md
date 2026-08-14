An approved rule-file edit in this repo leaves the golden fixture stale, and the curator is not told to say so

---
In the fusion plugin's own repository the curator's rule-file surface is the shipped `rules/`
directory — the spec states this deliberately
(`circles/260801-1244-curator/planning/260814-0738_o_spec-curator.md:74`). Every one of those files
has its byte size pinned in `hooks/lib/__tests__/fixtures/rules-emission.golden`, which the golden
test compares in both directions. So an applied curator edit to any rule file here turns
`cd hooks && npm test` red, the regeneration lives under `hooks/` where exclusion 6 forbids the
curator to go, and nothing in `agents/curator.md` tells it to report the regeneration as work for
somebody else.

---
**What is verified.** This Turn's own registration moved two rule files by 107 and −5 bytes, and the
golden fixture had to be regenerated in the same commit; the fixture diff carries the new sizes in
every affected block. `agents/curator.md` `## Explicitly not in your remit` item 6 excludes "Anything
under `bin/`, `hooks/` or `docs/`". `## Reporting work you may not do` covers two cases, a derivation
that needs new code and a change to a file outside the remit; a fixture that goes stale as a *side
effect* of an approved in-remit edit is neither, so no bullet catches it.

**Scope, stated precisely.** This bites only where the project being curated is the plugin's own
source, which is exactly where the Circle plans its C11 validation run. In a consuming project
`./rules/` is that project's own directory and no fixture pins it.

**Fix direction.** One line in `## Reporting work you may not do`: where an applied edit changes the
byte size of a file whose size is pinned by a test the curator may not touch, the run report names
the regeneration command and marks it coder work. The failure is loud rather than silent — the suite
goes red on the next run — so this is about naming the owner, not about preventing a break.

**Filed by:** coderev, reviewing `d7786eb..5b81f5a`. Circle store per the Origin Rule.
