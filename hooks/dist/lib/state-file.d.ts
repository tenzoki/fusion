/**
 * `fusion-workbench/agentstate.yaml`, read once and asked field by field.
 *
 * ## Why this is its own module
 *
 * Two measurements ask the session state file questions —
 * `lib/review-coverage.ts` for the session anchor, `lib/staging-drift.ts` for
 * the session's own history file — and a third asked five of them until
 * 2026-08-15, when the session-state drift measurement was removed with the
 * hand-maintained counters that were its subject. This pair lived in that
 * module and is extracted here rather than deleted with it: the pair is a file
 * reader, not a measurement, and its two surviving importers are unaffected by
 * anything the counters' removal decided.
 *
 * A fourth copy of the same six lines is how a flat read starts disagreeing
 * with itself about what "absent" means, which is the reason the pair was
 * shared in the first place and the reason it stays shared now that its
 * original home is gone.
 *
 * ## Why a file read and a field read rather than one call
 *
 * The split is not decoration. A caller that asks several questions of one file
 * reads it once; a per-field entry point would re-read the file per question.
 * The drift measurement asked five questions on every guarded tool call and was
 * where that mattered most, but the shape is right for the two that remain and
 * for whatever asks next.
 *
 * ## What this module deliberately does not do
 *
 * It parses no YAML, phrases no sentence and writes nothing. `readStateFile`
 * reports the fact that a read failed and leaves the wording to the caller,
 * because only the caller knows whether "no session in progress" or "the state
 * file will not open" is the sentence its reader needs.
 */
/**
 * The session state file, read once.
 *
 * `missing` distinguishes "there is no session in progress" from "there is one
 * and its state file will not open". Both leave the caller without a value, and
 * only the caller knows which sentence to say about it, so this reports the
 * fact and phrases nothing.
 */
export declare function readStateFile(root: string): {
    ok: true;
    text: string;
} | {
    ok: false;
    missing: boolean;
};
/**
 * First value for `key` anywhere in the state file, quotes stripped.
 *
 * Deliberately flat rather than a YAML parse, and deliberately first-match:
 * this is the same reading `agents/orchestrator.md` documents as a `sed`
 * one-liner, so the programs and the prompt cannot disagree about what a field
 * says. Every key it is asked for (`git_head_at_start`, `history_file`) occurs
 * first at the place it means; `work_queue` entries carry `commit`, which is a
 * different key from either.
 */
export declare function stateField(state: string, key: string): string;
