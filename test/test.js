'use strict';

const test = require('ava');
const AC = require('../src/AsyncCache');

const getPromiseFn = (s, ret) => () =>
  new Promise((resolve) => setTimeout(() => resolve(ret), s));

test('2 concurrent get should get the same value', async (t) => {
  const asyncCache = new AC({});
  const KEY = 'one';
  const ret = {
    prop: 'val',
  };
  asyncCache.get(KEY, getPromiseFn(250, ret));

  const fakeRet = {
    prop: 'val',
  };
  const [val1, val2] = await Promise.all([
    asyncCache.get(KEY, () => fakeRet),
    asyncCache.get(KEY, () => fakeRet),
  ]);

  t.is(val1, val2);
  t.is(val1, ret);
  t.is(val2, ret);
  t.not(val1, fakeRet);
  t.not(val2, fakeRet);
});

test('loaded key should be deleted from loading map', async (t) => {
  const asyncCache = new AC({});
  const KEY = 'one';
  const ret = {
    prop: 'val',
  };

  await asyncCache.get(KEY, getPromiseFn(500, ret));
  t.is(asyncCache._loading.size, 0);
});

test('should refetch', async (t) => {
  const asyncCache = new AC({ maxAge: 1 });
  let oneCalled = false;
  let twoCalled = false;

  await asyncCache.get('key', async () => {
    oneCalled = true;
  });

  t.is(oneCalled, true);

  // wait
  await getPromiseFn(100, true)();
  await asyncCache.get('key', async () => {
    twoCalled = true;
  });

  t.is(twoCalled, true);
});
