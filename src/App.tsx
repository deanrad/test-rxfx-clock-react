import { useReducer } from "react";
import "./styles.css";
import lightFormat from "date-fns/lightFormat";
import add from "date-fns/add";
import { useWhileMounted } from "@rxfx/react";
import { bus } from "./bus";

// Build Order
// 0. UI, date format
// 1. initialState (only 'stateful' - not transient stuff)
// 2. Increment{ field } type, and reducer
// 3. create bus with spy, and service with mock effect - Promise
// 4. invoke the service on pointerDown
// 4.1 make Observable mock effect
// 5. change to createBlockingService (solves race conditions)
// 6. invoke service.cancel on pointerUp (solves cancelability)
// 7. subscribe UI to service#state
// 8. switch mock effect to fromEvent real effect
// 9. 🍾 🥂
// bonus 1 stop service om unmount  (solves leakiness)
// bonus 2 subscribe the UI to service#isActive
// bonus 3 persistenceService({hour, min}) on pointerup (or increment/cancel)

import { initialState, reducer, TIME_SET } from "./services/timeSetter";

function formatTime({ hour, min }: typeof initialState) {
  return lightFormat(
    add(new Date(0), { hours: 6 + hour, minutes: min }),
    "h:mm a"
  );
}

export default function App() {
  useWhileMounted(() =>
    bus.listen(({ type }) => type === "time/increment", dispatch)
  );

  return (
    <div className="App">
      <h2>Set Your Alarm Clock!</h2>
      <p>Press 'h' or 'm', while pressing 'Set Time', to adjust the time.</p>
      <h1>{formatTime(time)}</h1>
      <button
        onPointerDown={() => {
          bus.trigger({ type: TIME_SET, payload: null });
        }}
        onPointerUp={() => {
          bus.trigger({ type: TIME_SET, payload: null });
        }}
      >
        set <b>T</b>ime
      </button>
      <div>
        <a
          className="xlink"
          target="_blank"
          rel="noreferrer"
          href="https://xstate.js.org/viz/?gist=df94010509d4d96b62a51491e85f77e2"
        >
          XState Machine
        </a>
      </div>
    </div>
  );
}
