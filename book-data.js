/**
 * BESHARSE FIELD GUIDES - BOOK DATA MANAGER
 * To add a new book, change a picture, or update a description, simply edit 
 * the text in this file and upload it to IONOS. Only you have access to these files.
 */

const myBooks = [
    {
        id: "book-1",
        title: "Coming Soon...",
        coverImage: "https://images.unsplash.com/photo-1596707331899-738b479633e2?q=80&w=600&auto=format&fit=crop",
        status: "Planned",
        pages: "---",
        store: "----",
        purchaseLink: "#",
        shortDescription: "Coming Soon...",
        fullDescription: "<p>Check back later for updates on this upcoming guide.</p>"
    }
];

// Helper to fill the grid with placeholders
for (let i = 2; i <= 21; i++) {
    myBooks.push({
        id: "book-" + i,
        title: "Coming Soon...",
        coverImage: "https://images.unsplash.com/photo-1502082977531-15582f6e91f1?q=80&w=600&auto=format&fit=crop",
        status: "Planned",
        pages: "---",
        store: "---",
        purchaseLink: "#",
        shortDescription: "Coming soon.",
        fullDescription: "<p>Check back later for updates on this upcoming guide.</p>"
    });
}

function renderBooks() {
    const container = document.getElementById('book-list-container');
    if (!container) return;

    container.innerHTML = ''; 

    myBooks.forEach(book => {
        const bookHTML = `
            <div class="book-card">
                <img src="${book.coverImage}" alt="${book.title}" class="book-cover">
                <div class="book-info">
                    <h2>${book.title}</h2>
                    <div class="book-meta">
                        <p><strong>Status:</strong> ${book.status}</p>
                        <p><strong>Pages:</strong> ${book.pages}</p>
                        <p><strong>Available At:</strong> ${book.store}</p>
                    </div>
                    <p class="book-desc">${book.shortDescription}</p>
                </div>
            </div>
        `;
        container.innerHTML += bookHTML;
    });
}

document.addEventListener('DOMContentLoaded', renderBooks);
