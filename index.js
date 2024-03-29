require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const app = express()
const Person = require('./models/person')

app.use(express.json())
app.use(cors())
app.use(express.static('dist'))

// eslint-disable-next-line no-unused-vars
morgan.token('body', (req, res) => {
  //Jos POST, niin body tokeniin tallennetaan viestin body. Jos jokin muu,
  //niin token body on tyhjä merkkijono
  return req.method === 'POST' ? `- ${JSON.stringify(req.body)}` : ' '
})

//Sama kuin tiny, mutta loppuun lisätty vielä body-token
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))


app.get('/', (req, res) => {
  res.send('<h1>Phonebook</h1>')
})

app.get('/info', (req, res, next) => {
  Person.find({}).then(persons => {
    const html = `
      <div>
        <div>Phonebook has info for ${persons.length} people</div>
        <div>${new Date()}</div>
      </div>
    `
    res.send(html)
  })
    .catch(error => next(error))
})

app.get('/api/persons', (req, res, next) => {
  Person.find({}).then(persons => {
    res.json(persons)
  })
    .catch(error => next(error))
})


app.post('/api/persons', (req, res, next) => {
  const body = req.body

  if (!body.name) {
    const error = new Error('no name in request')
    error.status = 400
    return next(error)
  }

  if (!body.number) {
    const error = new Error('no number in request')
    error.status = 400
    return next(error)
  }

  const person = new Person({
    name: body.name,
    number: body.number,
  })

  person.save().then(savedPerson => {
    res.json(savedPerson)
  })
    .catch(error => {
      console.log('catch:')
      next(error)
    })
})

app.get('/api/persons/:id', (req, res) => {
  Person.findById(req.params.id)
    .then(person => {
      res.json(person)
    })
})

app.put('/api/persons/:id', (req, res, next) => {
  const body = req.body

  const person = {
    name: body.name,
    number: body.number,
  }

  console.log('person to be added:', person)

  Person.findByIdAndUpdate(req.params.id, person, { new: true })
    .then(updatedPerson => {
      res.json(updatedPerson)
      res.status(200).end()
    })
    .catch(error => next(error))
})


app.delete('/api/persons/:id', (req, res, next) => {
  Person.findByIdAndDelete(req.params.id)
    .then(() => {
      res.status(204).end()
    })
    .catch(error => next(error))
})

const errorHandler = (error, request, response, next) => {
  console.error(error.message)
  console.log('errorHandler')

  if (error.name === 'CastError') {
    console.log('käsitellään CastError')
    return response.status(400).send({ error: 'malformatted id' })
  }
  if (error.name === 'ValidationError') {
    console.log('käsitellään ValidationError')
    return response.status(400).json({ error: error.message })
  }

  if (error.status === 400) {
    return response.status(400).json({ error: error.message })
  }
  next(error)
}
app.use(errorHandler)

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server teht running on port ${PORT}`)
})