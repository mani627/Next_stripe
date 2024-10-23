import Cors from 'micro-cors';
// import stripeInit from 'stripe';
import Stripe from 'stripe';

import clientPromise from '../../../lib/mongodb';




const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
export const config = {
  api: {
    bodyParser: false, // Disable the default body parser
  },
};

const cors = Cors({
  allowMethods: ['POST', 'HEAD'],
});


const handler = async (req, res) => {

  if (req.method === 'POST') {
    // let event;

    // Read the raw body
    // const buf = await new Promise((resolve, reject) => {
    //   let data = '';
    //   req.on('data', chunk => {
    //     data += chunk; // Accumulate the raw body chunks
    //   });
    //   req.on('end', () => {
    //     resolve(data); // Resolve the promise with the full body
    //   });
    //   req.on('error', (err) => {
    //     reject(err); // Reject the promise on error
    //   });
    // });
// console.log("raw",buf);

//     try {
//       // Verify the Stripe event using the raw body
//       event = await verifyStripe({
//         req,
//         stripe,
//         endpointSecret,
//         rawBody: buf, // Pass the raw body here
//       });
//     } catch (e) {
//       res.status(500).json({ error: e.message });
//       console.log('ERROR: ', e);
//       return; // Make sure to return after sending a response
//     }

const sig  = req.headers['Stripe-Signature'];
const rawBody = await req.text()

let event;

try {
  event = stripe.webhooks.constructEvent(rawBody, sig, process.env.STRIPE_WEBHOOK_SECRET);
} catch (err) {
  console.error(`Webhook Error: ${err.message}`);
  return res.status(400).send(`Webhook Error: ${err.message}`);
}

    console.log("events", event);
    console.log("events.type", event.type);
    switch (event.type) {
      case 'payment_intent.succeeded': {
        const client = await clientPromise;
        const db = client.db('BlogBrain');

        const paymentIntent = event.data.object;
        const auth0Id = paymentIntent.metadata.sub;

        console.log('AUTH 0 ID: ', paymentIntent);
        console.log('paymentIntent: ', paymentIntent);
        console.log('auth0Id: ', auth0Id);

        const userProfile = await db.collection('users').updateOne(
          {
            auth0Id,
          },
          {
            $inc: {
              availableTokens: 10,
            },
            $setOnInsert: {
              auth0Id,
            },
          },
          {
            upsert: true,
          }
        );
        console.log('USER PROFILE: ', userProfile);
        break;
      }
      default:
        console.log('UNHANDLED EVENT: ', event.type);
        break;
    }

    res.status(200).json({ received: true });
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
};

export default cors(handler);
