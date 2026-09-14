# EARTH vertical slice implementation

1. Establish typed content, graph and progress invariants. Test broken edges, cyclic/invalid prerequisites, search intent matching, unknown queries, synthetic cost calculation, progress prerequisites, and corrupted storage. Run failing tests before implementing model behavior.
2. Implement one coherent visual system and home/atlas/guide/quest/search views. Keep body content out of rendering logic, and all user-originated output escaped. Use deterministic graph layout and typed edges; use native keyboard-accessible controls.
3. Connect the learning loop. Reading, checked understanding and self-reported observation remain distinct; do not unlock completion from a click alone. Save and restore only validated, versioned state. Do not claim verification of the user's real-world observation.
4. Run browser tests on the production bundle. Capture both viewport sizes, inspect actual images, repair visual/interaction defects, then repeat. Run final tests/typecheck/lint/build, record exact limits, and package source plus a double-click offline HTML. Local Git checkpoints at each coherent milestone.
