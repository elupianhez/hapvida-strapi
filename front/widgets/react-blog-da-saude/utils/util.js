import React from 'react';

export function useIsTabletOrMobile() {
    const [matches, setMatches] = React.useState(
        () => window.matchMedia('(max-width: 1280px)').matches
    );

    React.useEffect(() => {
        const mq = window.matchMedia('(max-width: 1280px)');
        const handler = (e) => setMatches(e.matches);
        mq.addEventListener('change', handler);
        return () => mq.removeEventListener('change', handler);
    }, []);

    return matches;
}

export function formatDate(date) {
    if (!date) return '';

    const dateObj = new Date(date);

    if (isNaN(dateObj.getTime())) return '';

    return dateObj.toLocaleDateString('pt-BR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });
}
