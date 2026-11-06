// Comparação visual: site atual (referência, enquanto existir) × front novo, página por página, desktop e celular.
// Gera relatorio-visual/<site>/index.html com os screenshots lado a lado e o % de pixels diferentes.
//
// Variáveis: SITES=notredame · LIMITE_PAGINAS=0 · CAMINHOS=/,/noticias · FRONT_URL=http://front:3000
// O front escolhe o site pelo domínio: mandamos X-Forwarded-Host: <site>.localhost
import fs from 'node:fs'
import path from 'node:path'

import pixelmatch from 'pixelmatch'
import { chromium, devices } from 'playwright'
import { PNG } from 'pngjs'

const env = process.env
const ORIGEM = (env.LIFERAY_URL || 'https://portal-adm-dxp-prd.hapvidalabs.net').replace(/\/+$/, '')
const FRONT = (env.FRONT_URL || 'http://front:3000').replace(/\/+$/, '')
const FILTRO = (env.SITES || '').split(',').filter(Boolean)
const LIMITE = Number(env.LIMITE_PAGINAS || 0)
const CAMINHOS = (env.CAMINHOS || '').split(',').filter(Boolean)
const SAIDA = 'relatorio-visual'

const PERFIS = [
  { nome: 'desktop', opcoes: { viewport: { width: 1440, height: 900 } } },
  { nome: 'celular', opcoes: { ...devices['iPhone 13'] } },
]

// Congela o que muda sozinho (animações, carrosséis, cursor) para comparar só o layout
// e esconde o banner de cookies (OneTrust só aparece nos domínios autorizados)
const CONGELAR = `*,*::before,*::after{animation:none!important;transition:none!important;caret-color:transparent!important} #onetrust-consent-sdk{display:none!important}`

import { readFileSync } from 'node:fs'
const paginas = FILTRO.flatMap((site) =>
  JSON.parse(readFileSync(`dados/${site}/paginas.json`, 'utf8'))
    .map((p) => ({ site, caminho: p.caminho }))
    .filter((p) => !CAMINHOS.length || CAMINHOS.includes(p.caminho)),
)
const alvo = LIMITE ? paginas.slice(0, LIMITE) : paginas

const browser = await chromium.launch()
// Um screenshot (null se a página falhar: a comparação continua)
const tirar = async (url, perfil, cabecalhos = {}) => {
  try {
    return await tirarUm(url, perfil, cabecalhos)
  } catch (e) {
    console.log(`   falhou ${url}: ${e.message.split('\n')[0].slice(0, 120)}`)
    return null
  }
}
const tirarUm = async (url, perfil, cabecalhos = {}) => {
  const ctx = await browser.newContext({ ...perfil.opcoes, ignoreHTTPSErrors: true })
  // O cabeçalho que escolhe o site vai só para o front (terceiros recusariam por CORS)
  if (Object.keys(cabecalhos).length) await ctx.route(`${FRONT}/**`, (r) => r.continue({ headers: { ...r.request().headers(), ...cabecalhos } }))
  const page = await ctx.newPage()
  // Relógio controlado: carrosséis e animações por timer ficam no mesmo ponto nos dois lados
  await page.clock.install({ time: new Date('2026-11-06T12:00:00-03:00') })
  await page.goto(url, { waitUntil: 'networkidle', timeout: 90000 }).catch(() => {})
  await page.clock.runFor(4000).catch(() => {})
  await page.addStyleTag({ content: CONGELAR }).catch(() => {})
  // Rola a página (carrega imagens "lazy") avançando o relógio controlado a cada passo
  const altura = await page.evaluate(() => document.body.scrollHeight).catch(() => 0)
  for (let y = 0; y < Math.min(altura, 20000); y += 700) {
    await page.evaluate((v) => window.scrollTo(0, v), y).catch(() => {})
    await page.clock.runFor(100).catch(() => {})
  }
  await page.evaluate(() => window.scrollTo(0, 0)).catch(() => {})
  await page.waitForTimeout(2500)
  const png = await page.screenshot({ fullPage: true }).catch(() => null)
  await ctx.close().catch(() => {})
  return png ? PNG.sync.read(png) : null
}

