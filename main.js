var toDoData = {
    outstanding: [],
    completed: [],
    taskCounter: 0
}; // Exposing to dev tools
var debug = false; // Enable debug mode in console for verbose logging
var mode = '';
function log(message, debug=false) {
    if (debug) {
        console.log(`%c[debug] ${message}`, 'color: yellow;')
    }
}

function handleOnClick(section) {
    log(`Section clicked: ${section.dataset.section}`, debug=debug)
    const sections = document.querySelectorAll('.section');
    sections.forEach(s => {
        if (s.dataset.section === section.dataset.section) {
            s.classList.toggle('active', true);
            s.classList.toggle('hidden', false);
        } else {
            s.classList.toggle('hidden', true);
            s.classList.toggle('active', false);
        }
    })
    mode = section;
}

function showMessage(message, success=true) {
    const alert = document.getElementById('alert');
    alert.innerHTML = `<p>${message}</p><br />
                    <p style="color:gray">
                        (click to dismiss)
                    </p>`;
    alert.onclick = () => {
        alert.classList.remove('error');
        alert.classList.remove('success');
        log(`message dismissed`, debug=debug)
    }

    if (success) {
        alert.classList.toggle('error', false);
        alert.classList.toggle('success', true);
    } else {
        alert.classList.toggle('error', true);
        alert.classList.toggle('success', false);
    }
}

function createRow(entry) {
    const row = document.createElement('tr');
    function appendChild(key) {
        const ele = document.createElement('td');
        ele.innerText = entry[key];
        row.appendChild(ele)
    }
    ['id', 'todo', 'priority', 'date'].forEach(d => {
        appendChild(d)
    })
    return row
}

function populateFinishDropdown() {
    const form = document.getElementById('completeForm');
    const selections = toDoData.outstanding.map(entry => {
        const ele = document.createElement('option');
        ele.value = entry.id;
        ele.innerText = `${entry.id} - ${entry.todo} - ${entry.date}`;
        return ele
    })
    form.replaceChildren(...selections);
    log('Dropdowns populated', debug=debug)
}

function markComplete() {
    const form = document.getElementById('completeForm');
    if (form.value !== null && form.value !== undefined) {
        const matchEntry = toDoData.outstanding.filter(entry => {
            return entry.id === parseInt(form.value);
        });

        toDoData.completed.push(matchEntry[0]);
        toDoData.outstanding = toDoData.outstanding.filter(entry => {
            return entry.id !== parseInt(form.value);
        });
        localStorage.setItem('todos', JSON.stringify(toDoData));
        showMessage("Successfully marked complete!")
        log(
            `Entry serial ${form.value} was marked complete`,
            debug=debug
        )
        renderTables();
    }
}
function renderTables() {
    const outstandingTable = document.getElementById('outstandingTable');
    const outstandingRows = toDoData.outstanding.map(entry => {
        return createRow(entry)
    })
    const outstandingBody = outstandingTable.querySelector('tbody');
    outstandingBody.replaceChildren(...outstandingRows);

    const completedTable = document.getElementById('completedTable');
    const completedRows = toDoData.completed.map(entry => {
        return createRow(entry)
    })
    const completedBody = completedTable.querySelector('tbody');
    completedBody.replaceChildren(...completedRows);
    log(`Tables rerendered`, debug=debug)
    populateFinishDropdown();
}

function getFormData() {
    if (toDoData.outstanding.length >= 10) {
        showMessage('Outstanding Tasks Full', success=false);
        return
    }
    const todo = document.getElementById('todo')?.value;
    const priority = document.getElementById('priority').value;
    const date = document.getElementById('date')?.value;
    if (!todo || !priority || !date) {
        return showMessage(
            'Some values are missing. Please provide valid values',
            success=false
        )
    }

    const parsedTime = (Date.parse(date+'+08:00') / 1000) + 1800;
    var t = new Date('1970-01-01T00:00:00.000+00:00'); // Epoch
    t.setSeconds(parsedTime);
    toDoData.outstanding.push({
        id: toDoData.taskCounter,
        todo,
        priority,
        date: t.toLocaleString()
    })
    toDoData.taskCounter++;
    showMessage('Added successfully!');

    localStorage.setItem('todos', JSON.stringify(toDoData));
    renderTables();
}

window.onload = function() {
    const toDos = localStorage.getItem('todos');
    if (toDos !== null) {
        toDoData = JSON.parse(toDos);
        renderTables();
    }
}