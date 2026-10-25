---
description: Reconcile the workbench's tracking files against ground truth. Dispatches the state-auditor once, reports what it changed and the three-edge Coherence audit result it returned, and advances this checkout's reconcile mark. Writes no record and commits nothing.
argument-hint: "[<brief text>] [--since <commit>] [--domain code|data] [--force]"
allowed-tools: [Bash, Read, Agent(fusion:state-auditor)]
---
