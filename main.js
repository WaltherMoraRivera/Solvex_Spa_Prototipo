/* =========================================================
   SOLVEX SpA — main.js
   Capa de interacción y motion. Organizado por módulos:
     1. Utilidades / feature detection
     2. Navbar inteligente (hide-on-scroll + blur + móvil)
     3. Reveal por scroll con GSAP (stagger)
     4. Contadores (count-up)
     5. Spotlight del hero (sigue el mouse)
     6. Tilt 3D + glow de tarjetas
     7. Ripple en botones
     8. Validación visual del formulario (solo estético)
========================================================= */
(function () {
    "use strict";

    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const hasGSAP = typeof window.gsap !== "undefined";
    const isTouch = window.matchMedia("(hover: none)").matches;

    document.documentElement.classList.add(hasGSAP ? "gsap-ready" : "no-gsap");

    /* ---------------------------------------------------------
       2. NAVBAR INTELIGENTE
    --------------------------------------------------------- */
    const navbar = document.getElementById("navbar");
    const navToggle = document.getElementById("navToggle");
    const navLinks = document.getElementById("navLinks");
    const progress = document.getElementById("scrollProgress");
    let lastScroll = 0;

    function onScroll() {
        const y = window.scrollY;
        navbar.classList.toggle("scrolled", y > 30);
        // Ocultar al bajar, mostrar al subir (no en el tope)
        if (y > lastScroll && y > 300) {
            navbar.classList.add("hidden");
        } else {
            navbar.classList.remove("hidden");
        }
        lastScroll = y;
        // Barra de progreso de scroll
        if (progress) {
            const max = document.documentElement.scrollHeight - window.innerHeight;
            progress.style.width = max > 0 ? `${(y / max) * 100}%` : "0%";
        }
    }
    window.addEventListener("scroll", onScroll, { passive: true });

    // Menú móvil con focus trap y cierre con Escape
    if (navToggle) {
        const focusables = () => navLinks.querySelectorAll("a");
        let lastFocused = null;

        const openMenu = () => {
            navLinks.classList.add("open");
            navToggle.setAttribute("aria-expanded", "true");
            navToggle.setAttribute("aria-label", "Cerrar menú");
            lastFocused = document.activeElement;
            focusables()[0]?.focus();
            document.addEventListener("keydown", onKeydown);
        };
        const closeMenu = (returnFocus = true) => {
            navLinks.classList.remove("open");
            navToggle.setAttribute("aria-expanded", "false");
            navToggle.setAttribute("aria-label", "Abrir menú");
            document.removeEventListener("keydown", onKeydown);
            if (returnFocus) (lastFocused || navToggle).focus();
        };
        const onKeydown = (e) => {
            if (e.key === "Escape") { closeMenu(); return; }
            if (e.key === "Tab") {
                const items = Array.from(focusables());
                if (!items.length) return;
                const first = items[0], last = items[items.length - 1];
                if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
                else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
            }
        };

        navToggle.addEventListener("click", () => {
            navLinks.classList.contains("open") ? closeMenu() : openMenu();
        });
        focusables().forEach((a) =>
            a.addEventListener("click", () => closeMenu(false))
        );
    }

    /* ---------------------------------------------------------
       2b. SCROLL-SPY (resalta la sección activa en el navbar)
    --------------------------------------------------------- */
    function initScrollSpy() {
        const sections = document.querySelectorAll("main section[id]");
        const linkFor = (id) => navLinks?.querySelector(`a[href="#${id}"]`);
        if (!sections.length || !navLinks) return;

        const io = new IntersectionObserver((entries) => {
            entries.forEach((e) => {
                const link = linkFor(e.target.id);
                if (!link) return;
                if (e.isIntersecting) {
                    navLinks.querySelectorAll('a[aria-current="true"]')
                        .forEach((a) => a.removeAttribute("aria-current"));
                    link.setAttribute("aria-current", "true");
                }
            });
        }, { rootMargin: "-45% 0px -50% 0px", threshold: 0 });
        sections.forEach((s) => io.observe(s));
    }

    /* ---------------------------------------------------------
       3. REVEAL POR SCROLL (GSAP + ScrollTrigger)
    --------------------------------------------------------- */
    function initReveal() {
        if (!hasGSAP || prefersReduced) return;
        gsap.registerPlugin(ScrollTrigger);

        // Entrada del hero (sin scroll, al cargar)
        const heroItems = gsap.utils.toArray("#inicio [data-animate]");
        gsap.to(heroItems, {
            opacity: 1, y: 0, duration: 0.9, ease: "power3.out",
            stagger: 0.12, delay: 0.15,
        });
        gsap.set(heroItems, { y: 30 });
        gsap.to(heroItems, { y: 0, opacity: 1, duration: 0.9, ease: "power3.out", stagger: 0.12, delay: 0.15 });

        // Resto de secciones al entrar en viewport
        gsap.utils.toArray("[data-animate]").forEach((el) => {
            if (el.closest("#inicio")) return;
            gsap.fromTo(el,
                { opacity: 0, y: 40 },
                {
                    opacity: 1, y: 0, duration: 0.8, ease: "power3.out",
                    scrollTrigger: { trigger: el, start: "top 85%", toggleActions: "play none none none" },
                }
            );
        });

        // Stagger específico para las tarjetas de servicios
        ScrollTrigger.batch("#gridServicios .card", {
            start: "top 88%",
            onEnter: (batch) =>
                gsap.fromTo(batch,
                    { opacity: 0, y: 50 },
                    { opacity: 1, y: 0, duration: 0.7, ease: "power3.out", stagger: 0.12, overwrite: true }
                ),
        });
    }

    /* ---------------------------------------------------------
       4. CONTADORES (count-up al entrar en viewport)
    --------------------------------------------------------- */
    function initCounters() {
        const counters = document.querySelectorAll(".counter");
        if (!counters.length) return;

        const run = (el) => {
            const target = parseFloat(el.dataset.target) || 0;
            const prefix = el.dataset.prefix || "";
            const suffix = el.dataset.suffix || "";
            if (prefix) { el.textContent = prefix + suffix; return; } // valor textual (ej. INAE)
            if (prefersReduced) { el.textContent = target + suffix; return; }

            const dur = 1600;
            const t0 = performance.now();
            const step = (now) => {
                const p = Math.min((now - t0) / dur, 1);
                const eased = 1 - Math.pow(1 - p, 3);
                el.textContent = Math.round(target * eased) + suffix;
                if (p < 1) requestAnimationFrame(step);
            };
            requestAnimationFrame(step);
        };

        const io = new IntersectionObserver((entries) => {
            entries.forEach((e) => {
                if (e.isIntersecting) { run(e.target); io.unobserve(e.target); }
            });
        }, { threshold: 0.5 });
        counters.forEach((c) => io.observe(c));
    }

    /* ---------------------------------------------------------
       4b. RED DE PARTÍCULAS DEL HERO (canvas 2D)
       Nodos conectados que evocan el átomo del logo. Optimizado:
       DPR limitado, densidad según ancho, pausa fuera de viewport,
       reactivo al puntero. Se desactiva con reduced-motion.
    --------------------------------------------------------- */
    function initParticles() {
        const canvas = document.getElementById("heroCanvas");
        if (!canvas || prefersReduced) return;
        const ctx = canvas.getContext("2d", { alpha: true });
        const hero = canvas.parentElement;

        let w = 0, h = 0, dpr = Math.min(window.devicePixelRatio || 1, 2);
        let nodes = [];
        let running = true;
        let raf = null;
        const pointer = { x: -9999, y: -9999 };
        const LINK_DIST = 150;

        function resize() {
            const r = hero.getBoundingClientRect();
            w = r.width; h = r.height;
            canvas.width = w * dpr; canvas.height = h * dpr;
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
            // densidad proporcional al área, con techo para performance
            const count = Math.min(Math.round((w * h) / 16000), 90);
            nodes = Array.from({ length: count }, () => ({
                x: Math.random() * w, y: Math.random() * h,
                vx: (Math.random() - 0.5) * 0.35, vy: (Math.random() - 0.5) * 0.35,
                r: Math.random() * 2.4 + 1.4,
            }));
        }

        function draw() {
            if (!running) return;
            ctx.clearRect(0, 0, w, h);
            for (let i = 0; i < nodes.length; i++) {
                const n = nodes[i];
                n.x += n.vx; n.y += n.vy;
                if (n.x < 0 || n.x > w) n.vx *= -1;
                if (n.y < 0 || n.y > h) n.vy *= -1;

                // leve atracción al puntero
                const dxp = pointer.x - n.x, dyp = pointer.y - n.y;
                const dp = Math.hypot(dxp, dyp);
                if (dp < 160) { n.x += dxp * 0.0016; n.y += dyp * 0.0016; }

                ctx.beginPath();
                ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
                ctx.fillStyle = "rgba(160, 232, 210, 0.95)";
                ctx.shadowColor = "rgba(93, 202, 165, 0.7)";
                ctx.shadowBlur = 6;
                ctx.fill();
                ctx.shadowBlur = 0;

                for (let j = i + 1; j < nodes.length; j++) {
                    const m = nodes[j];
                    const dx = n.x - m.x, dy = n.y - m.y;
                    const d = Math.hypot(dx, dy);
                    if (d < LINK_DIST) {
                        ctx.beginPath();
                        ctx.moveTo(n.x, n.y); ctx.lineTo(m.x, m.y);
                        ctx.strokeStyle = `rgba(190, 222, 255, ${0.32 * (1 - d / LINK_DIST)})`;
                        ctx.lineWidth = 1.2;
                        ctx.stroke();
                    }
                }
            }
            raf = requestAnimationFrame(draw);
        }

        hero.addEventListener("pointermove", (e) => {
            const r = hero.getBoundingClientRect();
            pointer.x = e.clientX - r.left; pointer.y = e.clientY - r.top;
        });
        hero.addEventListener("pointerleave", () => { pointer.x = pointer.y = -9999; });

        window.addEventListener("resize", () => { resize(); });

        // Pausar cuando el hero no está visible (ahorro de CPU)
        const io = new IntersectionObserver((entries) => {
            entries.forEach((e) => {
                running = e.isIntersecting;
                if (running && !prefersReduced) { cancelAnimationFrame(raf); draw(); }
                else cancelAnimationFrame(raf);
            });
        }, { threshold: 0 });
        io.observe(hero);

        resize();
        draw();
    }

    /* ---------------------------------------------------------
       5. SPOTLIGHT DEL HERO
    --------------------------------------------------------- */
    function initSpotlight() {
        const hero = document.querySelector(".hero");
        const spot = document.querySelector(".hero__spotlight");
        if (!hero || !spot || isTouch || prefersReduced) return;
        hero.addEventListener("pointermove", (e) => {
            const r = hero.getBoundingClientRect();
            spot.style.setProperty("--mx", `${e.clientX - r.left}px`);
            spot.style.setProperty("--my", `${e.clientY - r.top}px`);
        });
    }

    /* ---------------------------------------------------------
       6. TILT 3D + GLOW
    --------------------------------------------------------- */
    function initTilt() {
        if (isTouch || prefersReduced) return;
        document.querySelectorAll("[data-tilt]").forEach((el) => {
            const glow = el.querySelector(".card__glow");
            const MAX = 8;
            el.addEventListener("pointermove", (e) => {
                const r = el.getBoundingClientRect();
                const px = (e.clientX - r.left) / r.width;
                const py = (e.clientY - r.top) / r.height;
                el.style.transform = `perspective(900px) rotateY(${(px - 0.5) * MAX * 2}deg) rotateX(${(0.5 - py) * MAX * 2}deg) translateY(-6px)`;
                if (glow) { glow.style.setProperty("--gx", `${px * 100}%`); glow.style.setProperty("--gy", `${py * 100}%`); }
            });
            el.addEventListener("pointerleave", () => { el.style.transform = ""; });
        });
    }

    /* ---------------------------------------------------------
       6b. RED DE NODOS POR TARJETA (servicios)
       Al pasar el mouse: se mantiene el glow celeste y se anima una
       mini red de partículas dentro de la tarjeta (rAF solo mientras
       está en hover, para no gastar CPU). Reemplaza al tilt 3D.
    --------------------------------------------------------- */
    function initCards() {
        document.querySelectorAll("[data-nodes]").forEach((card) => {
            const glow = card.querySelector(".card__glow");
            const canvas = card.querySelector(".card__nodes");
            if (!canvas) return;
            const ctx = canvas.getContext("2d", { alpha: true });
            const dpr = Math.min(window.devicePixelRatio || 1, 2);
            const LINK = 92;
            const pointer = { x: -9999, y: -9999 };
            let nodes = [], raf = null, w = 0, h = 0;

            function setup() {
                const r = card.getBoundingClientRect();
                w = r.width; h = r.height;
                canvas.width = w * dpr; canvas.height = h * dpr;
                ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
                const count = Math.min(Math.round((w * h) / 9000), 28);
                nodes = Array.from({ length: count }, () => ({
                    x: Math.random() * w, y: Math.random() * h,
                    vx: (Math.random() - 0.5) * 0.3, vy: (Math.random() - 0.5) * 0.3,
                    r: Math.random() * 1.5 + 1,
                }));
            }
            function draw() {
                ctx.clearRect(0, 0, w, h);
                for (let i = 0; i < nodes.length; i++) {
                    const n = nodes[i];
                    n.x += n.vx; n.y += n.vy;
                    if (n.x < 0 || n.x > w) n.vx *= -1;
                    if (n.y < 0 || n.y > h) n.vy *= -1;
                    const dxp = pointer.x - n.x, dyp = pointer.y - n.y;
                    if (Math.hypot(dxp, dyp) < 120) { n.x += dxp * 0.002; n.y += dyp * 0.002; }
                    ctx.beginPath();
                    ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
                    ctx.fillStyle = "rgba(93, 202, 165, 0.9)";
                    ctx.fill();
                    for (let j = i + 1; j < nodes.length; j++) {
                        const m = nodes[j];
                        const d = Math.hypot(n.x - m.x, n.y - m.y);
                        if (d < LINK) {
                            ctx.beginPath();
                            ctx.moveTo(n.x, n.y); ctx.lineTo(m.x, m.y);
                            ctx.strokeStyle = `rgba(47, 126, 203, ${0.3 * (1 - d / LINK)})`;
                            ctx.lineWidth = 1;
                            ctx.stroke();
                        }
                    }
                }
                raf = requestAnimationFrame(draw);
            }
            function start() { if (prefersReduced) return; setup(); cancelAnimationFrame(raf); draw(); }
            function stop() { cancelAnimationFrame(raf); raf = null; ctx.clearRect(0, 0, w, h); pointer.x = pointer.y = -9999; }

            card.addEventListener("pointerenter", start);
            card.addEventListener("pointerleave", stop);
            card.addEventListener("pointermove", (e) => {
                const r = card.getBoundingClientRect();
                const px = e.clientX - r.left, py = e.clientY - r.top;
                pointer.x = px; pointer.y = py;
                if (glow) {
                    glow.style.setProperty("--gx", `${(px / r.width) * 100}%`);
                    glow.style.setProperty("--gy", `${(py / r.height) * 100}%`);
                }
            });
        });
    }

    /* ---------------------------------------------------------
       7. RIPPLE EN BOTONES
    --------------------------------------------------------- */
    function initRipple() {
        document.querySelectorAll("[data-ripple]").forEach((btn) => {
            btn.addEventListener("pointerdown", (e) => {
                const r = btn.getBoundingClientRect();
                const size = Math.max(r.width, r.height);
                const span = document.createElement("span");
                span.className = "ripple-el";
                span.style.width = span.style.height = `${size}px`;
                span.style.left = `${e.clientX - r.left - size / 2}px`;
                span.style.top = `${e.clientY - r.top - size / 2}px`;
                btn.appendChild(span);
                span.addEventListener("animationend", () => span.remove());
            });
        });
    }

    /* ---------------------------------------------------------
       8. VALIDACIÓN VISUAL DEL FORMULARIO (solo estético)
    --------------------------------------------------------- */
    function initForm() {
        const form = document.getElementById("cotizarForm");
        if (!form) return;
        const note = document.getElementById("formNote");

        const validate = (input) => {
            const group = input.closest(".input-group");
            const ok = input.checkValidity() && input.value.trim() !== "";
            group.classList.toggle("valid", ok);
            group.classList.toggle("invalid", !ok && input.value.trim() !== "");
            return ok;
        };

        form.querySelectorAll("input, textarea").forEach((input) => {
            input.addEventListener("blur", () => validate(input));
            input.addEventListener("input", () => {
                if (input.closest(".input-group").classList.contains("invalid")) validate(input);
            });
        });

        form.addEventListener("submit", (e) => {
            e.preventDefault(); // sin backend: solo feedback visual
            let allOk = true;
            form.querySelectorAll("input, textarea").forEach((i) => { if (!validate(i)) allOk = false; });
            if (allOk) {
                note.textContent = "✓ ¡Gracias! Nos pondremos en contacto pronto.";
                note.style.color = "var(--verde-hover)";
                form.reset();
                form.querySelectorAll(".input-group").forEach((g) => g.classList.remove("valid"));
            } else {
                note.textContent = "Por favor completa los campos requeridos.";
                note.style.color = "#e5484d";
            }
        });
    }

    /* --------------------------------------------------------- */
    function init() {
        onScroll();
        initScrollSpy();
        initReveal();
        initCounters();
        initParticles();
        initSpotlight();
        initTilt();
        initCards();
        initRipple();
        initForm();
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }
})();
