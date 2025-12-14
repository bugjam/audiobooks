import { Plus, Check, Play, BookOpen } from 'lucide-react';
import { useState } from 'react';

export default function BookItem({ book, onSelect, onToggleSave, isSaved }) {
    const [saved, setSaved] = useState(isSaved);

    const handleSave = (e) => {
        e.stopPropagation();
        onToggleSave(book.id, !saved);
        setSaved(!saved); // Optimistic update
    };

    const image = book.images?.[0]?.url || 'https://via.placeholder.com/300x300?text=No+Image';
    const author = book.authors?.map(a => a.name).join(', ') || 'Unknown Author';

    return (
        <div
            className="group relative bg-zinc-900 rounded-xl overflow-hidden hover:bg-zinc-800 transition-all duration-300 cursor-pointer border border-transparent hover:border-zinc-700"
            onClick={() => onSelect(book)}
        >
            <div className="aspect-square w-full overflow-hidden relative shadow-lg">
                <img
                    src={image}
                    alt={book.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <button
                    className={`absolute bottom-3 right-3 p-3 rounded-full shadow-xl transform translate-y-full opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 ${saved ? 'bg-purple-600 text-white' : 'bg-white text-black hover:bg-purple-100'
                        }`}
                    onClick={handleSave}
                    title={saved ? "Remove from Library" : "Add to Library"}
                >
                    {saved ? <Check size={20} /> : <Plus size={20} />}
                </button>
            </div>

            <div className="p-4">
                <h3 className="font-bold text-white truncate mb-1" title={book.name}>{book.name}</h3>
                <p className="text-sm text-zinc-400 truncate mb-2">{author}</p>

                <div className="flex items-center gap-2 mt-2">
                    <span className="text-xs px-2 py-0.5 rounded bg-zinc-800 text-zinc-400 border border-zinc-700">
                        {book.languages?.[0]?.toUpperCase()}
                    </span>
                    <span className="text-xs text-zinc-500">
                        {book.release_date?.split('-')[0]}
                    </span>
                </div>
            </div>
        </div>
    );
}
