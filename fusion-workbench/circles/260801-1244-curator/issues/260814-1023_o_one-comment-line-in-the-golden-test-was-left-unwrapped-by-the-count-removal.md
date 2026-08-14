One comment line in the golden test was left unwrapped by the count removal

---
`hooks/lib/__tests__/rules-emission-golden.test.ts:173` is 130 characters after the "sixteen agents"
figure was removed from the `RELEASE_CAP` doc comment. The removal joined two wrapped lines into one
and the result was not re-wrapped, against the roughly 80-column wrapping every other line of that
comment block keeps.

---
The line reads: `* \`origin/main\` already ships, undifferentiated, to every agent. It is the tax a
consuming project pays today, and a release that`. The eleven other rewrites in the same commit all
kept the block's wrapping. Purely cosmetic, filed because the file's comment blocks are load-bearing
doctrine that people read as prose.

**Filed by:** coderev, reviewing `d7786eb..5b81f5a`. Circle store per the Origin Rule.
