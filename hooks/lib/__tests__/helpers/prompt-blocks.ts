/**
 * Executable blocks lifted out of agent prompts.
 *
 * Several lints in this directory do not paraphrase what a prompt tells an
 * agent to run — they take the block whole and RUN it, so nothing in the test
 * can drift away from the text the agent would actually execute. That extraction
 * is the one piece those lints share, and it lives here so a change to the
 * block-fencing convention in the prompts is a change in one place.
 */

/**
 * The first ```bash block after the line carrying `anchor`.
 *
 * Deliberately not a regex over the snippet's contents: the block is returned
 * whole, for execution. An anchor that no longer appears, or a block that is
 * missing or unterminated, throws — a lint whose extraction silently returned
 * "" would run an empty script and pass.
 */
export function extractBashBlock(md: string, anchor: string): string {
  const lines = md.split("\n");
  const at = lines.findIndex((l) => l.includes(anchor));
  if (at < 0) throw new Error(`anchor not found: ${anchor}`);
  const open = lines.findIndex((l, i) => i > at && l.trim() === "```bash");
  if (open < 0) throw new Error(`no bash block after: ${anchor}`);
  const close = lines.findIndex((l, i) => i > open && l.trim() === "```");
  if (close < 0) throw new Error(`unterminated bash block after: ${anchor}`);
  return lines.slice(open + 1, close).join("\n");
}
