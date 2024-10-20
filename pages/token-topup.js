import { withPageAuthRequired } from '@auth0/nextjs-auth0';
import { AppLayout } from '../components/AppLayout';
import { getAppProps } from '../utils/getAppProps';
import { useState } from 'react';

export default function TokenTopup() {
  const [isLoading, setIsLoading] = useState(false);
  const handleClick = async () => {
    setIsLoading(true);
    
    //triggers stripe
    const result = await fetch(`/api/addTokens`, {
      method: 'POST',
    });
    const json = await result.json();
    setIsLoading(false);
    
    console.log('RESULT: ', json);
    window.location.href = json.session.url;
  };

  return (
    <div className='flex flex-col items-center justify-center h-[100vh] text-lg'>
      Topup Your Token Via Stripe
      <br/>
      <br/>
      <button
      className={`btn w-[20vw] md:w-[40vw]  font-semibold bg-[#f9ae65] text-[#3c6d79] ${isLoading ? 'disabled:bg-[#f9ae65] cursor-not-allowed' : ''}`}
      onClick={handleClick}
      disabled={isLoading}  // Disable the button during loading
    >
      <div className="flex justify-center items-center">
        {isLoading ? (
          <svg
            className="animate-spin h-5 w-5 text-[#3c6d79]"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v4l3.5-3.5L12 4V0a12 12 0 00-12 12h4z"
            ></path>
          </svg>
        ) : (
          'Add tokens'
        )}
      </div>
    </button>
    </div>
  );
}

TokenTopup.getLayout = function getLayout(page, pageProps) {
  return <AppLayout {...pageProps}>{page}</AppLayout>;
};

export const getServerSideProps = withPageAuthRequired({
  async getServerSideProps(ctx) {
    const props = await getAppProps(ctx);
    return {
      props,
    };
  },
});
