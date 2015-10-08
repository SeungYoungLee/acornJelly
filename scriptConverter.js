var fs = require('fs'),
    path = require('path'),
    mkdir = require('mkdirp'),
    beautifier = require('js-beautify').js_beautify;

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
    xmlOptions = conf.xmlOptions || {},
    optionsProto = conf.parseOptions || {},
    beautifyOptions = conf.beautifyOptions || {};

var convert = function convert( hierarchy, base, p ) {
  var fileList = hierarchy[p || base],
      files = fileList.files,
      dirs = fileList.dirs;

  files.forEach( function(f) {
    var isXML = path.extname(f) === '.xml',
        xml, scriptCode,
        code = fs.readFileSync( path.resolve( base, p, f ), "utf8" );

    if ( isXML ) {
      xml = domUtil.getScriptNodes( code, xmlOptions );
      scriptCode = xml.scriptCode;
    } else {
      scriptCode = [];
      scriptCode.push(code);
    }

    scriptCode.forEach( function( scriptContent, idx, list ) {
      var options = Object.create(optionsProto),
          ast = scriptParser.parse( scriptContent, options );

      if ( isXML && xmlOptions.componentID ) {
        options.component = xml.component;
      }

      if ( isXML && xmlOptions.dataListID ) {
        options.dataList = xml.dataList;
      }

      list[idx] = scriptConverter.convert( ast, options );
      list[idx] = beautifier( list[idx], beautifyOptions );
      list[idx] = '\n' + list[idx];
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
