// Get all the buttons to load in presets
var preset1Button = document.getElementById("preset1")
var preset2Button = document.getElementById("preset2")
var preset3Button = document.getElementById("preset3")
var preset4Button = document.getElementById("preset4")

// Change the location argument to determine what preset should be used
preset1Button.addEventListener("click", function(){
    setPresetXML('./example_files/44-yes.json')
})
preset2Button.addEventListener("click", function(){
    setPresetXML('./example_files/44-no.json')
})
preset3Button.addEventListener("click", function(){
    setPresetXML('./example_files/1266-yes.json')
})
preset4Button.addEventListener("click", function(){
    setPresetXML('./example_files/1266-no.json')
})

function setPresetXML(preset_path){
    fetch(preset_path).then(response => {
      return response.json();
    }).then(jsonData => {    
      chart_config = jsonData
      var tree = new Treant(chart_config);
      addButtons()
    }).catch(err => {
      console.log(err)
    });
  }