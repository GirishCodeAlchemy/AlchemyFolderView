import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
  context.subscriptions.push(
    vscode.commands.registerCommand('alchemyFolderView.openWebview', () => {
      FolderExplorerPanel.createOrShow(context.extensionUri);
    })
  );
}

class FolderExplorerPanel {
  public static currentPanel: FolderExplorerPanel | undefined;
  private readonly _panel: vscode.WebviewPanel;
  private _disposables: vscode.Disposable[] = [];

  public static createOrShow(extensionUri: vscode.Uri) {
    const column = vscode.ViewColumn.One;

    if (FolderExplorerPanel.currentPanel) {
      FolderExplorerPanel.currentPanel._panel.reveal(column);
      return;
    }

    const panel = vscode.window.createWebviewPanel(
      'folderExplorer',
      'Folder Explorer',
      column,
      {
        enableScripts: true
      }
    );

    FolderExplorerPanel.currentPanel = new FolderExplorerPanel(panel, extensionUri);
  }

  private constructor(panel: vscode.WebviewPanel, extensionUri: vscode.Uri) {
    this._panel = panel;
    this._panel.webview.html = this._getHtmlForWebview(this._panel.webview, extensionUri);
    this._panel.onDidDispose(() => this.dispose(), null, this._disposables);

    this._panel.webview.onDidReceiveMessage(async message => {
      const folderPath = message.folderPath;

      switch (message.command) {
        case 'loadTree':
          const treeData = this._generateTreeData(folderPath);
          this._panel.webview.postMessage({ command: 'showTree', treeData });
          break;
        case 'addItem':
          // Code to add a file or folder at message.path
          break;
        case 'deleteItem':
          // Code to delete a file or folder at message.path
          break;
      }
    });

  }

  private _generateTreeData(folderPath: string): any[] {
    const getItems = (dir: string): any[] =>
      fs.readdirSync(dir).map(file => {
        const filePath = path.join(dir, file);
        const isDirectory = fs.statSync(filePath).isDirectory();
        return {
          name: file,
          path: filePath,
          type: isDirectory ? 'folder' : 'file',
          children: isDirectory ? getItems(filePath) : undefined
        };
      });

    return getItems(folderPath);
  }

  private _getHtmlForWebview(webview: vscode.Webview, extensionUri: vscode.Uri): string {
    const scriptUri = webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'media', 'main.js'));
    const styleUri = webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'media', 'styles.css'));

    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Folder Explorer</title>
        <link href="${styleUri}" rel="stylesheet">
      </head>
      <body>
        <div class="container">
          <h2>Enter Folder Path</h2>
          <input type="text" id="folderPathInput" placeholder="Enter absolute path" />
          <button onclick="loadTree()">Load Folder Tree</button>
          <div id="treeContainer" class="tree-container"></div>
        </div>
        <script src="${scriptUri}"></script>
      </body>
      </html>`;
  }

  public dispose() {
    FolderExplorerPanel.currentPanel = undefined;
    this._panel.dispose();
    while (this._disposables.length) {
      const x = this._disposables.pop();
      if (x) x.dispose();
    }
  }
}

export function deactivate() {}
