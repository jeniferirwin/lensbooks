let input = "bookinput";
let wysiwyg = "wysiwyg";
let output = "bookoutput";

function OnInputChange() {
    var text = document.getElementById(input).value;
    document.getElementById(wysiwyg).innerHTML = "";
    document.getElementById(output).value = "";
    var chapters = GetChapters(text);
    console.log(chapters);
    if (chapters == 0 || chapters.length % 2 != 0) {
        document.getElementById(wysiwyg).innerHTML = "Please enter at least one chapter and some text for it.";
        document.getElementById(output).value = "Please enter at least one chapter and some text for it.";
        return;
    }
    //document.getElementById(wysiwyg).innerHTML = WYSIWYGColorize(wrapped.replace("\n", "<br>"));
    //document.getElementById(output).value = wrapped;
    //document.getElementById(output).value = wrapped;
}

function GetChapters(text) {
    chunks = text.split(new RegExp("=== (.+)\n"), -1);
    chunks.splice(0, 1);
    chapters = [];
    for (let i = 0; i < chunks.length; i++) {
        if (i % 2 == 0) {
            chapters.push(new Chapter(chunks[i], chunks[i + 1]));
        }
    }
    return chapters;
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

        // I'm not entirely sure why we need the +1 here, but
        // it goes over the limit if we don't.
        if (count + (next - i + 1) >= 78) {
            wrapped = wrapped.trimEnd() + "\n{x";
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
        if (string[i] == " " || string[i] == "\n") {
            return i;
        }
    }
    return string.length; 
}

function WYSIWYGColorize(string) {
    string = string.replace(new RegExp("\n", "g"), "<br>");
    string = string.replace(new RegExp("{x", "g"), "<span class='white'>");
    string = string.replace(new RegExp("{r", "g"), "<span class='red'>");
    string = string.replace(new RegExp("{g", "g"), "<span class='green'>");
    string = string.replace(new RegExp("{y", "g"), "<span class='yellow'>");
    string = string.replace(new RegExp("{b", "g"), "<span class='blue'>");
    string = string.replace(new RegExp("{m", "g"), "<span class='magenta'>");
    string = string.replace(new RegExp("{c", "g"), "<span class='cyan'>");
    string = string.replace(new RegExp("{w", "g"), "<span class='white'>");
    string = string.replace(new RegExp("{R", "g"), "<span class='bred'>");
    string = string.replace(new RegExp("{G", "g"), "<span class='bgreen'>");
    string = string.replace(new RegExp("{Y", "g"), "<span class='byellow'>");
    string = string.replace(new RegExp("{B", "g"), "<span class='bblue'>");
    string = string.replace(new RegExp("{M", "g"), "<span class='bmagenta'>");
    string = string.replace(new RegExp("{C", "g"), "<span class='bcyan'>");
    string = string.replace(new RegExp("{W", "g"), "<span class='bwhite'>");
    return string;
}

class Page {

    constructor() {
        this.text = "";
    }
}

class Chapter {

    constructor(title, text) {
        this.title = title;
        this.text = text;
    }
}