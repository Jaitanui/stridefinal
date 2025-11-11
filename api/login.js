// api/login.js
const { MongoClient } = require('mongodb');
// NOTE: For a real app, you would use bcrypt.compare() to check the password hash

const uri = process.env.MONGO_URI;
const client = new MongoClient(uri);

module.exports = async (req, res) => {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    try {
        await client.connect();
        
        const database = client.db(); 
        // Use your collection name: 'strideupskilling'
        const usersCollection = database.collection('strideupskilling'); 
        
        const { email, password } = req.body;

        // 1. Basic Validation (only requires email and password)
        if (!email || !password) {
            // This is the check that was failing earlier!
            return res.status(400).json({ message: 'Email and password are required.' }); 
        }

        // 2. Find the user by email
        const user = await usersCollection.findOne({ email });

        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials. User not found.' });
        }

        // 3. Password Check
        // !!! SECURITY WARNING: This is currently checking an unhashed password !!!
        // You MUST implement bcrypt.compare(password, user.password) here in production.
        if (user.password !== password) {
            return res.status(401).json({ message: 'Invalid credentials. Password incorrect.' });
        }

        // 4. Success response
        res.status(200).json({ 
            message: 'Login successful!',
            user_id: user._id.toString(),
            name: user.name,
            email: user.email,
            role: user.role
        });

    } catch (error) {
        console.error('Login Server Error:', error);
        res.status(500).json({ message: 'Internal server error during login.' });
    } 

// NEW: Endpoint to get a list of courses for the dropdown
app.get('/api/get-courses', async (req, res) => {
    try {
        const sql = 'SELECT course_id AS id, title AS title FROM courses';
        const [rows] = await db.execute(sql);
        res.status(200).json(rows);
    } catch (error) {
        console.error('Error fetching courses:', error);
        res.status(500).json({ message: 'An error occurred while fetching courses.' });
    }
});

    
    finally {
        await client.close();
    }
};