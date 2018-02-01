'use strict';

const LRU = require('lru-cache');

class AsyncCache {
  constructor(opt) {
    if (!opt || typeof opt !== 'object') {
      throw new Error('options must be an object');
    }
    // disable stale
    opt.stale = false;
    opt.max = opt.max || 1000;
    opt.maxAge = opt.maxAge || 1000 * 60 * 10;
    if (opt.loadFn) {
      this._genericLoadFn = opt.loadFn;
    }
    this._opt = opt;
    this._cache = new LRU(opt);
    this._loading = new Map();
  }

  get(key, loadFn) {
    if (!loadFn) {
      if (this._genericLoadFn) {
        loadFn = this._genericLoadFn;
      } else {
        throw new Error(
          'No load function. ' +
            'You must provide a load function either at creation in opt.loadFn or as second argument during a value get'
        );
      }
    }
    return new Promise((resolve) => {
      if (this._loading.get(key)) {
        return resolve(this._loading.get(key));
      }

      if (this._cache.has(key)) {
        return resolve(this._cache.get(key));
      }

      this._loading.set(
        key,
        loadFn(key)
          .then((res) => {
            this._cache.set(key, res);
            this._loading.delete(key);
            return res;
          })
          .catch((err) => {
            this._loading.delete(key);
            throw err;
          })
      );

      return resolve(this._loading.get(key));
    });
  }

  keys() {
    return this._cache.keys();
  }

  set(key, val) {
    return this._cache.set(key, val);
  }

  reset() {
    return this._cache.reset();
  }

  has(key) {
    return this._cache.has(key);
  }

  del(key) {
    return this._cache.del(key);
  }

  peek(key) {
    return this._cache.peek(key);
  }
}

Object.defineProperty(AsyncCache.prototype, 'itemCount', {
  get() {
    return this._cache.itemCount;
  },
  enumerable: true,
  configurable: true,
});

module.exports = AsyncCache;
