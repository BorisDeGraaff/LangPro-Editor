chart_config = {
  chart: {
    container: "#tree-simple",
  },

  nodeStructure: {
    text: { name: "Parent node" },
    connectors: {
      type: "step",
    },
    node: {
      collapsable: true,
    },
    children: [
      {
        text: {
          name: "First child",
          title: "With a title",
        },
      },
      {
        text: { name: "Second child" },
      },
    ],
  },
};

function handleXMLUpload() {
  console.log(file)
  if(!file){
    var x2js = new X2JS();
    const fileInput = document.getElementById("XML_File");
    var file = fileInput.files[0];
    new Treant(chart_config);
  }

  if (file) {
    const reader = new FileReader();
    reader.onload = function (e) {
      const xmlData = e.target.result;
      xmlData.reader;
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xmlData, "text/xml");
      const jsonData = x2js.xml_str2json(xmlData);

      // The raw transformed data still needs some transformations to be suitable for graph rendering with the Treant library
      createTreeFromJson(jsonData.tableau.tree)

      chart_config.nodeStructure = jsonData.tableau.tree
      console.log("Printing the final config. Use this object if you want to set it as a preset: ")
      console.log(JSON.parse(JSON.stringify(chart_config)))
      var tree = new Treant(chart_config);

      // After rendering the tree we add the buttons to the tree
      addButtons()
    };

    reader.readAsText(file);
  } else {
    console.log("No file selected.");
  }
}

// Transforms the JSON into a object suitable to use as input for treant. Also adds text labels from the values.
function createTreeFromJson(jsonObject) {
  // A closer (closed node) has very little properties, so we manually add them
  if (jsonObject.node.hasOwnProperty("closer")) {
    jsonObject.HTMLclass = "closure-closed"
    jsonObject.node._id = randomUniqueID()
    jsonObject.text = { id: jsonObject.node._id,
                        llf: "Gesloten einde vanuit XML",
                        closingRules: "Closed with: " +jsonObject.node.closer.closer_rule + jsonObject.node.closer.closer_ids
                      }
    return
    // Open nodes (last nodes) sometimes have a simple "model" property. These need to be converted to open nodes
  } else if (jsonObject.node.hasOwnProperty("model")) {
    jsonObject.HTMLclass = "closer-open"
    jsonObject.node._id = randomUniqueID()
    jsonObject.text = { 
      id: jsonObject.node._id,
      llf: "Open einde vanuit XML",}
    return
  }

  // We set the signature (true or false) to the HTML class. 
  jsonObject.HTMLclass = jsonObject.node.formula._sign
  jsonObject.text = {
    id: jsonObject.node._id,
    llf: "LLF: " + jsonObject.node.formula.llf,
  }
  if(jsonObject.node.formula.modList.mod !== undefined){jsonObject.text.modList = "Modlist " +  jsonObject.node.formula.modList.mod}
  if (jsonObject.node.hasOwnProperty("source")) { jsonObject.text.rule = "Rule applied:" + jsonObject.node.source._ruleApp }

  if (jsonObject.hasOwnProperty("subTrees")) {        // If it has subtrees...
    if (jsonObject.subTrees.hasOwnProperty("tree")) { // ... it has a tree layer
      if (Array.isArray(jsonObject.subTrees.tree)) {  // If it is branching, then it is an array
        jsonObject.subTrees.tree.forEach(element => createTreeFromJson(element)) // And we gotta go recursive on every child
      }else if(jsonObject.subTrees.tree.node.hasOwnProperty("formula")){  // Else, it can be a single child, we check if it is a normal one by checking for formula prop
        createTreeFromJson(jsonObject.subTrees.tree)
      }        
      else if (jsonObject.subTrees.tree.node.hasOwnProperty("closer") || jsonObject.subTrees.tree.node.hasOwnProperty("model")) { // We zijn bij een laatse "closer" node
        createTreeFromJson(jsonObject.subTrees.tree)
      }
    }
    if (jsonObject.node.formula.hasOwnProperty("argList")) {
      if (jsonObject.node.formula.argList.arg !== undefined) {
        jsonObject.text.argument_list = "Argument list: " + jsonObject.node.formula.argList.arg
      }
    }

    if (jsonObject.node.hasOwnProperty("source")) {
      //value.text.rule = "Rule applied:" + jsonObject.node.source._ruleApp
      if (Array.isArray(jsonObject.node.source.idList.id)) {
        jsonObject.text.source_ids = "Source ID's: " + jsonObject.node.source.idList.id.join(",")
      } else {
        jsonObject.text.source_ids = jsonObject.node.source.idList.id
      }
    }
    var value = jsonObject.subTrees.tree
    if (Array.isArray(value)) {
      jsonObject.children = value
    } else {
      jsonObject.children = [value]
    }
    delete jsonObject.subTrees
  }else{ // No subtree, open branch  node needs to be added
    randomID = Math.floor((Math.random()*1000) + 500)
    randomIDString = randomID.toString()
    jsonObject.children = [{
      HTMLclass: "closer",
      node: {_id: randomIDString, closer_rule: "none" },
      text:{ llf: "This is an open branch", id: randomIDString}
    }]
  }
}

