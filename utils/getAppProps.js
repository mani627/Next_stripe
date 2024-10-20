import { getSession } from '@auth0/nextjs-auth0';
import clientPromise from '../lib/mongodb';

export const getAppProps = async (ctx) => {
  const userSession = await getSession(ctx.req, ctx.res);
  
  const client = await clientPromise;
  const db = client.db('BlogBrain');
  
  // Step 1: Check if user exists in the database
  let user = await db.collection('users').findOne({
    auth0Id: userSession.user.sub,
  });

  // Step 2: If the user doesn't exist, create a new user record
  if (!user) {
    const newUser = {
      auth0Id: userSession.user.sub,
      email: userSession.user.email,  // assuming email is available in session
      availableTokens: 0,  // Give new users an initial amount of tokens (adjust as needed)
      createdAt: new Date(),
    };
    
    const result = await db.collection('users').insertOne(newUser);  // Insert the new user into the 'users' collection
    
    user = newUser;  // Set user to the newly created user
    
    console.log('New user created:', result.insertedId);
  }

  // Step 3: Retrieve posts for the user
  const posts = await db
    .collection('posts')
    .find({
      userId: user._id,
    })
    .limit(5)
    .sort({
      created: -1,
    })
    .toArray();

  // Step 4: Optionally, create a default post if the user has no posts
  // if (posts.length === 0) {
  //   const defaultPost = {
  //     userId: user._id,
  //     title: 'Welcome Post',
  //     content: 'This is your first post. Feel free to edit or delete it!',
  //     created: new Date(),
  //   };

  //   await db.collection('posts').insertOne(defaultPost);

  //   posts.push(defaultPost);  // Add the default post to the posts array
  // }

  // Step 5: Return available tokens, posts, and postId if any
  return {
    availableTokens: user.availableTokens,
    posts: posts.map(({ created, _id, userId, ...rest }) => ({
      _id: _id.toString(),
      created: created.toString(),
      ...rest,
    })),
    postId: ctx.params?.postId || null,
  };
};
