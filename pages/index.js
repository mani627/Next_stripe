
import Image from 'next/image';
import Link from 'next/link';
import { Logo } from '../components/Logo';
import HeroImage from '../public/3.jpg'
import { useRouter } from 'next/router';
import { useState } from 'react';

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleClick = () => {
    setIsLoading(true)
    if (!isLoading) {
      router.push('/post/new');
    }
  };
  
  
  return (
    <div className="bg-[#E0E2EE] w-screen h-screen overflow-hidden flex justify-center items-center relative">
      {/* <Image src={HeroImage} alt="desk setup" fill className="absolute" /> */}
      <div className="relative z-10 md:w-[85vw] text-white px-10 py-5 text-center max-w-screen-sm bg-[#3c6d79] rounded-md backdrop-blur-sm">
        <Logo />
        <p>
          The AI-powered SAAS solution to generate SEO-optimized blog posts in
          minutes. Get high-quality content, without sacrificing your time.
        </p>
        <br/>
        {/* <Link href="/post/new" className="btn text-center text-white bg-[#f9ae65]  ">
          Begin
        </Link> */}
       <div className="flex justify-center items-center h-full w-full">
      <button
        onClick={handleClick}
        className={`btn w-[20vw] md:w-[40vw] font-semibold bg-[#f9ae65] text-[white] flex justify-center items-center ${
          isLoading ? 'disabled:bg-[#f9ae65] cursor-not-allowed' : ''
        }`}
        disabled={isLoading}  // Disable the button during loading
      >
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
          'Begin'
        )}
      </button>
    </div>
        
      </div>
    </div>
  );
}
