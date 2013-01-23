// Adapted from work by jorge@jorgechamorro.com on 2010-11-25
(function () {
  "use strict"

  // Array.prototype.forEachAsync(next, item, i, collection)
  //require('Array.prototype.forEachAsync');

  function noop() {}

  var fs = require('fs')
    , forEachAsync = require('forEachAsync')
    , EventEmitter = require('events').EventEmitter
    , TypeEmitter = require('./node-type-emitter')
    ;

  function create(pathname, options, sync) {
    var emitter = new EventEmitter()
      , q = []
      , queue = [q]
      , curpath;

    function readdirHandler(err, files) {
      var fnodeGroups = TypeEmitter.createNodeGroups();

      function filesHandler(cont, file) {
        var statPath;

        emitter.emit('name', curpath, file, noop);

        function lstatHandler(err, stat) {
          stat = stat || {};
          stat.name = file;
          if (err) {
            stat.error = err;
            //emitter.emit('error', curpath, stat);
            emitter.emit('nodeError', curpath, stat, noop);
            fnodeGroups.errors.push(stat);
            cont();
          } else {
            TypeEmitter.sortFnodesByType(stat, fnodeGroups);
            TypeEmitter.emitNodeType(emitter, curpath, stat, cont);
          }
        }

        statPath = curpath + '/' + file;
        if (sync) {
          try {
            lstatHandler(null, fs.lstatSync(statPath));
          } catch(e) {
            lstatHandler(e);
          }
        } else {
          fs.lstat(statPath, lstatHandler);
        }
      }

      function postFilesHandler() {
        if (fnodeGroups.errors.length) {
          emitter.emit('errors', curpath, fnodeGroups.errors, noop);
        }
        TypeEmitter.emitNodeTypeGroups(emitter, curpath, fnodeGroups, function () {
          var dirs = [];
          fnodeGroups.directories.forEach(function (stat) {
            dirs.push(stat.name);
          });
          dirs.forEach(fullPath);
          queue.push(q = dirs);
          next();
        });
      }

      if (err) {
        emitter.emit('directoryError', curpath, { error: err }, noop);
        //emitter.emit('error', curpath, { error: err });
      }

      if (!files || 0 == files.length) {
        return next();
      }

      // TODO could allow user to selectively stat
      // and don't stat if there are no stat listeners
      emitter.emit('names', curpath, files, noop);

      if (sync) {
        files.forEach(function (items) {
          filesHandler(noop, items);
        });
        postFilesHandler();
      } else {
        forEachAsync(files, filesHandler).then(postFilesHandler);
      }
    }

    function walkSync() {
      var err, files;

      try {
        files = fs.readdirSync(curpath);
      } catch(e) {
        err = e;
      }

      readdirHandler(err, files);
    }

    function walk() { 
      if (sync) {
        walkSync();
        return;
      }

      fs.readdir(curpath, readdirHandler);
    }
    
    function next() {
      if (q.length) {
        curpath = q.pop();
        return walk();
      }
      if (queue.length -= 1) {
        q = queue[queue.length - 1];
        return next();
      }
      emitter.emit('end');
    }
    
    function fullPath(v, i, o) {
      o[i] = [curpath, '/', v].join('');
    }
    
    curpath = pathname;

    if (sync) {
      process.nextTick(walk);
    } else {
      walk();
    }

    return emitter;
  }

  exports.walk = function (path, opts) {
    return create(path, opts, false);
  };

  exports.walkSync = function (path, opts) {
    return create(path, opts, true);
  };
}());
