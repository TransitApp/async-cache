'use strict';

const test = require('ava');
const AC = require('../src/AsyncCache');

const getPromiseFn = (s, ret) => () =>
  new Promise((resolve) => setTimeout(() => resolve(ret), s));

test('Should use the same loadFn when one is provided at creation and none is provided during get', async (t) => {
  const ret = {
    prop: 'val',
  };
  const KEY = 'one';
  const KEY2 = 'two';

  const asyncCache = new AC({
    loadFn: getPromiseFn(250, ret),
  });
  asyncCache.get(KEY);
  asyncCache.get(KEY2);

  const [val1, val2] = await Promise.all([
    asyncCache.get(KEY),
    asyncCache.get(KEY2),
  ]);

  t.is(val1, val2);
  t.is(val1, ret);
  t.is(val2, ret);
});

test('Should override the loadFn provided at creation when one is provided during get', async (t) => {
  const ret = {
    prop: 'val',
  };
  const ret2 = {
    prop: 'val',
  };

  const KEY = 'one';
  const KEY2 = 'two';

  const asyncCache = new AC({
    loadFn: getPromiseFn(250, ret),
  });
  asyncCache.get(KEY);
  asyncCache.get(KEY2, getPromiseFn(250, ret2));

  const [val1, val2] = await Promise.all([
    asyncCache.get(KEY),
    asyncCache.get(KEY2),
  ]);

  t.is(val1, ret);
  t.is(val2, ret2);
});

test('Should throw when no loadFn is passed to get and none is set at creation', async (t) => {
  const asyncCache = new AC({});

  t.throws(() => asyncCache.get('key'));
});
