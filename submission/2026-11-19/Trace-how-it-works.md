# How Trace works

The current application is an offline simulation. Locations, readings, prediction bands and test credits are fictional. The steps below describe implemented behavior.

## 1. Set up the investigation
Choose a scenario and review its starting reference and lake-entry readings. Set the available test budget, location access and additional measurement uncertainty. These constraints determine which sampling actions are feasible.

## 2. Compare possible explanations
Trace checks eight combinations of three upstream branches against the accepted measurement intervals. Every explanation whose predictions still overlap the observations remains visible; uncertainty is not forced into a single answer.

## 3. Choose the next useful sample
Compare accessible, affordable locations. Trace recommends the location that minimizes the largest possible group of remaining explanations under its model and assumed test precision. The reason and predicted outcome groups are inspectable.

## 4. Record the measurement interval
Enter the lower and upper bounds, method and notes. In the demonstration, the independent simulator can supply a fictional reading after a location is selected. Saving updates the compatible explanations and remaining test budget.

## 5. Cross-check or stop
An explanation inferred by exclusion still needs its direct cross-check. If readings contradict the model, access or budget prevents the next step, or the evidence needs review, Trace makes the unresolved state explicit. A model-compatible explanation is not proof of a pollution source.

## 6. Correct evidence without losing history
Revise or flag a reading in the notebook. The original version stays in the history, the inference recalculates, and a correction does not charge for another sample. A review flag or changed water conditions pauses sampling advice.

## 7. Export the case for handover
Export the readable HTML case report and the editable JSON backup. The report preserves observations, revisions, constraints and limitations so another person can inspect the investigation. Native browser backup restoration remains unverified; parser and round-trip tests pass.
