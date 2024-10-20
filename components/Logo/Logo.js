import { faBrain } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Image from 'next/image';
import brain from "./brains.png"

export const Logo = () => {
  return (
    <div className="text-3xl text-center py-4  text-[#f9ae65] flex justify-center">
      BlogBrain &nbsp;
      <Image  src={brain} alt="desk setup"   className="h-[5vh] w-[3vw] md:w-[8vw]" />
    </div>
  );
};