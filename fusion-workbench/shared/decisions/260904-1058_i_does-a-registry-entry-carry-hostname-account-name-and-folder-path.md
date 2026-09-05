# Does a registry entry carry hostname, account name and folder path?

---
**Domain:** code
**Filed by:** analyst, Kai Stalmann <ks@qantr.com>
**Cross-references:**
`260904-1058-identity-per-instance-and-the-checkout-registry.md` `### 8. Privacy, stated` and the `worker-id` row of `### 6. The proposed structure, field by field`;
`260904-1058_*_does-fusion-gain-a-tracked-checkout-registry-and-in-which-shape.md`;
`bin/fusion-identity` (where hostname plus workbench path was rejected as a derivation, and why)

---

## Question

The user's third field, `worker-id`, is hostname plus the account name on that machine plus the local folder. It would live in a tracked file, in a repository that may be public. The question is whether it is written at all, and if so under what default.

Two things are settled before the options and are not reopened here. It is **not a key**: `bin/fusion-identity` rejected hostname plus workbench path by name, "unique only where hostnames are, and default hostnames repeat", and nothing has changed that. And it is **mutable**: a folder rename, a machine rename or a container with an ephemeral hostname each invalidate it with nothing noticing.

## What it exposes

Measured in this checkout: hostname `k1i9`, account `k1`, path `/Users/k1/Projects/productive/fusion`. Across several entries a reader learns the operating system, the home directory layout, how the person organises work, and how many machines they have. A hostname often carries a real name.

## Options

1. **Never written.** The alias carries the whole "which one is this" job.
   - Pros: nothing is exposed; nothing can go stale; the field that cannot be a key is simply absent.
   - Cons: a person who has forgotten which alias belongs to which folder has nothing to look it up by.
2. **Offered once at Setup, opt in, written plain.** The offer states what it publishes.
   - Pros: the user decides against his own repository's visibility; one file per entry means omitting a field needs no switch.
   - Cons: one more Setup question; a written value goes stale in silence, which is the third of the three costs behind the 260824 withdrawal.
3. **Written by default, with an opt out.**
   - Pros: the field is there when wanted, and a person who does not care is not asked.
   - Cons: a default that publishes machine and personal information is a default that will publish it, in projects where nobody read this record.
4. **Written, but as a hash of the triple.**
   - Pros: exposes nothing.
   - Cons: destroys the field's only value, being human-readable, and produces a second opaque token beside one that already exists.

## Constraints

- Whatever is written must be omittable per entry without a mechanism, since each checkout writes only its own file.
- A stale value must not be load-bearing for any comparison. No option here may put this field into a claim test or a presence count.

## Recommendation

Option 2. Option 1 is defensible and loses a little; option 3 inverts the burden onto the least attentive project; option 4 spends the field's whole point. The offer should name the three values it is about to publish, in the words above, rather than asking whether to record "machine details".

---
Answered: 260904-1050-orchestrator-session.md `## Turn 1 — the worker-field gate` — option 1, never written; the user answered "1" at the step-1 gate of the plan.

**What step 2 must therefore do:** no `**Worker:**` field and no `--worker` flag exist. `bin/fusion-checkout-name` neither writes nor reads a worker value, `register` takes no such argument, `resolve` emits no `worker=` line, and step 5's Setup question offers nothing about hostname, account name or folder path. Nothing in this project publishes any of the three.

---
Implemented: 0dcbf992 — realised by absence, which is verifiable rather than merely intended: `bin/fusion-checkout-name` carries no `**Worker:**` field, `register` takes `[--alias A] [--person P]` and nothing else, `resolve` emits no `worker=` line, and one of the helper's nine cases asserts a written entry contains no `worker` at all. `/fusion:setup` Step 0i (`4ff9d2e0`) offers nothing about hostname, account name or folder path.

**Marker note.** The plan's step 14 would leave this record `_a_`, on the reading that an answer of "never written" requires no code. It is `_i_` instead, and the departure is deliberate: the answer did shape code, it is the reason the helper has two flags rather than three, and a test asserts the absence. A reader meeting `_a_` here would look for realisation still owed, and none is.
