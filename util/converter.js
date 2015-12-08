module.exports.convert = function ( esTree, options ) {
  var dataStr = '\r\n\r\n';   
  var scriptStr = '\r\n\r\n'; 
  
  var commentObject = Object.keys(options.onComment); 
  
 //console.log( 'convert esTree == ' +  JSON.stringify(esTree) );
 //console.log( 'convert scriptContent == ' +  JSON.stringify(options.onComment) );
  
  //return "function test() { return 'converted script'; }";
  
  //VariableDeclaration 변수선언 
//MemberExpression 중첩 
//CallExpression 함수호출
//ReturnStatement return
var getDatatest = function( bodyStr, dataStr ){  
  //console.log( 'getDatatest bodyStr == ' +  JSON.stringify(bodyStr) );
   var bodyObject = Object.keys(bodyStr); 
    
   bodyObject.forEach( function(item, idx, obj) {
    
    if( typeof(bodyStr[item]) == 'object' ){  
     for ( i = 0; i < bodyStr[item].length; i++ ) { 
           dataStr = getDatatest(bodyStr[item][i], dataStr);  
     }    
        
    }
    
  //console.log( 'getDatatest item == ' +  item );
  //console.log( 'getDatatest item == ' +  bodyStr.type );
  
   
   });
  //console.log( 'getDatatest type == ' +  bodyStr );
  return dataStr;
};
var makeSubsrc = function( subObject ){  
 var rtnSrc = '';
  
 //console.log( 'subObject ' +  subObject.type  );   
 
 if(subObject.type == 'VariableDeclaration' ){
     
     //rtnSrc += subObject.kind + ' ';
     
     if(subObject.declarations.length > 0 ){ 
      for ( v = 0; v < subObject.declarations.length; v++ ) {
      
       rtnSrc += subObject.declarations[v].id.name;
       
    if(subObject.declarations[v].init == null){ 
    } else {
        rtnSrc += ' = ';
        if(subObject.declarations[v].init.type == 'Literal'){
         rtnSrc += subObject.declarations[v].init.raw;
        } else if (subObject.declarations[v].init.type == 'CallExpression'){
         var ckStr = makeSubsrc(subObject.declarations[v].init);
          
  // console.log( 'subObject.ckStr ' +  ckStr + '  ' + ckStr.indexOf( 'Array' ) );   
  
         if( ckStr.indexOf( 'Array' ) == 0 ){    
          rtnSrc += 'new Arrary()';
         } else { 
          rtnSrc += ckStr;
         }
         
        }
       }
      } 
     }
     
     rtnSrc += '; ';
  // rtnSrc += '\r\n';   
  } else if( subObject.type == 'Literal' ){
   
 if( subObject.raw != undefined ){
  rtnSrc += subObject.raw;
 } else {
     rtnSrc += subObject.argument.raw;
 }
 
         
  } else if( subObject.type == 'MemberExpression' ){
  
  //( 'CallExpression expression  subObject.type == ' +   subObject.type  );
    if(subObject.object.type == 'MemberExpression'){
     rtnSrc += makeSubsrc(subObject.object);    
   if( subObject.computed == false ){
    rtnSrc += '.';
   }
   var ckStr = subObject.property.name; 
   
   
  
  
   if( ckStr == 'value' ){
    rtnSrc += 'getValue()';
   } else if( ckStr == 'ClearData' ){
    rtnSrc += 'removeAll';
   } else {
    rtnSrc += ckStr;
   }
   
    } else {
    
   rtnSrc += subObject.object.name; 
   if( subObject.computed == false ){
    rtnSrc += '.';
   } 
   var ckStr = subObject.property.name;
   
  
   if( ckStr == 'value' ){
    rtnSrc += 'getValue()';
   } else if( ckStr == 'SetColumn' ){
    rtnSrc += 'setCellData';
   } else if( ckStr == 'ClearData' ){
    rtnSrc += 'removeAll';
   } else {
    rtnSrc += ckStr;
   }
    
    } 
    
 } else if(subObject.type == 'Identifier'){  
  
    //console.log( 'subObject.type : ' + subObject.type ); 
    //console.log( 'subObject.name : ' + subObject.name ); 
     if( subObject.name != undefined ){ 
      rtnSrc += subObject.name; 
     } else {
      rtnSrc += subObject.operator;
     }  
 } else if( subObject.type == 'Literal'){
 
  if( subObject.raw != undefined ){
   rtnSrc += subObject.raw;
  } else {
      rtnSrc += subObject.argument.raw;
  }
  
  } else if( subObject.type == 'ExpressionStatement' ){
  
   rtnSrc += makeSubsrc(subObject.expression);  
    
  
  } else if( subObject.type == 'CallExpression' ){
  
   
  if( subObject.callee.type == 'Identifier' ){
   rtnSrc += makeSubsrc(subObject.callee);  
   //rtnSrc += subObject.callee.name;
   
   
  } else if (subObject.callee.type == 'MemberExpression' ){
   rtnSrc += makeSubsrc(subObject.callee);   
   
  }
    
  rtnSrc += '('; 
  if(subObject.arguments != undefined){
            
  
      if(subObject.arguments.length > 0 ){ 
       for ( a = 0; a < subObject.arguments.length; a++ ) {
        if( a != 0 ){
         rtnSrc += ' , ';
        }
        
        
    //console.log( 'CallExpression dddd : ' + subObject.arguments[a].type ); 
   // console.log( 'CallExpression bbbb : ' + JSON.stringify( subObject.arguments[a] )); 
        if(subObject.arguments[a].type == 'CallExpression'){
         rtnSrc += makeSubsrc(subObject.arguments[a]);  
        
        } else if(subObject.arguments[a].type == 'Literal'){
         rtnSrc += makeSubsrc(subObject.arguments[a]);  
         
         
        } else if(subObject.arguments[a].type == 'MemberExpression'){
         
         rtnSrc += makeSubsrc(subObject.arguments[a]);  
          
         
        } else if(subObject.arguments[a].type == 'Identifier'){  
        
         rtnSrc += makeSubsrc(subObject.arguments[a]);   
        
        } else {
        
         if( subObject.arguments[a].name != undefined ){
          rtnSrc += subObject.arguments[a].name;
         } else {
          rtnSrc += subObject.arguments[a].operator;
         }
          
         if( subObject.arguments[a].raw != undefined ){
          rtnSrc += subObject.arguments[a].raw;
         } else {
          rtnSrc += subObject.arguments[a].argument.raw;
         }
        
        }
        
         
           
       } //end for 
      
      } 
      
  } 
  rtnSrc += ') '; 
   
  } else if( subObject.type == 'ReturnStatement' ){
  
  rtnSrc += ' return '; 
  if ( subObject.argument == null ){
   rtnSrc += ';' + '\r\n'; 
  } else {
   rtnSrc += subObject.argument.raw;
   rtnSrc += ';' + '\r\n'; 
  } 
  }       
  //console.log( 'makeSubsrc rtnSrc == ' +  rtnSrc );   
  
   // console.log( 'js make makeSubsrc ' +  subObject.loc.start.line ); 
     rtnSrc += getComment(subObject.loc.start.line);  
 return rtnSrc;
};
//
var getComment = function( startLine ){
  var scrStr = '';
      
      commentObject.forEach( function(item, idx, obj) {
      
  // console.log( 'js make dataStr ' +  options.onComment[item].type ); 
   
       if( options.onComment[item].loc.start.line  < startLine){
          
     if(options.onComment[item].type == 'Block' ){
     
        scrStr += options.onComment[item].value + '\r\n';
        
     } else if(options.onComment[item].type == 'Line' ){
        scrStr += '//' + options.onComment[item].value + '\r\n';
      
        
     } 
   
    //scrStr += '//' + options.onComment[item].value + '\r\n'; ;
    delete commentObject[item];
       } 
 
   // console.log( 'js make dataStr ' +  options.onComment[item].loc.start.line ); 
    
    }) //end forEach 
       
 return scrStr;
};
var getData = function( bodyStr, dataStr ){ 
 
  
    //console.log( 'js make bodyStr ' +  bodyStr.loc.start.line ); 
    var startLine = bodyStr.loc.start.line;
   dataStr += getComment(startLine);  
   
     if(bodyStr.type == 'VariableDeclaration' ){
     
      dataStr += '\r\n';  
       
      dataStr += 'scwin.';  
   dataStr += makeSubsrc(bodyStr);  
       
  
  
  } else if(bodyStr.type == 'ExpressionStatement' ){
      dataStr += '\r\n';  
   dataStr += makeSubsrc(bodyStr);  
  
  //function 처리 
  } else if(bodyStr.type == 'FunctionDeclaration' ){
  
      dataStr += '\r\n';  
      
      /* AS_IS 
      dataStr += 'function ';  
      dataStr += bodyStr.id.name;
      */
      
      /* TO_BE */ 
      dataStr += 'scwin.';   
      dataStr += bodyStr.id.name;
      dataStr += ' = function ';  
      
      dataStr += '( ';
       
 
      if(bodyStr.params.length > 0 ){ 
       for ( p = 0; p < bodyStr.params.length; p++ ) {
        if( p != 0 ){
         dataStr += ' , ';
        }
        dataStr += bodyStr.params[p].name;
           
       } //end for 
      
      } 
      
      dataStr += ' ) ' + '\r\n';
      
      dataStr += '{ ' + '\r\n';
      
      
     
      if (bodyStr.body.type == 'BlockStatement' ){
      
        
       if(bodyStr.body.body.length > 0 ){ 
        for ( j = 0; j < bodyStr.body.body.length; j++ ) {
          
         dataStr += '\t';
         
         if( bodyStr.body.body[j].type == 'VariableDeclaration') {
         
          dataStr += bodyStr.body.body[j].kind + ' ';
       dataStr += makeSubsrc(bodyStr.body.body[j]);   
         
         } else if( bodyStr.body.body[j].type == 'ExpressionStatement') {
         
          //console.log( 'expression : ' + bodyStr.body.body[j].expression.callee.object.name );
          if( bodyStr.body.body[j].expression.type == 'CallExpression') {
          
            //dataStr += 'scwin.';  
            dataStr += makeSubsrc(bodyStr.body.body[j].expression);  
            
  
            dataStr += ';'+ '\r\n';
               
          } else if ( bodyStr.body.body[j].expression.type == 'AssignmentExpression') {
       
      //console.log( 'bodyStr zzz: ' + bodyStr.body.body[j].expression.type ); 
      //console.log( 'bodyStr zzz: ' + bodyStr.body.body[j].expression.left.property.name ); 
     // console.log( 'bodyStr zzz: ' + bodyStr.body.body[j].expression.right.raw ); 
      
            //dataStr += makeSubsrc(bodyStr.body.body[j].expression);  
            /*
           if(bodyStr.body.body[j].expression.left.name ! = undefined){
           
            dataStr += bodyStr.body.body[j].expression.left.name; 
            
           } else {
            // dataStr += makeSubsrc(bodyStr.body.body[j].expression.object);  
           }
           */  
        if(bodyStr.body.body[j].expression.left.object.name != undefined ){
 
            dataStr += bodyStr.body.body[j].expression.left.object.name; 
            
            if( bodyStr.body.body[j].expression.left.computed == true ){
             dataStr += '[';
            dataStr += bodyStr.body.body[j].expression.left.property.raw;
            dataStr += ']';
            }
            
            dataStr += bodyStr.body.body[j].expression.operator;
            dataStr += bodyStr.body.body[j].expression.right.raw;
            
            dataStr += ';' + '\r\n';
            
        } else {
     
            dataStr += bodyStr.body.body[j].expression.left.object.object.name; 
            
            if( bodyStr.body.body[j].expression.left.computed == false ){
             dataStr += '.';
            }
                
            dataStr += bodyStr.body.body[j].expression.left.object.property.name;
            
            if( bodyStr.body.body[j].expression.left.object.computed == false ){
             dataStr += '.';
            }
            
            dataStr += bodyStr.body.body[j].expression.left.property.name;
            
            dataStr += bodyStr.body.body[j].expression.operator;
            dataStr += bodyStr.body.body[j].expression.right.value;
              
            dataStr += ';' + '\r\n';
           }
        
          }
          
          
          
         } else if( bodyStr.body.body[j].type == 'IfStatement') {
         
          dataStr += 'if'; 
          dataStr += ' ( ' ;
          
         if(bodyStr.body.body[j].test.left.name != undefined ){
           dataStr += bodyStr.body.body[j].test.left.name ;
         } else {
           dataStr += bodyStr.body.body[j].test.left.object.name ;
          
           if( bodyStr.body.body[j].test.left.computed == true ){
            dataStr += '[';
            dataStr += bodyStr.body.body[j].test.left.property.raw ;
            dataStr += ']';
           } else if( bodyStr.body.body[j].test.left.computed == false ){
            dataStr += '.';
            if( bodyStr.body.body[j].test.left.property.type == 'Identifier' ) {
            dataStr += bodyStr.body.body[j].test.left.property.name ;
            } else {
            dataStr += bodyStr.body.body[j].test.left.property.raw ;
            }
           }
           
         }
          dataStr += bodyStr.body.body[j].test.operator;
          dataStr += bodyStr.body.body[j].test.right.raw;
          
          dataStr += ' ) ' ;
          if(bodyStr.body.body[j].consequent.type == 'BlockStatement'){ 
           
          dataStr += '{' ;
          
          dataStr += '}' ;
          } else if(bodyStr.body.body[j].consequent.type == 'ReturnStatement'){ 
          
         dataStr += makeSubsrc(bodyStr.body.body[j].consequent);  
         
          } 
       
          
         } 
         
         if(bodyStr.body.body[j].type == 'ReturnStatement'){ 
         
         dataStr += makeSubsrc(bodyStr.body.body[j]);  
         } 
           
       
        } //end for
       
       }
         
         
         
      } //end BlockStatement
      
      dataStr += '} ' + '\r\n';
     }
  
 return dataStr;
};
  
  
  
  
  if ( options.silent ) {
  
   
  
  var fs = require('fs');
  var wsoptions = { encoding: 'utf8' }; 
  var wstream = fs.createWriteStream('/Users/hee/Contents/temp/10_01_2015/script_parsing/dest/jslog.js', wsoptions); 
  wstream.write(JSON.stringify(esTree));
  wstream.end(); 
  
  
  
    var bodyObject = Object.keys(esTree); 
     
     scriptStr += 'var ngmf = {};'  + '\r\n';
     scriptStr += 'var scwin = {};' + '\r\n';
     
      bodyObject.forEach( function(item, idx, obj) {
     
     if( typeof(esTree[item]) == 'object' ){   
      for ( i = 0; i < esTree[item].length; i++ ) { 
           dataStr = getData(esTree[item][i], dataStr);    
        
      }    
         
     }
    }) //end forEach
    
  }
    
  
    scriptStr += dataStr;
    
     scriptStr += '\r\n';
     scriptStr += '\t' + 'scwin.f_CommonInitForm();' + '\r\n\r\n';
    
   //console.log( 'js make dataStr ' +  dataStr );  
  
  return scriptStr;
};

