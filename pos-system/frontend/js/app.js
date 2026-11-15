// app.js
import './router.js';

// Apply dark mode on initial load
if (localStorage.getItem('darkMode') === 'true') {
    document.body.classList.add('dark-mode');
}
