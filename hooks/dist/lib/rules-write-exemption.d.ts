/**
 * The `FUSION_ALLOW_RULES_WRITE` exemption — one predicate, two consumers.
 *
 * A project's rule files are protected by `guard.protectedPaths` (`rules/**`),
 * which is right for ordinary work and wrong for the one job that exists to
 * edit them: curating, revising and retiring rules. This module answers the
 * questions that job needs answered, and nothing else:
 *
 *   1. Did the user deliberately set the flag? (`rulesWriteExemptionActive`)
 *   2. Is this path one of the rule paths the flag exempts? (`isProjectRulePath`
 *      where a path was SPELLED by a tool call, `isObservedRulePath` where one
 *      was MEASURED after the fact)
 *   3. When the answer to 2 is no, WHY — in a sentence the agent that met the
 *      deny can act on. (`rulesWriteRefusal`, `rulesWriteRefusalNote`)
 *   4. What gets recorded when a write does go through. (`rulesWriteDetail`)
 *
 * 1 and 2 must both hold. The write-tool path (`guard.ts` CHECK 2) and the
 * measurement (`tracker.ts`) ask the same two questions of the same kind of
 * value — a normalised, project-relative path — so they ask them HERE. Writing
 * the boundary twice, once per surface, is two places for a security-relevant
 * rule to drift apart.
 *
 * The two entry points to 2 are not two boundaries. They are the same gates,
 * asked of an input that has fewer properties: a measured path was never
 * spelled, so it has no spelling to walk up and no destination still to be
 * resolved. `isObservedRulePath` says which gates that retires and why each one
 * has nothing left to be about.
 *
 * That argument is about the two SURFACES sharing one predicate, and it is the
 * only thing it is about. It is NOT an argument that the grant side and the
 * protection side should share one mechanism — they deliberately do not, and
 * gate 1 below says where and why. One predicate for two callers asking the
 * same question is a single source of truth; one function for two checks that
 * are widening in opposite directions is a lost denial.
 *
 * ## What the flag does NOT do
 *
 * It grants exactly one permission, the way the two git overrides do. It waives
 * the protected-path check for rule files and nothing else. It does not turn the
 * guard off, it does not lift an active halt, it does not touch the
 * decision-governed check, and it exempts no path outside the rule directories —
 * not `agents/**`, not `skills/**`, not `hooks/config.json`, not
 * `hooks/hooks.json`, not `settings.json`, not `bin/monitor`, not
 * `.claude-plugin/plugin.json`, not the guard's own state directory, and not
 * `fusion-guard.json`, the project guard configuration, which has its own
 * self-protection floor.
 *
 * ## PURE, and the environment is a parameter
 *
 * Nothing here reads `process.env`, touches the filesystem, loads a
 * configuration, or caches. The environment arrives as a `ProcessEnv`, the
 * filesystem as an `FsLocator`, and the project's own declared protected entries
 * as a plain list of globs — so every case is testable in-process, without a
 * subprocess and without mutating ambient state that a neighbouring case would
 * then read. `guard.ts` supplies all three, the same way it supplies
 * `CheckoutResolver` to the git classifier.
 *
 * ## Gate 0 — a `..` anywhere in the SPELLING refuses the grant outright
 *
 * The two gates below both read a path that has already been collapsed, and a
 * collapse is where a symlink goes to disappear. `posix.normalize` resolves
 * `..` LEXICALLY: it deletes the preceding component from the string. The
 * kernel does not. `open("rules/link/..")` resolves `rules/link` to its target
 * first and then takes the parent OF THE TARGET. So for any path spelled
 * `rules/<symlink>/../<anything>`, the string the gates below are handed no
 * longer contains `<symlink>` at all — gate 2 is not outwitted by a cleverer
 * link, it is never asked about the link, because the component naming it has
 * already been deleted. Measured: with the flag set, the whole protected list
 * was reachable that way on both write surfaces, and `hasHardLinks` was
 * defeated by the same line, being asked about a path that does not exist
 * rather than about the file being written.
 *
 * So `spelledAs` — the path as the TOOL CALL gave it, before any normalisation
 * — is a required argument, and any `..` segment in it refuses the grant. The
 * refusal costs nothing real: no rule-curation workflow needs `..`, gate 1
 * already rejects the `..` spellings that leave the rule directory, and the
 * narrowing is on the GRANT side, which is the direction that fails safe. It is
 * cruder than resolving the spelling faithfully would be, and deliberately so:
 * that answer would rest on a resolver being right, and the resolver has been
 * wrong once already.
 *
 * ### The bound on gate 0, which is not the bound it was first written with
 *
 * Gate 0 is complete against a `..` IN THE OPERAND. It was described here as
 * complete against the CLASS, by inspection, and that was false: the operand is
 * one of two things joined to make the spelling, and the other is the shell's
 * working directory. On the Bash surface `spelledAs` is `joinCwd(base, value)`,
 * and `base` has been normalised on the way in — so `cd -P rules/link/.. && rm
 * agents/coder.md` handed this gate `rules/agents/coder.md`, containing no `..`
 * to refuse, and the whole protected list was reachable through it.
 *
 * That entrance is closed in the classifier rather than here: `applyDirEffect`
 * now allow-lists the `cd` forms it models and yields `CWD_UNKNOWN` for the
 * rest, so an operand under an unmodelled `cd` is unresolved and reaches no
 * gate at all. Gate 0 was not widened, and no claim is made here that it covers
 * the working directory — it covers the operand, which is what it reads.
 *
 * The caller has to supply it because only the caller still has it. Both
 * surfaces relativise a path against the project root before anything can match
 * it against `rules/**`, and the relativiser resolves `..` on the way
 * (`resolve` then `relative`); the Bash classifier normalises its operands for
 * the same reason. By the time a path is matchable at all, the spelling is
 * gone. Hence a REQUIRED third argument rather than a defaulted one: a call
 * site handing over the collapsed path twice would type-check and lose gate 0
 * in silence.
 *
 * ## Two gates, and why the second one has to touch the disk
 *
 * A path that survived gate 0 is exempt only if it also passes BOTH:
 *
 *   1. LEXICAL. `canonicalise` (`paths.ts`) collapses `.`, `..` and repeated
 *      separators AND strips a trailing separator, and the result must match
 *      `RULE_DIR_PATTERNS` under the same `matchesAny` the protected list uses.
 *      This is what makes `rules/` and `rules/../agents/coder.md` non-exempt.
 *   2. FILESYSTEM. The path, resolved through the real filesystem, must still
 *      land strictly inside a real rule directory — and must not be a hard link.
 *
 * ## Gate 1b — the project's own declared entry outranks the flag
 *
 * `RULE_DIR_PATTERNS` says what the flag reaches in fusion's words. Since the
 * C5b loader shipped, a project can also say what it wants protected, and
 * decision `260803-1314` settled whose word wins: the project's. An entry a
 * project added by hand to its own `fusion-guard.json` — `rules/immutable/**`
 * is the record's example — refuses the grant for the paths it names, and the
 * two default rule patterns keep working exactly as they did.
 *
 * Two consequences follow, and both are the reason the rule is a rule rather
 * than a special case. A project that declares `rules/**` FOR ITSELF has the
 * flag stop reaching `rules/` entirely, because it declared exactly that; and
 * "declared" means supplied, never inherited — `projectProtectedMatch` carries
 * that argument, and getting it wrong ends the exemption everywhere at once.
 *
 * The cost the decision record names and accepts: what the flag reaches is no
 * longer answerable from the plugin alone. `rulesWriteRefusalNote` is what pays
 * it back — a refusal here quotes the project entry that caused it.
 *
 * ### Gate 1 runs `canonicalise`; the protection check runs `collapseSegments`
 *
 * TWO FUNCTIONS, deliberately, and the difference is one line wide.
 * `canonicalise` IS `collapseSegments` plus a trailing-separator strip. The
 * protection check calls `collapseSegments` (`guard.ts`, above both checks on
 * the write-tool path); this grant calls `canonicalise`, and is its only
 * caller.
 *
 * The reason they differ is that a trailing separator WIDENS whatever set the
 * path is matched against, and the two sides want opposite things from a wider
 * set: `rules/**` compiles to `^rules/.*$`, whose `.*` matches the empty
 * string. Stripping on the PROTECTION side turns `Edit rules/` into an allow.
 * Not stripping on the GRANT side makes `rm -rf rules/` exempt. The full
 * argument, both directions and the consequence of each, is written at the two
 * definitions in `paths.ts`; read it there rather than unifying them. That
 * unification has been proposed once already — a Turn 1 review offered it as a
 * one-liner — and it would have removed three denials.
 *
 * ### The same asymmetry, in the second dimension: CASE
 *
 * The protection check matches through `matchesAnyFolded`; gate 1 matches
 * through the plain, case-SENSITIVE `matchesAny`. Same reasoning, same
 * direction. Folding on the protection side denies more, and it closes a
 * measured bypass — on a case-insensitive filesystem `Edit AGENTS/coder.md`
 * wrote `agents/coder.md` and allowed. Folding HERE would hand the grant to a
 * spelling `RULE_DIR_PATTERNS` does not name.
 *
 * Case is not this gate's question anyway. Gate 2 resolves through
 * `realpathSync.native`, which applies the platform's OWN folding, so where the
 * filesystem is case-insensitive the kernel has already answered it — and where
 * the filesystem is case-sensitive, `RULES/x.md` is a different file and the
 * grant should not cover it. The visible consequence, stated rather than
 * discovered: with the flag set, `Edit RULES/x.md` DENIES while
 * `Edit rules/x.md` allows, on a filesystem where both name one file. The
 * protected set widened and the exempt set did not.
 *
 * A second reason `isProjectRulePath` canonicalises for itself rather than
 * trusting its caller to have done it: the Bash surface hands over operands
 * nobody collapsed. `guard.ts` collapses the write-tool path above both checks,
 * but the classifier's own `path.normalize` keeps a trailing separator, so
 * `rm -rf rules/` arrives here spelled exactly that way. A predicate that
 * trusted its caller would be right on one surface and wrong on the other.
 *
 * Gate 1 alone is not a boundary, and the reasoning that said it was is worth
 * naming because it is nearly right. Everywhere else in the guard a symlink
 * lets a write ESCAPE protection: a residual of a text classifier, and one the
 * protected-path check still carries. Here a symlink let a write ACQUIRE A
 * GRANT, which is an escalation, and a grant has to answer for it.
 *
 * The measured consequence: `ln -s ../ rules/up` is a write to a rule path, so
 * gate 1 exempts it; afterwards every path spelled `rules/up/…` still matches
 * `rules/**` while the write lands anywhere in the project. Two commands turned
 * the flag into a write-anywhere primitive, `agents/**`, `hooks/config.json`
 * and the guard's own `.guard-state/` included — precisely the set the section
 * above promises it does not reach.
 *
 * Canonicalisation cannot fix that, in any spelling: membership is decided on
 * text while the write follows the link. Only asking the filesystem can, which
 * is what gate 2 does.
 *
 * ## What gate 2 checks, and the two things it cannot see
 *
 * `FsLocator.locate` resolves symlinks (and, on a case-insensitive filesystem,
 * the platform's own path folding) for as much of the path as exists, then
 * re-appends the part that does not — a rule file usually has to be CREATED, so
 * a resolver that failed on a non-existent path would refuse every new rule.
 * The result must sit strictly under the resolved location of `rules/` or
 * `.claude/rules/`. A project whose `rules/` is itself a symlink into a shared
 * repository therefore still works: its whole subtree resolves inside the
 * resolved rule directory.
 *
 * A HARD LINK is the case realpath cannot see — `cp -l hooks/config.json
 * rules/copy` gives a protected inode a second name inside the rule directory,
 * and both names resolve to themselves. So the grant is also refused for an
 * existing regular file with more than one link. Directories are excluded from
 * that test (every directory has at least two links) and so are symlinks, which
 * gate 2's resolution already handles.
 *
 * The residuals, stated rather than implied: a link created between this check
 * and the write it authorises (a race no agent driving one tool call at a time
 * can run), and a filesystem-level alias the OS itself hides from `realpath`,
 * such as a bind mount.
 *
 * ## Refusing the grant is always the safe direction
 *
 * Every failure here — an unresolvable path, a throwing `realpath`, a missing
 * rule directory — returns false, and false means "not exempt", which leaves
 * the path exactly as protected as it was. The exemption is only ever consulted
 * for a path the protected list already matched, so this predicate fails closed
 * for free: it can refuse a write the user meant to allow, and it cannot allow
 * one the guard would otherwise have blocked.
 *
 * ## Saying WHY it refused
 *
 * A refusal that fails safe can still fail the user. With the flag set, both a
 * hard-linked rule file and a `..` spelling produced a deny BYTE-IDENTICAL to
 * the one the same write gets with the flag unset — naming, in the gate-0 case,
 * a file the flag does let the agent write. Nothing separated "the flag is not
 * set" from "the flag is set and this path is refused for a reason about its
 * inode that no message names", and the two documented responses to that are
 * both bad: conclude the flag is broken, or rephrase until something goes
 * through. `rules/protected-path-discipline.md` exists because of the second.
 *
 * So the gates report WHICH one refused, not just that one did.
 * `rulesWriteRefusal` is the whole decision — null when the grant holds, a
 * `RulesWriteRefusal` when it does not — and `isProjectRulePath` is that
 * function read as a boolean. `rulesWriteRefusalNote` turns a refusal into the
 * sentence a caller appends to its deny reason. No verdict changes; only what
 * the user is told about one.
 *
 * Two properties of the reporting are deliberate:
 *
 *   - **A path that is not a rule path at all gets NO note.** The ordinary
 *     protected-path deny is complete for `agents/coder.md`, and a note there
 *     would advertise a grant that does not apply. This is also why the check
 *     ORDER inside `rulesWriteRefusal` puts gate 1's membership test above gate
 *     0's spelling test, where the numbering has it the other way round: for
 *     `x/../agents/coder.md`, "the flag does not cover `..` spellings" is true
 *     and useless, and reads as an invitation to try again without the `..` —
 *     which would deny too, for the reason the plain deny already gave. Both
 *     are pure-text gates and both refuse, so the boolean is untouched by the
 *     order; gate 0 still runs strictly ABOVE the filesystem gate, which is the
 *     property that matters.
 *   - **The notes never read as a workaround.** Only the gate-0 note names an
 *     action ("write it without the `..`"), because there the path really is a
 *     rule file the agent may write and dropping the `..` is the correct
 *     instruction rather than a rephrasing. The others say the rephrasing will
 *     not help and send the reader to the user, which is what
 *     `rules/protected-path-discipline.md` asks for.
 */
