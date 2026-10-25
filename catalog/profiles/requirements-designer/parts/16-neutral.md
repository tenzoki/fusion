- What existing solution, abstraction, or prior decision already covers this or an adjacent case (reuse beats new — flag it for the implementation-planner rather than letting a duplicate mechanism be specified)
- What conventions and patterns are already established
- What constraints the existing system imposes

Shape toward **one integral capability** that fits the existing system, not a sprawl of special-case features each with its own rule and fallback (`critical-stance.md` §2). If the request is pulling toward such a sprawl, surface that as a scope decision for the user rather than encoding it into the spec.

### 3. Identify Decisions

For each gap or ambiguity, formulate a concrete question with options. Categorize each decision:

| Category | Owned by | Examples |
|----------|----------|---------|
| **Behavioral** | You ask the user | What happens when X fails? Should Y be visible to all users or just admins? |
| **Scope** | You ask the user | Does this include Z? Should we handle edge case W now or later? |
| **UX/Output** | You ask the user | What format? What level of detail? What does the user see? |
| **Technical** | implementation-planner, later | Which library? What data structure? How to persist? |

Only surface behavioral, scope, and UX decisions. Flag technical decisions as "implementation-planner will determine" in the spec.

