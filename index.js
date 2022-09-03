const express = require('express')
const connectToMongo = require('./db');
const cors = require('cors');
require('dotenv').config();

connectToMongo();

const app = express()
const port = process.env.PORT || 5000

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
  console.log(`Social Chatbot backend app listening at https://social-chatbot-backend-iiitd.herokuapp.com/ or http://localhost:${port}`)
})