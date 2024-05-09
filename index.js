let input = "bookinput";
let wysiwyg = "wysiwyg";
let output = "bookoutput";

function OnInputChange() {
    var newtext = document.getElementById(input).value;
    document.getElementById(wysiwyg).innerHTML = newtext;
    document.getElementById(output).value = newtext;
}