/** The environment variable that activates the exemption. Named for diagnostics. */
export declare const RULES_WRITE_ENV = "FUSION_ALLOW_RULES_WRITE";
/**
 * The rule directories the flag exempts, as globs in the same dialect as
 * `guard.protectedPaths`.
 *
 * Both roots are LIVE. `.claude/rules/**` stood here before it was protected —
 * a deliberate no-op at the time, since the exemption is consulted only for a
 * path the protected list already matched — and it was written that way so the
 * grant would be correct the moment
 * `shared/issues/260801-1020_*_guard-protects-rules-but-not-claude-rules.md`
 * closed. It has closed: `guard.protectedPaths` names both rule roots, so a
 * path under `.claude/rules/` is protected exactly as one under `rules/` is,
 * and this flag reaches exactly as far into each.
 *
 * `rules/retired/` needs no pattern of its own — it is inside `rules/`.
 */
export declare const RULE_DIR_PATTERNS: readonly string[];
/**
 * The rule directories themselves, derived from the patterns above so the two
 * cannot drift: gate 2 resolves these, gate 1 matches those, and a rule root
 * added to one is added to the other.
 */
export declare const RULE_DIR_ROOTS: readonly string[];
/**
 * The filesystem, as much of it as the exemption needs, injected so this module
 * stays pure and every case stays in-process. `guard.ts` supplies the real
 * implementation (`fs-locator.ts`).
 */
