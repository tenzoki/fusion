// ---------------------------------------------------------------------------
// The contract, inlined: the ten schemas and the two tables as JSON imports,
// so that esbuild folds them into `dist/fusion-record.js` and the one shipped
// file carries everything it validates against. Prior takes a digest over that
// file before it spawns it; a schema read from disk at run time would be
// outside the digest.
//
// A source checkout does not need this: `validate.ts` and `transitions.ts`
// read the same files from the directory on first use. `main.ts` calls
// `installInlined()` before its first question so the bundle never reaches
// that fallback, and `ops.test.ts` holds the two sets equal.
// ---------------------------------------------------------------------------

import dependenciesTable from "../../contract/dependencies.json";
import transitionsTable from "../../contract/transitions.json";
import campaign from "../../schemas/campaign.schema.json";
import common from "../../schemas/common.schema.json";
import evidence from "../../schemas/evidence.schema.json";
import migrationPlan from "../../schemas/migration-plan.schema.json";
import migrationProposal from "../../schemas/migration-proposal.schema.json";
import migrationReceipt from "../../schemas/migration-receipt.schema.json";
import pkg from "../../schemas/package.schema.json";
import protocol from "../../schemas/protocol.schema.json";
import record from "../../schemas/record.schema.json";
import workbench from "../../schemas/workbench.schema.json";
import { useTables, type DependenciesTable, type TransitionsTable } from "../transitions.js";
import { compileSchemas, useSchemas, type SchemaSet } from "../validate.js";

/** Compiles the inlined schemas, installs them and the tables as the defaults, and returns the set. Throws when a schema does not compile. */
export function installInlined(): SchemaSet {
  const set = compileSchemas([
    { source: "schemas/campaign.schema.json", value: campaign },
    { source: "schemas/common.schema.json", value: common },
    { source: "schemas/evidence.schema.json", value: evidence },
    { source: "schemas/migration-plan.schema.json", value: migrationPlan },
    { source: "schemas/migration-proposal.schema.json", value: migrationProposal },
    { source: "schemas/migration-receipt.schema.json", value: migrationReceipt },
    { source: "schemas/package.schema.json", value: pkg },
    { source: "schemas/protocol.schema.json", value: protocol },
    { source: "schemas/record.schema.json", value: record },
    { source: "schemas/workbench.schema.json", value: workbench },
  ]);
  useSchemas(set);
  useTables(transitionsTable as unknown as TransitionsTable, dependenciesTable as unknown as DependenciesTable);
  return set;
}
