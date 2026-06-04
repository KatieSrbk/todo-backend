import express from 'express';
import cors from 'cors';
import * as db from './database.js';

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// Получить все задачи (GET /tasks)
app.get('/tasks', (req, res) => {
  try {
    const tasks = db.getAllTasks();

    // Преобразуем isChecked из 1/0 в boolean для фронтенда
    const formattedTasks = tasks.map(task => ({
      ...task,
      isChecked: task.isChecked === 1
    }));

    // Отправляем в формате, который ожидает твой фронтенд
    res.json({ rows: formattedTasks });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Добавить задачу (POST /task)
app.post('/task', (req, res) => {
  try {
    const { text, isChecked } = req.body;

    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }

    const task = db.createTask(text, isChecked || false);

    // Отправляем задачу в формате, который ожидает фронтенд
    res.status(201).json({
      uuid: task.uuid,
      text: task.text,
      isChecked: task.isChecked === 1,
      createdAt: task.createdAt
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Редактировать задачу (PATCH /task/:uuid) - для твоего editTodo и toggleComplete
app.patch('/task/:uuid', (req, res) => {
  try {
    const { uuid } = req.params;
    const { text, isChecked } = req.body;

    const existingTask = db.getTaskByUuid(uuid);
    if (!existingTask) {
      return res.status(404).json({ error: 'Task not found' });
    }

    // Обновляем только переданные поля
    const newText = text !== undefined ? text : existingTask.text;
    const newIsChecked = isChecked !== undefined ? isChecked : existingTask.isChecked === 1;

    const updatedTask = db.updateTask(uuid, newText, newIsChecked);

    res.json({
      uuid: updatedTask.uuid,
      text: updatedTask.text,
      isChecked: updatedTask.isChecked === 1,
      createdAt: updatedTask.createdAt
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Удалить одну задачу (DELETE /task/:uuid)
app.delete('/task/:uuid', (req, res) => {
  try {
    const { uuid } = req.params;
    const task = db.getTaskByUuid(uuid);

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    db.deleteTask(uuid);
    res.status(200).json({ message: 'Task deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Удалить все задачи (DELETE /tasks)
app.delete('/tasks', (req, res) => {
  try {
    db.deleteAllTasks();
    res.status(200).json({ message: 'All tasks deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Available endpoints:`);
  console.log(`  GET    /tasks            - получить все задачи`);
  console.log(`  POST   /task             - добавить задачу`);
  console.log(`  PATCH  /task/:uuid       - редактировать задачу`);
  console.log(`  DELETE /task/:uuid       - удалить одну задачу`);
  console.log(`  DELETE /tasks            - удалить все задачи`);
});