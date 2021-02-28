import { set } from '../src/store-creators';
import { libState } from '../src/shared-state';
import { windowAugmentedWithReduxDevtoolsImpl } from './_devtools';

describe('array', () => {

  beforeAll(() => libState.windowObject = windowAugmentedWithReduxDevtoolsImpl);

  const initialState = {
    array: [{ id: 1, value: 'one' }, { id: 2, value: 'two' }, { id: 3, value: 'three' }],
    object: { property: '' },
  };

  it('should removeAll()', () => {
    const select = set(initialState);
    select(s => s.array)
      .removeAll();
    expect(libState.currentAction).toEqual({
      type: 'select(array).removeAll()',
    });
    expect(select(s => s.array).read()).toEqual([]);
    expect(libState.currentMutableState).toEqual(select().read());
  });

  it('should replaceAll()', () => {
    const select = set(initialState);
    const payload = [{ id: 4, value: 'four' }, { id: 5, value: 'five' }];
    select(s => s.array)
      .replaceAll(payload);
    expect(libState.currentAction).toEqual({
      type: 'select(array).replaceAll()',
      replacement: payload,
    });
    expect(select(s => s.array).read()).toEqual(payload);
    expect(libState.currentMutableState).toEqual(select().read());
  });

  it('should reset()', () => {
    const select = set(initialState);
    select(s => s.array)
      .reset();
    expect(libState.currentAction).toEqual({
      type: 'select(array).reset()',
      replacement: initialState.array,
    });
    expect(select(s => s.array).read()).toEqual(initialState.array);
    expect(libState.currentMutableState).toEqual(select().read());
  });

  it('should insert() one', () => {
    const select = set(initialState);
    const payload = { id: 4, value: 'four' };
    select(s => s.array)
      .insert(payload);
    expect(libState.currentAction).toEqual({
      type: 'select(array).insert()',
      insertion: payload,
    });
    expect(select(s => s.array).read()).toEqual([...initialState.array, payload]);
    expect(libState.currentMutableState).toEqual(select().read());
  })

  it('should insert() many', () => {
    const select = set(initialState);
    const payload = [{ id: 4, value: 'four' }, { id: 5, value: 'five' }];
    select(s => s.array)
      .insert(payload);
    expect(libState.currentAction).toEqual({
      type: 'select(array).insert()',
      insertion: payload,
    });
    expect(select(s => s.array).read()).toEqual([...initialState.array, ...payload]);
    expect(libState.currentMutableState).toEqual(select().read());
  })

  it('should be able to replaceElseInsert() with multiple elements, replacing and inserting', () => {
    const select = set(initialState);
    const payload = [{ id: 2, value: 'twoo' }, { id: 3, value: 'threee' }, { id: 4, value: 'four' }];
    select(s => s.array)
      .match(s => s.id)
      .replaceElseInsert(payload);
    expect(libState.currentAction).toEqual({
      type: 'select(array).match(id).replaceElseInsert()',
      argument: payload,
      replacementCount: 2,
      insertionCount: 1,
    });
    expect(select(s => s.array).read()).toEqual([{ id: 1, value: 'one' }, { id: 2, value: 'twoo' }, { id: 3, value: 'threee' }, { id: 4, value: 'four' }]);
    expect(libState.currentMutableState).toEqual(select().read());
  });

  it('should replaceElseInsert() with one element replacing', () => {
    const select = set(initialState);
    const payload = { id: 2, value: 'two updated' };
    select(s => s.array)
      .match(s => s.id)
      .replaceElseInsert(payload);
    expect(libState.currentAction).toEqual({
      type: 'select(array).match(id).replaceElseInsert()',
      argument: payload,
      insertionCount: 0,
      replacementCount: 1,
    });
    expect(select(s => s.array).read()).toEqual([initialState.array[0], payload, initialState.array[2]]);
    expect(libState.currentMutableState).toEqual(select().read());
  });

  it('should replaceElseInsert() with one element inserting', () => {
    const select = set(initialState);
    const payload = { id: 4, value: 'four inserted' };
    select(s => s.array)
      .match(s => s.id)
      .replaceElseInsert(payload);
    expect(libState.currentAction).toEqual({
      type: 'select(array).match(id).replaceElseInsert()',
      argument: payload,
      insertionCount: 1,
      replacementCount: 0,
    });
    expect(select(s => s.array).read()).toEqual([...initialState.array, payload]);
    expect(libState.currentMutableState).toEqual(select().read());
  });

});