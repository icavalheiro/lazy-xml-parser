const fs = require('fs');


//create a readable strem for us
function getReadStream(path){
    var stream = fs.createReadStream(path, {flags: 'r'});
    stream.setEncoding('utf8');
    return stream;
}

//create a writeable stream for us ^.^
function getWriteStream(path){
    var stream = fs.createWriteStream(path, {flags: 'w'});
    return stream;
}

//save the obj that we've generated into a xml file
function saveXml(stream, obj){
    function writeTag(tag){
        if(tag.name == '#text'){
            stream.write(tag.value);
        }else{
            var toWrite = '<' + tag.name;
            for(var i = 0; i < tag.attributes.length; i++){
                toWrite += ' '+tag.attributes[i].name + '="' + tag.attributes[i].value + '"';
            }
            if(tag.selfclosing){
                toWrite += '/>';
                stream.write(toWrite);
            }else{
                toWrite += '>';
                stream.write(toWrite);
                for(var i = 0; i < tag.nodes.length; i++){
                    writeTag(tag.nodes[i]);
                }
                stream.write('</' + tag.name + '>');
            }
        }
    }
    
    stream.write('<?xml version="1.0" encoding="utf-8"?>');
    
    if(obj.nodes[0].name == '#text')
        writeTag(obj.nodes[1]);
    else
        writeTag(obj.nodes[0]);
    
    stream.end();
}

