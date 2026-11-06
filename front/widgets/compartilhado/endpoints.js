const defaultHeaders = {
    Accept: "application/json",
};

// Chamada à API do próprio site (Next.js), que lê o conteúdo do Strapi
async function api(endpoint, options = {}) {
    const method = options.method || "GET";

    const response = await fetch(endpoint, {
        ...options,
        method,
        headers: {
          ...defaultHeaders,
          ...options.headers,
        },
    });

    const responseText = await response.text();
    const data = JSON.parse(responseText);
    if (!response.ok) {
      throw "{'erro': true}";
    }
    return data;
}

export default api;
