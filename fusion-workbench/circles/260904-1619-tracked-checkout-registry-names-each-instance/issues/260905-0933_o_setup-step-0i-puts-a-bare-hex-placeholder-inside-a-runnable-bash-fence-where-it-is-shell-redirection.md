Setup Step 0i puts a bare `<hex>` placeholder inside a runnable bash fence, where it is shell redirection

---
The Step 0i block reads `"$C" resolve <hex>`. Unquoted in a bash fence, `<hex>` is an input redirection from a file named `hex` followed by an output redirection with no operand: a syntax error, not a placeholder. Every other placeholder in the same file sits inside quotes.

---
**Filed by:** coderev, Kai Stalmann <ks@qantr.com>

**Severity:** Low. A model that substitutes the hex is fine; one that runs the block as written gets a shell error at a Setup step.

## Evidence

- `skills/setup/SKILL.md:351-353`:

```bash
C="$FUSION_PLUGIN_ROOT/bin/fusion-checkout-name"
[ -x "$C" ] && { "$C" resolve <hex>; echo "exit=$?"; }
```

- The same file's own convention, one section earlier: `skills/next/SKILL.md:193` writes `CDIR="$WORKBENCH/$SCAN_CIRCLES/<candidate-dirname>"`, quoted, so the placeholder is inert to the shell.
- `skills/setup/SKILL.md:344` — the Step 0h block immediately above takes no placeholder at all and runs verbatim, so the two adjacent blocks differ in whether they are executable as written and nothing says so.

## Acceptance test

The block runs verbatim without a shell error, or the placeholder is quoted and the prose says the hex is substituted from Step 0h's `CHECKOUT=`.
