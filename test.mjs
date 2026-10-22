// Prueba de humo: abre el simulador en Edge headless y hace el ejercicio "Pallet a rack" por teclado.
// Uso: node test.mjs   (necesita microsoft-edge o google-chrome en el PATH)
import { spawn } from 'node:child_process';
import { pathToFileURL } from 'node:url';
const bin = process.env.BROWSER || 'microsoft-edge';
const br = spawn(bin, ['--headless=new', '--remote-debugging-port=9333', '--use-angle=swiftshader', '--enable-unsafe-swiftshader',
  '--window-size=800,450', '--user-data-dir=/tmp/sim-test-profile', 'about:blank'], { stdio: 'ignore' });
const sleep = ms => new Promise(r => setTimeout(r, ms));
const SLOW = 6;   // en headless el render es por software y la simulación corre más lenta que el reloj
let tab;
for (let i = 0; i < 50 && !tab; i++) { await sleep(200); try { tab = (await (await fetch('http://127.0.0.1:9333/json')).json()).find(t => t.type === 'page'); } catch {} }
const ws = new WebSocket(tab.webSocketDebuggerUrl); await new Promise(r => ws.onopen = r);
let id = 0; const pend = {}, errors = [];
ws.onmessage = e => { const m = JSON.parse(e.data); if (m.id) pend[m.id]?.(m.result);
  if (m.method === 'Runtime.exceptionThrown') errors.push(m.params.exceptionDetails.exception?.description);
  if (m.method === 'Runtime.consoleAPICalled' && m.params.type === 'error') errors.push(m.params.args.map(a => a.value).join(' ')); };
const cmd = (method, params = {}) => new Promise(r => { pend[++id] = r; ws.send(JSON.stringify({ id, method, params })); });
const ev = async expr => (await cmd('Runtime.evaluate', { expression: expr, awaitPromise: true, returnByValue: true })).result.value;
const key = (code, type) => ev(`dispatchEvent(new KeyboardEvent('${type}', { code: '${code}' }))`);
const hold = async (code, until, max = 15000 * SLOW) => { await key(code, 'keydown'); const t0 = Date.now();
  while (!(await ev(until)) && Date.now() - t0 < max) await sleep(30); await key(code, 'keyup'); };
const tap = async code => { await key(code, 'keydown'); await sleep(60); await key(code, 'keyup'); await sleep(100 * SLOW); };

await cmd('Runtime.enable');
await cmd('Page.navigate', { url: pathToFileURL(new URL('./index.html', import.meta.url).pathname).href });
for (let i = 0; i < 100 && !(await ev('!!window.__sim')); i++) await sleep(100);
const ok = (c, msg) => { console.log((c ? '✔ ' : '✘ ') + msg); if (!c) process.exitCode = 1; };
ok(await ev('!!window.__sim'), 'carga la página y arranca la simulación');

// acelera hasta vmax (W) mientras no se cumpla la condición; luego frena hasta detenerse
const drive = async (until, vmax, max = 20000 * SLOW) => { const t0 = Date.now(); let down = false;
  while (!(await ev(until)) && Date.now() - t0 < max) {
    const want = Math.abs(await ev('__sim.S.v')) < vmax;
    if (want !== down) { await key('KeyW', want ? 'keydown' : 'keyup'); down = want; }
    await sleep(20);
  }
  if (down) await key('KeyW', 'keyup');
  await hold('Space', 'Math.abs(__sim.S.v) < 0.01', 4000 * SLOW); };

await ev(`__sim.reset('rack')`);
await hold('KeyF', '__sim.S.forkH <= 0.02');                        // bajar horquillas
await tap('KeyE');                                                  // marcha adelante
await drive('__sim.S.z >= 4.6', 0.8);                               // meter uñas al pallet
await hold('KeyR', '!!__sim.S.carry || __sim.S.forkH > 0.3', 3000 * SLOW);
ok(await ev('!!__sim.S.carry'), 'engancha el pallet con las uñas bien metidas');
await hold('KeyR', '__sim.S.forkH >= 0.25');                        // viajar con la carga abajo
await drive('__sim.S.z >= 12.5', 1.5);
await hold('KeyR', '__sim.S.forkH >= 1.62');                        // subir sobre el nivel 1, detenido
ok(await ev('__sim.G.pen === 0'), 'sin penalizaciones hasta aquí (pen=' + await ev('__sim.G.pen') + ')');
await drive('__sim.S.z >= 14.65', 0.3);                             // entrar lento al rack
await hold('KeyF', '!__sim.S.carry', 3000 * SLOW);
ok(await ev('!__sim.S.carry && __sim.pallets[0].base === 1.5'), 'deja el pallet en el rack a 1,5 m (z=' + (await ev('__sim.S.z')).toFixed(2) + ')');
await tap('KeyQ'); await tap('KeyQ');                               // reversa
await drive('__sim.S.z < 12', 0.5);
await hold('KeyF', '__sim.S.forkH < 0.25', 6000 * SLOW);
await sleep(200);
ok(await ev(`__sim.G.phase === 'fin'`), 'termina el ejercicio (fase=' + await ev('__sim.G.phase') + ', t=' + (await ev('__sim.G.t')).toFixed(1) + ' s, pen=' + await ev('__sim.G.pen') + ')');

await ev(`__sim.reset('conos')`); await ev(`__sim.G.cam = 1`); await sleep(500);
const shot = await cmd('Page.captureScreenshot', { format: 'png' });
(await import('node:fs')).writeFileSync(process.argv[2] || '/tmp/sim-shot.png', Buffer.from(shot.data, 'base64'));
ok(errors.length === 0, 'sin errores en consola' + (errors.length ? ': ' + errors.join(' | ') : ''));
ws.close(); br.kill();
