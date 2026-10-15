/* ===== Student Task Manager — Modern UI ===== */

* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

:root {
    --primary: #635bff;
    --primary-dark: #4f46e5;
    --background: #f4f6fc;
    --surface: #ffffff;
    --text: #182230;
    --muted: #667085;
    --border: #e4e7ec;
    --success: #12b76a;
    --shadow: 0 8px 30px rgba(16, 24, 40, 0.07);
}

body {
    font-family: "Segoe UI", Arial, sans-serif;
    background: var(--background);
    color: var(--text);
    min-height: 100vh;
    line-height: 1.6;
    transition: background 0.3s ease;
}

/* Main content container */
.container {
    width: min(92%, 1000px);
    margin: 45px auto;
    padding: 30px;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 22px;
    box-shadow: var(--shadow);
}

/* Headings */
h1 {
    font-size: clamp(28px, 4vw, 38px);
    font-weight: 800;
    letter-spacing: -1.2px;
    margin-bottom: 8px;
    color: var(--text);
}

h2 {
    font-size: 22px;
    margin: 26px 0 16px;
    font-weight: 700;
}

/* Description text */
p {
    color: var(--muted);
}

/* Input fields */
input,
textarea,
select {
    width: 100%;
    padding: 13px 15px;
    margin: 8px 0;
    border: 1px solid var(--border);
    border-radius: 11px;
    background: #fff;
    color: var(--text);
    font: inherit;
    outline: none;
    transition: border-color 0.2s, box-shadow 0.2s;
}

input:focus,
textarea:focus,
select:focus {
    border-color: var(--primary);
    box-shadow: 0 0 0 4px rgba(99, 91, 255, 0.12);
}

/* Buttons */
button {
    padding: 12px 20px;
    border: none;
    border-radius: 11px;
    background: var(--primary);
    color: white;
    font-size: 15px;
    font-weight: 700;
    cursor: pointer;
    transition: transform 0.2s, background 0.2s, box-shadow 0.2s;
}

button:hover {
    background: var(--primary-dark);
    transform: translateY(-2px);
    box-shadow: 0 6px 15px rgba(99, 91, 255, 0.25);
}

button:active {
    transform: translateY(0);
}

/* Task cards and list items */
.task,
.task-item,
li {
    transition: transform 0.2s, box-shadow 0.2s;
}

.task,
.task-item {
    padding: 16px 18px;
    margin: 12px 0;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 14px;
}

.task:hover,
.task-item:hover {
    transform: translateY(-3px);
    box-shadow: var(--shadow);
    border-color: #c7c4ff;
}

/* Task lists */
ul {
    list-style: none;
}

li {
    margin-bottom: 8px;
}

/* Completed tasks */
.completed,
.task.completed {
    opacity: 0.7;
    text-decoration: line-through;
    border-left: 4px solid var(--success);
}

/* Status labels */
.status,
.badge {
    display: inline-block;
    padding: 4px 10px;
    border-radius: 20px;
    background: #eeecff;
    color: var(--primary-dark);
    font-size: 12px;
    font-weight: 700;
}

/* Links */
a {
    color: var(--primary);
    text-decoration: none;
    transition: color 0.2s;
}

a:hover {
    color: var(--primary-dark);
    text-decoration: underline;
}

/* Mobile responsive layout */
@media (max-width: 600px) {
    .container {
        width: 94%;
        margin: 20px auto;
        padding: 18px;
        border-radius: 16px;
    }

    h1 {
        font-size: 28px;
    }

    button {
        width: 100%;
        margin-top: 8px;
    }
}
