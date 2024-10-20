import { getSession, withApiAuthRequired } from '@auth0/nextjs-auth0';
import clientPromise from '../../lib/mongodb';

export default withApiAuthRequired(async function handler(req, res) {
  const { user } = await getSession(req, res);
  const client = await clientPromise;
  const db = client.db('BlogBrain');
  const userProfile = await db.collection('users').findOne({
    auth0Id: user.sub,
  });

  if (!userProfile?.availableTokens) {
    res.status(403).json({ message: "Forbidden" });
    return;
  }

  const { topic, keywords } = req.body;

  if (!topic || !keywords) {
    res.status(422).json({ message: "Topic and keywords are required" });
    return;
  }

  if (topic.length > 80 || keywords.length > 80) {
    res.status(422).json({ message: "Topic and keywords should be less than 80 characters" });
    return;
  }

  const prompt = `Write a long and detailed SEO-friendly blog post about ${topic}, that targets the following comma-separated keywords: ${keywords}. 
  The response should be formatted in SEO-friendly HTML, 
  limited to the following HTML tags: p, h1, h2, h3, h4, h5, h6, strong, i, ul, li, ol.`;

  // Fetch request to Hugging Face API for the blog post content
  const myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/json");
  myHeaders.append("Authorization", "Bearer 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");

  const raw = JSON.stringify({
    "inputs": prompt,
    "parameters": {
      "max_length": 800,
      "min_length": 100,
      "temperature": 0.7,
      "top_k": 50,
      "top_p": 0.9,
      "repetition_penalty": 1.2,
      "num_return_sequences": 1,
      "do_sample": true
    }
  });

  const requestOptions = {
    method: "POST",
    headers: myHeaders,
    body: raw,
    redirect: "follow"
  };

  try {
    const response = await fetch("https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.3", requestOptions);
    const result = await response.json();

    const postContent = result[0]?.generated_text || '';

    // Generate title using Hugging Face API
    const titlePrompt = `Generate an SEO-friendly title for the following blog post content: ${postContent}`;
    const titleRaw = JSON.stringify({
      "inputs": titlePrompt,
      "parameters": {
        "max_length": 60, // Adjust as needed
        "temperature": 0.7,
        "top_k": 50,
        "top_p": 0.9,
        "repetition_penalty": 1.2,
        "num_return_sequences": 1,
        "do_sample": true
      }
    });

    const titleResponse = await fetch("https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.3", {
      method: "POST",
      headers: myHeaders,
      body: titleRaw,
    });

    const titleResult = await titleResponse.json();
    const title = titleResult[0]?.generated_text || 'Default Title'; // Default title if not generated

    // Generate meta description using Hugging Face API
    const metaDescriptionPrompt = `Generate an SEO-friendly meta description for the following blog post content: ${postContent}`;
    const metaDescriptionRaw = JSON.stringify({
      "inputs": metaDescriptionPrompt,
      "parameters": {
        "max_length": 160, // Adjust as needed
        "temperature": 0.7,
        "top_k": 50,
        "top_p": 0.9,
        "repetition_penalty": 1.2,
        "num_return_sequences": 1,
        "do_sample": true
      }
    });

    const metaDescriptionResponse = await fetch("https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.3", {
      method: "POST",
      headers: myHeaders,
      body: metaDescriptionRaw,
    });

    const metaDescriptionResult = await metaDescriptionResponse.json();
    const metaDescription = metaDescriptionResult[0]?.generated_text || 'Default meta description'; // Default meta description if not generated

    console.log('POST CONTENT: ', postContent);
    console.log('TITLE: ', title);
    console.log('META DESCRIPTION: ', metaDescription);

    // Update user tokens
    await db.collection('users').updateOne(
      { auth0Id: user.sub },
      { $inc: { availableTokens: -1 } }
    );

    // Insert post into the database
    const post = await db.collection('posts').insertOne({
      postContent: postContent || '',
      title: title || '',
      metaDescription: metaDescription || '',
      topic,
      keywords,
      userId: userProfile._id,
      created: new Date(),
    });

    res.status(200).json({
      postId: post.insertedId,
    });

  } catch (error) {
    console.error("Error fetching from Hugging Face:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});
