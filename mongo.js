const mongoose = require('mongoose');

const password = '0YEkJAWlTBLBBNKN';
const url = `mongodb+srv://injambdjsr:${password}@cluster0.tqx14xb.mongodb.net/?retryWrites=true&w=majority`;

mongoose.set('strictQuery', false);
mongoose.connect(url);

const noteSchema = new mongoose.Schema({
  content: String,
  important: Boolean,
});

const Note = mongoose.model('Note', noteSchema);

Note.find({}).then((result) => {
  result.forEach((note) => {
    console.log(note);
  });
  mongoose.connection.close();
});

// const note = new Note({
//   content: 'HTML is Easy',
//   important: true,
// });

// note.save().then((result) => {
//   console.log('note saved!');
//   mongoose.connection.close();
// });
