export function parseSearchContent(item) {
    const fields = item.contentFields || [];
    const getField = (name) => fields.find((f) => f.name === name);

    return {
        id: item.id,
        title: getField("titulo")?.contentFieldValue?.data || "",
        date: getField("dataPublicacao")?.contentFieldValue?.data || item.datePublished || "",
        img: getField("imagem")?.contentFieldValue?.image?.contentUrl || "",
        tags: (item.taxonomyCategoryBriefs || []).map((cat) => cat.taxonomyCategoryName),
        href: item.friendlyUrlPath ? `/${item.friendlyUrlPath}` : "",
    };
}