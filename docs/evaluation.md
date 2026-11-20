# Synthetic evaluation

Model: trace-intervals-1.0.

Synthetic finite-model test. Not field validation or an accuracy estimate.

8 source subsets × 3 budgets × 3 access patterns = 72 equally weighted cases per policy. The random baseline exactly enumerates every legal trajectory with uniform probability at each action; leaves carry their product probability. All policies cross-check an unmeasured active branch after singleton inference if possible. Fixed visits A, B, C, J if accessible and affordable. Same outcome fixtures, costs and budgets.

| Policy | Cases | Correct compatible singleton | Of these: check pending | Unresolved | Wrong singleton | Mean credits |
|---|---:|---:|---:|---:|---:|---:|
| trace | 72 | 29 | 3 | 43 | 0 | 1.736 |
| fixed | 72 | 29 | 3 | 43 | 0 | 2.014 |
| random-exact | 72 | 22.5 | 3.5 | 49.5 | 0 | 2.155 |

Random values are exact probability-weighted expectations (rounded for display), not counts from random seeds. There are 541 enumerated policy trajectories in the saved JSON. A compatible singleton is not a proven source; the pending-check column identifies singletons lacking a discriminating observation.

All test measurements are generated from the same deliberately simple forward model. Success here does not demonstrate performance on real water networks. Means include early stops and unresolved cases; lower spend alone does not mean better investigation. The fixed baseline is a reasonable bracketing sequence, not a deliberately weak opponent. There are no statistical significance claims.

## Stress cases

- **Coarse intervals preserve all seven candidates:** inconclusive; remaining [1, 2, 3, 4, 5, 6, 7]; path A → B → C; 3 credits.
- **Contradictory upstream/downstream bands produce a mismatch:** conflict; remaining []; path A → B → C; 3 credits.
- **Unmodeled process mimics branch B: narrow but unsupported attribution:** narrowed; remaining [2]; path A → B → C; 3 credits.

The third stress case is an intentional counterexample: a closed-world model can narrow to one explanation even when the real cause is outside its hypothesis set. No abstention rule can detect every such case from indistinguishable observations. The interface therefore never calls a singleton a proven source, and field use requires a validated forward model, comparable measurements, expert review, and a defined sampling protocol.

## Reproduce

Run `npm run evaluate`. Full weighted trajectories are written to `artifacts/evaluation.json`. The planner never receives the hidden mask: only the evaluator uses it after action selection to generate measurements. This is modeled decision support, not an LLM-generated chemistry claim.
