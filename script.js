// === Хранилище данных ===
let program = [];
let memory = {};
let activeIfBlock = null;
let activeElseMode = false;

// === Элементы DOM ===
const blocksContainer = document.getElementById('blocks-container');
const consoleOutput = document.getElementById('console-output');
const addVariableBtn = document.getElementById('add-variable');
const addMathBtn = document.getElementById('add-math');
const runBtn = document.getElementById('run');
const addPrintBtn = document.getElementById('add-print');
const addIfBtn = document.getElementById('add-if');
const exitIfBtn = document.getElementById('exit-if');

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
        
        if (activeIfBlock) {
            if (activeElseMode) {
                activeIfBlock.elseBlocks.push(block);
                log(`Добавлена переменная ${name} в ELSE`);
            } else {
                activeIfBlock.thenBlocks.push(block);
                log(`Добавлена переменная ${name} в IF`);
            }
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
        
        if (activeIfBlock) {
            if (activeElseMode) {
                activeIfBlock.elseBlocks.push(block);
                log(`Добавлено выражение ${expression} в ELSE`);
            } else {
                activeIfBlock.thenBlocks.push(block);
                log(`Добавлено выражение ${expression} в IF`);
            }
        } else {
            program.push(block);
            log(`Добавлено выражение: ${expression} → ${resultVar}`);
        }
        
        renderBlocks();
    }
}

// === Создание блока вывода ===
function createPrintBlock() {
    const varName = prompt('Какую переменную вывести?', 'результат');
    if (varName) {
        const block = {
            id: Date.now(),
            type: 'вывод',
            variable: varName
        };
        
        if (activeIfBlock) {
            if (activeElseMode) {
                activeIfBlock.elseBlocks.push(block);
                log(`Добавлен вывод ${varName} в ELSE`);
            } else {
                activeIfBlock.thenBlocks.push(block);
                log(`Добавлен вывод ${varName} в IF`);
            }
        } else {
            program.push(block);
            log(`Добавлен вывод: ${varName}`);
        }
        
        renderBlocks();
    }
}

// === Выйти из режима добавления в IF/ELSE ===
function exitIfMode() {
    if (activeIfBlock) {
        const cond = activeIfBlock.condition;
        const mode = activeElseMode ? 'ELSE' : 'IF';
        log(`✅ Выход из ${mode}: ${cond.left} ${cond.operator} ${cond.right}`);
        activeIfBlock = null;
        activeElseMode = false;
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
            thenBlocks: [],
            elseBlocks: []
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
        
        if (!match) {
            throw new Error('Непарные скобки в выражении');
        }
        
        const innerExpr = match[0].slice(1, -1);
        const result = calculateSimple(innerExpr);
        expr = expr.replace(match[0], result);
    }
    
    return calculateSimple(expr);
}

