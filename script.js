
document.addEventListener('DOMContentLoaded', function () {

    // Mobile navigation
    const navToggle = document.getElementById('nav-toggle');
    const navLinks = document.getElementById('nav-links');

    if (navToggle && navLinks) {
        navToggle.addEventListener('click', function () {
            navLinks.classList.toggle('open');

            const isOpen = navLinks.classList.contains('open');
            navToggle.setAttribute('aria-expanded', isOpen);
        });
    }

    // Highlight the current page
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const pageLinks = document.querySelectorAll('.nav-links a');

    pageLinks.forEach(function (link) {
        const linkPage = link.getAttribute('href');

        if (linkPage === currentPage) {
            link.classList.add('active');
        }
    });

    // Dark and light mode
    const navbarContainer = document.querySelector('.navbar .container');

    if (navbarContainer && !document.getElementById('theme-toggle')) {
        const themeButton = document.createElement('button');

        themeButton.id = 'theme-toggle';
        themeButton.type = 'button';
        themeButton.textContent = 'Dark Mode';
        themeButton.setAttribute('aria-label', 'Toggle dark mode');

        navbarContainer.appendChild(themeButton);

        function applyTheme(theme) {
            document.body.classList.toggle('dark-mode', theme === 'dark');
            themeButton.textContent = theme === 'dark' ? 'Light Mode' : 'Dark Mode';
        }

        const savedTheme = localStorage.getItem('toa_theme') || 'light';
        applyTheme(savedTheme);

        themeButton.addEventListener('click', function () {
            const newTheme = document.body.classList.contains('dark-mode')
                ? 'light'
                : 'dark';

            localStorage.setItem('toa_theme', newTheme);
            applyTheme(newTheme);
        });
    }

    // Recipe filters
    const filterButtons = document.querySelectorAll('.filter-btn');
    const recipeCards = document.querySelectorAll('.recipe-card');

    filterButtons.forEach(function (button) {
        button.addEventListener('click', function () {
            const selectedRegion = button.getAttribute('data-filter');

            filterButtons.forEach(function (item) {
                item.classList.remove('active');
            });

            button.classList.add('active');

            recipeCards.forEach(function (card) {
                const cardRegion = card.getAttribute('data-region');

                if (
                    selectedRegion === 'all' ||
                    selectedRegion === cardRegion
                ) {
                    card.style.display = '';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    });

    // Save favourite recipes
    const favoriteButtons = document.querySelectorAll('.btn-fav');

    let favorites = JSON.parse(localStorage.getItem('toa_favorites')) || [];

    favoriteButtons.forEach(function (button) {
        const recipeName = button.getAttribute('data-recipe');

        if (favorites.includes(recipeName)) {
            button.classList.add('favorited');
            button.textContent = '♥ Saved';
        }

        button.addEventListener('click', function () {
            if (favorites.includes(recipeName)) {
                favorites = favorites.filter(function (item) {
                    return item !== recipeName;
                });

                button.classList.remove('favorited');
                button.textContent = '♡ Favourite';
            } else {
                favorites.push(recipeName);

                button.classList.add('favorited');
                button.textContent = '♥ Saved';
            }

            localStorage.setItem('toa_favorites', JSON.stringify(favorites));
        });
    });

    // Adjust ingredient quantities
    const servingSelector = document.getElementById('serving-count');
    const ingredientList = document.getElementById('ingredient-list');
    const servingDisplay = document.getElementById('serving-display');

    if (servingSelector && ingredientList) {
        const ingredients = ingredientList.querySelectorAll('[data-base-quantity]');

        const originalServings =
            Number(ingredientList.getAttribute('data-original-servings')) || 4;

        function formatQuantity(quantity) {
            const wholeNumber = Math.floor(quantity);
            const decimal = quantity - wholeNumber;

            const fractions = [
                { value: 0.125, symbol: '⅛' },
                { value: 0.25, symbol: '¼' },
                { value: 0.333, symbol: '⅓' },
                { value: 0.375, symbol: '⅜' },
                { value: 0.5, symbol: '½' },
                { value: 0.625, symbol: '⅝' },
                { value: 0.667, symbol: '⅔' },
                { value: 0.75, symbol: '¾' },
                { value: 0.875, symbol: '⅞' }
            ];

            let closestFraction = null;

            fractions.forEach(function (fraction) {
                const difference = Math.abs(decimal - fraction.value);

                if (
                    difference <= 0.02 &&
                    (!closestFraction || difference < closestFraction.difference)
                ) {
                    closestFraction = {
                        symbol: fraction.symbol,
                        difference: difference
                    };
                }
            });

            if (closestFraction) {
                return (wholeNumber > 0 ? wholeNumber + ' ' : '') +
                    closestFraction.symbol;
            }

            return Number(quantity.toFixed(2)).toString();
        }

        function updateIngredients() {
            const selectedServings = Number(servingSelector.value);

            if (!selectedServings || selectedServings <= 0) {
                return;
            }

            if (servingDisplay) {
                servingDisplay.textContent = selectedServings;
            }

            ingredients.forEach(function (ingredient) {
                const baseQuantity = Number(
                    ingredient.getAttribute('data-base-quantity')
                );

                const unit = ingredient.getAttribute('data-unit') || '';

                if (!Number.isFinite(baseQuantity)) {
                    return;
                }

                const newQuantity =
                    baseQuantity * selectedServings / originalServings;

                const formattedQuantity = formatQuantity(newQuantity);

                let displayUnit = unit;

                if (newQuantity === 1) {
                    if (unit === 'cups') displayUnit = 'cup';
                    if (unit === 'pieces') displayUnit = 'piece';
                }

                ingredient.textContent =
                    formattedQuantity + (displayUnit ? ' ' + displayUnit : '');
            });
        }

        servingSelector.addEventListener('change', updateIngredients);
        updateIngredients();
    }

    // Contact form validation
    const contactForm = document.getElementById('contact-form');
    const formConfirm = document.getElementById('form-confirm');
    const msgError = document.getElementById('msg-error');

    if (contactForm) {
        contactForm.addEventListener('submit', function (event) {
            event.preventDefault();

            const nameInput = document.getElementById('contact-name');
            const messageInput = document.getElementById('contact-message');

            if (msgError) {
                msgError.style.display = 'none';
            }

            if (!nameInput || !nameInput.value.trim()) {
                if (msgError) {
                    msgError.textContent = 'Please enter your name.';
                    msgError.style.display = 'block';
                }
                return;
            }

            if (!messageInput || messageInput.value.trim().length <= 20) {
                if (msgError) {
                    msgError.textContent =
                        'Please enter a message with more than 20 characters.';
                    msgError.style.display = 'block';
                }
                return;
            }

            contactForm.style.display = 'none';

            if (formConfirm) {
                formConfirm.style.display = 'block';
            }
        });
    }

    // Newsletter form
    const newsletterForm = document.getElementById('newsletter-form');

    if (newsletterForm) {
        newsletterForm.addEventListener('submit', function (event) {
            event.preventDefault();

            const emailInput = newsletterForm.querySelector('input[type="email"]');
            const submitButton = newsletterForm.querySelector('button[type="submit"]');

            if (!emailInput || !emailInput.checkValidity()) {
                if (emailInput) {
                    emailInput.reportValidity();
                }
                return;
            }

            emailInput.disabled = true;

            if (submitButton) {
                submitButton.disabled = true;
                submitButton.textContent = 'Subscribed!';
            }
        });
    }

});
