const R = '/eAConsultaWeb/resources/images'

export default function Footer() {
  return (
    <table id="pie" cellPadding="0" cellSpacing="0" border="0">
      <tbody>
        <tr>
          <td colSpan="2" className="franja">
            <a
              href="https://sede.carm.es/web/pagina?IDCONTENIDO=40290&IDTIPO=100&RASTRO=c$m"
              target="_blank"
              rel="noreferrer"
            >
              Accesibilidad
            </a>
            <span className="sep">|</span>
            <a
              href="https://sede.carm.es/web/pagina?IDCONTENIDO=40291&IDTIPO=100&RASTRO=c$m"
              target="_blank"
              rel="noreferrer"
            >
              Aviso Legal
            </a>
          </td>
        </tr>
        <tr>
          <td className="textoLegal">
            &copy; Todos los derechos reservados. 2005- Comunidad Autónoma de la Región de Murcia
            <br />
            Resolución mínima recomendada de 800x600 px.
          </td>
          <td className="celdaImagen">
            <img src={`${R}/limones2.jpg`} alt="Consejería de Economía y Hacienda" width="400" height="35" />
          </td>
        </tr>
      </tbody>
    </table>
  )
}
