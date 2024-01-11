const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const app = express()

app.use(express.json())
app.use(cors())
app.use(express.static('dist'))

morgan.token('body', (req, res) => {
    //Jos POST, niin body tokeniin tallennetaan viestin body. Jos jokin muu,
    //niin token body on tyhjä merkkijono
    return req.method === 'POST' ? `- ${JSON.stringify(req.body)}` : ' '
  })

  //Sama kuin tiny, mutta loppuun lisätty vielä body-token
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))

let persons = [
    {
      "name": "Arto Hellas",
      "number": "040-123456",
      "id": 1
    },
    {
      "name": "Ada Lovelace",
      "number": "39-44-5323523",
      "id": 2
    },
    {
      "name": "Dan Abramov",
      "number": "12-43-234345",
      "id": 3
    },
    {
      "name": "Mary Poppendieck",
      "number": "39-23-6423122",
      "id": 4
    }
  ]
app.get('/', (req, res) => {
    res.send('<h1>Phonebook</h1>')
})

app.get('/info', (req, res) => {
    const html = `
        <div>
          <div>Phonebook has info for ${persons.length} people</div>
          <div>${new Date()}</div>
         </div>
    `
    res.send(html)

})
  
  app.get('/api/persons', (req, res) => {
    res.json(persons)
  })

  const generateId = () => {
    const generatedId = Math.floor(Math.random() * 100000)
    return generatedId
  }
  
  app.post('/api/persons', (req, res) => {
    const body = req.body
  
    if (!body.name || !body.number) {
      return res.status(400).json({ 
        error: 'Name or number seems to be missing' 
      })
    }

    if (persons.some(person => person.name === body.name)) {
        return res.status(400).json({ 
          error: 'name must be unique' 
        })
      }
  
    const person = {
      name: body.name,
      number: body.number,
      id: generateId(),
    }
  
    persons = persons.concat(person)
  
    res.json(person)
  })

  app.get('/api/persons/:id', (req, res) => {
    const id = req.params.id
    console.log(id)
    const person = persons.find(person => (person.id).toString() === id.toString())
    console.log(person)
    if (person) {
        res.json(person)
      } else {
        res.status(404).end()
      }
  })

  app.delete('/api/persons/:id', (req, res) => {
    console.log(`delete ${req.params.id} `)
    const id = Number(req.params.id)
    persons = persons.filter(person => person.id !== id)
  
    res.status(204).end()
  })
  
  const PORT = process.env.PORT || 3001
  app.listen(PORT, () => {
    console.log(`Server teht running on port ${PORT}`)
  })