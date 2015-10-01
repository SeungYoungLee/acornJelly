var acorn = require('acorn/dist/acorn_loose');

module.exports.parse = function ( code, options ) {
  var parsed,
      tokens;

  options = options || {};

  if ( options.locations !== false ) {
    options.locations = true;
  }

  if ( options.tokenize ) {
    tokens = [];
    options.onToken = tokens;
  }

  code = code.replace( /<>/g, '!=' ).replace( /Var\s+/g, 'var ' );

  try {
    parsed = acorn.parse_dammit( code, options );
  } catch(e) {
    // SyntaxError
    console.error( e.message + ' loc ' + JSON.stringify( e.loc ) );
    process.exit(1);
  }

  if ( !options.silent ) {
    console.log( JSON.stringify( options.tokenize ? tokens : parsed, null, 2 ) );
  }
};
