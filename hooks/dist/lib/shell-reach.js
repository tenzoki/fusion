/**
 * The shell REACHABILITY layer — how a segment is reached from the command
 * position before it, read off the shell's grammar rather than off one adjacent
 * operator.
 *
 * Plan step 2 of `circles/260804-1205-shell-reachability-model`.
 *
 * ## The question this module answers, and the one it does not
 *
 * `shell-parse.ts` reports a segment's JOINER: the operator standing
 * immediately before it at its own nesting level. That is one character of
 * context, and the shell's reachability rules are not flat. `|` binds tighter
 * than `&&`; a compound command's body is reached on a condition no separator
 * expresses. So `if cd hooks; then rm -rf dist; fi` reaches its body with a
 * `;`, and a consumer reading the joiner concludes it cannot prove the `cd`
 * succeeded — when reaching `then` at all is exactly that proof.
 *
 * This module computes, per segment, the EDGE by which it is reached. It does
 * not decide what an edge means: `bash-mutation-guard.ts` owns that, in one
 * table with one reader. The split is deliberate. A grammar fact ("this body
 * runs only when the condition returned zero") is stable; a policy fact ("so a
 * directory change may be carried across it") is the guard's to state and to be
 * reviewed on.
 *
 * ## Why this is its own module and not part of the parser
 *
 * `command-word.ts:35` imports `resolveWord` from `shell-parse.ts`. A reach
 * layer living INSIDE `shell-parse.ts` and reading `GRAMMAR_PREFIXES` from
 * `command-word.ts` would make the two modules mutually dependent, which
 * `HYG-NO-CYCLES` forbids and which the self-contained `hooks/dist/` build would
 * paper over with initialisation order. A third module importing both keeps the
 * dependency one-way.
 *
 * It buys two things beyond avoiding the cycle:
 *
 *   - **The parser is not edited at all.** `shell-parse.ts` keeps its exports,
 *     its `joiner` semantics and its segmentation, so "the layer cannot change
 *     segmentation" is structural rather than a promise. This module reads the
 *     segment list `parseCommand` already returns and annotates a COPY.
 *   - **The git classifier's insulation gains a module name to forbid.** It
 *     consumes `extractCommandSegments(stripDataRegions(cmd))` and must never
 *     see any of this; a source assertion can now forbid the import outright
 *     rather than enumerate identifiers.
 *
 * This module is PURE and EXPORTED so it is unit-testable without the hook
 * firing. It never touches the filesystem, the environment, or the process.
 *
 * ## The mechanism: one candidate, one consumption
 *
 * The pass walks the segments of ONE SCOPE left to right, holding a stack of
 * open compound heads and one PENDING edge.
 *
 *   - **The candidate rule.** A segment's leading grammar words imply at most
 *     one CANDIDATE edge for the command position that follows them:
 *     `cond-true` / `cond-false` / `branch` from a body word, `barrier` from
 *     `fi` / `done` / `esac`, and nothing from `{`, `}`, `(`, `!`, `coproc`,
 *     from a body word whose head is already claimed, or from a segment with no
 *     leading grammar word at all. The FIRST candidate-bearing word wins;
 *     later words still move the head stack (`do if cd X` claims the `while`
 *     head with `do` and opens an `if` head, and the command position is
 *     reached by `cond-true`).
 *   - **The consumption rule.** A segment that carries a command word consumes
 *     an edge: its own candidate if it has one, otherwise the pending edge if
 *     one is waiting, otherwise its raw operator's edge. A segment that carries
 *     NO command word runs nothing, types `transparent`, and hands an edge on
 *     to the next command position instead.
 *
 * That pair is what makes a construct classify the same way however its line
 * breaks fall. `if cd X; then W; fi` reaches `W` through a segment that carries
 * both the body word and the command, so it consumes its own `cond-true`. In
 * the four-line spelling the bare `then` runs nothing, types `transparent` and
 * hands `cond-true` on, and `W` — which has no candidate of its own — consumes
 * it instead of falling through to its raw newline. The line break stops
 * mattering, which is the defect the plan's diagram evaluation was written to
 * close.
 *
 * ## What a grammar-only segment hands on, and the one place the plan text was
 * ## under-specified
 *
 * The plan states the hand-on as "its candidate becomes the pending edge, a
 * candidate of nothing clearing any pending edge that was waiting". That is
 * right for every grammar-only segment that CLOSES something and wrong for one
 * that OPENS something, and the brace group is where the difference shows:
 *
 *     false || { cd build; } && rm out.js        # single-line
 *     false || {                                  # multi-line
 *     cd build
 *     } && rm out.js
 *
 * Single-line, `{ cd build` carries the `||` and the mover is unproven. Under a
 * literal reading of the hand-on rule the multi-line spelling gives the bare `{`
 * no candidate, clears the pending edge, and `cd build` falls through to its own
 * newline — which says the mover ran unconditionally. Two spellings of one
 * command, and the difference is in the ALLOW direction. The mirror image costs
 * a deny: `cd hooks && { rm -rf dist; }` carries the directory change and
 * `cd hooks && {`-newline-`rm -rf dist` would not.
 *
 * So the rule implemented here is one clause longer, and the clause is about
 * terminators rather than about braces:
 *
 * > A grammar-only segment hands on its candidate. When it has none, a segment
 * > holding a TERMINATOR hands on nothing (the construct has ended; what
 * > follows is joined by its own operator, and a group's `&&` genuinely proves
 * > the group returned zero), while a segment holding only OPENERS hands on the
 * > edge it would itself have consumed (it adds no condition of its own, so the
 * > command position it opens is reached exactly as the opener was).
 *
 * `fi`, `done` and `esac` never reach that fallback — their candidate is
 * `barrier` — so the terminator clause is `}` and only `}`, which is what the
 * plan's own brace analysis asks for. The refinement can only ever make the
 * multi-line spelling agree with the single-line one; it introduces no edge that
 * the single-line spelling would not also have produced.
 *
 * A HANDED-ON EDGE IS SUBSTITUTED LIKE ANY OTHER when the segment handing it on
 * is itself a pipeline element. `echo hi | { <nl> cd build <nl> } && rm out.js`
 * is the shape: the `{` carries the `|` and `cd build` does not, so the flat
 * membership test cannot see that the body inside the group runs in the
 * pipeline's subshell too. Substituting the handed-on edge is what carries that
 * fact to the command position, and without it the two spellings split on
 * exactly the question the pipeline rows exist to answer — whether the mover
 * moved the CALLING shell.
 *
 * ## A COMPOUND COMMAND CAN ITSELF BE A PIPELINE ELEMENT, and what that changes
 * ## is the element's EXIT — not its interior
 *
 * `{ cd build; } | grep x && rm out.js` segments as `{ cd build` / `}` /
 * `grep x` / `rm out.js`, and the flat membership test above sees no `|` on
 * either of the first two: the `|` stands after the group, and the segment it
 * touches (`}`) runs nothing. So the mover typed `start`, which carries, and
 * the model followed a directory change into a shell that never took one. The
 * same hole opens under every compound head, because none of them puts the `|`
 * next to the mover: `if … fi | …`, `while … done | …`, `until … done | …`,
 * `for … done | …`, `case … esac | …`, and a group nested in a group.
 *
 * Three measurements decide the shape of the repair, and they are unanimous
 * across bash and zsh (`__tests__/shell-reach.test.ts` names each row):
 *
 *   1. `{ cd build; } | cat && pwd` prints the ROOT. A compound command that is
 *      a pipeline element runs in a subshell, so its directory changes do not
 *      reach what follows the pipeline. The proof that this is not academic:
 *      `{ cd build; } | cat && rm rules/x.md` DELETES `rules/x.md` in both
 *      shells, because the write resolves from the root the shell never left.
 *   2. `{ cd rules; rm x.md; } | cat` deletes `rules/x.md` in both shells. So
 *      INSIDE the element the directory change is entirely real, and typing the
 *      interior as "in a pipeline, nothing moves" would claim the write landed
 *      at the root and allow it. This is why the fact does not reach every
 *      segment of the element — the evaluation's first option is what row 2
 *      refutes.
 *   3. `{ cd build; } && pwd` prints `<root>/build`. The same `}` must keep
 *      carrying when the group is NOT a pipeline element, so the rule cannot be
 *      about closing braces; it has to ask whether the element is piped.
 *
 * Together those say the subshell fact is a property of the ELEMENT and it
 * lands at the element's closing boundary:
 *
 * > The segment that CLOSES a compound command which is an element of a
 * > multi-element pipeline types `pipe-exit`. Every segment INSIDE the element
 * > keeps the edge it would have had if the element were not piped.
 *
 * The interior keeps its ordinary edges because inside the subshell the shell
 * really is standing where the interior's own movers put it (row 2); the
 * closing segment stops carrying because at that point the subshell ends and
 * every change inside it is discarded (rows 1 and 3). It is neither "every
 * segment of the element" nor "the segment the operator touches" — the latter
 * is right only for an element in HEAD position, where the `}` happens to
 * precede the `|`, and wrong for one in TAIL position (`echo hi | { cd rules; }
 * && rm x.md`), where the `|` touches the OPENING segment and the boundary that
 * matters is still the `}`.
 *
 * `pipe-exit` is the pessimistic row where the shells disagree, which is the
 * house rule (`JoinerFacts` in `bash-mutation-guard.ts` states it): zsh runs the
 * LAST element of a pipeline in the calling shell, so a tail-position group's
 * `cd` really does survive there. Refusing to carry is right for bash and
 * over-cautious for zsh, and over-cautious is the direction the guard takes.
 *
 * Two exclusions, both deliberate. `(` / `)` are NOT span delimiters here: the
 * guard already saves and restores its whole directory model on paren counts
 * (`parenCounts` in its walk), and `( cd rules ) && rm x.md` is measured to
 * allow correctly today — adding parens here would model the same containment
 * twice. And an element whose opener is never closed leaves its span open; the
 * scope drops it, so an unbalanced fragment falls through to the flat answer.
 *
 * ## Per scope
 *
 * The pending edge, the head stack, the SPAN stack and pipeline membership are
 * properties of one nesting depth. Entering a `$(…)` body starts them fresh and
 * leaving it drops them, mirroring what the guard's own walk already does with
 * its directory model. Without that, a grammar word inside a command
 * substitution would hand an edge to a segment outside it, and a `{` inside one
 * would be closed by a `}` outside it.
 *
 * ## The pass resolves, the table states
 *
 * Every inheritance in this model is resolved HERE into one of the literal
 * edges below — the pipeline member's carry answer into `pipe-member` or
 * `pipe-unproven`, the propagation through a grammar-only segment into whatever
 * edge it hands on. So the guard's facts table stays one row per edge with two
 * constant fields, and no row's answer depends on another segment.
 *
 * ## The fallback IS the containment property
 *
 * An edge this layer cannot type falls through to the raw operator, which is
 * what the flat model answered before it existed. A `for` body, a `case` arm, a
 * function body, a construct nobody has thought of: all of them reach the third
 * clause of the consumption rule. Only shapes positively recognised here can
 * move a verdict.
 */
