TITLE = 'Trace by LakeAlive'
RULES = 'https://docs.google.com/document/d/e/2PACX-1vQrUoJgv3RBA3b3oWcrYhFzOf51Yke2DWjTalpDUpLfHjiVTAkSJvk4Y6cmcocOSBq_d0YLYy9-n1gx/pub'
PLATFORM = 'https://xyleminnovationchallenge-platform.bemyapp.com/'
EVENT = 'https://xyleminnovationchallenge.bemyapp.com/'
EPA = 'https://www.epa.gov/n-steps-online/data-considerations'
SEGMENTS = [
('00:00-00:25', 'The decision', '''Three inlets feed a lake. Your sample shows an elevated signal, but you can afford only four more tests. Where do you go next? I'm Arham Begani, a solo participant in the High School track, addressing the Water Quality challenge. My project is Trace by LakeAlive: a way to make the next sampling decision understandable.'''),
('00:25-00:50', 'Show the starting case', '''Trace is a working browser prototype for a monitoring coordinator. This demonstration uses a fictional network and synthetic readings, not measurements from a real lake. The reference and lake-entry observations leave seven modeled explanations, including combinations of branches. The goal is to choose a useful next question within the available budget and access constraints.'''),
('00:50-01:20', 'Collect and explain', '''Here, Trace recommends the west inlet. Open its reasoning: the test separates explanations that include this branch from those that don't. I load the scenario's simulated reading and save its full interval. Seven possibilities become three. The recommendation then moves north. I record the north and east samples too. One modeled explanation remains: North.'''),
('01:20-01:48', 'Challenge the record', '''That does not prove a source. Let me challenge the evidence. In the notebook, I revise the north reading, widen its interval, and flag it for review. Advice pauses. The original reading stays in the history, and the revision does not charge another sample. The exported case includes the assumptions, observations and unresolved questions for another person to inspect.'''),
('01:48-02:18', 'Show the failure case', '''Now watch the contradictory scenario. The lake-entry signal is elevated, but west and north readings are low. East seems to fit by exclusion, so Trace asks for a direct cross-check. That reading is also low. Now no modeled explanation fits. Trace says, “The evidence does not fit.” It tells us to review the measurements and assumptions instead of blaming a branch.'''),
('02:18-02:48', 'Explain the implementation', '''Underneath, a deterministic interval model compares eight possible branch combinations. It ranks affordable sites with confirmed access by the largest group that could remain after a test. The simulator is separate: the planner never sees the hidden answer. The app runs locally without an API key. Adaptive sampling already exists; my contribution is the workflow that makes its assumptions and corrections inspectable.'''),
('02:48-03:14', 'Show measured evidence', '''The software has twenty-nine passing automated tests, plus a documented Chromium check. In seventy-two synthetic cases, Trace and a fixed sequence each reached twenty-nine compatible single explanations, with three still awaiting cross-checks. Trace used fewer average credits, but unresolved cases and early stops affect that number. This is a software demonstration, not evidence of real-world accuracy.'''),
('03:14-03:40', 'Impact and next step', '''The next step is to work with monitoring coordinators on a validated model and sampling protocol, then test whether people understand the recommendations and recognize uncertainty. No field pilot is claimed. The prototype and these materials used AI assistance, documented in the deck. Trace's promise is simple: make each limited sample lead to a better-informed next decision.''')
]
SHOTS = [
('00:00-00:25', 'Arham on camera, then title', 'Start with the four-test question. Show your name, solo, High School, Water Quality. No invented field footage.'),
('00:25-00:50', 'Fresh A signal upstream case', 'Choose the scenario and Start fresh. Frame the map, simulation label, 7 remaining explanations and budget 4. Keep the starting reference and lake-entry observations visible briefly.'),
('00:50-01:20', 'Reasoning, then A, B, C', 'Open Why this location? Read its actual reason. Choose Record this sample > Use the scenario\'s simulated reading > Save reading. Repeat at North and East. Preserve the order: 7, 3, 2, 1. Hold the North result with its caveat.'),
('01:20-01:48', 'Notebook and case report', 'Evidence > North inlet > Edit reading. Enter lower 0, upper 0.95, check Flag this reading for review; pause advice, Save revision. Show Reading history & method. Return to Investigation to show paused advice, then open Case report.'),
('01:48-02:18', 'When the story breaks', 'Switch scenario and Start fresh. Collect simulated West, then North. Hold Cross-check East. Record the East cross-check and show The evidence does not fit. Record this as a separate continuous take; cut only waiting time.'),
('02:18-02:48', 'The method, then architecture slide', 'Show The method and its eight-row prediction table. Use deck slide 4 briefly to explain planner/simulator separation. Do not animate an invented physical pollution plume.'),
('02:48-03:14', 'Evaluation slide 6', 'Hold the full table long enough to read. Keep Synthetic same-model evaluation visible. Do not crop the pending-check column or the caveat about early stops.'),
('03:14-03:40', 'Arham, pilot slide, end card', 'Close on proposed validation work, then the title and assistance note. Keep total export between 3:00 and 4:00, including titles and end card.')
]
PROJECT_COPY = '''# Trace by LakeAlive

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
'''
