const myBooks = [
    {
        id: "book-1",
        title: "The Spiders of Arkansas",
        coverImage: "https://images.unsplash.com/photo-1596707331899-738b479633e2?q=80&w=600&auto=format&fit=crop",
        status: "In Progress",
        pages: "TBD",
        store: "Coming Soon",
        shortDescription: "A comprehensive guide to identifying and understanding native arachnids."
    }
];

// Fill grid with placeholders
for (let i = 2; i <= 21; i++) {
    myBooks.push({
        id: "book-" + i,
        title: "Coming Soon...",
        coverImage: "https://images.unsplash.com/photo-1502082977531-15582f6e91f1?q=80&w=600&auto=format&fit=crop",
        status: "Planned",
        pages: "---",
        store: "---",
        shortDescription: "Check back for updates."
    });
}

function renderBooks() {
    const container = document.getElementById('book-list-container');
    if (!container) {
        console.error("Could not find book-list-container!");
        return;
    }
    
    container.innerHTML = myBooks.map(book => `
        <div class="book-card">
            <img src="${book.coverImage}" alt="${book.title}" class="book-cover">
            <div class="book-info">
                <h2>${book.title}</h2>
                <div class="book-meta">
                    <p><strong>Status:</strong> ${book.status}</p>
                    <p><strong>Pages:</strong> ${book.pages}</p>
                    <p><strong>Store:</strong> ${book.store}</p>
                </div>
                <p class="book-desc">${book.shortDescription}</p>
            </div>
        </div>
    `).join('');
}

// Ensure this runs when the page is fully loaded
window.onload = renderBooks;
