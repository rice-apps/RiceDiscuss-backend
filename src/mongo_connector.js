import { MongoClient as client} from 'mongodb';

const uri = "mongodb+srv://davidcyyi:123@shryans-mr8uh.mongodb.net/admin?retryWrites=true&w=majority";

export async function get_mongo_data() {
    const db = await client.connect(uri);
    return {
        listings: db.collection("listingsAndReviews"),
    }
}
