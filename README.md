# LangPro-Editor
LangPro-Editor is a simple web-based editor that allows you to make limited alternations of tableaux created by [LangPro](https://naturallogic.pro/LangPro/).  
A live version of this website can be found on [borisdegaaff.nl/LangPro-editor](https://borisdegraaff.nl/LangProEditor).  

When a tableau is created with `.tableau.prove()`  in LangPro, in the directory `LangPro/xml` 2 tableaux in XML format can be found.  Upload these files to the LangPro-Editor in order to make changes to them.

# Installing LangPro yourself
Running LangPro-Editor locally is as simple as cloning this repository and opening `index.html` in a modern browser.

# Architecture
## Libraries
LangPro uses the following 2 Libraries:

| Library  | Purpose                                                                                                              |
|--------------|----------------------------------------------------------------------------------------------------------------------|
|[xml2json.js](https://gist.github.com/czue/464479)| To convert the XML file to a JSON object                                |
|[Treant.js](https://fperucic.github.io/treant-js/)| Used to draw the drees           

## Files and functions
| File  | Purpose                                                                                                              |
|--------------|----------------------------------------------------------------------------------------------------------------------|
|load_xml.js | Main file. When the upload button is clicked, `handleXMLUpload()` is called to create a tree. After converting the XML to JSON `createTreeFromJson()` is used to change the datastructure appropriately for Treant to create a tree from. After creating a tree, `addButtons()` uses DOM manipulation to add buttons to the tree created by Treant.                                 |
|preset_button.js| Trees can be loaded with less effort with the preset buttons. Event listeners and logic for those are here. Preset files must already be in JSON format in the `/example_files` directory, and must be what would be the object after calling `createTreeFromJson()`|
|eventHandlers.js| Contains the eventHandlers for buttons on the tree.
