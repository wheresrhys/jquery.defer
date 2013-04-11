/*
 * defer/undefer
 * https://github.com/wheresrhys/jquery.defer
 *
 * Copyright (c) 2013 Rhys Evans
 * Licensed under the MIT license.
 */

(function($) {

    /*
        getDeferredMethod
        Creates a deferred method for a specified object
        @param {String} methodName  The name of the method
        @param {Object} context     The object the method is a property of
        @param {jquery.Deferred} deferred   The deferred object to wait for before running the method (or array of deferred objects)
     */
    var getDeferredMethod = function (methodName, context, deferred) {
        return getDeferredFunction(context[methodName], deferred);
    };


    /*
        getDeferredFunction
        Creates a deferred function
        @this {Object}  If used to defer a method this will be the object for which the function is a method
        @param {Function} func  The function to defer
        @param {jquery.Deferred} deferred   The deferred object to wait for before running the method (or array of deferred objects)
     */
    var getDeferredFunction = function (func, deferred) {

        // Prepare single deferreds for use with Function.prototype.apply
        if (!$.isArray(deferred)) {
            if (deferred.promise) {
                deferred = [deferred];
            } else {
                // If the object isn't a deferred there's no need to alter the function
                return func;
            }
        }
        
            // Create the deferred function
        var deferredFunc = function () {
                // Handle cases where the method might be called with a different context to the object it is a property of
                var that = this,
                    args = arguments;

                // Run the original function conditionally on the deferred resolving
                $.when.apply(null,  deferred).done(function () {
                    func.apply(that, args);
                });
            };

        // save a reference to the original function and return the new function
        deferredFunc._originalFunction = func;

        return deferredFunc;
    };

    /*
        Container for the two methods used to defer/undefer a function (called within the loops that cycle through an object's methods)
     */
    var mutators = {
        defer: function (methodName) {
            return getDeferredMethod(methodName, this.obj, this.deferred);
        },
        undefer: function (methodName) {
            return this.obj[methodName]._originalFunction || this.obj[methodName];
        }
    };

    /*
        Plugin
        Constructor for a temporary object used as a container for properties used in setting up/tearing down the deferred functions
        @constructor
        @param {Object|Function} obj        The object to convert methods into deferred methods, or function to convert to a deferred function
        @param {jquery.Deferred} deferred   The deferred object the functions will wait for before running (or an array of deferred objects)
        @param {Object} options             Options for instantiating the plugin: methods - space separated string restricting the plugin's action to only those methods named 
                                                                                  exclude - space separated string preventing the pluginfrom acting on those methods named   
                                                                                  applyToPrototype - boolean specifying whether to apply the plugin to methods in the prototype chain
     */
    var Plugin = function (obj, deferred, options) {
        
        this.obj = obj, 
        this.deferred = deferred, 
        this.options = options;
        this.mode = options.mode;
        this.run();
    };

    /*
        Plugin.run
        Applies the plugin according to the options passed to it
     */
    Plugin.prototype.run = function () {
        var options = this.options, 
            applyToPrototype = !!(options && options.applyToPrototype),
            exclude = {}, 
            methods, 
            method, 
            i;
            
        // Choose the mutator to use depending on whether we're deferring or undeferring
        this.mutator = mutators[this.mode];

        // At present doesn't support undeferring a standalone function
        if (this.mode === 'undefer' && $.isFunction(this.obj)) {
            return this.obj;
        
        // If deferring a standalone function create a deferred version and save a reference which can be retrieved by the original $.defer() call
        } else if ($.isFunction(this.obj)) {
            this.func = getDeferredFunction(this.obj, this.deferred);

        // If methods to apply to were specified then only defer those methods
        } else if (options && options.methods) {
            methods = options.methods.split(' ');
            
            for (i = methods.length-1; i>=0; i--) {
                this.obj[methods[i]] = this.mutator(methods[i]);
            }

        } else {

            // If an exclude list of methods was provided create a hash table to compare method names to
            if (options && options.exclude) {
                methods = options.exclude.split(' ');
                for (i = methods.length-1; i>=0; i--) {
                    exclude[methods[i]] = true;
                }
            }

            // Run through each property of the object
            for (method in this.obj) {

                // Skip over excluded methods
                if (exclude[method]) {
                    continue;
                }

                // Check to see if the property is a function and we don't apply changes to the prototype chain when we shouldn't be
                if ((applyToPrototype || this.obj.hasOwnProperty(method)) && $.isFunction(this.obj[method])) {
                    this.obj[method] = this.mutator(method);
                }
            }
        }
    };

    
    /*
        jquery.defer
        Defer the calling of functions/methods until after a deferred object has resolved
        @see Plugin
     */
    $.defer = function(obj, deferred, options) {
        options = $.extend(options || {}, {mode: 'defer'});

        var plug = new Plugin(obj, deferred, options);

        return plug.func || obj;

    };

    /*
        jquery.undefer
        Undo deferring the calling of functions/methods until after a deferred object has resolved
        @see Plugin
     */
    $.undefer = function (obj, options) {
        options = $.extend(options || {}, {mode: 'undefer'});

        new Plugin(obj, options.deferred || null, options);
        return obj;
   
    };


}(jQuery));
