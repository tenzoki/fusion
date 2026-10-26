// The entries held at `prior: unsupported` whatever their parts say.
//
// `skill-commit` and `skill-cleanup` carry `prior` parts, and those parts say
// the entry has nothing to commit on Prior: the host integrates the run as its
// one commit. A step that marks "every entry whose profile has a prior part"
// supported would mark both, and nothing else in the catalog tells the two
// apart from the fourteen skills that do go supported. This test is that
// distinction. Issue
// 261025-2352-plan-step-15-as-written-would-mark-commit-and-cleanup-supported-on-prior.md
// in work package 261023-1915-prior-handover-c-skill-profiles; the condition
// is request 76, question 1 (whether the host takes the entry's message for
// the run's commit).

import { describe, expect, it } from "vitest";
import { catalogRoot, loadCatalog } from "../render.js";

const HELD = ["commit", "cleanup"] as const;

const ISSUE = "261025-2352-plan-step-15-as-written-would-mark-commit-and-cleanup-supported-on-prior.md";

describe("entries held unsupported on prior", () => {
  const { catalog } = loadCatalog(catalogRoot());

  for (const id of HELD) {
    it(`skill-${id} stays prior: unsupported`, () => {
      const entry = catalog.entries.find((e) => e.id === id && e.profile === `skill-${id}`);
      expect(entry, `catalog.json has no entry ${id} on profile skill-${id}`).toBeDefined();
      expect(
        entry!.support.prior,
        `entry ${id} (profile skill-${id}) must stay prior: unsupported (issue ${ISSUE}); only a ruling lifts this, and that ruling removes ${id} from HELD in this test`,
      ).toBe("unsupported");
    });
  }
});
