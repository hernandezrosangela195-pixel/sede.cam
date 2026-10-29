import { createContext, useContext } from 'react'

export const AyudaContext = createContext(() => {})
export const useAyuda = () => useContext(AyudaContext)

const R = '/eAConsultaWeb/resources/images'

export default function Header({ onAyuda }) {
  const cambiarFuente = (accion) => {
    const clases = ['fuenteNormal', 'fuenteGrande', 'fuenteMuyGrande']
    const body = document.body
    const actual = clases.findIndex((c) => body.classList.contains(c))
    let indice = actual < 0 ? 0 : actual

    if (accion === 'mas') indice = Math.min(clases.length - 1, indice + 1)
    if (accion === 'menos') indice = Math.max(0, indice - 1)
    if (accion === 'reset') indice = 0

    clases.forEach((c) => body.classList.remove(c))
    if (indice > 0) body.classList.add(clases[indice])
    try {
      localStorage.setItem('carmFuente', String(indice))
    } catch (e) {
      /* almacenamiento no disponible */
    }
  }

  return (
    <header>
      <table className="cabeceraTabla" cellPadding="0" cellSpacing="0">
        <tbody>
          <tr>
            <td className="cabeceraLogo">
              <img src={`${R}/logo.gif`} width="300" height="67" alt="eA: Administración electrónica" />
            </td>
            <td className="cabeceraDerecha">
              <img src={`${R}/header.jpg`} width="450" height="67" alt="Comunidad Autónoma de la Región de Murcia" />
            </td>
          </tr>
        </tbody>
      </table>

      <div className="lineaNegra" />

      <table className="barraTitulo" cellPadding="0" cellSpacing="0">
        <tbody>
          <tr>
            <td className="celdaTitulo">VERIFICACIÓN DE DOCUMENTOS</td>
            <td className="celdaHerramientas">
              <table cellPadding="0" cellSpacing="1" border="0">
                <tbody>
                  <tr>
                    <td>
                      <button
                        type="button"
                        className="iconoHerramienta"
                        title="Cerrar Sesión"
                        onClick={() => window.close()}
                      >
                        <img src={`${R}/cerrarsesion.gif`} alt="Cerrar Sesión" width="20" height="17" />
                      </button>
                    </td>
                    <td className="separadorIconos">&nbsp;</td>
                    <td>
                      <a
                        href="https://sede.carm.es/web/pagina?IDCONTENIDO=74&IDTIPO=241&RASTRO=c$m40288"
                        title="Póngase en contacto con nosotros"
                        target="_blank"
                        rel="noreferrer"
                      >
                        <img
                          src={`${R}/contacto.gif`}
                          alt="Póngase en contacto con nosotros"
                          width="20"
                          height="17"
                        />
                      </a>
                    </td>
                    <td>
                      <button
                        type="button"
                        className="iconoHerramienta"
                        title="Ayuda General"
                        onClick={onAyuda}
                      >
                        <img src={`${R}/ayuda.gif`} alt="Ayuda" width="20" height="17" />
                      </button>
                    </td>
                    <td>
                      <button
                        type="button"
                        className="iconoHerramienta"
                        title="Restituir fuente"
                        onClick={() => cambiarFuente('reset')}
                      >
                        <img src={`${R}/letrar.gif`} alt="Restablecer al tamaño de fuente por defecto" width="20" height="17" />
                      </button>
                    </td>
                    <td>
                      <button
                        type="button"
                        className="iconoHerramienta"
                        title="Aumentar tamaño de la fuente"
                        onClick={() => cambiarFuente('mas')}
                      >
                        <img src={`${R}/letra_mas.gif`} alt="Aumentar tamaño fuente" width="20" height="17" />
                      </button>
                    </td>
                    <td>
                      <button
                        type="button"
                        className="iconoHerramienta"
                        title="Disminuir tamaño fuente"
                        onClick={() => cambiarFuente('menos')}
                      >
                        <img src={`${R}/letra_menos.gif`} alt="Disminuir tamaño fuente" width="20" height="17" />
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </td>
          </tr>
        </tbody>
      </table>

      <div className="lineaBisel" />
    </header>
  )
}