import { ENV_ASSIGNMENT_RE, GRAMMAR_PREFIXES, GRAMMAR_TERMINATORS, findCommandWord, } from "./command-word.js";
import { tokenize } from "./shell-parse.js";
/** Every edge, in table order. Exported so a consumer can drive a test off it. */
export const SEGMENT_REACHES = [
    "start",
    "and",
    "seq",
    "or",
    "cond-true",
    "cond-false",
    "branch",
    "barrier",
    "transparent",
    "pipe-member",
    "pipe-unproven",
    "pipe-exit",
];
/**
 * Which edges carry a directory change forward, as far as THIS module needs to
 * know it — and it needs to know it for exactly one decision: whether the
 * members of a multi-element pipeline are `pipe-member` or `pipe-unproven`.
 *
 * A DELIBERATE, BOUNDED DUPLICATION of the `carriesCdForward` column of
 * `REACH_FACTS` in `bash-mutation-guard.ts`. The pipeline substitution is an
 * inheritance the pass has to resolve before the table is consulted (see "the
 * pass resolves, the table states"), so the pass cannot read the table without
 * the guard importing this module and this module importing the guard. The two
 * must agree, and the agreement is one assertion the guard's suite can make
 * once `REACH_FACTS` exists — pin it there rather than trusting this comment.
 *
 * `pipe-member` and `pipe-unproven` are absent because they cannot be asked
 * about: a pipeline HEAD is never itself a substituted row. `pipe-exit` is
 * absent for the opposite reason — it CAN be asked about, because a compound
 * element's closing segment is the head of the pipeline that follows it
 * (`{ cd a; } | cat`: `cat`'s head is the `}`), and the answer has to be no.
 * That is the whole content of the row: the subshell ended, so nothing carries
 * out of it.
 */
