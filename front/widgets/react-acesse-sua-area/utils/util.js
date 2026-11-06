export function mapCardsDeAcesseSuaArea(response) {
   const items = response?.items || [];

   return items.map((item) => ({
      id: item.id,
      titulo: item.cardTitle,
      textoHtml: item.cardText,
      link: item.cardLink,
      categorias: item.taxonomyCategoryBriefs?.map(
         (category) => category.taxonomyCategoryName
      ) ?? [],
      categoria:
         item.taxonomyCategoryBriefs?.[0]?.taxonomyCategoryName ?? null,
      icone: item.icon
         ? {
              nome: item.icon.name,
              url: item.icon.link?.href
                 ? `${item.icon.link.href}`
                 : null,
              alt: item.icon.alternativeText,
           }
         : null,
   }));
}