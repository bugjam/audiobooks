import { useState, useEffect, useMemo, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { searchAudiobooks, saveAudiobook, removeAudiobook, checkSavedAudiobooks, getAudiobook } from '../services/spotify';
import Search from './Search';
import FilterSort from './FilterSort';
import BookList from './BookList';
import BookSummary from './BookSummary';
import { Loader2 } from 'lucide-react';

export default function Home() {
    const { token, user, logout } = useAuth();

    // Data State
    const [books, setBooks] = useState([]);
    const [savedIds, setSavedIds] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Pagination State
    const [offset, setOffset] = useState(0);
    const [total, setTotal] = useState(0);
    const [currentQuery, setCurrentQuery] = useState('');

    // UI State
    const [selectedBook, setSelectedBook] = useState(null);
    const [selectedLanguages, setSelectedLanguages] = useState([]);
    const [sortOption, setSortOption] = useState('relevance');

    // Search handler
    const handleSearch = useCallback(async (query) => {
        if (!query.trim()) {
            setBooks([]);
            setTotal(0);
            setCurrentQuery('');
            return;
        }

        // Avoid reloading if query is same (optional, but good for Search component loop prevention) unless we want to force refresh?
        // Actually, Search component calls this on mount/change, so we should allow it but maybe check if loading?
        // Better: Search component debounce handles rapid changes.

        setLoading(true);
        setError(null);
        setOffset(0);
        setCurrentQuery(query);

        try {
            const { items, total } = await searchAudiobooks(query, token, 20, 0);
            setBooks(items);
            setTotal(total);

            // Check saved status for these books
            if (items.length > 0) {
                const ids = items.map(b => b.id);
                const checks = await checkSavedAudiobooks(ids, token);
                const saved = ids.filter((_, i) => checks[i]);
                setSavedIds(prev => [...new Set([...prev, ...saved])]);
            }
        } catch (err) {
            console.error("Search failed", err);
            setError("Failed to search audiobooks. Please try again.");
        } finally {
            setLoading(false);
        }
    }, [token]);

    const handleLoadMore = async () => {
        if (loading || books.length >= total) return;

        const nextOffset = offset + 20;
        setLoading(true);
        try {
            const { items } = await searchAudiobooks(currentQuery, token, 20, nextOffset);
            setBooks(prev => [...prev, ...items]);
            setOffset(nextOffset);

            // Check saved status for new books
            if (items.length > 0) {
                const ids = items.map(b => b.id);
                // Batch checks if > 50? Spotify limits to 50 items per check.
                // Since we fetch 20, we are safe.
                const checks = await checkSavedAudiobooks(ids, token);
                const saved = ids.filter((_, i) => checks[i]);
                setSavedIds(prev => [...new Set([...prev, ...saved])]);
            }
        } catch (err) {
            console.error("Load more failed", err);
        } finally {
            setLoading(false);
        }
    };

    // Filter and Sort Logic
    const availableLanguages = useMemo(() => {
        const langs = new Set();
        books.forEach(b => {
            b.languages?.forEach(l => langs.add(l));
        });
        return Array.from(langs);
    }, [books]);

    const filteredAndSortedBooks = useMemo(() => {
        let result = [...books];

        // Filter
        if (selectedLanguages.length > 0) {
            result = result.filter(b =>
                b.languages?.some(l => selectedLanguages.includes(l))
            );
        }

        // Sort
        if (sortOption === 'author') {
            result.sort((a, b) => (a.authors[0]?.name || '').localeCompare(b.authors[0]?.name || ''));
        } else if (sortOption === 'title') {
            result.sort((a, b) => a.name.localeCompare(b.name));
        } else if (sortOption === 'date') {
            result.sort((a, b) => new Date(b.release_date) - new Date(a.release_date));
        }

        return result;
    }, [books, selectedLanguages, sortOption]);

    // Handlers
    const toggleLanguage = (lang) => {
        setSelectedLanguages(prev =>
            prev.includes(lang) ? prev.filter(l => l !== lang) : [...prev, lang]
        );
    };

    const toggleSave = async (id, shouldSave) => {
        // Optimistic update
        setSavedIds(prev => shouldSave ? [...prev, id] : prev.filter(x => x !== id));

        try {
            if (shouldSave) {
                await saveAudiobook(id, token);
            } else {
                await removeAudiobook(id, token);
            }
        } catch (err) {
            console.error("Failed to update library", err);
            // Revert
            setSavedIds(prev => !shouldSave ? [...prev, id] : prev.filter(x => x !== id));
        }
    };

    const handleSelectBook = async (book) => {
        try {
            // Fetch full details to get chapters/duration
            const fullBook = await getAudiobook(book.id, token);
            setSelectedBook(fullBook);
        } catch (err) {
            console.error("Failed to load full book details", err);
            // Fallback to the search result object
            setSelectedBook(book);
        }
    };

    return (
        <div className="min-h-screen bg-black text-white pb-20">
            <header className="sticky top-0 z-30 bg-black/80 backdrop-blur-md border-b border-zinc-800 px-4 md:px-8 py-4">
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-500 to-purple-300 bg-clip-text text-transparent">
                        Audiobooks
                    </h1>
                    <div className="flex items-center gap-4">
                        <span className="text-sm font-medium text-zinc-400 hidden sm:block">
                            {user?.display_name}
                        </span>
                        <button
                            onClick={logout}
                            className="text-xs md:text-sm px-4 py-2 rounded-full bg-zinc-900 border border-zinc-800 hover:border-purple-500 hover:text-white text-zinc-400 transition-all"
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 md:px-8 mt-8">
                <div className="flex flex-col items-center justify-center mb-10 gap-6">
                    <Search onSearch={handleSearch} />

                    {books.length > 0 && (
                        <FilterSort
                            languages={availableLanguages}
                            selectedLanguages={selectedLanguages}
                            onLanguageChange={toggleLanguage}
                            sortOption={sortOption}
                            onSortChange={setSortOption}
                        />
                    )}
                </div>

                {/* Main Content Area */}
                {loading && books.length === 0 ? (
                    <div className="flex justify-center mt-20">
                        <Loader2 className="animate-spin text-purple-500" size={48} />
                    </div>
                ) : error ? (
                    <div className="text-red-400 text-center mt-10">{error}</div>
                ) : (
                    <>
                        <BookList
                            books={filteredAndSortedBooks}
                            savedIds={savedIds}
                            onSelectBook={handleSelectBook}
                            onToggleSave={toggleSave}
                        />

                        {/* Load More Button */}
                        {books.length > 0 && books.length < total && (
                            <div className="flex justify-center mt-12 mb-8">
                                <button
                                    onClick={handleLoadMore}
                                    disabled={loading}
                                    className="px-6 py-3 rounded-full bg-zinc-800 hover:bg-zinc-700 text-white font-medium transition-colors flex items-center gap-2 disabled:opacity-50"
                                >
                                    {loading ? <Loader2 className="animate-spin h-4 w-4" /> : null}
                                    {loading ? 'Loading...' : 'Load More'}
                                </button>
                            </div>
                        )}
                    </>
                )}
            </main>

            <BookSummary
                book={selectedBook}
                onClose={() => setSelectedBook(null)}
                isSaved={selectedBook && savedIds.includes(selectedBook.id)}
                onToggleSave={toggleSave}
            />
        </div>
    );
}
