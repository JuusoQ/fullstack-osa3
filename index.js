const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const morgan = require('morgan')
const cors = require('cors')

const Person = require('./models/person') // 3.13


app.use(cors())
app.use(bodyParser.json())
app.use(express.static('build'))

morgan.token('json-content', function getContent(req, res) {
    return JSON.stringify(req.body)
})
// app.use(morgan('tiny')) // 3.7

// 3.8 
app.use(morgan(':method :url :json-content :response-time ms'))

const PORT = process.env.PORT || 3001


// poistetaan nämä
/*
let persons = [
    {
        name: 'Juuso',
        number: '09876',
        id: 1
    },
    {
        name: 'Suvi',
        number: '09566',
        id: 2
    }
]
*/

/* Tehtävän 3.13 apufunktio, joka määrittelee miten henkilön tiedot esitetään */

const formatPerson = (person) => {
    return {
        name: person.name,
        number: person.number,
        id: person._id
    }
}

app.get('/', (req, res) => {
    res.send('<b>Heippa maailma</b>')
})

// Tehtävä 2
app.get('/info', (req, res) => {
    let count = persons.length
    let aika = (new Date()).getTime()
    res.send(`Puhelinluettelossa ${count} henkilön tiedot<br> ${aika}`)
})

app.get('/api/persons',(req,res) => {
    Person
        .find({})
        .then(people => {
            res.json(people.map(formatPerson))
        })
    console.log('GET /api/persons')
})

// Tehtävä 3
app.get('/api/persons/:id', (req, res) => {
    const id = Number(req.params.id)
    const person = persons.find(person => person.id === id)

    if (person) {
        res.json(person)
    } else {
        res.status(404).end()
    }
})

// tehtävä 4 vanhalla tavalla -
/*
app.delete('/api/persons/:id', (req, res) => {
    const id = Number(req.params.id)
    persons = persons.filter(person => person.id !== id)

    res.status(204).end()
    console.log('DELETE -metodia kutsuttu')
    console.log(persons)
})*/

app.delete('/api/persons/:id', (req, res) => {
    const id = req.params.id
    console.log('Poistetaan', id)
    Person
        .deleteOne({_id: id})
        .then(deletedPerson => {
            console.log('Then-haara',deletedPerson)
            res.status(204).end()
        })
        .catch(error => {
            res.status(404)
            console.log("Virhe sattui poistossa")
        })
})

const generateRandomId = () => {
    return Math.floor(Math.random() * Math.floor(10000))
}

// tehtävä 5 vanhalla tavalla
/* 
app.post('/api/persons', (req, res) => {
    const body = req.body
    console.log(body.name)
    if (body.name === undefined || body.number === undefined) {
        return res.status(400).json({error: 'Missing data'})
    } 

    const name = persons.filter(person => person.name === body.name)
    if (name.length > 0 ) {
        return res.status(400).json({error:'Name or number exists'})
    }

    const person = {
        name: body.name,
        number: body.number,
        id: generateRandomId()
    }
    persons = persons.concat(person)
    res.json(persons)
    console.log(person)
})

*/
// Henkilöiden lisääminen käyttäen MongoDB:tä
app.post('/api/persons/', (req, res) => {
    const body = req.body
    if (body.name === undefined || body.number === undefined) {
        return res.status(400).json({error: 'Missing data'})
    } 

    const person = new Person({
        name: body.name,
        number: body.number
    })

    person
        .save()
        .then(savedPerson => {
            res.json(formatPerson(savedPerson))
        })
        .catch(error => {
            console.log(error)
            res.status(404).end()
        })

})

app.listen(PORT, () => {
    console.log(`Server running on ${PORT}`)
})