export interface FsLocator {
    /**
     * The absolute real location `path` names — symlinks resolved, and on a
     * case-insensitive filesystem the platform's own folding applied — for as
     * much of the path as exists, with the non-existent remainder appended
     * unchanged. `path` is project-relative or absolute.
     *
     * Returns null only when nothing along the path can be resolved at all.
     * Resolving a path that does not yet exist is REQUIRED, not a convenience: a
     * new rule file has no location until the write creates it.
     */
    locate(path: string): string | null;
    /**
     * Does `path` name an existing REGULAR FILE with more than one name on this
     * filesystem — a hard link? False for a directory (every directory has at
     * least two links), for a symlink (`locate` answers those), and for a path
     * that does not exist.
     */
    hasHardLinks(path: string): boolean;
}
/**
 * Gate 0 — does this spelling walk UP out of wherever it starts?
 *
 * Purely textual, and deliberately cruder than a resolver: ANY `..` segment
 * counts, including one that would have collapsed back inside the rule
 * directory (`rules/a/../x.md`). A grant is a permission, and a permission
 * nobody can check by reading the path is not worth the two characters it
 * saves. Exported because it is the rule, not an implementation detail — see
 * the module docstring for why it is tested on the caller's spelling.
 */
export declare function spellingWalksUp(spelledAs: string): boolean;
/**
 * Gate 1b — did this project DECLARE this path protected in its own
 * `fusion-guard.json`? Returns the entry that names it, so the refusal can quote
 * it back.
 *
 * Decision `260803-1314`, answered option 2 at the plan gate on 2026-08-04: an
 * entry a project added by hand outranks a flag an agent set in a shell. The
 * exempt set is therefore no longer answerable from the plugin alone, which is
 * the cost the record names and accepts.
 *
 * ## `projectProtected` is what the project DECLARED, never what it inherited
 *
 * The caller supplies it, and the only correct source is
 * `projectDeclaredProtectedPaths` in `config.ts`, which returns the entries only
 * when `protectedPathsSource === "project"`. This is the trap in the whole
 * change and it is worth stating where the subtraction happens rather than only
 * where the list is built: after `260804-1630` an OMITTED `protectedPaths`
 * inherits the plugin's list, and the plugin's list contains `rules/**`. A
 * caller that handed over the EFFECTIVE list would end the exemption for every
 * project on earth, silently, while every case in this file that does not name a
 * project entry went on passing.
 *
 * ## Matched the way the PROTECTION side matches, not the way the grant does
 *
 * Case is folded, and a directory operand is retried with a trailing separator —
 * both of them protection-side conventions (`matchesAnyFolded` in `paths.ts`
 * folds; `shouldDescend` in `protected-snapshot.ts` retries the trailing
 * separator), and neither of them gate 1's. The asymmetry that runs
 * through this module decides it: a wider match here REFUSES more, so it is the
 * safe direction, and the two spellings it buys are both real. Without the fold,
 * a project declaring `rules/Immutable/**` loses its own entry to `RULES/…` on
 * the case-insensitive filesystem where they are one file. Without the retry,
 * `rm -rf rules/immutable` deletes the subtree a project declared immutable: the
 * protection side matched it by retrying the trailing separator, and this side
 * would have handed the grant to the bare directory name.
 */
