/**
 * The Claude side's write client: one codec mutation per call, after the
 * gate, a `show` of every record it names and, where response 22 asks for
 * it, the ownership check.
 *
 * ## The sequence
 *
 *   repair      rows an earlier call retained are appended first
 *               (`lib/record-change.ts` `repairRetained`). A repair that
 *               failed or left rows retained is reported on the outcome
 *               (`repair`), and the mutation does not wait on it.
 *   gate        `inspect`; only `json-control` admits a write. `legacy` with a
 *               committed `initialize` pending is refused and names Setup,
 *               which finishes it: a mutation sends no `initialize`, no
 *               migration and no retry. `initialize` is Setup's alone, below.
 *   show        the record the mutation names, and each record a request
 *               field is read from (the plan of `adopt-plan`, the evidence of
 *               `attach-evidence`, the targets of `set-dependencies`, the
 *               origin of `create`, the package of `evidence`). Its revision
 *               is the `expected_revision` sent, so the write lands only
 *               against the record this call inspected.
 *   check       ownership, below; and every payload field against the kind
 *               `show` named (`PAYLOAD_FIELDS`).
 *   mutation    one request under a new operation id. The answer is landed,
 *               refused, or unknown; nothing is sent twice.
 *   rows        a landed answer to an id this call minted is logged by
 *               `logObserved`; a re-send's rows by `logResend`, which
 *               composes none.
 *
 * ## Ownership (response 22 (a))
 *
 * For `release` and every `transition` out of `claimed`, the standing claim's
 * `checkout_id` in `show` must equal this checkout's `CHECKOUT=`, read by
 * `bin/fusion-identity` in the wrapper. A request that writes a claim, `claim`
 * or a `transition` into `claimed` or carrying a non-null `--claim`, names this
 * checkout as its `checkout_id`: the rule is the claim field the request
 * writes, not the subcommand, so `transition` is no route past `claim`'s
 * binding. A foreign claim, standing or written, refuses, and so does an
 * identity that cannot be read; no flag overrides either. `release` of a
 * package that is not `claimed` has no claim to check and goes to the codec,
 * which refuses it `conflict/not-claimed`. A write that landed between the
 * `show` and the mutation is `conflict/revision-mismatch`, and nothing is
 * retried. What is not checked,
 * because this host does not have it, is stated in `REQUESTS.md` under
 * "Stated for objection: the Claude side binds a caller by its checkout
 * identity alone". A takeover waits for request 38.
 *
 * ## Payload fields
 *
 * `PAYLOAD_FIELDS` names, per kind, the `transition` payload fields the
 * codec admits for it; `lib/__tests__/record-write.test.ts` holds it equal to
 * the schemas. A field outside the target's kind is a usage error, decided
 * after `show` named the kind and before the mutation is sent.
 *
 * ## Creation
 *
 * `create` files a new pair, and `evidence` a reviewer's evidence record
 * beside its report; both are the codec's `create`, which names no existing
 * record and so takes no `expected_revision`. The caller writes the Markdown
 * half first, at a marker-free name it derives, and names it; the codec
 * writes the control file beside it and refuses a name, store or container
 * that does not agree. The id is a new UUID, the filer `--actor` with this
 * checkout's person, the origin the user's request or the package `--origin`
 * names. A record kind starts at `INITIAL_CONTROL`, held by the test to the
 * one state of its kind no edge of `codec/contract/transitions.json` enters
 * and to the control fields its schema requires; a package's payload is its
 * domain, and the kernel fixes the rest. A plan's steps are read from its
 * narrative by `planSteps`: one `open` anchor per numbered line under
 * `## Implementation Steps`, outside fences, and no criteria, so
 * `transition --steps` has ids to update. A number that occurs twice there
 * is a usage error naming it and its lines: no operation adds an anchor
 * later, so a plan is not filed with a step it cannot track.
 *
 * An evidence record is produced against the package `--record` names:
 * `brief_revision` is its narrative hash in `show`, `plan_revision` the
 * revision of its `role: plan` binding or null. The report's hash is read
 * from its bytes, the workbench id is the gate's, the subject is the
 * project's `HEAD` tree as the call runs, and the role is `--actor` at this
 * plugin's version. Host `claude-code` and policy `claude-guided` are all
 * this host can claim; the verdict is the caller's, and the codec judges it.
 * No `predecessor` is sent, so a second record over one report is
 * `record-exists`.
 *
 * ## A re-send
 *
 * An unanswered mutation may have landed. The caller re-sends it explicitly
 * with the operation id and the fields the unknown outcome printed (the
 * expected revision, `claimed_at` for `claim`, the id for a creation and
 * `accepted_at` for evidence), so the codec sees the same request and answers
 * its stored bytes. An evidence re-send re-reads the brief, the plan, the
 * report and the tree; if one moved, the request differs and the codec
 * answers `conflict/operation-id-reused`. No row is composed for a re-send.
 *
 * ## Initialize, Setup's route to a new workbench
 *
 * `initialize` is the one call that sends `initialize`, and `/fusion:setup`
 * the one caller. It splits on `inspect`, each answer in exactly one row:
 *
 *   json-control (a manifest without the marker too)   reused; nothing sent
 *   legacy, pending not blocked                        the request rebuilt from pending, once
 *   legacy, pending blocked                            stop; corrected by hand
 *   legacy, no pending, `.fusion-setup` present        legacy: Setup runs as before, until FJ04
 *   legacy, no pending, no marker, a fusion store      legacy: a workbench that lost its marker,
 *     (`work-packages`, `circles`, `shared`) present     which Setup's marker block writes again
 *   legacy, no pending, no marker, no fusion store     a new id and operation id, sent once
 *   unsupported                                        stop, naming the diagnosis
 *   refused (pending-initialize-unreadable, -ambiguous
 *     among them) or unanswered                        stop
 *
 * The marker row keeps every workbench Setup wrote before the JSON cutover
 * setting up as it did: it is not empty, so `initialize` would answer
 * `target-not-empty`. The store row keeps such a workbench setting up when
 * its marker is gone, a clone of one whose marker was never committed for
 * one, as Setup did before the cutover; only a target holding no fusion store
 * goes on to `initialize`, so foreign entries alone are refused by name. Both
 * rows read only a target with no pending intent, so neither splits anything
 * the pending rows decide. A refused `initialize`
 * (`target-not-empty` and `manifest-present` name the entries) and an
 * unanswered one stop; nothing is retried, and a Setup run again reads the
 * intent from `pending`. After every answer that landed, `inspect` is asked
 * again and must be `json-control` under the id sent: a replay answers after
 * `workbench.json` was deleted, so the answer alone proves nothing.
 *
 * No automatic hook imports this module or runs `hooks/write.ts`
 * (`lib/record-client.ts` `## The recovery declaration`).
 */
