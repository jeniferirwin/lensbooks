let input = "bookinput";
let wysiwyg = "wysiwyg";
let output = "bookoutput";

/**
 * Handles the input change event and updates the WYSIWYG editor and output textarea based on the input text.
 *
 * @return {void} This function does not return a value.
 */
function OnInputChange() {
    var text = document.getElementById(input).value;
    document.getElementById(wysiwyg).innerHTML = "";
    document.getElementById(output).value = "";
    var chapters = GetChapters(text);

    for (let i = 0; i < chapters.length; i++) {
        chapters[i].pages = SplitIntoPages(chapters[i]);
    }

    chapters = AssignPageNumbers(chapters);    

    console.log(chapters);
    var toc = CreateTableOfContents(chapters);
    if (chapters == null || chapters.length < 1) {
        document.getElementById(wysiwyg).innerHTML = "Please enter at least one chapter and some text for it.";
        document.getElementById(output).value = "Please enter at least one chapter and some text for it.";
        return;
    } else {
        string += toc;
        for (let i = 0; i < chapters.length; i++) {
            for (let j = 0; j < chapters[i].pages.length; j++) {
                string += chapters[i].title + ": " + chapters[i].pages[j].number + "\n";
                string += chapters[i].pages[j].text;
            }
        }
        document.getElementById(wysiwyg).innerHTML = WYSIWYGColorize(string);
        document.getElementById(output).value = WYSIWYGColorize(string);
    }
    //document.getElementById(wysiwyg).innerHTML = WYSIWYGColorize(wrapped.replace("\n", "<br>"));
    //document.getElementById(output).value = wrapped;
    //document.getElementById(output).value = wrapped;
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

/**
 * Creates a table of contents based on the given chapters.
 *
 * @param {Array} chapters - An array of chapter objects.
 * @return {string} The generated table of contents.
 */
function CreateTableOfContents(chapters) {
    string = "{x";
    for (let i = 0; i <= 78; i++) {
        string += "=";
    }
    string += "\n";
    

    for (let i = 0; i < chapters.length; i++) {
        var chapterLine = "{x      " + chapters[i].title;
        for (let j = 0; j <= 71 - chapterLine.length; j++) {
            chapterLine += ".";
        }
        chapterLine += " ";
        if (chapters[i].pages[0].number < 10) {
            chapterLine += "0" + chapters[i].pages[0].number;
        } else {
            chapterLine += chapters[i].pages[0].number;
        }
        if (chapters[i].pages.length > 1) {
            chapterLine += " - " + chapters[i].pages[chapters[i].pages.length - 1].number;
        }
        
        string += chapterLine;
    }


    string += "{x";
    for (let i = 0; i <= 78; i++) {
        string += "=";
    }
    string += "\n";
    return string;
}
