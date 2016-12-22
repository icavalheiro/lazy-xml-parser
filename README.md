# lazy-xml-parser
A lazily made XML parser for NodeJS.
Lazy, but fast, really fucking awesome fast.


IMPORTANT: The reason why I made this XML parser is becouse all of the current XML parsers in NPM fucks up the xml somehow, since I work for the translation industry it is really important that the XML structure, tag ordering and code identation are not changed. So this XML parser respect the original XML file (reading and saving the same file will result in identical matches).


Ps.: also great at memory usage, using really low memory

Ps2.: lazy means that I did not take the time to make it report errors properly, but it work perfectly with XML files that are not broken

## Example
```javascript
const xmlParser = require("lazy-xml-parser");

xmlParser.toJs('/path/to/file.xml', (xmlAsObject) =>{
    
    console.dir(xmlAsObject);
    //manipulate it as you want
    ...
    //save it as xml
    xmlParser.toXml('/path/to/save.xml', xmlAsObject);
});
```

## XML Object structure
```javascript
{
    name: '', //will be == '#text' if this node represent pure text
    attributes:[], 
    nodes:[], 
    parentNode: xmlObj, 
    value:'', //it only contains something if this node is a #text node
    selfclosing: false
};
```

## Attributes structure
```javascript
{
    name: '', 
    value: ''
};
```

## API

#### toJs (pathToXml, callback[xmlObj])
Creates a XML Object from a file, I made it that way to be more memory efficient than loading it from a string.
And I'm not doing this work with strings, fuck yah.

#### toXml (pathToSaveXml, xmlObj)
Saves the xmlObj as a xml. Dãã!

## Latest patch notes
- Fixed issue where the convertion of the XML Object to JSON would return an error about circular structure
- Added methods "getNewNode" and "getNewAttribute" to the exports, so that they can be used to add new elements to the XML Object
- Added methods to node: getAttribute, getAttributeValue, getChildByName, getChildsByName

## License
Copyright (c) 2016 Ivan S. Cavalheiro
Licensed under the MIT license