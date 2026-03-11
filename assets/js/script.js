document.addEventListener('DOMContentLoaded', () => {
    // --- Theme Toggle ---
    const themeBtn = document.getElementById('theme-toggle');
    const body = document.body;
    const themeIcon = themeBtn.querySelector('i');

    // Check local storage for theme
    const savedTheme = localStorage.getItem('ceritaku-theme');
    if (savedTheme === 'dark') {
        body.classList.replace('light-theme', 'dark-theme');
        themeIcon.classList.replace('fa-moon', 'fa-sun');
    }

    themeBtn.addEventListener('click', () => {
        if (body.classList.contains('light-theme')) {
            body.classList.replace('light-theme', 'dark-theme');
            themeIcon.classList.replace('fa-moon', 'fa-sun');
            localStorage.setItem('ceritaku-theme', 'dark');
        } else {
            body.classList.replace('dark-theme', 'light-theme');
            themeIcon.classList.replace('fa-sun', 'fa-moon');
            localStorage.setItem('ceritaku-theme', 'light');
        }
    });

    // --- View All Logic ---
    const viewAllBtn = document.getElementById('view-all-btn');
    const profilesContainer = document.getElementById('profiles-container');

    viewAllBtn.addEventListener('click', (e) => {
        e.preventDefault();
        profilesContainer.classList.toggle('show-all');
        if (profilesContainer.classList.contains('show-all')) {
            viewAllBtn.textContent = 'Sembunyikan';
        } else {
            viewAllBtn.textContent = 'Lihat Semua';
            // Scroll back to the section header to avoid being stranded down the page
            document.getElementById('explore-section').scrollIntoView({ behavior: 'smooth' });
        }
    });

    // --- Load Data from Global storiesData ---
    if (typeof storiesData !== 'undefined') {
        loadMainStory(storiesData.main_story);
        setupGenreFilters(storiesData.profiles);
        loadProfiles(storiesData.profiles);
    } else {
        console.error('Data cerita tidak ditemukan!');
    }

    function loadMainStory(story) {
        // Populate hero
        document.getElementById('hero-title').textContent = story.title;
        document.getElementById('hero-desc').textContent = story.description;
        document.getElementById('hero-img').src = story.cover;

        // Populate chapters
        const chaptersContainer = document.getElementById('chapters-container');
        chaptersContainer.innerHTML = '';

        story.chapters.forEach((chapter, index) => {
            const card = document.createElement('div');
            card.className = 'chapter-card';
            card.innerHTML = `
                <h3>${chapter.title}</h3>
                <p>${chapter.content}</p>
            `;
            // Add slight fade in animation delay
            card.style.animation = `fadeInUp 0.5s ease forwards ${index * 0.1}s`;
            card.style.opacity = '0';
            chaptersContainer.appendChild(card);
        });
    }

    function loadProfiles(profiles) {
        const profilesContainer = document.getElementById('profiles-container');
        profilesContainer.innerHTML = '';

        if (profiles.length === 0) {
            profilesContainer.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: var(--text-muted);">Tidak ada cerita dalam genre ini.</p>';
            return;
        }

        profiles.forEach((profile, index) => {
            const wrapper = document.createElement('div');
            wrapper.className = 'story-card';
            wrapper.onclick = () => showStoryDetail(profile.id);
            wrapper.innerHTML = `
                <div class="story-cover">
                    <img src="${profile.cover}" alt="${profile.title}" loading="lazy">
                </div>
                <div class="story-info">
                    <div class="story-title" title="${profile.title}">${profile.title}</div>
                    <div class="story-meta">
                        <span><i class="fa-solid fa-layer-group"></i> ${profile.chapters}</span>
                        <span><i class="fa-solid fa-eye"></i> ${(profile.views / 1000).toFixed(1)}k</span>
                    </div>
                </div>
            `;

            // Add slight fade in animation delay
            wrapper.style.animation = `fadeInUp 0.5s ease forwards ${(index % 5) * 0.1}s`;
            wrapper.style.opacity = '0';
            profilesContainer.appendChild(wrapper);
        });
    }

    // --- Genre Filtering ---
    function setupGenreFilters(profiles) {
        const filtersContainer = document.getElementById('genre-filters');
        filtersContainer.innerHTML = '';

        // Extract unique individual genres
        const genresSet = new Set();
        profiles.forEach(p => {
            if (p.genre) {
                p.genre.split(',').forEach(g => {
                    genresSet.add(g.trim());
                });
            }
        });

        // Sort alphabetically A-Z
        const genres = Array.from(genresSet).sort();

        // "Semua" filter
        const allBtn = document.createElement('button');
        allBtn.className = 'genre-pill active';
        allBtn.textContent = 'Semua';
        allBtn.onclick = () => filterByGenre('Semua', allBtn);
        filtersContainer.appendChild(allBtn);

        // Individual genre filters
        genres.forEach(genre => {
            const btn = document.createElement('button');
            btn.className = 'genre-pill';
            btn.textContent = genre;
            btn.onclick = () => filterByGenre(genre, btn);
            filtersContainer.appendChild(btn);
        });
    }

    function filterByGenre(genreName, btnElement) {
        // Update active class
        document.querySelectorAll('.genre-pill').forEach(btn => btn.classList.remove('active'));
        btnElement.classList.add('active');

        if (genreName === 'Semua') {
            loadProfiles(storiesData.profiles);
        } else {
            const filtered = storiesData.profiles.filter(p => p.genre && p.genre.includes(genreName));
            loadProfiles(filtered);
        }
    }
});

