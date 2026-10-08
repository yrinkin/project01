const STORAGE_KEY = "todos";

const form = document.getElementById("todo-form");
const input = document.getElementById("todo-input");
const list = document.getElementById("todo-list");
const count = document.getElementById("todo-count");
const clearCompletedBtn = document.getElementById("clear-completed");
const filterButtons = document.querySelectorAll(".filters button");

let todos = loadTodos();
let currentFilter = "all";

function loadTodos() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}

function saveTodos() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
}

function addTodo(text) {
  todos.push({ id: Date.now().toString(36) + Math.random().toString(36).slice(2), text, completed: false });
  saveTodos();
  render();
}

function toggleTodo(id) {
  const todo = todos.find((t) => t.id === id);
  if (todo) todo.completed = !todo.completed;
  saveTodos();
  render();
}

function updateTodo(id, text) {
  const todo = todos.find((t) => t.id === id);
  if (todo) todo.text = text;
  saveTodos();
  render();
}

function deleteTodo(id) {
  todos = todos.filter((t) => t.id !== id);
  saveTodos();
  render();
}

function getVisibleTodos() {
  if (currentFilter === "active") return todos.filter((t) => !t.completed);
  if (currentFilter === "completed") return todos.filter((t) => t.completed);
  return todos;
}

function startEditing(li, todo) {
  const span = li.querySelector(".text");
  const editInput = document.createElement("input");
  editInput.className = "edit-input";
  editInput.value = todo.text;
  editInput.maxLength = 200;
  span.replaceWith(editInput);
  editInput.focus();
  editInput.select();

  let done = false;
  const finish = (save) => {
    if (done) return;
    done = true;
    const text = editInput.value.trim();
    if (save && text) updateTodo(todo.id, text);
    else if (save && !text) deleteTodo(todo.id);
    else render();
  };

  editInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") finish(true);
    if (e.key === "Escape") finish(false);
  });
  editInput.addEventListener("blur", () => finish(true));
}

function render() {
  list.innerHTML = "";
  const visible = getVisibleTodos();

  if (visible.length === 0) {
    const empty = document.createElement("li");
    empty.className = "empty";
    empty.textContent = "할 일이 없습니다.";
    list.appendChild(empty);
  }

  for (const todo of visible) {
    const li = document.createElement("li");
    li.className = "todo-item" + (todo.completed ? " completed" : "");

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = todo.completed;
    checkbox.addEventListener("change", () => toggleTodo(todo.id));

    const span = document.createElement("span");
    span.className = "text";
    span.textContent = todo.text;
    span.title = "더블클릭하여 수정";
    span.addEventListener("dblclick", () => startEditing(li, todo));

    const del = document.createElement("button");
    del.type = "button";
    del.className = "delete";
    del.textContent = "✕";
    del.setAttribute("aria-label", "삭제");
    del.addEventListener("click", () => deleteTodo(todo.id));

    li.append(checkbox, span, del);
    list.appendChild(li);
  }

  const remaining = todos.filter((t) => !t.completed).length;
  count.textContent = `${remaining}개 남음`;
  clearCompletedBtn.style.visibility = todos.some((t) => t.completed) ? "visible" : "hidden";
}

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const text = input.value.trim();
  if (!text) return;
  addTodo(text);
  input.value = "";
  input.focus();
});

filterButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    currentFilter = btn.dataset.filter;
    filterButtons.forEach((b) => b.classList.toggle("active", b === btn));
    render();
  });
});

clearCompletedBtn.addEventListener("click", () => {
  todos = todos.filter((t) => !t.completed);
  saveTodos();
  render();
});

render();
