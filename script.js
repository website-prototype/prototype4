(function() {
    'use strict';

    const DOM = {
        navbar: document.getElementById('navbar'),
        navToggle: document.getElementById('navToggle'),
        navMenu: document.getElementById('navMenu'),
        navLinks: document.querySelectorAll('.nav-link'),
        appointmentForm: document.getElementById('appointmentForm'),
        formSuccess: document.getElementById('formSuccess'),
        faqItems: document.querySelectorAll('.faq-item'),
        preferredDate: document.getElementById('preferredDate')
    };

    const CONFIG = {
        scrollThreshold: 50,
        animationDuration: 300
    };

    function initNavbar() {
        let lastScroll = 0;
        let ticking = false;

        function updateNavbar() {
            const currentScroll = window.pageYOffset;


            if (currentScroll > CONFIG.scrollThreshold) {
                DOM.navbar.classList.add('scrolled');
            } else {
                DOM.navbar.classList.remove('scrolled');
            }

            lastScroll = currentScroll;
            ticking = false;
        }

        window.addEventListener('scroll', function() {
            if (!ticking) {
                requestAnimationFrame(updateNavbar);
                ticking = true;
            }
        }, { passive: true });

        updateNavbar();
    }

    function initMobileMenu() {
        DOM.navToggle.addEventListener('click', function() {
            this.classList.toggle('active');
            DOM.navMenu.classList.toggle('active');
            document.body.style.overflow = DOM.navMenu.classList.contains('active') ? 'hidden' : '';
        });

        DOM.navLinks.forEach(function(link) {
            link.addEventListener('click', function() {
                DOM.navToggle.classList.remove('active');
                DOM.navMenu.classList.remove('active');
                document.body.style.overflow = '';
            });
        });

        document.addEventListener('click', function(e) {
            if (!DOM.navbar.contains(e.target) && DOM.navMenu.classList.contains('active')) {
                DOM.navToggle.classList.remove('active');
                DOM.navMenu.classList.remove('active');
                document.body.style.overflow = '';
            }
        });
    }

    function initSmoothScroll() {
        document.querySelectorAll('a[href^="#"]').forEach(function(anchor) {
            anchor.addEventListener('click', function(e) {
                const targetId = this.getAttribute('href');
                
                if (targetId === '#') return;

                const target = document.querySelector(targetId);
                
                if (target) {
                    e.preventDefault();
                    
                    const navHeight = DOM.navbar.offsetHeight;
                    const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - navHeight;

                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                }
            });
        });
    }

    function initDatePicker() {
        if (DOM.preferredDate) {
            const today = new Date();
            const year = today.getFullYear();
            const month = String(today.getMonth() + 1).padStart(2, '0');
            const day = String(today.getDate()).padStart(2, '0');
            DOM.preferredDate.min = `${year}-${month}-${day}`;

            const maxDate = new Date();
            maxDate.setMonth(maxDate.getMonth() + 3);
            const maxYear = maxDate.getFullYear();
            const maxMonth = String(maxDate.getMonth() + 1).padStart(2, '0');
            const maxDay = String(maxDate.getDate()).padStart(2, '0');
            DOM.preferredDate.max = `${maxYear}-${maxMonth}-${maxDay}`;
        }
    }

    const FormValidator = {
        patterns: {
            email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
            phone: /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/
        },

        messages: {
            fullName: 'Please enter your full name',
            email: 'Please enter a valid email address',
            phone: 'Please enter a valid phone number',
            service: 'Please select a service',
            preferredDate: 'Please select a preferred date'
        },

        validateField: function(field, value) {
            const errorElement = document.getElementById(field + 'Error');
            let isValid = true;
            let message = '';

            switch(field) {
                case 'fullName':
                    if (!value || value.trim().length < 2) {
                        isValid = false;
                        message = this.messages.fullName;
                    }
                    break;
                case 'email':
                    if (!value || !this.patterns.email.test(value)) {
                        isValid = false;
                        message = this.messages.email;
                    }
                    break;
                case 'phone':
                    const cleanPhone = value.replace(/\s/g, '');
                    if (!cleanPhone || !this.patterns.phone.test(cleanPhone)) {
                        isValid = false;
                        message = this.messages.phone;
                    }
                    break;
                case 'service':
                    if (!value) {
                        isValid = false;
                        message = this.messages.service;
                    }
                    break;
                case 'preferredDate':
                    if (!value) {
                        isValid = false;
                        message = this.messages.preferredDate;
                    } else {
                        const selectedDate = new Date(value);
                        const today = new Date();
                        today.setHours(0, 0, 0, 0);
                        if (selectedDate < today) {
                            isValid = false;
                            message = 'Please select a future date';
                        }
                    }
                    break;
            }

            const input = document.getElementById(field);
            if (input) {
                if (!isValid) {
                    input.classList.add('error');
                } else {
                    input.classList.remove('error');
                }
            }

            if (errorElement) {
                errorElement.textContent = message;
            }

            return isValid;
        },

        validateForm: function(formData) {
            const fields = ['fullName', 'email', 'phone', 'service', 'preferredDate'];
            let isFormValid = true;

            fields.forEach(function(field) {
                const value = formData.get(field);
                if (!FormValidator.validateField(field, value)) {
                    isFormValid = false;
                }
            });

            return isFormValid;
        }
    };

    function initFormValidation() {
        if (!DOM.appointmentForm) return;

        const inputs = DOM.appointmentForm.querySelectorAll('.form-input[required]');
        inputs.forEach(function(input) {
            input.addEventListener('blur', function() {
                FormValidator.validateField(this.name, this.value);
            });

            input.addEventListener('input', function() {
                if (this.classList.contains('error')) {
                    FormValidator.validateField(this.name, this.value);
                }
            });
        });

        DOM.appointmentForm.addEventListener('submit', function(e) {
            e.preventDefault();

            const formData = new FormData(this);
            
            if (FormValidator.validateForm(formData)) {
                this.style.display = 'none';
                DOM.formSuccess.classList.add('show');

                DOM.formSuccess.scrollIntoView({ behavior: 'smooth', block: 'center' });

                setTimeout(function() {
                    DOM.appointmentForm.reset();
                    DOM.appointmentForm.style.display = 'flex';
                    DOM.formSuccess.classList.remove('show');
                    
                    const errorElements = DOM.appointmentForm.querySelectorAll('.form-error');
                    errorElements.forEach(function(el) {
                        el.textContent = '';
                    });
                    
                    const errorInputs = DOM.appointmentForm.querySelectorAll('.error');
                    errorInputs.forEach(function(el) {
                        el.classList.remove('error');
                    });
                }, 5000);
            }
        });
    }

    function initFAQ() {
        DOM.faqItems.forEach(function(item) {
            const question = item.querySelector('.faq-question');
            
            question.addEventListener('click', function() {
                const isActive = item.classList.contains('active');
                const expanded = this.getAttribute('aria-expanded') === 'true';

                DOM.faqItems.forEach(function(otherItem) {
                    otherItem.classList.remove('active');
                    otherItem.querySelector('.faq-question').setAttribute('aria-expanded', 'false');
                });

                if (!isActive) {
                    item.classList.add('active');
                    this.setAttribute('aria-expanded', 'true');
                }
            });

            question.addEventListener('keydown', function(e) {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.click();
                }
            });
        });
    }

    function initScrollAnimations() {
        const observerOptions = {
            root: null,
            rootMargin: '0px 0px -50px 0px',
            threshold: 0.1
        };

        const animatedElements = document.querySelectorAll(
            '.service-card, .testimonial-card, .contact-card, .about-content, .about-image'
        );

        if ('IntersectionObserver' in window) {
            const observer = new IntersectionObserver(function(entries) {
                entries.forEach(function(entry) {
                    if (entry.isIntersecting) {
                        entry.target.style.opacity = '1';
                        entry.target.style.transform = 'translateY(0)';
                        observer.unobserve(entry.target);
                    }
                });
            }, observerOptions);

            animatedElements.forEach(function(el) {
                el.style.opacity = '0';
                el.style.transform = 'translateY(20px)';
                el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
                observer.observe(el);
            });
        } else {
            animatedElements.forEach(function(el) {
                el.style.opacity = '1';
                el.style.transform = 'translateY(0)';
            });
        }
    }

    function initActiveNavHighlight() {
        const sections = document.querySelectorAll('section[id]');
        
        function highlightNav() {
            const scrollY = window.pageYOffset;

            sections.forEach(function(section) {
                const sectionHeight = section.offsetHeight;
                const sectionTop = section.offsetTop - 100;
                const sectionId = section.getAttribute('id');
                const navLink = document.querySelector('.nav-link[href="#' + sectionId + '"]');

                if (navLink) {
                    if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
                        navLink.classList.add('active');
                    } else {
                        navLink.classList.remove('active');
                    }
                }
            });
        }

        let scrollTimeout;
        window.addEventListener('scroll', function() {
            if (scrollTimeout) {
                clearTimeout(scrollTimeout);
            }
            scrollTimeout = setTimeout(highlightNav, 100);
        }, { passive: true });

        highlightNav();
    }

    function init() {
        initNavbar();
        initMobileMenu();
        initSmoothScroll();
        initDatePicker();
        initFormValidation();
        initFAQ();
        initScrollAnimations();
        initActiveNavHighlight();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
