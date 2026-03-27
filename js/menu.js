document.addEventListener('DOMContentLoaded', () => {
    const menuData = window.menuData;
    const recommendations = window.recommendations;
    const speciality = window.speciality;

    if (!menuData) {
        console.error("Menu data not loaded!");
        return;
    }

    // Elements
    const overviewSection = document.getElementById('menu-overview');
    const bookWrapper = document.getElementById('book-wrapper');
    const specialitySection = document.getElementById('speciality-section');
    const categoryGrid = document.getElementById('category-grid');
    const recommendationsList = document.getElementById('recommendations-list');
    const bookContainer = document.getElementById('book');
    const btnBack = document.getElementById('btn-back-overview');

    const searchInput = document.getElementById('menu-search');
    const searchResults = document.getElementById('search-results');
    const searchIcon = document.querySelector('.search-icon');

    let pageFlip = null;
    let isBookInitialized = false;
    let searchIndex = [];
    let activeResultIndex = -1;

    // Render Sections
    if (specialitySection && speciality) {
        specialitySection.innerHTML = `
            <h2>${speciality.title}</h2>
            <p>${speciality.desc}</p>
            <a href="#" class="speciality-cta" data-category="${speciality.categoryId}">View Menu</a>
        `;
    }

    if (categoryGrid) {
        menuData.forEach(category => {
            const card = document.createElement('div');
            card.className = 'category-card';
            card.dataset.category = category.id;

            let count = 0;
            if (category.items) count += category.items.length;
            if (category.subcategories) {
                category.subcategories.forEach(sub => count += sub.items.length);
            }

            card.innerHTML = `
                <h3>${category.title}</h3>
                <span class="count">${count} items</span>
            `;
            categoryGrid.appendChild(card);
        });
    }

    if (recommendationsList && recommendations) {
        recommendations.forEach(rec => {
            const card = document.createElement('div');
            card.className = 'rec-card';
            card.innerHTML = `
                <h4>${rec.title}</h4>
                <span class="tag">${rec.category}</span>
            `;
            if (rec.targetId) {
                card.dataset.category = rec.targetId;
                card.style.cursor = 'pointer';
                card.addEventListener('click', () => openBook(rec.targetId));
            }

            recommendationsList.appendChild(card);
        });
    }

    // Event Listeners
    document.querySelectorAll('.category-card').forEach(card => {
        card.addEventListener('click', () => {
            const catId = card.dataset.category;
            openBook(catId);
        });
    });

    const specBtn = specialitySection ? specialitySection.querySelector('.speciality-cta') : null;
    if (specBtn) {
        specBtn.addEventListener('click', (e) => {
            e.preventDefault();
            const catId = specBtn.dataset.category;
            openBook(catId);
        });
    }

    if (btnBack) {
        btnBack.addEventListener('click', () => {
            showOverview();
        });
    }

    // Search Logic
    function buildSearchIndex() {
        searchIndex = [];
        menuData.forEach(cat => {
            if (cat.items) {
                cat.items.forEach(item => {
                    searchIndex.push({
                        term: item.title,
                        categoryTitle: cat.title,
                        categoryId: cat.id
                    });
                });
            }
            if (cat.subcategories) {
                cat.subcategories.forEach(sub => {
                    sub.items.forEach(item => {
                        searchIndex.push({
                            term: item.title,
                            categoryTitle: `${cat.title} > ${sub.title}`,
                            categoryId: cat.id
                        });
                    });
                });
            }
        });
    }
    buildSearchIndex();

    function levenshtein(a, b) {
        const matrix = [];
        for (let i = 0; i <= b.length; i++) { matrix[i] = [i]; }
        for (let j = 0; j <= a.length; j++) { matrix[0][j] = j; }
        for (let i = 1; i <= b.length; i++) {
            for (let j = 1; j <= a.length; j++) {
                if (b.charAt(i - 1) === a.charAt(j - 1)) {
                    matrix[i][j] = matrix[i - 1][j - 1];
                } else {
                    matrix[i][j] = Math.min(
                        matrix[i - 1][j - 1] + 1,
                        Math.min(matrix[i][j - 1] + 1, matrix[i - 1][j] + 1)
                    );
                }
            }
        }
        return matrix[b.length][a.length];
    }

    function highlightMatch(text, query) {
        try {
            const regex = new RegExp(`(${query})`, 'gi');
            return text.replace(regex, '<span class="highlight">$1</span>');
        } catch (e) {
            return text;
        }
    }

    function renderResults(results, query) {
        searchResults.innerHTML = '';
        activeResultIndex = -1;

        // Ensure visible
        searchResults.classList.remove('hidden');

        if (results.length === 0) {
            searchResults.innerHTML = '<div class="no-results">No matches found</div>';
        } else {
            results.forEach((res, index) => {
                const div = document.createElement('div');
                div.className = 'result-item';
                div.dataset.index = index;
                div.innerHTML = `
                    <div class="result-info">
                        <span class="result-name">${highlightMatch(res.term, query)}</span>
                        <span class="result-category">${res.categoryTitle}</span>
                    </div>
                    <span class="result-arrow">↵</span>
                `;

                div.addEventListener('click', () => {
                    searchInput.value = res.term;
                    searchResults.classList.add('hidden');
                    openBook(res.categoryId);
                });

                div.addEventListener('mouseenter', () => setActiveResult(index));
                searchResults.appendChild(div);
            });
        }
    }

    function setActiveResult(index) {
        const items = searchResults.querySelectorAll('.result-item');
        if (items.length === 0) return;

        if (index < 0) index = items.length - 1;
        if (index >= items.length) index = 0;

        activeResultIndex = index;

        items.forEach(item => item.classList.remove('active'));
        items[index].classList.add('active');
        items[index].scrollIntoView({ block: 'nearest' });
    }

    const performSearch = (val) => {
        const query = val.trim();
        if (query.length < 2) {
            searchResults.classList.add('hidden');
            return;
        }

        const lowerQuery = query.toLowerCase();

        let results = searchIndex.filter(item => {
            const term = item.term.toLowerCase();
            if (term.includes(lowerQuery)) return true;

            const dist = levenshtein(lowerQuery, term);
            if (query.length > 4 && dist <= 2) return true;
            if (query.length > 7 && dist <= 3) return true;
            return false;
        });

        results.sort((a, b) => {
            const aExact = a.term.toLowerCase().includes(lowerQuery);
            const bExact = b.term.toLowerCase().includes(lowerQuery);
            return (aExact === bExact) ? 0 : aExact ? -1 : 1;
        });

        results = results.slice(0, 8);
        renderResults(results, query);
    };

    if (searchInput) {
        // Simple manual debounce
        let debounceTimer;
        searchInput.addEventListener('input', (e) => {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => {
                performSearch(e.target.value);
            }, 300);
        });

        searchInput.addEventListener('keydown', (e) => {
            const items = searchResults.querySelectorAll('.result-item');

            if (e.key === 'ArrowDown') {
                e.preventDefault();
                if (searchResults.classList.contains('hidden')) return;
                setActiveResult(activeResultIndex + 1);
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                if (searchResults.classList.contains('hidden')) return;
                setActiveResult(activeResultIndex - 1);
            } else if (e.key === 'Enter') {
                e.preventDefault();
                if (activeResultIndex >= 0 && items[activeResultIndex]) {
                    items[activeResultIndex].click();
                } else {
                    performSearch(searchInput.value);
                }
            } else if (e.key === 'Escape') {
                searchResults.classList.add('hidden');
            }
        });

        if (searchIcon) {
            searchIcon.addEventListener('click', () => {
                performSearch(searchInput.value);
            });
        }

        document.addEventListener('click', (e) => {
            if (!searchInput.contains(e.target) && !searchResults.contains(e.target)) {
                searchResults.classList.add('hidden');
            }
        });
    }

    // View Switching & Flipbook
    function openBook(categoryId) {
        overviewSection.classList.add('hidden');
        overviewSection.classList.remove('active');
        bookWrapper.classList.remove('hidden');

        if (pageFlip) {
            pageFlip.destroy();
            pageFlip = null;
            bookContainer.innerHTML = '';
        }

        initFlipbook(categoryId);
        bookWrapper.scrollIntoView({ behavior: 'smooth' });
    }

    function showOverview() {
        bookWrapper.classList.add('hidden');
        overviewSection.classList.remove('hidden');
        overviewSection.classList.add('active');

        if (pageFlip) {
            pageFlip.destroy();
            pageFlip = null;
            isBookInitialized = false;
            bookContainer.innerHTML = '';
        }
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    function generateBookHTML(filterCategoryId) {
        let html = '';
        let displayData = menuData;
        if (filterCategoryId) {
            displayData = menuData.filter(cat => cat.id === filterCategoryId);
        }

        if (displayData.length === 0) {
            return;
        }

        html += `
            <div class="page -hard">
                <div class="cover-content">
                    <img src="./assets/logo.webp" alt="Chef4U Logo" class="cover-logo">
                    <h1 class="cover-title">The Menu</h1>
                    <p class="cover-subtitle">${filterCategoryId ? displayData[0].title : 'Full Menu'}</p>
                    <p class="cover-est">— Est. 2014 —</p>
                </div>
            </div>
        `;

        displayData.forEach(category => {
            html += generateCategoryPage(category);
        });

        html += `
             <div class="page -hard">
                <div class="cover-content">
                    <h2 class="cover-title">Contact Us</h2>
                    <div class="contact-details">
                        <p>📍 Kalpana Society, Navrangpura, Ahmedabad</p>
                        <p>📞 +91 98980 02719</p>
                        <p>✉️ chefdhwani99@gmail.com</p>
                    </div>
                    <img src="./assets/logo.webp" alt="Chef4U Logo" class="cover-logo cover-logo-contact">
                    <p class="website-link">www.chef4ucatering.com</p>
                </div>
            </div>
        `;

        bookContainer.innerHTML = html;
    }

    function generateCategoryPage(category) {
        let contentHtml = '';

        if (category.items) {
            contentHtml += `<div class="menu-grid">`;
            category.items.forEach(item => {
                contentHtml += `
                    <div class="menu-item">
                        <span class="menu-title">${item.title}</span>
                        ${item.desc ? `<p class="menu-desc">${item.desc}</p>` : ''}
                    </div>
                `;
            });
            contentHtml += `</div>`;
        }

        if (category.subcategories) {
            category.subcategories.forEach(sub => {
                contentHtml += `<h3 class="category-subheader${contentHtml ? '-mt' : ''}">${sub.title}</h3>`;
                if (sub.desc) contentHtml += `<p class="menu-desc" style="margin-bottom:10px;">${sub.desc}</p>`;

                contentHtml += `<div class="menu-grid">`;
                sub.items.forEach(item => {
                    contentHtml += `
                        <div class="menu-item">
                            <span class="menu-title">${item.title}</span>
                            ${item.desc ? `<p class="menu-desc">${item.desc}</p>` : ''}
                        </div>
                    `;
                });
                contentHtml += `</div>`;
            });
        }

        return `
            <div class="page" data-cat-id="${category.id}">
                <div class="page-content">
                    <div class="page-header">
                        <h2>${category.title}</h2>
                    </div>
                    ${contentHtml}
                </div>
            </div>
        `;
    }

    function initFlipbook(categoryId) {
        generateBookHTML(categoryId);

        let width = 550;
        let height = 750;

        if (window.innerWidth < 768) {
            width = Math.min(window.innerWidth * 0.95, 500);
            height = width * 1.4;
        }

        const checkLib = setInterval(() => {
            if (typeof St !== 'undefined' && St.PageFlip) {
                clearInterval(checkLib);

                pageFlip = new St.PageFlip(bookContainer, {
                    width: width,
                    height: height,
                    size: "stretch",
                    minWidth: 300,
                    maxWidth: 1000,
                    minHeight: 400,
                    maxHeight: 1400,
                    maxShadowOpacity: 0.5,
                    showCover: true,
                    mobileScrollSupport: false
                });

                pageFlip.loadFromHTML(document.querySelectorAll('.page'));

                const btnPrev = document.querySelector('.btn-prev');
                const btnNext = document.querySelector('.btn-next');

                const newBtnPrev = btnPrev.cloneNode(true);
                const newBtnNext = btnNext.cloneNode(true);
                btnPrev.parentNode.replaceChild(newBtnPrev, btnPrev);
                btnNext.parentNode.replaceChild(newBtnNext, btnNext);

                newBtnPrev.addEventListener('click', () => pageFlip.flipPrev());
                newBtnNext.addEventListener('click', () => pageFlip.flipNext());

                if (document.querySelectorAll('.page').length > 2) {
                    setTimeout(() => pageFlip.flip(1), 500);
                }
            }
        }, 100);
    }
});
