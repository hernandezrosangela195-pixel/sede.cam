export default function AyudaModal({ onCerrar }) {
  return (
    <div className="velo" role="dialog" aria-modal="true" aria-label="Ayuda general">
      <div className="ventana">
        <div className="barra">
          <span>Ayuda</span>
          <button type="button" title="Cerrar" onClick={onCerrar}>
            X
          </button>
        </div>
        <div className="cuerpo">
          <p>
            <b>Verificación de documentos electrónicos</b>
          </p>
          <p>
            Desde esta página puede comprobar la autenticidad e integridad de los documentos
            electrónicos emitidos por la Comunidad Autónoma de la Región de Murcia.
          </p>
          <p>La verificación se puede realizar de tres formas:</p>
          <p>
            1. Mediante el <b>Código Seguro de Verificación (CSV)</b>, que figura impreso en el
            documento y también aparece en su código de barras y en el código QR.
          </p>
          <p>
            2. Mediante el <b>identificador del documento</b>, para los documentos que lo incluyen.
          </p>
          <p>3. Mediante un <b>GUID</b> o a través de la <b>lectura del código QR</b>.</p>
          <p>
            Introduzca el dato en la pestaña correspondiente y pulse <b>Consultar</b>. Si el
            documento existe se mostrará una relación de resultados.
          </p>
          <p>
            Para volver a la pantalla de caracteres de seguridad puede recargar la página o pulsar
            el icono de la llave.
          </p>
        </div>
        <div className="acciones">
          <button type="button" className="botonContinuar" onClick={onCerrar}>
            Cerrar
          </button>
        </div>
      </div>
    </div>
  )
}
