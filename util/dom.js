var domParser = require('xmldom').DOMParser,
    xpath = require('xpath');

var CDATASection = ['<![CDATA[', '', ']]>'];

module.exports.getScriptNodes = function getScriptNodes( content ) {
  var result = {},
      select = xpath.useNamespaces( { "x": "http://www.w3.org/1999/xhtml" } ),
      doc = new domParser().parseFromString(content),
      nodes = select( '//x:head/x:script', doc );

  result.doc = doc;
  result.scriptCode = [];

  nodes.forEach( function( node ) {
    var textContent = node.textContent,
        idx = [ textContent.indexOf(CDATASection[0]) + CDATASection[0].length,
                textContent.lastIndexOf(CDATASection[2]) ];

    result.scriptCode.push( textContent.substring( idx[0], idx[1] ) );
  } );

  return result;
};

module.exports.setScriptNodes = function getScriptNodes( code, scriptCode ) {


  return code;
};