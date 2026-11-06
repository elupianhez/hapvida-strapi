import { metadadosDaPagina, renderizarPagina } from './pagina'

export const generateMetadata = () => metadadosDaPagina('home')

export default function Home() {
  return renderizarPagina('home')
}
