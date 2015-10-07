var domParser = require('xmldom').DOMParser,
    xpath = require('xpath');

var xSelect = xpath.useNamespaces( { "x": "http://www.w3.org/1999/xhtml" } ),
    w2Select = xpath.useNamespaces( { "w2": "http://www.inswave.com/websquare" } ),
    xfSelect = xpath.useNamespaces( { "xf": "http://www.w3.org/2002/xforms" } );

var CDATASection = [ '<![CDATA[', ']]>' ],
    ELEMENT_NODE = 1;

var getExtraProp = function getExtraProp( node, type, result ) {
  var i, item,
      attributes = node.attributes,
      attributeLength = attributes.length;

  for ( i = 0; i < attributeLength; i++ ) {
    item = attributes.item(i);
    if ( item.prefix === 'ev' ) {
      if ( !result.events ) {
        result.events = {};
      }
      result.events[item.localName] = item.nodeValue;
    }
  }

  if ( type === 'select1' || type === 'select' ) {
    result.appearance = node.getAttribute('appearance');
  } else if ( type === 'wframe' ) {
    result.src = node.getAttribute('src');
  }
};

var getGridColumns = function getGridColumns( select, baseNode, result ) {
  var nodes, childNodes;

  nodes = w2Select( select, baseNode );

  nodes.forEach( function ( node, i ) {
    result[i] = [];
    childNodes = w2Select( 'w2:column', node );

    childNodes.forEach( function ( column ) {
      result[i].push( column.getAttribute('id') );
    } );
  } );
};

var getSubModule = function getSubModule( baseNode, baseName, result ) {
  var keepGoing = true,
      id, nodes;

  if ( baseName === 'select1' || baseName === 'select' || baseName === 'autoComplete' ) {
    keepGoing = false;
    nodes = xfSelect( 'xf:choices/xf:itemset', baseNode );

    if ( nodes.length > 0 ) {
      nodes = nodes[0];
      result.nodeset = nodes.getAttribute('nodeset');
    }
  } else if ( baseName === 'gridView' ) {
    keepGoing = false;
    result.headers = [];
    result.gBody = [];
    result.footer = [];
    result.subTotal = [];

    getGridColumns( 'w2:header/w2:row', baseNode, result.headers );
    getGridColumns( 'w2:gBody/w2:row', baseNode, result.gBody );
    getGridColumns( 'w2:footer/w2:row', baseNode, result.footer );
    getGridColumns( 'w2:subTotal/w2:row', baseNode, result.subTotal );
  } else if ( baseName === 'tabControl' ) {
    keepGoing = false;
    result.tabs = [];
    result.content = {};

    nodes = w2Select( 'w2:tabs', baseNode );
    nodes.forEach( function ( node ) {
      result.tabs.push( node.getAttribute('id') )
    } );

    nodes = w2Select( 'w2:content', baseNode );
    nodes.forEach( function ( node ) {
      id = node.getAttribute('id');
      result.content[id] = {};
      getComponentID( node, result.content[id] );
    } );
  }

  return keepGoing;
};

var getComponentID = function getComponentID( baseNode, result ) {
  var i, id, name, node, childNodes, childrenLength;

  if ( baseNode.hasChildNodes() ) {
    childNodes = baseNode.childNodes;
    childrenLength = childNodes.length;

    for ( i = 0; i < childrenLength; i++ ) {
      node = childNodes.item(i);
      if ( node.nodeType === ELEMENT_NODE && ( node.prefix === 'w2' || node.prefix === 'xf' ) ) {
        id = node.getAttribute('id');

        if (id) {
          name = node.localName;

          result[id] = {
            type: name
          };

          getExtraProp( node, name, result[id] );
          if ( getSubModule( node, name, result[id] ) ) {
            getComponentID( node, result );
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
