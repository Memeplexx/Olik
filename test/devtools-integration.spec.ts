import { errorMessages } from '../src/shared-consts';
import { set } from '../src/store-creators';
import { libState } from '../src/shared-state';
import { windowAugmentedWithReduxDevtoolsImpl } from './_devtools';

describe('Devtools', () => {

  const spyWarn = jest.spyOn(console, 'warn');

  beforeAll(() => libState.windowObject = windowAugmentedWithReduxDevtoolsImpl);
  
  beforeEach( () => spyWarn.mockReset());

  it('should correctly respond to devtools dispatches where the state is an object', () => {
    const get = set({ x: 0, y: 0 });
    get(s => s.x)
      .replace(3);
    expect(get().read()).toEqual({ x: 3, y: 0 });
    const state = { x: 1, y: 0 };
    libState.windowObject?.__REDUX_DEVTOOLS_EXTENSION__._mockInvokeSubscription({ type: 'DISPATCH', state: JSON.stringify(state), payload: { type: 'JUMP_TO_ACTION' }, source: '@devtools-extension' });
    expect(get().read()).toEqual(state);    expect(libState.currentAction.type).toEqual('replace() [dontTrackWithDevtools]');
  });

  it('should correctly respond to devtools dispatches where the state is an array', () => {
    const get = set(['a', 'b', 'c']);
    get()
      .replaceAll(['d', 'e', 'f']);
    expect(get().read()).toEqual(['d', 'e', 'f']);
    const state = ['g', 'h'];
    libState.windowObject?.__REDUX_DEVTOOLS_EXTENSION__._mockInvokeSubscription({ type: 'DISPATCH', state: JSON.stringify(state), payload: { type: 'JUMP_TO_ACTION' }, source: '@devtools-extension' });
    expect(get().read()).toEqual(state);
    expect(libState.currentAction.type).toEqual('replaceAll() [dontTrackWithDevtools]');
  });

  it('should handle a COMMIT without throwing an error', () => {
    set({ hello: '' });
    libState.windowObject?.__REDUX_DEVTOOLS_EXTENSION__._mockInvokeSubscription({ type: 'DISPATCH', payload: { type: 'COMMIT' }, source: '@devtools-extension' });
  });

  it('should handle a RESET correctly', () => {
    const get = set({ hello: '' });
    get(s => s.hello)
      .replace('world');
    expect(get(s => s.hello).read()).toEqual('world');
    libState.windowObject?.__REDUX_DEVTOOLS_EXTENSION__._mockInvokeSubscription({ type: 'DISPATCH', payload: { type: 'RESET' }, source: '@devtools-extension' });
    expect(get(s => s.hello).read()).toEqual('');
  });

  it('should handle a ROLLBACK correctly', () => {
    const get = set({ num: 0 });
    get(s => s.num)
      .replace(1);
    expect(get(s => s.num).read()).toEqual(1);
    get(s => s.num)
      .replace(2);
    expect(get(s => s.num).read()).toEqual(2);
    libState.windowObject?.__REDUX_DEVTOOLS_EXTENSION__._mockInvokeSubscription({ type: 'DISPATCH', payload: { type: 'ROLLBACK' }, source: '@devtools-extension', state: '{ "num": 1 }' });
    expect(get(s => s.num).read()).toEqual(1);
  });

  it('should throw an error should a devtools dispatch contain invalid JSON', () => {
    set({ hello: 0 });
    expect(() => libState.windowObject?.__REDUX_DEVTOOLS_EXTENSION__
      ._mockInvokeSubscription({ type: 'ACTION', source: '@devtools-extension', payload: "{'type': 'hello.replace', 'payload': 2}" }))
      .toThrow(errorMessages.DEVTOOL_DISPATCHED_INVALID_JSON);
  });

  it('should throw an error should a devtools dispatch not contain parenthesis', () => {
    set({ hello: 0 });
    expect(() => libState.windowObject?.__REDUX_DEVTOOLS_EXTENSION__
      ._mockInvokeSubscription({ type: 'ACTION', source: '@devtools-extension', payload: '{"type": "hello.replace", "payload": 2}' }))
      .toThrow(errorMessages.DEVTOOL_DISPATCHED_WITH_NO_ACTION('hello.replace'));
  });

  it('should throw an error should a devtools dispatch not contain parenthesis', () => {
    set({ hello: 0 });
    expect(() => libState.windowObject?.__REDUX_DEVTOOLS_EXTENSION__
      ._mockInvokeSubscription({ type: 'ACTION', source: '@devtools-extension', payload: '{"type": "hello.replace", "payload": 2}' }))
      .toThrow(errorMessages.DEVTOOL_DISPATCHED_WITH_NO_ACTION('hello.replace'));
  });

  it('should correctly devtools dispatch made by user', () => {
    const get = set({ hello: 0 });
    libState.windowObject?.__REDUX_DEVTOOLS_EXTENSION__
      ._mockInvokeSubscription({ type: 'ACTION', source: '@devtools-extension', payload: '{"type": "hello.replace()", "payload": 2}' });
    expect(get(s => s.hello).read()).toEqual(2);
  })

  it('should throttle tightly packed updates', done => {
    const get = set({ test: 0 });
    const payload: number[] = [];
    for (let i = 0; i < 100; i++) {
      get(s => s.test).replace(i);
      expect(libState.currentActionForDevtools).toEqual({ type: 'test.replace()', replacement: 0 });
      if (i > 0) {
        payload.push(i);
      }
    }
    setTimeout(() => {
      expect(libState.currentActionForDevtools).toEqual({
        type: 'test.replace()',
        replacement: 99,
        batched: payload.slice(0, payload.length - 1).map(replacement => ({ replacement })),
      })
      done();
    }, 300);
  })

  it('should log an error if no devtools extension could be found', () => {
    libState.windowObject = null;
    set(new Array<string>());
    expect( spyWarn ).toHaveBeenCalledWith(errorMessages.DEVTOOL_CANNOT_FIND_EXTENSION); 
  })

});
