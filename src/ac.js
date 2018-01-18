var LRU = require('lru-cache');

class AsyncCache {
  constructor(opt) {
    if (!opt || typeof opt !== 'object') {
      throw new Error('options must be an object');
    }

    this._opt = opt;
    this._cache = new LRU(opt);
    this._load = opt.load;
    this._loading = {};
    this._stales = {};
    this._allowStale = opt.stale;
  }

  get(key, loadFn, cb) {
    var stale = this._stales[key];
    if (this._allowStale && stale !== undefined) {
      return process.nextTick(function() {
        cb(null, stale);
      });
    }

    if (this._loading[key]) {
      return this._loading[key].push(cb);
    }

    var has = this._cache.has(key);
    var cached = this._cache.get(key);
    if (has && undefined !== cached) {
      return process.nextTick(function() {
        cb(null, cached);
      });
    }

    if (undefined !== cached && this._allowStale && !has) {
      this._stales[key] = cached;
      process.nextTick(function() {
        cb(null, cached);
      });
    } else {
      this._loading[key] = [cb];
    }

    loadFn(
      key,
      function(er, res, maxAge) {
        if (!er) {
          this._cache.set(key, res, maxAge);
        }

        if (this._allowStale) {
          delete this._stales[key];
        }

        var cbs = this._loading[key];
        if (!cbs) {
          return;
        }
        delete this._loading[key];

        cbs.forEach(function(cb) {
          cb(er, res);
        });
      }.bind(this)
    );
  }

  keys() {
    return this._cache.keys();
  }

  set(key, val, maxAge) {
    return this._cache.set(key, val, maxAge);
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
  get: function() {
    return this._cache.itemCount;
  },
  enumerable: true,
  configurable: true,
});

module.exports = AsyncCache;
