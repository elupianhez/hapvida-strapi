// Filtro no formato usado pelos widgets (subconjunto de OData), aplicado sobre os itens já carregados.
//   expr := ou ; ou := e ('or' e)* ; e := nao ('and' nao)* ; nao := 'not' nao | atom
//   atom := '(' expr ')' | contains|startswith|endswith '(' campo ',' valor ')' | lista/any(v: expr) | campo op valor
type Item = Record<string, unknown>;
type Vars = Record<string, unknown>;
type Pred = (x: Item, v: Vars) => boolean;

export const normalizar = (s: unknown) => String(s).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

// Picklist ({key, name}) compara pela key
const escalar = (v: unknown) => (v && typeof v === 'object' && !Array.isArray(v) && 'key' in v ? (v as { key: unknown }).key : v);
export const valorDe = (obj: unknown, caminho: string[]): unknown => {
  let v: unknown = obj;
  for (const p of caminho) {
    if (v == null) return undefined;
    v = Array.isArray(v) ? v.map((x) => (x as Item)?.[p]) : (v as Item)[p];
  }
  return escalar(v);
};
const valorBruto = (obj: unknown, caminho: string[]) => caminho.reduce<unknown>((v, p) => (v as Item | undefined)?.[p], obj);

const tokenizar = (s: string) => {
  const toks: string[] = [];
  const re = /\s*('(?:[^']|'')*'|\(|\)|,|:|[A-Za-z_][\w./]*|-?\d+(?:\.\d+)?)/y;
  let m: RegExpExecArray | null;
  while ((m = re.exec(s)) && m[0].trim() !== '') toks.push(m[1]);
  return toks;
};

export const compilarFiltro = (texto: string) => {
  const t = tokenizar(texto);
  let i = 0;
  const olhar = () => t[i];
  const pegar = (esperado?: string) => {
    const x = t[i++];
    if (esperado && x?.toLowerCase() !== esperado) throw new Error(`filtro: esperado ${esperado}, veio ${x}`);
    return x;
  };
  const literal = (x?: string): unknown => {
    if (x == null) return undefined;
    if (x.startsWith("'")) return x.slice(1, -1).replace(/''/g, "'");
    if (x === 'true') return true;
    if (x === 'false') return false;
    if (x === 'null') return null;
    if (/^-?\d/.test(x)) return Number(x);
    return x;
  };
  const OPS: Record<string, (a: unknown, b: unknown) => boolean> = {
    eq: (a, b) => (Array.isArray(a) ? a.includes(b) : a == b || (a != null && String(a) === String(b))),
    ne: (a, b) => !(a == b),
    gt: (a, b) => (a as number) > (b as number),
    ge: (a, b) => (a as number) >= (b as number),
    lt: (a, b) => (a as number) < (b as number),
    le: (a, b) => (a as number) <= (b as number),
  };
  const resolver = (nome: string, x: Item, v: Vars) => {
    const partes = nome.split('/');
    if (v && partes[0] in v) return partes.length === 1 ? escalar(v[partes[0]]) : valorDe(v[partes[0]], partes.slice(1));
    return valorDe(x, partes);
  };
  const expr = (): Pred => ou();
  const ou = (): Pred => {
    let esq = e();
    while (olhar()?.toLowerCase() === 'or') { pegar(); const dir = e(); const a = esq; esq = (x, v) => a(x, v) || dir(x, v); }
    return esq;
  };
  const e = (): Pred => {
    let esq = nao();
    while (olhar()?.toLowerCase() === 'and') { pegar(); const dir = nao(); const a = esq; esq = (x, v) => a(x, v) && dir(x, v); }
    return esq;
  };
  const nao = (): Pred => {
    if (olhar()?.toLowerCase() === 'not') { pegar(); const f = nao(); return (x, v) => !f(x, v); }
    return atom();
  };
  const atom = (): Pred => {
    const tok = pegar();
    if (tok === '(') { const f = expr(); pegar(')'); return f; }
    const fn = tok.toLowerCase();
    if (['contains', 'startswith', 'endswith'].includes(fn) && olhar() === '(') {
      pegar('('); const campo = pegar(); pegar(','); const val = literal(pegar()); pegar(')');
      return (x, v) => {
        const a = normalizar(resolver(campo, x, v) ?? '');
        const b = normalizar(val);
        return fn === 'contains' ? a.includes(b) : fn === 'startswith' ? a.startsWith(b) : a.endsWith(b);
      };
    }
    const lam = tok.match(/^(.+)\/(any|all)$/i);
    if (lam && olhar() === '(') {
      pegar('('); const variavel = pegar(); pegar(':'); const corpo = expr(); pegar(')');
      return (x, v) => {
        const lista = valorBruto(x, lam[1].split('/'));
        if (!Array.isArray(lista)) return false;
        const teste = (el: unknown) => corpo(x, { ...v, [variavel]: el });
        return lam[2].toLowerCase() === 'any' ? lista.some(teste) : lista.every(teste);
      };
    }
    const op = pegar().toLowerCase();
    const val = literal(pegar());
    if (!OPS[op]) throw new Error(`filtro: operador ${op}`);
    return (x, v) => OPS[op](resolver(tok, x, v), val);
  };
  const f = expr();
  return (x: Item) => f(x, {});
};
