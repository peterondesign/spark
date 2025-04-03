import Link from "next/link";
import Image from "next/image";
import { HeartIcon, MapPinIcon, SearchIcon, StarIcon } from "../components/icons";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";

export default function Header() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isToolsMenuOpen, setIsToolsMenuOpen] = useState(false);
    const pathname = usePathname();
    
    // Close menu when clicking outside or pressing escape
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                setIsMenuOpen(false);
                setIsToolsMenuOpen(false);
            }
        };
        
        const handleClickOutside = () => {
            setIsMenuOpen(false);
            setIsToolsMenuOpen(false);
        };
        
        if (isMenuOpen || isToolsMenuOpen) {
            document.addEventListener('keydown', handleEscape);
            setTimeout(() => {
                document.addEventListener('click', handleClickOutside);
            }, 100);
        }
        
        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.removeEventListener('click', handleClickOutside);
        };
    }, [isMenuOpen, isToolsMenuOpen]);

    // Function to determine if a link is active
    const isActive = (path: string) => {
        if (path === '/' && pathname === '/') return true;
        if (path !== '/' && pathname?.startsWith(path)) return true;
        return false;
    };

    // Function to determine if a tool is active
    const isToolActive = () => {
        return isActive('/spin-the-wheel') || isActive('/alphabet-dating');
    }
    
    // Link style based on active state
    const getLinkStyle = (path: string) => {
        return isActive(path) 
            ? "text-rose-600 font-medium" 
            : "text-gray-600 hover:text-gray-900";
    };
    
    // Mobile link style
    const getMobileLinkStyle = (path: string) => {
        return isActive(path)
            ? "text-rose-600 font-medium py-2 border-b border-gray-100"
            : "text-gray-800 hover:text-gray-900 text-lg font-medium py-2 border-b border-gray-100";
    };
    
    return (
        <>
            {/* <div className="bg-yellow-300 text-center py-2">
                <p className="text-sm font-medium text-gray-800">
                    This is a demo prototype - expect mistakes and unfinished work.
                </p>
            </div> */}
            <header className="top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
                <div className="container mx-auto px-4 py-3 flex items-center justify-between">
                    <Link href="/" className="flex items-center">
                        <Image src="/dateideas.png" alt="Date Ideas Logo" width={32} height={32} className="mr-2" />
                        <span className="text-xl font-bold text-gray-900">Date Ideas</span>
                    </Link>
                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center space-x-4">
                        <Link href="/" className={getLinkStyle('/')}>Home</Link>
                        <Link href="/favorites" className={getLinkStyle('/favorites')}>Favorites</Link>
                        <Link href="/calendar" className={getLinkStyle('/calendar')}>Shared Date Calendar</Link>
                        <Link href="/date-idea-generator" className={getLinkStyle('/date-idea-generator')}>Date Idea Generator</Link>
                        
                        {/* Tools Dropdown */}
                        <div className="relative" onMouseLeave={() => setIsToolsMenuOpen(false)}>
                            <button 
                                className={`flex items-center space-x-1 ${isToolActive() ? 'text-rose-600 font-medium' : 'text-gray-600 hover:text-gray-900'}`}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setIsToolsMenuOpen(!isToolsMenuOpen);
                                }}
                                onMouseEnter={() => setIsToolsMenuOpen(true)}
                            >
                                <span>Tools</span>
                                <svg 
                                    xmlns="http://www.w3.org/2000/svg" 
                                    className={`h-4 w-4 transition-transform ${isToolsMenuOpen ? 'rotate-180' : ''}`} 
                                    viewBox="0 0 20 20" 
                                    fill="currentColor"
                                >
                                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                            </button>
                            
                            {isToolsMenuOpen && (
                                <div 
                                    className="absolute mt-2 py-2 w-48 bg-white rounded-md shadow-lg z-50"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <Link 
                                        href="/alphabet-dating" 
                                        className={`block px-4 py-2 ${getLinkStyle('/alphabet-dating')} hover:bg-gray-100`}
                                        onClick={() => setIsToolsMenuOpen(false)}
                                    >
                                        Alphabet Dating
                                    </Link>
                                    <Link 
                                        href="/spin-the-wheel" 
                                        className={`block px-4 py-2 ${getLinkStyle('/spin-the-wheel')} hover:bg-gray-100`}
                                        onClick={() => setIsToolsMenuOpen(false)}
                                    >
                                        Spin the Wheel
                                    </Link>
                                </div>
                            )}
                        </div>
                        
                        <Link href="/date-night-box-subscription" className={getLinkStyle('/date-night-box-subscription')}>Date Night Box Subscription</Link>
                        <Link href="/blog" className={getLinkStyle('/blog')}>Blog</Link>
                        <Link href="https://tally.so/r/3XzK4g" target="_blank" className="text-gray-600 hover:text-gray-900">Contact Us</Link>
                    </div>
                    
                    {/* Mobile Hamburger Button */}
                    <button 
                        className="md:hidden flex flex-col justify-center items-center w-8 h-8 space-y-1.5 z-50"
                        onClick={(e) => {
                            e.stopPropagation();
                            setIsMenuOpen(!isMenuOpen);
                        }}
                        aria-label="Toggle menu"
                    >
                        <span className={`block w-6 h-0.5 bg-gray-800 transform transition duration-300 ease-in-out ${isMenuOpen ? 'rotate-45 translate-y-2' : ''}`}></span>
                        <span className={`block w-6 h-0.5 bg-gray-800 transition duration-300 ease-in-out ${isMenuOpen ? 'opacity-0' : ''}`}></span>
                        <span className={`block w-6 h-0.5 bg-gray-800 transform transition duration-300 ease-in-out ${isMenuOpen ? '-rotate-45 -translate-y-2' : ''}`}></span>
                    </button>
                </div>
                
                {/* Mobile Menu */}
                <div 
                    className={`fixed top-0 right-0 h-full w-full bg-black bg-opacity-50 z-40 transition-opacity duration-300 md:hidden ${isMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
                    onClick={(e) => e.stopPropagation()}
                >
                    <div 
                        className={`fixed top-0 right-0 h-full w-3/4 max-w-sm bg-white shadow-lg transform transition-transform duration-300 ease-in-out ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="p-6 flex flex-col space-y-6 pt-16">
                            <Link href="/" className={getMobileLinkStyle('/')}>Home</Link>
                            <Link href="/favorites" className={getMobileLinkStyle('/favorites')}>Favorites</Link>
                            <Link href="/calendar" className={getMobileLinkStyle('/calendar')}>Shared Date Calendar</Link>
                            <Link href="/date-idea-generator" className={getMobileLinkStyle('/date-idea-generator')}>Date Idea Generator</Link>
                            
                            {/* Mobile Tools Section */}
                            <div className="py-2 border-b border-gray-100">
                                <p className="text-gray-800 font-medium mb-2">Tools</p>
                                <div className="pl-4 flex flex-col space-y-2">
                                    <Link href="/alphabet-dating" className={getMobileLinkStyle('/alphabet-dating')}>
                                        Alphabet Dating
                                    </Link>
                                    <Link href="/spin-the-wheel" className={getMobileLinkStyle('/spin-the-wheel')}>
                                        Spin the Wheel
                                    </Link>
                                </div>
                            </div>
                            
                            <Link href="/date-night-box-subscription" className={getMobileLinkStyle('/date-night-box-subscription')}>Date Night Box Subscription</Link>
                            <Link href="/blog" className={getMobileLinkStyle('/blog')}>Blog</Link>
                            <Link href="https://tally.so/r/3XzK4g" target="_blank" className="text-gray-800 hover:text-gray-900 text-lg font-medium py-2 border-b border-gray-100">Contact Us</Link>
                        </div>
                    </div>
                </div>
            </header>
        </>
    );
}