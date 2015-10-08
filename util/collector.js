var _ = require('underscore');

var indent = '',
    reservedWords = [ 'object', 'array' ];

var transformName = function transformName( name, type, expression ) {
  var isTransform = false;

  if ( name === 'toString' ) {
    isTransform = true;
    name = 'Mi_toString';
  } else if ( name === 'length' ) {
    isTransform = true;
    name = 'Mi_length';
  }

  if ( isTransform ) {
    if ( type === 'Identifier' ) {
      expression.name = name;
    } else if ( type === 'MemberExpression' ) {
      expression.property.name = name;
    }
  }

  return name;
};

var checkReservedWord = function checkReservedWord( name ) {
  name = name.toLowerCase();

  return _.some( reservedWords, function( word ) {
    return name === word;
  } );
};

var getCallee = function getCallee( expression, result ) {
  if ( expression.type === 'Identifier' ) {
    transformName( expression.name, expression.type, expression );

    if ( checkReservedWord(expression.name) ) {
      //console.log( 'Reserved Word ' + expression.name );
    } else {
      if ( !result[expression.name] ) {
        result[expression.name] = 1;
      } else {
        result[expression.name] += 1;
      }
    }
  } else if ( expression.type === 'MemberExpression' ) {
    transformName( expression.property.name, expression.type, expression );

    if ( checkReservedWord( expression.property.name ) ) {
      //console.log( 'Reserved Word ' + expression.property.name );
    } else {
      if ( !result[expression.property.name] ) {
        result[expression.property.name] = 1;
      } else {
        result[expression.property.name] += 1;
      }
    }

    if ( expression.object.type === 'CallExpression' ) {
      getCallee( expression.object.callee, result );
    }
  }
};

var checkList = function checkList( list, result ) {
  list.forEach( function( item ) {
    checkExpression( item, result );
  } );
};

var checkExpression = function checkExpression( item, result ) {
  if ( item.type === 'CallExpression' ) {
    getCallee( item.callee, result );
    checkList( item.arguments, result );
  } else if ( item.type === 'BinaryExpression' ) {
    checkBinaryExpression( item, result );
  } else if ( item.type === 'LogicalExpression' ) {
    checkLogicalExpression( item, result );
  } else if ( item.type === 'MemberExpression' ) {
    checkExpression( item.object, result );
  }
};

var checkBinaryExpression = function checkBinaryExpression( item, result ) {
  var subType = item.left;
  checkExpression( subType, result );

  subType = item.right;
  checkExpression( subType, result );
};

var checkLogicalExpression = function checkLogicalExpression( item, result ) {
  if ( item.left.type === 'CallExpression' ) {
    checkExpression( item.left, result );
  } else {
    dig( [item.left], result );
  }

  if ( item.right.type === 'CallExpression' ) {
    checkExpression( item.right, result );
  } else {
    dig( [item.right], result );
  }
};

var checkBlockStatement = function checkBlockStatement( item, result ) {
  if ( item.type === 'BlockStatement' ) {
    dig( item.body, result );
  } else if ( item.type === 'ExpressionStatement' ) {
    dig( [item], result );
  }
};

var dig = function dig( list, result ) {
  indent += '  ';
  list.forEach( function( item ) {
    var subType, right;

    if ( item.type === 'ExpressionStatement' ) {
      subType = item.expression;
      checkExpression( subType, result );

      if ( subType.type === 'AssignmentExpression' && ( subType.operator === '=' || subType.operator === '+=' ) ) {
        right = subType.right;
        checkExpression( right, result );
      }
    } else if ( item.type === 'LogicalExpression' ) {
      checkLogicalExpression( item, result );
    } else if ( item.type === 'BinaryExpression' ) {
      checkBinaryExpression( item, result );
    } else if ( item.type === 'UnaryExpression' ) {
      subType = item.argument;
      checkExpression( subType, result );
    } else if ( item.type === 'VariableDeclaration' ) {
      item.declarations.forEach( function( declaration ) {
        if ( declaration.init ) {
          checkExpression( declaration.init, result );
        }
      } );
    } else if ( item.type === 'ReturnStatement' ) {
      if ( item.argument && item.argument.type === 'CallExpression' ) {
        checkExpression( item.argument, result );
      }
    } else if ( item.type === 'IfStatement' ) {
      subType = item.test;
      if ( subType.type === 'LogicalExpression' ) {
        checkLogicalExpression( subType, result );
      } else if ( subType.type === 'BinaryExpression' || subType.type === 'UnaryExpression' ) {
        dig( [subType], result );
      } else if ( subType.type === 'CallExpression' ) {
        checkExpression( subType, result );
      }

      subType = item.consequent;
      if ( subType.type === 'ExpressionStatement' ) {
        dig( [subType], result );
      } else {
        checkBlockStatement( subType, result );
      }

      subType = item.alternate;
      if ( subType ) {
        if ( subType.type === 'IfStatement' ) {
          dig( [subType], result );
        } else {
          checkBlockStatement( subType, result );
        }
      }
    } else if ( item.type === 'SwitchStatement' ) {
      checkExpression( item.discriminant, result );
      item.cases.forEach( function( switchCase ) {
        dig( switchCase.consequent, result );
      } );
    } else if ( item.type === 'ForStatement' ) {
      subType = item.init;
      dig( [subType], result );

      subType = item.update;
      dig( [subType], result );

      subType = item.test;
      dig( [subType], result );

      checkBlockStatement( item.body, result );
    } else if ( item.type === 'WhileStatement' ) {
      // The test block isn't implemented
      checkBlockStatement( item.body, result );
    } else if ( item.type === 'FunctionDeclaration' ) {
      checkBlockStatement( item.body, result );
    } else if ( item.type === 'BlockStatement' ) {
      dig( item.body, result );
    }
  } );
  indent = indent.slice(2);
};

module.exports.collect = function collect( infoList ) {
  var result = {};

  infoList.forEach( function ( info ) {
    dig( info.ast.body, result );
  } );

  return result;
};