// --- Navigation Functions ---
window.showStoryDetail = function (storyId) {
    const profile = storiesData.profiles.find(p => p.id === storyId);
    if (!profile) return;

    // Hide main sections
    document.querySelector('.hero-section').style.display = 'none';
    document.querySelector('.main-story-chapters').style.display = 'none';
    document.getElementById('explore-section').style.display = 'none';

    // Show detail section and populate data
    const detailSection = document.getElementById('story-detail-section');
    detailSection.style.display = 'block';

    document.getElementById('detail-cover').src = profile.cover;
    document.getElementById('detail-title').textContent = profile.title;
    document.getElementById('detail-genre').textContent = profile.genre;
    document.getElementById('detail-desc').textContent = `Kisah epik berjudul ${profile.title} mengusung genre ${profile.genre}. ${profile.views} orang tercatat telah membaca cerita ini.`;
    document.getElementById('detail-chapters-count').textContent = profile.chapters;
    document.getElementById('detail-views').textContent = (profile.views / 1000).toFixed(1) + 'k';

    // Render Chapters
    const chaptersContainer = document.getElementById('detail-chapters-container');
    chaptersContainer.innerHTML = '';

    if (profile.chapters_data && profile.chapters_data.length > 0) {
        profile.chapters_data.forEach((chapter, index) => {
            const card = document.createElement('div');
            card.className = 'chapter-card';
            card.innerHTML = `
                <h3>${chapter.title}</h3>
                <p>${chapter.content}</p>
            `;
            card.style.animation = `fadeInUp 0.5s ease forwards ${index * 0.1}s`;
            card.style.opacity = '0';
            chaptersContainer.appendChild(card);
        });
    } else {
        chaptersContainer.innerHTML = '<p style="color: var(--text-muted); grid-column: 1/-1;">Belum ada bab yang tersedia.</p>';
    }

    window.scrollTo(0, 0);
};

window.backToMain = function () {
    document.getElementById('story-detail-section').style.display = 'none';
    document.querySelector('.hero-section').style.display = 'flex';
    document.querySelector('.main-story-chapters').style.display = 'block';
    document.getElementById('explore-section').style.display = 'block';
    window.scrollTo(0, 0);
};

// Add dynamic CSS for animations
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeInUp {
        from {
            opacity: 0;
            transform: translateY(20px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
    `;
document.head.appendChild(style);