//load a xml file into a js object
function getObject(stream, callback){
    var obj = [];
    
    function getNewNode(p_name, p_parent){
        return {name: p_name, attributes:[], nodes:[], parentNode:p_parent, value:'', selfclosing: false};
    }
    
    function getNewAttribute(p_name){
        return {name: p_name, value: null}
    }
    
    
    var currentNode = getNewNode('document', null);
    
    obj.push(currentNode);
    
    var currentValue = '';
    
    var readingValue = false;
    var readingString = false;
    var readingTagName = false;
    var readingAttributes = false;
    var readingAttributeName = false;
    var readingAttributeValue = false;
    var readingAttributeValueQuoteFound = false;
    var ignoreNextGT = false;
    var readingText = false;
    var lastCharacterWasLT = false;
    var readingClosingTag = false;
    
    function processCharacter(character){
        if(readingClosingTag){
            if(character == '>'){
                readingClosingTag = false;
                if(currentNode.parentNode != null)
                    currentNode = currentNode.parentNode;
            }
            return;
        }
        
        
        if(ignoreNextGT){
            ignoreNextGT = false;
            if(character == '>'){
                return;
            }
        }
        
        
        //new tag
        if(character == '<'){
            if(readingText && currentValue != ''){//we were reading text until now, so lets close the text tag and start a real tag
                readingText = false;
                var textNode = getNewNode('#text', currentNode);
                textNode.value = currentValue;
                currentNode.nodes.push(textNode);
                currentValue = '';
            }
            
            readingText = false;
            readingTagName = true;
            lastCharacterWasLT = true;
            
            return;
        }        
        
        if(readingTagName){
            if(character == "?"){
                readingClosingTag = true;
                return;
            }
            
            if(character != ' '){//if space, start looking for attributes
                if(character != '/'){//self closed tag
                    lastCharacterWasLT = false;//make sure we turn this off if it was setted on
                    if(character != '>')//end of tag (no spaces inside the tag declaration)
                        currentValue += character;
                    else{
                        //enters new tag but ignore attributes
                        var newNode = getNewNode(currentValue, currentNode);
                        currentNode.nodes.push(newNode);
                        currentNode = newNode;
                        readingTagName = false;
                        currentValue = '';
                    }
                }else{
                    if(lastCharacterWasLT){
                        readingTagName = false;
                        readingClosingTag = true;
                        return;
                    }else{
                        //ingore attributes and dont enter the tag
                        var newNode = getNewNode(currentValue, currentNode);
                        newNode.selfclosing = true;
                        currentNode.nodes.push(newNode);
                        readingTagName = false;
                        currentValue = '';
                        ignoreNextGT = true;  
                    }
                }
            }
            else{
                //will enter the tag but first look for attributes
                var newNode = getNewNode(currentValue, currentNode);
                currentNode.nodes.push(newNode);
                currentNode = newNode;
                readingTagName = false;
                currentValue = '';
                readingAttributes = true;
            }
            
            return;
        }
        
        //reading attributes
        if(readingAttributes){
            
            //not reading a specific attribute yet
            if(readingAttributeName == false && readingAttributeValue == false){
                if(character == ' ')//ignore blank spaces
                    return;

                //check end of self closing tag
                if(character == '/'){
                    readingAttributes = false;
                    currentNode.selfclosing = true;
                    currentNode = currentNode.parentNode;//go back to parent node, cus we aint going inside a self closing tag
                    ignoreNextGT = true;
                }else if(character == '>'){
                    readingAttributes = false;//end of tag opening
                }else{
                    readingAttributeName = true;
                    currentValue += character;
                }
            }else{//reading a specific attribute
                if(readingAttributeName){//reading attribute name
                    if(character == '>'){//attribute was next the closing tag ending
                        if(currentValue != '')
                            currentNode.attributes.push(getNewAttribute(currentValue));
                        currentValue = '';
                        readingAttributeName = false;
                        readingAttributes = false;
                    }else if(character == '/'){//attribute was right next the selfclosing tag ending
                        if(currentValue != '')
                            currentNode.attributes.push(getNewAttribute(currentValue));   
                        currentValue = '';
                        readingAttributeName = false;
                        readingAttributes = false;
                        currentNode.selfclosing = true;
                        currentNode = currentNode.parentNode;
                        ignoreNextGT = true;
                    }else if(character == ' '){//attribute without a value (flag)
                        if(currentValue != '')
                            currentNode.attributes.push(getNewAttribute(currentValue));
                        currentValue = '';
                    }else if(character == '='){//end of attribute name, start of attribute value
                        readingAttributeName = false;
                        readingAttributeValue = true;
                        currentNode.attributes.push(getNewAttribute(currentValue));
                        currentValue = '';
                    }else{
                          currentValue += character;
                    }
                }
                else if(readingAttributeValue){//attribute value
                    if(readingAttributeValueQuoteFound == false){//look for the starting quote (i've added support for quote diffs)
                        if(character == '"' || character == "'"){
                            readingAttributeValueQuoteFound = character;
                        }
                    }else{
                        if(character == readingAttributeValueQuoteFound){//end of the attribute value
                            currentNode.attributes[currentNode.attributes.length-1].value = currentValue;
                            currentValue = '';
                            readingAttributeValueQuoteFound = false;
                            readingAttributeValue = false;
                            readingAttributeName = true;
                        }else{
                            currentValue += character;
                        }
                    }
                }
            }
            return;
        }
        
        //reading text
        readingText = true;
        currentValue += character;
    }
    
    
    //just the fact of adding a listener starts the event dispatching, =S (node js, go figure)
    stream.on('readable', () =>{
        var character;
        while((character = stream.read(1)) !== null){
            processCharacter(character);
        }
    });
    
    stream.on('end', () =>{
       callback(obj[0]);
    });
    
    delete stream;
}

module.exports.toJs = function(pathToXml, callback){
    var stream = getReadStream(pathToXml);
    getObject(stream, (obj)=>{
       callback(null, obj); 
    });
}

module.exports.toXml = function(pathToSaveXml, xmlObject){
    var stream = getWriteStream(pathToSaveXml);
    saveXml(stream, xmlObject);
}

/*
var stream = getReadStream('P:\\Engenharia\\Tests\\lockTranslated\\UnknownSegments en-US_pt-BR.sdlxliff');
getObject(stream, (obj) => {
    
    console.log(obj == undefined);
    console.dir(obj.nodes);
    saveXml(getWriteStream('P:\\Engenharia\\Tests\\lockTranslated\\debug.xml'), obj);
    
    console.log('done');
});*/

