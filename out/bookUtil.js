"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const vscode_1 = require("vscode");
const fs = require("fs");
const path = require("path");
const epubUtil_1 = require("./epubUtil");
class Book {
    constructor(extensionContext) {
        this.curr_page_number = 1;
        this.page_size = 50;
        this.page = 0;
        this.start = 0;
        this.end = this.page_size;
        this.filePath = "";
        this.cachedText = ""; // 缓存解析后的文本
        this.fileType = null; // 文件类型
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
    /**
     * 检测文件类型
     */
    detectFileType(filePath) {
        const ext = path.extname(filePath).toLowerCase();
        if (ext === '.epub') {
            return 'epub';
        }
        return 'txt';
    }
    /**
     * 读取 TXT 文件
     */
    readTxtFile() {
        if (this.filePath === "" || typeof (this.filePath) === "undefined") {
            vscode_1.window.showWarningMessage("请填写TXT格式的小说文件路径 & Please fill in the path of the TXT format novel file");
            return "";
        }
        var data = fs.readFileSync(this.filePath, 'utf-8');
        var line_break = vscode_1.workspace.getConfiguration().get('thiefBook.lineBreak');
        return data.toString()
            .replace(/\n/g, line_break)
            .replace(/\r/g, " ")
            .replace(/　　/g, " ")
            .replace(/ /g, " ");
    }
    /**
     * 读取 EPUB 文件
     */
    readEpubFile() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.filePath === "" || typeof (this.filePath) === "undefined") {
                vscode_1.window.showWarningMessage("请填写EPUB格式的小说文件路径 & Please fill in the path of the EPUB format novel file");
                return "";
            }
            try {
                // 如果已缓存，直接返回
                if (this.cachedText) {
                    return this.cachedText;
                }
                const parser = new epubUtil_1.EpubParser(this.filePath);
                yield parser.init();
                const text = parser.getText();
                // 处理换行符
                var line_break = vscode_1.workspace.getConfiguration().get('thiefBook.lineBreak');
                this.cachedText = text
                    .replace(/\n/g, line_break)
                    .replace(/\r/g, " ")
                    .replace(/　　/g, " ")
                    .replace(/ /g, " ");
                return this.cachedText;
            }
            catch (error) {
                vscode_1.window.showErrorMessage(`EPUB 文件解析失败: ${error}`);
                return "";
            }
        });
    }
    /**
     * 统一文件读取接口
     */
    readFile() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.filePath) {
                return "";
            }
            this.fileType = this.detectFileType(this.filePath);
            if (this.fileType === 'epub') {
                return yield this.readEpubFile();
            }
            else {
                return this.readTxtFile();
            }
        });
    }
    init() {
        const newFilePath = vscode_1.workspace.getConfiguration().get('thiefBook.filePath', '');
        const newFileType = newFilePath ? this.detectFileType(newFilePath) : null;
        // 文件类型改变时清除缓存
        if (this.filePath !== newFilePath || this.fileType !== newFileType) {
            this.cachedText = "";
        }
        this.filePath = newFilePath;
        this.fileType = newFileType;
        var is_english = vscode_1.workspace.getConfiguration().get('thiefBook.isEnglish');
        if (is_english === true) {
            this.page_size = vscode_1.workspace.getConfiguration().get('thiefBook.pageSize') * 2;
        }
        else {
            this.page_size = vscode_1.workspace.getConfiguration().get('thiefBook.pageSize');
        }
    }
    getPreviousPage() {
        return __awaiter(this, void 0, void 0, function* () {
            this.init();
            let text = yield this.readFile();
            if (!text) {
                return "";
            }
            this.getSize(text);
            this.getPage("previous");
            this.getStartEnd();
            var page_info = this.curr_page_number.toString() + "/" + this.page.toString();
            this.updatePage();
            return text.substring(this.start, this.end) + "    " + page_info;
        });
    }
    getNextPage() {
        return __awaiter(this, void 0, void 0, function* () {
            this.init();
            let text = yield this.readFile();
            if (!text) {
                return "";
            }
            this.getSize(text);
            this.getPage("next");
            this.getStartEnd();
            var page_info = this.curr_page_number.toString() + "/" + this.page.toString();
            this.updatePage();
            return text.substring(this.start, this.end) + "    " + page_info;
        });
    }
    getJumpingPage() {
        return __awaiter(this, void 0, void 0, function* () {
            this.init();
            let text = yield this.readFile();
            if (!text) {
                return "";
            }
            this.getSize(text);
            this.getPage("curr");
            this.getStartEnd();
            var page_info = this.curr_page_number.toString() + "/" + this.page.toString();
            this.updatePage();
            return text.substring(this.start, this.end) + "    " + page_info;
        });
    }
}
exports.Book = Book;
//# sourceMappingURL=bookUtil.js.map