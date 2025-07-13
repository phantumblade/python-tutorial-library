        // Dark mode functionality
        const darkModeToggle = document.getElementById('darkModeToggle');
        const mobileDarkModeToggle = document.getElementById('mobileDarkModeToggle');

        function initDarkMode() {
            const savedTheme = localStorage.getItem('theme') || 'light';
            document.documentElement.setAttribute('data-theme', savedTheme);
            updateDarkModeIcons(savedTheme);
        }

        function updateDarkModeIcons(theme) {
            const icon = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
            if (darkModeToggle) {
                darkModeToggle.querySelector('i').className = icon;
            }
            if (mobileDarkModeToggle) {
                mobileDarkModeToggle.querySelector('i').className = icon;
            }
        }

        function toggleDarkMode() {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            
            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
            updateDarkModeIcons(newTheme);
        }

        // Event listeners for dark mode
        if (darkModeToggle) {
            darkModeToggle.addEventListener('click', toggleDarkMode);
        }
        if (mobileDarkModeToggle) {
            mobileDarkModeToggle.addEventListener('click', toggleDarkMode);
        }

        // Initialize dark mode on page load
        initDarkMode();

        // Mobile sidebar functionality
        const mobileSidebarToggle = document.querySelector('.mobile-sidebar-toggle');
        const mobileSidebar = document.getElementById('mobileSidebar');
        const sidebarClose = document.querySelector('.sidebar-close');
        const sidebarOverlay = document.querySelector('.sidebar-overlay');
        let isSidebarOpen = false;

        function toggleMobileSidebar() {
            isSidebarOpen = !isSidebarOpen;
            const icon = mobileSidebarToggle.querySelector('i');

            if (isSidebarOpen) {
                mobileSidebar.classList.add('active');
                icon.className = 'fas fa-times';
                mobileSidebarToggle.setAttribute('aria-expanded', 'true');
                document.body.style.overflow = 'hidden';
            } else {
                mobileSidebar.classList.remove('active');
                icon.className = 'fas fa-bars';
                mobileSidebarToggle.setAttribute('aria-expanded', 'false');
                document.body.style.overflow = '';
            }
        }

        function closeMobileSidebar() {
            if (isSidebarOpen) {
                toggleMobileSidebar();
            }
        }

        // Event listeners for sidebar
        mobileSidebarToggle.addEventListener('click', toggleMobileSidebar);
        sidebarClose.addEventListener('click', closeMobileSidebar);
        sidebarOverlay.addEventListener('click', closeMobileSidebar);

        // Sidebar section toggles
        document.querySelectorAll('.sidebar-section-toggle').forEach(toggle => {
            toggle.addEventListener('click', function() {
                const section = this.parentElement;
                section.classList.toggle('active');
            });
        });

        // Close sidebar on link click
        document.querySelectorAll('.sidebar-sublink').forEach(link => {
            link.addEventListener('click', closeMobileSidebar);
        });

        // Close sidebar when clicking outside
        document.addEventListener('click', (e) => {
            if (isSidebarOpen && !mobileSidebar.contains(e.target) && !mobileSidebarToggle.contains(e.target)) {
                closeMobileSidebar();
            }
        });

        // Close sidebar on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && isSidebarOpen) {
                closeMobileSidebar();
            }
        });

        // Smooth scrolling
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

        // Scroll animations
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                }
            });
        }, observerOptions);

        document.querySelectorAll('.fade-in').forEach(el => {
            observer.observe(el);
        });

        // Active section highlighting in sidebar
        function updateActiveSection() {
            const sections = document.querySelectorAll('.section');
            const sidebarLinks = document.querySelectorAll('.sidebar-sublink');

            let currentSection = '';
            const scrollPos = window.scrollY + 100;

            sections.forEach(section => {
                const sectionTop = section.offsetTop;
                const sectionBottom = sectionTop + section.offsetHeight;

                if (scrollPos >= sectionTop && scrollPos < sectionBottom) {
                    currentSection = section.getAttribute('id');
                }
            });

            sidebarLinks.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href').substring(1) === currentSection) {
                    link.classList.add('active');
                }
            });
        }

        window.addEventListener('scroll', updateActiveSection);
        window.addEventListener('load', updateActiveSection);

        // Close sidebar on window resize
        window.addEventListener('resize', () => {
            if (window.innerWidth > 768 && isSidebarOpen) {
                closeMobileSidebar();
            }
        });

        // Pyodide setup
        let pyodideReady = false;
    let pyodide = null;

