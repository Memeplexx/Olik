import { deriveFrom } from '../src/derive-from';
import { testState } from '../src/shared-state';
import { createGlobalStore, createGlobalStoreEnforcingTags } from '../src/store-creators';
import { windowAugmentedWithReduxDevtoolsImpl } from './_devtools';

describe('Memoize', () => {

  beforeAll(() => testState.windowObject = windowAugmentedWithReduxDevtoolsImpl);

  it('should deriveFrom() corrrectly', () => {
    const store = createGlobalStore({
      array: ['1', '2'],
      counter: 3,
    });
    const mem = deriveFrom(
      store.get(s => s.array),
      store.get(s => s.counter),
    ).usingExpensiveCalc((arr, somenum) => {
      return arr.concat(somenum.toString())
    });
    const result = mem.read();
    expect(result).toEqual(['1', '2', '3']);
  })

  it('should deriveFrom() and cache correctly', () => {
    const store = createGlobalStore({
      array: new Array<string>(),
      counter: 3,
    });
    let recalculating = 0;
    let eventReceived = 0;
    const mem = deriveFrom(
      store.get(s => s.array),
      store.get(s => s.counter)
    ).usingExpensiveCalc((array, counter) => {
      recalculating++;
      let result = {
        array: new Array<string>(),
        counter: 0,
      };
      for (let i = 0; i < 10000; i++) {
        result.array.push('');
        result.counter = counter;
      }
      return result;
    });
    mem.onChange(() => eventReceived++);
    const result = mem.read();
    expect(result.array.length).toEqual(10000);
    const result2 = mem.read();
    expect(result2.array.length).toEqual(10000);
    expect(recalculating).toEqual(1);
    store.get(s => s.counter).replace(4);
    const result3 = mem.read();
    expect(recalculating).toEqual(2);
    expect(result3.counter).toEqual(4);
    expect(eventReceived).toEqual(1);
  })

  it('should deriveFrom() and emit events only when required', () => {
    const store = createGlobalStore({
      array: new Array<string>(),
      counter: 3,
      string: '',
    });
    let recalculating = 0;
    let eventReceived = 0;
    const mem = deriveFrom(
      store.get(s => s.array),
      store.get(s => s.counter)
    ).usingExpensiveCalc((array, counter) => {
      recalculating++;
    });
    mem.onChange(() => eventReceived++);
    store.get(s => s.string).replace('hey');
    expect(store.get(s => s.string).read()).toEqual('hey');
    expect(recalculating).toEqual(0);
    expect(eventReceived).toEqual(0);
    store.get(s => s.counter).replace(2);
    expect(eventReceived).toEqual(1);
  })

  it('should deriveFrom() and correctly unsubscribe', () => {
    const store = createGlobalStore({
      one: 'x',
      two: 0,
    });
    const mem = deriveFrom(
      store.get(s => s.one),
      store.get(s => s.two)
    ).usingExpensiveCalc((one, two) => {
      return one + two;
    });
    let onChangeListenerCallCount = 0;
    const onChangeListener = mem.onChange(() => onChangeListenerCallCount++);
    store.get(s => s.two).replace(1);
    expect(mem.read()).toEqual('x1');
    expect(onChangeListenerCallCount).toEqual(1);
    onChangeListener.unsubscribe();
    store.get(s => s.two).replace(2);
    expect(mem.read()).toEqual('x2');
    expect(onChangeListenerCallCount).toEqual(1);
  })

  it('should deriveFrom() on specific array element', () => {
    const store = createGlobalStore({
      array: [{ id: 1, value: 'one' }, { id: 2, value: 'two' }, { id: 3, value: 'three' }],
      object: { hello: 'world' },
    });
    let recalculating = 0;
    const mem = deriveFrom(
      store.get(s => s.array)
        .findWhere(e => e.id === 2).returnsTrue()
    ).usingExpensiveCalc(val => {
      recalculating++;
    });
    store.get(s => s.array)
      .findWhere(s => s.id === 2).returnsTrue()
      .patch({ value: 'twoo' });
    mem.read();
    store.get(s => s.array)
      .findWhere(s => s.id === 1).returnsTrue()
      .patch({ value: 'onee' });
    mem.read();
    expect(recalculating).toEqual(1);
  })

  it('should deriveFrom() using dispatcher tags', () => {
    const store = createGlobalStoreEnforcingTags({
      array: ['1', '2'],
      counter: 3,
    });
    const mem = deriveFrom(
      store.get(s => s.array),
      store.get(s => s.counter),
    ).usingExpensiveCalc((arr, somenum) => {
      return arr.concat(somenum.toString())
    });
    const result = mem.read();
    expect(result).toEqual(['1', '2', '3']);
  })

  it('should be able to derive from using a derivation as an argument', () => {
    const store = createGlobalStore({ num: 0, str: 'x' });
    let originalMemoCalcCount = 0;
    const mem = deriveFrom(
      store.get(s => s.num),
      store.get(s => s.str),
    ).usingExpensiveCalc((num, str) => {
      originalMemoCalcCount++;
      return str + num;
    });
    const mem2 = deriveFrom(
      store.get(s => s.str),
      mem,
    ).usingExpensiveCalc((s1, s2) => {
      return s1 + s2;
    });
    expect(mem2.read()).toEqual('xx0');
    expect(originalMemoCalcCount).toEqual(1);
  })

  it('should deriveFrom() including a filter()', () => {
    const store = createGlobalStore({
      array: [{ id: 1, value: 'one' }, { id: 2, value: 'two' }, { id: 3, value: 'three' }],
    });
    let memoCalcCount = 0;
    const mem = deriveFrom(
      store.get(s => s.array).findWhere(e => e.id).eq(2),
    ).usingExpensiveCalc(thing => {
      memoCalcCount++;
      return thing;
    });
    mem.read();
    mem.read();
    store.get(s => s.array).findWhere(e => e.id).eq(1).patch({ value: 'xxx' });
    expect(memoCalcCount).toEqual(1);
    store.get(s => s.array).findWhere(e => e.id).eq(2).patch({ value: 'xxx' });
    mem.read();
    expect(memoCalcCount).toEqual(2);
  })

  it('should deriveFrom() including an ordinary filter()', () => {
    const store = createGlobalStore({
      array: [{ id: 1, value: 'one' }, { id: 2, value: 'two' }, { id: 3, value: 'three' }],
    });
    let memoCalcCount = 0;
    const mem = deriveFrom(
      store.get(s => s.array.find(e => e.id === 2)),
    ).usingExpensiveCalc(thing => {
      memoCalcCount++;
      return thing;
    });
    mem.read();
    mem.read();
    store.get(s => s.array).findWhere(e => e.id).eq(1).patch({ value: 'xxx' });
    expect(memoCalcCount).toEqual(1);
    store.get(s => s.array).findWhere(e => e.id).eq(2).patch({ value: 'xxx' });
    mem.read();
    expect(memoCalcCount).toEqual(2);
  })

});