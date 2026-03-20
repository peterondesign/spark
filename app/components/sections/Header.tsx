"use client";

import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import Link from 'next/link';
import ThemeSwitcher from '../ThemeSwitcher';
import StripeModal from '../StripeModal';

const Header = () => {
  const headerRef = useRef<HTMLElement>(null);
  const [showStripeModal, setShowStripeModal] = useState(false);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.set(headerRef.current, {
        y: -100,
        opacity: 0,
      });

      gsap.to(headerRef.current, {
        y: 0,
        opacity: 1,
        duration: 1,
        ease: "power2.out",
        delay: 0.2,
      });
    }, headerRef);

    return () => ctx.revert();
  }, []);

  return (
    <header ref={headerRef} className="fixed top-0 left-0 right-0 z-50 bg-[#212121]/95 backdrop-blur-md border-b border-gray-700">
      <nav className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-3">
            <svg width="45" height="35" viewBox="0 0 91 70" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M0.649131 35.1199V0H13.09C16.3459 0 18.7964 0.705058 20.4415 2.11518C22.0866 3.51199 22.9091 5.56065 22.9091 8.26116V24.7036C22.9091 28.0294 22.1551 30.5969 20.6471 32.4061C19.1563 34.2153 16.5344 35.1199 12.7816 35.1199H0.649131ZM9.74848 28.914H11.3164C12.9787 28.914 13.8098 28.2888 13.8098 27.0383V8.91965C13.8098 7.74899 13.6041 6.99737 13.1929 6.6648C12.7987 6.31892 11.9848 6.14598 10.7509 6.14598H9.74848V28.914Z" fill="#F4F4F4"/>
              <path d="M25.3767 35.1199L29.7465 0H45.092L49.3846 35.1199H40.8251L40.1825 29.4528H34.7331L34.1676 35.1199H25.3767ZM35.3757 23.8456H39.4884L37.5092 5.98634H37.0979L35.3757 23.8456Z" fill="#F4F4F4"/>
              <path d="M55.3737 35.1199V6.74461H50.0015V0H69.7939V6.74461H64.4217V35.1199H55.3737Z" fill="#F4F4F4"/>
              <path d="M72.3129 35.1199V0H90.4088V6.78452H81.5151V13.6289H90.0489V20.2338H81.5151V28.2755H91V35.1199H72.3129Z" fill="#F4F4F4"/>
              <path d="M0 68.8007V38.9226H7.43509V68.8007H0Z" fill="#F4F4F4"/>
              <path d="M10.4966 68.8007V38.9226H21.0807C23.8506 38.9226 25.9353 39.5224 27.3349 40.722C28.7344 41.9104 29.4342 43.6533 29.4342 45.9507V59.9391C29.4342 62.7685 28.7927 64.9527 27.5098 66.4919C26.2415 68.0311 24.011 68.8007 20.8182 68.8007H10.4966ZM18.2378 63.5211H19.5718C20.9859 63.5211 21.693 62.9891 21.693 61.9253V46.5109C21.693 45.515 21.518 44.8755 21.1681 44.5926C20.8328 44.2984 20.1403 44.1512 19.0907 44.1512H18.2378V63.5211Z" fill="#F4F4F4"/>
              <path d="M32.5832 68.8007V38.9226H47.9782V44.6945H40.4119V50.5173H47.672V56.1364H40.4119V62.9778H48.4811V68.8007H32.5832Z" fill="#F4F4F4"/>
              <path d="M49.99 68.8007L53.7076 38.9226H66.7627L70.4146 68.8007H63.1326L62.5859 63.9794H57.9499L57.4688 68.8007H49.99ZM58.4966 59.2091H61.9955L60.3117 44.0154H59.9618L58.4966 59.2091Z" fill="#F4F4F4"/>
              <path d="M81.9171 69.0723C78.4037 69.0723 75.867 68.3932 74.3071 67.0351C72.7618 65.677 71.9891 63.5154 71.9891 60.5502V57.6303H79.5991V61.3651C79.5991 62.0555 79.7304 62.5987 79.9928 62.9948C80.2698 63.3796 80.7436 63.572 81.4142 63.572C82.114 63.572 82.595 63.4136 82.8575 63.0967C83.1345 62.7798 83.273 62.2592 83.273 61.5349C83.273 60.6181 83.1563 59.8542 82.9231 59.2431C82.6898 58.6206 82.2816 58.0321 81.6985 57.4775C81.1299 56.9117 80.3354 56.2553 79.3149 55.5083L75.8597 52.9619C73.2793 51.0719 71.9891 48.9102 71.9891 46.477C71.9891 43.9305 72.7472 41.9896 74.2634 40.6541C75.7941 39.3187 78.0028 38.6509 80.8894 38.6509C84.4174 38.6509 86.9176 39.3809 88.39 40.8409C89.8771 42.3008 90.6206 44.519 90.6206 47.4955H82.7919V45.4414C82.7919 45.034 82.6388 44.7171 82.3326 44.4907C82.0411 44.2644 81.6402 44.1512 81.1299 44.1512C80.5176 44.1512 80.0657 44.287 79.7741 44.5587C79.4971 44.819 79.3586 45.1585 79.3586 45.5772C79.3586 45.996 79.5044 46.4487 79.796 46.9353C80.0875 47.422 80.6634 47.9822 81.5235 48.616L85.9627 51.9263C86.852 52.5827 87.6684 53.2788 88.4119 54.0144C89.1554 54.7387 89.7531 55.5875 90.2051 56.5608C90.657 57.5228 90.883 58.6998 90.883 60.0919C90.883 62.8986 90.2124 65.0999 88.8711 66.6956C87.5445 68.2801 85.2265 69.0723 81.9171 69.0723Z" fill="#F4F4F4"/>
            </svg>
          </Link>

          <div className="hidden md:flex items-center space-x-8">
            <Link href="/date-idea-generator" className="text-gray-300 hover:text-white transition-colors">
              Generator
            </Link>
            <Link href="/favorites" className="text-gray-300 hover:text-white transition-colors">
              Favorites
            </Link>
            <Link href="/blog" className="text-gray-300 hover:text-white transition-colors">
              Blog
            </Link>
            <ThemeSwitcher className="mr-4" />
            <button
              onClick={() => setShowStripeModal(true)}
              className="bg-slate-700 text-white px-5 py-2 rounded-full hover:bg-slate-600 transition-colors whitespace-nowrap"
            >
              Get Notified ($8/month)
            </button>
            <button className="bg-rose-600 text-white px-6 py-2 rounded-full hover:bg-rose-700 transition-colors">
              Donate
            </button>
          </div>

          {/* Mobile menu */}
          <div className="md:hidden flex items-center space-x-4">
            <ThemeSwitcher />
            <button className="p-2">
              <div className="w-6 h-6 flex flex-col justify-center space-y-1">
                <div className="w-full h-0.5 bg-gray-300"></div>
                <div className="w-full h-0.5 bg-gray-300"></div>
                <div className="w-full h-0.5 bg-gray-300"></div>
              </div>
            </button>
          </div>
        </div>
      </nav>

      <StripeModal
        isOpen={showStripeModal}
        onClose={() => setShowStripeModal(false)}
        email=""
      />
    </header>
  );
};

export default Header;
