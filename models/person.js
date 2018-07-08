const mongoose = require('mongoose')

const url = 'mongodb://jh-people:FullStackJuuso123@ds229771.mlab.com:29771/heroku_bgwjjhw8'

mongoose.connect(url, {useNewUrlParser: true})

const PersonSchema = mongoose.Schema({
    name: String,
    number: String
})

const Person = mongoose.model('Person', PersonSchema)

module.exports = Person 
