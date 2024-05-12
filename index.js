
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

function OnInputChange() {
    var input = new Input();
    var output = new Output();
    output.wysiwyg.innerHTML = "";
    output.cmds.value = "";
    var chapters = GetChapters(input.text);
    
    for (let i = 0; i < chapters.length; i++) {
        chapters[i].wrapped = WordWrap(chapters[i].text, input);
    }

    for (let i = 0; i < chapters.length; i++) {
        chapters[i].pages = SplitIntoPages(chapters[i], input);
    }

    chapters = AssignPageNumbers(chapters);    

    var string = CreateTableOfContents(chapters, input);

    if (!SanityCheck(input, chapters)) {
        output.wysiwyg.innerHTML = errString;
        output.cmds.value = errString;
        return;
    }

    string += "\n<hr>\n";
    for (let i = 0; i < chapters.length; i++) {
        for (let j = 0; j < chapters[i].pages.length; j++) {
            string += GeneratePageHeader(chapters[i].pages[j], input);
            string += chapters[i].pages[j].text;
            string += GeneratePageFooter(chapters, chapters[i].pages[j], input);
            string += "\n<hr>\n";
        }
    }
    output.wysiwyg.innerHTML = WYSIWYGColorize(string.replace(/ /g, "&nbsp"));

    var string = "buy " + input.keyword + " extra\n";
    string += "contents\n";
    string += CreateTableOfContents(chapters, input);
    string += "@\n";
    for (let i = 0; i < chapters.length; i++) {
        for (let j = 0; j < chapters[i].pages.length; j++) {
            string += "buy " + input.keyword + " extra\n";
            if (chapters[i].pages[j].number < 10) {
                string += "page0" + chapters[i].pages[j].number + "\n";
            }
            else {
                string += "page" + chapters[i].pages[j].number + "\n";
            }
            string += "/*\n";
            string += GeneratePageHeader(chapters[i].pages[j], input);
            string += chapters[i].pages[j].text;
            string += GeneratePageFooter(chapters, chapters[i].pages[j], input);
            string += "@\n";
        }
    }
    output.cmds.value = string;
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
    chunks = text.split(new RegExp(/===(.+)\n/), -1);
    chunks.splice(0, 1);
    chapters = [];
    for (let i = 0; i < chunks.length; i++) {
        if (i % 2 == 0) {
            chapters.push(new Chapter(chunks[i].trimEnd().trimStart(), chunks[i + 1]));
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
    var wrapped = input.color;
    var skip = false;
    var count = 0;
    var next = 0;
    var lastcolor = input.color;

    for (let i = 0; i < text.length; i++) {

        if (text[i] == "\n") {
            wrapped += "\n" + lastcolor;
            count = 0;
            continue;
        }
        
        if (skip) {
            wrapped += text[i];
            lastcolor = "{" + text[i];
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
        if (count + (next - i + 1) >= input.columns) {
            wrapped = wrapped.trimEnd() + "\n" + lastcolor;
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
function SplitIntoPages(chapter, input) {
    var pages = [];
    pages.push(new Page(chapter));
    var count = 0;
    var string = "";
    for (let i = 0; i < chapter.wrapped.length; i++) {
        if (chapter.wrapped[i] == "*" && chapter.wrapped[i + 1] == "*" && chapter.wrapped[i + 2] == "*" && chapter.wrapped[i + 3] == "\n") {
            i += 4;
            count = 0;
            pages.push(new Page(chapter));
        }
        
        if (chapter.wrapped[i] == "\n") {
            count++;
        }

        if (chapter.wrapped[i] != '') {
            pages[pages.length - 1].text += chapter.wrapped[i];
        }

        if (count >= input.rows - 4) {
            pages.push(new Page(chapter));
            count = 0;
            if (chapter.wrapped[i + 1] == "{" && chapter.wrapped[i + 2] == input.color[1] && chapter.wrapped[i + 3] == "\n") {
                i += 3;
            }
        }
    }
    
    if (pages[pages.length - 1].text == "{x\n" || pages[pages.length - 1].text == "{x" || pages[pages.length - 1].text == "") {
        pages.pop();
    }
    return pages;
}

class Page {

    constructor(chapter) {
        this.text = "";
        this.number = -1;
        this.chapter = chapter;
    }
}

class Chapter {

    constructor(title, text) {
        this.title = title;
        this.text = text;
        this.pages = [];
    }
}

function CenterText(string, input) {
    var stringLength = ColorStringLength(string, input);
    var blank = "";
    var blank2 = "";
    var flipper = false;
    for (let i = stringLength; i <= input.columns; i++) {
        if (ColorStringLength(blank + string + blank2, input) == input.columns - 2) {
            break;
        }
        if (flipper) {
            blank += " ";
            flipper = false;
        } else {
            blank2 += " ";
            flipper = true;
        }
    }
    return input.uicolor + "|" + blank + string + blank2 + input.uicolor + "|" + "\n";
}

function CreateTableOfContents(chapters, input) {
    var tocString = CreateBar(input);
    var titleString = input.color + input.title;
    var authorString = input.color + input.author;
    var taglineString = input.color + input.tagline;
    tocString += CenterText(titleString, input);
    tocString += CenterText("by " + authorString, input);
    if (input.tagline != "") {
        tocString += CenterText(taglineString, input);
    }
    tocString += CenterText("", input);
    for (let i = 0; i < chapters.length; i++) {
        tocString += OneChapterLine(chapters[i], i, input);
    }
    tocString += CenterText("", input);
    tocString += CenterText("type 'read page01' to begin", input);
    tocString += CreateBar(input);
    return tocString;
}

function ColorStringLength(string, input) {
    var stringLength = 0;
    for (let i = 0; i < string.length; i++) {
        if (string[i] == "{" && string[i + 1] != "{") {
            i++;
            continue;
        } else {
            stringLength++;
        }
    }
    return stringLength;
}

function OneChapterLine(chapter, i, input) {
    var chapterLine = input.uicolor + "| " + input.color + chapter.title + " ";
    var offset = 10;
    if (chapter.pages[chapter.pages.length - 1].number >= 100) {
        offset = 11;
    }
    for (let j = ColorStringLength(chapterLine, input); j < input.columns - offset; j++) {
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
    for (let j = ColorStringLength(chapterLine, input); j < input.columns - 1; j++) {
        chapterLine += " ";
    }
    
    chapterLine += input.uicolor + "|\n";
    
    return chapterLine;
}

function GeneratePageHeader(page, input) {
    let pageHeaderLeft = page.chapter.title + " ";
    let pageHeaderRight = "";
    let pageHeaderSpace = "";

    if (page.number < 10) {
        pageHeaderRight += " 0";
    } else {
        pageHeaderRight += " ";
    }
    
    pageHeaderRight += page.number;

    for (let i = 0; i < input.columns - (pageHeaderLeft.length + pageHeaderRight.length); i++) {
        pageHeaderSpace += " ";
    }
    
    return input.uicolor + pageHeaderLeft + pageHeaderSpace + pageHeaderRight + "\n" + input.color + "\n";
}

function GeneratePageFooter(chapters, page, input) {
    let pageFooterLeft = "";
    let pageFooterRight = "";
    let pageFooterCenter = "";

    if (page.number > 1) {
        if (page.number < 9) {
            pageFooterLeft += "[read page0" + (page.number - 1) + "] <<";
        } else {
            pageFooterLeft += "[read page" + (page.number - 1) + "] <<";
        }
    } else {
        pageFooterLeft += "[read contents] <<";
    }

    if (page.number + 1 <= TotalPages(chapters)) {
        if (page.number < 9) {
            pageFooterRight += ">> [read page0" + (page.number + 1) + "]";
        } else {
            pageFooterRight += ">> [read page" + (page.number + 1) + "]";
        }
    } else {
        pageFooterRight += "(END)";
    }
    
    if (page.number > 1) {
        pageFooterCenter = " >> [read contents] << ";
    }
    
    var remaining = input.columns - (pageFooterLeft.length + pageFooterRight.length + pageFooterCenter.length);
    var flipper = true;
    for (let i = 0; i < remaining; i++) {
        if (flipper == true) {
            pageFooterCenter += " ";
        } else {
            pageFooterCenter = " " + pageFooterCenter;
        }
        flipper = !flipper;
    }
    return input.color + "\n" + input.uicolor + pageFooterLeft + pageFooterCenter + pageFooterRight + "{x\n";
}

function TotalPages(chapters) {
    return chapters[chapters.length - 1].pages[chapters[chapters.length - 1].pages.length - 1].number;
}

function CreateBar(input) {
    var bar = "+";
    for (let i = 0; i < (input.columns - 2); i++) {
        bar += "=";
    }
    bar += "+{x\n";
    bar = input.uicolor + bar;
    return bar;
}
