// Concillio Landing Page JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // Smooth scroll for CTA button to form
    const ctaButton = document.querySelector('.invite-cta');
    const inviteForm = document.querySelector('#inviteForm');
    const messageDiv = document.querySelector('#form-message');
    
    if (ctaButton && inviteForm) {
        ctaButton.addEventListener('click', function(e) {
            e.preventDefault();
            inviteForm.scrollIntoView({ 
                behavior: 'smooth',
                block: 'center'
            });
            
            // Focus on first input after scroll
            setTimeout(() => {
                const firstInput = inviteForm.querySelector('input[name="name"]');
                if (firstInput) firstInput.focus();
            }, 500);
        });
    }

    // Form submission handling
    if (inviteForm) {
        inviteForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            // Get form data
            const formData = new FormData(inviteForm);
            const data = {
                name: formData.get('name'),
                email: formData.get('email'),
                linkedin: formData.get('linkedin') || null
            };

            // Validate required fields
            if (!data.name || !data.email) {
                showMessage('Vänligen fyll i alla obligatoriska fält.', 'error');
                return;
            }

            // Email validation
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(data.email)) {
                showMessage('Vänligen ange en giltig e-postadress.', 'error');
                return;
            }

            // Show loading state
            inviteForm.classList.add('loading');
            const submitButton = inviteForm.querySelector('button[type="submit"]');
            const originalButtonText = submitButton.textContent;
            submitButton.textContent = 'Skickar...';

            try {
                const response = await fetch('/api/invite', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(data)
                });

                const result = await response.json();

                if (response.ok && result.success) {
                    showMessage(result.message || 'Tack för din ansökan! Vi återkommer inom kort.', 'success');
                    inviteForm.reset();
                    
                    // Add some celebration effect
                    celebrateSubmission();
                } else {
                    throw new Error(result.message || 'Något gick fel. Försök igen senare.');
                }
            } catch (error) {
                console.error('Form submission error:', error);
                showMessage('Ett fel uppstod. Vänligen försök igen senare.', 'error');
            } finally {
                // Remove loading state
                inviteForm.classList.remove('loading');
                submitButton.textContent = originalButtonText;
            }
        });
    }

    // Enhanced council interaction - optimized for new Tailwind orbital system
    const councilMembers = document.querySelectorAll('.sigil-center, .sigil-orb, .orbit-pos');
    
    // Desktop hover interactions
    if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
        councilMembers.forEach((member, index) => {
            member.addEventListener('mouseenter', function() {
                this.style.willChange = 'transform';
                this.style.transform = 'scale(1.1)';
                this.style.zIndex = '10';
            });
            
            member.addEventListener('mouseleave', function() {
                this.style.transform = 'scale(1)';
                this.style.zIndex = 'auto';
                this.style.willChange = 'auto';
            });
        });
    } 
    // Mobile touch interactions
    else {
        councilMembers.forEach((member, index) => {
            // Add touch feedback for mobile
            member.addEventListener('touchstart', function() {
                this.style.willChange = 'transform';
                this.style.transform = 'scale(1.05)';
            }, { passive: true });
            
            member.addEventListener('touchend', function() {
                setTimeout(() => {
                    this.style.transform = 'scale(1)';
                    this.style.willChange = 'auto';
                }, 150);
            }, { passive: true });
        });
    }

    // Logo interaction - performance optimized
    const logoSigil = document.querySelector('.council-sigil');
    if (logoSigil) {
        logoSigil.addEventListener('click', function() {
            // Easter egg: rotate the sigil with will-change optimization
            this.style.willChange = 'transform';
            this.style.transform = 'rotate(360deg) scale(1.1)';
            
            setTimeout(() => {
                this.style.transform = '';
                this.style.willChange = 'auto'; // Reset will-change after animation
            }, 600);
        });
    }

    // Performance monitoring and optimization
    if ('performance' in window) {
        // Monitor orbital animation performance
        const observer = new PerformanceObserver((list) => {
            const entries = list.getEntries();
            entries.forEach((entry) => {
                if (entry.duration > 16.67) { // Longer than 60fps frame
                    console.warn('Performance: Slow frame detected:', entry.duration + 'ms');
                }
            });
        });
        
        try {
            observer.observe({entryTypes: ['measure', 'navigation']});
        } catch (e) {
            console.log('Performance Observer not supported');
        }
        
        // Battery status optimization (experimental)
        if ('getBattery' in navigator) {
            navigator.getBattery().then(function(battery) {
                if (battery.level < 0.2 || !battery.charging) {
                    // Reduce animations when battery is low
                    document.documentElement.style.setProperty('--orbit-speed', '60s');
                    document.querySelectorAll('.orbit-item::after, .council-center::after').forEach(el => {
                        el.style.animationDuration = '8s';
                    });
                }
            });
        }
        
        // Enhanced orbital fine-tuning for the new Tailwind utility system
        window.concilioOrbit = {
            // Core controls that work with CSS custom properties
            setSpeed: (seconds) => {
                document.documentElement.style.setProperty('--orbit-speed', seconds + 's');
                console.log(`🚀 Orbital speed set to ${seconds}s`);
            },
            setSize: (size) => {
                // Support both pixel values and clamp expressions
                const value = typeof size === 'number' ? size + 'px' : size;
                document.documentElement.style.setProperty('--size', value);
                console.log(`📐 Orbital size set to ${value}`);
            },
            setRing: (multiplier) => {
                // Use multiplier approach for responsive ring sizing
                document.documentElement.style.setProperty('--ring', `calc(var(--size) * ${multiplier})`);
                console.log(`🔄 Ring tightness set to ${multiplier} (${multiplier * 100}% of size)`);
            },
            setCenterSize: (size) => {
                // Support both pixel values and clamp expressions
                const value = typeof size === 'number' ? size + 'px' : size;
                document.documentElement.style.setProperty('--center', value);
                console.log(`⭕ Center size set to ${value}`);
            },
            setSatelliteSize: (size) => {
                // Control satellite size independently
                const value = typeof size === 'number' ? size + 'px' : size;
                document.documentElement.style.setProperty('--sat', value);
                console.log(`🛰️ Satellite size set to ${value}`);
            },
            setAura: (pixels) => {
                document.documentElement.style.setProperty('--aura', pixels + 'px');
                console.log(`✨ Aura intensity set to ${pixels}px`);
            },
            presets: {
                // Classic formations
                intimatePower: () => {
                    window.concilioOrbit.setRing(0.42);
                    window.concilioOrbit.setCenterSize('clamp(100px, 15vw, 140px)');
                    window.concilioOrbit.setSatelliteSize('clamp(68px, 10vw, 90px)');
                    window.concilioOrbit.setSpeed(30);
                    window.concilioOrbit.setAura(18);
                    console.log('👑 Applied "Intimate Power" preset - Authoritative formation');
                },
                expansiveWisdom: () => {
                    window.concilioOrbit.setRing(0.48);
                    window.concilioOrbit.setCenterSize('clamp(80px, 13vw, 110px)');
                    window.concilioOrbit.setSatelliteSize('clamp(54px, 8vw, 75px)');
                    window.concilioOrbit.setSpeed(45);
                    window.concilioOrbit.setAura(12);
                    console.log('🧙‍♂️ Applied "Expansive Wisdom" preset - Contemplative formation');
                },
                dynamic: () => {
                    window.concilioOrbit.setSpeed(20);
                    window.concilioOrbit.setRing(0.44);
                    window.concilioOrbit.setAura(16);
                    console.log('⚡ Applied "Dynamic" preset - Energetic formation');
                },
                
                // Size-based presets
                compact: () => {
                    window.concilioOrbit.setSize('clamp(180px, 28vw, 280px)');
                    window.concilioOrbit.setRing(0.42);
                    window.concilioOrbit.setCenterSize('clamp(70px, 12vw, 95px)');
                    window.concilioOrbit.setSatelliteSize('clamp(48px, 8vw, 65px)');
                    window.concilioOrbit.setSpeed(32);
                    window.concilioOrbit.setAura(8);
                    console.log('📱 Applied "Compact" preset - Mobile-optimized');
                },
                expansive: () => {
                    window.concilioOrbit.setSize('clamp(280px, 42vw, 520px)');
                    window.concilioOrbit.setRing(0.46);
                    window.concilioOrbit.setCenterSize('clamp(100px, 16vw, 150px)');
                    window.concilioOrbit.setSatelliteSize('clamp(68px, 10vw, 95px)');
                    window.concilioOrbit.setSpeed(40);
                    window.concilioOrbit.setAura(14);
                    console.log('🖥️ Applied "Expansive" preset - Desktop-optimized');
                },
                
                // Speed presets
                static: () => {
                    window.concilioOrbit.setSpeed(0);
                    console.log('⏹️ Applied "Static" preset - No rotation');
                },
                slow: () => {
                    window.concilioOrbit.setSpeed(60);
                    console.log('🐌 Applied "Slow" preset - Meditative 60s rotation');
                },
                fast: () => {
                    window.concilioOrbit.setSpeed(15);
                    console.log('🏃‍♂️ Applied "Fast" preset - Energetic 15s rotation');
                }
            },
            
            // Helper functions for Tailwind utility approach
            tailwind: {
                info: () => {
                    console.log('%cTailwind Utility Orbital System Available!', 'color: #38bdf8; font-weight: bold; font-size: 14px;');
                    console.log('Use these utility classes for modular orbital systems:');
                    console.log('.orbit, .animate-orbit, .orbit-pos, .animate-counter, .sigil-center, .sigil-orb');
                },
                
                createSatellite: (angle, iconId, label) => {
                    console.log(`Satellite HTML for ${label} at ${angle} turn:`);
                    const html = `<div class="orbit-pos sigil-orb w-[var(--sat)] h-[var(--sat)] [--angle:${angle}turn]" aria-label="${label}">
  <div class="animate-counter">
    <svg class="w-5 h-5" fill="currentColor">
      <use href="#${iconId}"/>
    </svg>
  </div>
</div>`;
                    console.log(html);
                    return html;
                }
            }
        };
        
        // Enhanced utilities and debugging
        window.concilioOrbit.utils = {
            reset: () => {
                // Reset to default values matching the HTML
                window.concilioOrbit.setSize('clamp(220px, 36vw, 420px)');
                window.concilioOrbit.setRing(0.46);
                window.concilioOrbit.setCenterSize('clamp(86px, 14vw, 120px)');
                window.concilioOrbit.setSatelliteSize('clamp(58px, 9vw, 80px)');
                window.concilioOrbit.setAura(10);
                window.concilioOrbit.setSpeed(36);
                console.log('🔄 Reset to default Concillio configuration');
            },
            
            getCurrentValues: () => {
                const style = getComputedStyle(document.documentElement);
                const values = {
                    size: style.getPropertyValue('--size').trim(),
                    ring: style.getPropertyValue('--ring').trim(),
                    center: style.getPropertyValue('--center').trim(),
                    satellite: style.getPropertyValue('--sat').trim(),
                    aura: style.getPropertyValue('--aura').trim(),
                    speed: style.getPropertyValue('--orbit-speed').trim()
                };
                console.table(values);
                return values;
            },
            
            randomize: () => {
                const sizes = ['compact', 'expansive'];
                const formations = ['intimatePower', 'expansiveWisdom', 'dynamic'];
                const speeds = ['slow', 'fast'];
                
                const randomSize = sizes[Math.floor(Math.random() * sizes.length)];
                const randomFormation = formations[Math.floor(Math.random() * formations.length)];
                const randomSpeed = speeds[Math.floor(Math.random() * speeds.length)];
                
                window.concilioOrbit.presets[randomSize]();
                setTimeout(() => window.concilioOrbit.presets[randomFormation](), 100);
                setTimeout(() => window.concilioOrbit.presets[randomSpeed](), 200);
                
                console.log(`🎲 Applied random configuration: ${randomSize} + ${randomFormation} + ${randomSpeed}`);
            }
        };
        
        // Enhanced console introduction
        console.log(`%c✨ Concillio Orbital Fine-Tuning System Active! ✨`, 
                   'background: linear-gradient(45deg, #d4af37, #b8941f); color: white; padding: 8px 12px; border-radius: 4px; font-weight: bold; font-size: 14px;');
        console.log(`%cQuick Start Commands:`, 'color: #d4af37; font-weight: bold; font-size: 12px;');
        console.log('🚀 concilioOrbit.setSpeed(25)           // Change rotation speed');
        console.log('👑 concilioOrbit.presets.intimatePower()  // Authoritative formation');
        console.log('🔄 concilioOrbit.utils.reset()          // Reset to defaults');
        console.log('📊 concilioOrbit.utils.getCurrentValues()  // Show current settings');
        console.log('🎲 concilioOrbit.utils.randomize()      // Random configuration');
        console.log('🔧 concilioOrbit.tailwind.createSatellite(0.375, "ico-strategist", "New Member") // Create satellite');
        console.log(`%cAvailable presets:`, 'color: #38bdf8; font-weight: bold;');
        console.log(Object.keys(window.concilioOrbit.presets).join(' • '));
    }
    }

    // Hero performance: NO scroll handlers for optimal performance
    // Parallax effects moved to CSS-only solutions for 60fps
    
    // REFERENCE: Optimal scroll handler pattern for future use
    // let ticking = false;
    // function onScroll(){
    //   if (!ticking) {
    //     requestAnimationFrame(() => {
    //       // minimal work (läsa scrollY, toggla klass)
    //       ticking = false;
    //     });
    //     ticking = true;
    //   }
    // }
    // window.addEventListener('scroll', onScroll, { passive: true });

    // ==== SMOOTH SCROLL & PERFECT FLOW SYSTEM ============================
    
    // Enhanced Intersection Observer for seamless section transitions
    const observerOptions = {
        threshold: [0.05, 0.1, 0.2, 0.3],
        rootMargin: '0px 0px -30px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Smooth entrance animation
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                entry.target.classList.add('section-visible');
                
                // Enhanced orbital system activation när orbit blir synlig
                if (entry.target.classList.contains('orbit-wrapper')) {
                    const orbitCenter = entry.target.querySelector('.orbit__center');
                    if (orbitCenter) {
                        // Subtle scale animation när orbit kommer in i vy
                        setTimeout(() => {
                            orbitCenter.style.transform = 'translate(-50%, -50%) scale(1.05)';
                            setTimeout(() => {
                                orbitCenter.style.transform = 'translate(-50%, -50%) scale(1)';
                            }, 300);
                        }, 200);
                    }
                }
            } else {
                // Subtle fade när section lämnar viewport (optional)
                if (entry.boundingClientRect.top > window.innerHeight * 0.8) {
                    entry.target.classList.remove('section-visible');
                }
            }
        });
    }, observerOptions);

    // Apply smooth transitions to all sections
    const sections = document.querySelectorAll('section');
    sections.forEach((section, index) => {
        // Initial state för smooth entrance
        section.style.opacity = index === 0 ? '1' : '0';
        section.style.transform = index === 0 ? 'translateY(0)' : 'translateY(15px)';
        section.style.transition = 'opacity 0.8s cubic-bezier(0.4, 0, 0.2, 1), transform 0.8s cubic-bezier(0.4, 0, 0.2, 1)';
        
        // Observe för intersection
        observer.observe(section);
    });

    // Smooth scrolling enhancements för alla länkar
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

    // Enhanced CTA button scroll behavior
    const allCTAButtons = document.querySelectorAll('button, .cta, .btn-premium');
    allCTAButtons.forEach(button => {
        if (!button.hasAttribute('type') || button.getAttribute('type') !== 'submit') {
            button.addEventListener('click', function(e) {
                // Smooth scroll till apply section om det finns
                const applySection = document.querySelector('#apply');
                if (applySection) {
                    e.preventDefault();
                    applySection.scrollIntoView({
                        behavior: 'smooth',
                        block: 'center'
                    });
                    
                    // Focus på första input efter scroll
                    setTimeout(() => {
                        const firstInput = applySection.querySelector('input');
                        if (firstInput) {
                            firstInput.focus();
                        }
                    }, 800);
                }
            });
        }
    });

    // Performance-optimized scroll progress indicator
    let scrollProgress = 0;
    let ticking = false;

    function updateScrollProgress() {
        const scrollTop = window.pageYOffset;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        scrollProgress = (scrollTop / docHeight) * 100;
        
        // Update CSS custom property för potentiell användning
        document.documentElement.style.setProperty('--scroll-progress', scrollProgress + '%');
        
        ticking = false;
    }

    window.addEventListener('scroll', () => {
        if (!ticking) {
            requestAnimationFrame(updateScrollProgress);
            ticking = true;
        }
    }, { passive: true });

    // Orbit hover enhancements för bättre interactivity
    const orbitElements = document.querySelectorAll('.orbit__sat, .orbit__center');
    orbitElements.forEach(element => {
        if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
            element.addEventListener('mouseenter', function() {
                this.style.willChange = 'transform';
                this.style.transition = 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)';
            });
            
            element.addEventListener('mouseleave', function() {
                this.style.willChange = 'auto';
                this.style.transition = 'transform 0.2s ease-out';
            });
        }
    });
});

