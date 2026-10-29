import express from 'express'
import serverless from 'serverless-http'
import path from 'node:path'
import fs from 'node:fs'
import crypto from 'node:crypto'

const app = express()
app.disable('x-powered-by')

app.use(express.json())
app.use(express.urlencoded({ extended: false }))

const SECRET = 'sede-carm-verificacion-documentos'

// Funciones para leer y firmar cookies (reemplaza express-session en Serverless)
function sign(val) {
  const h = crypto.createHmac('sha256', SECRET).update(val).digest('hex')
  return `${val}.${h}`
}

function unsign(signed) {
  if (!signed || !signed.includes('.')) return null
  const [val, h] = signed.split('.')
  const expected = crypto.createHmac('sha256', SECRET).update(val).digest('hex')
  return h === expected ? val : null
}

function getCookies(req) {
  const raw = req.headers.cookie || ''
  return Object.fromEntries(
    raw.split(';').filter(Boolean).map(c => {
      const idx = c.indexOf('=')
      return [c.slice(0, idx).trim(), decodeURIComponent(c.slice(idx + 1).trim())]
    })
  )
}

/* ------------------------------------------------------------------ */
/*  CAPTCHA                                                            */
/* ------------------------------------------------------------------ */

const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
const CAPTCHA_FONT = "'Segoe Script','Bradley Hand','Brush Script MT','Comic Sans MS',cursive"

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
  res.setHeader('Set-Cookie', `captcha=${encodeURIComponent(sign(code))}; Path=/; HttpOnly; SameSite=Lax`)
  res.setHeader('Content-Type', 'image/svg+xml; charset=utf-8')
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate')
  res.send(captchaSvg(code))
})

app.post('/eAConsultaWeb/consulta/procesarCaptcha.do', (req, res) => {
  const valor = String(req.body.caracteres ?? req.body['{actionForm.caracteres}'] ?? '')
    .trim()
    .toUpperCase()

  if (!valor) return res.json({ ok: false, error: 'Debe introducir los caracteres.' })

  const cookies = getCookies(req)
  const expected = unsign(cookies.captcha)

  // Acepta el código dinámico de la cookie (o 95WQPG por respaldo)
  if (!expected && valor !== '95WQPG') {
    return res.json({ ok: false, error: 'La imagen ha caducado. Vuelva a intentarlo.' })
  }
  if (expected && valor !== expected && valor !== '95WQPG') {
    return res.json({ ok: false, error: 'Los caracteres no coinciden con la imagen.' })
  }

  res.setHeader('Set-Cookie', 'verificado=true; Path=/; HttpOnly; SameSite=Lax')
  return res.json({ ok: true })
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

  const csv = normalizaCsv(limpio)

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

const CSV_VALIDO = /^CARM-[A-Za-z0-9-]{8,60}$/

function buscarDocumento(csv) {
  const limpio = String(csv || '').trim()
  if (!CSV_VALIDO.test(limpio)) return null
  const nombre = `${limpio}.pdf`

  // Busca en las rutas posibles dentro del entorno de Netlify
  const posiblesRutas = [
    path.join(process.cwd(), 'documentos', nombre),
    path.join(process.cwd(), 'public', 'documentos', nombre),
    path.join(process.cwd(), 'dist', 'documentos', nombre)
  ]

  for (const fichero of posiblesRutas) {
    if (fs.existsSync(fichero)) {
      return { csv: limpio, fichero, nombre }
    }
  }
  return null
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
  const buffer = fs.readFileSync(doc.fichero)
  res.setHeader('Content-Type', 'application/pdf')
  res.setHeader('Content-Disposition', `inline; filename="${doc.nombre}"`)
  res.setHeader('Cache-Control', 'private, max-age=0, must-revalidate')
  res.send(buffer)
})

app.get('/verificardocumentos/descargar', (req, res) => {
  const doc = buscarDocumento(req.query.csv)
  if (!doc) return res.status(404).type('html').send('<p>Documento no encontrado.</p>')
  const buffer = fs.readFileSync(doc.fichero)
  res.setHeader('Content-Type', 'application/pdf')
  res.setHeader('Content-Disposition', `attachment; filename="${doc.nombre}"`)
  res.send(buffer)
})

export const handler = serverless(app, {
  binary: ['application/pdf']
})