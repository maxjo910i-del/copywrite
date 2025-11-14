document.addEventListener('DOMContentLoaded', () => {
    const cursor = document.getElementById('custom-cursor');
    // Обновлено: добавлены кнопки авторизации
    const clickableElements = document.querySelectorAll('a, .nav-item, .card, .logo-link, .footer-link, .auth-item');
    const scrollRevealElements = document.querySelectorAll('.scroll-reveal');
    
    const header = document.querySelector('.header');
    const logoWrapper = document.querySelector('.logo-wrapper');
    const scrollThreshold = 100; 

    let lastScrollY = window.scrollY;
    let ticking = false;
    
    /* --- 1. Кастомный Курсор (Micro-interaction) --- */

    document.addEventListener('mousemove', (e) => {
        cursor.style.left = `${e.clientX}px`;
        cursor.style.top = `${e.clientY}px`;
    });

    clickableElements.forEach(el => {
        el.addEventListener('mouseenter', () => {
            cursor.style.transform = 'translate(-50%, -50%) scale(2.5)';
            cursor.style.backgroundColor = 'rgba(139, 92, 246, 0.5)';
            cursor.style.opacity = '1';
        });

        el.addEventListener('mouseleave', () => {
            cursor.style.transform = 'translate(-50%, -50%) scale(1)';
            cursor.style.backgroundColor = 'var(--micro-accent)';
            cursor.style.opacity = '0.8';
        });
    });

    /* --- 2. Scroll Reveal (Плавное появление) --- */

    const checkVisibility = () => {
        scrollRevealElements.forEach(el => {
            const rect = el.getBoundingClientRect();
            if (rect.top < window.innerHeight * 0.85) {
                el.classList.add('is-visible');
            }
        });
    };
    
    checkVisibility(); 

    /* --- 3. Сворачивание Хедера при Скролле --- */
    const handleScroll = () => {
        const currentScrollY = window.scrollY;
        
        const isScrollingDown = currentScrollY > lastScrollY;
        
        if (currentScrollY > scrollThreshold) {
            
            if (isScrollingDown && !header.classList.contains('header-scrolled')) {
                header.classList.add('header-scrolled');
                logoWrapper.style.setProperty('--logo-scale', 0.5); 
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

    // Оптимизация скролла через requestAnimationFrame
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
    
    
    /* ------------------------------------------------ */
    /* --- НОВАЯ ФУНКЦИЯ: ВАЛИДАЦИЯ РЕГИСТРАЦИИ --- */
    /* ------------------------------------------------ */
    
    // Привязываем функцию к объекту window, чтобы она была доступна из HTML
    window.validateRegistration = function() {
        const emailInput = document.getElementById('reg-email');
        const passwordInput = document.getElementById('reg-password');
        const errorDiv = document.getElementById('registration-error');
        
        // 1. Сброс ошибок
        errorDiv.textContent = '';
        errorDiv.style.display = 'none';

        const email = emailInput.value.trim();
        const password = passwordInput.value;
        
        let isValid = true;
        let errorMessage = [];

        // 2. Проверка Email на @gmail.com
        if (!email.toLowerCase().endsWith('@gmail.com')) {
            errorMessage.push("Email должен быть на домене @gmail.com.");
            isValid = false;
        }

        // 3. Проверка длины пароля
        if (password.length < 8) {
            errorMessage.push("Пароль должен содержать не менее 8 символов.");
            isValid = false;
        }

        if (isValid) {
            // Если все ОК, имитируем успешную регистрацию
            errorDiv.style.color = 'green';
            errorDiv.textContent = 'Регистрация успешна! Перенаправление...';
            errorDiv.style.display = 'block';
            
            // Здесь должна быть логика отправки данных на сервер
            // Для примера, просто перенаправим пользователя на главную
            setTimeout(() => {
                // window.location.href = 'index.html'; 
                // Пока оставим на месте, чтобы пользователь мог увидеть сообщение
            }, 1500);
            
        } else {
            // Вывод ошибок
            errorDiv.style.color = 'red';
            errorDiv.textContent = errorMessage.join(' | ');
            errorDiv.style.display = 'block';
        }
        
        // Предотвращаем отправку формы (если бы это была форма)
        return false; 
    };
    
});