function calculateSimple(expr) {
    expr = expr.replace(/\s/g, '');
    
    // Умножение и деление
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
    
    // Сложение и вычитание
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
    try {
        if (block.type === 'переменная') {
            memory[block.name] = block.value;
            log(`Создана переменная ${block.name} = ${block.value}`);
        } 
        else if (block.type === 'математика') {
            const result = evaluateExpression(block.expression);
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
                throw new Error(`Переменная "${block.variable}" не найдена!`);
            }
        }
        else if (block.type === 'если') {
            const conditionTrue = checkCondition(block.condition);
            if (conditionTrue) {
                log(`✅ Условие истинно: выполняем блоки IF`);
                for (let i = 0; i < block.thenBlocks.length; i++) {
                    executeBlock(block.thenBlocks[i]);
                }
            } else {
                log(`❌ Условие ложно: выполняем блоки ELSE`);
                for (let i = 0; i < block.elseBlocks.length; i++) {
                    executeBlock(block.elseBlocks[i]);
                }
            }
        }
    } catch (error) {
        block.error = error.message;
        log(`❌ Ошибка в блоке: ${error.message}`);
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
            
            if (block.error) {
                blockEl.classList.add('block-error');
            }
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
                
                // Кнопка "В IF"
                const addThenBtn = document.createElement('button');
                addThenBtn.textContent = '➕ В IF';
                addThenBtn.style.marginLeft = '10px';
                addThenBtn.style.background = '#27ae60';
                addThenBtn.style.color = 'white';
                addThenBtn.style.border = 'none';
                addThenBtn.style.padding = '5px 10px';
                addThenBtn.style.borderRadius = '3px';
                addThenBtn.style.cursor = 'pointer';
                addThenBtn.onclick = () => {
                    activeIfBlock = block;
                    activeElseMode = false;
                    log(`📝 Добавляем блоки в IF: ${cond.left} ${cond.operator} ${cond.right}`);
                };
                blockEl.appendChild(addThenBtn);
                
                // Кнопка "В ELSE"
                const addElseBtn = document.createElement('button');
                addElseBtn.textContent = '➕ В ELSE';
                addElseBtn.style.marginLeft = '5px';
                addElseBtn.style.background = '#e67e22';
                addElseBtn.style.color = 'white';
                addElseBtn.style.border = 'none';
                addElseBtn.style.padding = '5px 10px';
                addElseBtn.style.borderRadius = '3px';
                addElseBtn.style.cursor = 'pointer';
                addElseBtn.onclick = () => {
                    activeIfBlock = block;
                    activeElseMode = true;
                    log(`📝 Добавляем блоки в ELSE: ${cond.left} ${cond.operator} ${cond.right}`);
                };
                blockEl.appendChild(addElseBtn);
                
                // Отрисовка thenBlocks
                if (block.thenBlocks && block.thenBlocks.length > 0) {
                    const thenContainer = document.createElement('div');
                    thenContainer.style.borderLeft = '2px solid #27ae60';
                    thenContainer.style.marginLeft = '20px';
                    thenContainer.style.marginTop = '5px';
                    thenContainer.style.paddingLeft = '10px';
                    thenContainer.style.background = '#e8f8f0';
                    const thenLabel = document.createElement('div');
                    thenLabel.textContent = '✅ ТО:';
                    thenLabel.style.fontWeight = 'bold';
                    thenLabel.style.color = '#27ae60';
                    thenContainer.appendChild(thenLabel);
                    renderBlockList(block.thenBlocks, thenContainer, indent + 1);
                    blockEl.appendChild(thenContainer);
                }
                
                // Отрисовка elseBlocks
                if (block.elseBlocks && block.elseBlocks.length > 0) {
                    const elseContainer = document.createElement('div');
                    elseContainer.style.borderLeft = '2px solid #e67e22';
                    elseContainer.style.marginLeft = '20px';
                    elseContainer.style.marginTop = '5px';
                    elseContainer.style.paddingLeft = '10px';
                    elseContainer.style.background = '#fef5e7';
                    const elseLabel = document.createElement('div');
                    elseLabel.textContent = '❌ ИНАЧЕ:';
                    elseLabel.style.fontWeight = 'bold';
                    elseLabel.style.color = '#e67e22';
                    elseContainer.appendChild(elseLabel);
                    renderBlockList(block.elseBlocks, elseContainer, indent + 1);
                    blockEl.appendChild(elseContainer);
                }
            }
            if (block.error) {
                const errorDiv = document.createElement('div');
                errorDiv.className = 'block-error-message';
                errorDiv.textContent = `❌ ${block.error}`;
                blockEl.appendChild(errorDiv);
            }
            
            // Кнопка удаления
            const deleteBtn = document.createElement('button');
            deleteBtn.textContent = '❌';
            deleteBtn.style.float = 'right';
            deleteBtn.onclick = (e) => {
                e.stopPropagation();
                let idx = program.indexOf(block);
                if (idx !== -1) {
                    program.splice(idx, 1);
                    renderBlocks();
                    return;
                }
                program.forEach(b => {
                    if (b.type === 'если') {
                        idx = b.thenBlocks.indexOf(block);
                        if (idx !== -1) b.thenBlocks.splice(idx, 1);
                        idx = b.elseBlocks.indexOf(block);
                        if (idx !== -1) b.elseBlocks.splice(idx, 1);
                    }
                });
                renderBlocks();
            };
            blockEl.appendChild(deleteBtn);
            
            container.appendChild(blockEl);
        });
    }
    
    renderBlockList(program, blocksContainer, 0);
}

// === Запуск программы ===
function runProgram() {
    memory = {};
    consoleOutput.innerHTML = '';
    clearErrors();
    log('=== Запуск программы ===');
    
    for (let i = 0; i < program.length; i++) {
        executeBlock(program[i]);
    }
    
    log('=== Готово ===');
    log(`Итоговые переменные: ${JSON.stringify(memory)}`);
}

// === Очистить все ошибки ===
function clearErrors() {
    program.forEach(block => {
        block.error = null;
        if (block.thenBlocks) {
            block.thenBlocks.forEach(b => b.error = null);
        }
        if (block.elseBlocks) {
            block.elseBlocks.forEach(b => b.error = null);
        }
    });
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
exitIfBtn.addEventListener('click', exitIfMode);

log('Добро пожаловать! Добавьте блоки и нажмите "Запустить"');