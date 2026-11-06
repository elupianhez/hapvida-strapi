import { metadadosDaPagina, renderizarPagina } from '../pagina'

type Args = { params: Promise<{ slug: string }> }

export const generateMetadata = async ({ params }: Args) => metadadosDaPagina((await params).slug)

export default async function Pagina({ params }: Args) {
  return renderizarPagina((await params).slug)
}
