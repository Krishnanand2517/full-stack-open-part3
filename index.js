const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const app = express();

morgan.token('content', (request, response) => JSON.stringify(request.body));

app.use(express.json());
app.use(cors());
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :content'));

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
    response.json(persons);
});

app.get('/info', (request, response) => {
    const currentDate = new Date().toLocaleString();
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    response.send(`
        <p>Phonebook has info for ${persons.length} people</p>
        <p>${currentDate} ${timeZone}</p>
    `);
});

app.get('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id);
    const person = persons.find(p => p.id === id);
    
    if (person) {
        response.json(person);
    } else {
        response.status(404).end();
    }
});

app.delete('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id);
    persons = persons.filter(p => p.id !== id);

    response.status(204).end();
});

const generateId = () => {
    const id = Math.ceil(Math.random() * 1000);
    return id;
};

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

    const person = {
        name: body.name,
        phone: body.phone,
        id: generateId()
    };

    persons = persons.concat(person);

    response.json(person);
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});