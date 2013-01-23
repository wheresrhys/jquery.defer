/*! Defer - v0.1.0 - 2013-01-23
* https://github.com/wheresrhys/jquery.defer
* Copyright (c) 2013 Rhys Evans; Licensed MIT */

(function($) {


    function getDeferredFunction(func, deferred) {
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
       
        
    }

    function getBoundDeferredFunction (methodName, context, deferred) {
        return getDeferredFunction.call(context, context[methodName], deferred);
    }


    // Static method.
    $.defer = function(obj, deferred, options) {

        var methods, i, method, exclude = {}, applyToPrototype = !!(options && options.applyToPrototype);
        
        if ($.isFunction(obj)) {
            return getDeferredFunction(obj, deferred);
        } else if (options && options.methods) {
            methods = options.methods.split(' ');

            for (i = methods.length-1; i>=0; i--) {
                obj[methods[i]] = getBoundDeferredFunction(methods[i], obj, deferred);
            }

        } else {
            if (options && options.exclude) {
                methods = options.exclude.split(' ');
                for (i = methods.length-1; i>=0; i--) {
                    exclude[methods[i]] = true;
                }
            }

            for (method in obj) {
                if (exclude[method]) {
                    continue;
                }
                if ((applyToPrototype || obj.hasOwnProperty(method)) && $.isFunction(obj[method])) {
                    
                    obj[method] = getBoundDeferredFunction(method, obj, deferred);
                }
            }
        }

        return obj;

    };

    $.undeferrize = function (obj, deferred, options) {

    };


}(jQuery));
