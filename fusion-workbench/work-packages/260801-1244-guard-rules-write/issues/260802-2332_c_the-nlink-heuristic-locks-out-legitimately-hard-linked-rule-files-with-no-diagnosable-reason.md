# The `nlink > 1` heuristic locks out legitimately hard-linked rule files, and the deny says nothing about why

---

**Severity:** Medium
**Domain:** code
**Filed by:** coderev, reviewing Turn 2 of `260801-1244-guard-rules-write` (`bf75941..HEAD`)
**Affects:** the rules-write exemption on both surfaces
**Cross-references:** `hooks/lib/fs-locator.ts:137-150` (`hasHardLinks`),
`hooks/lib/rules-write-exemption.ts:152-158` and `:80-85` (the interface and its rationale),
`hooks/lib/rules-write-exemption.ts:171-183` (`resolvesInsideRuleDir`),
`hooks/guard.ts:611-618` (the deny reason a user sees)

---

## The judgement asked for

`nlink > 1` is a property of an inode, not a statement about intent, and it is used as a
proxy for "this name is an alias planted to escalate". The proxy is sound in the direction
that matters — it never grants where the flat check would have denied — but it is a
two-sided test used one-sidedly, and both sides are worth stating.

**Does a protected file with one link still get a grant?** Yes, and it is not a hard-link
problem: any file reachable through `rules/<symlink>/../…` gets one, because the lexical
`..` collapse means `hasHardLinks` is asked about a *different, non-existent* path. Filed
separately at `260802-2330_*_the-lexical-dotdot-collapse-erases-the-symlink-gate-2-was-added-to-resolve.md`. So the hard-link gate is not the weak point; it is a correct
gate applied to the wrong string.

**What legitimate case does it break?** Any rule file with a second name, whoever made it —
and the answer is silent, permanent within the session, and undiagnosable.

## Evidence — measured

Real guard subprocess, throwaway project, `FUSION_ALLOW_RULES_WRITE=1`, two rule files
hard-linked to each other and nothing else done:

```
  linkSync(rules/x.md, rules/y.md)          # both are rule files, both inside rules/
  Edit rules/x.md                                            DENY
  Edit rules/y.md                                            DENY
  rm rules/x.md                                              DENY
  mv rules/x.md rules/retired/x.md                           DENY
```

Two ordinary rule files, no symlink, nothing outside the rule directory, nothing protected
aliased. The flag's headline use — `mv rules/x.md rules/retired/` — is denied on both of
them, permanently, until someone breaks the link.

The deny the user reads is:

```
Protected path: rules/x.md cannot be modified directly.
This path is under compliance guard protection.
```

Identical to the deny they would get with the flag unset. Nothing distinguishes "the flag is
not set" from "the flag is set and this specific file is refused for a reason about its inode
that no message names". The most likely user response is to conclude the flag does not work.

## How a rule file acquires a second link without anyone deciding to

Not exotic, and none of it is the agent's doing:

- `rsync --link-dest` and `cp -al` backup and snapshot schemes hard-link every unchanged
  file. A project restored from, or backed by, such a scheme has `nlink ≥ 2` on **every**
  file, which disables the flag entirely and looks exactly like the flag being broken.
- `git clone --local` hard-links, and build and vendoring tools that dedupe by inode do too.
- The flag's own permitted operations produce it: `cp -l rules/x.md rules/y.md` is a `cp`,
  `cp` is exemptible, so the guard allows the command that makes both files permanently
  un-writable under the same flag.
- Deliberate sharing: a rule file hard-linked between two checkouts of the same project, the
  hard-link analogue of the shared-rules symlink case the suite explicitly supports at
  `guard-rules-write-integration.test.ts:941-963`.

The last one is the sharp edge. Gate 2 goes out of its way to support a `rules/` directory
that is a **symlink** into a shared tree, and refuses the same intent expressed as a hard
link. That asymmetry is defensible — `realpath` can prove where a symlink goes and cannot
prove anything about a second link — but it is not stated anywhere a user will find it.

## Severity, honestly

Medium, not High. Every failure is a refusal, and refusing a grant is the safe direction —
the module docstring's "Refusing the grant is always the safe direction" claim
(`rules-write-exemption.ts:92-99`) holds here exactly as written. Nothing is exposed. What is
lost is that the flag can be silently inert for a whole class of project with no signal, and
the guard's own advice ("set the flag to curate rules") stops working with no way to find out
why.

