let input = "bookinput";
let wysiwyg = "wysiwyg";
let output = "bookoutput";

function OnInputChange() {
    var text = document.getElementById(input).value;
    var wrapped = WordWrap(text);
    document.getElementById(wysiwyg).innerHTML = wrapped.replace("\n\r", "<br>");
    document.getElementById(output).value = wrapped;
}

function ColorLength(string) {
    let count = 0;
    let skip = false;
    for (let i = 0; i < string.length; i++) {
        if (skip == true) {
            skip = false;
            continue;
        }
        if (string[i] == "{") {
            skip = true;
            continue;
        }
        count++;
    }   
    return count;
}

function WordWrap(text) {
    var wrapped = "{x";
    var skip = false;
    var count = 0;
    var next = 0;

    for (let i = 0; i < text.length; i++) {

        if (text[i] == "\n") {
            wrapped += "\n{x";
            count = 0;
            continue;
        }
        
        if (skip) {
            wrapped += text[i];
            skip = false;
            continue;
        }

        if (text[i] == "{") { 
            wrapped += text[i];
            skip = true;
            continue;
        }

        next = NextSpace(i, text);

        if (count + (next - i) >= 78) {
            wrapped += "\n{x";
            wrapped += text[i];
            count = 0;
            continue;
        }
        
        wrapped += text[i];
        count++;
    }
    return wrapped;
}

function NextSpace(pos, string) {
    for (let i = pos; i < string.length; i++) {
        if (string[i] == " ") {
            return i;
        }
    }
    return string.length; 
}

function WYSIWYGColorize(string) {
    string = string.replace("{x", "</span><span class='clear'>");
    string = string.replace("{r", "</span><span class='red'>");
    string = string.replace("{R", "</span><span class='bred'>");
    return string;
}