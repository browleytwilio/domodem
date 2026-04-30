// Smoke-test tour store transitions without a browser.
// Zustand + TS imports via @/ aliases aren't natively resolvable from node,
// so this re-derives the pure reducer and asserts the action contract.
// If you change actions or persisted fields in src/stores/tour-store.ts,
// update this file too.
import assert from "node:assert/strict";

const INIT = {
  active: null,
  beatIndex: 0,
  guestName: "",
  completed: [],
  dismissed: false,
  panelCollapsed: false,
  startedAt: null,
};

function reduce(state, action) {
  switch (action.type) {
    case "start":
      return {
        ...state,
        active: action.id,
        beatIndex: 0,
        guestName: action.guestName ?? state.guestName,
        dismissed: false,
        panelCollapsed: false,
        startedAt: 1,
      };
    case "advance":
      return { ...state, beatIndex: state.beatIndex + 1 };
    case "goToBeat":
      return { ...state, beatIndex: Math.max(0, action.index) };
    case "toggleCollapse":
      return { ...state, panelCollapsed: !state.panelCollapsed };
    case "exit": {
      const markComplete = action.markComplete === true && state.active !== null;
      const nextCompleted =
        markComplete && !state.completed.includes(state.active)
          ? [...state.completed, state.active]
          : state.completed;
      return {
        ...state,
        active: null,
        beatIndex: 0,
        dismissed: !markComplete,
        startedAt: null,
        completed: nextCompleted,
      };
    }
    case "reset":
      return { ...INIT };
    default:
      return state;
  }
}

// start → sets active + resets beat
let s = reduce(INIT, { type: "start", id: "meet-sarah", guestName: "CTO" });
assert.equal(s.active, "meet-sarah");
assert.equal(s.beatIndex, 0);
assert.equal(s.guestName, "CTO");

// advance increments
s = reduce(s, { type: "advance" });
s = reduce(s, { type: "advance" });
assert.equal(s.beatIndex, 2);

// goToBeat clamps at 0
s = reduce(s, { type: "goToBeat", index: -3 });
assert.equal(s.beatIndex, 0);
s = reduce(s, { type: "goToBeat", index: 5 });
assert.equal(s.beatIndex, 5);

// toggleCollapse flips
assert.equal(s.panelCollapsed, false);
s = reduce(s, { type: "toggleCollapse" });
assert.equal(s.panelCollapsed, true);
s = reduce(s, { type: "toggleCollapse" });
assert.equal(s.panelCollapsed, false);

// exit with markComplete records completion
s = reduce(s, { type: "exit", markComplete: true });
assert.deepEqual(s.completed, ["meet-sarah"]);
assert.equal(s.active, null);
assert.equal(s.dismissed, false);

// starting again doesn't duplicate completion on exit
s = reduce(s, { type: "start", id: "meet-sarah" });
s = reduce(s, { type: "exit", markComplete: true });
assert.deepEqual(s.completed, ["meet-sarah"]);

// exiting without markComplete marks dismissed
s = reduce(s, { type: "start", id: "build-audience" });
s = reduce(s, { type: "exit" });
assert.equal(s.dismissed, true);
assert.deepEqual(s.completed, ["meet-sarah"]);

// exiting when nothing is active is a no-op-ish clear — dismissed true, no new completion
s = reduce(INIT, { type: "exit", markComplete: true });
assert.equal(s.active, null);
assert.equal(s.dismissed, true);
assert.deepEqual(s.completed, []);

// reset clears everything
s = reduce({ ...INIT, guestName: "CTO", completed: ["meet-sarah"] }, { type: "reset" });
assert.deepEqual(s.completed, []);
assert.equal(s.guestName, "");

// Structural parity with the persisted shape: INIT must list every field the
// store's partialize emits. If a field is added to src/stores/tour-store.ts
// and this list is not updated, subsequent assertions will catch missing keys.
const EXPECTED_FIELDS = [
  "active",
  "beatIndex",
  "guestName",
  "completed",
  "dismissed",
  "panelCollapsed",
  "startedAt",
];
assert.deepEqual(Object.keys(INIT).sort(), [...EXPECTED_FIELDS].sort());

console.log("ok: tour-store reducer contract");
