var fs = require('fs'),
    path = require('path');

var fileManager = require('./util/fileManager' ),
    scriptParser = require( './util/parser' );

var confFile = './conf/scriptConverter.json',
    content = fs.readFileSync( confFile, 'utf-8' ),
    conf = JSON.parse( content ),
    srcPath = conf.srcPath,
    destPath = conf.destPath;

srcPath.forEach( function(p) {
    var hierarchy = fileManager.getFileHierarchy(p);
    //console.log( JSON.stringify(hierarchy) );

    var fileList = hierarchy[p];
    console.log( JSON.stringify(fileList) );

    var files = fileList.files;
    var dirs = fileList.dirs;

    files.forEach( function(f) {
        var code = fs.readFileSync( path.resolve( p, f ), "utf8" );
        scriptParser.parse(code);
    } );
  }
);
