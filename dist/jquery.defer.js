/*! Defer - v0.1.0 - 2013-01-23
* https://github.com/wheresrhys/jquery.defer
* Copyright (c) 2013 Rhys Evans; Licensed MIT */

(function($) {


    var Plugin = function (obj, deferred, options) {
        
        this.obj = obj, 
        this.deferred = deferred, 
        this.options = options;
        this.mode = options.mode;
        this.run();
    };

    Plugin.prototype = {
        run : function () {
            var methods, i, method, exclude = {}, options = this.options, applyToPrototype = !!(options && options.applyToPrototype);
            
            this.mutator = this.mutators[this.mode] ;

            if (this.mode === 'undefer' && $.isFunction(this.obj)) {
                return this.obj;
            } else if ($.isFunction(this.obj)) {
                this.func = getDeferredFunction(this.obj, this.deferred);
            } else if (options && options.methods) {
                methods = options.methods.split(' ');
                
                for (i = methods.length-1; i>=0; i--) {
                    this.obj[methods[i]] = this.mutator(methods[i]);
                }

            } else {
                if (options && options.exclude) {
                    methods = options.exclude.split(' ');
                    for (i = methods.length-1; i>=0; i--) {
                        exclude[methods[i]] = true;
                    }
                }

                for (method in this.obj) {
                    if (exclude[method]) {
                        continue;
                    }
                    if ((applyToPrototype || this.obj.hasOwnProperty(method)) && $.isFunction(this.obj[method])) {
                        
                        this.obj[method] = this.mutator(method);
                    }
                }
            }

            return this.obj;
        },
        
        mutators: {
            defer: function (methodName) {
                return getBoundDeferredFunction(methodName, this.obj, this.deferred);
            },
            undefer: function (methodName) {
                return this.obj[methodName]._originalFunction || this.obj[methodName];
            }

        }
    };

    var getBoundDeferredFunction = function (methodName, context, deferred) {
            return getDeferredFunction.call(context, context[methodName], deferred);
        };

    var getDeferredFunction = function (func, deferred) {

        if (!$.isArray(deferred)) {
            if (deferred.promise) {
                deferred = [deferred];
            } else {
                 return func;
            }
        }

        var context = this,
            deferredFunc = function () {
                var that = this !== window && this,
                    args = arguments;
                //deferred.done(function () {
                $.when.apply(null,  deferred).done(function () {
                //$.when.apply($, deferred).then(function () {
                    func.apply(that || context, args);
                });
            };

        deferredFunc._originalFunction = func;

        return deferredFunc;
    };


    
   


    // Static method.
    $.defer = function(obj, deferred, options) {
        options = $.extend(options || {}, {mode: 'defer'});

        var plug = new Plugin(obj, deferred, options);

        return plug.func || obj;

    };


    $.undefer = function (obj, options) {
        options = $.extend(options || {}, {mode: 'undefer'});

        new Plugin(obj, options.deferred || null, options);
        return obj;
   
    };


}(jQuery));
