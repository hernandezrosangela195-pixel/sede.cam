import { useEffect, useState } from 'react'
import Header from './components/Header.jsx'
import Footer from './components/Footer.jsx'
import AyudaModal from './components/AyudaModal.jsx'
import CaptchaScreen from './components/CaptchaScreen.jsx'
import VerificationScreen from './components/VerificationScreen.jsx'
import ResultsScreen from './components/ResultsScreen.jsx'

function leerCsvEntrada() {
  const params = new URLSearchParams(window.location.search)
  const csv = params.get('csv')
  if (csv) return csv.trim()
  const qr = params.get('qr')
  if (qr) return qr.trim()
  return ''
}

export default function App() {
  const [csvEntrada, setCsvEntrada] = useState(() => leerCsvEntrada())
  const [fase, setFase] = useState('captcha')
  const [documentos, setDocumentos] = useState([])
  const [ayuda, setAyuda] = useState(false)

  useEffect(() => {
    const guardado = Number(localStorage.getItem('carmFuente') || '0')
    const clases = ['fuenteNormal', 'fuenteGrande', 'fuenteMuyGrande']
    clases.forEach((c) => document.body.classList.remove(c))
    if (guardado > 0 && clases[guardado]) document.body.classList.add(clases[guardado])
  }, [])

  useEffect(() => {
    const alPulsar = (e) => {
      if (e.key === 'Escape') setAyuda(false)
    }
    window.addEventListener('keydown', alPulsar)
    return () => window.removeEventListener('keydown', alPulsar)
  }, [])

  const trasCaptcha = () => {
    if (csvEntrada) {
      setDocumentos([
        {
          csv: csvEntrada,
          titulo: 'Copia autenticada de documento de Portafirmas',
          visor: `/verificardocumentos/visor?csv=${encodeURIComponent(csvEntrada)}`
        }
      ])
      setFase('resultados')
      return
    }
    setFase('verificacion')
  }

  const volverAlInicio = () => {
    setDocumentos([])
    setCsvEntrada('')
    setFase('verificacion')
    window.history.replaceState({}, '', '/eAConsultaWeb/consulta/')
  }

  return (
    <>
      <Header onAyuda={() => setAyuda(true)} />

      <div id="contenidoPrincipal">
        {fase === 'captcha' && <CaptchaScreen onValidado={trasCaptcha} />}

        {fase === 'verificacion' && (
          <VerificationScreen
            valorInicial={csvEntrada}
            onResultados={(lista) => {
              setDocumentos(lista)
              setFase('resultados')
            }}
          />
        )}

        {fase === 'resultados' && (
          <ResultsScreen
            documentos={documentos}
            onVolver={() => {
              setDocumentos([])
              setFase('verificacion')
            }}
          />
        )}
      </div>

      <Footer />

      {ayuda && <AyudaModal onCerrar={() => setAyuda(false)} />}
    </>
  )
}
