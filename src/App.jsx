import { useEffect, useRef, useState } from "react";
import "./App.css";

export default function App() {
  const [todos, setTodos] = useState(() => {
    try {
      const raw = localStorage.getItem("todos_v1");
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });
  const [text, setText] = useState("");
  const inputRef = useRef();

  useEffect(() => {
    localStorage.setItem("todos_v1", JSON.stringify(todos));
  }, [todos]);

  // CTRL+A handler: ceklist semua todo
  useEffect(() => {
    const handler = (e) => {
      // cek Ctrl (Windows) atau Meta (Cmd di Mac) + A
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "a") {
        e.preventDefault(); // supaya gak select-all teks di page
        // set semua todo menjadi done = true
        setTodos((s) => s.map((t) => ({ ...t, done: true })));
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const makeId = () =>
    Date.now().toString(36) + Math.random().toString(36).slice(2, 7);

  const addTodo = (e) => {
    e?.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) return;
    const newTodo = { id: makeId(), text: trimmed, done: false, editing: false };
    setTodos((s) => [newTodo, ...s]);
    setText("");
    inputRef.current?.focus();
  };

  const toggleDone = (id) => {
    setTodos((s) => s.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));
  };

  const deleteTodo = (id) => {
    setTodos((s) => s.filter((t) => t.id !== id));
  };

  const startEdit = (id) => {
    setTodos((s) => s.map((t) => (t.id === id ? { ...t, editing: true } : { ...t, editing: false })));
  };

  const saveEdit = (id, newText) => {
    const trimmed = newText.trim();
    if (!trimmed) {
      deleteTodo(id);
      return;
    }
    setTodos((s) => s.map((t) => (t.id === id ? { ...t, text: trimmed, editing: false } : t)));
  };

  const cancelEdit = (id) => {
    setTodos((s) => s.map((t) => (t.id === id ? { ...t, editing: false } : t)));
  };

  const clearCompleted = () => {
    setTodos((s) => s.filter((t) => !t.done));
  };

  const [filter, setFilter] = useState("all");
  const filtered = todos.filter((t) => (filter === "all" ? true : filter === "active" ? !t.done : t.done));

  return (
    <div className="app-root">
      <div className="card">
        <h1>Todo List</h1>

        <form className="add-form" onSubmit={addTodo}>
          <input
            ref={inputRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Tulis tugas baru"
            aria-label="Tulis tugas baru"
          />
          <button type="submit" className="btn-primary">Tambah</button>
        </form>

        <div className="filters">
          <button className={filter === "all" ? "active" : ""} onClick={() => setFilter("all")}>All</button>
          <button className={filter === "active" ? "active" : ""} onClick={() => setFilter("active")}>Active</button>
          <button className={filter === "done" ? "active" : ""} onClick={() => setFilter("done")}>Done</button>
        </div>

        <ul className="todo-list">
          {filtered.length === 0 && <li className="empty">Belum ada tugas 😴</li>}
          {filtered.map((t) => (
            <li key={t.id} className={`todo-item ${t.done ? "done" : ""}`}>
              <div className="left">
                <input
                  type="checkbox"
                  checked={t.done}
                  onChange={() => toggleDone(t.id)}
                  aria-label={`Tandai ${t.text}`}
                />
              </div>

              <div className="middle">
                {t.editing ? (
                  <InlineEditor
                    initial={t.text}
                    onSave={(val) => saveEdit(t.id, val)}
                    onCancel={() => cancelEdit(t.id)}
                  />
                ) : (
                  <span onDoubleClick={() => startEdit(t.id)}>{t.text}</span>
                )}
              </div>

              <div className="right">
                <button className="btn-link" onClick={() => startEdit(t.id)} aria-label="Edit">✏️</button>
                <button className="btn-link danger" onClick={() => deleteTodo(t.id)} aria-label="Hapus">🗑️</button>
              </div>
            </li>
          ))}
        </ul>

        <div className="footer">
          <div>{todos.length} tugas • {todos.filter(t => t.done).length} selesai</div>
          <div>
            <button className="btn-secondary" onClick={clearCompleted}>Tugas Selesai</button>
          </div>
        </div>

        <div style={{ marginTop: 12, fontSize: 13, color: "#666", textAlign: "center" }}>
          Tip: tekan <strong>Ctrl/Cmd + A</strong> untuk menandai semua tugas sebagai selesai
        </div>
      </div>
    </div>
  );
}

function InlineEditor({ initial, onSave, onCancel }) {
  const [v, setV] = useState(initial);
  const ref = useRef();
  useEffect(() => ref.current?.focus(), []);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSave(v);
      }}
    >
      <input
        ref={ref}
        value={v}
        onChange={(e) => setV(e.target.value)}
        onBlur={() => onSave(v)}
      />
      <button type="button" onClick={() => onCancel()} className="btn-link">Cancel</button>
    </form>
  );
}
