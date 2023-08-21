require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const app = express();
const Person = require('./models/person');

morgan.token('content', (request) => JSON.stringify(request.body));

const errorHandler = (error, request, response, next) => {
    console.log(error.message);

    if (error.name === 'CastError') {
        return response.status(400).send({ error: "malformatted id" });
    }

    next(error);
};

app.use(express.json());
app.use(cors());
app.use(express.static('build'));
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :content'));
app.use(errorHandler);

let persons = [
    { 
        "id": 1,
        "name": "Arto Hellas", 
        "phone": "040-123456"
    },
    { 
        "id": 2,
        "name": "Ada Lovelace", 
        "phone": "39-44-5323523"
    },
    { 
        "id": 3,
        "name": "Dan Abramov", 
        "phone": "12-43-234345"
    },
    { 
        "id": 4,
        "name": "Mary Poppendieck", 
        "phone": "39-23-6423122"
    }
];

app.get('/api/persons', (request, response) => {
    Person.find({}).then(persons => {
        response.json(persons);
    });
});

app.get('/info', (request, response) => {
    const currentDate = new Date().toLocaleString();
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    Person.find({})
        .then(persons => {
            response.send(`
                <p>Phonebook has info for ${persons.length} people</p>
                <p>${currentDate} ${timeZone}</p>
            `);
        });
});

app.get('/api/persons/:id', (request, response, next) => {
    Person.findById(request.params.id)
        .then(person => {
            if (person) {
                response.json(person);
            } else {
                response.status(404).end();
            }
        })
        .catch(error => next(error));
});

app.delete('/api/persons/:id', (request, response, next) => {
    Person.findByIdAndRemove(request.params.id)
        .then(() => {
            response.status(204).end();
        })
        .catch(error => next(error));
});

app.put('/api/persons/:id', (request, response, next) => {
    const body = request.body;

    const person = {
        name: body.name,
        phone: body.phone
    };

    Person.findByIdAndUpdate(request.params.id, person, { new: true })
        .then(updatedPerson => {
            response.json(updatedPerson);
        })
        .catch(error => next(error));
});

app.post('/api/persons', (request, response) => {
    const body = request.body;

    if (!body.name) {
        return response.status(400).json({
            error: "Name is missing"
        });
    }

    if (!body.phone) {
        return response.status(400).json({
            error: "Number is missing"
        });
    }

    if (persons.find(p => p.name === body.name)) {
        return response.status(400).json({
            error: "Name must be unique"
        });
    }

    const person = new Person({
        name: body.name,
        phone: body.phone
    });

    person.save().then(savedPerson => {
        response.json(savedPerson);
    });
});

const PORT = process.env.PORT;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});