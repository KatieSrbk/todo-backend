import express from 'express';
import cors from 'cors';
import * as db from './database.js';

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// Получить все задачи с фильтрацией и сортировкой
app.get('/tasks', (req, res) => {
  try {
    let tasks = db.getAllTasks();

    // Фильтрация
    const { filter, sortType, page = 1, limit = 5 } = req.query;

    if (filter === 'active') {
      tasks = tasks.filter((task) => !task.isChecked);
    } else if (filter === 'completed') {
      tasks = tasks.filter((task) => task.isChecked);
    }

    // Сортировка
    if (sortType === 'new') {
      tasks.sort((a, b) => b.createdAt - a.createdAt);
    } else if (sortType === 'old') {
      tasks.sort((a, b) => a.createdAt - b.createdAt);
    }

    const totalCount = tasks.length;
    const currentPage = parseInt(page);
    const itemsPerPage = parseInt(limit);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedTasks = tasks.slice(startIndex, endIndex);

    res.json({
      rows: paginatedTasks,
      totalTasksCount: totalCount,
    });
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
    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Редактировать задачу (PATCH /task/:uuid)
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
    const newIsChecked =
      isChecked !== undefined ? isChecked : existingTask.isChecked;

    const updatedTask = db.updateTask(uuid, newText, newIsChecked);

    res.json(updatedTask);
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
    const tasks = db.getAllTasks();

    if (tasks.length === 0) {
      return res.status(200).json({ message: 'The list is already empty' });
    }

    db.deleteAllTasks();
    res.status(200).json({ message: 'All tasks deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Available endpoints:`);
  console.log(`  GET    /tasks?filter=active&sortType=new - получить задачи с фильтрацией и сортировкой`);
  console.log(`  POST   /task                             - добавить задачу`);
  console.log(`  PATCH  /task/:uuid                       - редактировать задачу`);
  console.log(`  DELETE /task/:uuid                       - удалить одну задачу`);
  console.log(`  DELETE /tasks                            - удалить все задачи`);
});
