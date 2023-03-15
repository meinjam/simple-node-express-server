const notesRouter = require('express').Router();
const jwt = require('jsonwebtoken');
const Note = require('../models/note');
const User = require('../models/user');

const getTokenFrom = (request) => {
  const authorization = request.get('authorization');
  if (authorization && authorization.startsWith('Bearer ')) {
    return authorization.replace('Bearer ', '');
  }
  return null;
};

notesRouter.get('/', (request, response) => {
  Note.find({}).then((notes) => {
    response.json(notes);
  });
});

notesRouter.post('/', async (request, response, next) => {
  const body = request.body;
  const decodedToken = jwt.verify(getTokenFrom(request), process.env.SECRET);
  if (!decodedToken.id) {
    return response.status(401).json({ error: 'token invalid' });
  }
  const user = await User.findById(decodedToken.id);

  const note = new Note({
    content: body.content,
    important: body.important || false,
    user: user._id,
  });

  const savedNote = await note.save();
  user.notes = user.notes.concat(savedNote._id);
  await user.save();
  response.json(savedNote);
});

notesRouter.get('/:id', (request, response, next) => {
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

notesRouter.put('/:id', (request, response, next) => {
  const body = request.body;

  const note = {
    content: body.content,
    important: body.important,
  };

  Note.findByIdAndUpdate(request.params.id, note, { new: true, runValidators: true, context: 'query' })
    .then((updatedNote) => {
      response.json(updatedNote);
    })
    .catch((error) => next(error));
});

notesRouter.delete('/:id', (request, response, next) => {
  const id = request.params.id;

  Note.findByIdAndRemove(id)
    .then((result) => {
      response.status(204).end();
    })
    .catch((error) => next(error));
});

module.exports = notesRouter;
