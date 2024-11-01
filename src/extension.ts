import * as vscode from 'vscode';
import { FileExplorerProvider } from './treeData';

export function activate(context: vscode.ExtensionContext) {
  let folderPath = '';
  vscode.commands.registerCommand('folderExplorer.selectFolder', async () => {
    const uri = await vscode.window.showOpenDialog({
      canSelectFolders: true,
      canSelectFiles: false,
      canSelectMany: false,
      openLabel: 'Select Folder'
    });

    if (uri && uri[0]) {
      folderPath = uri[0].fsPath;
      initializeTreeView(folderPath);
    }
  });
  const initializeTreeView = (folderPath: string) => {
    const fileExplorerProvider = new FileExplorerProvider(folderPath);
    vscode.window.registerTreeDataProvider('folderExplorer', fileExplorerProvider);
    vscode.commands.registerCommand('folderExplorer.refresh', () => fileExplorerProvider.refresh());
  };

  // Register the initial command to select a folder
  vscode.commands.executeCommand('folderExplorer.selectFolder');
//   const rootPath = vscode.workspace.workspaceFolders ? vscode.workspace.workspaceFolders[0].uri.fsPath : '';


//   const fileExplorerProvider = new FileExplorerProvider(rootPath);


//   vscode.window.registerTreeDataProvider('folderExplorer', fileExplorerProvider);

//   vscode.commands.registerCommand('folderExplorer.refresh', () => fileExplorerProvider.refresh());

//   vscode.commands.registerCommand('folderExplorer.addFolder', async (resourceUri: vscode.Uri) => {
//     const folderName = await vscode.window.showInputBox({ prompt: 'Enter Folder Name' });
//     if (folderName) {
//       const newFolderPath = vscode.Uri.file(path.join(resourceUri.fsPath, folderName));
//       fs.mkdirSync(newFolderPath.fsPath);
//       fileExplorerProvider.refresh();
//     }
//   });

//   vscode.commands.registerCommand('folderExplorer.addFile', async (resourceUri: vscode.Uri) => {
//     const fileName = await vscode.window.showInputBox({ prompt: 'Enter File Name' });
//     if (fileName) {
//       const newFilePath = vscode.Uri.file(path.join(resourceUri.fsPath, fileName));
//       fs.writeFileSync(newFilePath.fsPath, '');
//       fileExplorerProvider.refresh();
//     }
//   });
}

export function deactivate() {}
