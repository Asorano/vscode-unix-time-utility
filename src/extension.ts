import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
	context.subscriptions.push(vscode.commands.registerCommand('unix-time-utility.insertUnixTimestamp', insertUnixTimestamp));
	context.subscriptions.push(vscode.commands.registerCommand('unix-time-utility.convertUnixToHuman', convertUnixToHuman));
	context.subscriptions.push(vscode.commands.registerCommand('unix-time-utility.convertToUnixTimestamp', convertToUnixTimestamp));
}

export function deactivate() {}

// Command: insertUnixTimestamp
// Inserts the current unix timestamp at the cursor position
function insertUnixTimestamp() {
	let timestamp = Math.floor(Date.now() / 1000).toString();
  
	let editor = vscode.window.activeTextEditor;
	if (editor) {
	  let position = editor.selection.active;

	  editor.edit(editBuilder => {
		editBuilder.insert(position, timestamp);
	  });
	}
	else {
	  vscode.window.showErrorMessage('There is no active text editor');
	}
}

// Command: convertUnixToHuman
// Takes either the selected text of the editor OR the user input and tries to convert it from a unix timestamp to a human readable date 
async function convertUnixToHuman() {
	await getAndTransformInput('Enter Timestamp', (input) => {
		let date = new Date(parseInt(input) * 1000);

		if (isNaN(date.getTime())) {
			throw new Error('Invalid input');
		}

		return date.toString();
	});
}

// Command: convertToUnixTimestamp
// Takes either the selected text of the editor OR the user input and tries to convert it from a human readable text to a unix timestamp 
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

///////////////////////////////////////////////////////////////////////////////////////////
/// Utility Functions /////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////

// Gets input either from the current selection of the editor if available OR from a user prompt.
// If input was provided, the passed transformer is called.
// If the transformation was successful, the output is:
// - inserted into the editor if available
// - shown in an output channel otherwise
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