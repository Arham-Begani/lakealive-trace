# Trace submission materials

Prepared for Arham Begani, solo, High School track, Water Quality. This directory contains the completed local submission materials. Publishing a repository does not submit an entry on the event platform.

## Use these files

| File | Purpose |
| --- | --- |
| [Trace-pitch-deck.pdf](Trace-pitch-deck.pdf) | Eight-slide presentation for the Presentation section |
| [video/Trace-Xylem-demo.mp4](video/Trace-Xylem-demo.mp4) | Completed 3:19.5 English presentation and real prototype demo |
| [Trace-project-page.md](Trace-project-page.md) | Full narrative, evidence, limits and assistance attribution |
| [Trace-how-it-works.md](Trace-how-it-works.md) | Seven implemented workflow steps |
| [Trace.html](Trace.html) | Portable app; download and open locally |
| [assets/Trace-logo-100.png](assets/Trace-logo-100.png) | Logo matching the platform's recommended dimensions |
| [assets/prototype-map.png](assets/prototype-map.png) | Cover illustration exported from the app's map component |
| [../../docs/media/problem.png](../../docs/media/problem.png) | Illustration for The Issue |
| [../../docs/media/prototype.png](../../docs/media/prototype.png) | Real screenshot for Our Magic Solution |
| [Trace-script.txt](Trace-script.txt) | Original spoken narration |
| [Trace-recording-guide.pdf](Trace-recording-guide.pdf) | Original planning document; its estimated timings and pre-recording status are superseded by the completed film |

## Platform copy

Name: **Trace by LakeAlive**

Description (92 characters):

> Trace helps communities choose the next water sample, track evidence and handle uncertainty.

Save each edited section. Attach the deck under Presentation. Place the publicly viewable video URL under Questions. Confirm the solo team entry, review the page and personally use Publish project. The current rules prohibit automated entry methods.

The original deadline is 20 November 2026, 21:00 UTC / 21 November 2026, 02:30 IST. Recheck the live event page if returning to these materials later.

- Platform: https://xyleminnovationchallenge-platform.bemyapp.com/
- Event: https://xyleminnovationchallenge.bemyapp.com/
- Rules: https://docs.google.com/document/d/e/2PACX-1vQrUoJgv3RBA3b3oWcrYhFzOf51Yke2DWjTalpDUpLfHjiVTAkSJvk4Y6cmcocOSBq_d0YLYy9-n1gx/pub

## Evidence and provenance

The application source snapshot used in the materials is commit `94d6db0`. The later publication commits organize documentation and assets. The portable app is identical to the verified build. All maps, readings, bands and costs are fictional. The real screenshot is labelled as a synthetic demonstration. See `../../docs/browser-qa.md`, `../../docs/evaluation.md` and `video/video-qa.json` for the scope and limits of the checks.

ChatGPT/Codex assisted with ideation, implementation, testing, interface design and submission materials. ElevenLabs generated the demo narration. No field validation, monitoring partnership or scientific endorsement is claimed.

## Native backup restoration remains unverified

Preserve your current case with Download backup. Start A signal upstream, collect West, edit its note to `restore-check` and save a revision. Download backup. Record counts, budget and status. Start another scenario. In Evidence, import the saved file and confirm Restore case. Verify the scenario, revision history, note, budget and status, then reload. Do not claim this check passed until it has actually been performed. Automated parser and round-trip tests already pass.

## Rebuild the PDFs

Run `node submission/2026-11-19/build-evidence.mjs`, then `python3 submission/2026-11-19/build-pack.py`. The PDF builder requires ReportLab, PyMuPDF, Pillow and the declared Open Sans/DejaVu fonts. It recreates the original planning guide and deck, not the final MP4. Inspect regenerated documents before replacing submitted assets.
