"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
let context;
var book_start = 0;
var book_end = 0;
var text = "";
class Book {
    getSize() {
    }
    getStartEnd() {
        book_start = context.globalState.get("book_start", 0);
        book_end = context.globalState.get("book_end", 20);
    }
    updateStartEnd() {
        book_start += 20;
        book_end += 20;
        context.globalState.update("book_start", book_start);
        context.globalState.update("book_end", book_end);
    }
    readFile(txt) {
        fs.readFile(txt, "utf-8", function (err, data) {
            if (err) {
                throw err;
            }
            text = data.toString().replace(/\n/g, "").replace(/\r/g, "").replace(/　　/g, "").replace(/ /g, "");
        });
    }
    getText() {
        this.readFile("");
        this.getSize();
        this.getStartEnd();
        this.updateStartEnd();
        let context = text.substring(book_start, book_end);
        return context;
    }
}
exports.book = Book;
//# sourceMappingURL=book.js.map