const vscode = acquireVsCodeApi();

function loadTree() {
  const folderPath = document.getElementById('folderPathInput').value;
  if (folderPath) {
    vscode.postMessage({ command: 'loadTree', folderPath });
  }
}

function displayTree(treeData) {
  const treeContainer = document.getElementById('treeContainer');
  treeContainer.innerHTML = generateTreeHTML(treeData);
  drawLinks();
}

function generateTreeHTML(nodes, level = 0) {
  return `
      <div class="tree-level" style="margin-left: ${level * 20}px;">
        ${nodes.map(node => `
          <div class="tree-item">
            <div class="item-box">
              <img src="${node.type === 'folder' ? 'folder-icon.png' : 'file-icon.png'}" alt="${node.type}" class="icon">
              <span class="item-label">${node.type === 'folder' ? `${node.name} (${node.children ? node.children.length : 0} ${node.children && node.children.length > 1 ? 'files' : 'file'})` : node.name}</span>
              <div class="actions">
                <button onclick="addItem('${node.path}', '${node.type}')">+</button>
                <button onclick="deleteItem('${node.path}')">🗑️</button>
              </div>
            </div>
            ${node.children ? generateTreeHTML(node.children, level + 1) : ''}
          </div>
        `).join('')}
      </div>
    `;
}

function drawLinks() {
  const items = document.querySelectorAll('.tree-item');
  items.forEach((item, index) => {
    const parent = item.closest('.tree-level');
    const nextItem = items[index + 1];
    if (parent && nextItem) {
      const line = document.createElement('div');
      line.className = 'link-line';
      parent.appendChild(line);
    }
  });
}


// function drawLinks() {
//     document.querySelectorAll('.tree-level').forEach(level => {
//         const items = Array.from(level.children);
//         if (items.length > 1) {
//             items.forEach((item, index) => {
//                 if (index < items.length - 1) {
//                     const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
//                     const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
//                     svg.classList.add('link-line');

//                     const start = item.getBoundingClientRect();
//                     const end = items[index + 1].getBoundingClientRect();

//                     line.setAttribute('x1', start.right);
//                     line.setAttribute('y1', start.top + start.height / 2);
//                     line.setAttribute('x2', end.left);
//                     line.setAttribute('y2', end.top + end.height / 2);

//                     svg.appendChild(line);
//                     document.body.appendChild(svg);
//                 }
//             });
//         }
//     });
// }

function addItem(path, type) {
  vscode.postMessage({ command: 'addItem', path, type });
}

function deleteItem(path) {
  vscode.postMessage({ command: 'deleteItem', path });
}

window.addEventListener('message', event => {
  const message = event.data;
  if (message.command === 'showTree') {
    displayTree(message.treeData);
  }
});
