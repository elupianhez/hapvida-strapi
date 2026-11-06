import React, { useEffect, useRef, useState } from "react";

const ANIMATION_DURATION = 220;
const TRANSITION_GAP = 100;

function ChevronIcon({ open }) {
    return (
        <svg
            className={`accordion__icon${open ? " accordion__icon--open" : ""}`}
            width="16"
            height="10"
            viewBox="0 0 16 10"
            fill="none"
            aria-hidden="true"
        >
            <path d="M1 1.5L8 8.5L15 1.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
}

function AccordionPanel({ isOpen, panelId, triggerId, children, onCloseComplete }) {
    const ref = useRef(null);
    const [mounted, setMounted] = useState(isOpen);
    const skipCloseEffect = useRef(true);
    const skipOpenEffect = useRef(true);

    useEffect(() => {
        if (skipCloseEffect.current) {
            skipCloseEffect.current = false;
            return;
        }

        if (isOpen) {
            setMounted(true);
            return;
        }

        const el = ref.current;
        if (!el) {
            onCloseComplete?.();
            return;
        }

        const startHeight = el.scrollHeight;
        el.style.boxSizing = "border-box";
        el.style.overflow = "hidden";
        el.style.height = `${startHeight}px`;
        void el.offsetHeight;

        const animation = el.animate(
            [{ height: `${startHeight}px` }, { height: "0px" }],
            { duration: ANIMATION_DURATION, easing: "ease", fill: "forwards" }
        );
        animation.onfinish = () => {
            setMounted(false);
            onCloseComplete?.();
        };
    }, [isOpen]);

    useEffect(() => {
        if (skipOpenEffect.current) {
            skipOpenEffect.current = false;
            return;
        }

        if (!isOpen || !mounted) return;

        const el = ref.current;
        if (!el) return;

        const targetHeight = el.scrollHeight;
        el.style.boxSizing = "border-box";
        el.style.overflow = "hidden";
        el.style.height = "0px";
        void el.offsetHeight;

        const animation = el.animate(
            [{ height: "0px" }, { height: `${targetHeight}px` }],
            { duration: ANIMATION_DURATION, easing: "ease", fill: "forwards" }
        );
        animation.onfinish = () => {
            el.style.height = "auto";
            el.style.overflow = "";
            el.style.boxSizing = "";
        };
    }, [mounted]);

    if (!mounted) return null;

    return (
        <div
            ref={ref}
            id={panelId}
            role="region"
            aria-labelledby={triggerId}
            className="accordion__panel"
            tabIndex={0}
        >
            {children}
        </div>
    );
}

export default function Accordion({ items = [], getItemKey, renderTitle, renderContent, initialOpenKey = null }) {
    const [openKey, setOpenKey] = useState(initialOpenKey);
    const pendingKeyRef = useRef(null);

    const toggle = (key) => {
        if (key === openKey) {
            setOpenKey(null);
            return;
        }

        if (openKey === null && pendingKeyRef.current === null) {
            setOpenKey(key);
            return;
        }

        // Outra pergunta está aberta (ou já está fechando): guarda o alvo e
        // só abre depois que a atual terminar de fechar, evitando as duas
        // animações (fechar + abrir) rodando ao mesmo tempo.
        pendingKeyRef.current = key;
        if (openKey !== null) {
            setOpenKey(null);
        }
    };

    const handleCloseComplete = () => {
        if (pendingKeyRef.current === null) return;

        // Pequena pausa entre o fim do fechamento e o começo da abertura,
        // pra não parecer que as duas animações estão se encostando/sobrepondo.
        setTimeout(() => {
            const next = pendingKeyRef.current;
            pendingKeyRef.current = null;
            if (next !== null) {
                setOpenKey(next);
            }
        }, TRANSITION_GAP);
    };

    return (
        <div className="accordion">
            {items.map((item, index) => {
                const key = getItemKey ? getItemKey(item, index) : index;
                const isOpen = openKey === key;
                const panelId = `accordion-panel-${key}`;
                const triggerId = `accordion-trigger-${key}`;

                return (
                    <div className={`accordion__item${isOpen ? " accordion__item--open" : ""}`} key={key}>
                        <div className="accordion__header">
                            <button
                                type="button"
                                id={triggerId}
                                className="accordion__trigger"
                                aria-expanded={isOpen}
                                aria-controls={panelId}
                                onClick={() => toggle(key)}
                            >
                                <h3 className="accordion__title">{renderTitle(item, index)}</h3>
                                <ChevronIcon open={isOpen} />
                            </button>
                        </div>
                        <AccordionPanel
                            isOpen={isOpen}
                            panelId={panelId}
                            triggerId={triggerId}
                            onCloseComplete={handleCloseComplete}
                        >
                            {renderContent(item, index)}
                        </AccordionPanel>
                    </div>
                );
            })}
        </div>
    );
}
