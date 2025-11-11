// api/enrolledcourses.js
const { MongoClient, ObjectId } = require('mongodb');

// Get the MONGO_URI from Vercel Environment Variables
const uri = process.env.MONGO_URI; 
const client = new MongoClient(uri);

module.exports = async (req, res) => {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS'); // Using POST for ease of sending userId
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
        
        // Querying the 'enrollment' collection as established
        const enrollmentsCollection = database.collection('enrollment'); 
        
        const { user_id } = req.body; // Expecting user_id in the body

        // Basic Validation
        if (!user_id) {
            return res.status(400).json({ message: 'User ID is required to fetch courses.' });
        }

        // Convert the string user_id to a MongoDB ObjectId
        let userObjectId;
        try {
            userObjectId = new ObjectId(user_id);
        } catch (e) {
            return res.status(400).json({ message: 'Invalid User ID format.' });
        }

        // Find all enrollment records for this user
        // Use .toArray() to convert the MongoDB cursor to a list of results
        const courses = await enrollmentsCollection.find({ 
            userId: userObjectId
        }).toArray();

        // Success response
        // Returns an array of course objects
        res.status(200).json(courses);

    } catch (error) {
        console.error('Fetch Courses Server Error:', error);
        res.status(500).json({ message: 'Internal server error while fetching courses.' });
    } finally {
        await client.close();
    }
};