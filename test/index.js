'use strict';

var assert = require('assert'),
  promisify = require('..'),
  equal = assert.deepEqual;

describe('## promisify', function() {
  describe('# callback style function', function() {
    it('success - async', function(done) {
      var fn = function(ms, cb) {
        setTimeout(cb(null, ms), ms);
      };

      var p = promisify(fn);

      p(5).then(function(ms) {
        equal(ms, 5);
        done();
      });
    });

    it('success - sync', function(done) {
      var fn = function(n, cb) {
        cb(null, n);
      };

      var p = promisify(fn);

      p(5).then(function(ms) {
        equal(ms, 5);
        done();
      });
    });

    it('error - async', function(done) {
      var fn = function(ms, cb) {
        setTimeout(cb(new Error('async reject')), ms);
      };

      var p = promisify(fn);

      p(5).catch(function(e) {
        equal(e.message, 'async reject');
        done();
      });
    });

    it('error - sync', function(done) {
      var fn = function(cb) {
        cb(new Error('sync reject'));
      };

      var p = promisify(fn);

      p().catch(function(e) {
        equal(e.message, 'sync reject');
        done();
      });
    });

    it('error - throw', function(done) {
      var fn = function() {
        throw new Error('throw reject');
      };

      var p = promisify(fn);

      p().catch(function(e) {
        equal(e.message, 'throw reject');
        done();
      });
    });

    it('ignore multiple callbacks', function(done) {
      var fn = function(cb) {
        cb(null, 1);
        cb(null, 2);
        cb(null, 3);
      };

      var p = promisify(fn);

      p().then(function(n) {
        equal(n, 1);
        done();
      });
    });

    it('ignore generator function', function(done) {
      var g = function * () {};
      equal(promisify(g).toString(), g.toString());
      done();
    });
  });

  describe('# callback style function with context', function() {
    it('success', function(done) {
      var c = newObj();

      c.count = promisify(c.count);

      c.count(10)
        .then(function() {
          equal(c.total, 10);
          return c.count(20);
        }).then(function() {
          equal(c.total, 30);
          done();
        });
    });
  });

  describe('# object', function() {
    it('success', function(done) {
      var obj = promisify(newObj());

      obj.delay(1).then(function(ms) {
        equal(ms, 1);
        return obj.count(5);
      }).then(function() {
        equal(obj.total, 5);
        done();
      });
    });
  });

  describe('# object with filter', function() {
    it('array filter', function(done) {
      var obj = promisify(newObj(), ['count']);

      obj.count(5).then(function() {
        equal(typeof obj.delay.then, 'undefined');
        equal(obj.total, 5);
        done();
      });
    });

    it('filter function', function(done) {
      var obj = promisify(newObj(), function(key) {
        return key === 'count';
      });

      obj.count(5).then(function() {
        equal(typeof obj.delay.then, 'undefined');
        equal(obj.total, 5);
        done();
      });
    });

    it('just ignore array', function(done) {
      // any use case?
      equal(promisify([1, 2, 3]), [1, 2, 3]);
      done();
    });
  });
});

function newObj() {
  var obj = {
    total: 0,
    delay: function(ms, cb) {
      setTimeout(function() {
        cb(null, ms);
      }, ms);
    },
    count: function(num, cb) {
      this.total += num;
      var self = this;

      setImmediate(function() {
        cb(null, self.total);
      });
    }
  };

  return obj;
}
