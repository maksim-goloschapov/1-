// === Хранилище данных ===
let program = [];  // Массив блоков
let memory = {};   // Переменные

// === Элементы DOM ===
const blocksContainer = document.getElementById('blocks-container');
const consoleOutput = document.getElementById('console-output');
const addVariableBtn = document.getElementById('add-variable');
const addMathBtn = document.getElementById('add-math');
const runBtn = document.getElementById('run');

// === Функция логирования в консоль на странице ===
function log(message) {
    const line = document.createElement('div');
    line.textContent = '> ' + message;
    consoleOutput.appendChild(line);
    consoleOutput.scrollTop = consoleOutput.scrollHeight;
}

// === Создание блока переменной ===
function createVariableBlock() {
    const name = prompt('Введите имя переменной:', 'x');
    if (name) {
        const block = {
            id: Date.now(),
            type: 'variable',
            name: name,
            value: 0
        };
        program.push(block);
        renderBlocks();
        log(`Добавлена переменная: ${name}`);
    }
}

// === Создание блока математики ===
function createMathBlock() {
    const operation = prompt('Введите операцию (add/sub):', 'add');
    if (operation) {
        const left = parseInt(prompt('Введите первое число:', '5'));
        const right = parseInt(prompt('Введите второе число:', '3'));
        
        const block = {
            id: Date.now(),
            type: 'math',
            operation: operation,
            left: left,
            right: right
        };
        program.push(block);
        renderBlocks();
        log(`Добавлена операция: ${left} ${operation} ${right}`);
    }
}

// === Отрисовка всех блоков ===
function renderBlocks() {
    blocksContainer.innerHTML = '';
    
    program.forEach((block, index) => {
        const blockEl = document.createElement('div');
        blockEl.className = `block block-${block.type}`;
        
        if (block.type === 'variable') {
            blockEl.textContent = `[${index + 1}] 📦 Переменная: ${block.name} = ${block.value}`;
        } else if (block.type === 'math') {
            blockEl.textContent = `[${index + 1}] ➕ ${block.left} ${block.operation} ${block.right}`;
        }
        
        blocksContainer.appendChild(blockEl);
    });
}

// === Выполнение одного блока ===
function executeBlock(block) {
    if (block.type === 'variable') {
        memory[block.name] = block.value;
        log(`Создана переменная ${block.name} = ${block.value}`);
    } 
    else if (block.type === 'math') {
        let result;
        if (block.operation === 'add') {
            result = block.left + block.right;
        } else if (block.operation === 'sub') {
            result = block.left - block.right;
        }
        log(`Результат: ${result}`);
    }
}

// === Запуск программы ===
function runProgram() {
    memory = {};
    consoleOutput.innerHTML = '';
    log('=== Запуск программы ===');
    
    for (let i = 0; i < program.length; i++) {
        executeBlock(program[i]);
    }
    
    log('=== Готово ===');
    log(`Итоговые переменные: ${JSON.stringify(memory)}`);
}

// === Обработчики кнопок ===
addVariableBtn.addEventListener('click', createVariableBlock);
addMathBtn.addEventListener('click', createMathBlock);
runBtn.addEventListener('click', runProgram);

// === Приветствие ===
log('Добро пожаловать! Добавьте блоки и нажмите "Запустить"');