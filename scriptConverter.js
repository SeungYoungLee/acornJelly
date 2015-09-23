var acorn = require('acorn/dist/acorn_loose');
var fs = require("fs");

var tokenize = false,
    silent = false;

var fileList = [
    'samples/basic.js',
    'samples/test.js'
  ],
  infile = fileList[1];

var parsed,
    tokens,
    options = {};

options.locations = true;

if ( tokenize ) {
  tokens = [];
  options.onToken = tokens;
}

var code = fs.readFileSync( infile, "utf8" );
code = code.replace( /<>/g, '!=' ).replace( /Var\s+/g, 'var ' );

try {
  parsed = acorn.parse_dammit( code, options );
} catch(e) {
  // SyntaxError
  console.error( e.message + ' loc ' + JSON.stringify( e.loc ) );
  process.exit(1);
}

if ( !silent ) {
  console.log( JSON.stringify( tokenize ? tokens : parsed, null, 2 ) );
}
