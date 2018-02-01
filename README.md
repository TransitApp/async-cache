# async-cache

Cache your async lookups and don't fetch the same thing more than
necessary.

Built upon [node-lru-cache](https://github.com/isaacs/node-lru-cache) and forked from [async-cache](https://github.com/isaacs/async-cache) to add a promise api.
## Example

```javascript
const cache = new AsyncCache({
  // options passed directly to the internal lru cache
  max: 1000,
  // in milliseconds
  maxAge: 1000 * 60 * 10,
  // method to load a thing if it's not in the cache.
  // key must be unique in the context of the cache.
  loadFn: async key => fetchData(key),
});

// get a cached key or fetch it
const res = await cache.get('key');

// you can also pass a custom loadFn directly to the get method
const res2 = await cache.get('key', async key => 'data');
```

## Methods

* `async get(key, [async loadFn])` If the key is in the cache, then resolve with value.
  Else call the provided loadFn.
  If no loadFn was provided try to use the `loadFn` that was supplied in the options object. 
  If it doesn't return an error, then
  cache the result.  Multiple `get` calls with the same key will only
  ever have a single `load` call at the same time.

* `set(key, val)` Seed the cache.  This doesn't have to be done, but
  can be convenient if you know that something will be fetched soon.

* `reset()` Drop all the items in the cache.
