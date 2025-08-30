/*Open/Close Collapsibles*/
var collapsibleElement = document.getElementsByClassName("collapsible");
var i;

for (i = 0; i < collapsibleElement.length; i++) {
  collapsibleElement[i].addEventListener("click", function() {
    this.classList.toggle("active");
    var collapsibleContent = this.nextElementSibling;
    if (collapsibleContent.style.display === "block") {
      collapsibleContent.style.display = "none";
    } 
    else {
      collapsibleContent.style.display = "block";
    }
  });
}