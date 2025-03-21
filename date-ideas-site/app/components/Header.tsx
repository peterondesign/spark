import Link from "next/link";
import { HeartIcon, MapPinIcon, SearchIcon, StarIcon } from "../components/icons";

export default function Header() {


return (
    <header className=" top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
            <Link href="/" className="flex items-center">
                <HeartIcon className="h-8 w-8 text-rose-500" />
                <span className="ml-2 text-xl font-bold text-gray-800">Spark</span>
            </Link>

            <div className="flex items-center space-x-4">
                <Link href="/favorites" className="text-gray-600 hover:text-gray-900">
                    Favorites
                </Link>
                <Link href="/calendar" className="text-gray-600 hover:text-gray-900">
                    Shared Date Calendar
                </Link>
            </div>

            <div className="flex items-center space-x-3">
                <button className="text-gray-600 hover:text-gray-900">
                    <SearchIcon className="h-5 w-5" />
                </button>
                <Link
                    href="/login"
                    className="px-4 py-2 rounded-full border border-rose-500 text-rose-500 hover:bg-rose-500 hover:text-white transition-colors"
                >
                    Sign In
                </Link>
            </div>
        </div>
    </header>
)
}