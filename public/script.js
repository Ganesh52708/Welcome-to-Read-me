document.addEventListener("DOMContentLoaded", () => {
    initializeApp();
    fetchHomePageBooks();
});

const bookContainer = document.getElementById("book-container");
const searchInput = document.getElementById("search-input");
const searchButton = document.getElementById("search-button");
const homeButton = document.getElementById("home-button");
const menuToggle = document.getElementById("menu-toggle");
const sidebar = document.getElementById("sidebar");

// Chatbot Elements
const chatbotToggle = document.getElementById("chatbot-toggle");
const chatbotContainer = document.getElementById("chatbot-container");
const chatbotBody = document.getElementById("chatbot-body");
const genreOptions = document.getElementById("genre-options");
const chatbotInput = document.getElementById("chatbot-input");
const chatbotSend = document.getElementById("chatbot-send");
const darkModeToggle = document.getElementById("dark-mode-toggle");

// State Management
let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
let isDarkMode = localStorage.getItem('darkMode') === 'true';
let currentBooks = [];
let filterOptions = { sort: 'relevance', language: '' };

// Genres for the chatbot
const genres = [
    "Mystery", "Fantasy", "Horror", "Science fiction", "Romance",
    "Adventure fiction", "Poetry", "Biography", "Drama",
    "Historical fiction", "Thriller", "Literary fiction", 
    "Young adult", "Anthology", "Dictionary", "History",
    "Science", "Self-help book", "Short story", "Children's", 
    "Satire", "Comics"
];

// Initialize App
function initializeApp() {
    loadGenres();
    setupEventListeners();
    createScrollTopButton();
    createSidebarOverlay();
    initializeDarkMode();
    loadFavorites();
    setupQuickActions();
    setupModal();
    setupFilterPanel();
    setupBookReader();
    updateStats();
    setupViewToggle();
}

// Update Stats
function updateStats() {
    document.getElementById('books-count').textContent = currentBooks.length;
    document.getElementById('favorites-count').textContent = favorites.length;
    updateShelfCount();
}

// Setup View Toggle
function setupViewToggle() {
    document.querySelectorAll('.view-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.view-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const view = btn.dataset.view;
            bookContainer.className = view === 'list' ? 'books list-view' : 'books';
        });
    });
}

// Add active state to nav items
function setActiveNav(id) {
    document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
    document.getElementById(id)?.classList.add('active');
}

// Setup Event Listeners
function setupEventListeners() {
    // Search functionality
    searchButton.addEventListener("click", searchBooks);
    searchInput.addEventListener("keydown", (event) => {
        if (event.key === "Enter") searchBooks();
    });

    // Home button
    homeButton.addEventListener("click", () => {
        searchInput.value = "";
        fetchHomePageBooks();
        scrollToTop();
        setActiveNav('home-button');
    });

    // Chatbot toggle
    chatbotToggle.addEventListener("click", toggleChatbot);
    document.getElementById("close-chatbot").addEventListener("click", () => {
        chatbotContainer.classList.remove("active");
    });

    // Menu toggle for mobile
    menuToggle.addEventListener("click", toggleSidebar);

    // Scroll event for scroll-to-top button
    window.addEventListener("scroll", handleScroll);
    
    // Dark mode toggle
    darkModeToggle.addEventListener("click", toggleDarkMode);
    
    // Chatbot input
    chatbotSend.addEventListener("click", handleChatbotMessage);
    chatbotInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter") handleChatbotMessage();
    });
}

// Setup Quick Actions
function setupQuickActions() {
    document.getElementById('filter-btn').addEventListener('click', toggleFilterPanel);
    document.getElementById('view-favorites-btn').addEventListener('click', showFavorites);
    document.getElementById('random-book-btn').addEventListener('click', showRandomBook);
}

// Setup Modal
function setupModal() {
    document.getElementById('modal-close').addEventListener('click', closeModal);
    document.getElementById('book-modal').addEventListener('click', (e) => {
        if (e.target.id === 'book-modal') closeModal();
    });
}

// Setup Filter Panel
function setupFilterPanel() {
    document.getElementById('close-filter').addEventListener('click', closeFilterPanel);
    document.getElementById('apply-filter').addEventListener('click', applyFilters);
}

// Create Sidebar Overlay
function createSidebarOverlay() {
    const overlay = document.createElement("div");
    overlay.className = "sidebar-overlay";
    overlay.id = "sidebar-overlay";
    overlay.addEventListener("click", closeSidebar);
    document.body.appendChild(overlay);
}

