import { useEffect, useRef, useState } from 'react'

const R = '/eAConsultaWeb/resources/images'

const PESTANAS = [
  { id: 'csv', etiqueta: 'Código Seguro de Verificación (CSV)' },
  { id: 'documento', etiqueta: 'Nº de documento' },
  { id: 'guid', etiqueta: 'GUID' },
  { id: 'qr', etiqueta: 'Código QR' }
]

const TEXTOS = {
  csv: 'Para verificar la exactitud del documento en papel, introduzca el número que aparece en el mismo, según se muestra en las imágenes de ejemplo.',
  documento:
    'Para verificar la exactitud del documento en papel, introduzca el número de documento que figura en el mismo, según se muestra en la imagen de ejemplo.',
  guid: 'Para verificar la exactitud del documento en papel, introduzca el GUID que figura en el mismo, según se muestra en la imagen de ejemplo.',
  qr: 'Para verificar la exactitud del documento en papel, introduzca el contenido del código QR que aparece en el mismo, según se muestra en la imagen de ejemplo.'
}

const ETIQUETAS = {
  csv: 'Nº documento / Código seguro de verificación (CSV):',
  documento: 'Nº de documento:',
  guid: 'GUID del documento:',
  qr: 'Contenido del código QR:'
}

const EJEMPLOS = {
  csv: 'Ej.: CARM-bc61499d-d63f-05c5-9672-0050569b6280',
  documento: 'Ej.: 12345678',
  guid: 'Ej.: 8f2c1b7a-9d43-4e15-a8f1-2b6c0d9e4a71',
  qr: 'Ej.: https://sede.carm.es/eAConsultaWeb/consulta/consultaDocumentos.do?csv=CARM-...'
}

export default function VerificationScreen({ onResultados }) {
  const [pestana, setPestana] = useState('csv')
  const [valor, setValor] = useState('')
  const [error, setError] = useState('')
  const [enviando, setEnviando] = useState(false)
  const inputRef = useRef(null)

  useEffect(() => {
    setValor('')
    setError('')
    inputRef.current?.focus()
  }, [pestana])

  const consultar = async (e) => {
    e.preventDefault()
    if (enviando) return
    setEnviando(true)
    setError('')
    try {
      const r = await fetch('/api/verificar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tipo: pestana, valor })
      })
      const datos = await r.json()
      if (datos.ok) {
        onResultados(datos.documentos)
      } else {
        setError(datos.error || 'No se han encontrado documentos.')
      }
    } catch (err) {
      setError('No se ha podido realizar la consulta.')
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div>
      <table className="barraPestanas" cellPadding="0" cellSpacing="0">
        <tbody>
          <tr>
            <td>
              <ul className="pestanas">
                {PESTANAS.map((p) => (
                  <li key={p.id} className={p.id === pestana ? 'activa' : ''}>
                    <button type="button" onClick={() => setPestana(p.id)}>
                      {p.etiqueta}
                    </button>
                  </li>
                ))}
              </ul>
            </td>
          </tr>
        </tbody>
      </table>

      <form className="verificacion" onSubmit={consultar}>
        <table className="verificacion tablaVerificacion">
          <tbody>
            <tr>
              <td className="columnaDocumento">
                <img src={`${R}/documento.jpg`} width="168" alt="Ejemplo de documento con el CSV señalado" />
              </td>

              <td className="columnaCentral">
                <p className="textoExplicativo">{TEXTOS[pestana]}</p>

                <label className="etiquetaVerificacion" htmlFor="valorVerificacion">
                  {ETIQUETAS[pestana]}
                </label>
                <input
                  id="valorVerificacion"
                  ref={inputRef}
                  className="campoVerificacion textbox_css"
                  value={valor}
                  onChange={(e) => setValor(e.target.value)}
                  placeholder={EJEMPLOS[pestana]}
                  autoComplete="off"
                  spellCheck="false"
                />

                <div className="lineaBoton">
                  <button type="submit" className="botonContinuar" disabled={enviando}>
                    Consultar
                  </button>
                </div>

                <div className="mensajeErrorCaptcha" role="alert">
                  {error}
                </div>

                {pestana === 'csv' && (
                  <div className="guias">
                    <div className="guiaBarCode">
                      <div className="rotulo">Número de documento</div>
                      <div className="codigoBarras" />
                      <div className="numeroDocumento">XXXXXXXX-XXXX-XXXX-XXXXXXXXXXXX</div>
                    </div>

                    <div className="guiaGuid">
                      <img src={`${R}/GUID-PTF.jpg`} alt="Ejemplo de GUID en el margen del documento" />
                    </div>

                    <div className="bloqueQr">
                      <div className="guiaQr">
                        <img src={`${R}/QR-PTF.jpg`} alt="Código QR de ejemplo" />
                      </div>
                      <p className="pieGuia">
                        O bien, con un lector de códigos QR puede leer el CSV incluido en el mismo.
                      </p>
                    </div>
                  </div>
                )}

                {pestana === 'documento' && (
                  <div className="guias">
                    <div className="guiaQr">
                      <img src={`${R}/QR-PTF.jpg`} alt="Código QR de ejemplo" />
                    </div>
                    <p className="pieGuia">
                      El número de documento se compone de los dígitos que identifican el documento
                      y se muestra junto al código de barras.
                    </p>
                  </div>
                )}

                {pestana === 'guid' && (
                  <div className="guias">
                    <div className="guiaGuid">
                      <img src={`${R}/GUID-PTF.jpg`} alt="Ejemplo de GUID en el margen del documento" />
                    </div>
                    <p className="pieGuia">
                      El GUID aparece impreso en el margen izquierdo del documento, junto al código
                      de barras vertical.
                    </p>
                  </div>
                )}

                {pestana === 'qr' && (
                  <div className="guias">
                    <div className="guiaQr">
                      <img src={`${R}/QR-PTF.jpg`} alt="Código QR de ejemplo" />
                    </div>
                    <p className="pieGuia">
                      Escanee el código QR del documento con su lector habitual y pegue aquí su
                      contenido.
                    </p>
                  </div>
                )}
              </td>

              <td className="columnaDerecha">
                <img src={`${R}/CSV-PTF.jpg`} width="186" alt="Ejemplo de la ubicación del CSV en un informe" />
              </td>
            </tr>
          </tbody>
        </table>
      </form>
    </div>
  )
}
