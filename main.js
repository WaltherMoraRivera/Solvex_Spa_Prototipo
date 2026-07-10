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
    }
    window.addEventListener("scroll", onScroll, { passive: true });

    // Menú móvil
    if (navToggle) {
        navToggle.addEventListener("click", () => {
            const open = navLinks.classList.toggle("open");
            navToggle.setAttribute("aria-expanded", String(open));
            navToggle.setAttribute("aria-label", open ? "Cerrar menú" : "Abrir menú");
        });
        navLinks.querySelectorAll("a").forEach((a) =>
            a.addEventListener("click", () => {
                navLinks.classList.remove("open");
                navToggle.setAttribute("aria-expanded", "false");
            })
        );
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
        initReveal();
        initCounters();
        initSpotlight();
        initTilt();
        initRipple();
        initForm();
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }
})();
