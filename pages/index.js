// import in a page component, only used in getStaticProps or Server
// the import would not be part of the client bundle
import { Fragment } from 'react';
import Head from 'next/head';
import { MongoClient } from 'mongodb';
import MeetUpList from '../components/meetups/MeetupList';

function HomePage(props) {
	console.log();
	return (
		<Fragment>
			{/* adds meta tag */}
			<Head>
				<title>Meetups</title>
				<meta
					name='description'
					content='Browse a huge list of highly active people Meeting up with similar interests'
				/>
			</Head>
			<MeetUpList meetups={props.meetups} />;
		</Fragment>
	);
}

// if you don't need access to the req object it might be better to
// use getStaticProps, there you generate a html file that file
// can be stored and served by a cdn. That is faster than pregenerating
// and fetching data for every request

// By default nextjs prepares ur page statically during build process
// If you need to wait for data, nextjs will look for this func if it's there
// it will execute this func during the pre rendering process
// it wont directly call ur component and return jsx, it will call the func first
// the name comes from it prepares props for this page
// it can be async, nextjs will wait for this promise to be resolved
// this wont be executed in the client side because it is exec during
// the build process, not on the server and not on the client
export async function getStaticProps() {
	console.log(process.env.DATABASE);
	const client = await MongoClient.connect(`${process.env.DATABASE}`);
	const db = client.db();

	const meetupsCollection = db.collection('meetups');

	const result = await meetupsCollection.find().toArray();
	client.close();
	const meetups = result.map((meetup) => ({
		id: meetup._id.toString(),
		title: meetup.title,
		address: meetup.address,
		image: meetup.image,
		description: meetup.description,
	}));

	// always return an object, props
	return {
		props: {
			meetups,
		},
		// incremental static generator
		// not only generated during build, also
		// every couple of seconds on the server
		// when there are requests for this page
		revalidate: 10,
	};
}

// you can also want to regenrate on every request
// this will not run during the build process
// it runs always on the server after deployment
// you can work with a param
// export async function getServerSideProps(context) {
// 	// ex for auth, cookies
// 	const req = context.req;
// 	const res = context.res;

// 	return {
// 		props: {
// 			meetups: DUMMY_MEETUPS,
// 		},
// 	};
// }

export default HomePage;