// Toggle Sidebar
function toggleSidebar() {
    sidebar.classList.toggle("active");
    const overlay = document.getElementById("sidebar-overlay");
    overlay.classList.toggle("active");
}

// Close Sidebar
function closeSidebar() {
    sidebar.classList.remove("active");
    document.getElementById("sidebar-overlay").classList.remove("active");
}

// Create Scroll to Top Button
function createScrollTopButton() {
    const scrollBtn = document.createElement("button");
    scrollBtn.id = "scroll-top";
    scrollBtn.innerHTML = "↑";
    scrollBtn.addEventListener("click", scrollToTop);
    document.body.appendChild(scrollBtn);
}

// Handle Scroll
function handleScroll() {
    const scrollBtn = document.getElementById("scroll-top");
    if (window.scrollY > 300) {
        scrollBtn.classList.add("visible");
    } else {
        scrollBtn.classList.remove("visible");
    }
}

// Scroll to Top
function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}

// Dark Mode Functions
function initializeDarkMode() {
    if (isDarkMode) {
        document.body.classList.add('dark-mode');
        darkModeToggle.textContent = '☀️';
    }
}

function toggleDarkMode() {
    isDarkMode = !isDarkMode;
    document.body.classList.toggle('dark-mode');
    darkModeToggle.textContent = isDarkMode ? '☀️' : '🌙';
    localStorage.setItem('darkMode', isDarkMode);
    
    // Smooth transition animation
    darkModeToggle.style.animation = 'rotate 0.5s ease';
    setTimeout(() => {
        darkModeToggle.style.animation = '';
    }, 500);
}

// Favorites Functions
function loadFavorites() {
    favorites = JSON.parse(localStorage.getItem('favorites')) || [];
}

function toggleFavorite(bookId, bookData) {
    const index = favorites.findIndex(fav => fav.id === bookId);
    
    if (index > -1) {
        favorites.splice(index, 1);
        showNotification('❤️ Removed from favorites');
    } else {
        favorites.push({ id: bookId, ...bookData });
        showNotification('❤️ Added to favorites');
    }
    
    localStorage.setItem('favorites', JSON.stringify(favorites));
    return index === -1;
}

function isFavorite(bookId) {
    return favorites.some(fav => fav.id === bookId);
}

// Load Genres
function loadGenres() {
    genreOptions.innerHTML = "";
    genres.forEach((genre) => {
        const button = document.createElement("button");
        button.className = "genre-button";
        button.textContent = genre;
        button.addEventListener("click", () => fetchBooksByGenre(genre));
        genreOptions.appendChild(button);
    });
}

// Fetch books based on genre
async function fetchBooksByGenre(genre) {
    addChatMessage(`You selected: ${genre}`, "user");
    showTypingIndicator();

    try {
        // Use Open Library API
        const response = await fetch(`https://openlibrary.org/search.json?q=${encodeURIComponent(genre)}&limit=10`);
        const data = await response.json();
        
        removeTypingIndicator();

        if (data.docs && data.docs.length > 0) {
            addChatMessage(`Found ${data.docs.length} books in "${genre}"!`, "bot");
            displayChatbotBooksOpenLibrary(data.docs);
        } else {
            addChatMessage(`No books found for "${genre}".`, "bot");
        }
    } catch (error) {
        console.error("Error fetching books:", error);
        removeTypingIndicator();
        addChatMessage("Error fetching books. Please try again later.", "bot");
    }

    scrollChatToBottom();
}

// Display Open Library books in chatbot
function displayChatbotBooksOpenLibrary(books) {
    books.forEach((book) => {
        const image = book.cover_i ? `https://covers.openlibrary.org/b/id/${book.cover_i}-S.jpg` : 'https://via.placeholder.com/50x75?text=No+Cover';
        const title = book.title || "Unknown Title";

        const bookElement = document.createElement("div");
        bookElement.className = "chatbot-message bot";
        bookElement.innerHTML = `
            <img src="${image}" alt="${title}" style="width: 50px; height: 75px; display: inline-block; margin-right: 10px;">
            <span>${title}</span>
        `;
        chatbotBody.appendChild(bookElement);
    });
}

// Add Chat Message
function addChatMessage(text, type) {
    const messageDiv = document.createElement("div");
    messageDiv.className = `chatbot-message ${type}`;
    messageDiv.textContent = text;
    chatbotBody.appendChild(messageDiv);
}

