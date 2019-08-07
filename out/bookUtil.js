"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode_1 = require("vscode");
const fs = require("fs");
class Book {
    constructor(extensionContext) {
        this.curr_page_number = 1;
        this.page_size = 50;
        this.page = 0;
        this.start = 0;
        this.end = this.page_size;
        this.filePath = "";
        this.extensionContext = extensionContext;
    }
    getSize(text) {
        let size = text.length;
        this.page = Math.ceil(size / this.page_size);
    }
    getFileName() {
        var file_name = this.filePath.split("/").pop();
        console.log(file_name);
    }
    getPage(type) {
        var curr_page = vscode_1.workspace.getConfiguration().get('thiefBook.currPageNumber');
        var page = 0;
        if (type === "previous") {
            if (curr_page <= 1) {
                page = 1;
            }
            else {
                page = curr_page - 1;
            }
        }
        else if (type === "next") {
            if (curr_page >= this.page) {
                page = this.page;
            }
            else {
                page = curr_page + 1;
            }
        }
        else if (type === "curr") {
            page = curr_page;
        }
        this.curr_page_number = page;
        // this.curr_page_number = this.extensionContext.globalState.get("book_page_number", 1);
    }
    updatePage() {
        // var page = 0;
        // if (type === "previous") {
        //     if (this.curr_page_number! <= 1) {
        //         page = 1;
        //     } else {
        //         page = this.curr_page_number! - 1;
        //     }
        // } else if (type === "next") {
        //     if (this.curr_page_number! >= this.page) {
        //         page = this.page;
        //     } else {
        //         page = this.curr_page_number! + 1;
        //     }
        // }
        vscode_1.workspace.getConfiguration().update('thiefBook.currPageNumber', this.curr_page_number, true);
        // this.extensionContext.globalState.update("book_page_number", page);
    }
    getStartEnd() {
        this.start = this.curr_page_number * this.page_size;
        this.end = this.curr_page_number * this.page_size - this.page_size;
    }
    readFile() {
        if (this.filePath === "" || typeof (this.filePath) === "undefined") {
            vscode_1.window.showWarningMessage("请填写TXT格式的小说文件路径 & Please fill in the path of the TXT format novel file");
        }
        var data = fs.readFileSync(this.filePath, 'utf-8');
        var line_break = vscode_1.workspace.getConfiguration().get('thiefBook.lineBreak');
        return data.toString().replace(/\n/g, line_break).replace(/\r/g, " ").replace(/　　/g, " ").replace(/ /g, " ");
    }
    init() {
        this.filePath = vscode_1.workspace.getConfiguration().get('thiefBook.filePath');
        var is_english = vscode_1.workspace.getConfiguration().get('thiefBook.isEnglish');
        if (is_english === true) {
            this.page_size = vscode_1.workspace.getConfiguration().get('thiefBook.pageSize') * 2;
        }
        else {
            this.page_size = vscode_1.workspace.getConfiguration().get('thiefBook.pageSize');
        }
    }
    getPreviousPage() {
        this.init();
        let text = this.readFile();
        this.getSize(text);
        this.getPage("previous");
        this.getStartEnd();
        var page_info = this.curr_page_number.toString() + "/" + this.page.toString();
        this.updatePage();
        return text.substring(this.start, this.end) + "    " + page_info;
    }
    getNextPage() {
        this.init();
        let text = this.readFile();
        this.getSize(text);
        this.getPage("next");
        this.getStartEnd();
        var page_info = this.curr_page_number.toString() + "/" + this.page.toString();
        this.updatePage();
        return text.substring(this.start, this.end) + "    " + page_info;
    }
    getJumpingPage() {
        this.init();
        let text = this.readFile();
        this.getSize(text);
        this.getPage("curr");
        this.getStartEnd();
        var page_info = this.curr_page_number.toString() + "/" + this.page.toString();
        this.updatePage();
        return text.substring(this.start, this.end) + "    " + page_info;
    }
}
exports.Book = Book;
//# sourceMappingURL=bookUtil.js.map