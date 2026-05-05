/**
 * Locate the fusion workbench root for the current process.
 *
 * Walks from the starting directory toward the filesystem root, looking
 * for a directory that contains `fusion-workbench/.fusion-setup`. The
 * marker file is written by `/fusion:setup` and is the single signal that
 * a project has opted in to fusion.
 *
 * If no marker is found, the project is treated as not-fusion-setup and
 * hooks skip their state writes. This prevents stray workbench creation
 * when a Claude session's cwd happens to land in a directory that simply
 * has fusion installed but was never explicitly set up.
 */
import { existsSync } from "node:fs";
import { resolve, dirname } from "node:path";

export function findWorkbenchRoot(
  startDir: string = process.cwd(),
): string | null {
  let current = resolve(startDir);
  while (true) {
    const marker = resolve(current, "fusion-workbench", ".fusion-setup");
    if (existsSync(marker)) return current;
    const parent = dirname(current);
    if (parent === current) return null;
    current = parent;
  }
}
