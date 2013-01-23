/*global QUnit:false, module:false, test:false, asyncTest:false, expect:false*/
/*global start:false, stop:false ok:false, equal:false, notEqual:false, deepEqual:false*/
/*global notDeepEqual:false, strictEqual:false, notStrictEqual:false, raises:false*/
(function($) {

  /*
    ======== A Handy Little QUnit Reference ========
    http://docs.jquery.com/QUnit

    Test methods:
      expect(numAssertions)
      stop(increment)
      start(decrement)
    Test assertions:
      ok(value, [message])
      equal(actual, expected, [message])
      notEqual(actual, expected, [message])
      deepEqual(actual, expected, [message])
      notDeepEqual(actual, expected, [message])
      strictEqual(actual, expected, [message])
      notStrictEqual(actual, expected, [message])
      raises(block, [expected], [message])
  */

  // add support for waiting for multiple defered object
  // add undeferr
    module('jQuery.defer', {
        setup: function() {
            this.obj = {
                counter: 0,
                method: function () {this.counter++;},
                method2: function () {this.counter++;},
                method3: function () {this.counter++;}
            };
            this.deferred = new $.Deferred();
        }
    });

    test('runs immediately when defered has already resolved', function () {
        $.defer(this.obj, this.deferred);
        this.deferred.resolve();
        this.obj.method();
        equal(this.obj.counter, 1);
    });
    test('runs immediately when not passed a deferred object', function () {
        $.defer(this.obj, {prop: true});
        this.obj.method();
        equal(this.obj.counter, 1);
    });
    test('run delayed when defered is resolved after calling', 3, function () {
        $.defer(this.obj, this.deferred);

        this.obj.method();
        equal(this.obj.counter, 0);
        this.deferred.resolve();
        equal(this.obj.counter, 1);

        this.obj.method();
        equal(this.obj.counter, 2, 'thereafter works as normal');
    });

    test('wait for multiple deferreds', 3, function () {
        var def = new $.Deferred();
        $.defer(this.obj, [this.deferred, def]);

        this.obj.method();
        equal(this.obj.counter, 0);
        this.deferred.resolve();
        equal(this.obj.counter, 0);

        def.resolve();
        equal(this.obj.counter, 1);
    });

    test('wait for defered and non defered', 2, function () {
        

        $.defer(this.obj, [this.deferred, {}]);

        this.obj.method();
        equal(this.obj.counter, 0);
        this.deferred.resolve();
        equal(this.obj.counter, 1);
    });





    test('ignores non existent methods', function () {
        $.defer(this.obj, this.deferred, {methods: 'method8'});

        ok(true);
    });


    test('only runs on specified methods', 3, function () {
        $.defer(this.obj, this.deferred, {methods: 'method2 method3'});

        this.obj.method();
        equal(this.obj.counter, 1);
        this.obj.method2();
        equal(this.obj.counter, 1);
        this.deferred.resolve();
        equal(this.obj.counter, 2);
    });


    test('doesn\'t run on excluded methods', 3, function () {
        $.defer(this.obj, this.deferred, {exclude: 'method2 method3'});

        this.obj.method();
        equal(this.obj.counter, 0);
        this.obj.method2();
        equal(this.obj.counter, 1);
        this.deferred.resolve();
        equal(this.obj.counter, 2);
    });

    test('includes overrides excludes', function () {
        $.defer(this.obj, this.deferred, {methods: 'method method2', exclude: 'method2 method3'});

        this.obj.method2();
        equal(this.obj.counter, 0);
      
    });

    test('can be called on a function', 3, function () {
        var counter = 0, 
            func = function () {counter++;};
        func = $.defer(func, this.deferred);

        func();
        equal(counter, 0);
        this.deferred.resolve();
        equal(counter, 1);
        func();
        equal(counter, 2);
    });

    test('doesn\'t affect prototype by default', 2, function () {
        var Class = function () {};


        Class.prototype = this.obj;
        var obj = new Class();


        $.defer(this.obj1, this.deferred);


        obj.method();
        equal(obj.counter, 1);
        this.deferred.resolve();
        equal(obj.counter, 1);
    });

    test('when applied to entire prototype affects only this instance', 3, function () {
        var Class = function () {};


        Class.prototype = this.obj;
        var obj1 = new Class();
        var obj2 = new Class();


        $.defer(obj1, this.deferred, {applyToPrototype: true});


        obj1.method();
        equal(obj1.counter, 0);
        obj2.method();
        equal(obj2.counter, 1);
        this.deferred.resolve();
        equal(obj1.counter, 1);
    });

    test('still allows dynamic changing of context on functions',  function () {
        var context = {}, 
            func = function () {strictEqual(this, context);};

        func = $.defer(func, this.deferred);

        func.call(context);
        this.deferred.resolve();
    });

    test('still allows dynamic changing of context on methods',  function () {
        var context = {},
            obj = {
              method: function () { 
                strictEqual(this, context);
              }
            };

        $.defer(obj, this.deferred);


        obj.method.call(context);
        this.deferred.resolve();

    });

    test('still passes arguments in',  function () {
        var obj = {
            method: function (arg) { 
                equal(arg, 'correct');
            }
        };

        $.defer(obj, this.deferred);

        obj.method('correct');
        this.deferred.resolve();

    });
    



}(jQuery));
