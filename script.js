// === Хранилище данных ===
let program = [];  // Массив блоков
let memory = {};   // Переменные
let activeIfBlock = null;  //IF, внутрь которого добавляем блоки

// === Элементы DOM ===
const blocksContainer = document.getElementById('blocks-container');
const consoleOutput = document.getElementById('console-output');
const addVariableBtn = document.getElementById('add-variable');
const addMathBtn = document.getElementById('add-math');
const runBtn = document.getElementById('run');
const addPrintBtn = document.getElementById('add-print');
const addIfBtn = document.getElementById('add-if');
const exitIfBtn = document.getElementById('exit-if');
exitIfBtn.addEventListener('click', exitIfMode);


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
        
        // Добавляем в активный IF или в основную программу
        if (activeIfBlock) {
            activeIfBlock.thenBlocks.push(block);
            log(`Добавлена переменная ${name} внутрь IF`);
        } else {
            program.push(block);
            log(`Добавлена переменная: ${name}`);
        }
        
        renderBlocks();
    }
}

// === Создание блока математики ===
function createMathBlock() {
    const expression = prompt('Введите выражение (например: (5 + 3) × 2):', '5 + 3');
    
    if (expression) {
        const resultVar = prompt('В какую переменную сохранить?', 'результат');
        
        const block = {
            id: Date.now(),
            type: 'математика',
            expression: expression,
            resultVar: resultVar
        };
        
        // Добавляем в активный IF или в основную программу
        if (activeIfBlock) {
            activeIfBlock.thenBlocks.push(block);
            log(`Добавлено выражение ${expression} внутрь IF`);
        } else {
            program.push(block);
            log(`Добавлено выражение: ${expression} → ${resultVar}`);
        }
        
        renderBlocks();
    }
}


// === Отрисовка всех блоков ===
function renderBlocks() {
    blocksContainer.innerHTML = '';
    
    function renderBlockList(blocks, container, indent = 0) {
        blocks.forEach((block, index) => {
            const blockEl = document.createElement('div');
            blockEl.className = `block block-${block.type}`;
            blockEl.style.marginLeft = `${indent * 30}px`; 
            
            if (block.type === 'переменная') {
                blockEl.textContent = `[${index + 1}] 📦 Переменная: ${block.name} = ${block.value}`;
            } 
            else if (block.type === 'математика') {
                blockEl.textContent = `[${index + 1}] ➕ ${block.expression}`;
            }
            else if (block.type === 'вывод') {
                blockEl.textContent = `[${index + 1}] 🖨️ Вывод: ${block.variable}`;
            }
            else if (block.type === 'если') {
                const cond = block.condition;
                blockEl.textContent = `[${index + 1}] ❓ Если ${cond.left} ${cond.operator} ${cond.right}`;
                blockEl.style.borderLeft = '5px solid #f39c12';
                
                const addInsideBtn = document.createElement('button');
                addInsideBtn.textContent = '➕ Внутрь';
                addInsideBtn.style.marginLeft = '10px';
                addInsideBtn.style.background = '#27ae60';
                addInsideBtn.style.color = 'white';
                addInsideBtn.style.border = 'none';
                addInsideBtn.style.padding = '5px 10px';
                addInsideBtn.style.borderRadius = '3px';
                addInsideBtn.style.cursor = 'pointer';
                addInsideBtn.onclick = () => {
                    activeIfBlock = block;
                    log(`📝 Добавляем блоки внутрь IF: ${cond.left} ${cond.operator} ${cond.right}`);
                    log(`💡 Нажмите на кнопку добавления блока (переменная, математика, вывод)`);
                };
                blockEl.appendChild(addInsideBtn);
                
                if (block.thenBlocks && block.thenBlocks.length > 0) {
                    const nestedContainer = document.createElement('div');
                    nestedContainer.style.borderLeft = '2px dashed #ccc';
                    nestedContainer.style.marginLeft = '20px';
                    nestedContainer.style.marginTop = '5px';
                    nestedContainer.style.paddingLeft = '10px';
                    renderBlockList(block.thenBlocks, nestedContainer, indent + 1);
                    blockEl.appendChild(nestedContainer);
                }
            }
            
            const deleteBtn = document.createElement('button');
            deleteBtn.textContent = '❌';
            deleteBtn.style.float = 'right';
            deleteBtn.onclick = () => {
                if (activeIfBlock && activeIfBlock.thenBlocks.includes(block)) {
                    const idx = activeIfBlock.thenBlocks.indexOf(block);
                    activeIfBlock.thenBlocks.splice(idx, 1);
                } else {
                    const idx = program.indexOf(block);
                    if (idx !== -1) program.splice(idx, 1);
                }
                renderBlocks();
            };
            blockEl.appendChild(deleteBtn);
            
            container.appendChild(blockEl);
        });
    }
    
    renderBlockList(program, blocksContainer, 0);
}


function createPrintBlock() {
    const varName = prompt('Какую переменную вывести?', 'результат');
    if (varName) {
        const block = {
            id: Date.now(),
            type: 'вывод',
            variable: varName
        };
        
        // Добавляем в активный IF или в основную программу
        if (activeIfBlock) {
            activeIfBlock.thenBlocks.push(block);
            log(`Добавлен вывод ${varName} внутрь IF`);
        } else {
            program.push(block);
            log(`Добавлен вывод: ${varName}`);
        }
        
        renderBlocks();
    }
}