export const CARRYING_EDGES = new Set([
    "start",
    "and",
    "cond-true",
    "transparent",
]);
/**
 * The reserved words that OPEN a compound command, for the purpose of finding
 * where that command ENDS.
 *
 * A THIRD set, kept here rather than in `command-word.ts`, because it answers a
 * question neither set there asks. `GRAMMAR_PREFIXES` is "which words are
 * skipped when looking for the command"; `GRAMMAR_TERMINATORS` is "which words
 * end a construct". This is "which words BEGAN the construct a terminator
 * ends", and it is a reach-layer concern with one reader.
 *
 * It is deliberately NOT `GRAMMAR_PREFIXES` minus the bodies:
 *
 *   - `for`, `case` and `select` are here and are in no set in
 *     `command-word.ts` at all, because they introduce a NAME rather than a
 *     command. The reach layer still does not model their bodies — a `for`
 *     body's `do` finds no head to claim and falls through, exactly as before —
 *     but it has to know they opened something, or the `done` / `esac` that
 *     closes them pops an ENCLOSING construct and reports its boundary at the
 *     wrong segment. `for … done | cat && rm rules/x.md` and
 *     `case … esac | cat && rm rules/x.md` both delete `rules/x.md` in both
 *     shells, so this is not a tidiness point.
 *   - `elif` is absent: one `if … fi` is one span, and letting `elif` open a
 *     second would have `fi` close the arm and leave the `if` open.
 *   - `(` is absent because the guard already contains a paren subshell by
 *     saving and restoring its directory model on paren counts.
 *   - `then`, `else`, `do`, `!` and `coproc` open nothing.
 */