// Helper function to show messages
function showMessage(text, type = 'success') {
    const messageDiv = document.querySelector('#form-message');
    if (!messageDiv) return;

    messageDiv.innerHTML = `<p class="message-${type}">${text}</p>`;
    messageDiv.classList.remove('hidden');
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
        messageDiv.classList.add('hidden');
    }, 5000);
}

// Celebration effect for successful form submission
function celebrateSubmission() {
    // Create golden particles effect
    const colors = ['#d4af37', '#b8941f', '#f4e4bc'];
    
    for (let i = 0; i < 20; i++) {
        setTimeout(() => {
            createParticle(colors[Math.floor(Math.random() * colors.length)]);
        }, i * 50);
    }
}

function createParticle(color) {
    const particle = document.createElement('div');
    particle.style.cssText = `
        position: fixed;
        width: 6px;
        height: 6px;
        background: ${color};
        border-radius: 50%;
        pointer-events: none;
        z-index: 9999;
        left: ${Math.random() * window.innerWidth}px;
        top: ${window.innerHeight + 10}px;
        box-shadow: 0 0 6px ${color};
    `;
    
    document.body.appendChild(particle);
    
    // Animate upward
    let position = window.innerHeight + 10;
    const speed = 2 + Math.random() * 3;
    const drift = (Math.random() - 0.5) * 2;
    let opacity = 1;
    
    const animate = () => {
        position -= speed;
        opacity -= 0.01;
        
        particle.style.top = position + 'px';
        particle.style.left = (parseFloat(particle.style.left) + drift) + 'px';
        particle.style.opacity = opacity;
        
        if (position > -10 && opacity > 0) {
            requestAnimationFrame(animate);
        } else {
            particle.remove();
        }
    };
    
    animate();
}