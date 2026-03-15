// Initialize
let contributions = JSON.parse(localStorage.getItem('contributions')) || [];
let selectedRating = 0;

document.addEventListener('DOMContentLoaded', () => {
    loadContributions();
    updateStats();
    setupStarRating();
});

// Open Modal
function openModal(modalId) {
    document.getElementById(modalId).classList.add('active');
    document.body.style.overflow = 'hidden';
}

// Close Modal
function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('active');
    document.body.style.overflow = 'auto';
    selectedRating = 0;
    resetStars();
}

// Setup Star Rating
function setupStarRating() {
    const stars = document.querySelectorAll('.star');
    stars.forEach(star => {
        star.addEventListener('click', () => {
            selectedRating = parseInt(star.dataset.rating);
            updateStars(selectedRating);
        });
    });
}

// Update Stars
function updateStars(rating) {
    const stars = document.querySelectorAll('.star');
    stars.forEach((star, index) => {
        if (index < rating) {
            star.classList.add('active');
            star.textContent = '★';
        } else {
            star.classList.remove('active');
            star.textContent = '☆';
        }
    });
}

// Reset Stars
function resetStars() {
    const stars = document.querySelectorAll('.star');
    stars.forEach(star => {
        star.classList.remove('active');
        star.textContent = '☆';
    });
}

// Submit Book Recommendation
function submitBook(event) {
    event.preventDefault();
    const form = event.target;
    const contribution = {
        id: Date.now(),
        type: 'book',
        title: form[0].value,
        author: form[1].value,
        genre: form[2].value,
        description: form[3].value,
        date: new Date().toLocaleDateString()
    };
    
    contributions.unshift(contribution);
    localStorage.setItem('contributions', JSON.stringify(contributions));
    
    showNotification('📚 Book recommendation submitted successfully!');
    closeModal('book-modal');
    form.reset();
    loadContributions();
    updateStats();
}

// Submit Review
function submitReview(event) {
    event.preventDefault();
    const form = event.target;
    
    if (selectedRating === 0) {
        showNotification('⭐ Please select a rating', 'error');
        return;
    }
    
    const contribution = {
        id: Date.now(),
        type: 'review',
        title: form[0].value,
        rating: selectedRating,
        review: form[1].value,
        date: new Date().toLocaleDateString()
    };
    
    contributions.unshift(contribution);
    localStorage.setItem('contributions', JSON.stringify(contributions));
    
    showNotification('⭐ Review submitted successfully!');
    closeModal('review-modal');
    form.reset();
    selectedRating = 0;
    resetStars();
    loadContributions();
    updateStats();
}

// Submit Quote
function submitQuote(event) {
    event.preventDefault();
    const form = event.target;
    const contribution = {
        id: Date.now(),
        type: 'quote',
        quote: form[0].value,
        book: form[1].value,
        author: form[2].value,
        date: new Date().toLocaleDateString()
    };
    
    contributions.unshift(contribution);
    localStorage.setItem('contributions', JSON.stringify(contributions));
    
    showNotification('💬 Quote shared successfully!');
    closeModal('quote-modal');
    form.reset();
    loadContributions();
    updateStats();
}

// Submit Reading List
function submitList(event) {
    event.preventDefault();
    const form = event.target;
    const contribution = {
        id: Date.now(),
        type: 'list',
        title: form[0].value,
        category: form[1].value,
        description: form[2].value,
        books: form[3].value.split('\n').filter(b => b.trim()),
        date: new Date().toLocaleDateString()
    };
    
    contributions.unshift(contribution);
    localStorage.setItem('contributions', JSON.stringify(contributions));
    
    showNotification('📝 Reading list created successfully!');
    closeModal('list-modal');
    form.reset();
    loadContributions();
    updateStats();
}

// Load Contributions
function loadContributions() {
    const list = document.getElementById('contributions-list');
    
    if (contributions.length === 0) {
        list.innerHTML = `
            <div style="text-align: center; padding: 60px 20px; color: #999;">
                <div style="font-size: 60px; margin-bottom: 15px;">📝</div>
                <p style="font-size: 18px;">No contributions yet. Be the first to contribute!</p>
            </div>
        `;
        return;
    }
    
    list.innerHTML = contributions.slice(0, 10).map(contrib => {
        const icons = {
            book: '📚',
            review: '⭐',
            quote: '💬',
            list: '📝'
        };
        
        let content = '';
        if (contrib.type === 'book') {
            content = `<strong>${contrib.title}</strong> by ${contrib.author} - ${contrib.description}`;
        } else if (contrib.type === 'review') {
            content = `<strong>${contrib.title}</strong> - ${'★'.repeat(contrib.rating)}${'☆'.repeat(5-contrib.rating)} - ${contrib.review}`;
        } else if (contrib.type === 'quote') {
            content = `"${contrib.quote}" - <strong>${contrib.book}</strong> by ${contrib.author}`;
        } else if (contrib.type === 'list') {
            content = `<strong>${contrib.title}</strong> (${contrib.category}) - ${contrib.books.length} books`;
        }
        
        return `
            <div class="contribution-item">
                <div class="contrib-icon">${icons[contrib.type]}</div>
                <div class="contrib-content">
                    <div class="contrib-title">${getContribType(contrib.type)}</div>
                    <div class="contrib-text">${content}</div>
                    <div class="contrib-meta">Submitted on ${contrib.date}</div>
                </div>
            </div>
        `;
    }).join('');
}

// Get Contribution Type Label
function getContribType(type) {
    const labels = {
        book: 'Book Recommendation',
        review: 'Book Review',
        quote: 'Book Quote',
        list: 'Reading List'
    };
    return labels[type] || type;
}

// Update Stats
function updateStats() {
    const contribCount = document.getElementById('contributions-count');
    const reviewsCount = document.getElementById('reviews-count');
    
    if (contribCount) contribCount.textContent = contributions.length;
    if (reviewsCount) reviewsCount.textContent = contributions.filter(c => c.type === 'review').length;
}

// Show Notification
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'error' ? 'linear-gradient(135deg, #e74c3c, #c0392b)' : 'linear-gradient(135deg, #ff5722, #e91e63)'};
        color: white;
        padding: 18px 30px;
        border-radius: 12px;
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
        z-index: 10000;
        font-weight: 600;
        font-size: 15px;
        animation: slideIn 0.3s ease;
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

// Close modal on outside click
document.querySelectorAll('.modal').forEach(modal => {
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal(modal.id);
        }
    });
});

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        document.querySelectorAll('.modal.active').forEach(modal => {
            closeModal(modal.id);
        });
    }
});
