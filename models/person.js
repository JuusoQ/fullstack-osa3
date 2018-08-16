const mongoose = require('mongoose')


const url = provess.env.MONGODB_URI


mongoose.connect(url, { useNewUrlParser: true })

const personSchema = mongoose.Schema({
    name: String,
    number: String
})



const Person = mongoose.model('Person', personSchema)

// Tehtävä
personSchema.statics.format = (person) => {
    return {
        name: person.name,
        number: person.number,
        id: person._id
    }
}

module.exports = Person
