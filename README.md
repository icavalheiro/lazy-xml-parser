# lazy-xml-parser
A lazily made XML parser for NodeJS.
Lazy, but fast, really fucking awesome fast.

Ps.: also great at memory usage, using really low memory
Ps2.: lazy means that I did not took the time to make it report errors, but it work perfectly with XML files that are not broken

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


## License
Copyright (c) 2016 Ivan S. Cavalheiro
Licensed under the MIT license