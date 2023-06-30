// All the children of a node need to be removed, and a single child node that prompts "open or closed end?" remains
function handleRemoveButtonClick(node) {
    var nodeIdElement = node.querySelector(".node-id");
    var nodeID = nodeIdElement.textContent;
    var theTree = chart_config.nodeStructure;
    theTree = RemoveNodeAndChildren(nodeID, theTree);
    chart_config.nodeStructure = theTree;
    new Treant(chart_config);
    addButtons(); // Re-apply buttons to new node
  }

// A node should be an open end of a branch
function handleOpenEndNodeButtonClick(node){
    var nodeIdElement = node.querySelector(".node-id");
    var nodeID = nodeIdElement.textContent;
    var theTree = chart_config.nodeStructure
    theTree = ExecuteAtNode(nodeID, theTree, CreateOpenNode)
    chart_config.nodeStructure = theTree
    new Treant(chart_config);
    addButtons()
}

// A node should be a closed node of a branch.
// The user must provide the ID of the node(s) that resulted to this conclusion, as well as the name of the rule
function handleCloseEndNodeButtonClick(node){
    var nodeIdElement = node.querySelector(".node-id");
    var nodeID = nodeIdElement.textContent;
    var theTree = chart_config.nodeStructure
    theTree = ExecuteAtNode(nodeID, theTree, CreateClosedNode)
    chart_config.nodeStructure = theTree
    new Treant(chart_config);
    addButtons()
}

// A user can add a node below an existing node
function handleInsertNodeBellowButtonClick(node){
    
}