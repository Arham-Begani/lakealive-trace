# Contributing to Trace

Useful contributions improve the clarity, reliability and inspectability of this prototype. Please open an issue to discuss substantial changes before implementation.

## Reproduce locally

Use the Node versions accepted by `package.json`.

```sh
npm ci
npm test
npm run evaluate
npm run build
npm run dev
```

The dev server prints its local URL. Rebuild and refresh after source changes. `dist/index.html` is tracked so reviewers can run the portable application without installing dependencies.

## A useful bug report

Include the scenario, exact actions, expected and observed behavior, browser and viewport, and whether the problem survives reload. Use fictional or sanitized evidence; do not publish private monitoring notes or credentials. Attach a small reproducible backup when appropriate.

## Review expectations

Keep one coherent purpose per commit. Explain the behavioral change and the checks actually performed. For inference or validation changes, add a regression case that fails without the fix. Verify budget accounting, revisions, cross-checks and explicit uncertainty. For visual changes, inspect desktop and narrow layouts and include real screenshots.

Keep the simulator separate from the planner. Do not replace uncertainty with invented confidence scores or claim field validation from simulated tests. Describe meaningful AI assistance accurately.

## Licensing

No project-wide open-source license has been selected yet. Public availability alone does not grant a general reuse license. Discuss licensing and substantial contributions with the owner first. Dependencies retain their own licenses.
