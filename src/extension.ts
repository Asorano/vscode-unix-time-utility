import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {

	context.subscriptions.push(vscode.commands.registerCommand('unix-time-utility.insertUnixTimestamp', insertUnixTimestamp));
	context.subscriptions.push(vscode.commands.registerCommand('unix-time-utility.convertUnixToHuman', convertUnixToHuman));
	context.subscriptions.push(vscode.commands.registerCommand('unix-time-utility.convertToUnixTimestamp', convertToUnixTimestamp));
}

export function deactivate() {}

function insertUnixTimestamp() {
	// Get the current Unix timestamp
	let timestamp = Math.floor(Date.now() / 1000).toString();
  
	// Get the active text editor
	let editor = vscode.window.activeTextEditor;
	if (editor) {
	  // Get the current cursor position
	  let position = editor.selection.active;
  
	  // Create a new edit for the active text editor
	  editor.edit(editBuilder => {
		// Insert the Unix timestamp at the current cursor position
		editBuilder.insert(position, timestamp);
	  });
	}
	else {
	  vscode.window.showErrorMessage('There is no active text editor');
	}
}

async function convertUnixToHuman() {
	await getAndTransformInput('Enter Timestamp', (input) => {
		let date = new Date(parseInt(input) * 1000);

		if (isNaN(date.getTime())) {
			throw new Error('Invalid input');
		}

		return date.toString();
	});
}

async function convertToUnixTimestamp()
{
	await getAndTransformInput('Enter Timestamp', (input) => {
		let date = new Date(input);

		if (isNaN(date.getTime())) {
			throw new Error('Invalid input');
		}

		return Math.floor(date.getTime() / 1000).toString();
	});
}

async function getAndTransformInput(prompt:string, transformer: (input: string) => string) {

	let input: string | undefined = undefined;

	let editor = vscode.window.activeTextEditor;
	if (editor && !editor.selection.isEmpty) {
		input = editor.document.getText(editor.selection);
	}
	else {
		input = await vscode.window.showInputBox({ prompt: prompt });
	}

	if (input) {
		try {
			let transformResult = transformer(input);
			if(editor)
			{
				let selection = editor.selection;
				editor.edit(editBuilder => {
					editBuilder.replace(selection, transformResult);
				});
				vscode.window.showInformationMessage('Selection replaced');
			}
			else
			{
				let outputChannel = vscode.window.createOutputChannel("Unix Time Utility");
				outputChannel.appendLine(transformResult);
				outputChannel.show();
			}
		}
		catch (err:any) {
			vscode.window.showErrorMessage(err.message);
		}
	}
}