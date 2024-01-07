import * as React from "react";

// check whether all array items are equal
const isEqual = (a: Array<unknown>, b: Array<unknown>) => {
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) {
      return false;
    }
  }
  return true;
};

// returns a stateful value, that reinitializes once the dependencyList changes
export const useResetState = <T>(
  initialValueOrCreateValue: T | (() => T),
  dependencyList: Array<unknown> = []
): [T, (value: T | ((value: T) => T)) => void] => {
  const [, triggerRerender] = React.useState(0);
  const stateRef = React.useRef({
    state:
      typeof initialValueOrCreateValue === "function"
        ? // @ts-ignore
          initialValueOrCreateValue()
        : initialValueOrCreateValue,
    deps: dependencyList,
  });

  // check if any of the dependencies has changed
  // if so -> recreate state without causing an additional re-render
  if (!isEqual(stateRef.current.deps, dependencyList)) {
    stateRef.current.state =
      typeof initialValueOrCreateValue === "function"
        ? // @ts-ignore
          initialValueOrCreateValue()
        : initialValueOrCreateValue;
    stateRef.current.deps = dependencyList;
  }

  // setState re-implementation that changes the ref and forces a re-render
  const setState = React.useCallback(
    (newState) => {
      const oldState = stateRef.current.state;
      if (typeof newState === "function") {
        stateRef.current.state = newState(stateRef.current.state);
      } else {
        stateRef.current.state = newState;
      }
      // do not trigger render in case the state has not changed
      if (oldState === stateRef.current.state) return;
      triggerRerender((i) => i + 1);
    },
    [triggerRerender]
  );

  return [stateRef.current.state, setState];
};
