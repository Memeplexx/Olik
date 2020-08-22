import { integrateStoreWithReduxDevtools } from './devtools';
import { AvailableOps, Fetcher, Options, StoreResult } from './shape';

const skipProxyCheck = Symbol();

export function makeStore<S>(state: S, devtoolsName?: string, devtoolsOptions?: { maxAge?: number }) {
  const pathSegments = new Array<string>();
  const changeListeners = new Map<(arg: S) => any, (ar: any) => any>();
  const fetchers = new Map<string, Fetcher<any, any>>();
  let mutableStateCopy = deepCopy(state);
  let segGatherer = defineSegGatherer(mutableStateCopy);
  let currentState = deepFreeze(state) as S;
  let devtoolsDispatchListener: ((action: { type: string, payload?: any }) => any) | undefined;
  const actionReplace = <C>(selector: (s: S) => C, name: string) => (assignment: C, options?: Options) => {
    readPathOfSelector(selector);
    if (!pathSegments.length) { // user must be performing a root update
      updateState<S, C>(selector, `replace()`, assignment,
        old => deepCopy(assignment),
        old => {
          if(Array.isArray(old)) {
            old.length = 0; Object.assign(old, assignment);
          } else {
            Object.assign(old, assignment);
          }
        }, { overrideActionName: true, dontTrackWithDevtools: options && options.dontTrackWithDevtools });
      return;
    }
    const lastSeg = pathSegments[pathSegments.length - 1] || '';
    const segsCopy = pathSegments.slice(0, pathSegments.length - 1);
    const selectorRevised = (state: any) => {
      let res = state;
      segsCopy.forEach(seg => res = res[seg]);
      return res;
    }
    updateState<S, C>(selectorRevised, `${pathSegments.join('.')}.${name}()`, assignment,
      old => Array.isArray(old) ? old.map((o, i) => i === +lastSeg ? deepCopy(assignment) : o) : ({ ...old, [lastSeg]: deepCopy(assignment) }),
      old => old[lastSeg] = assignment, { overrideActionName: true });
  };
  const action = <C, X extends C & Array<any>>(selector: (s: S) => C) => ({
    replace: actionReplace(selector, 'replace'),
    replaceAll: actionReplace(selector, 'replaceAll'),
    patch: (assignment: Partial<C>) => updateState<S, C>(selector, 'patch', assignment,
      old => ({ ...old, ...assignment }),
      old => Object.assign(old, assignment)),
    patchWhere: (where: (e: X) => boolean) => ({
      with: (partial: Partial<X[0]>) => {
        const items = (selector(currentState) as any as X).filter(where);
        updateState<S, C>(selector, 'patchWhere', partial,
          (old: X) => old.map(o => items.includes(o) ? { ...o, ...partial } : o),
          (old: X) => old.forEach((o, i) => { if (items.includes(o)) { items[i] = Object.assign(o, partial); } }));
      }
    }),
    replaceMany: (where: (e: X) => boolean) => ({
      with: (element: X[0]) => {
        const items = (selector(currentState) as any as X).filter(where);
        updateState<S, C>(selector, 'replaceMany', element,
          (old: X) => old.map(o => items.includes(o) ? element : o),
          (old: X) => old.forEach((o, i) => { if (items.includes(o)) { items[i] = element; } }));
      }
    }),
    insertAfter: (...assignment: X) => updateState<S, C>(selector, 'insertAfter', assignment,
      old => [...old, ...deepCopy(assignment)],
      old => assignment.forEach((a: any) => old.push(a))),
    insertBefore: (...assignment: X) => updateState<S, C>(selector, 'insertBefore', assignment,
      old => [...deepCopy(assignment), ...old],
      old => old.unshift(assignment)),
    removeFirst: () => updateState<S, C>(selector, 'removeFirst', (selector(currentState) as any as X).slice(1),
      old => old.slice(1, old.length),
      old => old.shift()),
    removeLast: () => {
      const selection = selector(currentState) as any as X;
      updateState<S, C>(selector, 'removeLast', selection.slice(0, selection.length - 1),
        old => old.slice(0, old.length - 1),
        old => old.pop());
    },
    removeAll: () => updateState<S, C>(selector, 'removeAll', null,
      () => [],
      old => old.length = 0),
    removeWhere: (predicate: (arg: X[0]) => boolean) => updateState<S, C>(selector, 'removeWhere', (selector(currentState) as any as X).filter(predicate),
      old => old.filter((o: any) => !predicate(o)),
      (old: any[]) => {
        const toRemove = old.filter(predicate, skipProxyCheck);
        for (var i = 0; i < old.length; i++) {
          if (toRemove.includes(old[i])) {
            old.splice(i, 1);
            i--;
          }
        }
      }),
    filter: (criteria: (e: X[0]) => boolean) => {
      return action((s: S) => (selector(s) as any as X).filter(criteria, skipProxyCheck) as any as C);
    },
    upsertOne: (criteria: (e: X[0]) => boolean) => ({
      with: (element: X[0]) => {
        const items = (selector(currentState) as any as X).filter(criteria, skipProxyCheck);
        if (items.length > 1) { throw new Error('Cannot upsert more than 1 element') }
        const newSelector = (s: S) => (selector(s) as any as X).filter(criteria, skipProxyCheck) as X;
        return items.length
          ? action(newSelector).replaceOne(criteria).with(element)
          : action(newSelector).insertAfter(element);
      }
    }),
    replaceOne: (criteria: (e: X[0]) => boolean) => ({
      with: (element: X[0]) => {
        const items = (selector(currentState) as any as X).filter(criteria, skipProxyCheck);
        if (!items.length) { throw new Error('Cannot find element to update') }
        if (items.length > 1) { throw new Error('Cannot update more than 1 element') }
        const newSelector = (s: S) => (selector(s) as any as X).filter(criteria, skipProxyCheck) as X;
        return actionReplace(newSelector, 'replaceOne')(element);
      }
    }),
    createFetcher: (promise: () => Promise<C>, specs: { cacheForMillis: number } = { cacheForMillis: 0 }) => {
      const otherFetchers = new Array<{ resolve: (c: C) => void, reject: (e: any) => void }>();
      readPathOfSelector(selector);
      const path = pathSegments.join('.');
      if (fetchers.get(path)) { return fetchers.get(path); }
      let lastFetch = 0;
      const result = new (class {
        store = storeResult;
        status: 'pristine' | 'error' | 'resolved' | 'resolving' = 'pristine';
        invalidateCache = () => { lastFetch = 0; }
        fetch = () => {
          const cacheHasExpired = (lastFetch + (specs.cacheForMillis || 0)) < Date.now();
          if ((this.status === 'resolved') && !cacheHasExpired) {
            return Promise.resolve(selector(storeResult.read()));
          } else if (this.status === 'resolving') {
            return new Promise<C>((resolve, reject) => otherFetchers.push({ resolve, reject }));
          } else {
            this.status = 'resolving';
            return promise()
              .then(response => {
                this.status = 'resolved';
                const piece = storeResult.select(selector) as any as { replace: (c: C) => void } & { replaceAll: (c: C) => void };
                if (piece.replaceAll) { piece.replaceAll(response); } else { piece.replace(response); }
                lastFetch = Date.now();
                otherFetchers.forEach(f => f.resolve(response));
                otherFetchers.length = 0;
                return selector(storeResult.read());
              }).catch(rejection => {
                this.status = 'error';
                otherFetchers.forEach(f => f.reject(rejection));
                otherFetchers.length = 0;
                throw rejection;
              })
          }
        }
      })();
      fetchers.set(path, result);
      return result;
    },
    onChange: (performAction: (selection: C) => any) => {
      changeListeners.set(selector, performAction);
      return { unsubscribe: () => changeListeners.delete(selector) };
    },
  } as any as AvailableOps<S, C>);

  const storeResult = {
    read: () => currentState,
    select: <C = S>(selector: ((s: S) => C) = (s => s as any as C)) => {
      const selectorMod = selector as (s: S) => C;
      selectorMod(currentState);
      return action(selectorMod);
    },
    setDevtoolsDispatchListener: (listener: (action: { type: string, payload?: any }) => any) => devtoolsDispatchListener = listener,
  } as StoreResult<S>;

  function updateState<S, C>(
    selector: (s: S) => C,
    actionName: string,
    payload: any,
    action: (newNode: any) => any,
    mutator: (newNode: any) => any,
    options: {
      overrideActionName?: boolean,
      dontTrackWithDevtools?: boolean,
    } = {
      dontTrackWithDevtools: false,
      overrideActionName: false,
    },
  ) {
    readPathOfSelector(selector);
    const result = deepFreeze(copyObject(currentState, { ...currentState }, pathSegments.slice(), action));
    notifySubscribers(result);
    mutator(selector(mutableStateCopy));
    segGatherer = defineSegGatherer(mutableStateCopy);
    currentState = result;
    const actionToDispatch = {
      type: options && options.overrideActionName ? actionName : ((pathSegments.join('.') + (pathSegments.length ? '.' : '') + actionName + '()')),
      payload,
    };
    // console.log(actionToDispatch.type);
    if (devtoolsDispatchListener && !options.dontTrackWithDevtools) {
      devtoolsDispatchListener(actionToDispatch);
    }
  }

  function defineSegGatherer<S extends object>(state: S): S {
    if (typeof(state) !== 'object') { // may happen if we have a top-level primitive
      return null as any as S;
    }
    return new Proxy(state, {
      get: function(target, prop: any) {
        const val = (target as any)[prop];
        if (val !== null && typeof (val) === 'object') {
          pathSegments.push(prop);
          return defineSegGatherer(val);
        } else if (typeof (val) === 'function') {
          return function (...args: any[]) {
            if (prop !== 'filter' || args[1] !== skipProxyCheck) {
              throw new Error(
                `'select(...${prop}())' detected. Rather complete the 'select()' statement and chain another library function to find the node(s) you want to update`);
            }
            const filtered = val.apply(target, args) as any[];
            const indices = (target as any[]).map((e, i) => filtered.includes(e) ? i : null).filter(e => e !== null, skipProxyCheck) as number[];
            pathSegments.push(indices.toString());
            return filtered;
          };
        }
        pathSegments.push(prop);
        return val;
      },
    });
  }

  function copyObject<T>(oldObj: T, newObj: T, segs: string[], action: (newNode: any) => any): any {
    const seg = (segs as (keyof T)[]).shift();
    if (seg) {
      if ((seg as string).includes(',') || !isNaN(seg as any)) {
        const arrayIndices = (seg as string).split(',').map(e => +e);
        return (oldObj as any as any[]).map((e, i) => arrayIndices.includes(i)
          ? { ...(oldObj as any)[i], ...copyObject((oldObj as any)[i], (newObj as any)[i], segs, action) }
          : e);
      }
      return { ...oldObj, [seg]: copyObject(oldObj[seg], newObj[seg], segs, action) };
    } else {
      return action(oldObj);
    }
  }

  function notifySubscribers(result: S) {
    changeListeners.forEach((subscriber, selector) => {
      const selected = selector(result);
      if (selector(currentState) !== selected) {
        subscriber(selected);
      }
    })
  }

  function readPathOfSelector<S, C>(selector: (state: S) => C) {
    pathSegments.length = 0;
    selector(segGatherer);
  }

  if (devtoolsName) {
    integrateStoreWithReduxDevtools<S>(storeResult, { name: devtoolsName, ...devtoolsOptions });
  }

  return storeResult as Omit<typeof storeResult, 'setDevtoolsDispatchListener'>;
}

function deepFreeze(o: any) {
  Object.freeze(o);
  Object.getOwnPropertyNames(o).forEach(prop => {
    if (o.hasOwnProperty(prop)
      && o[prop] !== null
      && (typeof o[prop] === "object" || typeof o[prop] === "function")
      && !Object.isFrozen(o[prop])) {
      deepFreeze(o[prop]);
    }
  });
  return o;
}

function deepCopy(o: any): any {
  let newO;
  let i: any;
  if (typeof o !== 'object') { return o; }
  if (!o) { return o; }
  if ('[object Array]' === Object.prototype.toString.apply(o)) {
    newO = [];
    for (i = 0; i < o.length; i += 1) {
      newO[i] = deepCopy(o[i]);
    }
    return newO;
  }
  newO = {} as any;
  for (i in o) {
    if (o.hasOwnProperty(i)) {
      newO[i] = deepCopy(o[i]);
    }
  }
  return newO;
}
