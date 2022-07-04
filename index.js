const express = require('express')
const connectToMongo = require('./db');
const cors = require('cors');
require('dotenv').config();

connectToMongo();

const app = express()
const port = process.env.PORT

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.use(cors());
app.use(express.json());
app.use('/api/auth', require('./routes/auth'))
app.use('/api/authAdmin', require('./routes/authAdmin'))
app.use('/api/video', require('./routes/video'))
app.use('/api/questionnaire', require('./routes/questionnaire'))
app.use('/api/question', require('./routes/question'))

app.listen(port, () => {
  console.log(`Social Chatbot backend app listening at http://localhost:${port}`)
})