// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import { commands, ExtensionContext, window, workspace } from 'vscode';
import * as book from './bookUtil';

let autoPlayTimer: any;

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "thief-book" is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json

	// 老板键
	let displayCode = commands.registerCommand('extension.displayCode', () => {
		// 停止自动播放
		if (autoPlayTimer) {
			clearInterval(autoPlayTimer);
			autoPlayTimer = undefined;
		}

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
		window.setStatusBarMessage(lauage_arr_list[index]);
	});

	// 下一页
	let getNextPage = commands.registerCommand('extension.getNextPage', async () => {
		try {
		let books = new book.Book(context);
			const content = await books.getNextPage();
			window.setStatusBarMessage(content);
		} catch (error) {
			window.showErrorMessage(`读取失败: ${error}`);
		}
	});

	// 上一页
	let getPreviousPage = commands.registerCommand('extension.getPreviousPage', async () => {
		try {
		let books = new book.Book(context);
			const content = await books.getPreviousPage();
			window.setStatusBarMessage(content);
		} catch (error) {
			window.showErrorMessage(`读取失败: ${error}`);
		}
	});

	// 跳转某个页面
	let getJumpingPage = commands.registerCommand('extension.getJumpingPage', async () => {
		try {
		let books = new book.Book(context);
			const content = await books.getJumpingPage();
			window.setStatusBarMessage(content);
		} catch (error) {
			window.showErrorMessage(`读取失败: ${error}`);
		}
	});

	// 自动播放
	let autoPlay = commands.registerCommand('extension.autoPlay', async () => {
		// 如果正在播放 → 停止
		if (autoPlayTimer) {
			clearInterval(autoPlayTimer);
			autoPlayTimer = undefined;
			window.setStatusBarMessage('自动播放已停止');
			return;
		}

		// 开始自动播放
		let interval = workspace.getConfiguration().get<number>('thiefBook.autoPlayInterval', 3);
		if (interval < 1) { interval = 1; }

		// 先立即显示一页
		try {
			let books = new book.Book(context);
			const content = await books.getNextPage();
			window.setStatusBarMessage(content);
		} catch (error) {
			window.showErrorMessage(`读取失败: ${error}`);
			return;
		}

		// 设置定时器
		autoPlayTimer = setInterval(async () => {
			try {
				let books = new book.Book(context);
				const content = await books.getNextPage();
				window.setStatusBarMessage(content);
			} catch (error) {
				clearInterval(autoPlayTimer);
				autoPlayTimer = undefined;
			}
		}, interval * 1000);
	});

	context.subscriptions.push(displayCode);
	context.subscriptions.push(getNextPage);
	context.subscriptions.push(getPreviousPage);
	context.subscriptions.push(getJumpingPage);
	context.subscriptions.push(autoPlay);
	context.subscriptions.push({
		dispose: () => {
			if (autoPlayTimer) {
				clearInterval(autoPlayTimer);
				autoPlayTimer = undefined;
			}
		}
	});
}

// this method is called when your extension is deactivated
export function deactivate() { }
