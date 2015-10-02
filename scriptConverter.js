var fs = require('fs'),
    path = require('path');

var fileManager = require('./util/fileManager' ),
    scriptParser = require( './util/parser' ),
    domUtil = require( './util/dom' ),
    scriptConverter = require( './util/converter' );

var confFile = './conf/scriptConverter.json',
    content = fs.readFileSync( confFile, 'utf-8' ),
    conf = JSON.parse( content ),
    srcPath = conf.srcPath,
    destPath = conf.destPath;

var convert = function convert( hierarchy, base, p ) {
  var fileList = hierarchy[p],
      files = fileList.files,
      dirs = fileList.dirs;

  console.log( 'path ' + base + ' / ' + p );
  //console.log( JSON.stringify(fileList) );

  files.forEach( function(f) {
    var options = {
          silent: true
        },
        isXML = path.extname(f) === '.xml',
        xml, scriptCode,
        code = fs.readFileSync( path.resolve( base, p, f ), "utf8" );

    console.log(f);
    if ( isXML ) {
      xml = domUtil.getScriptNodes(code);
      scriptCode = xml.scriptCode;
    } else {
      scriptCode = [];
      scriptCode.push(code);
    }

    scriptCode.forEach( function( scriptContent, idx, list ) {
      console.log( scriptContent );
      var ast = scriptParser.parse( scriptContent, options );
      list[idx] = scriptConverter.convert( ast, options );
    } );

    if ( isXML ) {
      code = domUtil.setScriptNodes( xml.doc, xml.nodes, scriptCode );
    } else {
      code = scriptCode.join('');
    }
    console.log( 'code >> ' + code );

    // write file
  } );

  dirs.forEach( function(o) {
    convert( o, path.resolve( base, p ), Object.keys(o)[0] );
  } );
};

srcPath.forEach( function(p) {
  var hierarchy = fileManager.getFileHierarchy(p);
  //console.log( JSON.stringify(hierarchy) );

  convert( hierarchy, '', p );
  }
);
