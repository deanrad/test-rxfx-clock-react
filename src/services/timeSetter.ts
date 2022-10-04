import { createService, createBlockingService, Observable } from "omnibus-rxjs";
import { after, concat } from "omnibus-rxjs";
import { Action } from "typescript-fsa";
import { EMPTY, of, interval } from "rxjs";
import { filter, map, mapTo, switchMap } from "rxjs/operators";
import { fromEvent } from "rxjs";
import { bus } from "../bus";

type Increment = { field: "h" | "m" };
/** Begins/ends the setting process */
export const TIME_SET = "time/set";
/** Conveys an increment of either hour or minute */
export const TIME_INCREMENT = "time/increment";

export const initialState = {
  hour: new Date().getHours(),
  min: new Date().getMinutes()
};

export const reducer = (s = initialState, inc: Action<Increment>) => {
  switch (inc?.payload?.field) {
    case "h":
      return { hour: (s.hour + 1) % 24, min: s.min };
    case "m":
      return { hour: s.hour, min: (s.min + 1) % 60 };
    default:
      return s;
  }
};

// cheap and easy simulation to get you off and running
function handleTimeSetMock() {
  return concat(
    after(0, { field: "m" }),
    after(1000, { field: "m" }),
    after(1000, { field: "m" })
  );
}

function handleTimeSetReal() {
  return fromEvent<KeyboardEvent>(document, "keydown").pipe(
    filter(({ key }) => key === "h" || key === "m"),
    map(({ key }) => ({ field: key } as Increment))
  );
}

bus.listenToggling(
  ({ type }) => type === TIME_SET,
  () =>
    new Observable(() => {
      document.body.classList.add("isSetting");
      return () => document.body.classList.remove("isSetting");
    })
);

// Between time/set, propogate changes
bus.listenToggling(
  ({ type }) => type === TIME_SET,
  handleTimeSetReal,
  bus.observeWith({
    next(i) {
      return { type: TIME_INCREMENT, payload: i };
    }
  })
);
