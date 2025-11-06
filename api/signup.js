// api/signup.js
const { MongoClient } = require('mongodb');
// NOTE: In a production environment, you MUST install and use bcrypt 
// to hash passwords before saving them to the database for security.

// This URI variable will be automatically loaded by Vercel from your 
// Environment Variable settings.
const uri = process.env.MONGO_URI; 
// Recommended practice for serverless: initialize the client outside the handler
const client = new MongoClient(uri);

module.exports = async (req, res) => {
    // Set CORS headers for security and access control (important for Vercel)
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Handle preflight requests (required by some browsers)
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    try {
        await client.connect();
        
        // Connects to the database name specified in the MONGO_URI (stridefinaldb)
        const database = client.db(); 
        
        // References the collection you created
        const usersCollection = database.collection('strideupskilling'); 
        
        const { name, email, password, role } = req.body;

        // Input Validation
        if (!name || !email || !password || !role) {
            return res.status(400).json({ message: 'All fields are required.' });
        }

        // Check if user already exists
        const existingUser = await usersCollection.findOne({ email });
        if (existingUser) {
            return res.status(409).json({ message: 'User with this email already exists.' });
        }
        
        // !!! SECURITY WARNING: UNHASHED PASSWORD !!!
        // DO NOT use this for production. Install 'bcrypt' and use:
        // const hashedPassword = await bcrypt.hash(password, 10);
        const unhashedPassword = password; 

        // Insert the new user document
        const result = await usersCollection.insertOne({
            name,
            email,
            password: unhashedPassword, // Placeholder for hashed password
            role,
            createdAt: new Date()
        });

        // Success response. The front-end needs the insertedId (user_id).
        res.status(201).json({ 
            message: 'Signup successful! Redirecting to login...',
            user_id: result.insertedId.toString()
        });

    } catch (error) {
        console.error('Database or Server Error:', error);
        res.status(500).json({ message: 'Internal server error during signup.' });
    } finally {
        // Close the connection
        await client.close();
    }
};