import { Filter, ArrowUpDown } from 'lucide-react';

export default function FilterSort({
    languages,
    selectedLanguages,
    onLanguageChange,
    sortOption, // 'author', 'title', 'date'
    onSortChange
}) {
    return (
        <div className="flex flex-wrap gap-4 items-center bg-zinc-900/50 p-4 rounded-xl border border-zinc-800 backdrop-blur-sm">
            <div className="flex items-center gap-2">
                <Filter size={16} className="text-purple-400" />
                <span className="text-sm font-semibold text-zinc-300">Languages:</span>
                {languages.map(lang => (
                    <button
                        key={lang}
                        onClick={() => onLanguageChange(lang)}
                        className={`text-xs px-3 py-1 rounded-full border ${selectedLanguages.includes(lang)
                            ? 'bg-purple-600 border-purple-600 text-white'
                            : 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:border-zinc-500'}`}
                    >
                        {lang}
                    </button>
                ))}
            </div>

            <div className="w-px h-6 bg-zinc-800 hidden sm:block"></div>

            <div className="flex items-center gap-2">
                <ArrowUpDown size={16} className="text-purple-400" />
                <span className="text-sm font-semibold text-zinc-300">Sort by:</span>
                <select
                    value={sortOption}
                    onChange={(e) => onSortChange(e.target.value)}
                    className="bg-zinc-800 text-zinc-300 text-sm rounded-lg border border-zinc-700 px-3 py-1 focus:outline-none focus:border-purple-500"
                >
                    <option value="relevance">Relevance</option>
                    <option value="title">Title</option>
                    <option value="author">Author</option>
                    <option value="date">Publishing Date</option>
                </select>
            </div>
        </div>
    );
}
