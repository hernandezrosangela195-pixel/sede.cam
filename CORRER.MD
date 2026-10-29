# Cómo correr el proyecto

Clon de la página **VERIFICACIÓN DE DOCUMENTOS** de la sede electrónica de la CARM.
Node.js (Express) + React + Vite.

## Requisitos

- Node.js 18 o superior
- npm

## Instalación

```powershell
cd D:\nota\crearweb
npm install
```

## Modo desarrollo (con recarga en caliente)

```powershell
npm run dev
```

Abre en el navegador:

- Formulario: http://localhost:3000/eAConsultaWeb/consulta/
- Documento directo (con captcha): http://localhost:3000/verificardocumentos?csv=CARM-bc61499d-d63f-b5c5-9672-00505698h280

## Modo producción

```powershell
npm run prod
```

Compila el frontend y arranca el servidor en el puerto 3000.
Si ya está compilado, basta con:

```powershell
npm start
```

## Cambiar el puerto

```powershell
$env:PORT=8080; npm run dev
```

## Documento de ejemplo

El PDF que se descarga al pulsar la tarjeta está en:

```
documentos\CARM-bc61499d-d63f-b5c5-9672-00505698h280.pdf
```

Para añadir otro documento, copia un PDF a esa carpeta con el nombre del CSV
terminado en `.pdf` (por ejemplo `documentos\CARM-xxxx-xxxx.pdf`) y entra en
`/verificardocumentos?csv=CARM-xxxx-xxxx`.

## Estructura

```
server\index.js    servidor Express: captcha, verificación, descarga del PDF
src\               interfaz React (captcha, formulario, resultados)
public\            imágenes y hojas de estilo de la sede
documentos\        PDFs servidos en la descarga
```

## Notas

- El captcha es de sesión: si reinicias el servidor hay que recargar la página.
- La descarga usa `Content-Disposition: attachment`, así que el navegador guarda
  el PDF con el nombre del CSV.