## Candidate directions, not decided here

1. **Name the reason in the deny.** Cheapest and closes most of the harm. When
   `rulesWriteExemptionActive(env)` is true, a path that passed gate 1 and failed gate 2
   should say which sub-check refused it — "this rule path has a second name on the
   filesystem (hard link), so the exemption cannot prove it names only a rule file" versus
   "this path resolves outside the rule directories". It costs one extra return value from
   `resolvesInsideRuleDir` and it makes the whole gate debuggable rather than mysterious.
2. **Narrow the test to a link that crosses the boundary.** Refuse only when the file has
   another name whose resolved location is *outside* the rule directories. Correct in intent,
   and expensive: there is no portable way to enumerate an inode's other names short of
   walking the tree, so this is probably not affordable.
3. **Accept and document.** State in `README-hooks.md` alongside the flag that a hard-linked
   rule file is not exempt, and why. Honest, and it should happen regardless of 1 or 2.

Direction 1 is the one I would take, with 3 alongside. It changes no verdict, only what the
user is told about one.

## Test coverage this needs

The suite pins the security half (`rules/copy`, a protected inode aliased into `rules/`, is
denied) and has no case for the false-positive half. One case asserting that two hard-linked
**rule** files deny — with a comment saying that is the accepted cost — would at least make
the behaviour a decision on the record rather than a discovery.

## Origin

Found in `260801-1244-guard-rules-write` while judging `nlink > 1` as a defence, at
the reviewer's specific request. The measurement above also demonstrated the vacuity
mechanism first-hand: the third and fourth denials in a single project came back `[HALTED]`,
not from the gate under test.

---
Resolved: direction 1, implemented for BOTH gates that can refuse a rule path, plus the test
coverage the issue asks for. No verdict changed; the hard-link refusal stands exactly as it
was.

`resolvesInsideRuleDir` now returns a refusal instead of a boolean, and the whole decision is
one exported function, `rulesWriteRefusal` — null when the grant holds, otherwise one of
`not-a-rule-path`, `spelled-with-dotdot`, `hard-link`, `unresolvable`, `resolves-outside`.
`isProjectRulePath` is that function read as a boolean, so there is no second implementation
of the boundary "for the message". `rulesWriteRefusalNote` turns a refusal into the sentence
each surface appends to its deny reason: `guard.ts` appends it directly on the write-tool
path, and the Bash classifier takes it through a new `MutationOptions.exemptRefusal` seam,
sibling to `exempt`, so the note lands before the "do not rephrase" instruction rather than
after it.

What the same measurement now reads (two hard-linked rule files, nothing else done):

```
  Edit rules/x.md, FLAG SET
    Protected path: rules/x.md cannot be modified directly. This path is under compliance
    guard protection. FUSION_ALLOW_RULES_WRITE is set and this path is inside a rule
    directory, but the exemption still refused it: the file already has a second name on this
    filesystem (a hard link), so the exemption cannot prove that writing this name writes only
    a rule file. Rewriting the command will not help — ask the user.

  Edit rules/x.md, flag UNSET
    Protected path: rules/x.md cannot be modified directly. This path is under compliance
    guard protection.                                    (byte-identical to before)
```

Two properties of the reporting are deliberate and asserted. A path that is not a rule path
gets NO note, so `agents/coder.md` reads exactly as it always did — a note there would
advertise a grant that does not apply. And only the gate-0 note names an action ("name the
rule file without a `..`"), because there the file really is one the flag covers; the other
three say plainly that rewriting will not help and send the reader to the user, so no note
reads as the workaround `rules/protected-path-discipline.md` is written against.

Direction 2 not taken, for the reason the issue gives (no portable way to enumerate an
inode's other names). Direction 3 is T3-7's and was left alone; the accepted cost is now on
the record in code as well: a case asserts that two hard-linked RULE files are both refused,
on both surfaces, labelled as the accepted cost.

Suite 1009 -> 1047. With the note suppressed, 9 of the new cases fail; with gate 0 moved above
gate 1's membership test, the 2 cases pinning the report order fail.

Session: `260803-1314-turn3-t3-2-exemption-prose-and-refusal-diagnostics.md`
