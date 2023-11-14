import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';



const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

mongoose.connect('mongodb://localhost:27017/kanban', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const connection = mongoose.connection;
connection.once('open', () => {
  console.log('MongoDB database connection established successfully');
});

const { Schema } = mongoose;

const columnSchema = new Schema({
  title: String,
}, { timestamps: true });

const taskSchema = new Schema({
  columnId: String,
  content: String,
}, { timestamps: true });

const Column = mongoose.model('Column', columnSchema);
const Task = mongoose.model('Task', taskSchema);

app.get('/api/columns', async (req, res) => {
  try {
    const columns = await Column.find();
    res.json(columns);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/columns', async (req, res) => {
  try {
    const { title } = req.body;
    const newColumn = new Column({ title });
    await newColumn.save();
    res.json(newColumn);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/columns/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await Column.findByIdAndDelete(id);
    await Task.deleteMany({ columnId: id });
    res.json({ message: 'Column deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/tasks', async (req, res) => {
  try {
    const tasks = await Task.find();
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/tasks', async (req, res) => {
  try {
    const { columnId, content } = req.body;
    const newTask = new Task({ columnId, content });
    await newTask.save();
    res.json(newTask);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/tasks/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deletedTask = await Task.findByIdAndDelete(id);
    res.json({ message: 'Task deleted successfully', deletedTask });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/tasks/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    const updatedTask = await Task.findByIdAndUpdate(id, { content }, { new: true });
    res.json(updatedTask);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

