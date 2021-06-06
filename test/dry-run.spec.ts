import { libState, testState } from '../src/shared-state';
import { getSelectedStateFromOperationWithoutUpdatingStore } from '../src/shared-utils';
import { createNestedStore, createAppStore } from '../src/store-creators';
import { windowAugmentedWithReduxDevtoolsImpl } from './_devtools';

describe('dry-run', () => {

  beforeAll(() => testState.windowObject = windowAugmentedWithReduxDevtoolsImpl);

  beforeEach(() => libState.nestedContainerStore = null);

  it('should perform a successful dry-run with an array element update', () => {
    const initState = { arr: [{ id: 1, val: 'one' }, { id: 2, val: 'two' }], str: '' };
    const { select, read } = createAppStore(initState);
    const state = getSelectedStateFromOperationWithoutUpdatingStore(select, () => select(s => s.arr).findWhere(s => s.id).isEq(1).patch({ id: 3 }));
    expect(state).toEqual({ id: 1, val: 'one' });
    expect(read()).toEqual(initState);
  })

  it('should perform a successful dry-run with an object update', () => {
    const initState = { str: 'abc' };
    const { select, read } = createAppStore(initState);
    const state = getSelectedStateFromOperationWithoutUpdatingStore(select, () => select(s => s.str).replace('sdd'));
    expect(state).toEqual('abc');
    expect(read()).toEqual(initState);
  })

  it('should work with a nested store', () => {
    const { select, read } = createAppStore({ str: '' });
    const nested = createNestedStore({ hello: 'xx' }, { componentName: 'test' })
    const state = getSelectedStateFromOperationWithoutUpdatingStore(nested.select, () => nested.select(s => s.hello).replace('sdd'));
    expect(state).toEqual('xx');
    expect(read()).toEqual({ str: '', nested: { test: { '0': { hello: 'xx' } } } });
  })

  it('should work with a nested store which isn\'t attached', () => {
    const initState = { str: 'abc' };
    const { select, read } = createNestedStore(initState, { componentName: 'test' });
    const state = getSelectedStateFromOperationWithoutUpdatingStore(select, () => select(s => s.str).replace('sdd'));
    expect(state).toEqual('abc');
    expect(read()).toEqual(initState);
  })

});