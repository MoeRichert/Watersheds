// Get the popup
    var popup = document.getElementById("aboutMap");

    var btn = document.getElementById("abtbtn");
        
    //var btn2 = document.getElementById("abt");

    var span = document.getElementsByClassName("close")[0];

    // open the popup
    /*btn.onclick = function() {
      popup.style.display = "block";
    }*/
    
    /*btn2.onclick = function() {
      popup.style.display = "block";
    }*/

    // close the popup
    span.onclick = function() {
      popup.style.display = "none";
    }

    // When the user clicks anywhere outside of the modal, close it
    window.onclick = function(event) {
      if (event.target == popup) {
        popup.style.display = "none";
      }
    }