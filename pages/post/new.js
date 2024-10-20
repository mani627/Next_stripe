import { withPageAuthRequired } from '@auth0/nextjs-auth0';
import { faBrain } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { AppLayout } from '../../components/AppLayout';
import { getAppProps } from '../../utils/getAppProps';

export default function NewPost(props) {
  const router = useRouter();
  const [topic, setTopic] = useState('');
  const [keywords, setKeywords] = useState('');
  const [generating, setGenerating] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGenerating(true);
    try {
      const response = await fetch(`/api/generatePost`, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify({ topic, keywords }),
      });
      const json = await response.json();
      if (response.ok) {
        // console.log('RESULT: ', json);
        if (json?.postId) {
          router.push(`/post/${json.postId}`);
        }
      } else {
        console.error('Server error:', json);
      }
    } catch (e) {
      console.error('Network error:', e);
    } finally {
      setGenerating(false);
    }
  };


  return (
    <div className="h-full overflow-hidden  bg-slate-300 ">
      {!!generating && (
        <div className="text-[#3c6d79] flex h-full animate-pulse w-full flex-col justify-center items-center">
          <FontAwesomeIcon icon={faBrain} className="text-8xl" />
          <p className=' font-normal'>Generating...</p>
        </div>
      )}
      {!generating && (
        <div className="w-full h-full md-[100vh] md: items-center flex flex-col overflow-auto justify-center bg-[#E0E2EE]">
          <form
            onSubmit={handleSubmit}
            className="lg:absolute lg:left-[17%] md:w-[92vw]  w-full max-w-screen-sm bg-[#3c6d79] p-4 rounded-md shadow-xl border border-slate-200 shadow-slate-200"
          >
            <div>
              <label className='text-white'>
                <strong>Generate a blog post on the topic of:</strong>
              </label>
              <textarea
                className="resize-none border border-slate-500 w-full block my-2 px-4 py-2 rounded-sm"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                maxLength={80}
              />
            </div>
            <div>
              <label className='text-white'>
                <strong>Targeting the following keywords:</strong>
              </label>
              <textarea
                className="resize-none border border-slate-500 w-full block my-2 px-4 py-2 rounded-sm"
                value={keywords}
                onChange={(e) => setKeywords(e.target.value)}
                maxLength={80}
              />
              <small className="block mb-2 text-[#f9ae65]">
                Separate keywords with a comma
              </small>
            </div>
            <br/>
            <button
              type="submit"
              className="btn bg-[#f9ae65] disabled:bg-[#f9ae65]"
              disabled={!topic.trim() || !keywords.trim()}
            >
              Generate
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

NewPost.getLayout = function getLayout(page, pageProps) {
  return <AppLayout {...pageProps}>{page}</AppLayout>;
};

export const getServerSideProps = withPageAuthRequired({
  async getServerSideProps(ctx) {
   
    //provide logged ctx
    const props = await getAppProps(ctx);


    if (!props.availableTokens) {
      return {
        redirect: {
          destination: '/token-topup',
          permanent: false,
        },
      };
    }

    return {
      props,
    };
  },
});