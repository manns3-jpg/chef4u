document.addEventListener('DOMContentLoaded', () => {
    // --- Hamburger Menu Logic ---
    const hamburger = document.querySelector('.hamburger');
    const nav = document.querySelector('nav');
    const navLinks = document.querySelectorAll('nav ul li a');

    if (hamburger && nav) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('active');
            nav.classList.toggle('active');
        });

        // Close menu when a link is clicked
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                hamburger.classList.remove('active');
                nav.classList.remove('active');
            });
        });

        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!nav.contains(e.target) && !hamburger.contains(e.target) && nav.classList.contains('active')) {
                hamburger.classList.remove('active');
                nav.classList.remove('active');
            }
        });
    }

    // --- Interactive Cards (Why Choose Us) ---
    // Expand/Collapse text on click for mobile/tablet where hover isn't ideal
    const infoBoxes = document.querySelectorAll('.choose_us .box');
    infoBoxes.forEach(box => {
        box.addEventListener('click', () => {
            // Toggle active class
            box.classList.toggle('active');

            // Optional: Close others if accordion behavior is desired
            // infoBoxes.forEach(otherBox => {
            //     if (otherBox !== box) otherBox.classList.remove('active');
            // });
        });
    });

    // --- Smooth Scrolling & Active Link Highlighting ---
    const sections = document.querySelectorAll('section');

    // Smooth Scroll
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;

            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                // Account for fixed header offset
                const headerOffset = 80;
                const elementPosition = targetElement.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: "smooth"
                });
            }
        });
    });

    // Active Link Highlighter using Intersection Observer
    const observerOptions = {
        root: null,
        rootMargin: '-20% 0px -50% 0px', // Trigger when section is in the middle-ish
        threshold: 0
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.getAttribute('id');
                if (id) {
                    navLinks.forEach(link => {
                        link.classList.remove('active');
                        if (link.getAttribute('href') === `#${id}`) {
                            link.classList.add('active');
                        }
                    });
                }
            }
        });
    }, observerOptions);

    sections.forEach(section => {
        observer.observe(section);
    });


    // --- Form Handling & Toast Notification ---
    const contactForm = document.getElementById('contactForm');

    // Create Toast Element dynamically if it doesn't exist
    let toast = document.getElementById('toast-notification');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'toast-notification';
        document.body.appendChild(toast);
    }

    function showToast(message, type = 'success') {
        toast.textContent = message;
        toast.className = ''; // Reset classes
        toast.classList.add(type);
        toast.classList.add('show');

        // Hide after 3 seconds
        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }

    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();

            // --- GOOGLE SHEETS SUBMISSION ---
            // REPLACE THIS URL WITH YOUR DEPLOYED GOOGLE APPS SCRIPT WEB APP URL
            const SCRIPT_URL = 'INSERT_YOUR_GOOGLE_SCRIPT_URL_HERE';

            const submitBtn = contactForm.querySelector('input[type="submit"]');
            const originalVal = submitBtn.value;
            submitBtn.value = 'Sending...';
            submitBtn.disabled = true;

            // Collect form data
            const formData = {
                name: document.getElementById('name').value,
                email: document.getElementById('email').value,
                phone: document.getElementById('phone').value,
                message: document.getElementById('message').value
            };

            if (SCRIPT_URL === 'INSERT_YOUR_GOOGLE_SCRIPT_URL_HERE') {
                showToast('⚠️ Please configure the Google Script URL in js/script.js', 'error');
                submitBtn.value = originalVal;
                submitBtn.disabled = false;
                return;
            }

            // Send to Google Sheets
            fetch(SCRIPT_URL, {
                method: 'POST',
                // Google Apps Script requires text/plain for CORS reasons with simple requests
                body: JSON.stringify(formData)
            })
                .then(response => response.json())
                .then(data => {
                    if (data.result === 'success') {
                        showToast('Thank you! Your quote request has been sent.', 'success');
                        contactForm.reset();
                    } else {
                        throw new Error(data.error || 'Submission failed');
                    }
                })
                .catch(error => {
                    console.error('Error!', error);
                    showToast('Something went wrong. Please try again later.', 'error');
                })
                .finally(() => {
                    submitBtn.value = originalVal;
                    submitBtn.disabled = false;
                });
        });
    }

    // --- Copyright Year Update ---
    // Fix: Using a more robust selector in case .credit is missing or nested differently
    // Checking for both .credit and the generic footer p that contains the copyright
    const creditEl = document.querySelector('.credit') || document.querySelector('.footer-bottom p');
    if (creditEl) {
        const currentYear = new Date().getFullYear();
        // Preserving existing text if likely generic, or setting standard text
        if (creditEl.innerText.includes('All Rights Reserved')) {
            creditEl.innerHTML = `&copy; ${currentYear} Chef4U Catering. All Rights Reserved.`;
        }
    }

    // --- Back to Top Button ---
    let backToTopBtn = document.querySelector('.back-to-top');
    if (!backToTopBtn) {
        backToTopBtn = document.createElement('div');
        backToTopBtn.className = 'back-to-top';
        backToTopBtn.innerHTML = '↑';
        backToTopBtn.setAttribute('aria-label', 'Back to Top');
        document.body.appendChild(backToTopBtn);
    }

    window.addEventListener('scroll', () => {
        if (window.scrollY > 300) {
            backToTopBtn.classList.add('visible');
        } else {
            backToTopBtn.classList.remove('visible');
        }
    });

    backToTopBtn.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
});