import { type Ask, type Refusal } from "./record-client.js";
import { type LogEvent } from "./record-change.js";
export declare const SUBCOMMANDS: readonly ["claim", "release", "transition", "set-mode", "set-dependencies", "adopt-plan", "attach-evidence", "create", "evidence"];
export type Sub = (typeof SUBCOMMANDS)[number];
/** Per kind, the `transition` payload fields the codec admits; nothing else is sent. */
export declare const PAYLOAD_FIELDS: Readonly<Record<string, readonly string[]>>;
/** Per record kind, the control a new record is created with. */
export declare const INITIAL_CONTROL: Readonly<Record<string, Readonly<Record<string, unknown>>>>;
export interface Identity {
    person?: string;
    checkout?: string;
}
export interface Call {
    sub: Sub;
    workbench: string;
    identity: Identity;
    flags: Map<string, string[]>;
    /** The version an evidence record's role names. Default: this plugin's, from `.claude-plugin/plugin.json`. */
    roleVersion?: string;
}
export type Outcome = ({
    kind: "landed";
    operationId: string;
    revisions: Record<string, string>;
    event: LogEvent;
    detail?: string;
} | {
    kind: "usage";
    detail: string;
}
/** The bundle or the plugin's manifest is missing: nothing was sent. */
 | {
    kind: "install";
    detail: string;
}
/** The workbench, a named record or a file the request binds was not read: nothing was sent. */
 | {
    kind: "unread";
    detail: string;
} | {
    kind: "ownership";
    detail: string;
} | {
    kind: "refused";
    operationId: string;
    refusal: Refusal;
}
/** `resend`: the flags a re-send repeats beside `--operation-id`, with their values. */
 | {
    kind: "unknown";
    operationId: string;
    resend: Record<string, string>;
    detail: string;
}) & {
    /** The repair of retained rows this call ran first, when it failed or left rows retained; `retained` is null when unread. */
    repair?: {
        retained: number | null;
        detail: string;
    };
};
/** The subcommand's flags read from `argv`, or the usage error. Values are opaque here. */
export declare function parseFlags(sub: string, argv: string[]): {
    call: Omit<Call, "workbench" | "identity">;
} | {
    usage: string;
};
/** What Setup's `initialize` call ends in: Setup continues on `ready`, and stops on every other kind. */
export type Init = {
    kind: "ready";
    how: "initialized" | "reused" | "legacy";
    workbenchId: string | null;
    operationId?: string;
} | {
    kind: "install" | "unread" | "refused" | "unknown";
    detail: string;
    operationId?: string;
};
/** The file Setup writes last and every agent walks up to; its presence marks a workbench set up before the JSON cutover. */
export declare const SETUP_MARKER = ".fusion-setup";
/** Setup's one route to a new workbench, by the table of `## Initialize, Setup's route to a new workbench`. */
export declare function initialize(workbench: string, ask: Ask): Init;
/** One write, from the gate to the log. `ask` is the record client's, or a test's stand-in. */
export declare function write(c: Call, ask: Ask, now?: () => Date): Outcome;
