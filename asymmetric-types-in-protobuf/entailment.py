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

from z3 import Int, Implies, ForAll, Not, Solver, sat


def check_entailment(name: str, cv, dv) -> None:
    x = Int("page_number")

    # We want to prove:  ∀x. CV(x) ⟹ DV(x)
    # Equivalently, we ask Z3 for a counterexample to that claim:
    #   ∃x. CV(x) ∧ ¬DV(x)
    solver = Solver()
    solver.add(cv(x))
    solver.add(Not(dv(x)))

    print(f"== {name} ==")
    if solver.check() == sat:
        model = solver.model()
        witness = model[x]
        print(f"  CV does NOT entail DV (unsafe).")
        print(f"  Counterexample: page_number = {witness}")
        print(f"  The constructor accepts {witness}, but the deserializer rejects it.\n")
    else:
        print("  CV entails DV (safe): no value passes the constructor but fails the deserializer.\n")


if __name__ == "__main__":
    # Safe narrowing: constructor tightened to <= 10 while the deserializer
    # still admits the older <= 20. Every value the constructor accepts is
    # still deserializable, so the implication holds.
    check_entailment(
        "constructor `this <= 10`, deserializer `this <= 20`",
        cv=lambda x: x <= 10,
        dv=lambda x: x <= 20,
    )

    # Unsafe widening: constructor relaxed to <= 30 before the deserializer was
    # taught to accept anything above 20. Z3 finds a value (e.g. 21..30) that a
    # producer can construct but an old consumer cannot deserialize.
    check_entailment(
        "constructor `this <= 30`, deserializer `this <= 20`",
        cv=lambda x: x <= 30,
        dv=lambda x: x <= 20,
    )
