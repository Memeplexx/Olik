import {
  FetchArgument,
  FetcherStatus,
  FetchFunction,
  FetchState,
  OptionsForCreatingAFetcher,
  Unsubscribable,
} from './shape';
import { deepCopy, deepFreeze } from './utils';

/**
 * This is a factory function which, when invoked, returns another function which can be used to fetch data asynchronously.
 * For example:
 * ```
 * const fetchTodos = createFetcher({
 *   onStore: select(s => s.todos),
 *   getData: () => fetchTodosFromApiReturningPromise(),
 *   setData: arg => arg.store.addAfter(arg.data),
 *   cacheFor: 1000 * 60 // cache for 60 seconds
 * });
 * fetchTodos().onChangeOnce()
 * .then(state => {
 *   console.log(`Resolved data is: ${state.data}`);
 * })
 * .catch(state => {
 *   console.log(`Rejection is: ${state.error}`);
 * });
 * ```
 */
export const createFetcher = <C, Trackability, X extends (params: any) => Promise<C>, P extends Parameters<X>[0]>(
  specs: OptionsForCreatingAFetcher<C, Trackability, X>,
): FetchFunction<C, Parameters<X>[0], Trackability> => {
  const responseCache = new Map<any, {
    data: C,
    error: any,
    lastFetch: number,
    status: FetcherStatus,
    changeListeners: Array<(fetch: FetchState<C, P, Trackability>) => Unsubscribable>,
    changeOnceListeners: Array<{ resolve: (c: FetchState<C, P, Trackability>) => void, reject: (e: any) => void }>,
    cacheExpiredListeners: Array<(fetch: FetchState<C, P, Trackability>) => Unsubscribable>,
    cacheExpiredOnceListeners: Array<{ resolve: (c: FetchState<C, P, Trackability>) => void, reject: (e: any) => void }>,
    fetches: Array<FetchState<C, P, Trackability>>,
  }>();
  const result = (paramsOrTag: P | string | void, tag: string | void): FetchState<C, P, Trackability> => {
    const supportsTags = (specs.onStore as any).supportsTags;
    const actualTag = supportsTags ? (tag || paramsOrTag) as string : undefined;
    const actualParams = (((supportsTags && tag) || (!supportsTags && paramsOrTag)) ? paramsOrTag : undefined) as FetchArgument<P>;
    const cacheItem = responseCache.get(actualParams) || responseCache.set(actualParams,
      { data: undefined as any as C, error: undefined, lastFetch: 0, status: 'pristine', fetches: [], changeListeners: [], changeOnceListeners: [], cacheExpiredListeners: [], cacheExpiredOnceListeners: [] }).get(actualParams)!;
    const cacheHasExpiredOrPromiseNotYetCalled = (cacheItem.lastFetch + (specs.cacheFor || 0)) < Date.now();
    const invalidateCache = () => {
      cacheItem.data = null as any as C;
      cacheItem.lastFetch = 0;
    }
    const createFetch = () => ({
      data: cacheItem.data,
      fetchArg: actualParams,
      store: specs.onStore,
      error: cacheItem.error,
      status: cacheItem.status,
      invalidateCache,
      refetch: (paramsOrTag: P | string | void, tag: string | void) => {
        invalidateCache();
        return result(paramsOrTag, tag);
      },
      onChange: (listener: () => Unsubscribable) => {
        cacheItem.changeListeners.push(listener);
        return { unsubscribe: () => cacheItem.changeListeners.splice(cacheItem.changeListeners.findIndex(changeListener => changeListener === listener), 1) };
      },
      onCacheExpired: (listener: () => Unsubscribable) => {
        cacheItem.cacheExpiredListeners.push(listener);
        return { unsubscribe: () => cacheItem.cacheExpiredListeners.splice(cacheItem.cacheExpiredListeners.findIndex(expiredListener => expiredListener === listener), 1) };
      },
      onCacheExpiredOnce: () => {
        return new Promise<FetchState<C, P, Trackability>>((resolve, reject) => cacheItem.cacheExpiredOnceListeners.push({ resolve, reject }));
      },
      onChangeOnce: () => {
        return new Promise<FetchState<C, P, Trackability>>((resolve, reject) => cacheItem.changeOnceListeners.push({ resolve, reject }));
      },
    }) as FetchState<C, P, Trackability>;
    if (cacheItem.status === 'resolving') {
      return cacheItem.fetches[cacheItem.fetches.length - 1];
    } else
    if (cacheHasExpiredOrPromiseNotYetCalled) {
      cacheItem.status = 'resolving';
      cacheItem.fetches.forEach(fetch => Object.assign<FetchState<C, P, Trackability>, Partial<FetchState<C, P, Trackability>>>(fetch, { status: cacheItem.status }));
      cacheItem.changeListeners.forEach(changeListener => changeListener(createFetch()));
      let errorThatWasCaughtInPromise: any = null;
      specs.getData(actualParams)
        .then(value => {
          try {
            cacheItem.lastFetch = Date.now();
            if (specs.setData) {
              specs.setData({
                data: value,
                tag: actualTag,
                param: actualParams,
                store: specs.onStore,
              });
            } else {
              const piece = specs.onStore as any as { replace: (c: C, tag: string | void) => void } & { replaceAll: (c: C, tag: string | void) => void };
              if (piece.replaceAll) { piece.replaceAll(value, actualTag); } else { piece.replace(value, actualTag); }
            }
            cacheItem.data = deepFreeze(deepCopy(value));
            cacheItem.error = null;
            cacheItem.status = 'resolved';
            cacheItem.fetches.forEach(fetch => Object.assign<FetchState<C, P, Trackability>, Partial<FetchState<C, P, Trackability>>>(fetch, { status: cacheItem.status, data: value, error: cacheItem.error }));
            cacheItem.changeListeners.forEach(changeListener => changeListener(createFetch()));
            cacheItem.changeOnceListeners.forEach(promise => promise.resolve(createFetch()));
            cacheItem.changeOnceListeners.length = 0;
            setTimeout(() => {
              invalidateCache();  // free memory
              cacheItem.cacheExpiredListeners.forEach(listener => listener(createFetch()));
              cacheItem.cacheExpiredOnceListeners.forEach(listener => listener.resolve(createFetch()));
              cacheItem.cacheExpiredOnceListeners.length = 0;
            }, specs.cacheFor);
          } catch (e) {
            errorThatWasCaughtInPromise = e;
          }
        }).catch(error => {
          try {
            cacheItem.error = error;
            cacheItem.status = 'rejected';
            cacheItem.fetches.forEach(fetch => Object.assign<FetchState<C, P, Trackability>, Partial<FetchState<C, P, Trackability>>>(fetch, { status: cacheItem.status, error }));
            cacheItem.changeListeners.forEach(changeListener => changeListener(createFetch()));
            cacheItem.changeOnceListeners.forEach(promise => promise.reject(error));
            cacheItem.changeOnceListeners.length = 0;
          } catch (e) {
            errorThatWasCaughtInPromise = e;
          }
        }).finally(() => {
          if (errorThatWasCaughtInPromise) {
            throw errorThatWasCaughtInPromise;
          }
        });
    }
    const fetch = createFetch();
    cacheItem.fetches.push(fetch);
    return fetch;
  }
  return result as any;
}