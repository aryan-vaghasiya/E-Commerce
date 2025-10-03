const { Client } = require('@elastic/elasticsearch');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

const client = new Client({
    node: 'https://localhost:9200',
    auth: {
        username: process.env.ELASTIC_USER,
        password: process.env.ELASTIC_PASSWORD
    },
    // tls: {
    //     rejectUnauthorized: false 
    // }
    tls: {
        ca: fs.readFileSync(path.resolve(__dirname, 'http_ca.crt')),
    }
});

client.ping()
    .then(response => console.log("Elasticsearch is connected!"))
    .catch(error => console.error("Elasticsearch connection failed:", error));

module.exports = client;