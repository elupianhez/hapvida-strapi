import React from "react";

export function useIsTabletOrMobile() {
    const [matches, setMatches] = React.useState(
        () => window.matchMedia("(max-width: 1280px)").matches
    );

    React.useEffect(() => {
        const mq = window.matchMedia("(max-width: 1280px)");
        const handler = (e) => setMatches(e.matches);
        mq.addEventListener("change", handler);
        return () => mq.removeEventListener("change", handler);
    }, []);

    return matches;
}

export function useIsMobile() {
    const [matches, setMatches] = React.useState(
        () => window.matchMedia("(max-width: 747px)").matches
    );

    React.useEffect(() => {
        const mq = window.matchMedia("(max-width: 747px)");
        const handler = (e) => setMatches(e.matches);
        mq.addEventListener("change", handler);
        return () => mq.removeEventListener("change", handler);
    }, []);

    return matches;
}
