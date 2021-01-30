import { devtoolsDebounce, errorMessages } from './consts';
import { integrateStoreWithReduxDevtools } from './devtools';
import {
  ArrayOfObjectsAction,
  PredicateOptionsCommon,
  DeepReadonly,
  FindOrFilter,
  FunctionReturning,
  PredicateOptionsForNumber,
  OptionsForMakingAStore,
  OptionsForMakingAStoreEnforcingTags,
  OptionsForReduxDevtools,
  Predicate,
  Selector,
  SelectorFromANestedStore,
  SelectorFromAStore,
  SelectorFromAStoreEnforcingTags,
  Store,
  StoreForAnArray,
  StoreForAnObject,
  StoreForAnObjectOrPrimitive,
  StoreOrDerivation,
  StoreWhichIsNested,
  StoreWhichIsNestedInternal,
  StoreWhichIsResettable,
  StoreWhichMayContainNestedStores,
  PredicateOptionsForString,
  Tag,
  Trackability,
} from './shape';
import { tests } from './tests';
import { copyObject, copyPayload, createPathReader, deepCopy, deepFreeze, validateState } from './utils';

let nestedContainerStore: ((selector?: ((s: any) => any) | undefined) => StoreWhichMayContainNestedStores<any, any, any>) | undefined;

/**
 * Creates a new store which, for typescript users, requires that users supply an additional 'tag' when performing a state update.
 * These tags can improve the debugging experience by describing the source of an update event, for example the name of the component an update was trigger from.
 * @param state the initial state  
 * @param options some additional configuration options
 * 
 * @example
 * ```
 * const get = setEnforceTags({ todos: Array<{ id: number, text: string }>() });
 * 
 * // Note that when updating state, we are now required to supply a string as the last argument (in this case 'TodoDetailComponent')
 * get(s => s.todos)
 *   .patchWhere(t => t.id === 1)
 *   .with({ text: 'bake cookies' }, 'TodoDetailComponent')
 * ```
 */
export function setEnforceTags<S>(state: S, options: OptionsForMakingAStoreEnforcingTags = {}): SelectorFromAStoreEnforcingTags<S> {
  return makeInternalRootStore<S, 'tagged'>(state, { ...options, supportsTags: true });
}

/**
 * Creates a new store
 * @param state the initial state
 * @param options some additional configuration options
 * 
 * @example
 * ```
 * const select = set({ todos: Array<{ id: number, text: string }>() });
 * ```
 */
export function set<S>(state: S, options: OptionsForMakingAStore = {}): SelectorFromAStore<S> {
  return makeInternalRootStore<S, 'untagged'>(state, { ...options, supportsTags: false });
}

/**
 * Creates a new store which can be (but doesn't have to be) nested inside your application store.
 * If an existing store is already defined as `make({...}, { containerForNestedStores: true });`
 * then this store will be automatically nested within that store, under the property `nested`.
 * If the opposite is true, then a new top-level store will be registered within the devtools
 * @param state The initial state
 * @param options A configuration object which, at minimum, must contain the `name` of the nested store
 */
export function setNested<L>(state: L, options: { name: string, storeKey?: string | ((previousKey?: string) => string) }): SelectorFromANestedStore<L> {
  const name = options.name;
  if (!nestedContainerStore) {
    return (<C = L>(selector?: (arg: DeepReadonly<L>) => C) => (selector
      ? makeInternal(state, { devtools: { name }, supportsTags: false })(selector)
      : null)) as SelectorFromANestedStore<L>;
  }
  const generateKey = (arg?: string) => (!arg && !options.storeKey) ? '0' :
    !options.storeKey ? (+arg! + 1).toString() : typeof (options.storeKey) === 'function' ? options.storeKey(arg) : options.storeKey;
  const wrapperState = nestedContainerStore().read();
  let key: string;
  if (!nestedContainerStore().read().nested) {
    key = generateKey();
    nestedContainerStore().patch({ nested: { [name]: { [key]: state } } });
    nestedContainerStore().renew({ ...wrapperState, nested: { [name]: { [key]: state } } });
  } else if (!nestedContainerStore().read().nested[name]) {
    key = generateKey();
    nestedContainerStore(s => s.nested).patch({ [name]: { [key]: state } });
    nestedContainerStore().renew({ ...wrapperState, nested: { ...wrapperState.nested, [name]: { [key]: state } } });
  } else {
    const values = nestedContainerStore(s => s.nested[name]).read();
    const keys = Object.keys(values);
    key = generateKey(keys[keys.length - 1]);
    nestedContainerStore(s => s.nested[name]).patch({ [key]: state });
    nestedContainerStore().renew({ ...wrapperState, nested: { ...wrapperState.nested, [name]: { ...wrapperState.nested[name], [key]: state } } });
  }
  return (<C = L>(selector?: (arg: L) => C) => {
    const lStore = nestedContainerStore!(s => {
      const libState = s.nested[name][key];
      return selector ? selector(libState) : libState;
    }) as any as StoreWhichIsNestedInternal<L, C>;
    lStore.removeFromContainingStore = lStore.defineRemoveNestedStore(name, key);
    lStore.reset = lStore.defineReset(state);
    return lStore as StoreWhichIsNested<C>;
  }) as unknown as SelectorFromANestedStore<L>;
}