export const SPAN_OPENERS = new Set([
    "{",
    "if",
    "while",
    "until",
    "for",
    "case",
    "select",
]);
/**
 * The openers that introduce a NAME, so `findCommandWord` and `readHead` both
 * stop AT them instead of walking past them.
 *
 * They are found by one peek at the word the prefix scan stopped on, which is
 * what keeps `echo for` from opening a span: a reserved word is only reserved in
 * command position, and after `echo` this is not one.
 */
const WORD_HEAD_OPENERS = new Set(["for", "case", "select"]);
function freshScope() {
    return { heads: [], pending: null, spans: [] };
}
/**
 * The edge a raw operator names on its own.
 *
 * `|` maps to `pipe-unproven` rather than to a raw row, and the mapping is
 * unreachable by construction: a segment whose joiner is `|` always has a
 * same-level segment before it, so it is always a member of a multi-element
 * pipeline and always substituted. The row exists so that if it ever DID become
 * reachable it would answer no to both of the guard's questions, which is what
 * `|` answers today.
 */
function rawEdge(joiner) {
    switch (joiner) {
        case "start":
            return "start";
        case "&&":
            return "and";
        case "||":
            return "or";
        case ";":
        case "&":
        case "newline":
            return "seq";
        case "|":
            return "pipe-unproven";
    }
}
/**
 * Split a segment into its leading grammar words and whatever follows.
 *
 * The terminator skip is the whole reason `GRAMMAR_TERMINATORS` exists.
 * `findCommandWord` walks past `GRAMMAR_PREFIXES` and NOT past the terminators,
 * because a terminator is never followed by a command in the same position and
 * skipping it there would change what both classifiers read as the command. So
 * a bare `fi` reaches `findCommandWord` as the command word `fi` — correct for
 * that function and wrong for this question. This module consumes the
 * terminators itself and asks `findCommandWord` about the REST, which keeps
 * "which word is the command" answered in one place.
 *
 * A quoted word is not grammar: capture mode has already replaced `'then'` with
 * an opaque placeholder, so it stops the scan as an ordinary command word. That
 * is what bash does too — quoting suppresses reserved-word recognition.
 */
