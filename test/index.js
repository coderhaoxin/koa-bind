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
  });

  describe('# callback style function with context', function() {
    it('success', function(done) {
      var c = {
        total: 0,
        count: function(ms, num, cb) {
          var self = this;

          setTimeout(function() {
            self.total += num;
            cb(null, self.total);
          }, ms);
        }
      };

      c.count = promisify(c.count);

      c.count(10, 20)
        .then(function(total) {
          equal(total, 20);
          return c.count(10, 30);
        }).then(function(total) {
          equal(total, 50);
          done();
        });
    });
  });
});
