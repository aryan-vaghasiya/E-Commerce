const client = require('./elastic-client'); // Your dynamic client (connects to Bonsai in prod)

const setupIndex = async () => {
    const indexName = 'products-search'; // Use your actual index name used in queries

    const rawSynonyms = [
        "iPhone 5s, iPhone 6, iPhone X, iPhone 13 Pro, Oppo A57, Oppo F19 Pro, Oppo K1, Realme C35, Realme X, Realme XT, Samsung Galaxy S7, Samsung Galaxy S8, Samsung Galaxy S10, Vivo S1, Vivo V9, Vivo X21, phone, phones, smartphone, cell phone, mobile phone, electronics",
        "Apple MacBook Pro, Asus Zenbook, Huawei Matebook, Lenovo Yoga 920, DELL XPS 13, laptop, notebook, portable computer, electronics",
        "iPad Mini 2021, Samsung Galaxy Tab S8, Samsung Galaxy Tab, tablet, slate, electronics",
        "Apple Airpods, Apple AirPods Max, Beats Flex Wireless Earphones, Ear phones, headphones, head phones, earbuds, earphones, personal audio",
        "Apple Airpower Wireless Charger, Apple MagSafe Battery Pack, Apple iPhone Charger, charger, power bank, power adapter",
        "Apple HomePod Mini, smart speaker, speaker",
        "Apple Watch Series 4, smartwatch, wearable, watch",
        "iPhone 12 Silicone Case with MagSafe, phone case, phone cover",
        "Monopod, Selfie Stick, TV Studio Camera Pedestal, camera stand, tripod, camera accessory",
        "Blue Black Check Shirt, Man Plaid Shirt, Men Check Shirt, checkered shirt, plaid shirt, flannel, mens shirt, top",
        "Gigabyte Aorus Men Tshirt, Man Short Sleeve Shirt, tshirt, tshirt, tee, top, mens shirt",
        "Nike Air Jordan 1, Puma Future Rider Trainers, Sports Sneakers, sneakers, trainers, kicks, athletic shoes, footwear",
        "Nike Baseball Cleats, cleats, sports shoes",
        "Blue Frock, Girl Summer Dress, Gray Dress, Short Frock, Tartan Dress, dress, womens clothing, top",
        "Black Womens Gown, Corset Leather With Skirt, Marni Red Black Suit, formal wear, gown, dress, outfit",
        "Black Brown Slipper, slippers, house shoes, footwear",
        "Calvin Klein Heel Shoes, Golden Shoes Woman, Pampi Shoes, Red Shoes, womens shoes, heels, footwear",
        "Blue Womens Handbag, Heshe Womens Leather Bag, Prada Women Bag, Women Handbag Black, handbag, purse, tote, womens bag",
        "White Faux Leather Backpack, backpack, rucksack",
        "Rolex Cellini, Rolex Datejust, Rolex Submariner, Longines Master Collection, Brown Leather Belt Watch, mens watch, luxury watch, timepiece, wristwatch",
        "IWC Ingenieur, Rolex Cellini Moonphase (Women), Watch Gold for Women, Womens Wrist Watch, womens watch, timepiece, wristwatch",
        "clothing, garment, apparel",
        "jewellery, jewelry",
        "sunglasses, sun glasses, shades, sunnies, eyewear",
        "Essence Mascara Lash Princess, mascara, eye makeup, lash product",
        "Eyeshadow Palette with Mirror, eyeshadow, eye makeup",
        "Powder Canister, setting powder, face powder, face makeup",
        "Red Lipstick, lipstick, lip color, lip makeup",
        "Red Nail Polish, nail polish, nail lacquer, manicure product",
        "Olay Ultra Moisture Shea Butter Body Wash, Attitude Super Leaves Hand Soap, body wash, soap, cleanser",
        "Vaseline Men Body Face Lotion, lotion, moisturizer, skin care",
        "mascara, eyeshadow, lipstick, powder, nail polish, makeup, cosmetics, beauty",
        "Chanel Coco Noir, Dior Jadore, Dolce Shine, Gucci Bloom, CK One, perfume, fragrance, cologne, scent",
        "Annibale Colombo Bed, Bedside Table African Cherry, bed, bedroom furniture, furnishings",
        "Annibale Colombo Sofa, Knoll Saarinen Executive Conference Chair, sofa, chair, couch, seating, living room furniture, office furniture",
        "Decoration Swing, Family Tree Photo Frame, House Showpiece Plant, Plant Pot, Table Lamp, home decor, home decoration, homeware, ornament",
        "Bamboo Spatula, Black Whisk, Chopping Board, Citrus Squeezer, Egg Slicer, Fork, Grater, Knife, Spoon, Tongs, Turner, Rolling Pin, Peeler, utensil, kitchen tool",
        "Boxed Blender, Electric Stove, Microwave Oven, Hand Blender, kitchen appliance, appliance",
        "Carbon Steel Wok, Pan, Silver Pot With Glass Cap, cookware, pot, pan",
        "Black Aluminium Cup, Glass, Plate, Tray, Mug Tree Stand, kitchenware, tableware, dishware",
        "Apple, Kiwi, Lemon, Mulberry, Strawberry, fruit, produce, groceries",
        "Beef Steak, Chicken Meat, Fish Steak, meat, protein",
        "Cucumber, Green Bell Pepper, Green Chili Pepper, Potatoes, Red Onions, vegetable, veggie, produce",
        "Cat Food, Dog Food, pet food",
        "Soft Drinks, Juice, Water, Milk, beverage, drink",
        "American Football, gridiron ball",
        "Football, soccer ball",
        "Baseball Ball, Cricket Ball, Tennis Ball, Golf Ball, Volleyball, Basketball, sports ball",
        "Baseball Glove, mitt",
        "Cricket Bat, Metal Baseball Bat, bat",
        "Kawasaki Z800, MotoGP CIH1, Sportbike Motorcycle, Generic Motorcycle, motorcycle, motorbike, bike",
        "Chrysler 300 Touring, Dodge Charger SXT RWD, sedan, saloon, car, vehicle",
        "Dodge Durango SXT RWD, SUV, sport utility vehicle",
        "Dodge Hornet GT Plus, hatchback, compact car",
        "Chrysler Pacifica Touring, minivan, people carrier, van",
        "Calvin Kleinn, Calvin Klein, CK"
    ];

    const cleanSynonyms = rawSynonyms.map(s => s.toLowerCase().trim());

    try {
        // 1. Delete if exists (Clean slate)
        const exists = await client.indices.exists({ index: indexName });
        if (exists.body) {
            console.log(`Deleting existing index '${indexName}'...`);
            await client.indices.delete({ index: indexName });
        }

        // 2. DEFINE SETTINGS (Converted from File-Based to Inline)
        const indexConfig = {
            settings: {
                index: {
                    number_of_shards: 1,  // Good for free tier
                    number_of_replicas: 0 // Good for free tier
                },
                analysis: {
                    filter: {
                        // Standard English Stopwords (Keep as is)
                        english_stop_words_filter: {
                            type: "stop",
                            stopwords: "_english_"
                        },
                        // ⚠️ YOUR CUSTOM SYNONYMS (Converted to Inline)
                        comprehensive_synonym_graph_filter: {
                            type: "synonym_graph",
                            // REMOVED: "synonyms_path": "product_synonyms.txt"
                            // REMOVED: "updateable": "true" (Not supported for inline)
                            synonyms: cleanSynonyms,
                            lenient: true
                        },
                        // ⚠️ YOUR CUSTOM STOPWORDS (Converted to Inline)
                        custom_stop_filter: {
                            type: "stop",
                            // REMOVED: "stopwords_path": "my_stopwords.txt"
                            stopwords: [
                                // COPY PASTE YOUR FILE CONTENTS HERE
                                "limited",
                                "edition",
                                "exclusive",
                                "best",
                                "selling",
                                "price",
                                "sale",
                                "offer",
                                "new",
                                "shipping",
                                "ing"
                            ]
                        }
                    },
                    analyzer: {
                        enhanced_product_analyzer: {
                            type: "custom",
                            tokenizer: "standard",
                            filter: [
                                "lowercase",
                                "english_stop_words_filter",
                                "custom_stop_filter",
                                "comprehensive_synonym_graph_filter"
                            ]
                        }
                    }
                }
            },
            // 3. DEFINE MAPPINGS (From your provided schema)
            mappings: {
                properties: {
                    brand: { 
                        type: "text", 
                        fields: { keyword: { type: "keyword" } } 
                    },
                    category: { 
                        type: "text", 
                        analyzer: "standard", 
                        search_analyzer: "enhanced_product_analyzer" 
                    },
                    description: { 
                        type: "text", 
                        analyzer: "standard", 
                        search_analyzer: "enhanced_product_analyzer" 
                    },
                    title: { 
                        type: "text", 
                        analyzer: "standard", 
                        search_analyzer: "enhanced_product_analyzer" 
                    },
                    // Standard Fields
                    id: { type: "keyword" },
                    mrp: { type: "float" },
                    offer_discount: { type: "float" },
                    price: { type: "float" },
                    rating: { type: "half_float" },
                    status: { type: "keyword" },
                    stock: { type: "integer" },
                    thumbnail: { type: "keyword", index: false },
                    wishlisted: { type: "boolean" }
                }
            }
        };

        console.log("Creating index on Bonsai...");
        await client.indices.create({ index: indexName, body: indexConfig });
        console.log("✅ Index created successfully with Synonyms and Analyzers!");

    } catch (error) {
        console.error("❌ Error creating index:", error.meta ? error.meta.body : error);
    }
};

setupIndex();