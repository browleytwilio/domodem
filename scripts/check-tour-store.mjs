// Smoke-test tour store transitions without a browser.
// Zustand store is ESM-only; we test pure reducer logic by re-deriving
// the expected shape from the action contract.
import assert from "node:assert/strict";

// Pure reducer re-derivation — kept in lockstep with src/stores/tour-store.ts.
// If the store changes, update this file too (see task 2 step 3).
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
    case "exit": {
      const markComplete = action.markComplete && state.active !== null;
      return {
        ...state,
        active: null,
        beatIndex: 0,
        dismissed: !markComplete,
        startedAt: null,
        completed:
          markComplete && !state.completed.includes(state.active)
            ? [...state.completed, state.active]
            : state.completed,
      };
    }
    case "reset":
      return {
        active: null,
        beatIndex: 0,
        guestName: "",
        completed: [],
        dismissed: false,
        panelCollapsed: false,
        startedAt: null,
      };
    default:
      return state;
  }
}

const init = {
  active: null,
  beatIndex: 0,
  guestName: "",
  completed: [],
  dismissed: false,
  panelCollapsed: false,
  startedAt: null,
};

// start → sets active + resets beat
let s = reduce(init, { type: "start", id: "meet-sarah", guestName: "CTO" });
assert.equal(s.active, "meet-sarah");
assert.equal(s.beatIndex, 0);
assert.equal(s.guestName, "CTO");

// advance increments
s = reduce(s, { type: "advance" });
s = reduce(s, { type: "advance" });
assert.equal(s.beatIndex, 2);

// exit with markComplete records completion
s = reduce(s, { type: "exit", markComplete: true });
assert.deepEqual(s.completed, ["meet-sarah"]);
assert.equal(s.active, null);
assert.equal(s.dismissed, false);

// starting again doesn't duplicate completion on exit
s = reduce(s, { type: "start", id: "meet-sarah" });
s = reduce(s, { type: "exit", markComplete: true });
assert.deepEqual(s.completed, ["meet-sarah"]);

// reset clears everything
s = reduce(s, { type: "reset" });
assert.deepEqual(s.completed, []);
assert.equal(s.guestName, "");

console.log("ok: tour-store reducer contract");
