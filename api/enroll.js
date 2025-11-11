// api/enroll.js
const { MongoClient, ObjectId } = require('mongodb');

// Get the MONGO_URI from Vercel Environment Variables
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
        
        // Connects to the database name specified in the MONGO_URI (stridefinaldb)
        const database = client.db(); 
        
        // Use a new collection dedicated to enrollments
        const enrollmentsCollection = database.collection('enrollments'); 
        
        const { userId, name, email, courseName } = req.body;

        // Basic Validation
        if (!userId || !name || !email || !courseName) {
            return res.status(400).json({ message: 'Missing required user or course information.' });
        }

        // Convert the string userId from session storage to a MongoDB ObjectId
        const userObjectId = new ObjectId(userId);

        // Check for duplicate enrollment (optional, but recommended)
        const existingEnrollment = await enrollmentsCollection.findOne({ 
            userId: userObjectId, 
            courseName: courseName 
        });

        if (existingEnrollment) {
            return res.status(409).json({ message: `You are already enrolled in ${courseName}.` });
        }

        // Insert the new enrollment document
        const enrollmentRecord = {
            userId: userObjectId,
            name: name,
            email: email,
            courseName: courseName,
            enrolledAt: new Date()
        };

        const result = await enrollmentsCollection.insertOne(enrollmentRecord);

        // Success response
        res.status(201).json({ 
            message: `Successfully enrolled in ${courseName}!`,
            enrollment_id: result.insertedId.toString()
        });

    } catch (error) {
        console.error('Enrollment Server Error:', error);
        res.status(500).json({ message: 'Internal server error during enrollment.' });
    } finally {
        await client.close();
    }
};