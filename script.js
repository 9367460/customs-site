// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Header scroll effect
const header = document.querySelector('.header');
let lastScroll = 0;

window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;

    if (currentScroll > 100) {
        header.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.15)';
    } else {
        header.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.1)';
    }

    lastScroll = currentScroll;
});

// Modal Functions
function openModal() {
    const modal = document.getElementById('callbackModal');
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

function closeModal() {
    const modal = document.getElementById('callbackModal');
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
        // Reset form and hide success message
        const form = document.getElementById('contactForm');
        const successMessage = document.getElementById('successMessage');
        if (form) form.style.display = 'flex';
        if (successMessage) successMessage.style.display = 'none';
        if (form) form.reset();
    }
}

// Open modal on button click
document.addEventListener('DOMContentLoaded', function() {
    // Handle all callback buttons
    const callbackButtons = document.querySelectorAll('a[href="#callback"], a[href="index.html#callback"], button[data-modal="callback"]');
    callbackButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            openModal();
        });
    });

    // Close modal on overlay click
    const modalOverlay = document.querySelector('.modal-overlay');
    if (modalOverlay) {
        modalOverlay.addEventListener('click', closeModal);
    }

    // Close modal on close button click
    const modalClose = document.querySelector('.modal-close');
    if (modalClose) {
        modalClose.addEventListener('click', closeModal);
    }

    // Close modal on ESC key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeModal();
        }
    });
});

// Form submission
const contactForm = document.getElementById('contactForm');
if (contactForm) {
    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();

        // Get form data
        const formData = new FormData(this);
        const submitButton = this.querySelector('button[type="submit"]');
        const originalButtonText = submitButton.textContent;

        // Disable button and show loading state
        submitButton.disabled = true;
        submitButton.textContent = 'Отправка...';

        // Send form data to PHP handler
        fetch('send-form.php', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // Hide form and show success message
                this.style.display = 'none';
                const successMessage = document.getElementById('successMessage');
                if (successMessage) {
                    successMessage.style.display = 'block';
                }
                // Reset form
                this.reset();
            } else {
                // Show error message
                alert(data.message || 'Произошла ошибка при отправке формы');
            }
        })
        .catch((error) => {
            console.error('Error:', error);
            alert('Произошла ошибка при отправке формы. Пожалуйста, позвоните нам по телефону +7 (812) 928-74-60');
        })
        .finally(() => {
            // Re-enable button
            submitButton.disabled = false;
            submitButton.textContent = originalButtonText;
        });
    });
}

// Handle all other forms on the site (CTA forms, sidebar forms)
document.querySelectorAll('form:not(#contactForm)').forEach(form => {
    form.addEventListener('submit', function(e) {
        e.preventDefault();

        // Open modal with pre-filled data if available
        const formData = new FormData(this);
        openModal();

        // Pre-fill modal form
        const modalForm = document.getElementById('contactForm');
        if (modalForm) {
            const name = formData.get('name');
            const phone = formData.get('phone');
            const message = formData.get('message') || form.querySelector('input[placeholder*="Откуда"]')?.value;

            if (name) modalForm.querySelector('#name').value = name;
            if (phone) modalForm.querySelector('#phone').value = phone;
            if (message) modalForm.querySelector('#message').value = message;
        }
    });
});

// Animate elements on scroll
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

document.querySelectorAll('.service-card, .direction-card, .advantage-item').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(el);
});

// Counter animation for stats
function animateCounter(element, target, duration = 2000) {
    let start = 0;
    const increment = target / (duration / 16);

    function updateCounter() {
        start += increment;
        if (start < target) {
            element.textContent = Math.floor(start) + (element.dataset.suffix || '');
            requestAnimationFrame(updateCounter);
        } else {
            element.textContent = target + (element.dataset.suffix || '');
        }
    }

    updateCounter();
}

// Trigger counter animation when stats section is visible
const statsSection = document.querySelector('.stats');
const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            document.querySelectorAll('.stat-number').forEach(stat => {
                const text = stat.textContent;
                const number = parseInt(text);
                if (!isNaN(number)) {
                    stat.dataset.suffix = text.replace(/\d+/, '');
                    animateCounter(stat, number);
                }
            });
            statsObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.5 });

if (statsSection) {
    statsObserver.observe(statsSection);
}

// Mobile menu toggle
const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
const nav = document.querySelector('.nav');

if (mobileMenuBtn) {
    mobileMenuBtn.addEventListener('click', () => {
        nav.classList.toggle('active');
        mobileMenuBtn.classList.toggle('active');
    });
}
