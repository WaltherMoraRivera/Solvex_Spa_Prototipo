# Solvex SpA — Landing Page Premium

Landing page de una sola página (SPA de scroll) para **Solvex SpA**, empresa de soluciones
tecnológicas a medida. El proyecto partió como un sitio universitario estático y fue
transformado en una experiencia visual de nivel profesional/agencia, con estética inspirada
en sitios como Stripe, Linear, Vercel y Framer.

> **Alcance actual:** el foco es **estético y de experiencia**. La funcionalidad real
> (envío del formulario, redes sociales, etc.) queda para iteraciones futuras.

---

## Tabla de contenidos

1. [Stack y filosofía](#stack-y-filosofía)
2. [Estructura de archivos](#estructura-de-archivos)
3. [Cómo ejecutar el proyecto](#cómo-ejecutar-el-proyecto)
4. [Sistema de diseño (design tokens)](#sistema-de-diseño-design-tokens)
5. [Anatomía del sitio (secciones)](#anatomía-del-sitio-secciones)
6. [Capa de interacción y motion (`main.js`)](#capa-de-interacción-y-motion-mainjs)
7. [Rendimiento](#rendimiento)
8. [Accesibilidad](#accesibilidad)
9. [Guía de reproducción en otros proyectos](#guía-de-reproducción-en-otros-proyectos)
10. [Créditos](#créditos)

---

## Stack y filosofía

- **HTML5 + CSS3 + JavaScript vanilla** (sin framework ni paso de build).
- **GSAP + ScrollTrigger** (vía CDN) para animaciones de scroll a 60 FPS.
- **Canvas 2D** para las redes de partículas (hero y tarjetas).
- **Tipografía:** Space Grotesk (display) + Inter (cuerpo), desde Google Fonts.
- **Iconografía:** SVG inline (estilo Lucide), sin dependencias en runtime.

**Principios que guían el diseño:**

- *Design system primero*: todo color, espacio, radio, sombra y easing vive en tokens
  (`:root`). Nada de valores mágicos sueltos.
- *Glassmorphism de 2ª generación*: superficies translúcidas con borde de luz y sombras
  multicapa, no cajas planas.
- *Motion con intención*: cada animación tiene una curva y duración estandarizada; se
  respeta `prefers-reduced-motion`.
- *Mobile-first en la práctica*: composiciones que se rediseñan por breakpoint, no solo
  reflow.

---

## Estructura de archivos

```
Solvex-SPA/
├── index.html          # Estructura y contenido (semántico, ARIA, SEO/OG)
├── styles.css          # Todo el CSS, modular y comentado por secciones
├── main.js             # Capa de interacción y animación (módulos IIFE)
├── README.md           # Esta documentación
│
├── inae.png            # Imagen original de la plataforma INAE (fallback)
├── inae-760.webp       # INAE optimizada 760px (WebP)
├── inae-1140.webp      # INAE optimizada 1140px (WebP)
├── inae.webp           # INAE WebP tamaño completo (respaldo)
│
├── logo.png            # Logo horizontal (usado en meta og:image)
├── isotipo.png         # Isotipo original (con fondo blanco)
├── isotipo-trans.png   # Isotipo con fondo transparente (fallback)
├── isotipo-trans.webp  # Isotipo transparente en WebP (usado en navbar/footer)
└── favicon.png         # Favicon generado desde el isotipo
```

`styles.css` está numerado por secciones para navegación rápida:

```
 1. Design tokens        6. Hero              11. Contacto (formulario)
 2. Reset & base         7. Separadores SVG   12. Footer
 3. Fondo global         7b. Prueba social    13. Animaciones
 4. Utilidades           7c. CTA intermedio   14. Responsive
 5. Navbar               8. Servicios (bento) 15. Accesibilidad
                         9. Caso INAE
                        10. Nosotros
```

---

## Cómo ejecutar el proyecto

Al ser estático, basta un servidor HTTP local (necesario para que el navegador cargue
`main.js` y las fuentes correctamente; abrir el archivo con `file://` no siempre funciona).

**Opción A — Python (incluido en la mayoría de sistemas):**

```bash
cd Solvex-SPA
python -m http.server 8777
# Abrir http://localhost:8777
```

**Opción B — Node (con `serve`):**

```bash
npx serve .
```

**Opción C — Extensión "Live Server" de VS Code:** clic derecho en `index.html` → *Open with Live Server*.

No hay dependencias que instalar: GSAP y las fuentes se cargan por CDN.

---

## Sistema de diseño (design tokens)

Todo se define en `:root` dentro de `styles.css`. Editar un token propaga el cambio a todo el sitio.

### Colores

```css
--azul-profundo: #0C447C;   /* color de marca principal */
--azul-medio:    #1A5EAA;
--verde-turquesa:#5DCAA5;   /* acento de marca */
--violeta:       #7b6cf6;   /* acento terciario (profundidad/foco) */
```

### Gradientes

```css
--grad-brand:      linear-gradient(135deg, #0C447C, #1A5EAA 55%, #2f7ecb);
--grad-accent:     linear-gradient(120deg, #5DCAA5, #7fe0c4);
--grad-text-light: linear-gradient(120deg, #a9deff, #7fe0c4); /* texto sobre azul */
```

### Escala de espaciado (sistema 4/8pt)

```css
--sp-1:.25rem  --sp-2:.5rem  --sp-3:.75rem  --sp-4:1rem
--sp-6:1.5rem  --sp-8:2rem   --sp-12:3rem   --sp-16:4rem  --sp-24:6rem
```

### Escala tipográfica modular (ratio 1.25, fluida con `clamp()`)

```css
--fs-body:    clamp(1rem, 0.96rem + 0.2vw, 1.08rem);
--fs-lead:    clamp(1.08rem, 1rem + 0.4vw, 1.25rem);
--fs-h2:      clamp(2rem, 1.4rem + 2.6vw, 3.1rem);
--fs-display: clamp(2.6rem, 1.4rem + 5.4vw, 5rem);
--measure:    65ch;  /* medida de línea óptima para lectura */
```

### Sombras multicapa

En vez de una sombra plana, cada nivel apila 2-3 capas con blur y opacidad crecientes
para simular profundidad realista:

```css
--shadow-md:
    0 2px 4px  rgba(12,68,124,.05),
    0 8px 16px rgba(12,68,124,.07),
    0 16px 32px rgba(12,68,124,.07);
```

### Easings y duraciones

```css
--ease:        cubic-bezier(0.22, 1, 0.36, 1);      /* salida suave (por defecto) */
--ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);   /* rebote sutil */
--dur-1:.2s   --dur-2:.4s   --dur-3:.6s
```

---

## Anatomía del sitio (secciones)

### Fondo global
Capa fija (`.bg-layer`) con tres **blobs** de color desenfocados en movimiento lento
(`@keyframes float`) más una textura de **noise** SVG muy sutil. Nunca un fondo blanco plano.

### Navbar inteligente
- Glassmorphism con `backdrop-filter: blur()` al hacer scroll (`.scrolled`).
- **Hide-on-scroll-down / show-on-scroll-up** (`.hidden`).
- Sobre el hero azul el texto es blanco; al hacer scroll cambia a oscuro (contraste).
- **Scroll-spy**: resalta el enlace de la sección visible (`aria-current`).
- Menú móvil deslizante con **focus trap** y cierre con `Escape`.

### Hero
- Título gigante con escala `--fs-display` y una línea con gradiente de texto.
- **Red de partículas en canvas** (nodos conectados que evocan el átomo del logo).
- **Spotlight** que sigue el mouse (`--mx`/`--my` + `radial-gradient`).
- Stats con **contador animado** desde 0.
- Entrada animada con GSAP (stagger).
- Espaciados compactos para que las **estadísticas sean visibles en la primera
  vista** (above the fold), sin necesidad de hacer scroll.

### Prueba social
Banda (`.trust`) con señales de confianza reales — sin inventar clientes.

### Servicios — Bento grid
Grid **asimétrico**: una tarjeta insignia alta (2×2) + tarjetas de apoyo + una ancha.
Rompe la monotonía de "4 tarjetas iguales". Cada tarjeta:
- Glassmorphism con **borde de luz superior** (truco de `mask` en `::before`).
- **Glow celeste** que sigue el mouse.
- **Mini red de partículas** animada solo en hover.
- Al hover se **eleva y expande** ligeramente (`translateY` + `scale`), sin
  inclinación 3D.

### Caso de éxito INAE
Composición a 2 columnas con la captura real de la plataforma dentro de un marco glass
con tilt 3D. Imagen servida en WebP responsive con `<picture>`.

### Nosotros
Panel azul redondeado con tarjetas de valores. Al pasar el mouse sobre el panel
se activan la **red de nodos** (variante clara para contrastar sobre el azul) y el
**destacado celeste** que sigue al cursor, igual que en el hero y las tarjetas.

### CTA intermedio
Banda de conversión (`.cta-band`) con gradiente y glow, antes del formulario.

### Contacto
Formulario con **labels flotantes**, línea de foco animada y **validación visual**
(sin backend: solo feedback estético).

### Footer
Multi-columna, con isotipo, enlaces, contacto e iconos sociales (SVG).

---

## Capa de interacción y motion (`main.js`)

Todo el JS vive en una **IIFE** (`(function(){ ... })()`) para no contaminar el scope global,
organizado en módulos independientes. Detección de capacidades al inicio:

```js
const prefersReduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
const hasGSAP        = typeof window.gsap !== "undefined";
const isTouch        = matchMedia("(hover: none)").matches;
```

| Módulo | Qué hace |
|--------|----------|
| **Navbar inteligente** | scroll blur + hide/show + barra de progreso |
| **Scroll-spy** | `IntersectionObserver` marca la sección activa (`aria-current`) |
| **Reveal (GSAP)** | fade-up de secciones al entrar en viewport, con stagger en cards |
| **Contadores** | count-up desde 0 al entrar en viewport |
| **Partículas hero** | red de nodos en canvas, pausada fuera de viewport |
| **Nodos por tarjeta/panel** | mini red de partículas activa solo en hover (servicios y panel Nosotros); variante `data-nodes="dark"` para fondos azules |
| **Spotlight** | luz que sigue el mouse en el hero |
| **Tilt 3D** | inclinación de la imagen INAE según el mouse |
| **Ripple** | onda al hacer clic en botones |
| **Formulario** | validación visual sin envío real |

**Degradación elegante:** si GSAP no carga, se aplica la clase `.no-gsap` y los elementos
se muestran con transiciones CSS simples. Si `prefers-reduced-motion` está activo, los
canvas no se animan y los reveals se desactivan.

---

## Rendimiento

- **Imágenes WebP responsive**: la captura INAE pasó de **1.06 MB (PNG) → 20-33 KB (WebP)**,
  ~97% menos, servida con `<picture>` + `srcset` y fallback PNG.
- **Sin layout shift (CLS)**: las imágenes declaran `width`/`height` + `aspect-ratio`.
- **Canvas optimizados**: `devicePixelRatio` limitado a 2, densidad de partículas según
  área (con techo), y `requestAnimationFrame` que se **pausa** cuando el elemento no está
  visible o el puntero no está encima.
- **Fuentes**: `preconnect` a Google Fonts + `display=swap`.
- **Scripts**: GSAP y `main.js` con `defer`.

---

## Accesibilidad

- **Skip-link** al contenido (visible solo al enfocar con teclado).
- **`:focus-visible`** con outline turquesa en todos los interactivos.
- **Menú móvil**: `aria-expanded`, focus trap, cierre con `Escape` y retorno de foco.
- **`aria-current`** en el enlace activo del navbar.
- **`prefers-reduced-motion`**: desactiva blobs, canvas y reveals.
- **Contraste** revisado (p. ej. el gradiente del hero se aclaró para legibilidad sobre azul).
- HTML **semántico** (`header`, `main`, `section`, `footer`) y `alt` en imágenes.

---

## Guía de reproducción en otros proyectos

Recetas autocontenidas para llevar estas técnicas a cualquier sitio estático.

### 1. Arrancar con un sistema de tokens

Antes de escribir componentes, define en `:root` tu paleta, escala de espaciado 4/8pt,
escala tipográfica con `clamp()`, radios, sombras y easings. Regla de oro: **ningún valor
mágico** en los componentes; siempre `var(--token)`.

### 2. Tipografía fluida sin media queries

```css
--fs-display: clamp(2.6rem, 1.4rem + 5.4vw, 5rem);
```
`clamp(mínimo, preferido, máximo)` escala el texto con el viewport entre dos límites.
Añade `text-wrap: balance` en títulos y `text-wrap: pretty` en párrafos.

### 3. Fondo con blobs + noise

```html
<div class="bg-layer"><div class="blob"></div><div class="noise"></div></div>
```
```css
.blob { filter: blur(70px); animation: float 22s ease-in-out infinite; }
.noise { opacity:.035; background-image:url("data:image/svg+xml,...feTurbulence..."); }
```
El noise es un SVG `feTurbulence` embebido como data-URI (cero peticiones).

### 4. Navbar inteligente (hide-on-scroll)

```js
window.addEventListener("scroll", () => {
  const y = scrollY;
  navbar.classList.toggle("scrolled", y > 30);
  navbar.classList.toggle("hidden", y > lastScroll && y > 300);
  lastScroll = y;
}, { passive: true });
```
```css
.navbar { transition: transform .4s; }
.navbar.hidden { transform: translateY(-120%); }
.navbar.scrolled { backdrop-filter: blur(16px); background: rgba(255,255,255,.7); }
```

### 5. Scroll-spy con IntersectionObserver

```js
const io = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      document.querySelectorAll('[aria-current]').forEach(a => a.removeAttribute('aria-current'));
      linkFor(e.target.id).setAttribute('aria-current', 'true');
    }
  });
}, { rootMargin: "-45% 0px -50% 0px" });   // "línea" activa a mitad de pantalla
sections.forEach(s => io.observe(s));
```

### 6. Reveal al hacer scroll (GSAP + ScrollTrigger)

```js
gsap.registerPlugin(ScrollTrigger);
gsap.utils.toArray("[data-animate]").forEach(el =>
  gsap.fromTo(el, { opacity:0, y:40 },
    { opacity:1, y:0, duration:.8, ease:"power3.out",
      scrollTrigger:{ trigger:el, start:"top 85%" } })
);
```
Para stagger en grupos usa `ScrollTrigger.batch(selector, { onEnter })`.

### 7. Red de partículas en canvas (patrón reutilizable)

Ideas clave para que rinda: limitar `devicePixelRatio` a 2, calcular el nº de nodos a
partir del área con un techo, y **pausar el `requestAnimationFrame`** cuando no se ve
(IntersectionObserver) o —para las tarjetas— solo animar en `pointerenter`/`pointerleave`.

```js
const dpr = Math.min(devicePixelRatio || 1, 2);
canvas.width = w * dpr; canvas.height = h * dpr;
ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
// dibujar nodos; conectar con línea si distancia < LINK
```

### 8. Glow / spotlight que sigue el mouse

```js
el.addEventListener("pointermove", e => {
  const r = el.getBoundingClientRect();
  el.style.setProperty("--mx", `${e.clientX - r.left}px`);
  el.style.setProperty("--my", `${e.clientY - r.top}px`);
});
```
```css
.spot { background: radial-gradient(600px circle at var(--mx) var(--my),
        rgba(93,202,165,.18), transparent 55%); }
```

### 9. Borde de luz en tarjetas glass

```css
.card::before {
  content:""; position:absolute; inset:0; border-radius:inherit; padding:1px;
  background: linear-gradient(180deg, rgba(255,255,255,.9), transparent 40%);
  -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
  -webkit-mask-composite: xor; mask-composite: exclude;
}
```
El truco de `mask-composite` deja solo el contorno del gradiente = borde de luz.

### 10. Bento grid asimétrico

```css
.bento { display:grid; grid-template-columns:repeat(3,1fr); gap:1.5rem; }
.card--feature { grid-column:1; grid-row:span 2; }  /* alta */
.card--wide    { grid-column:2 / 4; }               /* ancha */
@media (max-width:860px){ .bento{ grid-template-columns:repeat(2,1fr) } }
@media (max-width:560px){ .bento{ grid-template-columns:1fr } }
```

### 11. Imágenes WebP responsive (gran ahorro)

Genera variantes (con Python + Pillow, ImageMagick o Squoosh):

```python
from PIL import Image
src = Image.open("foto.png").convert("RGBA")
for w in (760, 1140):
    r = src.copy(); r.thumbnail((w, 10000))
    r.save(f"foto-{w}.webp", "WEBP", quality=82, method=6)
```
```html
<picture>
  <source type="image/webp" srcset="foto-760.webp 760w, foto-1140.webp 1140w"
          sizes="(max-width:768px) 90vw, 560px">
  <img src="foto.png" width="1842" height="881" loading="lazy" decoding="async" alt="...">
</picture>
```
```css
img { width:100%; height:auto; aspect-ratio: 1842 / 881; }  /* evita distorsión y CLS */
```

> **Ojo:** si declaras `width`/`height` en el `<img>`, define también `height:auto` en CSS,
> o el atributo de alto se aplicará como píxeles fijos y deformará la imagen.

### 12. Labels flotantes en formularios (solo CSS)

```html
<div class="input-group">
  <input id="nombre" placeholder=" " required>
  <label for="nombre">Nombre</label>
</div>
```
```css
input:focus + label,
input:not(:placeholder-shown) + label { transform: translateY(-1.15rem); font-size:.75rem; }
```
El `placeholder=" "` (un espacio) es el truco que activa `:not(:placeholder-shown)`.

### 13. Gotcha: GSAP deja `transform` inline y anula el `:hover` de CSS

Si animas un elemento con GSAP (`gsap.to/fromTo` con `x`/`y`/`scale`) y luego
quieres que su `:hover` de CSS aplique un `transform`, **no funcionará**: GSAP deja
un `transform` **inline** al terminar, que por especificidad gana al CSS. Además,
evita animar el mismo elemento dos veces (deja dos transforms inline). Soluciones:

```js
// al terminar la animación de entrada, limpia el transform inline:
gsap.fromTo(cards, { opacity:0, y:50 },
  { opacity:1, y:0, duration:.7, stagger:.12, clearProps:"transform" });
```
Así el `:hover { transform: translateY(-6px) scale(1.04) }` vuelve a tener efecto.

### 14. Respetar siempre `prefers-reduced-motion`

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { animation-duration:.001ms !important; transition-duration:.001ms !important; }
}
```
Y en JS: comprobar la media query antes de iniciar canvas/animaciones.

---

## Créditos

- **Marca y contenido:** Solvex SpA (proyecto).
- **Tipografías:** [Space Grotesk](https://fonts.google.com/specimen/Space+Grotesk) e
  [Inter](https://fonts.google.com/specimen/Inter) (Google Fonts, SIL Open Font License).
- **Animación:** [GSAP](https://gsap.com/) + ScrollTrigger.
- **Iconos:** SVG inline estilo [Lucide](https://lucide.dev/).

---

*Documentación del rediseño premium — sitio estático, sin paso de build, listo para
desplegar en cualquier hosting estático (GitHub Pages, Netlify, Vercel, etc.).*
