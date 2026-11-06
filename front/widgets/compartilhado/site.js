// Contexto do site atual (preenchido pelo layout em window.__SITE__): chave, nome, endereço inicial.
export const siteAtual = () =>
	(typeof window !== "undefined" && window.__SITE__) || { chave: "", nome: "", inicio: "/" };
