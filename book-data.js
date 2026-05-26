&rarr;</a>`;
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

// Render the books when the page loads
document.addEventListener('DOMContentLoaded', renderBooks);