export declare function projectProtectedMatch(canonical: string, projectProtected: readonly string[]): string | null;
/**
 * Why the grant was refused — one value per gate that can refuse it.
 *
 * `not-a-rule-path` is the ordinary case and the only one with nothing to
 * explain: the flag names rule files, this is not one, and the protected-path
 * deny already says everything true about it. The other four are the cases
 * where the agent is holding a rule path, has the flag set, and is denied
 * anyway — the ones that read as the flag being broken until something names
 * the cause. See the module docstring, `## Saying WHY it refused`.
 */
export type RulesWriteRefusal = 
/** Gate 1: the canonical path is not inside any rule directory. */
"not-a-rule-path"
/** Gate 1b: the project's own configuration declares this path protected. */
 | "project-protected"
/** Gate 0: the spelling carries a `..` segment. */
 | "spelled-with-dotdot"
/** Gate 2: the file already has a second name on this filesystem. */
 | "hard-link"
/** Gate 2: nothing along the path could be resolved (dangling link, cycle). */
 | "unresolvable"
/** Gate 2: it resolves to a location outside the rule directories. */
 | "resolves-outside";
/**
 * Run every gate and report the FIRST refusal, or null when the path is exempt.
 *
 * `isProjectRulePath` is this function read as a boolean, and the deny reasons
 * on both surfaces are this function read as a sentence. One decision, two
 * readings — a second implementation of the boundary "for the message" is how a
 * message ends up describing a check that no longer exists.
 *
 * `spelledAs` is the path AS THE TOOL CALL GAVE IT, before any normalisation
 * the caller applied to make `path` matchable. Gate 0 reads it and nothing else
 * does. A caller with only one spelling passes it twice; a caller that
 * collapsed the path first — which both real surfaces do — passes the
 * uncollapsed original, or gate 0 has nothing left to see.
 *
 * `projectProtected` is the entries THIS PROJECT declared in its own
 * `fusion-guard.json` — never the effective list, which after `260804-1630`
 * inherits the plugin's `rules/**` for a project that declared nothing. See
 * `projectProtectedMatch`. A project that declared none passes an empty list and
 * gets the exemption exactly as it did before decision `260803-1314`.
 *
 * ORDER: gate 1's membership test runs first although it is numbered second, and
 * gate 1b runs second although it is the newest. All three of gates 0, 1 and 1b
 * are pure text and all three refuse, so which is asked first cannot change the
 * verdict — only which refusal is reported, and each ordering choice is about
 * pointing the reader at the cause they can act on:
 *
 *   - gate 1 above gate 0, because "the flag does not cover `..`" about a path
 *     the flag would not cover anyway reads as an invitation to try again
 *     without the `..`, which would deny too.
 *   - gate 1b above gate 0, for the same reason one step further. A project
 *     entry is the cause that does not go away, and gate 0's note is the one
 *     note in this module that tells the reader to change the path.
 *
 * Gate 0 still runs strictly above the FILESYSTEM gate, which is the ordering
 * that is load-bearing: a `..` spelling must never reach a resolver that has
 * already lost the component deciding where it lands.
 */
