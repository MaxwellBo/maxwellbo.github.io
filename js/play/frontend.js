import * as play from "./run.js";

export function red(char) {
  return { char, color: "red" }
}

export function white(char) {
  return { char, color: "white" };
}

export function run({ program, settings }) {
  const pre = document.createElement("pre");
  play.run(program, { element: pre, ...settings });
  return pre;
}

/**
 * Given a value between 0 and 1, picks the value progress-wise:
 * 0 being the first element, 1 being the last element. Negative
 * values have their absolute value taken.
 */
export function pick({ value, from }) {
  const v = Math.min(1, Math.abs(value));
  return from[Math.floor(v * from.length - 1)];
}

/**
 * Computes some useful derived variables, that are less sensitive
 * to the dimensions of the grid that is being used.
 */
export function normalize({ coord, context }) {
  return {
    // 0 leftmost, 1 rightmost
    x: coord.x / context.cols,
    // 0 topmost, 1 bottomost
    y: coord.y / context.rows,
    // ms to s
    t: context.time / 1000,
    // index of char
    i: coord.y * context.cols + coord.x
  };
}