function readHead(words) {
    const grammar = [];
    const spanEvents = [];
    let closes = false;
    let i = 0;
    while (i < words.length) {
        const w = words[i];
        if (ENV_ASSIGNMENT_RE.test(w)) {
            i++;
            continue;
        }
        if (GRAMMAR_TERMINATORS.has(w)) {
            grammar.push(w);
            spanEvents.push("close");
            closes = true;
            i++;
            continue;
        }
        if (GRAMMAR_PREFIXES.has(w)) {
            grammar.push(w);
            if (SPAN_OPENERS.has(w))
                spanEvents.push("open");
            i++;
            continue;
        }
        break;
    }
    // The one peek. `for` / `case` / `select` stop the scan above (they introduce
    // a name, not a command), so the only place one can appear in command
    // position is exactly here — and after any other word this is not command
    // position, which is why `echo for` opens nothing.
    if (i < words.length && WORD_HEAD_OPENERS.has(words[i]))
        spanEvents.push("open");
    // `rest` starts with neither an env assignment nor a grammar prefix, so this
    // reports -1 exactly when it is empty. The call is kept rather than replaced
    // by a length check so that a future change to what counts as a command word
    // reaches this module too.
    return {
        grammar,
        closes,
        hasCommand: findCommandWord(words.slice(i)) !== -1,
        spanEvents,
    };
}
/** The topmost head no body word has claimed yet, or undefined. */
function topUnclaimed(heads) {
    for (let i = heads.length - 1; i >= 0; i--) {
        if (!heads[i].claimed)
            return heads[i];
    }
    return undefined;
}
/** Pop heads down to and including the innermost one `word` closes. */
function popTo(heads, closes) {
    for (let i = heads.length - 1; i >= 0; i--) {
        if (closes(heads[i])) {
            heads.length = i;
            return;
        }
    }
    // Nothing to close — an `esac` (no `case` head is modelled) or an unbalanced
    // fragment. Leaving the stack alone is the conservative answer: a head that is
    // still open can only ever be claimed by a body word that really follows it.
}
/**
 * Apply one segment's leading grammar words to the head stack and read off the
 * candidate edge they imply for the command position that follows.
 *
 * The first candidate-bearing word wins; every word still moves the stack.
 */
