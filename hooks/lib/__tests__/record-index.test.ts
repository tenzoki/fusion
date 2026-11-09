import { it, expect } from "vitest";
import { campaignFile, createPackage, indexOf, must, place, placeRecord, withJsonProject, type JsonProject } from "./helpers/json-workbench.js";
import { CAMPAIGN_RECORD, CAMPAIGN_STORE } from "../stores.js";

/** A package the kernel created and an issue beside it: the ordinary records of each case. */
function ordinaryRecords(project: JsonProject): { pkg: string; issue: string } {
  const pkg = createPackage(project, "261109-0900-a-package");
  placeRecord(project.workbench, "issue-open", "shared/issues/261109-0901-an-issue.md", "open");
  return { pkg: pkg.path, issue: "shared/issues/261109-0901-an-issue.record.json" };
}

const indexed = (project: JsonProject) => {
  const read = indexOf(project.workbench);
  if (read.format !== "json-control") throw new Error(`the index was not read: ${JSON.stringify(read)}`);
  return read.index;
};

// Through this tree's bundle, which lists a campaign file as a row of kind `campaign` carrying its lifecycle state.
// `paused` is the one campaign state the package vocabulary also holds, so it is the state that reached the maps.
it.each(["running", "paused"])("leaves a valid campaign file at %s out: in no map, in no unreadable row, the ordinary records read as before", (state) => {
  withJsonProject((project) => {
    const { pkg, issue } = ordinaryRecords(project);
    const before = indexed(project);
    const campaign = campaignFile(project, "261109-0902-a-campaign", { state: { state } });

    // The premise: the codec lists the file as kind `campaign` with its own state, and finds nothing against it.
    const rows = must(project, { op: "list" }).result.records as Array<Record<string, unknown>>;
    const row = rows.find((r) => r.path === campaign);
    expect(row).toMatchObject({ kind: "campaign", status: state, narrative: null });
    expect(must(project, { op: "validate" }).result.findings).toEqual([]);

    const index = indexed(project);
    expect(index.unreadable, "no status-unreadable row, and no other").toEqual([]);
    expect(index.byControl.has(campaign)).toBe(false);
    expect(index.byId.has(row!.id as string)).toBe(false);
    expect([...index.byControl.values()].map((e) => e.kind).sort()).toEqual(["issue", "package"]);
    expect([...index.byControl.keys()].sort()).toEqual([issue, pkg].sort());
    expect(index, "the campaign file changes nothing the index answers").toEqual(before);
  });
});

// The rule is the row's kind, never its path or its validity.
it("names a campaign file the codec could not read, and leaves one its schema refuses to validate", () => {
  withJsonProject((project) => {
    ordinaryRecords(project);
    const broken = `${CAMPAIGN_STORE}/261109-0903-broken/${CAMPAIGN_RECORD}`;
    place(project, broken, "{ not json\n");
    const refused = campaignFile(project, "261109-0904-refused", { state: { state: "no-such-state" } });
    const rows = must(project, { op: "list" }).result.records as Array<Record<string, unknown>>;
    expect(rows.filter((r) => r.path === broken || r.path === refused).map((r) => r.kind)).toEqual([undefined, "campaign"]);
    const findings = must(project, { op: "validate" }).result.findings as Array<{ path: string; reason: string }>;
    expect(findings.filter((f) => f.path === refused).map((f) => f.reason)).toEqual(["schema"]);

    const { unreadable, byControl } = indexed(project);
    expect(unreadable.map((u) => u.path)).toEqual([broken]);
    expect(unreadable[0].problem.reason).not.toBe("status-unreadable");
    expect(byControl.size).toBe(2);
  });
});
