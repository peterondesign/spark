import Link from "next/link";
import { HeartIcon, MapPinIcon, SearchIcon, StarIcon } from "../components/icons";

export default function Header() {

return (
    <>
        <div className="bg-yellow-300 text-center py-2">
            <p className="text-sm font-medium text-gray-800">
                This is a demo prototype - expect mistakes and unfinished work.
            </p>
        </div>
        <header className="top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
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
                    <a href="https://tally.so/r/3XzK4g" target="_blank" className="text-gray-600 hover:text-gray-900">
                        Feedback
                    </a>
                    <a href="https://www.dropbox.com/scl/fi/sghxy7qs4rxcli6w0yk5r/Spark-21Mar.mov?rlkey=li0nt6fbw5esuuepnw6o5ofe2&e=1&st=5mele79q&dl=0" target="_blank" className="text-gray-600 hover:text-gray-900">
                        Prototype Walkthrough
                    </a>
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
    </>
)
}