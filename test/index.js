'use strict';

var assert = require('assert'),
  promisify = require('..'),
  equal = assert.equal;

describe('# promisify', function() {
  it('callback style function', function(done) {
    var fn = function(ms, cb) {
      setTimeout(cb(null, ms), ms);
    };

    var pfn = promisify(fn);

    pfn(5).then(function(ms) {
      equal(ms, 5);
      done();
    });
  });

  it('callback style function', function(done) {
    var fn = function(ms, cb) {
      setTimeout(cb(new Error('reject')), ms);
    };

    var pfn = promisify(fn);

    pfn(5).catch(function(e) {
      equal(e.message, 'reject');
      done();
    });
  });

  it('callback style function with context', function(done) {
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
