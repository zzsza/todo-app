const STORAGE_KEY = "class-todo-items";

const form = document.querySelector("#todo-form");
const input = document.querySelector("#todo-input");
const priorityInput = document.querySelector("#priority-input");
const list = document.querySelector("#todo-list");
const remainingCount = document.querySelector("#remaining-count");
const emptyState = document.querySelector("#empty-state");
const statusFilters = document.querySelector("#status-filters");
const filterButtons = statusFilters.querySelectorAll("[data-filter]");

const PRIORITIES = [
  { value: "high", label: "높음" },
  { value: "medium", label: "보통" },
  { value: "low", label: "낮음" },
];

let todos = loadTodos();
let currentFilter = "all";

function loadTodos() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (Array.isArray(saved)) {
      return saved.map((todo) => ({
        ...todo,
        priority: normalizePriority(todo.priority),
      }));
    }
  } catch (_) {}

  return [
    { id: crypto.randomUUID(), title: "강의 자료 만들기", completed: false, priority: "medium" },
    { id: crypto.randomUUID(), title: "이메일 답장하기", completed: true, priority: "medium" },
    { id: crypto.randomUUID(), title: "운동하기", completed: false, priority: "medium" },
  ];
}

function normalizePriority(priority) {
  return PRIORITIES.some((item) => item.value === priority) ? priority : "medium";
}

function saveTodos() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
}

function getVisibleTodos() {
  if (currentFilter === "active") {
    return todos.filter((todo) => !todo.completed);
  }

  if (currentFilter === "completed") {
    return todos.filter((todo) => todo.completed);
  }

  return todos;
}

function render() {
  list.innerHTML = "";

  getVisibleTodos().forEach((todo) => {
    const item = document.createElement("li");
    item.className = `todo-item${todo.completed ? " completed" : ""}`;

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = todo.completed;
    checkbox.setAttribute("aria-label", `${todo.title} 완료 여부`);
    checkbox.addEventListener("change", () => toggleTodo(todo.id));

    const title = document.createElement("span");
    title.className = "title";
    title.textContent = todo.title;

    const prioritySelect = document.createElement("select");
    prioritySelect.className = `priority-select priority-${todo.priority}`;
    prioritySelect.setAttribute("aria-label", `${todo.title} 우선순위`);

    PRIORITIES.forEach((priority) => {
      const option = document.createElement("option");
      option.value = priority.value;
      option.textContent = priority.label;
      prioritySelect.appendChild(option);
    });

    prioritySelect.value = todo.priority;
    prioritySelect.addEventListener("change", (event) =>
      changePriority(todo.id, event.target.value)
    );

    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.className = "delete-button";
    deleteButton.textContent = "삭제";
    deleteButton.addEventListener("click", () => deleteTodo(todo.id));

    item.append(checkbox, title, prioritySelect, deleteButton);
    list.appendChild(item);
  });

  const remaining = todos.filter((todo) => !todo.completed).length;
  remainingCount.textContent = `${remaining}개의 할 일 남음`;
  emptyState.hidden = todos.length > 0;

  filterButtons.forEach((button) => {
    button.setAttribute("aria-pressed", String(button.dataset.filter === currentFilter));
  });
}

function addTodo(title, priority) {
  todos.unshift({
    id: crypto.randomUUID(),
    title,
    completed: false,
    priority: normalizePriority(priority),
  });
  saveTodos();
  render();
}

function changePriority(id, priority) {
  todos = todos.map((todo) =>
    todo.id === id ? { ...todo, priority: normalizePriority(priority) } : todo
  );
  saveTodos();
  render();
}

function toggleTodo(id) {
  todos = todos.map((todo) =>
    todo.id === id ? { ...todo, completed: !todo.completed } : todo
  );
  saveTodos();
  render();
}

function deleteTodo(id) {
  todos = todos.filter((todo) => todo.id !== id);
  saveTodos();
  render();
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const title = input.value.trim();
  if (!title) return;

  addTodo(title, priorityInput.value);
  input.value = "";
  priorityInput.value = "medium";
  input.focus();
});

statusFilters.addEventListener("click", (event) => {
  const button = event.target.closest("[data-filter]");
  if (!button) return;

  currentFilter = button.dataset.filter;
  render();
});

render();
