import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { randomUUID } from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const db = new Database(join(__dirname, 'tasks.db'));

// Создание таблицы задач (адаптировано под твой фронтенд)
db.exec(`
  CREATE TABLE IF NOT EXISTS tasks (
    uuid TEXT PRIMARY KEY,
    text TEXT NOT NULL,
    isChecked INTEGER DEFAULT 0,
    createdAt INTEGER NOT NULL
  )
`);

// Получить все задачи
export const getAllTasks = () => {
  return db.prepare('SELECT * FROM tasks ORDER BY createdAt DESC').all();
};

// Получить задачу по UUID
export const getTaskByUuid = (uuid) => {
  return db.prepare('SELECT * FROM tasks WHERE uuid = ?').get(uuid);
};

// Добавить задачу
export const createTask = (text, isChecked) => {
  const uuid = randomUUID(); // Генерируем уникальный ID
  const createdAt = Date.now(); // Текущая timestamp

  const stmt = db.prepare(`
    INSERT INTO tasks (uuid, text, isChecked, createdAt)
    VALUES (?, ?, ?, ?)
  `);

  stmt.run(uuid, text, isChecked ? 1 : 0, createdAt);
  return getTaskByUuid(uuid);
};

// Обновить задачу (для редактирования текста или статуса)
export const updateTask = (uuid, text, isChecked) => {
  const stmt = db.prepare(`
    UPDATE tasks
    SET text = ?, isChecked = ?
    WHERE uuid = ?
  `);
  stmt.run(text, isChecked ? 1 : 0, uuid);
  return getTaskByUuid(uuid);
};

// Удалить одну задачу
export const deleteTask = (uuid) => {
  const stmt = db.prepare('DELETE FROM tasks WHERE uuid = ?');
  return stmt.run(uuid);
};

// Удалить все задачи
export const deleteAllTasks = () => {
  const stmt = db.prepare('DELETE FROM tasks');
  return stmt.run();
};

export default db;