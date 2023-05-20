// File list
const filesElement = document.getElementById('files');
// Get the console button and console area elements
const consoleButton = document.getElementById('consoleButton');
const consoleArea = document.getElementById('consoleArea');
const consoleOutput = document.getElementById('consoleOutput');
let fileList = [];

// Add a click event listener to the console button
consoleButton.addEventListener('click', () => {
    consoleArea.style.display = consoleArea.style.display === 'none' ? 'block' : 'none';
});


function addFile(fileName) {
    fileList.push(fileName);
    const li = document.createElement('li');
    li.textContent = fileName;
    li.addEventListener('click', () => {
        loadFile(fileName);
    });
    filesElement.appendChild(li);
}

function createNewFile() {
    const fileName = prompt('Enter the name of the new file:');
    if (fileName) {
        addFile(fileName);
        loadFile(fileName);
    }
}

// Create new file button
const newFileButton = document.getElementById('newFileButton');
newFileButton.addEventListener('click', createNewFile);

// Code editor
const codeEditor = document.getElementById('code');
const lineNumbers = document.querySelector('.lineNumbers');

function updateLineNumbers() {
    const lines = codeEditor.value.split('\n').length;
    lineNumbers.innerHTML = Array.from({ length: lines }).map((_, i) => i + 1).join('<br>');
}

codeEditor.addEventListener('input', () => {
    updateLineNumbers();
    saveFile();
});

// Output
const outputElement = document.getElementById('output');

// Run button
const runButton = document.getElementById('runButton');
runButton.addEventListener('click', executeCode);

function executeCode() {
    // outputElement.textContent = ''; // Clear previous output

    // Clear previous output
    outputElement.textContent = '';
    consoleArea.style.display = 'none';
    consoleOutput.textContent = '';

    const code = codeEditor.value;

    // Configure Skulpt
    Sk.configure({
        output: function (text) {
            consoleArea.style.display = 'block';
            consoleOutput.textContent += text + '\n';
        },

        read: function (file) {
            if (Sk.builtinFiles === undefined || Sk.builtinFiles['files'][file] === undefined)
                throw "File not found: '" + file + "'";
            return Sk.builtinFiles['files'][file];
        }
    });

    // Execute Python code using Skulpt
    try {
        Sk.misceval.asyncToPromise(function () {
            return Sk.importMainWithBody("<stdin>", false, code, true);
        });
    } catch (e) {
        outputElement.textContent += e.toString() + '\n';
    }
}

// File caching
function saveFile() {
    const fileName = getCurrentFile();
    localStorage.setItem(`file-${fileName}`, codeEditor.value);
}

function loadFile(fileName) {
    const fileContent = localStorage.getItem(`file-${fileName}`);
    codeEditor.value = fileContent || '';
    updateLineNumbers();
}

function getCurrentFile() {
    const activeFile = document.querySelector('#files li.active');
    return activeFile ? activeFile.textContent : null;
}

function highlightActiveFile() {
    const files = document.querySelectorAll('#files li');
    files.forEach(file => {
        file.classList.remove('active');
        if (file.textContent === getCurrentFile()) {
            file.classList.add('active');
        }
    });
}

function renameFile(fileName) {
    const newFileName = prompt('Enter the new name for the file:', fileName);
    if (newFileName) {
        const index = fileList.indexOf(fileName);
        if (index !== -1) {
            fileList[index] = newFileName;
            const fileElement = document.querySelector(`#files li:nth-child(${index + 1})`);
            if (fileElement) {
                fileElement.textContent = newFileName;
            }
            localStorage.removeItem(`file-${fileName}`);
            localStorage.setItem(`file-${newFileName}`, codeEditor.value);
        }
    }
}

filesElement.addEventListener('contextmenu', event => {
    event.preventDefault();
    const fileName = getCurrentFile();
    if (fileName) {
        renameFile(fileName);
    }
});

filesElement.addEventListener('click', event => {
    if (event.target.nodeName === 'LI') {
        const fileName = event.target.textContent;
        loadFile(fileName);
        highlightActiveFile();
    }
});

// Load initial files from local storage
function loadFilesFromStorage() {
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key.startsWith('file-')) {
            const fileName = key.substring(5);
            fileList.push(fileName);
            addFile(fileName);
        }
    }
}

loadFilesFromStorage();

// Add sample files
if (fileList.length === 0) {
    addFile('__init__.py');
}

// Load initial file
const initialFileName = fileList[0];
if (initialFileName) {
    loadFile(initialFileName);
}

highlightActiveFile();