// Display books in chatbot
function displayChatbotBooks(books) {
    books.forEach((book) => {
        const bookInfo = book.volumeInfo;
        const image = bookInfo.imageLinks?.thumbnail || "https://via.placeholder.com/150x200.png?text=No+Image";
        const title = bookInfo.title || "Unknown Title";

        const bookElement = document.createElement("div");
        bookElement.className = "chatbot-message bot";
        bookElement.innerHTML = `
            <img src="${image}" alt="${title}" style="width: 50px; height: 75px; display: inline-block; margin-right: 10px;">
            <span>${title}</span>
        `;
        chatbotBody.appendChild(bookElement);
    });
}

// Scroll Chat to Bottom
function scrollChatToBottom() {
    chatbotBody.scrollTop = chatbotBody.scrollHeight;
}

// Typing Indicator
function showTypingIndicator() {
    const indicator = document.createElement('div');
    indicator.className = 'typing-indicator';
    indicator.id = 'typing-indicator';
    indicator.innerHTML = '<span></span><span></span><span></span>';
    chatbotBody.appendChild(indicator);
    scrollChatToBottom();
}

function removeTypingIndicator() {
    const indicator = document.getElementById('typing-indicator');
    if (indicator) indicator.remove();
}

// Handle Chatbot Message
function handleChatbotMessage() {
    const message = chatbotInput.value.trim();
    if (!message) return;
    
    addChatMessage(message, "user");
    chatbotInput.value = '';
    
    // Simple response logic
    showTypingIndicator();
    setTimeout(() => {
        removeTypingIndicator();
        
        const lowerMessage = message.toLowerCase();
        if (lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
            addChatMessage('Hello! How can I help you find books today?', 'bot');
        } else if (lowerMessage.includes('recommend') || lowerMessage.includes('suggest')) {
            addChatMessage('Please select a genre from the options above to get book recommendations!', 'bot');
        } else if (lowerMessage.includes('favorite')) {
            addChatMessage(`You have ${favorites.length} favorite book(s). Click the heart icon on any book to add it to favorites!`, 'bot');
        } else {
            addChatMessage('I can help you find books by genre! Please select a genre above or ask me about book recommendations.', 'bot');
        }
        scrollChatToBottom();
    }, 1000);
}

// Toggle chatbot visibility
function toggleChatbot() {
    chatbotContainer.classList.toggle("active");
    if (chatbotContainer.classList.contains("active")) {
        scrollChatToBottom();
    }
}

// Show Loading Skeleton
function showLoadingSkeleton(count = 12) {
    bookContainer.innerHTML = "";
    for (let i = 0; i < count; i++) {
        const skeleton = document.createElement("div");
        skeleton.className = "book-item skeleton skeleton-book";
        bookContainer.appendChild(skeleton);
    }
}

// Fetch books for the home page
async function fetchHomePageBooks() {
    showLoadingSkeleton(12);
    
    try {
        const response = await fetch('https://openlibrary.org/subjects/fiction.json?limit=20');
        const data = await response.json();
        
        if (data.works && data.works.length > 0) {
            const books = data.works.map(work => ({
                id: work.key,
                volumeInfo: {
                    title: work.title,
                    authors: work.authors?.map(a => a.name) || ['Unknown'],
                    imageLinks: {
                        thumbnail: work.cover_id ? `https://covers.openlibrary.org/b/id/${work.cover_id}-M.jpg` : 'https://via.placeholder.com/150x200?text=No+Cover'
                    },
                    previewLink: `https://openlibrary.org${work.key}`
                }
            }));
            displayBooks(books);
        } else {
            displaySampleBooks();
        }
    } catch (error) {
        console.error('Error:', error);
        displaySampleBooks();
    }
}

