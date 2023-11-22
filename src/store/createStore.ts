import { useSyncExternalStore } from 'react';

type SetterFn<T> = (prevState: T) => Partial<T>;
type SetStateFn<T> = (partialState: Partial<T> | SetterFn<T>) => void;
export function createStore<TState extends Record<string, any>>(
  createState: (setState: SetStateFn<TState>, getState: () => TState) => TState,
) {
  let state: TState;
  let listeners: Set<() => void>;

  function notifyListeners() {
    listeners.forEach((listener) => listener());
  }

  function setState(partialState: Partial<TState> | SetterFn<TState>) {
    const newValue =
      typeof partialState === 'function' ? partialState(state) : partialState;

    state = { ...state, ...newValue };
    notifyListeners();
  }

  function subscribe(listener: () => void) {
    listeners.add(listener);

    return () => {
      listeners.delete(listener);
    };
  }

  function getState() {
    return state;
  }

  function useStore<TValue>(
    selector: (currentState: TState) => TValue,
  ): TValue {
    return useSyncExternalStore(subscribe, () => selector(state));

    /**
     * The code below is the same as the one above, but without the
     * use of the useSyncExternalStore hook.
     */
    // const [value, setValue] = useState(() => selector(state));

    // useEffect(() => {
    //   const unsubscribe = globalStore.subscribe(() => {
    //     const newValue = selector(state);

    //     if (value !== newValue) {
    //       setValue(newValue);
    //     }
    //   });

    //   return () => {
    //     unsubscribe();
    //   };
    // }, [selector, value]);
  }

  state = createState(setState, getState);
  listeners = new Set();

  return useStore;
}
