// lib/mongodb.ts
import { MongoClient } from 'mongodb';

// Declare a global variable type for our MongoDB connection promise.
declare global {
    // eslint-disable-next-line no-var
    var _mongoClientPromise: Promise<MongoClient> | undefined;
}

if (!process.env.MONGODB_URI) 
{
    throw new Error('Please define the MONGODB_URI environment variable in .env.local');
}

const uri: string = process.env.MONGODB_URI;
const options: Record<string, unknown> = {};

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

if (process.env.NODE_ENV === 'development') 
{
    // Use a global variable in development to preserve the connection across module reloads.
    if (!global._mongoClientPromise) 
    {
        client = new MongoClient(uri, options);
        global._mongoClientPromise = client.connect();
    }
    clientPromise = global._mongoClientPromise;
}
else 
{
    client = new MongoClient(uri, options);
    clientPromise = client.connect();
}

export default clientPromise;
