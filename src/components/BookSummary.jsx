import { X, Calendar, User, Globe, Clock, ExternalLink, BookOpen } from 'lucide-react';
import { useEffect } from 'react';

export default function BookSummary({ book, onClose, isSaved, onToggleSave }) {
    // Prevent background scrolling when modal is open
    useEffect(() => {
        if (book) {
            document.body.style.overflow = 'hidden';
            return () => { document.body.style.overflow = ''; };
        }
    }, [book]);

    const getDurationString = (book) => {
        let ms = 0;
        if (book.chapters?.items) {
            ms = book.chapters.items.reduce((acc, curr) => acc + curr.duration_ms, 0);
        } else if (book.duration_ms) { // Fallback if direct duration is available
            ms = book.duration_ms;
        }

        if (ms === 0) return 'Unknown Duration';

        const totalMinutes = Math.floor(ms / 60000);
        const hours = Math.floor(totalMinutes / 60);
        const minutes = totalMinutes % 60;

        if (hours > 0) {
            return `${hours} hr ${minutes} min`;
        }
        return `${minutes} min`;
    };

    const getReleaseDate = (book) => {
        if (book.release_date) return book.release_date;
        if (book.chapters?.items?.[0]?.release_date) {
            return book.chapters.items[0].release_date;
        }
        return 'Unknown Date';
    };

    if (!book) return null;

    const image = book.images?.[0]?.url;
    const author = book.authors?.map(a => a.name).join(', ');
    const description = book.description || 'No description available.';

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={onClose}>
            <div
                className="bg-zinc-900 w-full max-w-3xl max-h-[90vh] rounded-2xl shadow-2xl overflow-y-auto border border-zinc-800"
                onClick={e => e.stopPropagation()}
            >
                <div className="relative">
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 p-2 bg-black/50 hover:bg-black/70 rounded-full text-white z-10 transition-colors"
                    >
                        <X size={20} />
                    </button>

                    <div className="grid md:grid-cols-[300px_1fr] gap-6 p-6">
                        <div className="flex flex-col gap-4">
                            <img src={image} alt={book.name} className="w-full rounded-lg shadow-lg" />
                            <a
                                href={book.external_urls?.spotify}
                                target="_blank"
                                rel="noreferrer"
                                className="flex items-center justify-center gap-2 w-full py-3 bg-[#1DB954] hover:bg-[#1ed760] text-black font-bold rounded-full transition-colors"
                            >
                                <ExternalLink size={18} />
                                Open in Spotify
                            </a>
                            <button
                                onClick={() => onToggleSave(book.id, !isSaved)}
                                className={`w-full py-3 font-bold rounded-full border transition-colors ${isSaved
                                    ? 'border-purple-500 text-purple-400 hover:bg-purple-900/20'
                                    : 'bg-purple-600 text-white border-transparent hover:bg-purple-700'
                                    }`}
                            >
                                {isSaved ? 'Remove from Library' : 'Add to Library'}
                            </button>
                        </div>

                        <div className="text-zinc-300">
                            <h2 className="text-3xl font-bold text-white mb-2">{book.name}</h2>
                            <div className="flex flex-wrap gap-4 text-sm text-zinc-400 mb-6">
                                <div className="flex items-center gap-1">
                                    <User size={16} />
                                    <span>{author}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <Globe size={16} />
                                    <span>{book.languages?.join(', ').toUpperCase()}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <Calendar size={16} />
                                    <span>{getReleaseDate(book)}</span>
                                </div>
                                {book.total_chapters && (
                                    <div className="flex items-center gap-1">
                                        <BookOpen size={16} />
                                        <span>{book.total_chapters} Chapters</span>
                                    </div>
                                )}
                                <div className="flex items-center gap-1">
                                    <Clock size={16} />
                                    <span>{getDurationString(book)}</span>
                                </div>
                            </div>

                            <div className="prose prose-invert prose-purple max-w-none">
                                <h3 className="text-lg font-semibold text-white mb-2">Summary</h3>
                                <div className="text-zinc-400 leading-relaxed space-y-4 text-justify" dangerouslySetInnerHTML={{ __html: description }} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
