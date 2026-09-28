import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { pluginRoot } from "./helpers/citation-scan.js";
import { WINDOW_LEGACY_NAMES } from "../stores.js";

// The v12 store-name window closes at 13.0.0, and this is what makes the close
// forced rather than remembered: the version bump cannot pass while a legacy
// name stands in the tree's subsection or in `stores.ts`.
describe("the store-name transition window is bound to the plugin's major", () => {
  const major = Number(JSON.parse(readFileSync(join(pluginRoot, ".claude-plugin/plugin.json"), "utf-8")).version.split(".")[0]);
  const tree = readFileSync(join(pluginRoot, "rules/fusion-workbench-conventions.md"), "utf-8");
  const open = /^### Transition window \(v12\.0\.0 to v13\.0\.0\)$/m.test(tree);

  it("below 13 the window names the three renamed stores; from 13 on it is gone from both sites", () => {
    if (major < 13) {
      expect(open, "the layout tree lost its window subsection before 13.0.0").toBe(true);
      expect(Object.keys(WINDOW_LEGACY_NAMES).sort()).toEqual(["consultations", "plans", "work-packages"]);
    } else {
      expect(open, "13.0.0 deletes `### Transition window` from the layout tree").toBe(false);
      expect(WINDOW_LEGACY_NAMES, "13.0.0 empties WINDOW_LEGACY_NAMES in hooks/lib/stores.ts").toEqual({});
    }
  });
});
