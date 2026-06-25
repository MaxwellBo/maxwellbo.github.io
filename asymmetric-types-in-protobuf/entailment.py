# /// script
# requires-python = ">=3.10"
# dependencies = ["z3-solver"]
# ///
"""Check that a field's constructor validation (CV) entails its deserialization
validation (DV), i.e. that ∀x. CV(x) ⟹ DV(x).

If the implication ever fails, Z3 hands us a counterexample: a value that the
constructor would happily accept but that an older deserializer would reject.
That value is exactly the message an engineer could build and send to break a
peer that is still running the previous schema version.

Run with:  uv run entailment.py
"""

from z3 import Int, Not, Solver, sat


def check_entailment(cv, dv) -> None:
    x = Int("x")

    # We want to prove:  ∀x. CV(x) ⟹ DV(x)
    # Equivalently, we ask Z3 for a counterexample to that claim:
    #   ∃x. CV(x) ∧ ¬DV(x)
    solver = Solver()
    solver.add(cv(x))
    solver.add(Not(dv(x)))

    if solver.check() == sat:
        model = solver.model()
        witness = model[x]
        print(f"counterexample x = {witness}")
    else:
        print("safe")


if __name__ == "__main__":
    # safe
    check_entailment(
        cv=lambda x: x <= 10,
        dv=lambda x: x <= 20,
    )

    # counterexample x = 21
    check_entailment(
        cv=lambda x: x <= 30,
        dv=lambda x: x <= 20,
    )