function addButtons(tree) {
  var nodes = document.querySelectorAll(".node");
  nodes.forEach(function (node) {
    if (node.classList.contains("closure-prompt") || node.classList.contains("undecided")) { // Add button to closing node that has to be decided by user
      var buttonDiv1 = document.createElement("span");
      var buttonDiv2 = document.createElement("span");
      buttonDiv1.innerHTML = '<button class="Open branch">Open</button>'
      buttonDiv2.innerHTML = '<button class="Closed branch">Closed</button>'

      // Open button
      buttonDiv1.addEventListener("click", function (){handleOpenEndNodeButtonClick(node)})
      buttonDiv2.addEventListener("click", function (){handleCloseEndNodeButtonClick(node)})
      var x = document.createElement("SPAN");
      x.appendChild(buttonDiv1)
      x.appendChild(buttonDiv2)
      node.appendChild(x);
    }
    else if (node.classList.contains('true') || node.classList.contains('false')) { // Add button to normal node
      var buttonDiv = document.createElement("div");
      buttonDiv.innerHTML = '<button class="node-button">Remove node of children</button>';   
      buttonDiv.addEventListener("click", function(){handleRemoveButtonClick(node)})
      node.appendChild(buttonDiv);
    }
  });
}

function RemoveNodeAndChildren(id, jsonObjectTree) {
  if (jsonObjectTree.node._id === id) {
    newID = randomUniqueID()
    jsonObjectTree.children = [{
      HTMLclass: 'undecided',
      node: {_id: newID},
      text: { id: newID, prompt: "Should this branch be open or closed?"}
    }]
    return jsonObjectTree
  }

  // Continue recursivly
  if (jsonObjectTree.children && Array.isArray(jsonObjectTree.children)) {
    jsonObjectTree.children = jsonObjectTree.children.map(child => {
      return RemoveNodeAndChildren(id, child);
    });
  }
  return jsonObjectTree;
}

// Execute the ToExecute function at a certain ID, and return the resulting tree
// This function is important/useful for when you try to implement new features
function ExecuteAtNode(id, wholeJsonObjectTree, te_function){
  // Exectue function at node
  if(wholeJsonObjectTree.hasOwnProperty("node")){
    if (wholeJsonObjectTree.node._id === id || wholeJsonObjectTree.node._id.toString() == id) { // TODO: remove inconsistent typing of ID values
      console.log(`We got a hit on ID ${wholeJsonObjectTree.node._id} because it matches with ${id}`)
      te_function(wholeJsonObjectTree)
      return wholeJsonObjectTree
    }
  }
  if (wholeJsonObjectTree.children && Array.isArray(wholeJsonObjectTree.children)) {
    wholeJsonObjectTree.children = wholeJsonObjectTree.children.map(child => {
      return ExecuteAtNode(id, child, te_function);
    });
  }
  return wholeJsonObjectTree
}

function CreateClosedNode(nodeObject){
  rule = prompt("What nodes are the cause of the closure")
  rule_desc = prompt("How woudl you descripe the rule that caused the closesure")
  nodeObject.text = {
    id: nodeObject.node._id,
    type: "Closure",
    rule: "Because of nodes " + rule
  }
  nodeObject.closer = {
    closer_ids: rule,
    closer_rule: rule_desc,
  }
  console.log("AANGEPAST")
  console.log(JSON.parse(JSON.stringify(nodeObject)))
  return nodeObject
}

function CreateOpenNode(nodeObject){
  nodeObject.text = {main: "open text", id: nodeObject.node._id}
  console.log(nodeObject)
  return nodeObject
}

function randomUniqueID(){
  randomID = Math.floor((Math.random()*1000) + 500)
  randomIDString = randomID.toString()
  return randomID
}




// Yell a JsonObject in a way that it doesn't change the values in the console if the object changes
function yellJson(jsonObject){
  console.log("Yelling ojbect:")
  console.log(JSON.parse(JSON.stringify(jsonObject)))
}

// Print at a node with a certain ID
function printAtID(jsonObject, id){
  if(jsonObject.hasOwnProperty("node")){
    //console.log(JSON.parse(JSON.stringify(wholeJsonObjectTree)))
    if (jsonObject.node._id === id || jsonObject.node._id.toString() == id) { // TODO: remove inconsistent typing
      console.log(`Yelling node ${id} :`)
      console.log(JSON.parse(JSON.stringify(jsonObject)))    }
  }
  if (jsonObject.children && Array.isArray(jsonObject.children)) {
    jsonObject.children = jsonObject.children.map(child => {
      return printAtID(child, id);
    });
  }
}

