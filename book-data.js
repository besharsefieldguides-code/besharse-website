/**
 * BESHARSE FIELD GUIDES - BOOK DATA MANAGER
 * Add new books to this list. They will automatically format into a clean grid!
 */

const myBooks = [
    {
        id: "book-1",
        title: "The Snakes of Arkansas",
        coverImage: "https://images.unsplash.com/photo-1623091411395-09e79fdbfcf3?q=80&w=600&auto=format&fit=crop",
        pages: "320",
        store: "Coming Soon",
        purchaseLink: "#",
        description: "A comprehensive guide to identifying venomous and non-venomous snakes native to Arkansas. This book breaks down scale patterns, habitat preferences, and dispels common myths."
    }
];

// Adding 20 "Coming Soon" placeholders to fill the grid
for (let i = 2; i <= 21; i++) {
    myBooks.push({
        id: "book-" + i,
        title: "Coming Soon...",
        coverImage: "https://images.unsplash.com/photo-1544816155-12df9643f363?q=80&w=600&auto=format&fit=crop",
        pages: "---",
        store: "---",
        purchaseLink: "#",
        description: "This field guide is currently in development. Check back later for more updates on upcoming releases from Besharse Field Guides."
    });
}

function renderBooks() {
    const container = document.getElementById('book-list-container');
    if (!container) return;

    container.innerHTML = ''; 

    myBooks.forEach(book => {
        let storeHtml = '';
        if (book.purchaseLink !== "#" && book.purchaseLink !== "") {
            storeHtml = `<a href="${book.purchaseLink}" class="store-link" target="_blank">Available At: ${book.store} &rarr;</a>`;
        } else {
            storeHtml = `<p class="store-link" style="color: #666;">Available At: ${book.store}</p>`;
        }

        const bookHTML = `
            <div class="book-card">
                <img src="${book.coverImage}" alt="${book.title}" class="book-cover">
                <div class="book-info">
                    <h2>${book.title}</h2>
                    <div class="book-meta">
                        <p><strong>Pages:</strong> ${book.pages}</p>
                    </div>
                    <p class="book-desc">${book.description}</p>
                    ${storeHtml}
                </div>
            </div>
        `;
        container.innerHTML += bookHTML;
    });
}

document.addEventListener('DOMContentLoaded', renderBooks);
