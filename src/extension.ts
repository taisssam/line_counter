import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

function countLinesInFile(filePath: string, includeEmptyLines: boolean): number {
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');

    if (!includeEmptyLines) {
        const nonEmptyLines = lines.filter(line => line.trim() !== '');
        return nonEmptyLines.length;
    }

    return lines.length;
}

function countLinesInDirectory(directoryPath: string, fileExtension: string | null, includeEmptyLines: boolean): number {
    let totalLines = 0;

    const files = fs.readdirSync(directoryPath);

    files.forEach(file => {
        const filePath = path.join(directoryPath, file);
        const stats = fs.statSync(filePath);

        if (stats.isFile() && (fileExtension === null || path.extname(file) === fileExtension)) {
        } else if (stats.isDirectory()) {
            totalLines += countLinesInDirectory(filePath, fileExtension, includeEmptyLines);
        }
    });

    return totalLines;
}

export function activate(context: vscode.ExtensionContext) {
    console.log('Congratulations, your extension "line-counter" is now active!');

    let disposable = vscode.commands.registerCommand('extension.countLines', () => {
        const rootPath = vscode.workspace.rootPath;

        if (rootPath) {
            vscode.window.showQuickPick(['Specific Extension', 'All Files'], { placeHolder: 'Select files to count' })
                .then(selection => {
                    if (!selection) {
                        return;
                    }

                    vscode.window.showQuickPick(['Include Empty Lines', 'Exclude Empty Lines'], { placeHolder: 'Include or exclude empty lines?' })
                        .then(emptyLinesSelection => {
                            if (emptyLinesSelection === undefined) {
                                return;
                            }

                            const includeEmptyLines = emptyLinesSelection === 'Include Empty Lines';

                            if (selection === 'Specific Extension') {
                                vscode.window.showInputBox({ prompt: 'Enter file extension (e.g., .ts):' })
                                    .then(fileExtension => {
                                        if (fileExtension) {
                                            const totalLines = countLinesInDirectory(rootPath, fileExtension, includeEmptyLines);
                                            const message = `Total lines of code for \`${fileExtension}\` files: ${totalLines}`;
                                            vscode.window.showInformationMessage(message);
                                        } else {
                                            vscode.window.showErrorMessage('File extension not provided');
                                        }
                                    });
                            } else {
                                const totalLines = countLinesInDirectory(rootPath, null, includeEmptyLines);
                                const message = `Total lines of code in the project: ${totalLines}`;
                                vscode.window.showInformationMessage(message);
                            }
                        });
                });
        } else {
            vscode.window.showErrorMessage('No workspace opened');
        }
    });

    context.subscriptions.push(disposable);
}

export function deactivate() {}