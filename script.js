(() => {
    const canvas = document.getElementById('camo-canvas');
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (canvas && !reduceMotion) {
        const context = canvas.getContext('2d');
        if (context) {
            const particles = [];
            const pointer = { x: null, y: null, radius: 130 };
            let frame = 0;

            function resizeCanvas() {
                const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
                canvas.width = window.innerWidth * pixelRatio;
                canvas.height = window.innerHeight * pixelRatio;
                canvas.style.width = `${window.innerWidth}px`;
                canvas.style.height = `${window.innerHeight}px`;
                context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);

                const count = Math.min(90, Math.floor((window.innerWidth * window.innerHeight) / 18000));
                particles.length = 0;
                for (let index = 0; index < count; index += 1) {
                    particles.push({
                        x: Math.random() * window.innerWidth,
                        y: Math.random() * window.innerHeight,
                        vx: (Math.random() - 0.5) * 0.35,
                        vy: (Math.random() - 0.5) * 0.35,
                        size: Math.random() * 1.4 + 0.7
                    });
                }
            }

            function draw() {
                context.clearRect(0, 0, window.innerWidth, window.innerHeight);

                particles.forEach((particle, index) => {
                    particle.x += particle.vx;
                    particle.y += particle.vy;
                    if (particle.x < 0 || particle.x > window.innerWidth) particle.vx *= -1;
                    if (particle.y < 0 || particle.y > window.innerHeight) particle.vy *= -1;

                    if (pointer.x !== null && pointer.y !== null) {
                        const dx = particle.x - pointer.x;
                        const dy = particle.y - pointer.y;
                        const distance = Math.hypot(dx, dy);
                        if (distance < pointer.radius && distance > 0) {
                            particle.x += (dx / distance) * 0.45;
                            particle.y += (dy / distance) * 0.45;
                        }
                    }

                    context.fillStyle = 'rgba(0, 255, 255, 0.48)';
                    context.beginPath();
                    context.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
                    context.fill();

                    for (let otherIndex = index + 1; otherIndex < particles.length; otherIndex += 1) {
                        const other = particles[otherIndex];
                        const distance = Math.hypot(particle.x - other.x, particle.y - other.y);
                        if (distance < 95) {
                            context.strokeStyle = `rgba(0, 255, 255, ${0.14 * (1 - distance / 95)})`;
                            context.lineWidth = 0.7;
                            context.beginPath();
                            context.moveTo(particle.x, particle.y);
                            context.lineTo(other.x, other.y);
                            context.stroke();
                        }
                    }
                });

                frame = window.requestAnimationFrame(draw);
            }

            window.addEventListener('resize', resizeCanvas);
            window.addEventListener('pointermove', (event) => {
                pointer.x = event.clientX;
                pointer.y = event.clientY;
            }, { passive: true });
            window.addEventListener('pointerleave', () => {
                pointer.x = null;
                pointer.y = null;
            });
            document.addEventListener('visibilitychange', () => {
                if (document.hidden) {
                    window.cancelAnimationFrame(frame);
                } else {
                    frame = window.requestAnimationFrame(draw);
                }
            });
            resizeCanvas();
            draw();
        }
    }

    const revealTargets = document.querySelectorAll(
        '.home-content, .home-img, .gallery figure, .about-copy > *, .contact-copy, .contact-form'
    );
    if ('IntersectionObserver' in window && !reduceMotion) {
        const observer = new IntersectionObserver((entries, currentObserver) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    currentObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.12 });
        revealTargets.forEach((element) => {
            element.classList.add('js-reveal');
            observer.observe(element);
        });
    } else {
        revealTargets.forEach((element) => element.classList.add('is-visible'));
    }

    const contactForm = document.querySelector('[data-contact-form]');
    if (contactForm instanceof HTMLFormElement) {
        contactForm.addEventListener('submit', (event) => {
            event.preventDefault();
            if (!contactForm.reportValidity()) return;

            const formData = new FormData(contactForm);
            const name = String(formData.get('name') || '').trim();
            const email = String(formData.get('email') || '').trim();
            const subject = String(formData.get('subject') || '').trim();
            const message = String(formData.get('message') || '').trim();
            const emailSubject = encodeURIComponent(subject || `Portfolio enquiry from ${name}`);
            const emailBody = encodeURIComponent(
                `Name: ${name}\nEmail: ${email}\n\n${message}`
            );
            const status = contactForm.querySelector('[data-form-status]');
            if (status) {
                status.textContent = 'Opening your email app with the message ready to send.';
            }
            window.location.href = `mailto:okese134@gmail.com?subject=${emailSubject}&body=${emailBody}`;
        });
    }
})();