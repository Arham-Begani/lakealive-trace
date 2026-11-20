# Trace browser verification

Follow-up to the initial build and independent review. The checks used real Chromium through the managed browser, against the portable built app served locally. All observations below used fictional scenarios. Nothing was submitted or published.

## Verified in the browser

- Desktop viewport 1168 × 735: full page inspected, no horizontal overflow; current desktop screenshot inspected after the final fixes.
- Narrow frames at 320, 390 and 768 px: investigation, notebook, settings and method layouts inspected across these sizes without horizontal overflow. These were sized browser frames, not physical-device emulation.
- Samples collected through the actual dialog: a reversed interval was rejected; simulated inputs could then be saved. Three branch readings narrowed the first scenario to its modeled North explanation, with the model caveat visible.
- An observation was revised and flagged. The notebook retained six versions across five sample locations; the review tag remained visible at narrow width.
- The contradictory scenario moved through a pending East cross-check to zero compatible explanations and the explicit message “The evidence does not fit.” It did not attribute a source.
- Reload preserved the current case. Escape dismissed the settings dialog and returned focus to its opener. Saving a reading moved focus to the resulting decision heading.
- The new location picker selected East at 320 px and retained keyboard focus. Its control is at least 44 px tall.
- Native JSON backup and HTML report downloads completed. The downloaded files were read: the backup contained five locations and six revisions; the report retained superseded readings and synthetic-data labels.

## Repairs made from the check

- Restored meaningful keyboard focus after saves and view changes.
- Added a narrow-layout location selector so small map pins are not the only location controls.
- Enlarged compact controls, aligned wrapping form labels and preserved narrow-view reading text.
- Cleared a stale validation error when a valid simulated reading is loaded.
- Distinguished current model inputs from superseded accepted revisions in reports.
- Corrected singular candidate-count wording and gave the settings control an explicit accessible name.
- Made the local development server honor preview host/port arguments; added a development-only responsive frame at `/__viewport`.

## Limits and unresolved checks

The native backup file chooser opened, but the browser tool's file-selection step hung despite configured timeouts. No restore success is claimed. Attempts stopped after the tool stalled; the parser, validation and serialization round trips are covered by automated tests. The changed-conditions pause is also covered by state/DOM tests but was not reached in the aborted native batch. Physical touch, Safari and Firefox were not tested. Browser extension metadata errors were observed; they were not attributed to the app.

The browser screenshot was inspected and the live app marked for review. Saving the screenshot from the browser runtime to the workspace was blocked by its read-only filesystem, so no screenshot file is included in this source package.

These tests establish prototype behavior under the tested conditions, not real-water accuracy, source attribution, water safety or superiority to monitoring practice. All map locations, readings, costs and prediction bands remain synthetic.
