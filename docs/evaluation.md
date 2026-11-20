# Synthetic evaluation

Model: trace-intervals-1.0.

Synthetic finite-model test. Not field validation or an accuracy estimate.

8 source subsets × 3 budgets × 3 access patterns × 4 deterministic random seeds per policy; same outcome fixtures and costs. All policies cross-check an unmeasured active branch after singleton inference. Fixed visits A, B, C, J if accessible and affordable. Random samples uniformly among affordable unmeasured open sites.

| Policy | Runs | Correct singleton | Unresolved | Wrong singleton | Mean credits |
|---|---:|---:|---:|---:|---:|
| trace | 288 | 116 | 172 | 0 | 1.736 |
| fixed | 288 | 116 | 172 | 0 | 2.014 |
| random | 288 | 96 | 192 | 0 | 2.142 |

Every test is generated from the same deliberately simple forward model; success on these cases does not demonstrate performance on real water networks. Repeated deterministic seeds duplicate fixed/Trace runs so each policy has the same case weighting. Means include early stops and unresolved cases; lower spend alone does not mean better investigation. There are no statistical significance claims.

## Stress cases

- **Coarse intervals preserve all seven candidates:** inconclusive; remaining [1, 2, 3, 4, 5, 6, 7]; path A → B → C; 3 credits.
- **Contradictory upstream/downstream bands produce a mismatch:** conflict; remaining []; path A → B → C; 3 credits.
- **Unmodeled process mimics branch B: narrow but unsupported attribution:** narrowed; remaining [2]; path A → B → C; 3 credits.

The third stress case is an intentional counterexample: a closed-world model can narrow to one explanation even when the real cause is outside its hypothesis set. No abstention rule can detect every such case from indistinguishable observations. The interface therefore never calls a singleton a proven source, and field use requires a validated forward model, comparable measurements, expert review, and a defined sampling protocol.

## Reproduce

Run `npm run evaluate`. Full trajectories are written to `artifacts/evaluation.json`. The planner never receives the hidden mask: only the evaluator uses it after action selection to generate measurements. The demonstration is explicitly modeled decision support, not an LLM-generated chemistry claim.
