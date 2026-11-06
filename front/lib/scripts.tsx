// Converte os <script> cadastrados no site (terceiros: OneTrust, analytics...) em elementos React,
// preservando os atributos (data-domain-script etc.).
const ATRIBUTO = /([\w:-]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+)))?/g;
const REACT: Record<string, string> = { charset: 'charSet', crossorigin: 'crossOrigin', nomodule: 'noModule', referrerpolicy: 'referrerPolicy' };

export const Scripts = ({ html }: { html: string }) => {
  const tags = [...(html || '').matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)];
  return (
    <>
      {tags.map(([, attrs, corpo], i) => {
        const props: Record<string, string | boolean> = {};
        for (const [, nome, a, b, c] of attrs.matchAll(ATRIBUTO)) {
          if (nome.startsWith('data-senna')) continue;
          props[REACT[nome.toLowerCase()] || nome] = a ?? b ?? c ?? true;
        }
        return corpo.trim() ? <script key={i} {...props} dangerouslySetInnerHTML={{ __html: corpo }} /> : <script key={i} {...props} />;
      })}
    </>
  );
};
