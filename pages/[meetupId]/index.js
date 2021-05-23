import { MongoClient, ObjectID } from 'mongodb';

import { Fragment } from 'react';
import Head from 'next/head';

import MeetupDetail from '../../components/meetups/MeetupDetail';

function MeetupDetails(props) {
	const { image, title, address, description } = props.meetupData;
	return (
		<Fragment>
			<Head>
				<title>{title}</title>
				<meta name='description' content={description} />
			</Head>
			<MeetupDetail
				image={image}
				title={title}
				address={address}
				description={description}
			/>
		</Fragment>
	);
}

// A page gets pregenerated during build process
// This means all versions of this page need to be generated
// it needs to know which id values it should pre generate the page
export async function getStaticPaths() {
	const client = await MongoClient.connect(`${process.env.DATABASE}`);
	const db = client.db();

	const meetupsCollection = db.collection('meetups');

	const result = await meetupsCollection.find({}, { _id: 1 }).toArray();
	// creates an array
	const meetups = result.map((meetup) => ({
		params: { meetupId: meetup._id.toString() },
	}));

	client.close();

	return {
		// all supported values or just some of em
		// false, ur path congtain all supportd values
		// anything else 404
		// true, try to render a page for this id dynamically
		// on the server for the incoming req
		// blocking or true, the list of paths might not be exhaustive
		// no 404 would be rendered, it would generate that page on demand
		// then cached it, generates it on need it
		// true will immediately would return an empty page
		// then pull the dynamic generated content
		// so we would have to handle that case that the page doesn't have
		// the data yet, with blocking the user won't see anything till the
		// finished paged generated and served
		fallback: 'blocking',
		paths: meetups,

		// paths:[
		// {
		// 	params:{
		// 	meetupId: 'something'
		// 	},
		// },
		// {
		// 	params: {
		// 	meetupId: 'something'
		// 	}
		// },
		// ]
	};
}

export async function getStaticProps(context) {
	const meetupId = context.params.meetupId;
	// fetch data
	const client = await MongoClient.connect(
		'mongodb+srv://xavi:3352@cluster0.w8dhw.mongodb.net/meetups?retryWrites=true'
	);
	const db = client.db();

	const meetupsCollection = db.collection('meetups');
	const selectedMeetup = await meetupsCollection.findOne({
		_id: ObjectID(meetupId),
	});
	client.close();

	return {
		props: {
			meetupData: {
				id: selectedMeetup._id.toString(),
				title: selectedMeetup.title,
				address: selectedMeetup.address,
				image: selectedMeetup.image,
				description: selectedMeetup.description,
			},
		},
	};
}

export default MeetupDetails;
