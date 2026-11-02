# naciceleste.dev

Página principal (**vitrina**) de naciceleste.dev — el rincón de @naciceleste (Ⱥrmin).

HTML/CSS/JS estático servido por GitHub Pages. Al bajar, un avioncito de papel recorre
un camino punteado celeste mientras aparecen las tarjetas de cada proyecto y el fondo
va pasando de celeste → rosa → lila. Usa GSAP + ScrollTrigger desde CDN.

## Archivos
- `index.html` — estructura (intro + recorrido + pie).
- `styles.css` — estilos (día/noche), mismo sistema visual que la Biblioteca.
- `vitrina.js` — arma las tarjetas, dibuja el camino y mueve el avioncito.
- `assets/` — avatar y favicons.

## Sumar un proyecto
Agregá un objeto al array `PROYECTOS` al inicio de `vitrina.js`. Para que también se vea
sin JavaScript, replicá la tarjeta dentro del `<noscript>` de `index.html`.

## Detalles
- Responsive (el camino corre por un riel a la izquierda en móvil).
- Respeta `prefers-reduced-motion` (tarjetas visibles y quietas, sin recorrido animado).
- Sin JS, las tarjetas se ven igual (fallback en `<noscript>`).
- Modo oscuro opcional (botón ☀️/🌙, se recuerda la elección).

`CNAME` apunta a `naciceleste.dev` — no tocar.
