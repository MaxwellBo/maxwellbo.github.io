import * as stdlib from 'https://esm.run/@observablehq/stdlib'
import { Runtime, Inspector } from "https://esm.run/@observablehq/runtime";

export const library = new stdlib.Library();
export const runtime = new Runtime();
export const module = runtime.module();

export function cell(name, inputsOrDefinition, maybeDefinition) {
  if (maybeDefinition) {
    const inputs = inputsOrDefinition;
    const definition = maybeDefinition;
    module.variable(observer(name)).define(name, inputs, definition);
  } else {
    const definition = inputsOrDefinition;
    module.variable(observer(name)).define(name, definition);
  }
}

export function observer(cellName) {
  const div = document.createElement("div");
  const cellElement = document.getElementById(cellName)
  cellElement.parentNode.insertBefore(div, cellElement);
  return new Inspector(div);
}

export function viewof(name, inputsOrDefinition, maybeDefinition) {
  if (maybeDefinition) {
    const inputs = inputsOrDefinition;
    const definition = maybeDefinition;
    module.variable(observer(name)).define(`viewof ${name}`, inputs, definition);
    module.variable().define(name, [`viewof ${name}`], (inpt) => library.Generators.input(inpt));
  } else {
    const definition = inputsOrDefinition
    module.variable(observer(name)).define(`viewof ${name}`, definition);
    module.variable().define(name, [`viewof ${name}`], (inpt) => library.Generators.input(inpt));
  }
}

/** Hijacked from https://github.com/observablehq/stdlib/blob/main/src/mutable.js */
function Mutable(value) {
  let change;
  return Object.defineProperty(
    library.Generators.observe((_) => {
      change = _;
      if (value !== undefined) change(value);
    }),
    "value",
    {
      get: () => value,
      set: (x) => void change((value = x))
    }
  );
}

export function mutable(name, value) {
  const m = Mutable(value);
  module.variable(observer(name)).define(name, m);
  return m;
}