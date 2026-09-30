/**
 * The Claude side's write client: one codec mutation per call, after the
 * gate, a `show` of every record it names and, where response 22 asks for
 * it, the ownership check.
 *
 * ## The sequence
 *
 *   repair      rows an earlier call retained are appended first
 *               (`lib/record-change.ts` `repairRetained`).
 *   gate        `inspect`; only `json-control` admits a write. `legacy` with a
 *               committed `initialize` pending is refused and names Setup,
 *               which finishes it: this client sends no `initialize`, no
 *               migration and no retry.
 *   show        the record the mutation names, and each record a request
 *               field is read from (the plan of `adopt-plan`, the evidence of
 *               `attach-evidence`, the targets of `set-dependencies`). Its
 *               revision is the `expected_revision` sent, so the write lands
 *               only against the record this call inspected.
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
 * For `release` and every `transition` out of `claimed`, and for nothing
 * else, the standing claim's `checkout_id` in `show` must equal this
 * checkout's `CHECKOUT=`, read by `bin/fusion-identity` in the wrapper. A
 * foreign claim refuses, and so does an identity that cannot be read; no flag
 * overrides either. `release` of a package that is not `claimed` has no claim
 * to check and goes to the codec, which refuses it `conflict/not-claimed`. A
 * write that landed between the `show` and the mutation is
 * `conflict/revision-mismatch`, and nothing is retried. What is not checked,
 * because this host does not have it, is stated in `REQUESTS.md` under
 * "Stated for objection: the Claude side binds a caller by its checkout
 * identity alone". A takeover waits for request 38.
 *
 * ## Payload fields
 *
 * `PAYLOAD_FIELDS` names, per kind, the `transition` payload fields the
 * codec reads for it; `lib/__tests__/record-write.test.ts` holds it equal to
 * the schemas. A field outside the target's kind is a usage error, decided
 * after `show` named the kind and before the mutation is sent.
 *
 * ## A re-send
 *
 * An unanswered mutation may have landed. The caller re-sends it explicitly
 * with the operation id and the expected revision the unknown outcome
 * printed (and `claimed_at` for `claim`), so the codec sees the same request
 * and answers its stored bytes. No row is composed for a re-send.
 *
 * No automatic hook imports this module or runs `hooks/write.ts`
 * (`lib/record-client.ts` `## The recovery declaration`).
 */
import { type Ask, type Refusal } from "./record-client.js";
import { type LogEvent } from "./record-change.js";
export declare const SUBCOMMANDS: readonly ["claim", "release", "transition", "set-mode", "set-dependencies", "adopt-plan", "attach-evidence"];
export type Sub = (typeof SUBCOMMANDS)[number];
/** Per kind, the `transition` payload fields the codec reads; nothing else is sent. */
export declare const PAYLOAD_FIELDS: Readonly<Record<string, readonly string[]>>;
export interface Identity {
    person?: string;
    checkout?: string;
}
export interface Call {
    sub: Sub;
    workbench: string;
    identity: Identity;
    flags: Map<string, string[]>;
}
export type Outcome = {
    kind: "landed";
    operationId: string;
    revisions: Record<string, string>;
    event: LogEvent;
    detail?: string;
} | {
    kind: "usage";
    detail: string;
}
/** The bundle is missing: nothing was sent. */
 | {
    kind: "install";
    detail: string;
}
/** The workbench or a named record was not read: nothing was sent. */
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
} | {
    kind: "unknown";
    operationId: string;
    expectedRevision: string;
    claimedAt?: string;
    detail: string;
};
/** The subcommand's flags read from `argv`, or the usage error. Values are opaque here. */
export declare function parseFlags(sub: string, argv: string[]): {
    call: Omit<Call, "workbench" | "identity">;
} | {
    usage: string;
};
/** One write, from the gate to the log. `ask` is the record client's, or a test's stand-in. */
export declare function write(c: Call, ask: Ask, now?: () => Date): Outcome;
