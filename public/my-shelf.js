let myBooks = JSON.parse(localStorage.getItem('myShelfBooks')) || [];
let currentFilter = 'all';
let currentBookId = null;

// Render books
function renderBooks(filter = 'all') {
    const booksGrid = document.getElementById('books-grid');
    const emptyState = document.getElementById('empty-state');
    
    if (!booksGrid) return;
    
    let filteredBooks = myBooks;
    
    if (filter !== 'all') {
        filteredBooks = myBooks.filter(book => book.status === filter);
    }
    
    if (filteredBooks.length === 0) {
        booksGrid.innerHTML = '';
        if (emptyState) emptyState.classList.add('show');
        return;
    }
    
    if (emptyState) emptyState.classList.remove('show');
    
    booksGrid.innerHTML = filteredBooks.map(book => `
        <div class="book-card">
            <img src="${book.cover}" alt="${book.title}" onerror="this.src='https://via.placeholder.com/200x300?text=No+Cover'">
            <h3>${truncateText(book.title, 50)}</h3>
            <p class="author">👤 ${truncateText(book.author, 40)}</p>
            <span class="badge ${book.status}">${getStatusLabel(book.status)}</span>
            ${book.progress > 0 && book.progress < 100 ? `
                <div class="progress-bar-container">
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${book.progress}%"></div>
                    </div>
                    <p class="progress-text">${book.progress}% complete</p>
                </div>
            ` : ''}
            <div class="book-actions">
                ${book.status === 'reading' ? 
                    `<button class="update-btn" onclick="openProgressModal('${book.id}')">Update</button>` :
                    book.status === 'completed' ?
                    '<button class="update-btn completed-btn" disabled>✓ Done</button>' :
                    `<button class="update-btn" onclick="startReading('${book.id}')">Start</button>`
                }
                <button class="delete-btn" onclick="removeBook('${book.id}')">Remove</button>
            </div>
        </div>
    `).join('');
    
    updateStats();
}

// Get status label
function getStatusLabel(status) {
    const labels = {
        'reading': '📖 Reading',
        'saved': '🔖 To Read',
        'completed': '✅ Completed'
    };
    return labels[status] || 'Saved';
}

// Truncate text
function truncateText(text, maxLength) {
    if (text.length > maxLength) {
        return text.substring(0, maxLength) + '...';
    }
    return text;
}

// Update stats
function updateStats() {
    const allCount = document.getElementById('all-count');
    const readingTabCount = document.getElementById('reading-tab-count');
    const savedCount = document.getElementById('saved-count');
    const completedCount = document.getElementById('completed-count');
    
    if (allCount) allCount.textContent = myBooks.length;
    if (readingTabCount) readingTabCount.textContent = myBooks.filter(b => b.status === 'reading').length;
    if (savedCount) savedCount.textContent = myBooks.filter(b => b.status === 'saved').length;
    if (completedCount) completedCount.textContent = myBooks.filter(b => b.status === 'completed').length;
    
    // Update sidebar stats
    const totalBooks = document.getElementById('total-books');
    const readingCount = document.getElementById('reading-count');
    
    if (totalBooks) totalBooks.textContent = myBooks.length;
    if (readingCount) readingCount.textContent = myBooks.filter(b => b.status === 'reading').length;
}

// Remove book
function removeBook(id) {
    if (confirm('Remove this book from your shelf?')) {
        myBooks = myBooks.filter(book => book.id !== id);
        localStorage.setItem('myShelfBooks', JSON.stringify(myBooks));
        renderBooks(currentFilter);
        showNotification('📚 Book removed from shelf');
    }
}

// Start reading
function startReading(id) {
    const book = myBooks.find(b => b.id === id);
    if (book) {
        book.status = 'reading';
        book.progress = 0;
        localStorage.setItem('myShelfBooks', JSON.stringify(myBooks));
        renderBooks(currentFilter);
        showNotification('📖 Started reading!');
    }
}

// Open progress modal
function openProgressModal(id) {
    currentBookId = id;
    const book = myBooks.find(b => b.id === id);
    if (book) {
        document.getElementById('progress-slider').value = book.progress || 0;
        document.getElementById('progress-display').textContent = book.progress || 0;
        document.getElementById('progress-modal').classList.add('active');
    }
}

// Close progress modal
function closeProgressModal() {
    document.getElementById('progress-modal').classList.remove('active');
    currentBookId = null;
}

// Save progress
function saveProgress() {
    const progress = parseInt(document.getElementById('progress-slider').value);
    const book = myBooks.find(b => b.id === currentBookId);
    
    if (book) {
        book.progress = progress;
        if (progress === 100) {
            book.status = 'completed';
            showNotification('🎉 Book completed!');
        } else if (progress > 0) {
            book.status = 'reading';
            showNotification(`📖 Progress updated: ${progress}%`);
        }
        localStorage.setItem('myShelfBooks', JSON.stringify(myBooks));
        renderBooks(currentFilter);
        closeProgressModal();
    }
}

// Show notification
function showNotification(message) {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, #ff5722, #e91e63);
        color: white;
        padding: 15px 25px;
        border-radius: 10px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
        z-index: 10000;
        font-weight: 600;
    `;
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateY(-20px)';
        notification.style.transition = 'all 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Progress slider update
document.addEventListener('DOMContentLoaded', () => {
    const slider = document.getElementById('progress-slider');
    if (slider) {
        slider.addEventListener('input', (e) => {
            document.getElementById('progress-display').textContent = e.target.value;
        });
    }
    
    // Filter tabs
    document.querySelectorAll('.tab-btn').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.tab-btn').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            currentFilter = tab.dataset.filter;
            renderBooks(currentFilter);
        });
    });
    
    // Close modal on outside click
    document.getElementById('progress-modal')?.addEventListener('click', (e) => {
        if (e.target.id === 'progress-modal') {
            closeProgressModal();
        }
    });
    
    // Initialize
    renderBooks();
});

// Listen for storage changes
window.addEventListener('storage', (e) => {
    if (e.key === 'myShelfBooks') {
        myBooks = JSON.parse(e.newValue) || [];
        renderBooks(currentFilter);
    }
});
