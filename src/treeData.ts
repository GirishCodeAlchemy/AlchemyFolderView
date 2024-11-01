import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';

export class FileExplorerProvider implements vscode.TreeDataProvider<TreeItem> {
    private _onDidChangeTreeData: vscode.EventEmitter<TreeItem | undefined> = new vscode.EventEmitter<TreeItem | undefined>();
    readonly onDidChangeTreeData: vscode.Event<TreeItem | undefined> = this._onDidChangeTreeData.event;

    constructor(private workspaceRoot: string) {}

    refresh(): void {
      this._onDidChangeTreeData.fire(undefined);
    }

    getTreeItem(element: TreeItem): vscode.TreeItem {
      return element;
    }

    getChildren(element?: TreeItem): Thenable<TreeItem[]> {
      if (!this.workspaceRoot) {
        vscode.window.showInformationMessage('No folder selected');
        return Promise.resolve([]);
      }
      if (element) {
        return Promise.resolve(this.getFilesAndFolders(element.resourceUri.fsPath));
      } else {
        return Promise.resolve(this.getFilesAndFolders(this.workspaceRoot));
      }
    }

    private getFilesAndFolders(folderPath: string): TreeItem[] {
      const items = fs.readdirSync(folderPath).map((file) => {
        const filePath = path.join(folderPath, file);
        const isDirectory = fs.statSync(filePath).isDirectory();

        // Generate a summary: count files and subdirectories
        const summary = this.getFolderSummary(filePath, isDirectory);

        return new TreeItem(
          vscode.Uri.file(filePath),
          isDirectory ? vscode.TreeItemCollapsibleState.Collapsed : vscode.TreeItemCollapsibleState.None,
          summary
        );
      });

      return items;
    }

    private getFolderSummary(filePath: string, isDirectory: boolean): string {
      if (!isDirectory) {
        return 'File';
      }
      const files = fs.readdirSync(filePath);
      const folderCount = files.filter((name) => fs.statSync(path.join(filePath, name)).isDirectory()).length;
      const fileCount = files.length - folderCount;
      return `Contains ${folderCount} folders and ${fileCount} files`;
    }
  }

  export class TreeItem extends vscode.TreeItem {
    constructor(
      public readonly resourceUri: vscode.Uri,
      public readonly collapsibleState: vscode.TreeItemCollapsibleState,
      public readonly description?: string // Added summary as description
    ) {
      super(resourceUri, collapsibleState);
      this.contextValue = fs.statSync(resourceUri.fsPath).isDirectory() ? 'folder' : 'file';
      this.iconPath = this.contextValue === 'folder' ? new vscode.ThemeIcon('folder') : new vscode.ThemeIcon('file');
      this.tooltip = `${this.resourceUri.fsPath}\n${this.description}`;
    }
  }

// export class FileExplorerProvider implements vscode.TreeDataProvider<TreeItem> {
//   private _onDidChangeTreeData: vscode.EventEmitter<TreeItem | undefined> = new vscode.EventEmitter<TreeItem | undefined>();
//   readonly onDidChangeTreeData: vscode.Event<TreeItem | undefined> = this._onDidChangeTreeData.event;

//   constructor(private workspaceRoot: string) {}

//   refresh(): void {
//     this._onDidChangeTreeData.fire(undefined);
//   }

//   getTreeItem(element: TreeItem): vscode.TreeItem {
//     return element;
//   }

//   getChildren(element?: TreeItem): Thenable<TreeItem[]> {
//     if (!this.workspaceRoot) {
//       vscode.window.showInformationMessage('No folder found');
//       return Promise.resolve([]);
//     }
//     if (element) {
//       return Promise.resolve(this.getFilesAndFolders(element.resourceUri.fsPath));
//     } else {
//       return Promise.resolve(this.getFilesAndFolders(this.workspaceRoot));
//     }
//   }

//   private getFilesAndFolders(folderPath: string): TreeItem[] {
//     const items = fs.readdirSync(folderPath).map((file) => {
//       const filePath = path.join(folderPath, file);  // Still a string
//       const isDirectory = fs.statSync(filePath).isDirectory();

//       // Convert filePath to vscode.Uri before passing it to TreeItem
//       return new TreeItem(
//         vscode.Uri.file(filePath),  // Wrap filePath in vscode.Uri
//         isDirectory ? vscode.TreeItemCollapsibleState.Collapsed : vscode.TreeItemCollapsibleState.None
//       );
//     });

//     return items;
//   }
// }

// export class TreeItem extends vscode.TreeItem {
//     constructor(
//       public readonly resourceUri: vscode.Uri,  // Changed from string to vscode.Uri
//       public readonly collapsibleState: vscode.TreeItemCollapsibleState,
//     ) {
//       super(resourceUri, collapsibleState);  // Pass vscode.Uri directly to super

//       this.contextValue = fs.statSync(resourceUri.fsPath).isDirectory() ? 'folder' : 'file';
//       this.iconPath = this.contextValue === 'folder'
//         ? new vscode.ThemeIcon('folder')
//         : new vscode.ThemeIcon('file');
//     }
//   }
