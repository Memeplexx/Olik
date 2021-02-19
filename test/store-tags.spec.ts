import { set, setEnforceTags } from '../src/store-creators';
import { libState } from '../src/shared-state';
import { windowAugmentedWithReduxDevtoolsImpl } from './_devtools';

describe('tags', () => {

  beforeAll(() => libState.windowObject = windowAugmentedWithReduxDevtoolsImpl);

  it('should work with tags correctly', () => {
    const payload = 'hey';
    const tag = 'mytag';
    const get = setEnforceTags({
      object: { property: 'one', property2: 'two' },
    });
    get(s => s.object.property)
      .replace(payload, tag);
    expect(libState.currentAction).toEqual({
      type: `object.property.replace() [${tag}]`,
      replacement: payload,
    });
    expect(get(s => s.object.property).read()).toEqual(payload);
    expect(libState.currentMutableState).toEqual(get().read());
  })

  it('should sanitize tags correctly', () => {
    const get = setEnforceTags({
      test: '',
    }, {
      tagSanitizer: (tag) => tag + 'x',
    });
    const tag = 'mytag';
    const payload = 'test';
    get(s => s.test)
      .replace(payload, tag);
    expect(libState.currentAction).toEqual({
      type: `test.replace() [${tag}x]`,
      replacement: payload,
    });
    expect(libState.currentMutableState).toEqual(get().read());
  })

  it('should accept optional tags', () => {
    const get = set({ prop: '' });
    const tag = 'mytag';
    const payload = 'test';
    get(s => s.prop)
      .replace(payload, tag);
    expect(libState.currentAction).toEqual({
      type: `prop.replace() [${tag}]`,
      replacement: payload,
    });
  })

});