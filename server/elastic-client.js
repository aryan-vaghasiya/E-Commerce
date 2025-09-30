const { Client } = require('@elastic/elasticsearch');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

// You will need to copy the ca.crt file from the Elasticsearch config/certs folder
// into your Express project for this to work.

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

// Optional: Test the connection
client.ping()
    .then(response => console.log("Elasticsearch is connected!"))
    .catch(error => console.error("Elasticsearch connection failed:", error));

module.exports = client;