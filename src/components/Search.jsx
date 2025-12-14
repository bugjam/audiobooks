import { Search as SearchIcon, X } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function Search({ onSearch, initialQuery = '' }) {
    const [query, setQuery] = useState(initialQuery);

    useEffect(() => {
        const timer = setTimeout(() => {
            onSearch(query);
        }, 500);
        return () => clearTimeout(timer);
    }, [query, onSearch]);

    return (
        <div className="relative w-full max-w-2xl">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <SearchIcon className="h-5 w-5 text-zinc-500" />
            </div>
            <input
                type="text"
                className="block w-full pl-10 pr-10 py-3 border border-zinc-700 rounded-xl leading-5 bg-zinc-900 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 sm:text-sm transition-colors"
                placeholder="Search for authors or titles..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
            />
            {query && (
                <button
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-zinc-500 hover:text-white"
                    onClick={() => setQuery('')}
                >
                    <X className="h-5 w-5" />
                </button>
            )}
        </div>
    );
}