export declare function rulesWriteRefusal(path: string, fs: FsLocator, spelledAs: string, projectProtected: readonly string[]): RulesWriteRefusal | null;
/**
 * Is this a project rule path — a file inside `rules/` or `.claude/rules/`,
 * including inside `retired/`?
 *
 * Every gate must hold; see the module docstring.
 *
 * ## What the flag reaches
 *
 * Everything INSIDE a rule directory is exempt, whole subtrees included. A
 * curation job that clears out and rewrites the rule set is what the flag is
 * for, so a deletion inside `rules/` is left standing like a rewrite is — the
 * retirement archive the flag exists to POPULATE included, which is the one
 * outcome a curator would least expect it to allow. That reach is stated here
 * so it is a known reach rather than a discovered one.
 *
 * The question is asked once per FILE, never about a directory node. Both
 * callers hand over a file path and can hand over nothing else: `guard.ts`
 * CHECK 2 passes the write tool's target, and the measurement enumerates the
 * protected set with `enumerateProtected`, which records only entries that are
 * files. A bare `rules` therefore never reaches these gates in any spelling,
 * and the reach of a command that empties the directory is the union of the
 * answers given for the files it touched.
 *
 * Gate 0 narrows the exempt set by one further class: any spelling carrying a
 * `..` segment is refused, so a write spelled `rules/a/../retired/x.md` is
 * refused the grant while `rules/retired/x.md` gets it. It removes a spelling,
 * not a reach.
 *
 * (The reach is the same in both rule roots. `.claude/rules/**` is on the
 * protected list, so a path under it is measured, denied and exempted exactly
 * as one under `rules/` is — see `RULE_DIR_PATTERNS`.)
 */
