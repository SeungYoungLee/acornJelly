var fs = require('fs'),
    mkdir = require('mkdirp'),
    path = require('path');

var fileManager = require('./util/fileManager' ),
    scriptParser = require( './util/parser' ),
    domUtil = require( './util/dom' ),
    scriptConverter = require( './util/converter' );

var confFile = './conf/scriptConverter.json',
    content = fs.readFileSync( confFile, 'utf-8' ),
    conf = JSON.parse( content ),
    srcPathList = conf.srcPath,
    destPath = conf.destPath,
    srcPath,
    optionsProto = conf.parseOptions || {};

var convert = function convert( hierarchy, base, p ) {
  var fileList = hierarchy[p || base],
      files = fileList.files,
      dirs = fileList.dirs;

  files.forEach( function(f) {
    var isXML = path.extname(f) === '.xml',
        xml, scriptCode,
        code = fs.readFileSync( path.resolve( base, p, f ), "utf8" );

    if ( isXML ) {
      xml = domUtil.getScriptNodes(code);
      scriptCode = xml.scriptCode;
    } else {
      scriptCode = [];
      scriptCode.push(code);
    }

    scriptCode.forEach( function( scriptContent, idx, list ) {
      var options = Object.create(optionsProto),
          ast = scriptParser.parse( scriptContent, options );

      list[idx] = scriptConverter.convert( ast, options );
    } );

    if ( isXML ) {
      code = domUtil.setScriptNodes( xml.doc, xml.nodes, scriptCode );
    } else {
      code = scriptCode.join('');
    }

    fs.writeFileSync( path.resolve( destPath, path.relative( srcPath, base ), p, f ), code );
  } );

  dirs.forEach( function(o) {
    mkdir.sync( path.resolve( destPath, path.relative( srcPath, base ), p, Object.keys(o)[0] ) );
    convert( o, path.resolve( base, p ), Object.keys(o)[0] );
  } );
};

srcPathList.forEach( function(p) {
  var hierarchy = fileManager.getFileHierarchy(p);

  srcPath = p;
  convert( hierarchy, p, '' );
}
);
