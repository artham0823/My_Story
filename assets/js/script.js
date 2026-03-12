document.addEventListener('DOMContentLoaded', () => {
    // ============================================
    // THEME TOGGLE
    // ============================================
    const themeBtn = document.getElementById('theme-toggle');
    const sidebarThemeBtn = document.getElementById('sidebar-theme-toggle');
    const body = document.body;
    const themeIcon = themeBtn.querySelector('i');
    const sidebarThemeIcon = sidebarThemeBtn.querySelector('i');
    const sidebarThemeText = sidebarThemeBtn.querySelector('span');

    const savedTheme = localStorage.getItem('ceritaku-theme');
    if (savedTheme === 'dark') {
        body.classList.replace('light-theme', 'dark-theme');
        themeIcon.classList.replace('fa-moon', 'fa-sun');
        sidebarThemeIcon.classList.replace('fa-moon', 'fa-sun');
        sidebarThemeText.textContent = 'Mode Terang';
    }

    function toggleTheme() {
        if (body.classList.contains('light-theme')) {
            body.classList.replace('light-theme', 'dark-theme');
            themeIcon.classList.replace('fa-moon', 'fa-sun');
            sidebarThemeIcon.classList.replace('fa-moon', 'fa-sun');
            sidebarThemeText.textContent = 'Mode Terang';
            localStorage.setItem('ceritaku-theme', 'dark');
        } else {
            body.classList.replace('dark-theme', 'light-theme');
            themeIcon.classList.replace('fa-sun', 'fa-moon');
            sidebarThemeIcon.classList.replace('fa-sun', 'fa-moon');
            sidebarThemeText.textContent = 'Mode Gelap';
            localStorage.setItem('ceritaku-theme', 'light');
        }
    }

    themeBtn.addEventListener('click', toggleTheme);
    sidebarThemeBtn.addEventListener('click', toggleTheme);

    // ============================================
    // SIDEBAR (Mobile)
    // ============================================
    const hamburgerBtn = document.getElementById('hamburger-btn');
    const sidebar = document.getElementById('sidebar');
    const sidebarBackdrop = document.getElementById('sidebar-backdrop');
    const sidebarCloseBtn = document.getElementById('sidebar-close-btn');

    function openSidebar() {
        sidebar.classList.add('active');
        sidebarBackdrop.classList.add('active');
        body.style.overflow = 'hidden';
    }

    function closeSidebar() {
        sidebar.classList.remove('active');
        sidebarBackdrop.classList.remove('active');
        body.style.overflow = '';
    }

    hamburgerBtn.addEventListener('click', openSidebar);
    sidebarCloseBtn.addEventListener('click', closeSidebar);
    sidebarBackdrop.addEventListener('click', closeSidebar);

    // Close sidebar when clicking a nav link
    document.querySelectorAll('.sidebar-nav a').forEach(link => {
        link.addEventListener('click', closeSidebar);
    });

    // ============================================
    // VIEW ALL LOGIC
    // ============================================
    const viewAllBtn = document.getElementById('view-all-btn');
    const profilesContainer = document.getElementById('profiles-container');

    viewAllBtn.addEventListener('click', (e) => {
        e.preventDefault();
        profilesContainer.classList.toggle('show-all');
        if (profilesContainer.classList.contains('show-all')) {
            viewAllBtn.textContent = 'Sembunyikan';
        } else {
            viewAllBtn.textContent = 'Lihat Semua';
            document.getElementById('explore-section').scrollIntoView({ behavior: 'smooth' });
        }
    });

    // ============================================
    // LOAD DATA
    // ============================================
    if (typeof storiesData !== 'undefined') {
        loadMainStory(storiesData.main_story);
        setupGenreFilters(storiesData.profiles);
        loadProfiles(storiesData.profiles);
        setupHeroReadButton();
    } else {
        console.error('Data cerita tidak ditemukan!');
    }

    // ============================================
    // MAIN STORY — Show max 4 latest chapters
    // ============================================
    function loadMainStory(story) {
        document.getElementById('hero-title').textContent = story.title;
        document.getElementById('hero-desc').textContent = story.description;
        document.getElementById('hero-img').src = story.cover;

        const chaptersContainer = document.getElementById('chapters-container');
        chaptersContainer.innerHTML = '';

        const chapters = story.chapters;
        // Show only last 4 chapters (most recent)
        const startIndex = Math.max(0, chapters.length - 4);
        const visibleChapters = chapters.slice(startIndex);

        visibleChapters.forEach((chapter, idx) => {
            const actualIndex = startIndex + idx;
            const card = document.createElement('div');
            card.className = 'chapter-card';

            // Strip HTML for preview
            const plainText = chapter.content.replace(/<[^>]*>/g, '').substring(0, 150) + '...';

            card.innerHTML = `
                <h3>${chapter.title}</h3>
                <p>${plainText}</p>
                <button class="chapter-read-btn" data-source="main" data-index="${actualIndex}">
                    <i class="fa-solid fa-book-open"></i> Baca
                </button>
            `;
            card.style.animation = `fadeInUp 0.5s ease forwards ${idx * 0.1}s`;
            card.style.opacity = '0';
            chaptersContainer.appendChild(card);
        });

        // Add click handlers
        chaptersContainer.querySelectorAll('.chapter-read-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const source = btn.dataset.source;
                const index = parseInt(btn.dataset.index);
                openReader(source, null, index);
            });
        });
    }

    // ============================================
    // HERO READ BUTTON — Scroll to chapters
    // ============================================
    function setupHeroReadButton() {
        const heroReadBtn = document.getElementById('hero-read-btn');
        heroReadBtn.addEventListener('click', () => {
            const chaptersSection = document.getElementById('main-story-section');
            if (chaptersSection) {
                chaptersSection.scrollIntoView({ behavior: 'smooth' });
            }
        });
    }

    // ============================================
    // LOAD PROFILES
    // ============================================
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
            wrapper.style.animation = `fadeInUp 0.5s ease forwards ${(index % 5) * 0.1}s`;
            wrapper.style.opacity = '0';
            profilesContainer.appendChild(wrapper);
        });
    }

    // ============================================
    // GENRE FILTERING — 5 mobile, 10 desktop
    // ============================================
    function setupGenreFilters(profiles) {
        const filtersContainer = document.getElementById('genre-filters');
        filtersContainer.innerHTML = '';

        const genresSet = new Set();
        profiles.forEach(p => {
            if (p.genre) {
                p.genre.split(',').forEach(g => {
                    genresSet.add(g.trim());
                });
            }
        });

        const genres = Array.from(genresSet).sort();
        const isMobile = window.innerWidth <= 768;
        const maxVisible = isMobile ? 5 : 10;

        // "Semua" filter — always visible
        const allBtn = document.createElement('button');
        allBtn.className = 'genre-pill active';
        allBtn.textContent = 'Semua';
        allBtn.onclick = () => filterByGenre('Semua', allBtn);
        filtersContainer.appendChild(allBtn);

        // Individual genre filters
        genres.forEach((genre, index) => {
            const btn = document.createElement('button');
            btn.className = 'genre-pill';
            // Hide genres beyond the limit
            if (index >= maxVisible) {
                btn.classList.add('genre-hidden');
            }
            btn.textContent = genre;
            btn.onclick = () => filterByGenre(genre, btn);
            filtersContainer.appendChild(btn);
        });

        // Add expand button if there are hidden genres
        if (genres.length > maxVisible) {
            const expandBtn = document.createElement('button');
            expandBtn.className = 'genre-pill genre-expand-btn';
            expandBtn.textContent = `+${genres.length - maxVisible} Lainnya`;
            expandBtn.onclick = () => {
                filtersContainer.classList.toggle('genre-expanded');
                if (filtersContainer.classList.contains('genre-expanded')) {
                    expandBtn.style.display = 'none';
                }
            };
            filtersContainer.appendChild(expandBtn);
        }
    }

    // Re-setup genre filters on resize
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            if (typeof storiesData !== 'undefined') {
                setupGenreFilters(storiesData.profiles);
            }
        }, 300);
    });

    function filterByGenre(genreName, btnElement) {
        document.querySelectorAll('.genre-pill').forEach(btn => btn.classList.remove('active'));
        btnElement.classList.add('active');

        if (genreName === 'Semua') {
            loadProfiles(storiesData.profiles);
        } else {
            const filtered = storiesData.profiles.filter(p => p.genre && p.genre.includes(genreName));
            loadProfiles(filtered);
        }
    }

    // ============================================
    // READER STATE
    // ============================================
    let readerState = {
        source: null,       // 'main' or storyId
        storyId: null,
        chapters: [],
        currentIndex: 0,
        uiVisible: true,
        returnTo: 'main'    // 'main' or 'detail'
    };

    // ============================================
    // OPEN READER
    // ============================================
    window.openReader = function(source, storyId, chapterIndex) {
        let chapters = [];
        let storyTitle = '';

        if (source === 'main') {
            chapters = storiesData.main_story.chapters;
            storyTitle = storiesData.main_story.title;
            readerState.returnTo = 'main';
        } else {
            const profile = storiesData.profiles.find(p => p.id === storyId);
            if (!profile || !profile.chapters_data) return;
            chapters = profile.chapters_data;
            storyTitle = profile.title;
            readerState.returnTo = 'detail';
            readerState.storyId = storyId;
        }

        readerState.source = source;
        readerState.chapters = chapters;
        readerState.currentIndex = chapterIndex || 0;
        readerState.uiVisible = true;

        // Hide all main content
        document.getElementById('main-navbar').style.display = 'none';
        document.getElementById('hero-section').style.display = 'none';
        document.getElementById('main-story-section').style.display = 'none';
        document.getElementById('explore-section').style.display = 'none';
        document.getElementById('story-detail-section').style.display = 'none';
        document.getElementById('main-footer').style.display = 'none';

        // Show reader
        const readerSection = document.getElementById('reader-section');
        readerSection.style.display = 'flex';

        // Load chapter
        loadReaderChapter(readerState.currentIndex);

        // Build TOC
        buildReaderTOC();

        window.scrollTo(0, 0);
    };

    function loadReaderChapter(index) {
        const chapter = readerState.chapters[index];
        if (!chapter) return;

        readerState.currentIndex = index;

        document.getElementById('reader-title-mini').textContent = chapter.title;
        document.getElementById('reader-chapter-title').textContent = chapter.title;
        document.getElementById('reader-chapter-body').innerHTML = chapter.content;
        document.getElementById('reader-progress').textContent = `${index + 1} / ${readerState.chapters.length}`;

        // Prev/Next button state
        const prevBtn = document.getElementById('reader-prev-btn');
        const nextBtn = document.getElementById('reader-next-btn');
        prevBtn.disabled = index === 0;
        nextBtn.disabled = index === readerState.chapters.length - 1;

        // Show UI
        readerState.uiVisible = true;
        document.getElementById('reader-navbar').classList.remove('reader-ui-hidden');
        document.getElementById('reader-footer').classList.remove('reader-ui-hidden');

        // Update TOC active state
        document.querySelectorAll('.toc-item').forEach((item, i) => {
            item.classList.toggle('active', i === index);
        });

        // Scroll reader content to top
        document.getElementById('reader-content').scrollTo(0, 0);
    }

    function buildReaderTOC() {
        const tocList = document.getElementById('toc-panel-list');
        tocList.innerHTML = '';

        readerState.chapters.forEach((chapter, index) => {
            const item = document.createElement('div');
            item.className = 'toc-item' + (index === readerState.currentIndex ? ' active' : '');
            item.textContent = chapter.title;
            item.addEventListener('click', () => {
                loadReaderChapter(index);
                closeTOCPanel();
            });
            tocList.appendChild(item);
        });
    }

    // ============================================
    // READER CONTROLS
    // ============================================
    // Back button
    document.getElementById('reader-back-btn').addEventListener('click', closeReader);

    // Prev/Next
    document.getElementById('reader-prev-btn').addEventListener('click', () => {
        if (readerState.currentIndex > 0) {
            loadReaderChapter(readerState.currentIndex - 1);
        }
    });

    document.getElementById('reader-next-btn').addEventListener('click', () => {
        if (readerState.currentIndex < readerState.chapters.length - 1) {
            loadReaderChapter(readerState.currentIndex + 1);
        }
    });

    // Toggle UI visibility on content click
    document.getElementById('reader-content').addEventListener('click', (e) => {
        // Don't toggle if user is selecting text
        if (window.getSelection().toString().length > 0) return;

        readerState.uiVisible = !readerState.uiVisible;
        const navbar = document.getElementById('reader-navbar');
        const footer = document.getElementById('reader-footer');

        if (readerState.uiVisible) {
            navbar.classList.remove('reader-ui-hidden');
            footer.classList.remove('reader-ui-hidden');
        } else {
            navbar.classList.add('reader-ui-hidden');
            footer.classList.add('reader-ui-hidden');
        }
    });

    // TOC Panel
    const tocPanel = document.getElementById('reader-toc-panel');
    const tocBackdrop = document.getElementById('reader-toc-backdrop');
    const tocBtn = document.getElementById('reader-toc-btn');
    const tocCloseBtn = document.getElementById('toc-close-btn');

    function openTOCPanel() {
        tocPanel.classList.add('active');
        tocBackdrop.classList.add('active');
    }

    function closeTOCPanel() {
        tocPanel.classList.remove('active');
        tocBackdrop.classList.remove('active');
    }

    tocBtn.addEventListener('click', openTOCPanel);
    tocCloseBtn.addEventListener('click', closeTOCPanel);
    tocBackdrop.addEventListener('click', closeTOCPanel);

    // Close Reader
    function closeReader() {
        const readerSection = document.getElementById('reader-section');
        readerSection.style.display = 'none';
        closeTOCPanel();

        document.getElementById('main-navbar').style.display = 'flex';
        document.getElementById('main-footer').style.display = 'block';

        if (readerState.returnTo === 'detail' && readerState.storyId) {
            showStoryDetail(readerState.storyId);
        } else {
            document.getElementById('hero-section').style.display = 'flex';
            document.getElementById('main-story-section').style.display = 'block';
            document.getElementById('explore-section').style.display = 'block';
            window.scrollTo(0, 0);
        }
    }
});

// ============================================
// NAVIGATION FUNCTIONS (Global)
// ============================================
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

    // Detail read button
    const detailReadBtn = document.getElementById('detail-read-btn');
    detailReadBtn.onclick = () => {
        window.openReader('profile', profile.id, 0);
    };

    // Render Chapters
    const chaptersContainer = document.getElementById('detail-chapters-container');
    chaptersContainer.innerHTML = '';

    if (profile.chapters_data && profile.chapters_data.length > 0) {
        profile.chapters_data.forEach((chapter, index) => {
            const card = document.createElement('div');
            card.className = 'chapter-card';

            const plainText = chapter.content.replace(/<[^>]*>/g, '').substring(0, 150) + '...';

            card.innerHTML = `
                <h3>${chapter.title}</h3>
                <p>${plainText}</p>
                <button class="chapter-read-btn">
                    <i class="fa-solid fa-book-open"></i> Baca
                </button>
            `;
            card.style.animation = `fadeInUp 0.5s ease forwards ${index * 0.05}s`;
            card.style.opacity = '0';

            // Click handler for the read button
            const readBtn = card.querySelector('.chapter-read-btn');
            readBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                window.openReader('profile', profile.id, index);
            });

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
