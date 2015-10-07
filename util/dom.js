var domParser = require('xmldom').DOMParser,
    xpath = require('xpath');

var CDATASection = [ '<![CDATA[', ']]>' ];

module.exports.getScriptNodes = function getScriptNodes( content, xmlOptions ) {
  var result = {},
      select = xpath.useNamespaces( { "x": "http://www.w3.org/1999/xhtml" } ),
      doc = new domParser().parseFromString(content),
      nodes = select( '//x:head/x:script', doc );

  result.doc = doc;
  result.nodes = nodes;
  result.scriptCode = [];

  nodes.forEach( function( node ) {
    var textContent = node.textContent,
        idx = [ textContent.indexOf(CDATASection[0]) + CDATASection[0].length,
                textContent.lastIndexOf(CDATASection[1]) ];

    result.scriptCode.push( textContent.substring( idx[0], idx[1] ) );
  } );

  if ( xmlOptions.dataListID ) {
    result.dataList = {};
    select = xpath.useNamespaces( { "w2": "http://www.inswave.com/websquare" } );
    nodes = select( '//w2:dataList', doc );

    nodes.forEach( function( dataList ) {
      var id = dataList.getAttribute('id');
      result.dataList[id] = {};

      if ( xmlOptions.columnID ) {
        var columns = select( 'w2:columnInfo//w2:column', dataList );

        columns.forEach( function( column ) {
          result.dataList[id][column.getAttribute('id')] = column.getAttribute('dataType');
        } );
      }
    } );
  }

  console.log( JSON.stringify( result.dataList ) );

  return result;
};

module.exports.setScriptNodes = function getScriptNodes( doc, nodes, scriptCode ) {
  scriptCode.forEach( function( code, i ) {
    var cdataNode = doc.createCDATASection(code),
        scriptNode = doc.createElement('script');

    scriptNode.appendChild(cdataNode);
    doc.replaceChild( scriptNode, nodes[i] );
  } );

  return doc.toString();
};