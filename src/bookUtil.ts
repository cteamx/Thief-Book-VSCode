import { ExtensionContext, workspace, window } from 'vscode';
import * as fs from "fs";
import * as path from "path";
import { EpubParser } from './epubUtil';

export class Book {
    curr_page_number: number = 1;
    page_size: number | undefined = 50;
    page = 0;
    start = 0;
    end = this.page_size;
    filePath: string | undefined = "";
    extensionContext: ExtensionContext;
    private cachedText: string = ""; // 缓存解析后的文本
    private fileType: 'txt' | 'epub' | null = null; // 文件类型

    constructor(extensionContext: ExtensionContext) {
        this.extensionContext = extensionContext;
    }

    getSize(text: string) {
        let size = text.length;
        this.page = Math.ceil(size / this.page_size!);
    }

    getFileName() {
        var file_name: string | undefined = this.filePath!.split("/").pop();
        console.log(file_name);
    }

    getPage(type: string) {

        var curr_page = <number>workspace.getConfiguration().get('thiefBook.currPageNumber');
        var page = 0;

        if (type === "previous") {
            if (curr_page! <= 1) {
                page = 1;
            } else {
                page = curr_page - 1;
            }
        } else if (type === "next") {
            if (curr_page! >= this.page) {
                page = this.page;
            } else {
                page = curr_page + 1;
            }
        } else if (type === "curr") {
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

        workspace.getConfiguration().update('thiefBook.currPageNumber', this.curr_page_number, true);
        // this.extensionContext.globalState.update("book_page_number", page);
    }

    getStartEnd() {
        this.start = this.curr_page_number * this.page_size!;
        this.end = this.curr_page_number * this.page_size! - this.page_size!;
    }

    /**
     * 检测文件类型
     */
    private detectFileType(filePath: string): 'txt' | 'epub' {
        const ext = path.extname(filePath).toLowerCase();
        if (ext === '.epub') {
            return 'epub';
        }
        return 'txt';
    }

    /**
     * 读取 TXT 文件
     */
    private readTxtFile(): string {
        if (this.filePath === "" || typeof (this.filePath) === "undefined") {
            window.showWarningMessage("请填写TXT格式的小说文件路径 & Please fill in the path of the TXT format novel file");
            return "";
        }

        var data = fs.readFileSync(this.filePath!, 'utf-8');
        var line_break = <string>workspace.getConfiguration().get('thiefBook.lineBreak');

        return data.toString()
            .replace(/\n/g, line_break)
            .replace(/\r/g, " ")
            .replace(/　　/g, " ")
            .replace(/ /g, " ");
    }

    /**
     * 读取 EPUB 文件
     */
    private async readEpubFile(): Promise<string> {
        if (this.filePath === "" || typeof (this.filePath) === "undefined") {
            window.showWarningMessage("请填写EPUB格式的小说文件路径 & Please fill in the path of the EPUB format novel file");
            return "";
        }

        try {
            // 如果已缓存，直接返回
            if (this.cachedText) {
                return this.cachedText;
            }

            const parser = new EpubParser(this.filePath!);
            await parser.init();
            const text = parser.getText();
            
            // 处理换行符
            var line_break = <string>workspace.getConfiguration().get('thiefBook.lineBreak');
            this.cachedText = text
                .replace(/\n/g, line_break)
                .replace(/\r/g, " ")
                .replace(/　　/g, " ")
                .replace(/ /g, " ");

            return this.cachedText;
        } catch (error) {
            window.showErrorMessage(`EPUB 文件解析失败: ${error}`);
            return "";
        }
    }

    /**
     * 统一文件读取接口
     */
    async readFile(): Promise<string> {
        if (!this.filePath) {
            return "";
        }

        this.fileType = this.detectFileType(this.filePath);

        if (this.fileType === 'epub') {
            return await this.readEpubFile();
        } else {
            return this.readTxtFile();
        }
    }

    init() {
        const newFilePath = workspace.getConfiguration().get<string>('thiefBook.filePath', '');
        const newFileType = newFilePath ? this.detectFileType(newFilePath) : null;
        
        // 文件类型改变时清除缓存
        if (this.filePath !== newFilePath || this.fileType !== newFileType) {
            this.cachedText = "";
        }

        this.filePath = newFilePath;
        this.fileType = newFileType;
        
        var is_english = <boolean>workspace.getConfiguration().get('thiefBook.isEnglish');

        if (is_english === true) {
            this.page_size = <number>workspace.getConfiguration().get('thiefBook.pageSize') * 2;
        } else {
            this.page_size = workspace.getConfiguration().get('thiefBook.pageSize');
        }
    }

    async getPreviousPage(): Promise<string> {
        this.init();

        let text = await this.readFile();
        if (!text) {
            return "";
        }

        this.getSize(text);
        this.getPage("previous");
        this.getStartEnd();

        var page_info = this.curr_page_number.toString() + "/" + this.page.toString();

        this.updatePage();
        return text.substring(this.start, this.end) + "    " + page_info;
    }

    async getNextPage(): Promise<string> {
        this.init();

        let text = await this.readFile();
        if (!text) {
            return "";
        }

        this.getSize(text);
        this.getPage("next");
        this.getStartEnd();

        var page_info = this.curr_page_number.toString() + "/" + this.page.toString();

        this.updatePage();

        return text.substring(this.start, this.end) + "    " + page_info;
    }

    async getJumpingPage(): Promise<string> {
        this.init();

        let text = await this.readFile();
        if (!text) {
            return "";
        }

        this.getSize(text);
        this.getPage("curr");
        this.getStartEnd();

        var page_info = this.curr_page_number.toString() + "/" + this.page.toString();

        this.updatePage();

        return text.substring(this.start, this.end) + "    " + page_info;
    }
}