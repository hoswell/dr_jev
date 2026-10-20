# JEV treatment classifier example

`examples/jev_treatment_classification_request.json` shows the supplied JEV
classification request shape with 255 treatment and care-pathway labels
(`tx_001` through `tx_255`). The medication labels are class-level and marked
for clinician review; they do not include dosing or patient-specific
instructions.

This is a draft taxonomy, not a clinically validated protocol. Review it with
qualified clinicians and validate the JEV API's schema and label limits before
using it in a live patient-care workflow. Classifier output should not be used
as an autonomous diagnosis, triage decision, or treatment recommendation.
