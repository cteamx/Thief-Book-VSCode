"use strict";
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
    let getNextPage = vscode_1.commands.registerCommand('extension.getNextPage', () => {
        let books = new book.Book(context);
        vscode_1.window.setStatusBarMessage(books.getNextPage());
    });
    // 上一页
    let getPreviousPage = vscode_1.commands.registerCommand('extension.getPreviousPage', () => {
        let books = new book.Book(context);
        vscode_1.window.setStatusBarMessage(books.getPreviousPage());
    });
    // 跳转某个页面
    let getJumpingPage = vscode_1.commands.registerCommand('extension.getJumpingPage', () => {
        let books = new book.Book(context);
        vscode_1.window.setStatusBarMessage(books.getJumpingPage());
    });
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