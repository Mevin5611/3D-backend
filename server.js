const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');
const cors = require('cors');
const fs = require('fs');

const app = express();

// Ensure the uploads directory exists
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(uploadDir));

mongoose.connect('mongodb://localhost:27017/3dmodels', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

const modelSchema = new mongoose.Schema({
  name: String,
  model: String,
});

const Model = mongoose.model('Model', modelSchema);

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  },
});

const upload = multer({ storage: storage });

app.post('/upload', upload.single('model'), (req, res) => {
  if (!req.file) {
    return res.status(400).json('No file uploaded');
  }
  const newModel = new Model({
    name: req.body.name,
    model: req.file.path,
  });
  newModel.save()
    .then(() => res.json('Model uploaded successfully'))
    .catch(err => {
      console.error('Error saving model:', err);
      res.status(400).json('Error: ' + err);
    });
});

app.get('/models', (req, res) => {
  Model.find()
    .then(models => res.json(models))
    .catch(err => res.status(400).json('Error: ' + err));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port: ${PORT}`);
});
