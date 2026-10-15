"use strict";

/**
 * Student Task Manager - class-based version
 * One TaskManager class owns the data, the saving, and the drawing.
 * Same HTML IDs and localStorage keys as before, so it is a drop-in replacement.
 */
(() => {
    const KEY = { tasks: "stm.tasks.v2", theme: "stm.theme", ui: "stm.ui" };
    const RANK = { high: 0, medium: 1, low: 2 };
    const byId = (id) => document.getElementById(id);
    const FAR = "9999-12-31";

    // Escape text before putting it inside an HTML string
    const esc = (s) =>
        String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

    const load = (key, fallback) => {
        try {
            const raw = localStorage.getItem(key);
            return raw ? JSON.parse(raw) : fallback;
        } catch {
            return fallback;
        }
    };
    const save = (key, value) => {
        try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* storage full or blocked */ }
    };

    const newId = () =>
        crypto.randomUUID ? crypto.randomUUID() : Date.now() + "-" + Math.random().toString(16).slice(2);

    // Local-date helpers (avoids the UTC off-by-one bug)
    const todayStr = () => {
        const d = new Date();
        const pad = (n) => String(n).padStart(2, "0");
        return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
    };
    const daysLeft = (iso) => Math.round((new Date(iso + "T00:00:00") - new Date(todayStr() + "T00:00:00")) / 86400000);

    // Clean any task-like object into a safe task (or null if unusable)
    const clean = (raw) => {
        if (!raw || typeof raw.title !== "string" || !raw.title.trim()) return null;
        return {
            id: typeof raw.id === "string" ? raw.id : newId(),
            title: raw.title.trim().slice(0, 120),
            subject: String(raw.subject || "").trim().slice(0, 40),
            due: /^\d{4}-\d{2}-\d{2}$/.test(raw.due) ? raw.due : "",
            priority: raw.priority in RANK ? raw.priority : "medium",
            done: Boolean(raw.done),
            createdAt: Number(raw.createdAt) || Date.now(),
        };
    };

    class TaskManager {
        tasks = load(KEY.tasks, []).map(clean).filter(Boolean);
        filter = "all";
        sort = "due";
        query = "";
        toastTimer = null;

        constructor() {
            const ui = load(KEY.ui, {});
            if (["all", "active", "completed"].includes(ui.filter)) this.filter = ui.filter;
            if (["due", "priority", "newest"].includes(ui.sort)) this.sort = ui.sort;

            this.setTheme(load(KEY.theme, matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"));
            byId("todayLabel").textContent = new Date().toLocaleDateString(undefined, {
                weekday: "long", day: "numeric", month: "long",
            });
            this.listen();
            this.render();
        }

        /* ---------- data changes ---------- */
        // Every change goes through here: update, save, redraw
        change(nextTasks, message, undoable = true) {
            const previous = this.tasks;
            this.tasks = nextTasks;
            save(KEY.tasks, this.tasks);
            this.render();
            if (message) this.toast(message, undoable ? () => this.change(previous) : null);
        }

        addTask(data) {
            const task = clean({ ...data, id: newId(), done: false, createdAt: Date.now() });
            if (task) this.change([task, ...this.tasks]);
        }

        editTask(id, data) {
            this.change(
                this.tasks.map((t) => (t.id === id ? clean({ ...t, ...data }) || t : t)),
                "Changes saved", false
            );
        }

        toggleTask(id) {
            this.change(this.tasks.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));
        }

        deleteTask(id) {
            this.change(this.tasks.filter((t) => t.id !== id), "Task deleted");
        }

        clearDone() {
            const n = this.tasks.filter((t) => t.done).length;
            if (n) this.change(this.tasks.filter((t) => !t.done), `${n} completed ${n === 1 ? "task" : "tasks"} cleared`);
        }

        saveView() {
            save(KEY.ui, { filter: this.filter, sort: this.sort });
            this.render();
        }

        /* ---------- derived data ---------- */
        overdue(t) { return !t.done && t.due && t.due < todayStr(); }

        visibleTasks() {
            const q = this.query.trim().toLowerCase();
            const sorters = {
                due: (a, b) => (a.due || FAR).localeCompare(b.due || FAR) || RANK[a.priority] - RANK[b.priority],
                priority: (a, b) => RANK[a.priority] - RANK[b.priority] || (a.due || FAR).localeCompare(b.due || FAR),
                newest: (a, b) => b.createdAt - a.createdAt,
            };
            return this.tasks
                .filter((t) => {
                    if (this.filter === "active" && t.done) return false;
                    if (this.filter === "completed" && !t.done) return false;
                    return !q || t.title.toLowerCase().includes(q) || t.subject.toLowerCase().includes(q);
                })
                .sort((a, b) => Number(a.done) - Number(b.done) || sorters[this.sort](a, b));
        }

        dueText(t) {
            if (!t.due) return "";
            const n = daysLeft(t.due);
            let text, tone = "";
            if (n === 0) text = "Due today";
            else if (n === 1) text = "Due tomorrow";
            else if (n === -1) text = "1 day overdue";
            else if (n < 0) text = `${-n} days overdue`;
            else text = `Due in ${n} days`;
            if (!t.done && n < 0) tone = "overdue";
            else if (!t.done && n <= 2) tone = "soon";
            return `<span class="chip ${tone}">${text}</span>`;
        }

        /* ---------- drawing ---------- */
        render() {
            const total = this.tasks.length;
            const done = this.tasks.filter((t) => t.done).length;
            const pending = total - done;
            const percent = total ? Math.round((done / total) * 100) : 0;

            byId("totalTasks").textContent = total;
            byId("completedTasks").textContent = done;
            byId("pendingTasks").textContent = pending;
            byId("overdueTasks").textContent = this.tasks.filter((t) => this.overdue(t)).length;
            byId("progressFill").style.width = percent + "%";
            byId("progressBar").setAttribute("aria-valuenow", percent);
            byId("progressText").textContent = `${percent}% done`;
            byId("tasksLeft").textContent = `${pending} ${pending === 1 ? "task" : "tasks"} left`;
            byId("clearCompleted").disabled = done === 0;

            const counts = { all: total, active: pending, completed: done };
            document.querySelectorAll("#filters button").forEach((b) => {
                b.setAttribute("aria-pressed", String(b.dataset.filter === this.filter));
                b.querySelector(".count").textContent = counts[b.dataset.filter];
            });
            byId("sortSelect").value = this.sort;

            const subjects = [...new Set(this.tasks.map((t) => t.subject).filter(Boolean))].sort();
            byId("subjectList").innerHTML = subjects.map((s) => `<option value="${esc(s)}"></option>`).join("");

            const list = this.visibleTasks();
            byId("taskList").innerHTML = list.map((t) => this.rowHTML(t)).join("");
            const empty = byId("emptyMessage");
            empty.hidden = list.length > 0;
            empty.textContent = total ? "No tasks match your search or filter." : "No tasks yet. Add your first task above.";
        }

        rowHTML(t) {
            const label = esc(t.title);
            const priority = t.priority[0].toUpperCase() + t.priority.slice(1);
            return `
<li class="task${t.done ? " done" : ""}" data-id="${esc(t.id)}" data-priority="${t.priority}">
  <input type="checkbox" data-action="toggle" ${t.done ? "checked" : ""}
         aria-label="Mark &quot;${label}&quot; as ${t.done ? "not done" : "done"}">
  <div>
    <div class="task-title">${label}</div>
    <div class="meta">
      <span class="chip">${priority}</span>
      ${t.subject ? `<span class="chip">${esc(t.subject)}</span>` : ""}
      ${this.dueText(t)}
    </div>
  </div>
  <div class="row-actions">
    <button type="button" class="edit" data-action="edit" aria-label="Edit &quot;${label}&quot;">Edit</button>
    <button type="button" class="delete" data-action="delete" aria-label="Delete &quot;${label}&quot;">Delete</button>
  </div>
</li>`;
        }

        /* ---------- form ---------- */
        fillForm(task) {
            const editing = Boolean(task);
            byId("taskId").value = editing ? task.id : "";
            byId("taskInput").value = editing ? task.title : "";
            byId("subjectInput").value = editing ? task.subject : "";
            byId("dueInput").value = editing ? task.due : "";
            byId("priorityInput").value = editing ? task.priority : "medium";
            byId("submitBtn").textContent = editing ? "Save changes" : "Add task";
            byId("cancelEdit").hidden = !editing;
            byId("taskForm").classList.toggle("editing", editing);
            byId("formError").hidden = true;
            byId("taskInput").focus();
        }

        /* ---------- toast ---------- */
        toast(text, onUndo) {
            clearTimeout(this.toastTimer);
            byId("toastText").textContent = text;
            const undoBtn = byId("toastUndo");
            undoBtn.hidden = !onUndo;
            undoBtn.onclick = () => { if (onUndo) onUndo(); this.hideToast(); };
            byId("toast").hidden = false;
            this.toastTimer = setTimeout(() => this.hideToast(), 6000);
        }
        hideToast() { byId("toast").hidden = true; }

        /* ---------- theme ---------- */
        setTheme(theme) {
            document.documentElement.dataset.theme = theme;
            byId("themeToggle").textContent = theme === "dark" ? "Light mode" : "Dark mode";
            byId("themeToggle").setAttribute("aria-pressed", String(theme === "dark"));
            save(KEY.theme, theme);
        }

        /* ---------- import / export ---------- */
        exportFile() {
            const blob = new Blob([JSON.stringify(this.tasks, null, 2)], { type: "application/json" });
            const link = document.createElement("a");
            link.href = URL.createObjectURL(blob);
            link.download = `tasks-${todayStr()}.json`;
            link.click();
            URL.revokeObjectURL(link.href);
        }

        async importFile(file) {
            if (!file) return;
            try {
                const data = JSON.parse(await file.text());
                if (!Array.isArray(data)) throw new Error("Not an array");
                const known = new Set(this.tasks.map((t) => t.id));
                const fresh = data.map(clean).filter((t) => t && !known.has(t.id));
                this.change([...fresh, ...this.tasks], `Imported ${fresh.length} ${fresh.length === 1 ? "task" : "tasks"}`);
            } catch {
                this.toast("Import failed. Choose a JSON file exported from this app.");
            }
            byId("importFile").value = "";
        }

        /* ---------- events ---------- */
        listen() {
            byId("taskForm").addEventListener("submit", (e) => {
                e.preventDefault();
                const data = {
                    title: byId("taskInput").value,
                    subject: byId("subjectInput").value,
                    due: byId("dueInput").value,
                    priority: byId("priorityInput").value,
                };
                if (!data.title.trim()) {
                    byId("formError").textContent = "Enter a task name to continue.";
                    byId("formError").hidden = false;
                    byId("taskInput").focus();
                    return;
                }
                const id = byId("taskId").value;
                id ? this.editTask(id, data) : this.addTask(data);
                this.fillForm(null);
            });

            byId("cancelEdit").addEventListener("click", () => this.fillForm(null));

            byId("taskList").addEventListener("click", (e) => {
                const btn = e.target.closest("[data-action]");
                const row = e.target.closest(".task");
                if (!btn || !row) return;
                const id = row.dataset.id;
                const action = btn.dataset.action;
                if (action === "toggle") this.toggleTask(id);
                else if (action === "delete") this.deleteTask(id);
                else if (action === "edit") this.fillForm(this.tasks.find((t) => t.id === id));
            });

            byId("clearCompleted").addEventListener("click", () => this.clearDone());

            byId("filters").addEventListener("click", (e) => {
                const b = e.target.closest("[data-filter]");
                if (b) { this.filter = b.dataset.filter; this.saveView(); }
            });

            byId("sortSelect").addEventListener("change", (e) => { this.sort = e.target.value; this.saveView(); });

            let timer;
            byId("searchInput").addEventListener("input", (e) => {
                clearTimeout(timer);
                timer = setTimeout(() => { this.query = e.target.value; this.render(); }, 150);
            });

            byId("themeToggle").addEventListener("click", () =>
                this.setTheme(document.documentElement.dataset.theme === "dark" ? "light" : "dark"));

            byId("exportBtn").addEventListener("click", () => this.exportFile());
            byId("importBtn").addEventListener("click", () => byId("importFile").click());
            byId("importFile").addEventListener("change", (e) => this.importFile(e.target.files[0]));

            document.addEventListener("keydown", (e) => {
                const typing = /^(INPUT|SELECT|TEXTAREA)$/.test(document.activeElement.tagName);
                if (e.key === "/" && !typing) { e.preventDefault(); byId("searchInput").focus(); }
                if (e.key === "Escape") {
                    if (byId("taskId").value) this.fillForm(null);
                    this.hideToast();
                }
            });
        }
    }

    new TaskManager();
})();
