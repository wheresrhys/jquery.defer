/*
 * deferize
 * https://github.com/wheresrhys/jquery.deferize
 *
 * Copyright (c) 2013 Rhys Evans
 * Licensed under the MIT license.
 */

(function($) {


    function getDeferredFunction(func, deferred) {
        
        var context = this,
            deferredFunc = function (args) {
            deferred.done(function () {
                func.apply(context, args)
            });
        };

        deferredFunc._originalFunction = func;

        return deferredFunc;
        
    }

    function getBoundDeferredFunction (methodName, context, deferred) {
        return getDeferredFunction.call(context, context[methodName], deferred);
    }

    // Static method.
    $.deferize = function(obj, deferred, options) {

        var methods, i, method;
        
        if ($.isFunction(obj)) {
            return getDeferredFunction(obj, deferred);
        } else if (options.methods) {
            methods = options.methods.split(' ');

            for (i = methods.length-1; i>=0; i--) {
                obj.methods[i] = getBoundDeferredFunction(methods[i], obj, deferred);
            }

        } else {
            for (method in object) {
                if (object.hasOwnProperty(method) && $.isFunction(object.method)) {
                    obj[method] = getBoundDeferredFunction(method, obj, deferred);
                }
            }
        }

        return obj;

    };

    $.undeferize = function (obj, deferred, options) {

    }


}(jQuery));
