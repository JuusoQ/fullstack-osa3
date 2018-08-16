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

const PORT = process.env.PORT || 3001


// poistetaan nämä. Kovakoodattuja henkilöitä tehtävää 3.2. varten

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


/* Tehtävän 3.13 apufunktio, joka määrittelee miten henkilön tiedot esitetään, refaktoroitu myöhemmin */

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
       
    console.log(count)
    let aika = new Date()
    res.send(`Puhelinluettelossa ${count} henkilön tiedot<br> ${aika}`)
})

app.get('/api/persons',(req,res) => {
    Person
        .find({})
        .then(people => {
            console.log(people.map(formatPerson))
            res.json(people.map(formatPerson))
        })
        .catch(error => {
            console.log('Error with GET /api/persons: ', error)
        })
    console.log('GET /api/persons')
})

// Tehtävä 3 - old way
/*
app.get('/api/persons/:id', (req, res) => {
    const id = Number(req.params.id)
    const person = persons.find(person => person.id === id)

    if (person) {
        res.json(person)
    } else {
        res.status(404).end()
    }
})
*/

app.get('/api/persons/:id', (req, res) => {
    const id = req.params.id
    console.log(id)
    Person
        .findById(id)
        .then(person => {
            if(person) {
                res.json(formatPerson(person))
            } else {
                res.status(404).end()
            }
        })
        .catch(error => {
            res.status(404).end()
            console.log('Ongelma yksittäisen henkilön hakemisessa')
        })
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

// tehtävä 3.16
app.delete('/api/persons/:id', (req, res) => {
    const id = req.params.id
    console.log('Poistetaan', id)
    Person
        .deleteOne({ _id: id })
        .then(deletedPerson => {
            console.log('Then-haara',deletedPerson)
            res.status(204).end()
        })
        .catch(error => {
            res.status(404)
            console.log('Virhe sattui poistossa')
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
        return res.status(400).json({ error: 'Missing data' }).end()
    }

    const person = new Person({
        name: body.name,
        number: body.number
    })

    // 3.19*

    Person
        .find({ name: body.name })
        .then(result => {
            console.log('Mitä löysin:',result)
            if(result.length > 0) {
                console.log('Tullaanko tähän koskaan',result.length)
                return res.status(403).json({ error:'User already exists' })
            }
        })
        .then(response => {
            if(response.statusCode === 403) {
                console.log('Miten tästä päästään pois')
                throw 'skip next then'
            } else {
                console.log('Lisätään person')
                person
                    .save()
                    .then(savedPerson => {
                        console.log('Added person', savedPerson)
                        return res.json(formatPerson(savedPerson)).end()

                    })
                    .catch(error => {
                        console.log(error)
                        return res.status(404).end()
                    })
            }
        })
        .catch(error => {
            console.log('Catch promise - rivi 201',error)
        })

})

// PUT -metodi
app.put('/api/persons/:id', (req,res) => {
    const id = req.params.id
    console.log(id)
    console.log(req.params.id)
    const body = req.body

    if (body.name === undefined || body.number === undefined) {
        res.send(400).json({ error: 'missing data' })
    }

    const person = {
        name: body.name,
        number: body.number
    }

    Person
        .findByIdAndUpdate(id, person, { new: true } )
        .then(updatedPerson => {
            res.json(formatPerson(updatedPerson)).end()
        })
        .catch(error => {
            console.log(error)
            res.status(404).send({ error: 'virhe' })
        })
})

app.listen(PORT, () => {
    console.log(`Server running on ${PORT}`)
})