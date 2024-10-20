
import Image from 'next/image';
import Link from 'next/link';
import { Logo } from '../components/Logo';
import HeroImage from '../public/3.jpg'

export default function Home() {
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
        <Link href="/post/new" className="btn text-center text-white bg-[#f9ae65]  ">
          Begin
        </Link>
      </div>
    </div>
  );
}