import { MongoClient } from 'mongodb';

// /api/new-meetup
// POST /api/new-meetup

async function handler(req, res) {
	if (req.method === 'POST') {
		const data = req.body;
		console.log(data, 'data');
		// const {title, image, address, description} = data

		const client = await MongoClient.connect(`${process.env.DATABASE}`);
		const db = client.db();

		// collections are kind of tables
		// documents would be the entries in those tables
		const meetupsCollection = db.collection('meetups');
		const result = await meetupsCollection.insertOne(data);

		console.log(result);
		client.close();

		res.status(201).json({ message: 'Meetup inserted!' });
	}
}

export default handler;
