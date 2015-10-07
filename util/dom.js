var domParser = require('xmldom').DOMParser,
    xpath = require('xpath');

var xSelect = xpath.useNamespaces( { "x": "http://www.w3.org/1999/xhtml" } ),
    w2Select = xpath.useNamespaces( { "w2": "http://www.inswave.com/websquare" } );

var CDATASection = [ '<![CDATA[', ']]>' ],
    ELEMENT_NODE = 1;

var getExtraProp = function getExtraProp( node, type, result ) {
  if ( type === 'select1' ) {
    result.appearance = node.getAttribute('appearance');
  }
};

var getSubModule = function getSubModule( baseNode, result, baseName ) {

};

var getComponentID = function getComponentID( baseNode, result, baseName ) {
  var i, id, name, node, childNodes, childrenLength;

  if ( baseNode.hasChildNodes() ) {
    childNodes = baseNode.childNodes;
    childrenLength = childNodes.length;

    for ( i = 0; i < childrenLength; i++ ) {
      node = childNodes.item(i);
      if ( node.nodeType === ELEMENT_NODE && ( node.prefix === 'w2' || node.prefix === 'xf' ) ) {
        console.log( node.nodeName + ' ' + node.prefix + ' ' + node.localName + ' ' + node.getAttribute('id') + ' ' + baseName );
        id = node.getAttribute('id');

        if ( baseName ) {
          getSubModule( baseNode, result, baseName );
        } else if (id) {
          name = node.localName;

          result[id] = {
            type: name
          };

          getExtraProp( node, name, result[id] );

          if ( name === 'select1' || name === 'gridView' || name === 'tabControl' ) {
            getComponentID( node, result[id], name );
          } else {
            getComponentID( node, result, null );
          }
        }
      }
    }
  }
};

module.exports.getScriptNodes = function getScriptNodes( content, xmlOptions ) {
  var result = {},
      doc = new domParser().parseFromString(content),
      nodes = xSelect( '//x:head/x:script', doc );

  result.doc = doc;
  result.nodes = nodes;
  result.scriptCode = [];

  nodes.forEach( function( node ) {
    var textContent = node.textContent,
        idx = [ textContent.indexOf(CDATASection[0]) + CDATASection[0].length,
                textContent.lastIndexOf(CDATASection[1]) ];

    result.scriptCode.push( textContent.substring( idx[0], idx[1] ) );
  } );

  if ( xmlOptions.componentID ) {
    result.component = {};
    nodes = xSelect( '/x:html/x:body', doc );
    nodes = nodes[0];

    getComponentID( nodes, result.component );

    console.log( JSON.stringify( result.component ) );
  }

  if ( xmlOptions.dataListID ) {
    result.dataList = {};
    nodes = w2Select( '//w2:dataList', doc );

    nodes.forEach( function( dataList ) {
      var id = dataList.getAttribute('id');
      result.dataList[id] = {};

      if ( xmlOptions.columnID ) {
        var columns = w2Select( 'w2:columnInfo//w2:column', dataList );

        columns.forEach( function( column ) {
          result.dataList[id][column.getAttribute('id')] = column.getAttribute('dataType');
        } );
      }
    } );
  }

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