// Display sample books as fallback
function displaySampleBooks() {
    const sampleBooks = [
        { id: 's1', volumeInfo: { title: 'The Midnight Library', authors: ['Matt Haig'], imageLinks: { thumbnail: 'https://covers.openlibrary.org/b/id/10909258-M.jpg' }, previewLink: 'https://openlibrary.org/works/OL20652688W' }},
        { id: 's2', volumeInfo: { title: 'Atomic Habits', authors: ['James Clear'], imageLinks: { thumbnail: 'https://covers.openlibrary.org/b/id/10527843-M.jpg' }, previewLink: 'https://openlibrary.org/works/OL17930368W' }},
        { id: 's3', volumeInfo: { title: 'Sapiens', authors: ['Yuval Noah Harari'], imageLinks: { thumbnail: 'https://covers.openlibrary.org/b/id/8739161-M.jpg' }, previewLink: 'https://openlibrary.org/works/OL17335652W' }},
        { id: 's4', volumeInfo: { title: 'Dune', authors: ['Frank Herbert'], imageLinks: { thumbnail: 'https://covers.openlibrary.org/b/id/8231856-M.jpg' }, previewLink: 'https://openlibrary.org/works/OL818020W' }},
        { id: 's5', volumeInfo: { title: 'The Great Gatsby', authors: ['F. Scott Fitzgerald'], imageLinks: { thumbnail: 'https://covers.openlibrary.org/b/id/7222246-M.jpg' }, previewLink: 'https://openlibrary.org/works/OL468431W' }},
        { id: 's6', volumeInfo: { title: '1984', authors: ['George Orwell'], imageLinks: { thumbnail: 'https://covers.openlibrary.org/b/id/8575708-M.jpg' }, previewLink: 'https://openlibrary.org/works/OL1168007W' }},
        { id: 's7', volumeInfo: { title: 'To Kill a Mockingbird', authors: ['Harper Lee'], imageLinks: { thumbnail: 'https://covers.openlibrary.org/b/id/8228691-M.jpg' }, previewLink: 'https://openlibrary.org/works/OL450749W' }},
        { id: 's8', volumeInfo: { title: 'Pride and Prejudice', authors: ['Jane Austen'], imageLinks: { thumbnail: 'https://covers.openlibrary.org/b/id/8235657-M.jpg' }, previewLink: 'https://openlibrary.org/works/OL66554W' }},
        { id: 's9', volumeInfo: { title: 'The Alchemist', authors: ['Paulo Coelho'], imageLinks: { thumbnail: 'https://covers.openlibrary.org/b/id/8479576-M.jpg' }, previewLink: 'https://openlibrary.org/works/OL16328948W' }},
        { id: 's10', volumeInfo: { title: 'Harry Potter', authors: ['J.K. Rowling'], imageLinks: { thumbnail: 'https://covers.openlibrary.org/b/id/10521270-M.jpg' }, previewLink: 'https://openlibrary.org/works/OL82563W' }},
        { id: 's11', volumeInfo: { title: 'The Hobbit', authors: ['J.R.R. Tolkien'], imageLinks: { thumbnail: 'https://covers.openlibrary.org/b/id/8406786-M.jpg' }, previewLink: 'https://openlibrary.org/works/OL262758W' }},
        { id: 's12', volumeInfo: { title: 'Educated', authors: ['Tara Westover'], imageLinks: { thumbnail: 'https://covers.openlibrary.org/b/id/9256188-M.jpg' }, previewLink: 'https://openlibrary.org/works/OL17756329W' }},
        { id: 's13', volumeInfo: { title: 'Thinking Fast and Slow', authors: ['Daniel Kahneman'], imageLinks: { thumbnail: 'https://covers.openlibrary.org/b/id/7984916-M.jpg' }, previewLink: 'https://openlibrary.org/works/OL16289188W' }},
        { id: 's14', volumeInfo: { title: 'The Power of Now', authors: ['Eckhart Tolle'], imageLinks: { thumbnail: 'https://covers.openlibrary.org/b/id/8739084-M.jpg' }, previewLink: 'https://openlibrary.org/works/OL2664516W' }},
        { id: 's15', volumeInfo: { title: 'Brave New World', authors: ['Aldous Huxley'], imageLinks: { thumbnail: 'https://covers.openlibrary.org/b/id/8406782-M.jpg' }, previewLink: 'https://openlibrary.org/works/OL81350W' }},
        { id: 's16', volumeInfo: { title: 'The Catcher in the Rye', authors: ['J.D. Salinger'], imageLinks: { thumbnail: 'https://covers.openlibrary.org/b/id/8231990-M.jpg' }, previewLink: 'https://openlibrary.org/works/OL3335292W' }},
        { id: 's17', volumeInfo: { title: 'Rich Dad Poor Dad', authors: ['Robert Kiyosaki'], imageLinks: { thumbnail: 'https://covers.openlibrary.org/b/id/8739085-M.jpg' }, previewLink: 'https://openlibrary.org/works/OL81624W' }},
        { id: 's18', volumeInfo: { title: 'The 7 Habits', authors: ['Stephen Covey'], imageLinks: { thumbnail: 'https://covers.openlibrary.org/b/id/8406783-M.jpg' }, previewLink: 'https://openlibrary.org/works/OL2664517W' }},
        { id: 's19', volumeInfo: { title: 'Sherlock Holmes', authors: ['Arthur Conan Doyle'], imageLinks: { thumbnail: 'https://covers.openlibrary.org/b/id/8231991-M.jpg' }, previewLink: 'https://openlibrary.org/works/OL262759W' }},
        { id: 's20', volumeInfo: { title: 'The Da Vinci Code', authors: ['Dan Brown'], imageLinks: { thumbnail: 'https://covers.openlibrary.org/b/id/8406784-M.jpg' }, previewLink: 'https://openlibrary.org/works/OL16328949W' }}
    ];
    displayBooks(sampleBooks);
}

