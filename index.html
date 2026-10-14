"use strict";

/**
 * Student Task Manager
 * Layered architecture:
 *   Storage     -> persistence (localStorage, safe parse, validation)
 *   Store       -> single source of truth + subscribe/notify
 *   Selectors   -> pure functions that derive data from state
 *   View        -> DOM rendering only (no business logic)
 *   Controller  -> wires events to the Store
 */
(() => {
    const KEYS = { tasks: "stm.tasks.v2", theme: "stm.theme", ui: "stm.ui" };
    const PRIORITY_RANK = { high: 0, medium: 1, low: 2 };
    const $ = (id) => document.getElementById(id);

    /* ================= Storage ================= */
    const Storage = {
        read(key, fallback) {
            try {
                const raw = localStorage.getItem(key);
                return raw ? JSON.parse(raw) : fallback;
            } catch { return fallback; }
        },
        write(key, value) {
            try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* quota or private mode */ }
        },
    };

    /* ================= Model ================= */
    const uid = () => (crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`);

    const sanitize = (t) => {
        if (!t || typeof t.title !== "string" || !t.title.trim()) return null;
        return {
            id: typeof t.id === "string" ? t.id : uid(),
            title: t.title.trim().slice(0, 120),
            subject: String(t.subject || "").trim().slice(0, 40),
            due: /^\d{4}-\d{2}-\d{2}$/.test(t.due) ? t.due : "",
            priority: t.priority in PRIORITY_RANK ? t.priority : "medium",
            done: Boolean(t.done),
            createdAt: Number(t.createdAt) || Date.now(),
        };
    };

    /* ================= Store ================= */
    const Store = (() => {
        let state = {
            tasks: Storage.read(KEYS.tasks, []).map(sanitize).filter(Boolean),
            ui: { filter: "all", sort: "due", query: "", editingId: null, ...Storage.read(KEYS.ui, {}) },
        };
        state.ui.query = "";
        state.ui.editingId = null;
        const listeners = new Set();

        const commit = (next) => {
            state = next;
            Storage.write(KEYS.tasks, state.tasks);
            Storage.write(KEYS.ui, { filter: state.ui.filter, sort: state.ui.sort });
            listeners.forEach((fn) => fn(state));
        };

        return {
            get: () => state,
            subscribe: (fn) => { listeners.add(fn); fn(state); },
            setTasks: (tasks) => commit({ ...state, tasks }),
            setUI: (patch) => commit({ ...state, ui: { ...state.ui, ...patch } }),
            add(data) {
                const task = sanitize({ ...data, id: uid(), done: false, createdAt: Date.now() });
                if (task) this.setTasks([task, ...state.tasks]);
            },
            update(id, data) {
                this.setTasks(state.tasks.map((t) => (t.id === id ? sanitize({ ...t, ...data }) || t : t)));
            },
            toggle(id) {
                this.setTasks(state.tasks.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));
            },
            remove(id) { this.setTasks(state.tasks.filter((t) => t.id !== id)); },
        };
    })();

    /* ================= Selectors ================= */
    const todayISO = () => {
        const d = new Date();
        return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
    };
    const daysUntil = (iso) => Math.round((new Date(iso + "T00:00:00") - new Date(todayISO() + "T00:00:00")) / 864e5);
    const isOverdue = (t) => !t.done && t.due && t.due < todayISO();

    const Selectors = {
        stats(tasks) {
            const total = tasks.length;
            const completed = tasks.filter((t) => t.done).length;
            return {
                total, completed,
                pending: total - completed,
                overdue: tasks.filter(isOverdue).length,
                percent: total ? Math.round((completed / total) * 100) : 0,
            };
        },
        visible({ tasks, ui }) {
            const q = ui.query.trim().toLowerCase();
            const list = tasks.filter((t) => {
                if (ui.filter === "active" && t.done) return false;
                if (ui.filter === "completed" && !t.done) return false;
                return !q || t.title.toLowerCase().includes(q) || t.subject.toLowerCase().includes(q);
            });
            const sorters = {
                due: (a, b) => (a.due || "9999").localeCompare(b.due || "9999") || PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority],
                priority: (a, b) => PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority] || (a.due || "9999").localeCompare(b.due || "9999"),
                newest: (a, b) => b.createdAt - a.createdAt,
            };
            return list.sort((a, b) => a.done - b.done || sorters[ui.sort](a, b));
        },
        subjects: (tasks) => [...new Set(tasks.map((t) => t.subject).filter(Boolean))].sort(),
        dueLabel(t) {
            if (!t.due) return null;
            const n = daysUntil(t.due);
            const text = n === 0 ? "Due today" : n === 1 ? "Due tomorrow" : n === -1 ? "1 day overdue" : n < 0 ? `${-n} days overdue` : `Due in ${n} days`;
            const tone = t.done ? "" : n < 0 ? "overdue" : n <= 2 ? "soon" : "";
            return { text, tone };
        },
    };

    /* ================= View ================= */
    const View = {
        el: {
            list: $("taskList"), empty: $("emptyMessage"), subjects: $("subjectList"),
            toast: $("toast"), toastText: $("toastText"), toastUndo: $("toastUndo"),
        },
        toastTimer: null,

        render(state) {
            const s = Selectors.stats(state.tasks);
            $("totalTasks").textContent = s.total;
            $("completedTasks").textContent = s.completed;
            $("pendingTasks").textContent = s.pending;
            $("overdueTasks").textContent = s.overdue;
            $("progressFill").style.width = s.percent + "%";
            $("progressBar").setAttribute("aria-valuenow", s.percent);
            $("progressText").textContent = `${s.percent}% done`;
            $("tasksLeft").textContent = `${s.pending} ${s.pending === 1 ? "task" : "tasks"} left`;
            $("clearCompleted").disabled = s.completed === 0;

            const counts = { all: s.total, active: s.pending, completed: s.completed };
            document.querySelectorAll("#filters button").forEach((b) => {
                b.setAttribute("aria-pressed", String(b.dataset.filter === state.ui.filter));
                b.querySelector(".count").textContent = counts[b.dataset.filter];
            });
            if ($("sortSelect").value !== state.ui.sort) $("sortSelect").value = state.ui.sort;

            this.el.subjects.replaceChildren(...Selectors.subjects(state.tasks).map((s) => new Option(s)));

            const visible = Selectors.visible(state);
            this.el.list.replaceChildren(...visible.map((t) => this.row(t)));
            this.el.empty.hidden = visible.length > 0;
            this.el.empty.textContent = state.tasks.length
                ? "No tasks match your search or filter."
                : "No tasks yet. Add your first task above.";
        },

        row(t) {
            const li = document.createElement("li");
            li.className = "task" + (t.done ? " done" : "");
            li.dataset.id = t.id;
            li.dataset.priority = t.priority;

            const check = document.createElement("input");
            check.type = "checkbox";
            check.checked = t.done;
            check.dataset.action = "toggle";
            check.setAttribute("aria-label", `Mark "${t.title}" as ${t.done ? "not done" : "done"}`);

            const body = document.createElement("div");
            const title = document.createElement("div");
            title.className = "task-title";
            title.textContent = t.title; // textContent -> no XSS
            const meta = document.createElement("div");
            meta.className = "meta";
            const chip = (text, tone = "") => {
                const c = document.createElement("span");
                c.className = "chip " + tone;
                c.textContent = text;
                return c;
            };
            meta.append(chip(t.priority[0].toUpperCase() + t.priority.slice(1)));
            if (t.subject) meta.append(chip(t.subject));
            const due = Selectors.dueLabel(t);
            if (due) meta.append(chip(due.text, due.tone));
            body.append(title, meta);

            const actions = document.createElement("div");
            actions.className = "row-actions";
            [["edit", "Edit"], ["delete", "Delete"]].forEach(([action, label]) => {
                const b = document.createElement("button");
                b.type = "button";
                b.className = action;
                b.dataset.action = action;
                b.textContent = label;
                b.setAttribute("aria-label", `${label} "${t.title}"`);
                actions.append(b);
            });

            li.append(check, body, actions);
            return li;
        },

        fillForm(task) {
            const editing = Boolean(task);
            $("taskId").value = editing ? task.id : "";
            $("taskInput").value = editing ? task.title : "";
            $("subjectInput").value = editing ? task.subject : "";
            $("dueInput").value = editing ? task.due : "";
            $("priorityInput").value = editing ? task.priority : "medium";
            $("submitBtn").textContent = editing ? "Save changes" : "Add task";
            $("cancelEdit").hidden = !editing;
            $("taskForm").classList.toggle("editing", editing);
            $("formError").hidden = true;
            $("taskInput").focus();
        },

        toast(text, onUndo) {
            clearTimeout(this.toastTimer);
            this.el.toastText.textContent = text;
            this.el.toastUndo.hidden = !onUndo;
            this.el.toastUndo.onclick = () => { onUndo(); this.hideToast(); };
            this.el.toast.hidden = false;
            this.toastTimer = setTimeout(() => this.hideToast(), 6000);
        },
        hideToast() { this.el.toast.hidden = true; },
    };

    /* ================= Controller ================= */
    const Controller = {
        init() {
            this.applyTheme(Storage.read(KEYS.theme, matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"));
            $("todayLabel").textContent = new Date().toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "long" });
            Store.subscribe((s) => View.render(s));
            this.bind();
        },

        applyTheme(theme) {
            document.documentElement.dataset.theme = theme;
            $("themeToggle").textContent = theme === "dark" ? "Light mode" : "Dark mode";
            $("themeToggle").setAttribute("aria-pressed", String(theme === "dark"));
            Storage.write(KEYS.theme, theme);
        },

        readForm() {
            return {
                title: $("taskInput").value,
                subject: $("subjectInput").value,
                due: $("dueInput").value,
                priority: $("priorityInput").value,
            };
        },

        bind() {
            $("taskForm").addEventListener("submit", (e) => {
                e.preventDefault();
                const data = this.readForm();
                if (!data.title.trim()) {
                    $("formError").textContent = "Enter a task name to continue.";
                    $("formError").hidden = false;
                    $("taskInput").focus();
                    return;
                }
                const id = $("taskId").value;
                if (id) { Store.update(id, data); View.toast("Changes saved"); }
                else Store.add(data);
                Store.setUI({ editingId: null });
                View.fillForm(null);
            });

            $("cancelEdit").addEventListener("click", () => { Store.setUI({ editingId: null }); View.fillForm(null); });

            $("taskList").addEventListener("click", (e) => {
                const btn = e.target.closest("[data-action]");
                const li = e.target.closest(".task");
                if (!btn || !li) return;
                const task = Store.get().tasks.find((t) => t.id === li.dataset.id);
                if (!task) return;
                if (btn.dataset.action === "toggle") Store.toggle(task.id);
                if (btn.dataset.action === "edit") View.fillForm(task);
                if (btn.dataset.action === "delete") {
                    const before = Store.get().tasks;
                    Store.remove(task.id);
                    View.toast("Task deleted", () => Store.setTasks(before));
                }
            });

            $("clearCompleted").addEventListener("click", () => {
                const before = Store.get().tasks;
                const n = before.filter((t) => t.done).length;
                if (!n) return;
                Store.setTasks(before.filter((t) => !t.done));
                View.toast(`${n} completed ${n === 1 ? "task" : "tasks"} cleared`, () => Store.setTasks(before));
            });

            $("filters").addEventListener("click", (e) => {
                const b = e.target.closest("[data-filter]");
                if (b) Store.setUI({ filter: b.dataset.filter });
            });
            $("sortSelect").addEventListener("change", (e) => Store.setUI({ sort: e.target.value }));

            let debounce;
            $("searchInput").addEventListener("input", (e) => {
                clearTimeout(debounce);
                debounce = setTimeout(() => Store.setUI({ query: e.target.value }), 120);
            });

            $("themeToggle").addEventListener("click", () =>
                this.applyTheme(document.documentElement.dataset.theme === "dark" ? "light" : "dark"));

            $("exportBtn").addEventListener("click", () => this.exportJSON());
            $("importBtn").addEventListener("click", () => $("importFile").click());
            $("importFile").addEventListener("change", (e) => this.importJSON(e.target.files[0]));

            document.addEventListener("keydown", (e) => {
                const typing = /^(INPUT|SELECT|TEXTAREA)$/.test(document.activeElement.tagName);
                if (e.key === "/" && !typing) { e.preventDefault(); $("searchInput").focus(); }
                if (e.key === "Escape" && $("taskId").value) View.fillForm(null);
                if (e.key === "Escape") View.hideToast();
            });
        },

        exportJSON() {
            const blob = new Blob([JSON.stringify(Store.get().tasks, null, 2)], { type: "application/json" });
            const a = Object.assign(document.createElement("a"), { href: URL.createObjectURL(blob), download: `tasks-${todayISO()}.json` });
            a.click();
            URL.revokeObjectURL(a.href);
        },

        async importJSON(file) {
            if (!file) return;
            try {
                const parsed = JSON.parse(await file.text());
                if (!Array.isArray(parsed)) throw new Error("not an array");
                const incoming = parsed.map(sanitize).filter(Boolean);
                const have = new Set(Store.get().tasks.map((t) => t.id));
                const fresh = incoming.filter((t) => !have.has(t.id));
                const before = Store.get().tasks;
                Store.setTasks([...fresh, ...before]);
                View.toast(`Imported ${fresh.length} ${fresh.length === 1 ? "task" : "tasks"}`, () => Store.setTasks(before));
            } catch {
                View.toast("Import failed. Choose a JSON file exported from this app.");
            }
            $("importFile").value = "";
        },
    };

    Controller.init();
})();
