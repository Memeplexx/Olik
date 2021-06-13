import { errorMessages } from '../src/shared-consts';
import { libState, testState } from '../src/shared-state';
import { createGlobalStore, createNestedStore, createGlobalStoreEnforcingTags } from '../src/store-creators';
import { transact } from '../src/transact';
import { windowAugmentedWithReduxDevtoolsImpl } from './_devtools';

describe('async', () => {

  beforeAll(() => testState.windowObject = windowAugmentedWithReduxDevtoolsImpl);

  beforeEach(() => libState.nestedContainerStore = null);

  const initialState = {
    object: { property: '', property2: '' },
    array: [{ id: 1, value: 'one' }, { id: 2, value: 'two' }, { id: 3, value: 'three' }],
    paginated: {} as { [key: string]: [{ id: number, value: string }] },
    promiseBypassTimes: {} as { [key: string]: string },
  }; 3

  it('should work with replaceAll()', async done => {
    const { select, read } = createGlobalStore(initialState);
    const payload = [{ id: 1, value: 'test' }];
    select(s => s.array)
      .replaceAll(() => new Promise(resolve => setTimeout(() => resolve(payload), 10)), { bypassPromiseFor: 1000 })
      .then(res => {
        expect(res).toEqual(read().array);
        expect(read().array).toEqual(payload);
        const payload2 = [{ id: 1, value: 'testy' }];
        select(s => s.array)
          .replaceAll(() => new Promise(resolve => setTimeout(() => resolve(payload2), 10)))
          .then(() => {
            expect(read().array).toEqual(payload);
            select(s => s.array).stopBypassingPromises();
            select(s => s.array)
              .replaceAll(() => new Promise(resolve => setTimeout(() => resolve(payload2), 10)))
              .then(() => {
                expect(read().array).toEqual(payload2);
                done();
              })
          })
      });
  })

  it('should work with insert()', done => {
    const { select, read } = createGlobalStore(initialState);
    const payload = { id: 1, value: 'test' };
    select(s => s.array)
      .insert(() => new Promise(resolve => setTimeout(() => resolve(payload), 10)), { bypassPromiseFor: 1000 })
      .then(res => {
        expect(res).toEqual(read().array);
        expect(read().array).toEqual([...initialState.array, payload]);
        const payload2 = { id: 1, value: 'testy' };
        select(s => s.array)
          .insert(() => new Promise(resolve => setTimeout(() => resolve(payload2), 10)))
          .then(() => {
            expect(read().array).toEqual([...initialState.array, payload]);
            select(s => s.array).stopBypassingPromises();
            select(s => s.array)
              .insert(() => new Promise(resolve => setTimeout(() => resolve(payload2), 10)))
              .then(() => {
                expect(read().array).toEqual([...initialState.array, payload, payload2]);
                done();
              })
          })
      });
  })

  it('should work with patch()', done => {
    const { select, read } = createGlobalStore(initialState);
    const payload = { property: 'xxx' };
    select(s => s.object)
      .patch(() => new Promise(resolve => setTimeout(() => resolve(payload), 10)), { bypassPromiseFor: 1000 })
      .then(res => {
        expect(res).toEqual(read().object);
        expect(read().object).toEqual({ ...initialState.object, ...payload });
        const payload2 = { property: 'yyy' };
        select(s => s.object)
          .patch(() => new Promise(resolve => setTimeout(() => resolve(payload2), 10)))
          .then(() => {
            expect(read().object).toEqual({ ...initialState.object, ...payload });
            select(s => s.object).stopBypassingPromises();
            select(s => s.object)
              .patch(() => new Promise(resolve => setTimeout(() => resolve(payload2), 10)))
              .then(() => {
                expect(read().object).toEqual({ ...initialState.object, ...payload2 });
                done();
              })
          })
      })
  })

  it('should work with replace()', done => {
    const { select, read } = createGlobalStore(initialState);
    const payload = { property: 'xxx', property2: 'yyy' };
    select(s => s.object)
      .replace(() => new Promise(resolve => setTimeout(() => resolve(payload), 10)), { bypassPromiseFor: 1000 })
      .then(res => {
        expect(res).toEqual(read().object);
        expect(read().object).toEqual(payload);
        const payload2 = { property: 'xxx2', property2: 'yyy2' };
        select(s => s.object)
          .replace(() => new Promise(resolve => setTimeout(() => resolve(payload2), 10)))
          .then(() => {
            expect(read().object).toEqual(payload);
            select(s => s.object).stopBypassingPromises();
            select(s => s.object)
              .replace(() => new Promise(resolve => setTimeout(() => resolve(payload2), 10)))
              .then(() => {
                expect(read().object).toEqual(payload2);
                done();
              })
          })
      })
  })

  it('should work with upsertMatching()', done => {
    const { select, read } = createGlobalStore(initialState);
    const payload = { id: 1, value: 'test' };
    select(s => s.array)
      .upsertMatching(s => s.id)
      .with(() => new Promise(resolve => setTimeout(() => resolve(payload), 10)), { bypassPromiseFor: 1000 })
      .then(res => {
        expect(res).toEqual(read().array);
        expect(read().array).toEqual([payload, initialState.array[1], initialState.array[2]]);
        const payload2 = { id: 1, value: 'testt' };
        select(s => s.array)
          .upsertMatching(s => s.id)
          .with(() => new Promise(resolve => setTimeout(() => resolve(payload2), 10)))
          .then(() => {
            expect(read().array).toEqual([payload, initialState.array[1], initialState.array[2]]);
            select(s => s.array).stopBypassingPromises();
            select(s => s.array)
              .upsertMatching(s => s.id)
              .with(() => new Promise(resolve => setTimeout(() => resolve(payload2), 10)))
              .then(() => {
                expect(read().array).toEqual([payload2, initialState.array[1], initialState.array[2]]);
                done();
              })
          })
      })
  })

  it('should work with findWhere().replace()', done => {
    const { select, read } = createGlobalStore(initialState);
    const payload = { id: 2, value: 'twooo' };
    select(s => s.array)
      .findWhere(s => s.id).eq(2)
      .replace(() => new Promise(resolve => setTimeout(() => resolve(payload), 10)), { bypassPromiseFor: 1000 })
      .then(res => {
        expect(res).toEqual(read().array);
        expect(read().array).toEqual([initialState.array[0], payload, initialState.array[2]]);
        const payload2 = { id: 2, value: 'twooo' };
        select(s => s.array)
          .findWhere(s => s.id).eq(2)
          .replace(() => new Promise(resolve => setTimeout(() => resolve(payload2), 10)))
          .then(() => {
            expect(read().array).toEqual([initialState.array[0], payload, initialState.array[2]]);
            select(s => s.array)
              .findWhere(s => s.id).eq(2)
              .stopBypassingPromises();
            select(s => s.array)
              .findWhere(s => s.id).eq(2)
              .replace(() => new Promise(resolve => setTimeout(() => resolve(payload2), 10)))
              .then(() => {
                expect(read().array).toEqual([initialState.array[0], payload2, initialState.array[2]]);
                done();
              })
          })
      })
  })

  it('should work with filterWhere().replace()', done => {
    const { select, read } = createGlobalStore(initialState);
    const payload = { id: 2, value: 'twooo' };
    select(s => s.array)
      .filterWhere(s => s.id).eq(2)
      .replace(() => new Promise(resolve => setTimeout(() => resolve(payload), 10)), { bypassPromiseFor: 1000 })
      .then(res => {
        expect(res).toEqual(read().array);
        expect(read().array).toEqual([initialState.array[0], payload, initialState.array[2]]);
        const payload2 = { id: 2, value: 'twooo' };
        select(s => s.array)
          .filterWhere(s => s.id).eq(2)
          .replace(() => new Promise(resolve => setTimeout(() => resolve(payload2), 10)))
          .then(() => {
            expect(read().array).toEqual([initialState.array[0], payload, initialState.array[2]]);
            select(s => s.array)
              .filterWhere(s => s.id).eq(2)
              .stopBypassingPromises();
            select(s => s.array)
              .filterWhere(s => s.id).eq(2)
              .replace(() => new Promise(resolve => setTimeout(() => resolve(payload2), 10)))
              .then(() => {
                expect(read().array).toEqual([initialState.array[0], payload2, initialState.array[2]]);
                done();
              })
          })
      })
  })

  it('should work with findWhere().patch()', done => {
    const { select, read } = createGlobalStore(initialState);
    const payload = { value: 'twooo' };
    select(s => s.array)
      .findWhere(s => s.id).eq(2)
      .patch(() => new Promise(resolve => setTimeout(() => resolve(payload), 10)), { bypassPromiseFor: 1000 })
      .then(res => {
        expect(res).toEqual(read().array);
        expect(read().array).toEqual([initialState.array[0], { ...initialState.array[1], ...payload }, initialState.array[2]]);
        const payload2 = { value: 'twoooz' };
        select(s => s.array)
          .findWhere(s => s.id).eq(2)
          .patch(() => new Promise(resolve => setTimeout(() => resolve(payload2), 10)))
          .then(() => {
            expect(read().array).toEqual([initialState.array[0], { ...initialState.array[1], ...payload }, initialState.array[2]]);
            select(s => s.array)
              .findWhere(s => s.id).eq(2)
              .stopBypassingPromises();
            select(s => s.array)
              .findWhere(s => s.id).eq(2)
              .patch(() => new Promise(resolve => setTimeout(() => resolve(payload2), 10)))
              .then(() => {
                expect(read().array).toEqual([initialState.array[0], { ...initialState.array[1], ...payload2 }, initialState.array[2]]);
                done();
              })
          })
      })
  })

  it('should work with filterWhere().patch()', done => {
    const { select, read } = createGlobalStore(initialState);
    const payload = { value: 'twooo' };
    select(s => s.array)
      .filterWhere(s => s.id).eq(2)
      .patch(() => new Promise(resolve => setTimeout(() => resolve(payload), 10)), { bypassPromiseFor: 1000 })
      .then(res => {
        expect(res).toEqual(read().array);
        expect(read().array).toEqual([initialState.array[0], { ...initialState.array[1], ...payload }, initialState.array[2]]);
        const payload2 = { value: 'twoooz' };
        select(s => s.array)
          .filterWhere(s => s.id).eq(2)
          .patch(() => new Promise(resolve => setTimeout(() => resolve(payload2), 10)))
          .then(() => {
            expect(read().array).toEqual([initialState.array[0], { ...initialState.array[1], ...payload }, initialState.array[2]]);
            select(s => s.array)
              .filterWhere(s => s.id).eq(2)
              .stopBypassingPromises();
            select(s => s.array)
              .filterWhere(s => s.id).eq(2)
              .patch(() => new Promise(resolve => setTimeout(() => resolve(payload2), 10)))
              .then(() => {
                expect(read().array).toEqual([initialState.array[0], { ...initialState.array[1], ...payload2 }, initialState.array[2]]);
                done();
              })
          })
      })
  })

  it('should work with findWhere().returnsTrue().replace()', done => {
    const { select, read } = createGlobalStore(initialState);
    const payload = { id: 2, value: 'twooo' };
    select(s => s.array)
      .findWhere(s => s.id === 2).returnsTrue()
      .replace(() => new Promise(resolve => setTimeout(() => resolve(payload), 10)), { bypassPromiseFor: 1000 })
      .then(res => {
        expect(res).toEqual(read().array);
        expect(read().array).toEqual([initialState.array[0], payload, initialState.array[2]]);
        const payload2 = { id: 2, value: 'twooo' };
        select(s => s.array)
          .findWhere(s => s.id === 2).returnsTrue()
          .replace(() => new Promise(resolve => setTimeout(() => resolve(payload2), 10)))
          .then(() => {
            expect(read().array).toEqual([initialState.array[0], payload, initialState.array[2]]);
            select(s => s.array)
              .findWhere(s => s.id === 2).returnsTrue()
              .stopBypassingPromises();
            select(s => s.array)
              .findWhere(s => s.id === 2).returnsTrue()
              .replace(() => new Promise(resolve => setTimeout(() => resolve(payload2), 10)))
              .then(() => {
                expect(read().array).toEqual([initialState.array[0], payload2, initialState.array[2]]);
                done();
              })
          })
      })
  })

  it('should work with filterWhere().returnsTrue().replace()', done => {
    const { select, read } = createGlobalStore(initialState);
    const payload = { id: 2, value: 'twooo' };
    select(s => s.array)
      .filterWhere(s => s.id === 2).returnsTrue()
      .replace(() => new Promise(resolve => setTimeout(() => resolve(payload), 10)), { bypassPromiseFor: 1000 })
      .then(res => {
        expect(res).toEqual(read().array);
        expect(read().array).toEqual([initialState.array[0], payload, initialState.array[2]]);
        const payload2 = { id: 2, value: 'twooo' };
        select(s => s.array)
          .filterWhere(s => s.id === 2).returnsTrue()
          .replace(() => new Promise(resolve => setTimeout(() => resolve(payload2), 10)))
          .then(() => {
            expect(read().array).toEqual([initialState.array[0], payload, initialState.array[2]]);
            select(s => s.array)
              .filterWhere(s => s.id === 2).returnsTrue()
              .stopBypassingPromises();
            select(s => s.array)
              .filterWhere(s => s.id === 2).returnsTrue()
              .replace(() => new Promise(resolve => setTimeout(() => resolve(payload2), 10)))
              .then(() => {
                expect(read().array).toEqual([initialState.array[0], payload2, initialState.array[2]]);
                done();
              })
          })
      })
  })

  it('should work with findWhere().returnsTrue().patch()', done => {
    const { select, read } = createGlobalStore(initialState);
    const payload = { value: 'twooo' };
    select(s => s.array)
      .findWhere(s => s.id === 2).returnsTrue()
      .patch(() => new Promise(resolve => setTimeout(() => resolve(payload), 10)), { bypassPromiseFor: 1000 })
      .then(res => {
        expect(res).toEqual(read().array);
        expect(read().array).toEqual([initialState.array[0], { ...initialState.array[1], ...payload }, initialState.array[2]]);
        const payload2 = { value: 'twoooz' };
        select(s => s.array)
          .findWhere(s => s.id === 2).returnsTrue()
          .patch(() => new Promise(resolve => setTimeout(() => resolve(payload2), 10)))
          .then(() => {
            expect(read().array).toEqual([initialState.array[0], { ...initialState.array[1], ...payload }, initialState.array[2]]);
            select(s => s.array)
              .findWhere(s => s.id === 2).returnsTrue()
              .stopBypassingPromises();
            select(s => s.array)
              .findWhere(s => s.id === 2).returnsTrue()
              .patch(() => new Promise(resolve => setTimeout(() => resolve(payload2), 10)))
              .then(() => {
                expect(read().array).toEqual([initialState.array[0], { ...initialState.array[1], ...payload2 }, initialState.array[2]]);
                done();
              })
          })
      })
  })

  it('should work with filterWhere().returnsTrue().patch()', done => {
    const { select, read } = createGlobalStore(initialState);
    const payload = { value: 'twooo' };
    select(s => s.array)
      .filterWhere(s => s.id === 2).returnsTrue()
      .patch(() => new Promise(resolve => setTimeout(() => resolve(payload), 10)), { bypassPromiseFor: 1000 })
      .then(res => {
        expect(res).toEqual(read().array);
        expect(read().array).toEqual([initialState.array[0], { ...initialState.array[1], ...payload }, initialState.array[2]]);
        const payload2 = { value: 'twoooz' };
        select(s => s.array)
          .filterWhere(s => s.id === 2).returnsTrue()
          .patch(() => new Promise(resolve => setTimeout(() => resolve(payload2), 10)))
          .then(() => {
            expect(read().array).toEqual([initialState.array[0], { ...initialState.array[1], ...payload }, initialState.array[2]]);
            select(s => s.array)
              .filterWhere(s => s.id === 2).returnsTrue()
              .stopBypassingPromises();
            select(s => s.array)
              .filterWhere(s => s.id === 2).returnsTrue()
              .patch(() => new Promise(resolve => setTimeout(() => resolve(payload2), 10)))
              .then(() => {
                expect(read().array).toEqual([initialState.array[0], { ...initialState.array[1], ...payload2 }, initialState.array[2]]);
                done();
              })
          })
      })
  })

  it('should handle a promise rejection', done => {
    const { select, read } = createGlobalStore(initialState);
    const rejection = 'test';
    select(s => s.array)
      .replaceAll(() => new Promise((resolve, reject) => setTimeout(() => reject(rejection), 10)), { bypassPromiseFor: 1000 })
      .catch(err => {
        expect(err).toEqual(rejection);
        done();
      });
  })

  it('should support tags in type', done => {
    const { select, read } = createGlobalStoreEnforcingTags(initialState, { tagsToAppearInType: true });
    const replacement = [{ id: 1, value: 'one' }];
    const tag = 'MyComponent';
    select(s => s.array)
      .replaceAll(() => new Promise(resolve => setTimeout(() => resolve(replacement))), { tag })
      .then(() => {
        expect(testState.currentAction).toEqual({
          type: `array.replaceAll() [${tag}]`,
          replacement,
        });
        done();
      });
  })

  it('should support tags in payload', done => {
    const { select, read } = createGlobalStoreEnforcingTags(initialState);
    const replacement = [{ id: 1, value: 'one' }];
    const tag = 'MyComponent';
    select(s => s.array)
      .replaceAll(() => new Promise(resolve => setTimeout(() => resolve(replacement))), { tag })
      .then(() => {
        expect(testState.currentAction).toEqual({
          type: 'array.replaceAll()',
          replacement,
          tag
        });
        done();
      });
  })

  it('should not be able to support transactions', () => {
    const { select, read } = createGlobalStore(initialState);
    expect(() => transact(
      () => select(s => s.array).replaceAll(() => new Promise(resolve => setTimeout(() => resolve([]), 10))),
    )).toThrowError(errorMessages.PROMISES_NOT_ALLOWED_IN_TRANSACTIONS);
  })

  it('should not be able to support top-level stores', () => {
    const { select, read } = createGlobalStore(0);
    expect(() => select().replace(() => new Promise(resolve => setTimeout(() => resolve(1), 10)), { bypassPromiseFor: 1000 }))
      .toThrowError(errorMessages.INVALID_CONTAINER_FOR_CACHED_DATA);
  })

  it('should automatically clear up expired cache keys', done => {
    const { select, read } = createGlobalStore(initialState);
    const payload = [{ id: 1, value: 'test' }];
    select(s => s.object)
      .replace(() => new Promise(resolve => setTimeout(() => resolve({ property: 'fdfd', property2: 'fdfd' }), 10)), { bypassPromiseFor: 1000 })
    select(s => s.array)
      .replaceAll(() => new Promise(resolve => setTimeout(() => resolve(payload), 10)), { bypassPromiseFor: 10 })
      .then(() => {
        setTimeout(() => {
          expect(Object.keys(read().promiseBypassTimes)).toEqual(['object.replace()']);
          done();
        }, 100);
      });
  })

  it('should work with nested stores', done => {
    const { select, read } = createGlobalStore(initialState);
    const nested = createNestedStore({ prop: '' }, { componentName: 'hello' });
    const payload = 'test';
    nested.select(s => s.prop)
      .replace(() => new Promise(resolve => setTimeout(() => resolve(payload), 10)), { bypassPromiseFor: 1000 })
      .then(() => {
        expect(nested.read().prop).toEqual(payload);
        done();
      });
  })

  it('should de-duplicate simultaneous requests', done => {
    const { select, read } = createGlobalStore(initialState);
    select(s => s.array)
      .replaceAll(() => new Promise(resolve => setTimeout(() => resolve([{ id: 1, value: 'test' }]), 10)));
    setTimeout(() => {
      select(s => s.array)
        .replaceAll(() => new Promise(resolve => setTimeout(() => resolve([{ id: 2, value: 'testy' }]), 10)))
        .then(() => {
          expect(read().array).toEqual([{ id: 1, value: 'test' }]);
          done();
        });
    }, 5)
  })

  it('should be able to paginate', done => {
    const todos = new Array(50).fill(null).map((e, i) => ({ id: i + 1, value: `value ${i + 1}` }));
    const { select, read } = createGlobalStore(initialState);
    select(s => s.paginated[0])
      .replaceAll(() => new Promise(resolve => setTimeout(() => resolve(todos.slice(0, 10)))))
      .then(() => {
        expect(read().paginated[0]).toEqual(todos.slice(0, 10));
        select(s => s.paginated[1])
          .replaceAll(() => new Promise(resolve => setTimeout(() => resolve(todos.slice(10, 20)))))
          .then(() => {
            expect(read().paginated[1]).toEqual(todos.slice(10, 20));
            select(s => s.paginated)
              .replace({});
            expect(read().paginated).toEqual({});
            done();
          })
      })
  })

  it('should not bypass a promise if it has been rejected', done => {
    const { select, read } = createGlobalStore(initialState);
    const payload = [{ id: 1, value: 'one' }];
    select(s => s.array)
      .replaceAll(() => new Promise((resolve, reject) => setTimeout(() => reject('test'), 10)), { bypassPromiseFor: 1000 })
      .catch(error => {
        select(s => s.array)
          .replaceAll(() => new Promise(resolve => setTimeout(() => resolve(payload), 10)), { bypassPromiseFor: 1000 })
          .then(res => {
            expect(res).toEqual(read().array);
            expect(read().array).toEqual(payload);
            done();
          });
      });
  })

  it('should be able to perform an optimistic update', done => {
    const { select, read } = createGlobalStore(initialState);
    const optimisticValue = [{ id: 6, value: 'six' }];
    const resolvedValue = [{ id: 7, value: 'seven' }];
    select(s => s.array)
      .replaceAll(() => new Promise(resolve => resolve(resolvedValue)), { optimisticallyUpdateWith: optimisticValue })
      .then(() => {
        expect(read().array).toEqual(resolvedValue);
        done();
      });
    expect(read().array).toEqual(optimisticValue);
  })

  it('should revert an optimistic update if there is an error', done => {
    const { select, read } = createGlobalStore(initialState);
    const optimisticValue = [{ id: 6, value: 'six' }];
    select(s => s.array)
      .replaceAll(() => new Promise((resolve, reject) => reject('test')), { optimisticallyUpdateWith: optimisticValue })
      .catch(() => {
        expect(read().array).toEqual(initialState.array);
        done();
      });
    expect(read().array).toEqual(optimisticValue);
  })


  it('should invalidate caches for replaceAll() independantly of replace()', done => {
    const { select, read } = createGlobalStore(initialState);
    const fetchTodos = () => new Promise<{ id: number, value: string }[]>(resolve => setTimeout(() => resolve([{ id: 1, value: 'test' }]), 10));
    const fetchTodo = () => new Promise<{ id: number, value: string }>(resolve => setTimeout(() => resolve({ id: 1, value: 'testy' })));
    const fetchTodo2 = () => new Promise<{ id: number, value: string }>(resolve => setTimeout(() => resolve({ id: 1, value: 'testyy' })));
    select(s => s.array).
      replaceAll(fetchTodos, { bypassPromiseFor: 1000 })
      .then(() => select(s => s.array).filterWhere(s => s.id).eq(1).replace(fetchTodo, { bypassPromiseFor: 1000 }))
      .then(() => select(s => s.array).replaceAll(fetchTodos))
      .then(() => select(s => s.array).filterWhere(s => s.id).eq(1).replace(fetchTodo2))
      .then(() => {
        expect(read().array).toEqual([{ id: 1, value: 'testy' }]);
        select(s => s.array).filterWhere(s => s.id).eq(1).stopBypassingPromises();
      }).then(() => select(s => s.array).filterWhere(s => s.id).eq(1).replace(fetchTodo2))
      .then(() => {
        expect(read().array).toEqual([{ id: 1, value: 'testyy' }]);
        done();
      });
  })

});

