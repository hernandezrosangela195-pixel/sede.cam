import { useEffect, useRef, useState } from 'react'

export default function CaptchaScreen({ onValidado }) {
  const [valor, setValor] = useState('')
  const [error, setError] = useState('')
  const [semilla, setSemilla] = useState(() => Date.now())
  const [enviando, setEnviando] = useState(false)
  const inputRef = useRef(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [semilla])

  const enviar = async (e) => {
    e.preventDefault()
    if (enviando) return
    setEnviando(true)
    setError('')
    try {
      const r = await fetch('/eAConsultaWeb/consulta/procesarCaptcha.do', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ caracteres: valor })
      })
      const datos = await r.json()
      if (datos.ok) {
        onValidado()
      } else {
        setError(datos.error || 'Los caracteres no coinciden con la imagen.')
        setValor('')
        setSemilla(Date.now())
      }
    } catch (err) {
      setError('No se ha podido comprobar el código de seguridad.')
      setSemilla(Date.now())
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div className="envolturaCaptcha">
      <div className="tituloPasos">Escriba los caracteres que aparecen en la siguiente imagen:</div>

      <div className="bloqueCaptcha">
        <button
          type="button"
          className="iconoHerramienta"
          title="Cambiar imagen de seguridad"
          onClick={() => {
            setValor('')
            setError('')
            setSemilla(Date.now())
          }}
        >
          <img
            className="imagenSeguridad"
            src={`/eAConsultaWeb/jcaptcha?t=${semilla}`}
            width="200"
            height="50"
            alt="Imagen de seguridad con los caracteres a escribir"
          />
        </button>
      </div>

      <form onSubmit={enviar}>
        <div className="bloqueCaptcha" style={{ marginTop: 18 }}>
          <label className="etiquetaCampo" htmlFor="caracteres">
            Caracteres:
          </label>
          <input
            id="caracteres"
            name="caracteres"
            ref={inputRef}
            className="campoCaracteres textbox_css"
            value={valor}
            maxLength="12"
            autoComplete="off"
            spellCheck="false"
            onChange={(e) => setValor(e.target.value)}
          />
        </div>

        <div className="bloqueCaptcha" style={{ marginTop: 10 }}>
          <div className="mensajeErrorCaptcha" role="alert">
            {error}
          </div>
          <button type="submit" className="botonContinuar" disabled={enviando}>
            Continuar
          </button>
        </div>
      </form>
    </div>
  )
}
