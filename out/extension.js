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
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode_1 = require("vscode");
const book = require("./bookUtil");
// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
function activate(context) {
    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    console.log('Congratulations, your extension "thief-book" is now active!');
    // The command has been defined in the package.json file
    // Now provide the implementation of the command with registerCommand
    // The commandId parameter must match the command field in package.json
    // 老板键
    let displayCode = vscode_1.commands.registerCommand('extension.displayCode', () => {
        let lauage_arr_list = [
            'Java - System.out.println("Hello World");',
            'C++ - cout << "Hello, world!" << endl;',
            'C - printf("Hello, World!");',
            'Python - print("Hello, World!")',
            'PHP - echo "Hello World!";',
            'Ruby - puts "Hello World!";',
            'Perl - print "Hello, World!";',
            'Lua - print("Hello World!")',
            'Scala - println("Hello, world!")',
            'Golang - fmt.Println("Hello, World!")'
        ];
        var index = Math.floor((Math.random() * lauage_arr_list.length));
        vscode_1.window.setStatusBarMessage(lauage_arr_list[index]);
    });
    // 下一页
    let getNextPage = vscode_1.commands.registerCommand('extension.getNextPage', () => __awaiter(this, void 0, void 0, function* () {
        try {
            let books = new book.Book(context);
            const content = yield books.getNextPage();
            vscode_1.window.setStatusBarMessage(content);
        }
        catch (error) {
            vscode_1.window.showErrorMessage(`读取失败: ${error}`);
        }
    }));
    // 上一页
    let getPreviousPage = vscode_1.commands.registerCommand('extension.getPreviousPage', () => __awaiter(this, void 0, void 0, function* () {
        try {
            let books = new book.Book(context);
            const content = yield books.getPreviousPage();
            vscode_1.window.setStatusBarMessage(content);
        }
        catch (error) {
            vscode_1.window.showErrorMessage(`读取失败: ${error}`);
        }
    }));
    // 跳转某个页面
    let getJumpingPage = vscode_1.commands.registerCommand('extension.getJumpingPage', () => __awaiter(this, void 0, void 0, function* () {
        try {
            let books = new book.Book(context);
            const content = yield books.getJumpingPage();
            vscode_1.window.setStatusBarMessage(content);
        }
        catch (error) {
            vscode_1.window.showErrorMessage(`读取失败: ${error}`);
        }
    }));
    context.subscriptions.push(displayCode);
    context.subscriptions.push(getNextPage);
    context.subscriptions.push(getPreviousPage);
    context.subscriptions.push(getJumpingPage);
}
exports.activate = activate;
// this method is called when your extension is deactivated
function deactivate() { }
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map