function readCandidate(grammar, heads) {
    let candidate = null;
    for (const word of grammar) {
        // The first candidate-bearing word wins. Later words still move the head
        // stack, which is what `do if cd X` needs: `do` claims the `while` head and
        // types the command position, `if` opens a head for the `then` to come.
        let proposed = null;
        switch (word) {
            case "if":
            case "while":
            case "until":
                heads.push({ word, claimed: false });
                break;
            case "elif":
                // An `elif` CONDITION is reached only when the branch above it failed,
                // so it is a `branch`; the head it opens is claimed by its own `then`.
                heads.push({ word: "elif", claimed: false });
                proposed = "branch";
                break;
            case "then": {
                const head = topUnclaimed(heads);
                if (head !== undefined && (head.word === "if" || head.word === "elif")) {
                    head.claimed = true;
                    proposed = "cond-true";
                }
                break;
            }
            case "do": {
                const head = topUnclaimed(heads);
                if (head !== undefined && head.word === "while") {
                    head.claimed = true;
                    proposed = "cond-true";
                }
                else if (head !== undefined && head.word === "until") {
                    // The counter-example that keeps the work honest. An `until` body is
                    // reached when the condition returned NON-zero, so a mover in the
                    // condition is known to have failed and the degrade is correct.
                    head.claimed = true;
                    proposed = "cond-false";
                }
                break;
            }
            case "else":
                proposed = "branch";
                break;
            case "fi":
                popTo(heads, (h) => h.word === "if");
                proposed = "barrier";
                break;
            case "done":
                popTo(heads, (h) => h.word === "while" || h.word === "until");
                proposed = "barrier";
                break;
            case "esac":
                proposed = "barrier";
                break;
            // `{`, `}`, `(`, `!`, `coproc` — no head, no candidate. `}` is not a
            // `barrier`: a group's status IS its last command's status, so an `&&`
            // after `}` genuinely proves the group returned zero.
            default:
                break;
        }
        if (candidate === null)
            candidate = proposed;
    }
    return candidate;
}
/**
 * Index of the previous segment at the same depth, or -1.
 *
 * A nested `$(…)` body's segments are contiguous and sit between the segments
 * of the scope that contains them, so scanning past DEEPER segments and
 * stopping at a shallower one lands on the right neighbour. Both directions are
 * needed: the pipeline run a segment belongs to reaches backwards to its head
 * and forwards to decide membership.
 */
function prevAtDepth(segments, i) {
    const depth = segments[i].depth;
    for (let k = i - 1; k >= 0; k--) {
        if (segments[k].depth === depth)
            return k;
        if (segments[k].depth < depth)
            return -1;
    }
    return -1;
}
/** Index of the next segment at the same depth, or -1. */
function nextAtDepth(segments, i) {
    const depth = segments[i].depth;
    for (let k = i + 1; k < segments.length; k++) {
        if (segments[k].depth === depth)
            return k;
        if (segments[k].depth < depth)
            return -1;
    }
    return -1;
}
/**
 * Is this segment an element of a MULTI-element pipeline?
 *
 * Either it follows a `|`, or the next segment at its level does. A single
 * command is not a pipeline, which is why both directions are asked: the HEAD
 * of `cd build | cat` carries no `|` of its own and is nonetheless subshelled.
 */
function inPipeline(segments, i) {
    if (segments[i].joiner === "|")
        return true;
    const next = nextAtDepth(segments, i);
    return next !== -1 && segments[next].joiner === "|";
}
/**
 * Is the compound command spanning segments `start`..`end` an element of a
 * multi-element pipeline?
 *
 * The two directions are the same two `inPipeline` asks, lifted from a single
 * segment to a whole extent — and lifting them is the entire repair. An element
 * in HEAD position (`{ cd build; } | cat`) carries the `|` on the segment AFTER
 * its close; one in TAIL position (`echo hi | { cd build; }`) carries it on its
 * OPENING segment. Asking only one direction leaves whichever position it does
 * not cover typing as if the shell had moved.
 */
function spanIsPipelineElement(segments, start, end) {
    if (segments[start].joiner === "|")
        return true;
    const after = nextAtDepth(segments, end);
    return after !== -1 && segments[after].joiner === "|";
}
/** Index of the first element of the pipeline run `i` belongs to. */
function pipelineHead(segments, i) {
    let head = i;
    for (;;) {
        if (segments[head].joiner !== "|")
            return head;
        const prev = prevAtDepth(segments, head);
        if (prev === -1)
            return head;
        head = prev;
    }
}
/**
 * Annotate every segment with the edge by which it is reached.
 *
 * Returns a NEW array of new objects; the input segments are not mutated and
 * their `joiner` keeps its meaning. Order and count are the parser's, exactly.
 */
