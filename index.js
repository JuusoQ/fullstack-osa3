const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const morgan = require('morgan')
const cors = require('cors')

app.use(cors())
app.use(bodyParser.json())

morgan.token('json-content', function getContent(req, res) {
    return JSON.stringify(req.body)
})
// app.use(morgan('tiny')) // 3.7

// 3.8 
app.use(morgan(':method :url :json-content :response-time ms'))

const PORT = process.env.PORT || 3001

let persons = [

    {
        name: "Juuso",
        number: "09876",
        id: 1
    },
    {
        name: "Suvi",
        number: "09566",
        id: 2
    }
]

app.get('/', (req, res) => {
    res.send("<b>Heippa maailma</b>")
})

// Tehtävä 2
app.get('/info', (req, res) => {
    let count = persons.length
    let aika = (new Date()).getTime()
    res.send(`Puhelinluettelossa ${count} henkilön tiedot<br> ${aika}`)
})

app.get('/api/persons',(req,res) => {
    res.json(persons)
    console.log("GET /api/persons")
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

// tehtävä 4
app.delete('/api/persons/:id', (req, res) => {
    const id = Number(req.params.id)
    persons = persons.filter(person => person.id !== id)

    res.status(204).end()
    console.log("DELETE -metodia kutsuttu")
    console.log(persons)
})

const generateRandomId = () => {
    return Math.floor(Math.random() * Math.floor(10000))
}

// tehtävä 5
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

app.listen(PORT, () => {
    console.log(`Server running on ${PORT}`)
})