// === Выйти из режима добавления в IF ===
function exitIfMode() {
    if (activeIfBlock) {
        const cond = activeIfBlock.condition;
        log(`✅ Выход из IF: ${cond.left} ${cond.operator} ${cond.right}`);
        activeIfBlock = null;
    } else {
        log(`ℹ️ Сейчас не выбран IF для добавления блоков`);
    }
}

// === Создание блока IF ===
function createIfBlock() {
    const left = prompt('Левая часть условия (число или имя переменной):', 'x');
    const operator = prompt('Оператор (>, <, ==, !=, >=, <=):', '>');
    const right = prompt('Правая часть условия (число или имя переменной):', '0');
    
    if (left && operator && right) {
        const block = {
            id: Date.now(),
            type: 'если',
            condition: {
                left: left,
                operator: operator,
                right: right
            },
            thenBlocks: []
        };
        program.push(block);
        renderBlocks();
        log(`Добавлено условие: ${left} ${operator} ${right}`);
    }
}

// === Парсер математических выражений со скобками ===
function evaluateExpression(expr) {
    expr = expr.replace(/\s/g, '');
    
    expr = expr.replace(/сложение/g, '+');
    expr = expr.replace(/вычитание/g, '-');
    expr = expr.replace(/умножение/g, '*');
    expr = expr.replace(/деление/g, '/');
    expr = expr.replace(/×/g, '*');
    expr = expr.replace(/÷/g, '/');
    
    return calculate(expr);
}

function calculate(expr) {
    expr = expr.replace(/\s/g, '');
    
    while (expr.includes('(')) {
        const match = expr.match(/\([^()]+\)/);
        if (match) {
            const innerExpr = match[0].slice(1, -1);
            const result = calculateSimple(innerExpr);
            expr = expr.replace(match[0], result);
        }
    }
    
    return calculateSimple(expr);
}
function calculateSimple(expr) {
    expr = expr.replace(/\s/g, '');
    
    const mulDivRegex = /(-?\d+\.?\d*)\s*([×*÷/])\s*(-?\d+\.?\d*)/;
    let match;
    
    while ((match = mulDivRegex.exec(expr)) !== null) {
        const left = parseFloat(match[1]);
        const op = match[2];
        const right = parseFloat(match[3]);
        
        let result;
        if (op === '*' || op === '×') {
            result = left * right;
        } else if (op === '/' || op === '÷') {
            result = Math.floor(left / right);
        }
        
        expr = expr.replace(match[0], result);
    }
    
    const addSubRegex = /(-?\d+\.?\d*)\s*([+-])\s*(-?\d+\.?\d*)/;
    while ((match = addSubRegex.exec(expr)) !== null) {
        const left = parseFloat(match[1]);
        const op = match[2];
        const right = parseFloat(match[3]);
        
        const result = op === '+' ? left + right : left - right;
        expr = expr.replace(match[0], result);
    }
    
    return parseFloat(expr);
}

// === Проверка условия IF ===
function checkCondition(condition) {
    let leftVal = parseFloat(condition.left);
    let rightVal = parseFloat(condition.right);
    
    if (isNaN(leftVal) && memory[condition.left] !== undefined) {
        leftVal = memory[condition.left];
    }
    if (isNaN(rightVal) && memory[condition.right] !== undefined) {
        rightVal = memory[condition.right];
    }
    
    if (isNaN(leftVal) || isNaN(rightVal)) {
        log(`❌ Ошибка: не удалось получить значения для условия`);
        return false;
    }
    
    switch (condition.operator) {
        case '>':  return leftVal > rightVal;
        case '<':  return leftVal < rightVal;
        case '==': return leftVal == rightVal;
        case '!=': return leftVal != rightVal;
        case '>=': return leftVal >= rightVal;
        case '<=': return leftVal <= rightVal;
        default:
            log(`❌ Неизвестный оператор: ${condition.operator}`);
            return false;
    }
}

// === Выполнение одного блока ===
function executeBlock(block) {
    if (block.type === 'переменная') {
        memory[block.name] = block.value;
        log(`Создана переменная ${block.name} = ${block.value}`);
    } 
    else if (block.type === 'математика') {
        try {
            const result = evaluateExpression(block.expression);
        
            if (block.resultVar) {
                memory[block.resultVar] = result;
                log(`${block.resultVar} = ${result}`);
        } else {
            log(`Результат: ${result}`);
        }
    } catch (error) {
        log(`❌ Ошибка в выражении "${block.expression}": ${error.message}`);
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
    else if (block.type === 'если') {
        const conditionTrue = checkCondition(block.condition);
    
        if (conditionTrue) {
            log(`✅ Условие истинно: выполняем блоки внутри IF`);
        
            for (let i = 0; i < block.thenBlocks.length; i++) {
                executeBlock(block.thenBlocks[i]);
            }
    } else {
        log(`⏭️ Условие ложно: пропускаем блоки внутри IF`);
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
        
        renderBlocks();
    }
});

console.log('Drag-and-Drop активирован! 🎯');

// === Обработчики кнопок ===
addVariableBtn.addEventListener('click', createVariableBlock);
addMathBtn.addEventListener('click', createMathBlock);
runBtn.addEventListener('click', runProgram);
addPrintBtn.addEventListener('click', createPrintBlock);
addIfBtn.addEventListener('click', createIfBlock);

// === Приветствие ===
log('Добро пожаловать! Добавьте блоки и нажмите "Запустить"');