let tasks = [];

function addTask() {

    const input = document.getElementById("taskInput");
    const taskText = input.value.trim();

    if (taskText === "") {
        alert("Please enter a task.");
        return;
    }

    const task = {
        id: Date.now(),
        text: taskText,
        completed: false
    };

    tasks.push(task);

    input.value = "";

    displayTasks();
    updateStats();
}


function displayTasks() {

    const taskList = document.getElementById("taskList");
    const emptyMessage = document.getElementById("emptyMessage");

    taskList.innerHTML = "";

    if (tasks.length === 0) {
        emptyMessage.style.display = "block";
        return;
    }

    emptyMessage.style.display = "none";

    tasks.forEach(function(task) {

        const li = document.createElement("li");

        li.className = "task";

        if (task.completed) {
            li.classList.add("completed");
        }

        li.innerHTML = `
            <div class="task-left">
                <input
                    type="checkbox"
                    ${task.completed ? "checked" : ""}
                    onchange="toggleTask(${task.id})"
                >

                <span>${task.text}</span>
            </div>

            <button
                class="delete-btn"
                onclick="deleteTask(${task.id})"
            >
                Delete
            </button>
        `;

        taskList.appendChild(li);
    });
}


function toggleTask(id) {

    tasks = tasks.map(function(task) {

        if (task.id === id) {
            task.completed = !task.completed;
        }

        return task;
    });

    displayTasks();
    updateStats();
}


function deleteTask(id) {

    tasks = tasks.filter(function(task) {
        return task.id !== id;
    });

    displayTasks();
    updateStats();
}


function updateStats() {

    const total = tasks.length;

    const completed = tasks.filter(function(task) {
        return task.completed;
    }).length;

    const pending = total - completed;

    document.getElementById("totalTasks").textContent = total;
    document.getElementById("completedTasks").textContent = completed;
    document.getElementById("pendingTasks").textContent = pending;
}


// Allow Enter key to add a task

document.getElementById("taskInput").addEventListener("keypress", function(event) {

    if (event.key === "Enter") {
        addTask();
    }

});