const mongoose = require('mongoose')

const dbUrl = process.env.MONGODB_URI


mongoose.connect(dbUrl,{ useNewUrlParser: true })

const PersonSchema = mongoose.Schema({
    name: String,
    number: String
})

const Person = mongoose.model('Person', PersonSchema)



const nameParam = process.argv[2]
const numberParam = process.argv[3]

if (nameParam !== undefined) {
    const person = new Person({
        name: nameParam,
        number: numberParam
    })
    person.save().then(result => {
        console.log('Onnistui')
        mongoose.connection.close()
    })
} else {
    Person
        .find({})
        .then(result => {
            result.forEach(person => {
                console.log(person.name,person.number)
            })
            mongoose.connection.close()
        })
}
