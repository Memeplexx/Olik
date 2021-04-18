import { store } from '../src/store-creators';
import { libState } from '../src/shared-state';
import { windowAugmentedWithReduxDevtoolsImpl } from './_devtools';

describe('array.filterCustom().replace()', () => {

  beforeAll(() => libState.windowObject = windowAugmentedWithReduxDevtoolsImpl);

  const initialState = {
    object: { property: '' },
    array: [{ id: 1, value: 'one' }, { id: 2, value: 'two' }, { id: 3, value: 'three' }],
  };

  it('should eq()', () => {
    const select = store(initialState);
    const payload = { id: 4, value: 'four' };
    const query = (e: typeof initialState['array'][0]) => e.id === 2;
    select(s => s.array)
      .filterWhere(query).returnsTrue()
      .replace(payload);
    expect(libState.currentAction).toEqual({
      type: 'array.filter().replace()',
      replacement: payload,
      query: query.toString(),
    });
    expect(select(s => s.array).read()).toEqual([initialState.array[0], payload, initialState.array[2]]);
    expect(libState.currentMutableState).toEqual(select().read());
  })

  it('should ne()', () => {
    const select = store(initialState);
    const payload = { id: 4, value: 'four' };
    const query = (e: typeof initialState['array'][0]) => e.id !== 2;
    select(s => s.array)
      .filterWhere(query).returnsTrue()
      .replace(payload);
    expect(libState.currentAction).toEqual({
      type: 'array.filter().replace()',
      replacement: payload,
      query: query.toString(),
    });
    expect(select(s => s.array).read()).toEqual([payload, initialState.array[1], payload]);
    expect(libState.currentMutableState).toEqual(select().read());
  })

  it('should gt()', () => {
    const select = store(initialState);
    const payload = { id: 4, value: 'four' };
    const query = (e: typeof initialState['array'][0]) => e.id > 1;
    select(s => s.array)
      .filterWhere(query).returnsTrue()
      .replace(payload);
    expect(libState.currentAction).toEqual({
      type: 'array.filter().replace()',
      replacement: payload,
      query: query.toString(),
    });
    expect(select(s => s.array).read()).toEqual([initialState.array[0], payload, payload]);
    expect(libState.currentMutableState).toEqual(select().read());
  })

  it('should lt()', () => {
    const select = store(initialState);
    const payload = { id: 4, value: 'four' };
    const query = (e: typeof initialState['array'][0]) => e.id < 2;
    select(s => s.array)
      .filterWhere(e => e.id < 2).returnsTrue()
      .replace(payload);
    expect(libState.currentAction).toEqual({
      type: 'array.filter().replace()',
      replacement: payload,
      query: query.toString(),
    });
    expect(select(s => s.array).read()).toEqual([payload, initialState.array[1], initialState.array[2]]);
    expect(libState.currentMutableState).toEqual(select().read());
  })

  it('should in()', () => {
    const select = store(initialState);
    const payload = { id: 4, value: 'four' };
    const query = (e: typeof initialState['array'][0]) => [1, 2].includes(e.id);
    select(s => s.array)
      .filterWhere(query).returnsTrue()
      .replace(payload);
    expect(libState.currentAction).toEqual({
      type: 'array.filter().replace()',
      replacement: payload,
      query: query.toString(),
    });
    expect(select(s => s.array).read()).toEqual([payload, payload, initialState.array[2]]);
    expect(libState.currentMutableState).toEqual(select().read());
  })

  it('should ni()', () => {
    const select = store(initialState);
    const payload = { id: 4, value: 'four' };
    const query = (e: typeof initialState['array'][0]) => ![1, 2].includes(e.id);
    select(s => s.array)
      .filterWhere(e => ![1, 2].includes(e.id)).returnsTrue()
      .replace(payload);
    expect(libState.currentAction).toEqual({
      type: 'array.filter().replace()',
      replacement: payload,
      query: query.toString(),
    });
    expect(select(s => s.array).read()).toEqual([initialState.array[0], initialState.array[1], payload]);
    expect(libState.currentMutableState).toEqual(select().read());
  })

  it('should match()', () => {
    const select = store(initialState);
    const payload = { id: 4, value: 'four' };
    const query = (e: typeof initialState['array'][0]) => /^t/.test(e.value);
    select(s => s.array)
      .filterWhere(query).returnsTrue()
      .replace(payload);
    expect(libState.currentAction).toEqual({
      type: 'array.filter().replace()',
      replacement: payload,
      query: query.toString(),
    });
    expect(select(s => s.array).read()).toEqual([initialState.array[0], payload, payload]);
    expect(libState.currentMutableState).toEqual(select().read());
  })

});