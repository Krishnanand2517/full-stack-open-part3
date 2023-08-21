const mongoose = require('mongoose');

if (process.argv.length < 3) {
    console.log("Give password as argument");
    process.exit(1);
}

const password = process.argv[2];

const url = `mongodb+srv://fullstack:${password}@project0.hxmahgt.mongodb.net/phonebookApp?retryWrites=true&w=majority`;

mongoose.set('strictQuery', false);
mongoose.connect(url);

const personSchema = new mongoose.Schema({
    name: String,
    phone: String
});

const Person = mongoose.model('Person', personSchema);

if (process.argv.length === 3) {
    Person.find({}).then(result => {
        console.log("Phonebook:");
        result.forEach(person => {
            console.log(person.name, person.phone);
        });

        mongoose.connection.close();
        process.exit(1);
    });
}
else if (process.argv.length === 5) {
    const person = new Person({
        name: process.argv[3],
        phone: process.argv[4]
    });
    
    person.save().then(() => {
        console.log(`Added ${person.name} number ${person.phone} to the phonebook`);
        mongoose.connection.close();
    });
}