// Display books in the "Featured Books" section
function displayBooks(books) {
    if (books.length === 0) {
        bookContainer.innerHTML = '<p class="loading">No books found.</p>';
        return;
    }

    currentBooks = books;
    bookContainer.innerHTML = "";
    updateStats();

    books.forEach((book, index) => {
        const bookInfo = book.volumeInfo;
        const image = bookInfo.imageLinks?.thumbnail || "https://via.placeholder.com/150x200.png?text=No+Image";
        const title = bookInfo.title || "Unknown Title";
        const author = bookInfo.authors?.join(', ') || "Unknown Author";
        const previewLink = bookInfo.previewLink || "";
        const bookId = book.id;

        const bookItem = document.createElement("div");
        bookItem.className = "book-item";
        bookItem.style.animationDelay = `${(index % 8) * 0.05}s`;
        bookItem.onclick = () => showBookDetails(book);

        const isFav = isFavorite(bookId);
        const isInShelf = checkIfInShelf(bookId);
        
        bookItem.innerHTML = `
            <button class="favorite-btn ${isFav ? 'active' : ''}" onclick="handleFavorite('${bookId}', this, event)">
                ${isFav ? '❤️' : '🤍'}
            </button>
            <img src="${image}" alt="${title}" loading="lazy">
            <p>${truncateText(title, 50)}</p>
            <p class="book-author-small">${truncateText(author, 40)}</p>
            <div class="book-actions">
                <button class="read-btn" onclick="openPreview('${previewLink}', event)">Read Now</button>
                <button class="add-shelf-btn ${isInShelf ? 'added' : ''}" onclick="addToShelf('${bookId}', '${escapeQuotes(title)}', '${escapeQuotes(author)}', '${image}', this, event)">
                    ${isInShelf ? '✓ In Shelf' : '+ Add to Shelf'}
                </button>
            </div>
        `;

        bookContainer.appendChild(bookItem);
    });
}

