import React from "react";

export default function LinkArtigosProximoAnterior({
    previousArticle,
    nextArticle,
    isNoticiaOrBlog,
}) {
    const { isNoticia, isBlog } = isNoticiaOrBlog || {};

    const textoAnterior = isNoticia
        ? "< Notícia Anterior"
        : isBlog
            ? "< Post Anterior"
            : "< Anterior";

    const textoProximo = isNoticia
        ? "Próxima Notícia >"
        : isBlog
            ? "Próximo Post >"
            : "Próximo >";

    const showLinks = isNoticia || isBlog;

    if (!showLinks) return null;

    return (
        <div className="container-proximos">
            <div className="container-proximos-left">
                {previousArticle && (
                    <>
                        <a
                            href={`/${previousArticle.friendlyUrlPath}`}
                            className="container-proximos-link"
                            tabIndex={0}
                        >
                            <span>{textoAnterior}</span>
                        </a>
                        <div className="container-proximos-title" tabIndex={0}>
                            {previousArticle.titulo}
                        </div>
                    </>
                )}
            </div>

            <div className="container-proximos-right">
                {nextArticle && (
                    <>
                        <a
                            href={`/${nextArticle.friendlyUrlPath}`}
                            className="container-proximos-link"
                            tabIndex={0}
                        >
                            <span>{textoProximo}</span>
                        </a>
                        <div className="container-proximos-title" tabIndex={0}>
                            {nextArticle.titulo}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}