// Compara em altura comum (páginas podem ter alturas diferentes por conteúdo dinâmico)
const comparar = (a, b) => {
  const w = Math.min(a.width, b.width)
  const h = Math.min(a.height, b.height, 12000)
  const recorte = (img) => {
    const out = new PNG({ width: w, height: h })
    PNG.bitblt(img, out, 0, 0, w, h, 0, 0)
    return out
  }
  const ra = recorte(a)
  const rb = recorte(b)
  const diff = new PNG({ width: w, height: h })
  const n = pixelmatch(ra.data, rb.data, diff.data, w, h, { threshold: 0.1 })
  return { pct: (100 * n) / (w * h), diff, ra, rb, alturaOriginal: a.height, alturaEspelho: b.height }
}

const linhas = []
const CONCORRENCIA = Number(env.CONCORRENCIA || 4)
const fila = [...alvo]
await Promise.all(Array.from({ length: CONCORRENCIA }, async () => { while (fila.length) { const p = fila.shift()
  for (const perfil of PERFIS) {
    const orig = await tirar(`${ORIGEM}/web/${p.site}${p.caminho === '/' ? '' : p.caminho}`, perfil)
    const esp = await tirar(FRONT + p.caminho, perfil, { 'X-Forwarded-Host': `${p.site}.localhost` })
    if (!orig || !esp) {
      linhas.push({ ...p, perfil: perfil.nome, pct: null })
      continue
    }
    const r = comparar(orig, esp)
    const dir = path.join(SAIDA, p.site)
    fs.mkdirSync(dir, { recursive: true })
    const nome = `${p.caminho.replace(/[^\w]+/g, '_').slice(-80)}_${perfil.nome}`
    fs.writeFileSync(path.join(dir, `${nome}_original.png`), PNG.sync.write(r.ra))
    fs.writeFileSync(path.join(dir, `${nome}_novo.png`), PNG.sync.write(r.rb))
    fs.writeFileSync(path.join(dir, `${nome}_diff.png`), PNG.sync.write(r.diff))
    linhas.push({ ...p, perfil: perfil.nome, pct: r.pct, nome, alturas: `${r.alturaOriginal}/${r.alturaEspelho}` })
    console.log(`${r.pct.toFixed(2).padStart(6)}%  ${perfil.nome.padEnd(7)} ${p.site} ${p.caminho}`)
  }
} }))
await browser.close()

// Relatório HTML por site
for (const site of [...new Set(linhas.map((l) => l.site))]) {
  const ls = linhas.filter((l) => l.site === site).sort((a, b) => (b.pct ?? 999) - (a.pct ?? 999))
  const html = `<!doctype html><meta charset="utf-8"><title>Comparação visual · ${site}</title>
<style>body{font-family:system-ui;margin:24px}table{border-collapse:collapse;width:100%}td,th{border-bottom:1px solid #ddd;padding:8px;text-align:left;vertical-align:top}
img{width:300px;border:1px solid #ccc}.ok{color:#1d6b32}.alerta{color:#9a5b00}.ruim{color:#b00020}</style>
<h1>Site atual × front novo · ${site}</h1><p>% de pixels diferentes (animações congeladas). Ordenado do maior para o menor.</p>
<table><tr><th>Página</th><th>Perfil</th><th>Diferença</th><th>Alturas (atual/novo)</th><th>Original</th><th>Front novo</th><th>Diferenças</th></tr>
${ls.map((l) => `<tr><td>${l.caminho}</td><td>${l.perfil}</td><td class="${l.pct == null ? 'ruim' : l.pct < 0.5 ? 'ok' : l.pct < 3 ? 'alerta' : 'ruim'}">${l.pct == null ? 'falhou' : `${l.pct.toFixed(2)}%`}</td><td>${l.alturas || ''}</td>
${l.nome ? ['original', 'novo', 'diff'].map((t) => `<td><a href="${l.nome}_${t}.png"><img loading="lazy" src="${l.nome}_${t}.png"></a></td>`).join('') : '<td></td><td></td><td></td>'}</tr>`).join('\n')}
</table>`
  fs.writeFileSync(path.join(SAIDA, site, 'index.html'), html)
}
const comPct = linhas.filter((l) => l.pct != null)
console.log(`\n${comPct.length} comparações · média ${(comPct.reduce((s, l) => s + l.pct, 0) / (comPct.length || 1)).toFixed(2)}% · abaixo de 0,5%: ${comPct.filter((l) => l.pct < 0.5).length}`)