export declare function isProjectRulePath(path: string, fs: FsLocator, spelledAs: string, projectProtected: readonly string[]): boolean;
/**
 * Gate 1 and gate 1b, and no others — the exemption as the MEASUREMENT side has
 * to ask it.
 *
 * `tracker.ts` does not hold a path a tool call spelled. It holds a path at
 * which the guard's own enumeration found a file whose content changed. Three of
 * the gates above have no subject left in that question, and each is dropped
 * because it has nothing to be about — not because this side is more trusting.
 *
 *   - GATE 0 (`spellingWalksUp`) compares a spelling against the collapsed path
 *     it produced. Here there is only one path and nobody spelled it:
 *     `enumerateProtected` builds each one from `readdirSync` entries joined to
 *     the walk's own prefix, and the literal patterns come from the
 *     configuration. Neither can yield a `..` segment, and there is no second
 *     spelling for the gate to hold against the first.
 *
 *   - GATE 2, SYMLINKS. The write-tool gates ask where a write WOULD land,
 *     because that answer decides whether granting is safe. Here the write has
 *     already happened and its effect is what was measured — and
 *     `enumerateProtected` never descends a symlink and never reports one as a
 *     protected path. A link planted in a rule directory to reach
 *     `hooks/config.json` therefore produces no rule-path observation to exempt.
 *     What it produces is an observation of `hooks/config.json`, at its own
 *     name, which this function does not exempt.
 *
 *   - GATE 2, HARD LINKS. The same answer, and the stronger one. A hard link
 *     gives a protected inode a second name inside `rules/`; a write through
 *     either name changes the file under BOTH. The measurement watches every
 *     protected path at the name its own pattern gives it, so the change is seen
 *     — and refused — as `hooks/config.json`, whatever it is also seen as inside
 *     `rules/`. There is nothing for a hard-link gate here to prevent.
 *
 * What remains is what the flag actually means: is this a rule path (gate 1),
 * and did the project take the grant back in its own `fusion-guard.json` (gate
 * 1b, decision `260803-1314`)? Both are pure text, and both are asked here
 * exactly as `rulesWriteRefusal` asks them, `canonicalise` included — a
 * predicate that trusted its caller to have canonicalised is the mistake that
 * module docstring already records.
 *
 * `projectProtected` is what the project DECLARED — `projectDeclaredProtectedPaths`
 * and nothing else. The effective list inherits the plugin's `rules/**` and
 * would end the exemption in every project on earth. The same trap as on the
 * write side, and it looks just as right.
 *
 * NOT `isProjectRulePath(path, fs, path, declared)`. `guard.ts` names that call
 * shape — the collapsed path handed over as `spelledAs` too — as the one that
 * type-checks while silently reopening gate 0's escape, and a second call site
 * wearing that shape is how the shape becomes ordinary. Here it would also run
 * two filesystem gates on a question with no filesystem in it.
 *
 * A refusal here needs no note. `rulesWriteRefusalNote` exists because an agent
 * met a DENY it could not explain and rephrased its way around it; a measurement
 * that declines to exempt produces the ordinary protected-path message, which is
 * already complete.
 */
