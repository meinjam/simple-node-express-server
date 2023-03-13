require('dotenv').config();
const express = require('express');
const app = express();
const cors = require('cors');
const Note = require('./models/note');

app.use(express.json());
app.use(cors());

app.get('/', (request, response) => {
  response.send('<h1>Hello World 12345</h1>');
});

app.get('/api/notes', (request, response) => {
  // response.json(notes);
  Note.find({}).then((notes) => {
    response.json(notes);
  });
});

app.get('/api/notes/:id', (request, response, next) => {
  const id = request.params.id;
  Note.findById(id)
    .then((note) => {
      if (note) {
        response.json(note);
      } else {
        response.status(404).end();
      }
    })
    .catch((error) => {
      // console.log(error);
      // response.status(400).send({ error: 'malformatted id' });
      next(error);
    });
});

app.delete('/api/notes/:id', (request, response, next) => {
  const id = request.params.id;

  Note.findByIdAndRemove(id)
    .then((result) => {
      response.status(204).end();
    })
    .catch((error) => next(error));
});

app.post('/api/notes', (request, response, next) => {
  const body = request.body;

  if (!body.content) {
    return response.status(400).json({
      error: 'content missing',
    });
  }

  const note = new Note({
    content: body.content,
    important: body.important || false,
  });

  note
    .save()
    .then((savedNote) => {
      response.json(savedNote);
    })
    .catch((error) => next(error));
});

app.put('/api/notes/:id', (request, response, next) => {
  const body = request.body;

  const note = {
    content: body.content,
    important: body.important,
  };

  Note.findByIdAndUpdate(request.params.id, note, { new: true })
    .then((updatedNote) => {
      response.json(updatedNote);
    })
    .catch((error) => next(error));
});

const errorHandler = (error, request, response, next) => {
  console.error(error.message);

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' });
  } else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message });
  }

  next(error);
};

// this has to be the last loaded middleware.
app.use(errorHandler);

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