function makeInternalRootStore<S, T extends Trackability>(state: S, options: { containerForNestedStores?: boolean, supportsTags: boolean, devtools?: OptionsForReduxDevtools | false, tagSanitizer?: (tag: string) => string }) {
  const store = makeInternal<S, T>(state, { devtools: options.devtools === undefined ? {} : options.devtools, supportsTags: options.supportsTags, tagSanitizer: options.tagSanitizer });
  if (options.containerForNestedStores) {
    if ((typeof (state) !== 'object') || Array.isArray(state)) {
      throw new Error(errorMessages.INVALID_CONTAINER_FOR_NESTED_STORES);
    }
    nestedContainerStore = store as any;
  }
  return store;
}

function makeInternal<S, T extends Trackability>(state: S, options: { supportsTags: boolean, devtools: OptionsForReduxDevtools | false, tagSanitizer?: (tag: string) => string }) {
  validateState(state);
  const changeListeners = new Map<(ar: any) => any, (arg: S) => any>();
  let pathReader = createPathReader(state);
  let currentState = deepFreeze(state) as S;
  let initialState = currentState;
  let devtoolsDispatchListener: ((action: { type: string, payload?: any }) => any) | undefined;
  const setDevtoolsDispatchListener = (listener: (action: { type: string, payload?: any }) => any) => devtoolsDispatchListener = listener;
  const replace = <C, T extends Trackability>(selector: Selector<S, C>, name: string) => (payload: C | FunctionReturning<C>, tag: Tag<T>) => {
    const pathSegments = pathReader.readSelector(selector);
    const { payloadFrozen, payloadCopied, payloadFunction } = copyPayload(payload);
    let payloadReturnedByFn: C;
    let getPayloadFn = (() => payloadReturnedByFn ? { replacement: payloadReturnedByFn } : payloadReturnedByFn) as unknown as () => C;
    if (!pathSegments.length) {
      updateState({
        selector,
        replacer: old => {
          if (payloadFunction) {
            payloadReturnedByFn = payloadFunction(old);
            return payloadReturnedByFn;
          } else {
            return payloadFrozen;
          }
        },
        mutator: old => {
          const newValue = payloadFunction ? payloadFunction(old as any) : payloadCopied;
          if (Array.isArray(old)) {
            (old as Array<any>).length = 0;
            Object.assign(old, newValue);
          } else if (typeof (old) === 'boolean' || typeof (old) === 'number' || typeof (old) === 'string') {
            pathReader.mutableStateCopy = newValue as any;
          } else {
            Object.assign(old, newValue);
          }
        },
        actionName: `${name}()`,
        pathSegments: [],
        payload: {
          replacement: payloadFrozen,
        },
        getPayloadFn,
        tag,
      });
    } else {
      const lastSeg = pathSegments[pathSegments.length - 1] || '';
      const segsCopy = pathSegments.slice(0, pathSegments.length - 1);
      const selectorRevised = (((state: S) => {
        let res = state as Record<any, any>;
        segsCopy.forEach(seg => res = res[seg]);
        return res;
      })) as Selector<S, C>;
      const actionName = `${pathSegments.join('.')}${pathSegments.length ? '.' : ''}${name}()`;
      updateState({
        selector: selectorRevised,
        replacer: old => {
          if (Array.isArray(old)) { return (old as Array<any>).map((o, i) => i === +lastSeg ? payloadCopied : o); }
          if (payloadFunction) { payloadReturnedByFn = payloadFunction((old as any)[lastSeg]); }
          return ({ ...old, [lastSeg]: payloadFunction ? payloadFunction((old as any)[lastSeg]) : payloadCopied })
        },
        mutator: (old: Record<any, any>) => old[lastSeg] = payloadReturnedByFn || payloadCopied,
        actionName,
        actionNameOverride: true,
        pathSegments: segsCopy,
        // payload: payloadFrozen,
        payload: {
          replacement: payloadFrozen,
        },
        getPayloadFn,
        tag,
      })
    }
    return payloadCopied;
  };
  const action = <C, X extends C & Array<any>>(selector: Selector<S, C, X>) => {
    const findOrFilter = (type: FindOrFilter) => {
      const whereClauseSpecs = new Array<{ filter: (arg: X[0]) => boolean, type: 'and' | 'or' | '' }>();
      const whereClauseStrings = new Array<string>();
      const recurseWhere = (getProp => {
        const allIllegalChars = ['=', '<,', '>', '&', '|'];
        const fnToString = (getProp || '').toString();
        const illegalChars = allIllegalChars.filter(c => fnToString.includes(c));
        if (illegalChars.length) {
          throw new Error(errorMessages.ILLEGAL_CHARACTERS_WITHIN_SELECTOR(illegalChars));
        }
        const segs = !getProp ? [] : createPathReader((selector(currentState) as X)[0] || {}).readSelector(getProp);
        const criteria = (arg: X[0], fn: (arg: X[0]) => boolean) => {
          segs.forEach(seg => arg = arg[seg]);
          return fn(arg);
        };
        const bundleCriteria = (arrayElement: X[0]) => {
          const ors = new Array<(arg: X[0]) => boolean>();
          for (let i = 0; i < whereClauseSpecs.length; i++) {
            if (whereClauseSpecs[i].type === 'and') {
              let andsPassed = true;
              while (andsPassed && whereClauseSpecs[i].type === 'and') {
                andsPassed = whereClauseSpecs[i].filter(arrayElement);
                i++;
              }
              ors.push(() => andsPassed);
            } else {
              if ((whereClauseSpecs[i].type === 'or') || (whereClauseSpecs[i].type === '')) {
                ors.push(whereClauseSpecs[i].filter);
              }
            }
          }
          return ors.some(fn => fn(arrayElement));
        }
        const completeWhereClause = (whereClauseString: string, fn: (e: X[0]) => boolean) => {
          whereClauseStrings.push(whereClauseString);
          whereClauseSpecs.push({ filter: o => criteria(o, fn), type: '' });
          const result = type === 'find'
            ? [(selector(currentState) as X).findIndex(e => bundleCriteria(e))]
            : (selector(currentState) as X).map((e, i) => bundleCriteria(e) ? i : null).filter(i => i !== null) as number[];
          return result;
        }
        const constructActions = (whereClauseString: string, fn: (e: X[0]) => boolean) => ({
          and: prop => {
            whereClauseStrings.push(`${whereClauseString} &&`);
            whereClauseSpecs.push({ filter: o => criteria(o, fn), type: 'and' });
            return recurseWhere(prop);
          },
          or: prop => {
            whereClauseStrings.push(`${whereClauseString} ||`);
            whereClauseSpecs.push({ filter: o => criteria(o, fn), type: 'or' });
            return recurseWhere(prop);
          },
          replace: (replacement, tag) => {
            const { payloadFrozen, payloadCopied } = copyPayload(replacement);
            const elementIndices = completeWhereClause(whereClauseString, fn);
            updateState({
              selector,
              replacer: old => old.map((o, i) => elementIndices.includes(i) ? payloadFrozen : o),
              mutator: old => { old.forEach((o, i) => { if (elementIndices.includes(i)) { old[i] = payloadCopied; } }) },
              actionName: `${type}().replace()`,
              payload: {
                where: whereClauseStrings.join(' '),
                replacement: payloadFrozen,
              },
              tag,
            })
          },
          patch: (payload, tag) => {
            const { payloadFrozen, payloadCopied } = copyPayload(payload);
            const elementIndices = completeWhereClause(whereClauseString, fn);
            updateState({
              selector,
              replacer: old => old.map((o, i) => elementIndices.includes(i) ? { ...o, ...payloadFrozen } : o),
              mutator: old => elementIndices.forEach(i => Object.assign(old[i], payloadCopied)),
              actionName: `${type}().patch()`,
              payload: {
                where: whereClauseStrings.join(' '),
                patch: payloadFrozen,
              },
              tag,
            });
          },
          remove: tag => {
            const elementIndices = completeWhereClause(whereClauseString, fn);
            updateState<C, T, X>({
              selector,
              replacer: old => old.filter((o, i) => !elementIndices.includes(i)),
              mutator: old => {
                const toRemove = type === 'find' ? [old.find(bundleCriteria)] : old.filter(bundleCriteria);
                for (var i = 0; i < old.length; i++) {
                  if (toRemove.includes(old[i])) {
                    old.splice(i, 1); i--;
                  }
                }
              },
              actionName: `${type}().remove()`,
              payload: {
                where: whereClauseStrings.join(' '),
                toRemove: (selector(currentState) as X).filter((e, i) => elementIndices.includes(i)),
              },
              tag,
            });
          },
          onChange: performAction => {
            whereClauseSpecs.push({ filter: o => criteria(o, fn), type: '' });
            changeListeners.set(performAction, nextState => deepFreeze(type === 'find'
              ? (selector(nextState) as X).find(e => bundleCriteria(e))
              : (selector(nextState) as X).map(e => bundleCriteria(e) ? e : null).filter(e => e !== null)));
            return { unsubscribe: () => changeListeners.delete(performAction) };
          },
          read: () => {
            whereClauseSpecs.push({ filter: o => criteria(o, fn), type: '' });
            return deepFreeze(type === 'find'
              ? (selector(currentState) as X).find(e => bundleCriteria(e))
              : (selector(currentState) as X).map(e => bundleCriteria(e) ? e : null).filter(e => e != null));
          },
        } as ArrayOfObjectsAction<X, any, T>);
        return {
          ...{
            eq: val => constructActions(`${segs.join('.')} === ${JSON.stringify(val)}`, (e: X[0]) => e === val),
            ne: val => constructActions(`${segs.join('.')} !== ${JSON.stringify(val)}`, (e: X[0]) => e !== val),
            in: val => constructActions(`[${val.join(', ')}].includes(${segs.join('.')})`, (e: X[0]) => val.includes(e)),
            ni: val => constructActions(`![${val.join(', ')}].includes(${segs.join('.')})`, (e: X[0]) => !val.includes(e)),
          } as PredicateOptionsCommon<X, any, any, T>,
          ...{
            gt: val => constructActions(`${segs.join('.')} > ${val}`, (e: X[0]) => e > val),
            lt: val => constructActions(`${segs.join('.')} < ${val}`, (e: X[0]) => e < val),
          } as PredicateOptionsForNumber<X, any, any, T>,
          ...{
            match: val => constructActions(`${segs.join('.')}.match(${val})`, (e: X[0]) => e.match(val)),
          } as PredicateOptionsForString<X, any, any, T>,
        };
      }) as StoreForAnArray<X, T>['filter'];
      return recurseWhere;
    };
    const findOrFilterCustom = (type: FindOrFilter) => (predicate => {
      const getElementIndices = (action: string) => {
        const elementIndices = type === 'find'
          ? [(selector(currentState) as X).findIndex(e => predicate(e))]
          : (selector(currentState) as X).map((e, i) => predicate(e) ? i : null).filter(i => i !== null) as number[];
        if (type === 'find' && elementIndices[0] === -1) { throw new Error(errorMessages.NO_ARRAY_ELEMENT_FOUND(action)); }
        return elementIndices;
      }
      return {
        remove: tag => {
          const elementIndices = getElementIndices('remove');
          updateState({
            selector,
            replacer: old => old.filter((o, i) => !elementIndices.includes(i)),
            mutator: old => {
              if (type === 'find') {
                old.splice(elementIndices[0], 1);
              } else {
                const toRemove = old.filter(predicate);
                for (var i = 0; i < old.length; i++) {
                  if (toRemove.includes(old[i])) {
                    old.splice(i, 1); i--;
                  }
                }
              }
            },
            actionName: `${type}Custom().remove()`,
            payload: { toRemove: (selector(currentState) as X).filter(predicate), where: predicate.toString() },
            tag,
          });
        },
        replace: (payload, tag) => {
          const { payloadFrozen, payloadCopied } = copyPayload(payload);
          const elementIndices = getElementIndices('replace');
          updateState({
            selector,
            replacer: old => old.map((o, i) => elementIndices.includes(i) ? payloadFrozen : o),
            mutator: old => { old.forEach((o, i) => { if (elementIndices.includes(i)) { old[i] = payloadCopied; } }) },
            actionName: `${type}Custom().replace()`,
            payload: {
              where: predicate.toString(),
              replacement: payloadFrozen,
            },
            tag,
          });
        },
        patch: (payload, tag) => {
          const { payloadFrozen, payloadCopied } = copyPayload(payload);
          const elementIndices = getElementIndices('patch');
          updateState({
            selector,
            replacer: old => old.map((o, i) => elementIndices.includes(i) ? { ...o, ...payloadFrozen } : o),
            mutator: old => elementIndices.forEach(i => Object.assign(old[i], payloadCopied)),
            actionName: `${type}Custom().patch()`,
            payload: { patch: payloadFrozen, where: predicate.toString() },
            tag,
          });
        },
        onChange: (performAction => {
          changeListeners.set(performAction, nextState => deepFreeze(type === 'find'
            ? (selector(nextState) as X).find(e => predicate(e))
            : { $filtered: (selector(nextState) as X).filter(e => predicate(e)) }));
          return { unsubscribe: () => changeListeners.delete(performAction) };
        }),
        read: () => deepFreeze(type === 'find'
          ? (selector(currentState) as X).find(e => predicate(e))
          : (selector(currentState) as X).map(e => predicate(e) ? e : null).filter(e => e != null)),
      }
    }) as StoreForAnArray<X, T>['filterCustom'];
    return {
      replace: replace(selector, 'replace'
      ) as StoreForAnObjectOrPrimitive<C, Trackability>['replace'],
      replaceAll: replace(
        selector, 'replaceAll'
      ) as StoreForAnArray<any, Trackability>['replaceAll'],
      reset: (
        tag => replace(selector, 'reset')(selector(initialState), tag)
      ) as StoreWhichIsResettable<C, T>['reset'],
      onChange: (performAction => {
        changeListeners.set(performAction, selector);
        return { unsubscribe: () => changeListeners.delete(performAction) };
      }) as StoreOrDerivation<C>['onChange'],
      read: (
        () => deepFreeze(selector(currentState))
      ) as StoreOrDerivation<C>['read'],
      patch: ((payload, tag) => {
        const { payloadFrozen, payloadCopied } = copyPayload(payload);
        updateState({
          selector,
          replacer: old => ({ ...old, ...payloadFrozen }),
          mutator: old => Object.assign(old, payloadCopied),
          actionName: 'patch()',
          payload: {
            patch: payloadFrozen,
          },
          tag,
        });
      }) as StoreForAnObject<C, T>['patch'],
      insert: ((payload, tag) => {
        const { payloadFrozen, payloadCopied } = copyPayload(payload);
        updateState({
          selector,
          replacer: old => [...old, ...(deepCopy(Array.isArray(payloadFrozen) ? payloadFrozen : [payloadFrozen]))],
          mutator: old => old.push(...(Array.isArray(payloadCopied) ? payloadCopied : [payloadCopied])),
          actionName: 'insert()',
          payload: {
            insertion: payloadFrozen,
          },
          tag,
        });
      }) as StoreForAnArray<X, T>['insert'],
      removeAll: (tag => {
        updateState<C, T, X>({
          selector,
          replacer: () => [],
          mutator: old => old.length = 0,
          actionName: 'removeAll()',
          tag,
        });
      }) as StoreForAnArray<X, T>['removeAll'],
      merge: (payload => ({
        match: (getProp, tag) => {
          const segs = !getProp ? [] : createPathReader((selector(currentState) as X)[0] || {}).readSelector(getProp);
          const { payloadFrozen, payloadCopied } = copyPayload(payload);
          let replacementCount = 0;
          let insertionCount = 0;
          updateState({
            selector,
            replacer: old => {
              const replacements = old.map(oe => {
                const found = payloadFrozen.find(ne => getProp(oe) === getProp(ne));
                if (found !== null && found !== undefined) { replacementCount++; }
                return found || oe;
              });
              const insertions = payloadFrozen.filter(ne => !old.some(oe => getProp(oe) === getProp(ne)));
              insertionCount = insertions.length;
              return [
                ...replacements,
                ...insertions
              ];
            },
            mutator: old => {
              old.forEach((oe, oi) => { const found = payloadCopied.find(ne => getProp(oe) === getProp(ne)); if (found) { old[oi] = deepCopy(found); } });
              payloadCopied.filter(ne => !old.some(oe => getProp(oe) === getProp(ne))).forEach(ne => old.push(ne));
            },
            actionName: `merge().match(${segs.join('.')})`,
            payload: null,
            getPayloadFn: () => ({
              argument: payloadFrozen,
              replacementCount,
              insertionCount,
            }),
            tag,
          });
        }
      })) as StoreForAnArray<X, T>['merge'],
      upsert: (payload => ({
        match: (getProp, tag) => {
          const segs = !getProp ? [] : createPathReader((selector(currentState) as X)[0] || {}).readSelector(getProp);
          const { payloadFrozen, payloadCopied } = copyPayload(payload);
          const indices = (selector(currentState) as X).map((e, i) => getProp(e) === getProp(payloadFrozen) ? i : null).filter(i => i !== null) as number[];
          updateState({
            selector,
            replacer: old => !indices.length ? [...old, payloadFrozen] : Object.assign([], old, { [indices[0]]: payloadFrozen }),
            mutator: old => { if (!indices.length) { old.push(payloadCopied) } else { old[indices[0]] = payloadCopied; } },
            actionName: `upsert().match(${segs.join('.')})`,
            payload: {
              matchFound: !!indices.length,
              argument: payloadFrozen,
            },
            tag,
          });
        }
      })) as StoreForAnArray<X, T>['upsert'],
      filterCustom: findOrFilterCustom('filter'),
      findCustom: findOrFilterCustom('find'),
      filter: findOrFilter('filter'),
      find: findOrFilter('find'),
      readInitial: (
        () => selector(initialState)
      ),
      renew: (state => {
        pathReader = createPathReader(state);
        currentState = deepFreeze(state) as S;
      }) as StoreWhichMayContainNestedStores<S, C, T>['renew'],
      defineRemoveNestedStore: ((name, key) => () => {
        if (!nestedContainerStore) { return; }
        if (Object.keys((currentState as S & { nested: any }).nested[name]).length === 1) {
          updateState({
            selector: ((s: S & { nested: any }) => s.nested) as Selector<S, C>,
            replacer: old => {
              const { [name]: toRemove, ...others } = old as Record<any, any>;
              return others;
            },
            mutator: (s: Record<any, any>) => delete s[name],
            pathSegments: ['nested'],
            actionName: 'removeNested',
            payload: { name, key },
            tag: null as unknown as void,
          })
        } else {
          updateState({
            selector: ((s: S & { nested: any }) => s.nested[name]) as Selector<S, C>,
            replacer: old => {
              const { [key]: toRemove, ...others } = old as Record<any, any>;
              return others;
            },
            mutator: (s: Record<any, any>) => delete s[key],
            pathSegments: ['nested', name],
            actionName: 'removeNested',
            payload: key,
            tag: null as unknown as void,
          })
        }
      }) as StoreWhichIsNestedInternal<S, C>['defineRemoveNestedStore'],
      defineReset: (
        (initState: C) => () => replace((e => selector(e)) as Selector<S, C>, 'reset')(initState, null as unknown as T)
      ) as StoreWhichIsNestedInternal<S, C>['defineReset'],
      supportsTags: options.supportsTags,
    } as unknown as Store<C, T>;
  };

  const storeResult = <X extends C & Array<any>, C = S>(selector: ((s: DeepReadonly<S>) => C) = (s => s as any as C)) => {
    const selectorMod = selector as Selector<S, C, X>;
    selectorMod(currentState);
    return action<C, X>(selectorMod) as any;
  };

  const previousAction: {
    timestamp: number,
    type: string,
    payloads: any[],
    debounceTimeout: number,
  } = {
    type: '',
    timestamp: 0,
    payloads: [],
    debounceTimeout: 0,
  };

  function updateState<C, T extends Trackability, X extends C = C>(specs: {
    selector: Selector<S, C, X>,
    replacer: (newNode: DeepReadonly<X>) => any,
    mutator: (newNode: X) => any,
    pathSegments?: string[],
    actionName: string,
    payload?: any,
    tag: Tag<T>,
    actionNameOverride?: boolean,
    getPayloadFn?: () => any,
  }) {
    const previousState = currentState;
    const pathSegments = specs.pathSegments || pathReader.readSelector(specs.selector);
    const result = Object.freeze(copyObject(currentState, { ...currentState }, pathSegments.slice(), specs.replacer));
    specs.mutator(specs.selector(pathReader.mutableStateCopy) as X);
    currentState = result;
    notifySubscribers(previousState, result);
    const actionToDispatch = {
      type: (specs.actionNameOverride ? specs.actionName : (pathSegments.join('.') + (pathSegments.length ? '.' : '') + specs.actionName)) +
        (specs.tag ? ` [${options.tagSanitizer ? options.tagSanitizer(specs.tag as string) : specs.tag}]` : ''),
      payload: (specs.getPayloadFn && (specs.getPayloadFn() !== undefined)) ? specs.getPayloadFn() : specs.payload,
      // ...((specs.getPayloadFn && (specs.getPayloadFn() !== undefined)) ? specs.getPayloadFn() : specs.payload),
    };
    tests.currentAction = actionToDispatch;
    tests.currentMutableState = pathReader.mutableStateCopy as any;
    if (devtoolsDispatchListener && (!specs.tag || (specs.tag !== 'dontTrackWithDevtools'))) {
      const dispatchToDevtools = (payload?: any[]) => {
        const action = payload ? { ...actionToDispatch, payload } : actionToDispatch;
        tests.currentActionForDevtools = action;
        devtoolsDispatchListener!(action);
      }
      if (previousAction.debounceTimeout) {
        window.clearTimeout(previousAction.debounceTimeout);
        previousAction.debounceTimeout = 0;
      }
      if (previousAction.type !== actionToDispatch.type) {
        previousAction.type = actionToDispatch.type;
        previousAction.payloads = [actionToDispatch.payload];
        dispatchToDevtools();
        previousAction.debounceTimeout = window.setTimeout(() => {
          previousAction.type = '';
          previousAction.payloads = [];
        }, devtoolsDebounce);
      } else {
        if (previousAction.timestamp < (Date.now() - devtoolsDebounce)) {
          previousAction.payloads = [actionToDispatch.payload];
        } else {
          previousAction.payloads.push(actionToDispatch.payload);
        }
        previousAction.timestamp = Date.now();
        previousAction.debounceTimeout = window.setTimeout(() => {
          dispatchToDevtools(previousAction.payloads);
          previousAction.type = '';
          previousAction.payloads = [];
        }, devtoolsDebounce);
      }
    }
  }

  function notifySubscribers(oldState: S, newState: S) {
    changeListeners.forEach((selector, subscriber) => {
      const selectedNewState = selector(newState);
      const selectedOldState = selector(oldState);
      if (selectedOldState && selectedOldState.$filtered && selectedNewState && selectedNewState.$filtered) {
        if ((selectedOldState.$filtered.length !== selectedNewState.$filtered.length)
          || !(selectedOldState.$filtered as Array<any>).every(element => selectedNewState.$filtered.includes(element))) {
          subscriber(selectedNewState.$filtered);
        }
      } else if (selectedOldState !== selectedNewState) {
        subscriber(selectedNewState);
      }
    })
  }

  if (options.devtools !== false) {
    integrateStoreWithReduxDevtools<S>(storeResult as any, options.devtools, setDevtoolsDispatchListener);
  }

  return storeResult;
}
