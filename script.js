// === Хранилище данных ===
let program = [];  // Массив блоков
let memory = {};   // Переменные

// === Элементы DOM ===
const blocksContainer = document.getElementById('blocks-container');
const consoleOutput = document.getElementById('console-output');
const addVariableBtn = document.getElementById('add-variable');
const addMathBtn = document.getElementById('add-math');
const runBtn = document.getElementById('run');
const addPrintBtn = document.getElementById('add-print');


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
            type: 'переменная',
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
    const operation = prompt('Введите операцию (сложение/вычитание/умножение/деление):', 'сложение');
    const left = parseInt(prompt('Введите первое число:', '5'));
    const right = parseInt(prompt('Введите второе число:', '3'));
    const resultVar = prompt('В какую переменную сохранить?', 'результат');
    
    const block = {
        id: Date.now(),
        type: 'математика',
        operation: operation,
        left: left,
        right: right,
        resultVar: resultVar
    };
    program.push(block);
    renderBlocks();
    log(`Добавлена операция: ${left} ${operation} ${right} → ${resultVar}`);
}


// === Отрисовка всех блоков ===
function renderBlocks() {
    blocksContainer.innerHTML = '';
    
    program.forEach((block, index) => {
        const blockEl = document.createElement('div');
        blockEl.className = `block block-${block.type}`;
        
        if (block.type === 'переменная') {
            blockEl.textContent = `[${index + 1}] 📦 Переменная: ${block.name} = ${block.value}`;
        } 
        else if (block.type === 'математика') {
            let opSymbol = block.operation;
            if (block.operation === 'сложение') opSymbol = '+';
            else if (block.operation === 'вычитание') opSymbol = '-';
            else if (block.operation === 'умножение') opSymbol = '×';
            else if (block.operation === 'деление') opSymbol = '÷';
            
            blockEl.textContent = `[${index + 1}] ➕ ${block.left} ${opSymbol} ${block.right}`;
        }
        else if (block.type === 'вывод') {
            blockEl.textContent = `[${index + 1}] 🖨️ Вывод: ${block.variable}`;
        }
        
        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = '❌';
        deleteBtn.style.float = 'right';
        deleteBtn.onclick = () => {
            program.splice(index, 1);
            renderBlocks();
        };
        blockEl.appendChild(deleteBtn);
        
        blocksContainer.appendChild(blockEl);
    });
}


function createPrintBlock() {
    const varName = prompt('Какую переменную вывести?', 'результат');
    if (varName) {
        const block = {
            id: Date.now(),
            type: 'вывод',
            variable: varName
        };
        program.push(block);
        renderBlocks();
        log(`Добавлен вывод: ${varName}`);
    }
}


// === Выполнение одного блока ===
function executeBlock(block) {
    if (block.type === 'переменная') {
        memory[block.name] = block.value;
        log(`Создана переменная ${block.name} = ${block.value}`);
    } 
    else if (block.type === 'математика') {
        let result;
        if (block.operation === 'сложение') {
            result = block.left + block.right;
        } else if (block.operation === 'вычитание') {
            result = block.left - block.right;
        } else if (block.operation === 'умножение') {
            result = block.left * block.right;
        } else if (block.operation === 'деление') {
            result = Math.floor(block.left / block.right);
        }
        
        if (block.resultVar) {
            memory[block.resultVar] = result;
            log(`${block.resultVar} = ${result}`);
        } else {
            log(`Результат: ${result}`);
        }
    }
    else if (block.type === 'вывод') {
        const value = memory[block.variable];
        if (value !== undefined) {
            log(`🖨️ ${block.variable} = ${value}`);
        } else {
            log(`❌ Переменная "${block.variable}" не найдена!`);
        }
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
// === Drag-and-Drop для блоков ===
new Sortable(blocksContainer, {
    animation: 150,
    ghostClass: 'sortable-ghost',
    dragClass: 'sortable-drag',
    
    onEnd: function(evt) {
        const item = program.splice(evt.oldIndex, 1)[0];
        program.splice(evt.newIndex, 0, item);
        
        console.log(`Блок перемещён с ${evt.oldIndex} на ${evt.newIndex}`);
    }
});

console.log('Drag-and-Drop активирован! 🎯');

// === Обработчики кнопок ===
addVariableBtn.addEventListener('click', createVariableBlock);
addMathBtn.addEventListener('click', createMathBlock);
runBtn.addEventListener('click', runProgram);
addPrintBtn.addEventListener('click', createPrintBlock);


// === Приветствие ===
log('Добро пожаловать! Добавьте блоки и нажмите "Запустить"');