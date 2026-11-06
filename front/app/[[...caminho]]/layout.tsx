import type { ReactNode } from 'react';

import { buscarPagina, caminhoDe, dominioAtual } from '@/lib/conteudo';
import { cssDosModelos, midiaLocal, widgetsInterativos } from '@/lib/montar';
import { CATALOGO, CSS_COMPARTILHADO } from '@/widgets/catalogo';
import { Scripts } from '@/lib/scripts';

// Ciclo de vida usado pelo JS dos temas e fragmentos: página pronta, cada widget pronto, todos prontos
const CICLO = `window.Pagina={pronta:function(f){document.readyState==='loading'?document.addEventListener('DOMContentLoaded',function(){f()}):setTimeout(f)},widgetPronto:function(f){Pagina.pronta(function(){document.querySelectorAll('.portlet-boundary').forEach(function(e){f(e.id.replace(/^p_p_id_/,'').replace(/_$/,''),e)})})},on:function(n,f){if(n==='allPortletsReady')window.addEventListener('load',function(){f()})}};`;

// Layout único para todos os sites: o <head> vem do site (tema, estilos, scripts) e da página (CSS próprio)
export default async function Layout({ children, params }: { children: ReactNode; params: Promise<{ caminho?: string[] }> }) {
  const d = await buscarPagina(await dominioAtual(), caminhoDe((await params).caminho));
  if (!d || d.redirecionar) {
    return (
      <html lang="pt-BR">
        <body>{children}</body>
      </html>
    );
  }
  const { site } = d;
  // Arquivos do tema: os da página (cada página pode usar um tema); sem lista própria, os do site
  const arquivos = d.pagina.arquivosTema?.length ? d.pagina.arquivosTema : site.arquivosTema;
  const css = arquivos.filter((a) => !a.endsWith('.js'));
  const js = arquivos.filter((a) => a.endsWith('.js'));
  const widgets = widgetsInterativos(d);
  const cssWidgets = widgets.length ? [...new Set([...widgets.flatMap((w) => CATALOGO[w.modulo].css), ...CSS_COMPARTILHADO])] : [];
  // Contexto do site para os widgets (window.__SITE__)
  const contexto = { chave: site.chave, nome: site.nome, inicio: '/', codigo: site.codigo, codigoGlobal: Number(process.env.CODIGO_GLOBAL || 20123), configuracoes: site.configuracoes };
  return (
    // Scripts do tema/terceiros alteram atributos do <html>/<body> antes da hidratação (esperado)
    <html lang={site.idioma} dir="ltr" suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
        {css.map((href) => (
          <link key={href} rel="stylesheet" href={href} />
        ))}
        {site.estilosGlobais.map((c, i) => (
          <style key={`g${i}`} dangerouslySetInnerHTML={{ __html: midiaLocal(c) }} />
        ))}
        {d.pagina.css && <style dangerouslySetInnerHTML={{ __html: midiaLocal(d.pagina.css) }} />}
        {cssDosModelos(d).map((c, i) => (
          <style key={`m${i}`} dangerouslySetInnerHTML={{ __html: c }} />
        ))}
        {cssWidgets.map((href) => (
          <link key={href} rel="stylesheet" href={href} />
        ))}
        <script dangerouslySetInnerHTML={{ __html: `window.__SITE__=${JSON.stringify(contexto)};${CICLO}` }} />
        {js.map((src) => (
          <script key={src} src={src} />
        ))}
        <Scripts html={site.scriptsCabeca} />
      </head>
      <body className={site.classesBody} suppressHydrationWarning>
        {children}
        <Scripts html={site.scriptsCorpo} />
      </body>
    </html>
  );
}
