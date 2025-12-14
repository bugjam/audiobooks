import BookItem from './BookItem';

export default function BookList({ books, savedIds, onSelectBook, onToggleSave }) {
    if (!books || books.length === 0) {
        return (
            <div className="text-center text-zinc-500 mt-12">
                <p>No audiobooks found.</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
            {books.map(book => (
                <BookItem
                    key={book.id}
                    book={book}
                    isSaved={savedIds.includes(book.id)}
                    onSelect={onSelectBook}
                    onToggleSave={onToggleSave}
                />
            ))}
        </div>
    );
}