async function loadPyodideAndPackages() {
    try {
        pyodide = await loadPyodide();
        pyodideReady = true;
        console.log("Pyodide caricato con successo!");

        // Aggiorna l'interfaccia per mostrare che è pronto
        document.querySelectorAll('.btn').forEach(btn => {
            if (btn.textContent.includes('Esegui')) {
                btn.style.background = '#28a745'; // Verde
            }
        });
    } catch (error) {
        console.error("Errore nel caricamento di Pyodide:", error);
        pyodideReady = false;
    }
}
    loadPyodideAndPackages();

    async function runCode(button) {
        const container = button.closest('.interactive-demo') || button.closest('.card');
        const input = container.querySelector('.code-input');
        const output = container.querySelector('.output');
        const code = input.value.trim();

        if (!code) {
            output.textContent = 'Inserisci del codice';
            output.className = 'output error';
            output.style.display = 'block';
            return;
        }

        button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Esecuzione...';
        button.disabled = true;

        if (!pyodideReady) {
            output.textContent = 'Pyodide non è ancora pronto, attendi...';
            output.className = 'output error';
            output.style.display = 'block';
            button.innerHTML = '<i class="fas fa-play"></i> Esegui';
            button.disabled = false;
            return;
        }

        try {
            let result = await pyodide.runPythonAsync(`
import sys
import io
sys.stdout = io.StringIO()
sys.stderr = io.StringIO()
${code}
sys.stdout.getvalue() + sys.stderr.getvalue()
            `);
            output.textContent = result || 'Eseguito';
            output.className = 'output success';
            output.style.display = 'block';
        } catch (error) {
            output.textContent = 'Errore: ' + error;
            output.className = 'output error';
            output.style.display = 'block';
        }
        button.innerHTML = '<i class="fas fa-play"></i> Esegui';
        button.disabled = false;
    }

    function testOperator(op, a, b) {
        const resultDiv = document.getElementById('operator-result');
        if (!resultDiv) return;

        try {
            let result;
            switch (op) {
                case '+': result = a + b; break;
                case '-': result = a - b; break;
                case '*': result = a * b; break;
                case '/': result = (a / b).toFixed(3); break;
                case '//': result = Math.floor(a / b); break;
                case '**': result = Math.pow(a, b); break;
                case '%': result = a % b; break;
                default: result = 'Operatore non supportato';
            }

            resultDiv.textContent = `${a} ${op} ${b} = ${result}`;
            resultDiv.className = 'output success';
            resultDiv.style.display = 'block';

        } catch (error) {
            resultDiv.textContent = `Errore: ${error.message}`;
            resultDiv.className = 'output error';
            resultDiv.style.display = 'block';
        }
    }

    // Navigazione e inizializzazione
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);

            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    function updateActiveSection() {
        const sections = document.querySelectorAll('.section');
        const navLinks = document.querySelectorAll('.nav-link');

        let currentSection = '';
        const scrollPos = window.scrollY + 100;

        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionBottom = sectionTop + section.offsetHeight;

            if (scrollPos >= sectionTop && scrollPos < sectionBottom) {
                currentSection = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href').substring(1) === currentSection) {
                link.classList.add('active');
            }
        });
    }

    window.addEventListener('scroll', updateActiveSection);
    window.addEventListener('load', updateActiveSection);

    // Gestione Ctrl+Enter per eseguire codice
    document.addEventListener('keydown', function(e) {
        if (e.ctrlKey && e.key === 'Enter') {
            const target = e.target;
            if (target.classList.contains('code-input')) {
                const button = target.closest('.interactive-demo').querySelector('.btn');
                if (button) runCode(button);
            }
        }
    });

    // Enhanced Navigation Popup Functionality
    const navPopup = document.getElementById('navPopup');
    const navSections = document.getElementById('navSections');
    const navToggle = document.getElementById('navToggle');
    
    const sections = [
        { id: 'intro', title: 'Introduzione', icon: 'fas fa-rocket' },
        { id: 'repl', title: 'REPL', icon: 'fas fa-terminal' },
        { id: 'sintassi', title: 'Sintassi', icon: 'fas fa-code' },
        { id: 'tipi', title: 'Tipi di Dati', icon: 'fas fa-tags' },
        { id: 'operatori', title: 'Operatori', icon: 'fas fa-calculator' },
        { id: 'costrutti', title: 'Costrutti', icon: 'fas fa-cogs' },
        { id: 'motivazioni', title: 'Perché Python', icon: 'fas fa-star' },
        { id: 'esempi', title: 'Esempi', icon: 'fas fa-lightbulb' },
        { id: 'esercizi', title: 'Esercizi', icon: 'fas fa-graduation-cap' },
        { id: 'concetti', title: 'Avanzati', icon: 'fas fa-rocket' }
    ];
    
    let currentSectionIndex = 0;
    let popupTimeout;
    let isPopupHidden = false;
    let autoHideTimeout;
    
    function createNavPills() {
        navSections.innerHTML = '';
        
        // Mostra sempre 5 pillole: 2 sopra + corrente + 2 sotto (quando possibile)
        const maxVisible = 5;
        const beforeCurrent = 2;
        const afterCurrent = 2;
        
        let startIndex = Math.max(0, currentSectionIndex - beforeCurrent);
        let endIndex = Math.min(sections.length - 1, currentSectionIndex + afterCurrent);
        
        // Aggiusta il range se siamo vicini ai bordi
        if (endIndex - startIndex < maxVisible - 1) {
            if (startIndex === 0) {
                endIndex = Math.min(sections.length - 1, startIndex + maxVisible - 1);
            } else if (endIndex === sections.length - 1) {
                startIndex = Math.max(0, endIndex - maxVisible + 1);
            }
        }
        
        for (let i = startIndex; i <= endIndex; i++) {
            const section = sections[i];
            const pill = document.createElement('a');
            pill.href = '#' + section.id;
            pill.className = 'nav-pill';
            pill.title = section.title;
            
            // Desktop: Icona + Testo, Mobile: Solo icona (gestito da CSS)
            pill.innerHTML = `
                <i class="pill-icon ${section.icon}"></i>
                <span class="pill-text">${section.title}</span>
            `;
            
            // Calcola distanza dalla sezione corrente
            const distance = Math.abs(i - currentSectionIndex);
            
            if (distance === 0) {
                pill.classList.add('current');
            } else {
                pill.classList.add(`distance-${Math.min(distance, 3)}`);
            }
            
            // Posizionamento dinamico basato sulla posizione nell'array visibile
            const positionIndex = i - startIndex;
            const totalVisible = endIndex - startIndex + 1;
            const centerPosition = Math.floor(totalVisible / 2);
            const offsetFromCenter = positionIndex - centerPosition;
            
            // Applica offset verticale ultra-compatto
            const isMobile = window.innerWidth <= 768;
            const spacing = isMobile ? 14 : 18; // Molto più vicine e compatte
            const verticalOffset = offsetFromCenter * spacing;
            
            // Animazione fluida durante scroll
            pill.style.transition = 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)';
            pill.style.transform = `translateY(${verticalOffset}px) scale(var(--pill-scale, 1))`;
            
            // Imposta le variabili CSS per scale responsive
            if (distance === 0) {
                pill.style.setProperty('--pill-scale', isMobile ? '1.0' : '1.0');
            } else if (distance === 1) {
                pill.style.setProperty('--pill-scale', isMobile ? '0.85' : '0.85');
            } else if (distance === 2) {
                pill.style.setProperty('--pill-scale', isMobile ? '0.7' : '0.7');
            } else {
                pill.style.setProperty('--pill-scale', isMobile ? '0.55' : '0.55');
            }
            
            pill.addEventListener('click', (e) => {
                e.preventDefault();
                const targetElement = document.getElementById(section.id);
                if (targetElement) {
                    targetElement.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
            
            navSections.appendChild(pill);
        }
    }
    
    function showNavPopup() {
        if (isPopupHidden) return;
        
        clearTimeout(popupTimeout);
        clearTimeout(autoHideTimeout);
        
        // Animazione di entrata fluida
        requestAnimationFrame(() => {
            createNavPills();
            navPopup.classList.remove('hidden');
            navPopup.classList.add('visible');
            navToggle.classList.remove('visible');
        });
        
        // Auto-hide dopo 2.5 secondi se l'utente non interagisce
        autoHideTimeout = setTimeout(() => {
            if (!navPopup.matches(':hover') && !document.querySelector('.nav-pill:hover')) {
                hideNavPopup();
            }
        }, 2500);
    }
    
    function hideNavPopup() {
        navPopup.classList.remove('visible');
        navPopup.classList.add('hidden');
        navToggle.classList.add('visible');
        clearTimeout(popupTimeout);
        clearTimeout(autoHideTimeout);
        isPopupHidden = true;
        
        // Reset dopo 1 secondo per permettere ricomparsa rapida
        setTimeout(() => {
            isPopupHidden = false;
        }, 1000);
    }
    
    function forceShowNavPopup() {
        isPopupHidden = false;
        navPopup.classList.remove('hidden');
        navToggle.classList.remove('visible');
        showNavPopup();
    }
    
    function updateCurrentSection() {
        const scrollPos = window.scrollY + 150;
        let newCurrentIndex = 0;
        
        sections.forEach((section, index) => {
            const element = document.getElementById(section.id);
            if (element) {
                const rect = element.getBoundingClientRect();
                const elementTop = rect.top + window.scrollY;
                
                if (scrollPos >= elementTop) {
                    newCurrentIndex = index;
                }
            }
        });
        
        if (newCurrentIndex !== currentSectionIndex) {
            const previousIndex = currentSectionIndex;
            currentSectionIndex = newCurrentIndex;
            
            // Mostra popup solo quando cambia sezione
            if (!isPopupHidden) {
                showNavPopup();
            }
        }
    }
    
    function updateExistingPills() {
        const pills = document.querySelectorAll('.nav-pill');
        const isMobile = window.innerWidth <= 768;
        const spacing = isMobile ? 18 : 24;
        
        pills.forEach((pill, index) => {
            const distance = Math.abs(index - 2); // Center is always at index 2
            const offsetFromCenter = index - 2;
            const verticalOffset = offsetFromCenter * spacing;
            
            // Smooth transition
            pill.style.transform = `translateY(${verticalOffset}px)`;
            
            // Update classes
            pill.className = 'nav-pill';
            if (distance === 0) {
                pill.classList.add('current');
            } else {
                pill.classList.add(`distance-${Math.min(distance, 3)}`);
            }
        });
    }
    
    // Enhanced event listeners
    let scrollTimeout;
    window.addEventListener('scroll', () => {
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(updateCurrentSection, 100); // Debounce per performance
    });
    
    // Hover management per desktop
    navPopup.addEventListener('mouseenter', () => {
        clearTimeout(autoHideTimeout);
    });
    
    navPopup.addEventListener('mouseleave', () => {
        autoHideTimeout = setTimeout(() => {
            hideNavPopup();
        }, 1000);
    });
    
    // Touch handling per mobile
    let touchStartTime = 0;
    navPopup.addEventListener('touchstart', () => {
        touchStartTime = Date.now();
        clearTimeout(autoHideTimeout);
    });
    
    navPopup.addEventListener('touchend', () => {
        const touchDuration = Date.now() - touchStartTime;
        if (touchDuration < 200) { // Tap rapido
            autoHideTimeout = setTimeout(() => {
                hideNavPopup();
            }, 2500);
        }
    });
    
    // Toggle button events
    navToggle.addEventListener('click', forceShowNavPopup);
    navToggle.addEventListener('touchstart', (e) => {
        e.preventDefault();
        forceShowNavPopup();
    });
    
    // Prevent accidental hiding on mobile touch
    navPopup.addEventListener('touchstart', (e) => {
        clearTimeout(autoHideTimeout);
    });
    
    // Scroll wheel navigation on popup
    let scrollNavigationTimeout;
    navPopup.addEventListener('wheel', (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        clearTimeout(autoHideTimeout);
        clearTimeout(scrollNavigationTimeout);
        
        const direction = e.deltaY > 0 ? 1 : -1;
        const newIndex = Math.max(0, Math.min(sections.length - 1, currentSectionIndex + direction));
        
        if (newIndex !== currentSectionIndex) {
            currentSectionIndex = newIndex;
            createNavPills();
            
            // Smooth scroll to section
            const targetElement = document.getElementById(sections[newIndex].id);
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        }
        
        // Auto-hide dopo scroll navigation
        scrollNavigationTimeout = setTimeout(() => {
            autoHideTimeout = setTimeout(() => {
                hideNavPopup();
            }, 1500);
        }, 500);
    });

    // Inizializzazione
    document.addEventListener('DOMContentLoaded', function() {
        updateCurrentSection();
        setTimeout(showNavPopup, 2000); // Mostra brevemente all'inizio
        updateActiveSection();

        // Auto-focus primo input
        const firstInput = document.querySelector('.code-input');
        if (firstInput) {
            firstInput.focus();
        }
    });

    // Funzione per auto-espandere i textarea in base al contenuto
function autoResizeTextarea(textarea) {
    textarea.style.height = 'auto';
    textarea.style.height = (textarea.scrollHeight + 2) + 'px';
}

// Inizializza gli textarea esistenti
document.querySelectorAll('textarea.code-input').forEach(textarea => {
    autoResizeTextarea(textarea);

    // Aggiungi evento input per l'auto-espansione
    textarea.addEventListener('input', function() {
        autoResizeTextarea(this);
    });
});