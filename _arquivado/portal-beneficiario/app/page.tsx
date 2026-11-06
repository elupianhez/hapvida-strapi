import { cookies } from 'next/headers'
import React from 'react'

import { buscarAparencia, buscarAvisos, SITE_URL } from '@/lib/cms'
import { buscarBeneficiario } from '@/lib/core'
import { lerSessao, SESSION_COOKIE } from '@/lib/oidc'

const Logo = ({ marca }: { marca: string }) =>
  marca === 'ndi' ? (
    <span className="logo">
      NotreDame <span className="fino">Intermédica</span>
    </span>
  ) : (
    <span className="logo">
      hap<span className="destaque">vida</span>
    </span>
  )

export default async function Home({ searchParams }: { searchParams: Promise<{ erro?: string }> }) {
  const { erro } = await searchParams
  const sessao = await lerSessao((await cookies()).get(SESSION_COOKIE)?.value)
  const [{ marca }, avisos] = await Promise.all([buscarAparencia(), buscarAvisos()])

  return (
    <>
      <header className="topo">
        <div className="container linha">
          <a href="/">
            <Logo marca={marca} />
          </a>
          <span className="tag">Portal do Beneficiário</span>
          <nav>
            <a href={SITE_URL}>Site</a>
            {sessao ? <a href="/api/auth/logout">Sair</a> : <a href="/api/auth/login">Entrar</a>}
          </nav>
        </div>
      </header>

      <main className="container">
        {erro && <p className="alerta">Não foi possível entrar. Tente novamente.</p>}

        {sessao ? <AreaLogada email={sessao.email} nome={sessao.nome} /> : <BoasVindas />}

        <section>
          <h2>Avisos</h2>
          <p className="nota">Conteúdo publicado no Strapi e lido pela API headless.</p>
          <div className="grade">
            {avisos.map((a) => (
              <a className="cartao aviso" href={`${SITE_URL}/posts/${a.slug}`} key={a.documentId}>
                <strong>{a.titulo}</strong>
                <span>{a.resumo}</span>
              </a>
            ))}
            {!avisos.length && <p className="nota">Nenhum aviso publicado (ou o CMS está iniciando).</p>}
          </div>
        </section>
      </main>

      <footer className="rodape container">
        PoC · identidade no Keycloak · conteúdo e tema no CMS · dados de beneficiário simulados
      </footer>
    </>
  )
}

function BoasVindas() {
  return (
    <section className="hero">
      <h1>Sua saúde na palma da mão</h1>
      <p>Carteirinha digital, agendamentos e avisos em um só lugar.</p>
      <a className="botao" href="/api/auth/login">
        Entrar com SSO
      </a>
      <p className="nota">
        Demo: <code>maria@hapvida.poc</code> / <code>hapvida123</code>
      </p>
    </section>
  )
}

async function AreaLogada({ nome, email }: { nome: string; email: string }) {
  const b = await buscarBeneficiario(email)
  return (
    <section>
      <h1>Olá, {nome.split(' ')[0]}!</h1>
      <div className="grade">
        <div className="cartao carteirinha">
          <span className="rotulo">Carteirinha digital</span>
          <strong className="numero">{b.carteirinha}</strong>
          <span>{nome}</span>
          <span>
            {b.plano} · {b.acomodacao}
          </span>
          <span className="rotulo">Validade {b.validade}</span>
        </div>
        <div className="cartao">
          <span className="rotulo">Próxima consulta</span>
          {b.proximaConsulta ? (
            <>
              <strong>{b.proximaConsulta.especialidade}</strong>
              <span>{b.proximaConsulta.data}</span>
              <span>{b.proximaConsulta.local}</span>
            </>
          ) : (
            <span>Nenhum agendamento.</span>
          )}
        </div>
      </div>
    </section>
  )
}
