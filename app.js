import WebTorrent from 'webtorrent';
const client = new WebTorrent();
let currentTorrent = null;
const searchSection = document.getElementById('search-section')
const movieSection = document.getElementById('movie-section')
const searchForm = document.getElementById('search-form')
const movieIdInput = document.getElementById('movie-id')
const loading = document.getElementById('loading')
const errorMessage = document.getElementById('error-message')
const backBtn = document.getElementById('back-btn')
const API_URL = 'https://heavstal.com.ng/api/v1/movies/get'
const API_KEY = 'ht_live_dc81c8539efe85ec3967a6a2f3be86a3'

searchForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = movieIdInput.value;    
    loading.classList.remove('hidden')
    errorMessage.classList.add('hidden')
    
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': API_KEY
            },
            body: JSON.stringify({ id: parseInt(id) })
        });
        const result = await response.json();
        if (result.status === 'success') {
            populateMovieData(result.data);
            startStreaming(result.data.torrents);            
            searchSection.classList.add('hidden');
            movieSection.classList.remove('hidden');
        } else {
            throw new Error(result.message || 'Movie not found');
        }
    } catch (error) {
        errorMessage.textContent = `Error: ${error.message}`;
        errorMessage.classList.remove('hidden');
    } finally {
        loading.classList.add('hidden');
    }
});

backBtn.addEventListener('click', () => {
    movieSection.classList.add('hidden');
    searchSection.classList.remove('hidden');
    if (currentTorrent) {
        currentTorrent.destroy();
        currentTorrent = null;
    }
});

function populateMovieData(data) {
    document.getElementById('movie-poster').src = data.images.poster;
    document.getElementById('movie-title').textContent = data.title;
    document.getElementById('movie-year').textContent = data.year;
    document.getElementById('movie-rating').textContent = data.rating;
    document.getElementById('movie-runtime').textContent = data.runtime_minutes;
    document.getElementById('movie-description').textContent = data.description;
    const genresContainer = document.getElementById('movie-genres');
    genresContainer.innerHTML = '';
    data.genres.forEach(genre => {
        const span = document.createElement('span');
        span.textContent = genre;
        genresContainer.appendChild(span);
    });
    const castContainer = document.getElementById('movie-cast');
    castContainer.innerHTML = '';
    if (data.cast) {
        data.cast.forEach(actor => {
            const div = document.createElement('div');
            div.className = 'cast-member';
            const img = actor.image ? actor.image : 'https://via.placeholder.com/30';
            div.innerHTML = `
                <img src="${img}" alt="${actor.name}">
                <span>${actor.name}</span>
            `;
            castContainer.appendChild(div);
        });
    }
}

function startStreaming(torrents) {
    const statusText = document.getElementById('stream-status');
    const speedText = document.getElementById('download-speed');
    const progressContainer = document.getElementById('progress-container');
    const progressBar = document.getElementById('progress-bar');
    statusText.textContent = 'Connecting to peers...';
    speedText.textContent = '';
    progressContainer.classList.remove('hidden');
    progressBar.style.width = '0%';
    let selectedTorrent = torrents.find(t => t.quality === '1080p') || torrents[0];
    client.add(selectedTorrent.magnet_url, (torrent) => {
        currentTorrent = torrent;
        const file = torrent.files.reduce((a, b) => a.length > b.length ? a : b);        
        statusText.textContent = `Streaming: ${file.name} (Ready to play!)`;
        file.renderTo('video#video-player', {
            autoplay: false,
            controls: true
        });
        torrent.on('download', () => {
            const progress = (torrent.progress * 100).toFixed(1);
            progressBar.style.width = `${progress}%`;            
            const speed = (torrent.downloadSpeed / 1048576).toFixed(2);
            speedText.textContent = `Downloaded: ${progress}% | Speed: ${speed} MB/s | Peers: ${torrent.numPeers}`;
        });
    });
}
