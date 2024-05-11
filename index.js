
class Input {
    constructor() {
        this.title = document.getElementById("titleinput").value;
        this.author = document.getElementById("authorinput").value;
        this.tagline = document.getElementById("taglineinput").value;
        this.color = document.getElementById("colorinput").value;
        this.uicolor = document.getElementById("uicolorinput").value;
        this.columns = document.getElementById("columnsinput").value;
        this.rows = document.getElementById("rowsinput").value;
        this.keyword = document.getElementById("keywordinput").value;
        this.text = document.getElementById("bookinput").value;
        
        if (this.color.length > 2) {
            this.color = this.color.substring(0,1);
        }

        if (this.columns < 5) {
            this.columns = 5;
        }

        if (this.columns > 502) {
            this.columns = 502;
        }

        if (this.rows < 5) {
            this.rows = 5;
        }
        
        if (this.rows > 120) {
            this.rows = 120;
        }
    }
}

class Output {
    constructor() {
        this.wysiwyg = document.getElementById("wysiwyg");
        this.cmds = document.getElementById("bookoutput");
    }
}

/**
 * Handles the input change event and updates the WYSIWYG editor and output textarea based on the input text.
 *
 * @return {void} This function does not return a value.
 */
function OnInputChange() {
    var input = new Input();
    var output = new Output();
    console.log(input);
    output.wysiwyg.innerHTML = "";
    output.cmds.value = "";
    var chapters = GetChapters(input.text);

    for (let i = 0; i < chapters.length; i++) {
        chapters[i].pages = SplitIntoPages(chapters[i]);
    }

    chapters = AssignPageNumbers(chapters);    

    console.log(chapters);
    var string = CreateTableOfContents(chapters, input);

    if (!SanityCheck(input, chapters)) {
        output.wysiwyg.innerHTML = errString;
        output.cmds.value = errString;
        return;
    }

    for (let i = 0; i < chapters.length; i++) {
        for (let j = 0; j < chapters[i].pages.length; j++) {
            string += chapters[i].title + ": " + chapters[i].pages[j].number + "\n";
            string += chapters[i].pages[j].text;
        }
    }

    output.wysiwyg.innerHTML = WYSIWYGColorize(string.replace(/ /g, "&nbsp"));
    output.cmds.value = WYSIWYGColorize(string);
}

function SanityCheck(input, chapters) {
    errString = "";
    var sane = true;
    if (input.title == "") {
        errString += "Please include a title.\n";
        sane = false;
    }
    if (input.author == "") {
        errString += "Please include an author.\n";
        sane = false;
    }

    if (chapters == null || chapters.length < 1) {
        errString += "Please include at least one chapter and some text for it.";
        sane = false;
    }

    return sane;
}

/**
 * Assigns page numbers to each page in the given chapters.
 *
 * @param {Array} chapters - An array of chapter objects.
 * @return {Array} The updated chapters array with page numbers assigned.
 */ 
function AssignPageNumbers(chapters) {
    var pageCount = 1;
    for (let i = 0; i < chapters.length; i++) {
        for (let j = 0; j < chapters[i].pages.length; j++) {
            chapters[i].pages[j].number = pageCount;
            pageCount++;
        }
    }
    return chapters;
}

/**
 * Splits the input text into chunks based on a specific pattern, extracts chapters, and returns them.
 *
 * @param {string} text - The input text containing chapters.
 * @return {array} An array of extracted chapters.
 */
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

/**
 * WordWrap function wraps the input text the same way that Lensmoor does,
 * taking color codes into account.
 *
 * @param {string} text - The text to be wrapped
 * @return {string} The wrapped text
 */
function WordWrap(text, input) {
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

        // the +1 is needed to account for the character at the
        // current position i
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

/**
 * Finds the next space or newline character in a string starting from a given position.
 *
 * @param {number} pos - The position to start searching from.
 * @param {string} string - The string to search in.
 * @return {number} The index of the next space or newline character, or the length of the string if none is found.
 */
function NextSpace(pos, string) {
    for (let i = pos; i < string.length; i++) {
        if (string[i] == " " || string[i] == "\n") {
            return i;
        }
    }
    return string.length; 
}

/**
 * Function to colorize text in the WYSIWYG editor.
 *
 * @param {string} string - The input string to be colorized.
 * @return {string} The colorized string.
 */
function WYSIWYGColorize(string) {
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
    string = string.replace(new RegExp("{D", "g"), "<span class='bblack'>");
    string = string.replace(new RegExp("<span", "g"), "</span><span");
    string = string.replace(new RegExp("^</span>", "g"), "");
    string = string.replace(new RegExp("$", "g"), "</span>");
    string = string.replace(new RegExp("\n", "g"), "<br>");
    return string;
}

/**
 * Splits the input text into pages based on a specific pattern, extracts pages, and returns them.
 *
 * @param {Object} chapter - The input chapter object containing text.
 * @return {Array} An array of extracted pages.
 */
function SplitIntoPages(chapter) {
    var pages = [];
    pages.push(new Page());
    var count = 0;
    var string = "";
    for (let i = 0; i < chapter.text.length; i++) {
        if (chapter.text[i] == "*" && chapter[i + 1] == "*" && chapter[i + 2] == "*" && chapter[i + 3] == "\n") {
            i += 4;
            count = 0;
            pages.push(new Page());
        }
        
        if (chapter.text[i] == "\n") {
            count++;
        }

        if (chapter.text[i] != '') {
            pages[pages.length - 1].text += chapter.text[i];
        }

        if (count > 5) {
            pages.push(new Page());
            count = 0;
        }

    }
    if (pages[pages.length - 1].text == "") {
        pages.pop();
    }
    return pages;
}

class Page {

    constructor(text) {
        this.text = "";
        this.number = -1;
    }
}

class Chapter {

    constructor(title, text) {
        this.title = title;
        this.text = text;
        this.pages = [];
    }
}

function CreateTableOfContents(chapters, input) {
    tocString = "{x+";
    for (let i = 0; i < input.columns; i++) {
        tocString += "=";
    }
    tocString += "+\n";
    

    for (let i = 0; i < chapters.length; i++) {
        tocString += OneChapterLine(chapters[i], i, input);
    }


    tocString += "{x";
    for (let i = 0; i < input.columns; i++) {
        tocString += "=";
    }
    tocString += "\n";
    return tocString;
}

function OneChapterLine(chapter, i, input) {
    var chapterLine = input.color + chapter.title;
    for (let j = 0; j <= input.columns - chapterLine.length; j++) {
        chapterLine += ".";
    }
    chapterLine += " ";
    var first = chapter.pages[0].number;
    var last = chapter.pages[chapter.pages.length - 1].number;

    if (first < 10) { 
        chapterLine += "0";
    }
    chapterLine += first;

    if (chapter.pages.length > 1) {
        chapterLine += " - ";
        if (last < 10) {
            chapterLine += "0";
        }
        chapterLine += last;
    }
    
    tocString += chapterLine;
    tocString += "\n";
}
