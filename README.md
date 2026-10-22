# Simulador de Grúa Horquilla

Simulador 3D en el navegador para practicar la licencia **clase D (grúa horquilla)** con volante y pedales (o teclado).
Lo más importante que entrena: **la dirección va en las ruedas traseras**, así que la cola barre hacia afuera en cada curva.

## Cómo abrirlo

- **En línea:** https://rorritsss.github.io/simulador-horquilla/
- **Sin internet en tu PC:** descarga `index.html` y ábrelo con doble clic en Chrome o Edge (la primera vez necesita internet para bajar Three.js).

## Volante (Suzuka u otro)

1. Conecta el volante **antes** de abrir la página y presiona cualquier botón (el navegador recién ahí lo detecta).
2. Abre **⚙ Volante** → en cada acción pulsa **Asignar** y mueve ese control:
   dirección (gira a fondo a la derecha y mantén), acelerador y freno (písalos a fondo), cambios, subir/bajar horquillas, inclinar mástil.
3. La configuración queda guardada en el navegador.

## Teclado

| Tecla | Acción |
|---|---|
| W / S | Acelerar / frenar |
| A / D | Dirección |
| E / Q | Marcha adelante / atrás (secuencial F‑N‑R, sólo detenido) |
| R / F | Subir / bajar horquillas |
| T / G | Inclinar mástil atrás / adelante |
| C | Cámara (cabina → tercera persona → planta) |
| Retroceso | Reiniciar ejercicio |

## Ejercicios

- **Circuito de conos:** zigzag hacia adelante, cruzas la línea blanca y vuelves en **reversa** al cuadro de partida.
- **Pallet a rack:** tomas un pallet del suelo, lo dejas en el nivel de 1,5 m y retrocedes con las horquillas abajo.
- **Libre:** pallets sueltos y rack de 2 niveles.

Penalizaciones: choque +5 s · cono botado +5 s · cono por el lado equivocado +10 s ·
andar con horquillas sobre 0,4 m a más de ~2 km/h +5 s · volver hacia adelante en el circuito +5 s.

Para enganchar un pallet: horquillas **abajo** (≤ 7 cm), **alineadas** y **metidas hasta el fondo**; recién ahí subes.

> Es una ayuda para practicar. No reemplaza las horas reales en máquina ni el curso de operador.

## Prueba automática

`node test.mjs` abre el simulador en Edge headless y completa el ejercicio "Pallet a rack" con el teclado.
