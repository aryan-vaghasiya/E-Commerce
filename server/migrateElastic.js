const { Client: EsClient } = require('@elastic/elasticsearch');
const { Client: OsClient } = require('@opensearch-project/opensearch');

// --- CONFIGURATION ---
const LOCAL_INDEX = 'products-v4';      // Source (Local)
const REMOTE_INDEX = 'products-search'; // Destination (Bonsai)
const BATCH_SIZE = 50;                  // Smaller batch size for safety

// 1. SOURCE CLIENT (Local)
const sourceClient = new EsClient({
    node: 'https://localhost:9200',
    auth: { 
        username: 'elastic',
        password: process.env.ELASTIC_PASSWORD 
    },
    tls: { rejectUnauthorized: false }
});

// 2. DESTINATION CLIENT (Bonsai)
const destClient = new OsClient({
    node: process.env.BONSAI_URL,
    ssl: { rejectUnauthorized: true }
});

const migrate = async () => {
    console.log(`🚀 STARTING DATA MIGRATION: ${LOCAL_INDEX} -> ${REMOTE_INDEX}`);

    try {
        // A. Verify Local Data Exists
        const countCheck = await sourceClient.count({ index: LOCAL_INDEX });
        console.log(countCheck);
        
        console.log(`📊 Found ${countCheck.count} documents in local index.`);
        
        if (countCheck.count === 0) {
            console.error("❌ Local index is empty. Nothing to migrate.");
            return;
        }

        // B. Initialize Scroll (Start the search)
        let response = await sourceClient.search({
            index: LOCAL_INDEX,
            scroll: '2m', // Keep session alive for 2 mins
            size: BATCH_SIZE,
            body: { query: { match_all: {} } }
        });

        console.log(response);
        
        let scrollId = response._scroll_id;
        let hits = response.hits.hits; // Access the raw array of docs
        let totalMigrated = 0;

        // C. Loop while there are results
        while (hits && hits.length > 0) {
            const bulkBody = [];

            // Prepare the batch
            hits.forEach(hit => {
                // 1. Sanitize Data (Fixes "Compressor detection" error)
                const cleanSource = JSON.parse(JSON.stringify(hit._source));

                // 2. Add Action (Write to REMOTE_INDEX)
                bulkBody.push({ index: { _index: REMOTE_INDEX, _id: hit._id } });
                
                // 3. Add Data
                bulkBody.push(cleanSource);
            });

            // D. Send Batch to Bonsai
            if (bulkBody.length > 0) {
                const bulkResponse = await destClient.bulk({ 
                    body: bulkBody,
                    refresh: false // Don't refresh every time for speed
                });

                if (bulkResponse.body.errors) {
                    console.error("   ⚠️  Errors occurred in this batch!");
                    // Log the first error to see what happened
                    const errItem = bulkResponse.body.items.find(i => i.index.error);
                    if (errItem) console.error("   -> Error Detail:", JSON.stringify(errItem.index.error, null, 2));
                }
                
                totalMigrated += hits.length;
                console.log(`   -> Moved ${totalMigrated} documents...`);
            }

            // E. Get Next Page (Scroll)
            response = await sourceClient.scroll({
                scroll_id: scrollId,
                scroll: '2m'
            });
            
            // Update for next loop
            scrollId = response._scroll_id;
            hits = response.hits.hits;
        }

        // F. Final Refresh so data appears immediately
        await destClient.indices.refresh({ index: REMOTE_INDEX });
        
        console.log(`\n✅ MIGRATION COMPLETE. Total documents moved: ${totalMigrated}`);

    } catch (err) {
        console.error("\n❌ FATAL ERROR:", err.meta ? err.meta.body : err);
    }
};

migrate();