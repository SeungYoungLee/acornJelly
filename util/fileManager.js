var fs = require('fs'),
    path = require('path');

var fileManager = require('./fileManager');

var ArrayProto = Array.prototype,
    push       = ArrayProto.push;

module.exports.getFileList = function ( dir, done ) {
  var results = [];
  fs.readdir( dir, function( err, list ) {
    if (err) {
      return done(err);
    }

    var pending = list.length;
    if ( !pending ) {
      return done( null, results );
    }

    list.forEach( function(file) {
      file = path.resolve( dir, file );
      fs.stat( file, function( err, stat ) {
        if ( stat && stat.isDirectory() ) {
          fileManager.getFileList( file, function( err, res ) {
            push.apply( results, res );
            if ( !--pending ) done( null, results );
          } );
        } else {
          // TODO option 로 제외하거나 제한할 목록을 받아서 filtering 한다.
          if ( file.lastIndexOf( '.xml' ) > 1 ) {
            results.push(file);
          } else {
            console.log( 'Omit ' + file );
          }
          if ( !--pending ) done( null, results );
        }
      } );
    } );
  } );
};

module.exports.getFileHierarchy = function ( baseDir, dir, hierarchy ) {
  if ( !dir ) {
    dir = baseDir;
  }

  if ( !hierarchy ) {
    hierarchy = {};
  }

  hierarchy[dir] = {
    files: [],
    dirs: []
  };

  var fullPath,
      extName = '',
      list = fs.readdirSync(baseDir);

  list.forEach( function(file) {
    fullPath = path.resolve( baseDir, file );

    if ( fs.statSync(fullPath).isDirectory() ) {
      var subDir = {};
      hierarchy[dir].dirs.push( subDir );
      fileManager.getFileHierarchy( fullPath, file, subDir );
    } else {
      extName = path.extname(file);
      if ( extName === '.xml' || extName === '.js' ) {
        hierarchy[dir].files.push(file);
      } else {
        console.log( 'Invalid ext name. ' + fullPath );
      }
    }
  } );

  return hierarchy;
};
