import express from 'express'
import session from 'express-session'
import path from 'node:path'
import fs from 'node:fs'
import { fileURLToPath } from 'node:url'
import crypto from 'node:crypto'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')
const isDev = process.argv.includes('--dev')
const PORT = process.env.PORT || 3000

const app = express()
app.disable('x-powered-by')

app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(
  session({
    secret: 'sede-carm-verificacion-documentos',
    resave: false,
    saveUninitialized: true,
    cookie: { httpOnly: true, sameSite: 'lax' }
  })
)

app.use(
  '/eAConsultaWeb/resources',
  express.static(path.join(root, 'public'), { index: false })
)

/* ------------------------------------------------------------------ */
/*  CAPTCHA                                                            */
/* ------------------------------------------------------------------ */

const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
const CAPTCHA_FONT =
  "'Segoe Script','Bradley Hand','Brush Script MT','Comic Sans MS',cursive"

function randomCode(len = 6) {
  const bytes = crypto.randomBytes(len)
  let out = ''
  for (let i = 0; i < len; i++) out += ALPHABET[bytes[i] % ALPHABET.length]
  return out
}

function captchaSvg(code) {
  const w = 200
  const h = 50
  const letters = [...code]
    .map((ch, i) => {
      const x = 22 + i * 30 + (Math.random() * 6 - 3)
      const y = 34 + (Math.random() * 6 - 3)
      const rot = Math.random() * 26 - 13
      const size = 22 + Math.random() * 6
      return `<text x="${x.toFixed(1)}" y="${y.toFixed(1)}" transform="rotate(${rot.toFixed(
        1
      )} ${x.toFixed(1)} ${y.toFixed(1)})" font-family="${CAPTCHA_FONT}" font-size="${size.toFixed(
        1
      )}" fill="#B00041">${ch}</text>`
    })
    .join('')

  let noise = ''
  for (let i = 0; i < 5; i++) {
    const y1 = Math.random() * h
    const y2 = Math.random() * h
    const y3 = Math.random() * h
    noise += `<path d="M-5 ${y1.toFixed(1)} Q 50 ${y2.toFixed(1)} 100 ${(y1 + 10).toFixed(
      1
    )} T 205 ${y3.toFixed(1)}" fill="none" stroke="#B00041" stroke-width="0.6" opacity="0.55"/>`
  }
  for (let i = 0; i < 220; i++) {
    noise += `<circle cx="${(Math.random() * w).toFixed(1)}" cy="${(
      Math.random() * h
    ).toFixed(1)}" r="0.5" fill="#9c9c9c" opacity="${(Math.random() * 0.5 + 0.2).toFixed(2)}"/>`
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img" aria-label="Imagen de seguridad">
<rect width="${w}" height="${h}" fill="#EDEDED"/>
${noise}
${letters}
</svg>`
}

app.get('/eAConsultaWeb/jcaptcha', (req, res) => {
  const code = randomCode()
  req.session.captcha = code
  res.setHeader('Content-Type', 'image/svg+xml; charset=utf-8')
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate')
  res.send(captchaSvg(code))
})

app.post('/eAConsultaWeb/consulta/procesarCaptcha.do', (req, res) => {
  const valor = String(req.body.caracteres ?? req.body['{actionForm.caracteres}'] ?? '')
    .trim()
    .toUpperCase()

  if (!valor) return res.json({ ok: false, error: 'Debe introducir los caracteres.' })
  if (!req.session.captcha) {
    return res.json({ ok: false, error: 'La imagen ha caducado. Vuelva a intentarlo.' })
  }
  if (valor !== req.session.captcha) {
    req.session.captcha = null
    return res.json({ ok: false, error: 'Los caracteres no coinciden con la imagen.' })
  }

  req.session.captcha = null
  req.session.verificado = true
  req.session.save(() => res.json({ ok: true }))
})

/* ------------------------------------------------------------------ */
/*  VERIFICACIÓN                                                       */
/* ------------------------------------------------------------------ */

const TIPOS = {
  csv: /^[A-Za-z0-9-]{6,60}$/,
  documento: /^[A-Za-z0-9-]{4,60}$/,
  guid: /^[A-Za-z0-9-]{8,60}$/,
  qr: /^[A-Za-z0-9-]{4,80}$/,
  registro: /^[0-9]{1,20}$/
}

export const TRAMITES = {
  'Copia autenticada de documento de Portafirmas': { icono: 'doc' },
  'Acuse de recibo de registro': { icono: 'doc' },
  'Justificante de presentación electrónica': { icono: 'doc' }
}

function normalizaCsv(raw) {
  const v = raw.trim().toUpperCase()
  if (/^CARM-/.test(v)) return v
  const limpio = v.replace(/[^A-Z0-9]/g, '')
  const g = [
    limpio.slice(0, 8),
    limpio.slice(8, 12),
    limpio.slice(12, 16),
    limpio.slice(16, 20),
    limpio.slice(20, 32)
  ].filter(Boolean)
  return `CARM-${g.join('-')}`
}

app.post('/api/verificar', (req, res) => {
  const { tipo = 'csv', valor = '' } = req.body || {}
  const rx = TIPOS[tipo]
  const limpio = String(valor).trim()

  if (!rx) return res.status(400).json({ ok: false, error: 'Tipo de búsqueda no válido.' })
  if (!limpio) {
    return res.json({ ok: false, error: 'Debe introducir un valor para realizar la consulta.' })
  }
  if (!rx.test(limpio)) {
    return res.json({ ok: false, error: 'El valor introducido no tiene un formato válido.' })
  }

  const csv = tipo === 'csv' ? normalizaCsv(limpio) : normalizaCsv(limpio)

  res.json({
    ok: true,
    documentos: [
      {
        csv,
        titulo: 'Copia autenticada de documento de Portafirmas',
        icono: 'doc',
        firmado: '22 de octubre de 2026',
        organo: 'Consejería de Economía, Hacienda y Administración Digital'
      }
    ]
  })
})

/* ------------------------------------------------------------------ */
/*  DOCUMENTO VERIFICADO (acceso por CSV)                              */
/* ------------------------------------------------------------------ */

const DIR_DOCUMENTOS = path.join(root, 'documentos')
const CSV_VALIDO = /^CARM-[A-Za-z0-9-]{8,60}$/

function nombreDocumento(csv) {
  return `${csv}.pdf`
}

function buscarDocumento(csv) {
  const limpio = String(csv || '').trim()
  if (!CSV_VALIDO.test(limpio)) return null
  const fichero = path.join(DIR_DOCUMENTOS, nombreDocumento(limpio))
  if (!fs.existsSync(fichero)) return null
  return { csv: limpio, fichero, nombre: nombreDocumento(limpio) }
}

app.get('/api/documento', (req, res) => {
  const doc = buscarDocumento(req.query.csv)
  if (!doc) {
    return res.status(404).json({ ok: false, error: 'No se ha encontrado el documento.' })
  }
  res.json({
    ok: true,
    csv: doc.csv,
    nombre: doc.nombre,
    visor: `/verificardocumentos/visor?csv=${encodeURIComponent(doc.csv)}`,
    descarga: `/verificardocumentos/descargar?csv=${encodeURIComponent(doc.csv)}`
  })
})

app.get('/verificardocumentos/visor', (req, res) => {
  const doc = buscarDocumento(req.query.csv)
  if (!doc) return res.status(404).type('html').send('<p>Documento no encontrado.</p>')
  res.setHeader('Content-Type', 'application/pdf')
  res.setHeader('Content-Disposition', `inline; filename="${doc.nombre}"`)
  res.setHeader('Cache-Control', 'private, max-age=0, must-revalidate')
  res.sendFile(doc.fichero)
})

app.get('/verificardocumentos/descargar', (req, res) => {
  const doc = buscarDocumento(req.query.csv)
  if (!doc) return res.status(404).type('html').send('<p>Documento no encontrado.</p>')
  res.download(doc.fichero, doc.nombre)
})

app.get('/verificardocumentos', (req, res, next) => {
  if (isDev) return next()
  res.sendFile(path.join(root, 'dist', 'index.html'))
})

/* ------------------------------------------------------------------ */
/*  FRONTEND                                                           */
/* ------------------------------------------------------------------ */

if (isDev) {
  const { createServer } = await import('vite')
  const vite = await createServer({
    root,
    server: { middlewareMode: true },
    appType: 'spa'
  })
  app.use(vite.middlewares)
} else {
  app.use(express.static(path.join(root, 'dist')))
  app.get('*', (req, res) => res.sendFile(path.join(root, 'dist', 'index.html')))
}

app.listen(PORT, () => {
  console.log(`Servidor listo en http://localhost:${PORT}/eAConsultaWeb/consulta/`)
})
