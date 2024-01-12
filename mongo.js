const mongoose = require('mongoose')

if (process.argv.length<3) {
  console.log('give password as argument')
  process.exit(1)
}

if (process.argv.length > 5 || process.argv.length == 4) {
    console.log('Error: wrong amount of arguments')
    console.log('Usage example 1: node mongo.js <password> <name> <number>. Contact would be added <name> <number> to Phonebook')
    console.log('Usage example 2: node mongo.js <password>. Answer would be the whole phonebook.')
    process.exit(1)
}

console.log("process.argv", process.argv.length)

const password = process.argv[2]

const url =
  `mongodb+srv://fullstack:${password}@fullstack.pxg0klg.mongodb.net/phonebook?retryWrites=true&w=majority`

mongoose.set('strictQuery', false)
mongoose.connect(url)

const personSchema = new mongoose.Schema({
  name: String,
  number: String,
})

const Person = mongoose.model('Person', personSchema)


if (process.argv.length == 5) {

    const name = process.argv[3]
    const number = process.argv[4]
    
    const person = new Person({
      name: name,
      number: number,
    })
    
    person.save().then(result => {
      console.log(`added ${name} number ${number} to Phonebook`)
      mongoose.connection.close()
    })
}

if (process.argv.length == 3) {
    console.log("phonebook:")
    Person.find({}).then(result => {
        result.forEach(person => {
          console.log(`${person.name} ${person.number}`)
        })
        mongoose.connection.close()
      })
}
