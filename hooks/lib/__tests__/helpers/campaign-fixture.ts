/**
 * The measured case of plan step 6, `fixtures/campaign/ax-k2-3-261105.json`,
 * built into a JSON workbench through the kernel (`json-workbench.ts`): the
 * pipeline store of the consuming project at `56c19983a`, as far as the
 * overview's two tiers and the cut read it. Shared by
 * `campaign-overview.test.ts` and `campaign-cut.test.ts`; every `_source` key
 * of the file is provenance and is not typed here.
 */

import { readFileSync } from "node:fs";
import { join } from "node:path";
import { pluginRoot } from "./citation-scan.js";
import { claim, createPackage, must, setDependencies, setResources, transition, type JsonProject, type Package } from "./json-workbench.js";

export interface FixtureEntry {
  name: string;
  group: string;
  status: string;
  holder: string | null;
  claim_kept: string | null;
  outcome_class: string | null;
  depends_on: string[];
  areas: string[];
  shared_areas: string[];
}

export interface Fixture {
  packages: FixtureEntry[];
  lanes: Array<{ id: string; checkout: string; members: string[] }>;
  checkouts: Record<string, { alias: string }>;
  log: Array<{ ts: string; checkout: string; detail: string }>;
}

export const fixture = JSON.parse(readFileSync(join(pluginRoot, "hooks", "lib", "__tests__", "fixtures", "campaign", "ax-k2-3-261105.json"), "utf-8")) as Fixture;

/** The group of the dependency table in §3 of the lane analysis: the 23 entries the cut's three cases are built from. */
export const PIPELINE_ANALYSIS = "pipeline-analysis";

export interface BuildOptions {
  /** The entries to create; every entry of the fixture by default. An edge to an entry outside the set is not written. */
  entries?: FixtureEntry[];
  /** The areas written as `resources`; `areas` by default, `shared_areas` written nowhere (ruling B of 2026-11-09). */
  areasOf?: (entry: FixtureEntry) => string[];
  /** Bring each entry to its `status`; true by default. False leaves every package open, as the lane analysis read them on 2026-10-31. */
  transitions?: boolean;
}

/**
 * The fixture's packages, written through the kernel: every entry created,
 * the `depends_on` edges and the areas set while every package is open (the
 * codec sets both on a live package only), then, unless `transitions` is
 * false, each entry brought to its status by its `holder` or `claim_kept`
 * checkout. An empty area list leaves `resources` undeclared.
 */
export function buildFixture(p: JsonProject, options: BuildOptions = {}): { of: (name: string) => Package; workbenchId: string } {
  const entries = options.entries ?? fixture.packages;
  const areasOf = options.areasOf ?? ((e: FixtureEntry): string[] => e.areas);
  const packages = new Map(entries.map((e) => [e.name, createPackage(p, e.name)]));
  const of = (name: string): Package => packages.get(name) as Package;
  for (const e of entries) {
    const targets = e.depends_on.filter((t) => packages.has(t));
    if (targets.length > 0) setDependencies(p, of(e.name), targets.map((t) => ({ target: of(t), condition: "terminal" as const })));
  }
  for (const e of entries) {
    const areas = areasOf(e);
    if (areas.length > 0) setResources(p, of(e.name), areas);
  }
  if (options.transitions !== false) {
    for (const e of entries) {
      const pkg = of(e.name);
      if (e.status === "paused") transition(p, pkg, "paused");
      if (e.status === "claimed") claim(p, pkg, e.holder as string);
      if (e.status === "done" || e.status === "dropped") {
        if (e.claim_kept !== null) claim(p, pkg, e.claim_kept);
        transition(p, pkg, e.status, { outcome: { class: e.outcome_class, reason: `as the package.json read at 56c19983a`, evidence: [] } });
      }
    }
  }
  return { of, workbenchId: must(p, { op: "inspect" }).result.id as string };
}
