document.addEventListener('DOMContentLoaded', () => {

    /* --- API CONFIGURATION --- */
    // Адрес вашего локального API
    const API_BASE_URL = 'http://localhost:3000';
    
    // --- Вспомогательная функция для получения параметра из URL ---
    function getUrlParameter(name) {
        name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
        const regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
        const results = regex.exec(location.search);
        return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
    };


    // -------------------------------------------------------------------
    // --- ФУНКЦИЯ ПОИСКА (ИСПОЛЬЗУЕТ API) ---
    // -------------------------------------------------------------------

    window.performSearch = async function() {
        const query = document.getElementById('search-input').value.toLowerCase().trim();
        const resultsContainer = document.getElementById('search-results');
        const resultsCountEl = document.getElementById('results-count');
        const queryParam = getUrlParameter('q');
        
        const currentQuery = query || queryParam;
        
        resultsContainer.innerHTML = '';
        
        if (!currentQuery) {
            resultsCountEl.textContent = 'Введите поисковый запрос.';
            return;
        }

        resultsCountEl.textContent = `Идет поиск по запросу "${currentQuery}"...`;
        
        try {
            // Запрос на API /search
            const response = await fetch(`${API_BASE_URL}/search?q=${encodeURIComponent(currentQuery)}`);
            
            if (!response.ok) {
                throw new Error(`Ошибка сети или сервера. Статус: ${response.status}`);
            }
            
            const filteredResults = await response.json(); 

            if (filteredResults.length === 0) {
                resultsCountEl.textContent = `По запросу "${currentQuery}" ничего не найдено.`;
                return;
            }

            resultsCountEl.textContent = `Найдено ${filteredResults.length} результатов по запросу "${currentQuery}":`;

            // Отображение результатов
            filteredResults.forEach(item => {
                const resultLink = document.createElement('a');
                resultLink.href = item.url; 
                resultLink.className = 'card card-link search-result-item';
                resultLink.style.marginBottom = '20px';
                resultLink.innerHTML = `
                    <small class="type-tag" style="color: var(--accent-primary); font-weight: bold; text-transform: uppercase;">${item.type}</small>
                    <h3 style="margin-top: 5px; margin-bottom: 5px;">${item.title}</h3>
                    <p style="font-size: 16px; color: rgba(0,0,0,0.6);">${item.subtitle}</p>
                `;
                resultsContainer.appendChild(resultLink);
            });

        } catch (error) {
            console.error("Ошибка при выполнении поиска:", error);
            resultsCountEl.textContent = `Ошибка подключения: Убедитесь, что ваш API-сервер запущен на ${API_BASE_URL}.`;
        }
        
        if (queryParam && !query) {
             document.getElementById('search-input').value = queryParam;
        }
    };

    // Запуск поиска при загрузке страницы search.html
    if (window.location.pathname.includes('search.html')) {
        performSearch();
    }
    
    // -------------------------------------------------------------------
    // --- ФУНКЦИЯ ЗАГРУЗКИ ДЕТАЛЬНОГО КОНТЕНТА (ИСПОЛЬЗУЕТ API) ---
    // -------------------------------------------------------------------

    function loadDetailPageContent() {
        // Получаем ID контента из URL
        const itemId = getUrlParameter('id');
        
        if (!itemId) return; 

        const titleEl = document.getElementById('detail-title');
        const subtitleEl = document.getElementById('detail-subtitle');
        const bodyEl = document.getElementById('detail-body');
        
        if (titleEl) titleEl.textContent = 'Загрузка...';

        const fetchDetails = async () => {
            try {
                // Запрос на API /details
                const response = await fetch(`${API_BASE_URL}/details?id=${encodeURIComponent(itemId)}`);
                
                if (!response.ok) {
                    throw new Error('Контент не найден на сервере (404/500).');
                }
                
                const item = await response.json(); 

                // Отображение контента
                if (titleEl) titleEl.textContent = item.title;
                if (subtitleEl) subtitleEl.textContent = item.subtitle;
                if (bodyEl && item.body) bodyEl.innerHTML = `<p>${item.body}</p>`;
                else if (bodyEl) bodyEl.innerHTML = '<p>Подробный текст для этого раздела отсутствует.</p>';

            } catch (error) {
                console.error("Ошибка при загрузке деталей:", error);
                if (titleEl) titleEl.textContent = 'Контент временно недоступен.';
                if (subtitleEl) subtitleEl.textContent = `Ошибка: ${error.message}`;
            }
        };
        
        fetchDetails();
    }
    loadDetailPageContent();


    // -------------------------------------------------------------------
    // --- ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ (КУРСОР, СКРОЛЛ, LOCAL STORAGE) ---
    // -------------------------------------------------------------------

    const cursor = document.getElementById('custom-cursor');
    const clickableElements = document.querySelectorAll('a, .nav-item, .card, .logo-link, .footer-link, .auth-item, button, .draft-button, .search-button');
    const scrollRevealElements = document.querySelectorAll('.scroll-reveal');
    
    const header = document.querySelector('.header');
    const logoWrapper = document.querySelector('.logo-wrapper');
    const scrollThreshold = 100; 

    let lastScrollY = window.scrollY;
    let ticking = false;
    
    /* --- Кастомный Курсор --- */
    document.addEventListener('mousemove', (e) => {
        cursor.style.left = `${e.clientX}px`;
        cursor.style.top = `${e.clientY}px`;
    });

    clickableElements.forEach(el => {
        el.addEventListener('mouseenter', () => {
            cursor.style.transform = 'translate(-50%, -50%) scale(2.5)';
            cursor.style.backgroundColor = 'var(--accent-primary)'; 
            cursor.style.opacity = '1';
        });
        el.addEventListener('mouseleave', () => {
            cursor.style.transform = 'translate(-50%, -50%) scale(1)';
            cursor.style.backgroundColor = 'var(--micro-accent)';
            cursor.style.opacity = '0.8';
        });
    });

    /* --- Scroll Reveal и Сворачивание Хедера --- */
    const checkVisibility = () => {
        scrollRevealElements.forEach(el => {
            const rect = el.getBoundingClientRect();
            if (rect.top < window.innerHeight * 0.85) {
                el.classList.add('is-visible');
            }
        });
    };
    checkVisibility(); 

    const handleScroll = () => {
        const currentScrollY = window.scrollY;
        const isScrollingDown = currentScrollY > lastScrollY;
        
        if (currentScrollY > scrollThreshold) {
            if (isScrollingDown && !header.classList.contains('header-scrolled')) { 
                header.classList.add('header-scrolled');
                logoWrapper.style.setProperty('--logo-scale', 0.5); 
            } else if (!isScrollingDown && currentScrollY < scrollThreshold) {
                header.classList.remove('header-scrolled');
                logoWrapper.style.setProperty('--logo-scale', 1); 
            }
        } else { 
            if (header.classList.contains('header-scrolled')) {
                header.classList.remove('header-scrolled');
            }
            logoWrapper.style.setProperty('--logo-scale', 1); 
        }
        lastScrollY = currentScrollY;
        checkVisibility(); 
    };

    window.addEventListener('scroll', () => {
        if (!ticking) {
            window.requestAnimationFrame(() => {
                handleScroll();
                ticking = false;
            });
            ticking = true;
        }
    });
    handleScroll(); 
    
    /* --- LOCAL STORAGE (Оставлено для простоты) --- */
    
    window.saveArticle = function(isDraft = false) {
        const titleInput = document.getElementById('article-title');
        const categorySelect = document.getElementById('article-category');
        const bodyTextarea = document.getElementById('article-body');
        const statusDiv = document.getElementById('publication-status');

        if (!titleInput.value || !categorySelect.value || !bodyTextarea.value) {
            statusDiv.textContent = 'Ошибка: Все поля должны быть заполнены!';
            statusDiv.style.color = 'red';
            return false;
        }
        
        const newArticle = {
            id: 'local-' + Date.now(), 
            title: titleInput.value,
            category: categorySelect.options[categorySelect.selectedIndex].text,
            body: bodyTextarea.value,
            date: new Date().toLocaleDateString('ru-RU'),
            isDraft: isDraft 
        };

        const articles = JSON.parse(localStorage.getItem('publishedArticles')) || [];
        articles.unshift(newArticle);

        localStorage.setItem('publishedArticles', JSON.stringify(articles));

        statusDiv.textContent = isDraft 
            ? `Черновик "${newArticle.title}" сохранен локально.`
            : `Статья "${newArticle.title}" ОПУБЛИКОВАНА локально!`;
        statusDiv.style.color = isDraft ? 'var(--text-primary)' : 'var(--accent-primary)';
        
        titleInput.value = '';
        categorySelect.value = '';
        bodyTextarea.value = '';
        
        return false;
    };


    window.loadArticles = function() {
        const articleList = document.getElementById('dynamic-article-list');
        if (!articleList) return;

        const articles = JSON.parse(localStorage.getItem('publishedArticles')) || [];
        articleList.innerHTML = '';

        // Статическая заглушка статьи
        const staticArticleLink = document.createElement('a');
        staticArticleLink.href = 'article-detail.html?id=editorial-rules';
        staticArticleLink.className = 'card card-link';
        staticArticleLink.style.marginBottom = '20px';
        staticArticleLink.innerHTML = 'Статья (статическая): 5 правил редакционного минимализма';
        articleList.appendChild(staticArticleLink);


        articles.filter(a => !a.isDraft).forEach(article => {
            const articleCardLink = document.createElement('a');
            articleCardLink.href = 'article-detail.html?id=' + article.id;
            articleCardLink.className = 'card card-link';
            articleCardLink.style.marginTop = '20px';
            articleCardLink.innerHTML = `
                <strong>Пост (Локальный): ${article.title}</strong><br>
                <small>Категория: ${article.category} | Дата: ${article.date}</small>
            `;
            articleList.appendChild(articleCardLink);
        });
        
        const drafts = articles.filter(a => a.isDraft);
        if (drafts.length > 0) {
             console.log("Локальные черновики:", drafts);
        }
    };

    if (document.getElementById('dynamic-article-list')) {
        loadArticles();
    }
    
    /* --- Валидация регистрации --- */
    window.validateRegistration = function() {
        const emailInput = document.getElementById('reg-email');
        const passwordInput = document.getElementById('reg-password');
        const errorDiv = document.getElementById('registration-error');
        
        if (!emailInput || !passwordInput || !errorDiv) return false;

        errorDiv.textContent = '';
        errorDiv.style.display = 'none';

        const email = emailInput.value.trim();
        const password = passwordInput.value;
        
        let isValid = true;
        let errorMessage = [];

        if (!email.toLowerCase().endsWith('@gmail.com')) {
            errorMessage.push("Email должен быть на домене @gmail.com.");
            isValid = false;
        }

        if (password.length < 8) {
            errorMessage.push("Пароль должен содержать не менее 8 символов.");
            isValid = false;
        }

        if (isValid) {
            errorDiv.style.color = 'var(--accent-primary)'; 
            errorDiv.textContent = 'Регистрация успешна! Перенаправление...';
            errorDiv.style.display = 'block';
            
            setTimeout(() => {
                // window.location.href = 'index.html'; 
            }, 1500);
            
        } else {
            errorDiv.style.color = 'red';
            errorDiv.textContent = errorMessage.join(' | ');
            errorDiv.style.display = 'block';
        }
        
        return false; 
    };
    
});