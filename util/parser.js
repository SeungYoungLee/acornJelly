var acorn = require('acorn/dist/acorn_loose'),
    beautifier = require('js-beautify').js_beautify;

module.exports.parse = function ( code, options, beautifyOptions ) {
  var parsed;

  options = options || {};

  if ( options.locations !== false ) {
    options.locations = true;
  }

  if ( options.onToken ) {
    options.onToken = [];
  }

  if ( options.onComment ) {
    options.onComment = [];
  }

  code = code.replace( /<>/g, '!=' ).replace( /Var /g, 'var ' )
             .replace( / OR /g, ' || ' ).replace( / and /g, ' && ' );
  code = beautifier( code, beautifyOptions );

  try {
    parsed = acorn.parse_dammit( code, options );
  } catch(e) {
    // SyntaxError
    console.error( e.message + ' loc ' + JSON.stringify( e.loc ) );
    process.exit(1);
  }

  if ( !options.silent ) {
    console.log( JSON.stringify( options.onToken ? options.onToken : parsed, null, 2 ) );
  }

  return options.onToken ? options.onToken : parsed;
};
