# jquery.defer / jquery.undefer

A pair of utility methods for forcing a function or an object's methods to wait for a deferred object to resolve before running and undoing this effect if required.

## Getting Started
Download the [production version][min] or the [development version][max].

[min]: https://raw.github.com/wheresrhys/jquery.deferize/master/dist/jquery.defer.min.js
[max]: https://raw.github.com/wheresrhys/jquery.deferize/master/dist/jquery.defer.js

In your web page:

```
html
<script src="jquery.js"></script>
<script src="dist/defer.min.js"></script>
<script>
jQuery(function($) {
  $.defer(object, deferredObject, options);
  $.undefer(object, options);
});
</script>
```

## Documentation
See the [source code][src] for documentation

[src]: https://github.com/wheresrhys/jquery.defer/blob/master/src/defer.js

## Examples
To implement the [lazy loaded google maps][inspiredby] that inspired this plugin the individually rewritten methods can be replaced by (using the same object and function names as in the original article)

```
$.defer(GoogleMaps.prototype, _mapsLoaded, {exclude: 'init'});
```

[inspiredby]: http://blog.pixelingene.com/2011/10/using-jquery-dot-deferred-and-requirejs-to-lazy-load-google-maps-api/

## Release History

-  v0.1.0 First iteration of plugin, carrying out basic defer and undefer actions