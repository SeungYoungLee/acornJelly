var fs = require('fs'),
    path = require('path'),
    mkdir = require('mkdirp'),
    beautifier = require('js-beautify').js_beautify,
    _ = require('underscore');

var fileManager = require('./util/fileManager' ),
    scriptParser = require( './util/parser' ),
    domUtil = require( './util/dom' ),
    collector = require( './util/collector' );

var confFile = './conf/scriptStats.json',
    content = fs.readFileSync( confFile, 'utf-8' ),
    conf = JSON.parse( content ),
    srcPath = conf.srcPath,
    destPath = conf.destPath,
    xmlOptions = conf.xmlOptions || {},
    optionsProto = conf.parseOptions || {},
    beautifyOptions = conf.beautifyOptions || {},
    total = {};

var stats = function stats( hierarchy, base, p ) {
  var fileList = hierarchy[p || base],
      files = fileList.files,
      dirs = fileList.dirs,
      counting;

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
          ast = scriptParser.parse( scriptContent, options, beautifyOptions );

      list[idx] = { ast: ast };

      if ( isXML && xmlOptions.componentID ) {
        list[idx].component = xml.component;
      }

      if ( isXML && xmlOptions.dataListID ) {
        list[idx].dataList = xml.dataList;
      }
    } );

    counting = collector.collect( scriptCode );

    _.reduce( counting, function( total, count, name ) {
      if ( !total[name] ) {
        total[name] = count;
      } else {
        total[name] += count;
      }
      return total;
    }, total );

    fs.writeFileSync(
      path.resolve( destPath, path.relative( srcPath, base ), p, path.basename( f, path.extname(f) ) + '.json' ),
      beautifier( JSON.stringify( counting ), beautifyOptions )
    );
  } );

  dirs.forEach( function(o) {
    mkdir.sync( path.resolve( destPath, path.relative( srcPath, base ), p, Object.keys(o)[0] ) );
    stats( o, path.resolve( base, p ), Object.keys(o)[0] );
  } );
};

var hierarchy = fileManager.getFileHierarchy(srcPath);
stats( hierarchy, srcPath, '' );

//console.log( JSON.stringify(total) );

fs.writeFileSync(
  path.resolve( destPath, 'total.json' ),
  beautifier( JSON.stringify( total ), beautifyOptions )
);