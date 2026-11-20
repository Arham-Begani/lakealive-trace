# Trace by LakeAlive

## Tagline
Choose the next useful water sample, preserve the evidence, and make uncertainty visible.

## Short summary
Trace is a working, offline browser prototype that helps a monitoring coordinator compare the next accessible water-sampling locations under a limited budget. A transparent interval model updates possible upstream explanations as readings arrive, retains revisions and requests cross-checks. The demonstration uses synthetic data and explicitly stops when observations contradict its model. It is not field validated.

## The problem
A downstream signal creates an investigation, not an explanation. A community monitoring coordinator has to decide which upstream observation could actually change the working picture, while dealing with limited tests, inaccessible locations and uncertain measurements. A map of readings alone does not explain what to test next or what would make a conclusion change.

Trace focuses on that decision and its record. The intended early users are community monitoring coordinators and supervised student monitoring groups. This is a proposed user group, not a claim of existing adoption or interviews.

## What Trace does
Start with a fictional three-branch network, a reference observation, a lake-entry observation and a test budget. Trace keeps every modeled explanation compatible with the current unflagged readings, including combinations of branches. It recommends an affordable location with confirmed access and explains which alternatives that test could distinguish.

Enter a measurement interval rather than a forced point estimate. The candidate set and next recommendation update immediately. If an explanation survives only by exclusion, a direct cross-check remains explicit. If evidence needs review, access is uncertain, the budget is insufficient, conditions have changed, or the model cannot explain the observations, Trace exposes that limit.

The evidence notebook retains original readings and subsequent corrections. Export a readable HTML case report or an editable JSON backup. The complete prototype runs in one local HTML file without an account, API key or runtime network request.

## A short, reproducible demonstration
In “A signal upstream,” seven modeled explanations fit the starting evidence. Simulated West, North and East readings reduce that set to three, then two, then one: North. That is compatibility with the model, not proof of a pollution source.

Next, revise and flag the North observation. Advice pauses while the earlier version stays visible. In “When the story breaks,” low West and North readings trigger an East cross-check. A low East reading contradicts the elevated lake-entry observation under this model, so Trace reports that the evidence does not fit.

All places, readings, prediction bands and test credits in these examples are fictional. Credits are planning units, not measured financial savings or laboratory prices.

## How it works
The JavaScript engine enumerates all eight subsets of three branches. It retains an explanation when its predicted band overlaps every applicable reading interval. Among affordable sites with confirmed access, the planner minimizes the worst-case number of remaining explanations. Ties prefer lower cost, then site ID. An independent simulator generates demo readings only after a site is selected; the planner does not receive the hidden scenario answer.

The interface uses HTML, CSS and an interactive SVG network. State validation, revision history, local storage and report generation remain in the browser. Node.js builds the portable file, and Node's test runner plus JSDOM exercise model and interface behavior. There are no runtime dependencies or LLM calls.

## What is distinctive
Adaptive sampling is established prior art. Trace does not claim a new sampling algorithm. Its contribution is an inspectable interaction: the user can see why a test matters, change a constraint or correct evidence, and follow how the decision changes without losing the original record. It treats an unresolved investigation as a valid outcome.

## Evidence and limitations
The current software snapshot has 29 passing automated tests. A documented Chromium pass covered sampling, revisions, persistence, contradiction/cross-check behavior, real downloads and desktop/narrow layouts. Native backup restoration remains unverified because the browser tool stalled during file selection. Physical touch and other browser engines have not been tested.

A reproducible evaluation covers 72 equally weighted synthetic cases per policy. Trace and the fixed A-B-C-J policy each reached 29 compatible single explanations, including 3 awaiting cross-checks. Mean credits were 1.736 for Trace and 2.014 for the fixed policy. The exact random-policy expectation was 22.5 compatible single explanations, including 3.5 awaiting cross-checks, at 2.155 mean credits. Means include unresolved cases and early stopping. These same-model fixtures do not establish field accuracy or practical cost savings.

Stress tests preserve ambiguity for wide intervals and reject contradictory evidence. A deliberately unmodeled process also demonstrates a serious limitation: an unknown cause can mimic a modeled branch and still yield a narrow answer. Trace cannot detect every such failure.

The current model omits dilution, transport, time-varying flow and lake mixing. Its fictional phosphate bands are not environmental standards. It cannot establish water safety, identify a polluter or replace qualified monitoring practice.

## Intended impact and next step
The intended benefit is a more understandable use of limited sampling capacity and an evidence record another coordinator can review. This benefit still needs evaluation with users. The next stage is to co-design a validated network model and protocol with monitoring specialists, then run supervised retrospective or controlled tests with known outcomes before any real-world recommendation.

Measure whether coordinators can explain a recommendation, detect unresolved cases and recover from a correction. Later trials should compare decisions with an expert-designed sampling plan using comparable data, actual costs and documented access. No pilot, partnership, users or environmental improvement is claimed today.

## Team and assistance
Arham Begani is the solo participant and project lead. The project direction continues the LakeAlive theme, but this Trace implementation was built in a separate repository. AI assistance through ChatGPT/Codex supported ideation, implementation, testing, interface design and preparation of these submission materials. Automated and agent reviews are software checks, not independent scientific validation. No external field validation or expert endorsement is claimed.

## Background reference
The EPA's [Data Considerations](https://www.epa.gov/n-steps-online/data-considerations) explains why comparable methods, contextual metadata and preserved source data matter. It informs the caution around evidence handling; it does not validate Trace's model.
