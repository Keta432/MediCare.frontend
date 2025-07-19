const BASE_URL = import.meta.env.VITE_API_BASE_URL || 
    (window.location.hostname === 'localhost' ? 'http://localhost:5000' : 'https://thesnay-medicare-intern.hf.space');

export default BASE_URL;
