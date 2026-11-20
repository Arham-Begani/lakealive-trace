# Architecture and decision boundaries

Trace is a local browser application built from plain JavaScript, CSS and an SVG schematic. It has no server-side inference, runtime LLM, account system or API key.

| Module | Responsibility | Boundary |
| --- | --- | --- |
| `scenarios.js` | Network, model bands and synthetic scenario metadata | Fictional assumptions, not environmental standards |
| `model.js` | Interval compatibility, feasible action ranking and stop states | Does not consume hidden scenario outcomes |
| `simulator.js` | Produce a scenario reading for a selected site | Used only after the sampling action is chosen |
| `state.js` | Validate input, apply transitions, preserve revisions and validate backups | Imported objects are rebuilt from allowed fields |
| `map.js` / `app.js` | Map, controls, forms, notebook and user feedback | Display state is derived from the case |
| `report.js` | Produce a readable evidence record | Escapes user-entered text before generating HTML |
| `build.mjs` | Bundle source into `dist/index.html` | Output is portable and has no runtime dependencies |

## The recommendation rule

For each of the eight subsets of three branches, compare predicted bands with every applicable accepted measurement interval. Keep a hypothesis only if all intervals overlap. Among affordable sites with confirmed access, prefer the test with the smallest worst-case remaining candidate group. Resolve ties by lower cost, then site identifier. Do not interpret a candidate count as a calibrated probability.

## Evidence changes

A correction supersedes an input for inference while retaining earlier versions in history. It does not create a second purchased sample. Flagged evidence suspends advice. A surviving branch inferred solely by excluding others retains a pending direct cross-check.

## Scientific limits

The model assumes an elevated signal from an active connected branch. It omits dilution, transport, temporal variation and lake mixing. Unknown processes can mimic modeled explanations. Software verification and the same-model synthetic evaluation do not establish field accuracy.

See [evaluation](evaluation.md), [browser verification](browser-qa.md) and [the workflow](how-it-works.md).
