let input = "bookinput";
let wysiwyg = "wysiwyg";
let output = "bookoutput";

function OnInputChange() {
    var newtext = document.getElementById(input).value;
    var lines = newtext.replace(/\r\n/g,"\n").split("\n");
    var wrapped = [];
    document.getElementById(wysiwyg).innerHTML = "";
    document.getElementById(output).value = "";
    for (let i = 0; i < lines.length; i++) {
        wrapped[i] = WordWrap(lines[i]);
    }
    for (let i = 0; i < wrapped.length; i++) {
        document.getElementById(wysiwyg).innerHTML += wrapped[i];
        document.getElementById(output).value += wrapped[i];
    }
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

function WordWrap(line) {
    let newlines = [];
    newlines[0] = "{x";
    let index = 0;
    let word = "";
    let wordDone = false;
    for (let char = 0; char < line.length; char++) {

        if (char == line.length) {
            if (word.length > 0) {
                newlines[index] = newlines[index] + word + "\n";
            } else {
                newlines[index] = newlines[index] + "\n";
            }
            break;
        }

        if ((line[char] == " " || line[char] == "\n") && !wordDone) {
            wordDone = true;
        }

        if (line[char] != " " && line[char] != "\n") {
            word += line[char];
            continue;
        }

        if (wordDone && ColorLength(newlines[index]) + ColorLength(word) >= 78) {
            newlines[index] = newlines[index] + "\n";
            index++;
            newlines[index] = "{x";
            newlines[index] += word;
            word = "";
            wordDone = false;
            continue;
        }
        
        if (wordDone && ColorLength(newlines[index]) + ColorLength(word) < 78) {
            newlines[index] = newlines[index] + word + " ";
            word = "";
            wordDone = false;
        }
        
    }
    return newlines;
}