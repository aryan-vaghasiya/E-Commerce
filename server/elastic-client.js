// const { Client } = require('@elastic/elasticsearch');
// const dotenv = require('dotenv');
// const fs = require('fs');
// const path = require('path');

// const client = new Client({
//     node: process.env.ELASTIC_NODE,
//     auth: {
//         username: process.env.ELASTIC_USER,
//         password: process.env.ELASTIC_PASSWORD
//     },
//     tls: {
//         rejectUnauthorized: false 
//     }
//     // tls: {
//     //     ca: fs.readFileSync(path.resolve(__dirname, 'http_ca.crt')),
//     // }
// });

// client.ping()
//     .then(response => console.log("Elasticsearch is connected!"))
//     .catch(error => console.error("Elasticsearch connection failed:", error));

// module.exports = client;


const dotenv = require('dotenv');
dotenv.config();

let client;

if (process.env.BONSAI_URL) {
    console.log("Environment: Production (Using OpenSearch Client)");
    
    const { Client } = require('@opensearch-project/opensearch');
    
    client = new Client({
        node: process.env.BONSAI_URL,
        ssl: {
            rejectUnauthorized: true
        }
    });

} else {
    console.log("Environment: Local (Using Elastic Client)");

    const { Client } = require('@elastic/elasticsearch');

    client = new Client({
        node: process.env.ELASTIC_NODE,
        auth: {
            username: process.env.ELASTIC_USER,
            password: process.env.ELASTIC_PASSWORD
        },
        tls: {
            rejectUnauthorized: false
        }
    });
}

client.ping()
    .then(() => console.log("Search Engine connected successfully!"))
    .catch(error => console.error("Search Engine connection failed:", error));

module.exports = client;