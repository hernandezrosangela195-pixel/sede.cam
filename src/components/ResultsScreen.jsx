export default function ResultsScreen({ documentos }) {
  return (
    <div className="resultados">
      <div className="tituloResultados">Documentos encontrados:</div>

      {documentos.length === 0 ? (
        <p className="sinResultados">No se han encontrado documentos para los datos introducidos.</p>
      ) : (
        <div className="rejillaDocumentos">
          {documentos.map((doc) => (
            <a
              className="tarjetaDocumento"
              key={doc.csv}
              href={doc.descarga || `/verificardocumentos/descargar?csv=${encodeURIComponent(doc.csv)}`}
              download={doc.nombre || `${doc.csv}.pdf`}
              title="Descargar documento"
            >
              <span className="titulo">{doc.titulo}</span>
              <span className="icono" role="img" aria-label="Documento PDF" />
              <span className="csv">{doc.csv}</span>
            </a>
          ))}
        </div>
      )}
    </div>
  )
}