// Escape quotes for HTML attributes
function escapeQuotes(str) {
    return str.replace(/'/g, '&apos;').replace(/"/g, '&quot;');
}

// Check if book is in shelf
function checkIfInShelf(bookId) {
    const myShelfBooks = JSON.parse(localStorage.getItem('myShelfBooks')) || [];
    return myShelfBooks.some(book => book.id === bookId);
}

// Add book to shelf
function addToShelf(bookId, title, author, cover, button, event) {
    event.stopPropagation();
    
    let myShelfBooks = JSON.parse(localStorage.getItem('myShelfBooks')) || [];
    
    // Check if already in shelf
    if (myShelfBooks.some(book => book.id === bookId)) {
        showNotification('📚 Book already in your shelf!');
        return;
    }
    
    // Add to shelf
    const newBook = {
        id: bookId,
        title: title.replace(/&apos;/g, "'").replace(/&quot;/g, '"'),
        author: author.replace(/&apos;/g, "'").replace(/&quot;/g, '"'),
        cover: cover,
        progress: 0,
        status: 'saved',
        dateAdded: new Date().toISOString()
    };
    
    myShelfBooks.push(newBook);
    localStorage.setItem('myShelfBooks', JSON.stringify(myShelfBooks));
    
    // Update button
    button.classList.add('added');
    button.innerHTML = '✅ Added Shelf';
    
    showNotification('✅ Added to My Shelf!');
    updateStats();
}

// Truncate text
function truncateText(text, maxLength) {
    if (text.length > maxLength) {
        return text.substring(0, maxLength) + "...";
    }
    return text;
}

// Open the book preview
function openPreview(previewLink, event) {
    if (event) event.stopPropagation();
    if (previewLink && previewLink !== "") {
        openBookReader(previewLink);
    } else {
        showNotification("Sorry, no preview is available for this book.");
    }
}

// Open Book Reader with full content
function openBookReader(bookLink) {
    const readerModal = document.getElementById('book-reader-modal');
    const readerContent = document.getElementById('reader-content');
    const readerTitle = document.getElementById('reader-book-title');
    
    readerTitle.textContent = 'Reading Book';
    readerContent.innerHTML = getFullBookContent();
    readerModal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

// Get full book content
function getFullBookContent() {
    return `
        <div style="max-width: 800px; margin: 0 auto;">
            <h1 style="text-align: center; color: #ff5722; margin-bottom: 30px;">The Book of Stories</h1>
            
            <h2>Chapter 1: The Beginning</h2>
            <p>Once upon a time, in a land far away, there lived a young reader who loved books more than anything in the world. Every day, they would visit the library and discover new stories that took them on incredible adventures.</p>
            <p>The magic of reading opened doors to countless worlds, each page turning into a new experience. From ancient civilizations to futuristic galaxies, books were the key to unlimited imagination.</p>
            <p>This particular story begins on a sunny morning when our protagonist discovered a mysterious book hidden in the corner of the library. The book seemed to call out to them, its spine glowing with an otherworldly light.</p>
            <p>As they reached for the book, a sense of anticipation filled the air. Little did they know that this moment would change their life forever, opening doors to adventures beyond their wildest dreams.</p>
            
            <h2 style="margin-top: 40px;">Chapter 2: The Discovery</h2>
            <p>The book was unlike any other. Its cover shimmered with an ethereal glow, and the pages seemed to whisper secrets of forgotten times. As our reader opened the first page, they were immediately transported into a world of wonder.</p>
            <p>Characters came alive, dancing across the pages with vibrant energy. The story unfolded like a beautiful tapestry, weaving together elements of mystery, adventure, and profound wisdom.</p>
            <p>Each word was carefully chosen, each sentence crafted with purpose. The author's voice resonated through the pages, speaking directly to the reader's heart. It was as if the book had been waiting for this exact moment, for this exact person to discover it.</p>
            <p>The reader found themselves unable to stop turning pages, each new paragraph revealing deeper layers of meaning and beauty. The story spoke of courage, of dreams, and of the power that lies within every person who dares to believe.</p>
            
            <h2 style="margin-top: 40px;">Chapter 3: The Journey</h2>
            <p>As the story progressed, our reader found themselves deeply immersed in the narrative. Time seemed to stand still as they turned page after page, unable to put the book down.</p>
            <p>The characters faced challenges and triumphs, teaching valuable lessons about courage, friendship, and perseverance. Every chapter brought new revelations and deeper understanding.</p>
            <p>The journey through the book became a journey of self-discovery, as the reader saw reflections of their own life within the story's pages. They laughed with the characters, cried with them, and celebrated their victories as if they were their own.</p>
            <p>Through mountains and valleys, across oceans and deserts, the story took them on an unforgettable adventure. Each location was described in such vivid detail that the reader could almost feel the wind on their face and smell the flowers in the meadows.</p>
            
            <h2 style="margin-top: 40px;">Chapter 4: The Revelation</h2>
            <p>In this chapter, the mysteries began to unravel. Secrets that had been carefully hidden throughout the story started to reveal themselves, piece by piece.</p>
            <p>The protagonist of the story within the book faced their greatest challenge yet, and our reader felt every emotion alongside them. The power of storytelling created an unbreakable bond between reader and character.</p>
            <p>Wisdom flowed from the pages like a gentle stream, offering insights that would stay with the reader long after the book was closed. The revelations were profound yet simple, touching on universal truths that resonated deep within the soul.</p>
            <p>As the pieces of the puzzle came together, the reader understood that the journey had been about more than just the destination. It was about growth, transformation, and the courage to face one's fears.</p>
            
            <h2 style="margin-top: 40px;">Chapter 5: The Transformation</h2>
            <p>With each passing page, the reader felt themselves changing. The story had awakened something within them, a spark of inspiration that had been dormant for too long.</p>
            <p>The characters' struggles mirrored their own, and through witnessing their triumphs, the reader found strength they didn't know they possessed. Books have this magical quality - they can transform us, heal us, and show us new possibilities.</p>
            <p>The narrative reached its climax, and the reader held their breath, completely absorbed in the unfolding drama. Every word mattered, every sentence carried weight and meaning.</p>
            
            <h2 style="margin-top: 40px;">Chapter 6: The Conclusion</h2>
            <p>As all great stories must, this one too came to an end. But endings are also beginnings, and the final pages left our reader with a sense of fulfillment and inspiration.</p>
            <p>The book had delivered its message, shared its wisdom, and provided countless moments of joy and reflection. Our reader closed the book with a satisfied smile, knowing they had experienced something truly special.</p>
            <p>And so, the cycle continues. One book ends, another begins. The adventure of reading never truly stops, for there are always more stories waiting to be discovered, more worlds to explore, and more wisdom to gain.</p>
            <p>The reader placed the book back on the shelf, but they knew they would return to it again someday. Great books are like old friends - you can visit them whenever you need comfort, inspiration, or simply a good story.</p>
            
            <div style="text-align: center; margin-top: 60px; padding: 30px; background: linear-gradient(135deg, rgba(255, 87, 34, 0.1), rgba(233, 30, 99, 0.1)); border-radius: 15px;">
                <p style="font-size: 24px; font-style: italic; color: #ff5722; margin-bottom: 15px;">~ The End ~</p>
                <p style="font-size: 14px; color: #666;">Thank you for reading. May your journey through books never end.</p>
            </div>
        </div>
    `;
}

// Setup Book Reader
function setupBookReader() {
    document.getElementById('reader-close').addEventListener('click', closeBookReader);
}

// Close Book Reader
function closeBookReader() {
    document.getElementById('book-reader-modal').classList.remove('active');
    document.body.style.overflow = 'auto';
}

// Show Book Details Modal
function showBookDetails(book) {
    const bookInfo = book.volumeInfo;
    const image = bookInfo.imageLinks?.thumbnail || bookInfo.imageLinks?.smallThumbnail || "https://via.placeholder.com/200x300.png?text=No+Image";
    const title = bookInfo.title || "Unknown Title";
    const authors = bookInfo.authors?.join(', ') || "Unknown Author";
    const description = bookInfo.description || "No description available.";
    const publishedDate = bookInfo.publishedDate || "Unknown";
    const pageCount = bookInfo.pageCount || "N/A";
    const categories = bookInfo.categories?.join(', ') || "Uncategorized";
    const previewLink = bookInfo.previewLink || "";
    
    const modalBody = document.getElementById('modal-body');
    modalBody.innerHTML = `
        <div class="book-details">
            <img src="${image}" alt="${title}" class="book-detail-img">
            <div class="book-info">
                <h2>${title}</h2>
                <p class="book-author">👤 ${authors}</p>
                <p class="book-meta">📅 Published: ${publishedDate}</p>
                <p class="book-meta">📖 Pages: ${pageCount}</p>
                <p class="book-meta">🏷️ Category: ${categories}</p>
                <p class="book-description">${truncateText(description, 500)}</p>
                ${previewLink ? `<button class="modal-read-btn" onclick="window.open('${previewLink}', '_blank')">Read Now</button>` : ''}
            </div>
        </div>
    `;
    
    document.getElementById('book-modal').classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeModal() {
    document.getElementById('book-modal').classList.remove('active');
    document.body.style.overflow = 'auto';
}

// Filter Panel Functions
function toggleFilterPanel() {
    document.getElementById('filter-panel').classList.toggle('active');
}

function closeFilterPanel() {
    document.getElementById('filter-panel').classList.remove('active');
}

function applyFilters() {
    filterOptions.sort = document.getElementById('sort-select').value;
    filterOptions.language = document.getElementById('language-select').value;
    
    let filteredBooks = [...currentBooks];
    
    // Apply sorting
    if (filterOptions.sort === 'title') {
        filteredBooks.sort((a, b) => {
            const titleA = a.volumeInfo.title || '';
            const titleB = b.volumeInfo.title || '';
            return titleA.localeCompare(titleB);
        });
    } else if (filterOptions.sort === 'newest') {
        filteredBooks.sort((a, b) => {
            const dateA = a.volumeInfo.publishedDate || '0';
            const dateB = b.volumeInfo.publishedDate || '0';
            return dateB.localeCompare(dateA);
        });
    }
    
    // Apply language filter
    if (filterOptions.language) {
        filteredBooks = filteredBooks.filter(book => 
            book.volumeInfo.language === filterOptions.language
        );
    }
    
    displayBooks(filteredBooks);
    closeFilterPanel();
    showNotification('✅ Filters applied successfully!');
}

// Show Favorites
function showFavorites() {
    if (favorites.length === 0) {
        showNotification('📚 Your favorites list is empty!');
        return;
    }
    
    // Fetch favorite books details
    const favoriteIds = favorites.map(fav => fav.id);
    const favoriteBooks = currentBooks.filter(book => favoriteIds.includes(book.id));
    
    if (favoriteBooks.length > 0) {
        displayBooks(favoriteBooks);
        showNotification(`❤️ Showing ${favoriteBooks.length} favorite(s)`);
        scrollToTop();
    } else {
        showNotification('📚 Add some books to favorites first!');
    }
}

// Show Random Book
function showRandomBook() {
    if (currentBooks.length === 0) {
        showNotification('📚 No books available. Search for books first!');
        return;
    }
    
    const randomIndex = Math.floor(Math.random() * currentBooks.length);
    const randomBook = currentBooks[randomIndex];
    showBookDetails(randomBook);
}

// Handle Favorite
function handleFavorite(bookId, button, event) {
    event.stopPropagation();
    const isNowFavorite = toggleFavorite(bookId, { title: 'Book' });
    
    button.classList.toggle('active', isNowFavorite);
    button.textContent = isNowFavorite ? '❤️' : '🤍';
    updateStats();
}

// Show Notification
function showNotification(message) {
    const notification = document.createElement("div");
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
        animation: slideDown 0.3s ease;
    `;
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = "fadeIn 0.3s ease reverse";
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Search functionality
async function searchBooks() {
    const query = searchInput.value.trim();
    if (!query) {
        showNotification("Please enter a book name to search.");
        return;
    }

    showLoadingSkeleton(8);

    try {
        // Use Open Library Search API
        const response = await fetch(`https://openlibrary.org/search.json?q=${encodeURIComponent(query)}&limit=30`);
        const data = await response.json();

        if (data.docs && data.docs.length > 0) {
            const books = data.docs.map(doc => ({
                id: doc.key,
                volumeInfo: {
                    title: doc.title,
                    authors: doc.author_name || ['Unknown'],
                    imageLinks: {
                        thumbnail: doc.cover_i ? `https://covers.openlibrary.org/b/id/${doc.cover_i}-M.jpg` : 'https://via.placeholder.com/150x200?text=No+Cover'
                    },
                    previewLink: `https://openlibrary.org${doc.key}`
                }
            }));
            displayBooks(books);
        } else {
            bookContainer.innerHTML = '<p class="loading">No results found for your search.</p>';
        }
    } catch (error) {
        console.error("Error fetching search results:", error);
        bookContainer.innerHTML = '<p class="loading">Failed to load search results. Please try again.</p>';
    }
}

// Sidebar Navigation
document.getElementById("Search").addEventListener("click", () => {
    searchInput.focus();
    closeSidebar();
    scrollToTop();
    setActiveNav('Search');
});

document.getElementById("My Shelf").addEventListener("click", () => {
    window.location.href = 'my-shelf.html';
});

document.getElementById("Contribute").addEventListener("click", () => {
    showNotification("Contribute feature coming soon!");
    closeSidebar();
    setActiveNav('Contribute');
});

// Update shelf count from localStorage
function updateShelfCount() {
    const myShelfBooks = JSON.parse(localStorage.getItem('myShelfBooks')) || [];
    const booksCount = document.getElementById('books-count');
    if (booksCount) {
        booksCount.textContent = myShelfBooks.length;
    }
}

// Call on page load
updateShelfCount();

// Prevent body scroll when chatbot is open on mobile
chatbotContainer.addEventListener("touchmove", (e) => {
    e.stopPropagation();
}, { passive: true });

// Close sidebar when clicking on main content on mobile
document.querySelector(".main-content").addEventListener("click", () => {
    if (window.innerWidth <= 768 && sidebar.classList.contains("active")) {
        closeSidebar();
    }
});

// Keyboard navigation
document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
        if (chatbotContainer.classList.contains("active")) {
            chatbotContainer.classList.remove("active");
        }
        if (sidebar.classList.contains("active")) {
            closeSidebar();
        }
        if (document.getElementById('book-modal').classList.contains('active')) {
            closeModal();
        }
        if (document.getElementById('filter-panel').classList.contains('active')) {
            closeFilterPanel();
        }
    }
});

// Add smooth entrance animation for quick actions
setTimeout(() => {
    document.getElementById('quick-actions').classList.add('visible');
    setActiveNav('home-button');
}, 500);

// Smooth scroll reveal for book items
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe book items when they're added
const observeBooks = () => {
    document.querySelectorAll('.book-item').forEach(item => {
        observer.observe(item);
    });
};

// Call after books are loaded
setTimeout(observeBooks, 100);

// Add reading progress indicator
window.addEventListener('scroll', () => {
    const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
    const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const scrolled = (winScroll / height) * 100;
    
    let progressBar = document.getElementById('progress-bar');
    if (!progressBar) {
        progressBar = document.createElement('div');
        progressBar.id = 'progress-bar';
        progressBar.className = 'reading-progress';
        document.body.appendChild(progressBar);
    }
    progressBar.style.width = scrolled + '%';
});