export declare function isObservedRulePath(path: string, projectProtected: readonly string[]): boolean;
/**
 * The sentence a caller appends to its deny reason when the exemption was
 * active and refused this path — null when there is nothing useful to say.
 *
 * Null in exactly two cases: the path is exempt (no deny to explain), and the
 * path is not a rule path at all (the protected-path deny already said
 * everything true about it). Callers ask this ONLY when they are already
 * denying, so the extra filesystem work it costs is off the allow path.
 */
export declare function rulesWriteRefusalNote(path: string, fs: FsLocator, spelledAs: string, projectProtected: readonly string[]): string | null;
/**
 * One sentence per refusal, exported because the wording is the interface — it
 * is what an agent reads instead of guessing, and it is asserted in the tests
 * by meaning rather than by string equality.
 *
 * Only the gate-0 note tells the reader to change the path, because there the
 * file really is one the flag covers and dropping the `..` is the correct
 * instruction. The rest say plainly that rewriting the command will not help,
 * so the note cannot be read as the workaround `protected-path-discipline.md`
 * is written against.
 */
export declare const REFUSAL_NOTES: Readonly<Record<Exclude<RulesWriteRefusal, "not-a-rule-path" | "project-protected">, string>>;
/**
 * The sentence for the one refusal whose cause is the project's own file.
 *
 * A function rather than a table entry because it QUOTES THE ENTRY. That is the
 * whole obligation decision `260803-1314` puts on this message: a curator who
 * meets the deny has to be able to see that a human decision is refusing them,
 * and which line of which file made it. Without the entry the deny is
 * indistinguishable from the flag being broken, which is the failure this Turn
 * has already spent two findings on.
 *
 * It ends the way the hard-link and symlink notes end, because the situation is
 * the same one: rewriting the path cannot help, and the person who can change
 * the answer is the user.
 */
export declare function projectProtectedNote(pattern: string): string;
/**
 * Did the user set `FUSION_ALLOW_RULES_WRITE`?
 *
 * The accepted spellings are `"1"` and `"true"`, case-insensitive, and nothing
 * else — `isEnvFlagSet` is the same parser the two git overrides use, so a user
 * who knows how `FUSION_ALLOW_BRANCH_SWITCH` behaves already knows how this
 * behaves. `env` is a parameter: this module never reads the ambient
 * environment.
 */
export declare function rulesWriteExemptionActive(env: NodeJS.ProcessEnv): boolean;
/**
 * The advisory message recorded when the exemption lets a write through — the
 * escalation entry's `message` and the `guard_advisory` event's detail, which
 * are deliberately the same string.
 *
 * Shaped like the git override note (`guard.ts` STEP 3): it names the variable
 * that granted the permission and what the permission let through, so a reader
 * of `events.jsonl` sees the cause and not only the effect.
 *
 * The ARTICLE travels with the label. A plural label under a fixed "a
 * protected …" read "a protected rule paths: rules/x.md, rules/retired/" for
 * every multi-path write, which is the first sentence a user sees about the new
 * flag: the Bash surface reaches the plural branch on the flag's headline use,
 * `mv rules/x.md rules/retired/`, which exempts the source and the destination.
 */
export declare function rulesWriteDetail(paths: string[]): string;