export function annotateReach(segments) {
    /** One state per open nesting depth; index is the depth. */
    const scopes = [];
    /**
     * Each segment's edge BEFORE the pipeline substitution. A pipeline member
     * reads its head's entry here, which is why the substitution is applied to a
     * separate output array rather than in place.
     */
    const consumed = [];
    const out = [];
    for (let i = 0; i < segments.length; i++) {
        const segment = segments[i];
        const depth = segment.depth;
        // Leaving a `$(…)` body drops its pending edge, its open heads and its open
        // spans; entering one starts all three fresh. Re-entering a depth later
        // starts fresh again, because the scopes above it were dropped on the way
        // out.
        if (scopes.length > depth + 1)
            scopes.length = depth + 1;
        while (scopes.length < depth + 1)
            scopes.push(freshScope());
        const scope = scopes[depth];
        const head = readHead(tokenize(segment.text));
        const candidate = readCandidate(head.grammar, scope.heads);
        // Move the span stack, and note whether this segment is the point at which
        // a piped compound command's subshell ends. Only the extent CLOSING here is
        // asked: a nested construct that ends earlier inside the same subshell is
        // an ordinary construct, and it is the OUTERMOST close that discards.
        let exitsPipeline = false;
        for (const event of head.spanEvents) {
            if (event === "open") {
                scope.spans.push(i);
                continue;
            }
            const start = scope.spans.pop();
            // No open span — an `esac` with no modelled `case`, or an unbalanced
            // fragment. Claiming no boundary is the conservative answer: the segment
            // keeps whatever edge it would otherwise have had.
            if (start !== undefined && spanIsPipelineElement(segments, start, i)) {
                exitsPipeline = true;
            }
        }
        let reach = exitsPipeline
            ? "pipe-exit"
            : head.hasCommand
                ? (candidate ?? scope.pending ?? rawEdge(segment.joiner))
                : "transparent";
        // Recorded BEFORE the substitution below, because a pipeline member reads
        // its head's edge from here and the head's own row is an output of the
        // substitution rather than an input to it.
        consumed.push(reach);
        /**
         * The pipeline substitution, applied LAST because a pipeline head can
         * itself lead with a body word.
         *
         * It applies to the head as well as to the tail: bash subshells EVERY
         * element of a multi-element pipeline, so `cd build | cat && rm out.js`
         * must not be read as having moved the calling shell.
         */
        const pipelineRow = () => {
            const headEdge = consumed[pipelineHead(segments, i)];
            return CARRYING_EDGES.has(headEdge) ? "pipe-member" : "pipe-unproven";
        };
        const member = inPipeline(segments, i);
        if (head.hasCommand) {
            scope.pending = null;
            // `exitsPipeline` wins over the substitution. No valid shell puts a
            // command in the same segment as the terminator that closes a compound,
            // so this guard is unreachable on well-formed input — and on ill-formed
            // input the boundary answer is the cautious one.
            if (member && !exitsPipeline)
                reach = pipelineRow();
        }
        else {
            // Runs nothing. What it hands on is the whole of the multi-line repair —
            // see "what a grammar-only segment hands on" in the module docstring.
            let handOn = candidate ?? (head.closes ? null : (scope.pending ?? rawEdge(segment.joiner)));
            // A grammar-only segment keeps typing `transparent` — it runs nothing, so
            // there is nothing for a subshell to contain. But when the segment that
            // OPENS a construct is a pipeline element, the whole construct is that
            // element, and the flat membership test cannot see that the body inside
            // it is too. `echo hi | { <nl> cd build <nl> } && rm out.js` is the shape:
            // the `{` carries the `|`, `cd build` does not, and without carrying the
            // pipeline row across the hand-on the multi-line spelling would say the
            // mover moved the calling shell where the single-line one says it did not.
            if (handOn !== null && member)
                handOn = pipelineRow();
            scope.pending = handOn;
        }
        out.push({ text: segment.text, depth: segment.depth, joiner: segment.joiner, reach });
    }
    return out;
}
