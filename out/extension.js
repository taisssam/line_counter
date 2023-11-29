"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deactivate = exports.activate = void 0;
const vscode = __importStar(require("vscode"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
function countLinesInFile(filePath, includeEmptyLines) {
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');
    if (!includeEmptyLines) {
        const nonEmptyLines = lines.filter(line => line.trim() !== '');
        return nonEmptyLines.length;
    }
    return lines.length;
}
function countLinesInDirectory(directoryPath, fileExtension, includeEmptyLines) {
    let totalLines = 0;
    const files = fs.readdirSync(directoryPath);
    files.forEach(file => {
        const filePath = path.join(directoryPath, file);
        const stats = fs.statSync(filePath);
        if (stats.isFile() && (fileExtension === null || path.extname(file) === fileExtension)) {
        }
        else if (stats.isDirectory()) {
            totalLines += countLinesInDirectory(filePath, fileExtension, includeEmptyLines);
        }
    });
    return totalLines;
}
function activate(context) {
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
                            }
                            else {
                                vscode.window.showErrorMessage('File extension not provided');
                            }
                        });
                    }
                    else {
                        const totalLines = countLinesInDirectory(rootPath, null, includeEmptyLines);
                        const message = `Total lines of code in the project: ${totalLines}`;
                        vscode.window.showInformationMessage(message);
                    }
                });
            });
        }
        else {
            vscode.window.showErrorMessage('No workspace opened');
        }
    });
    context.subscriptions.push(disposable);
}
exports.activate = activate;
function deactivate() { }
exports.deactivate = deactivate;
