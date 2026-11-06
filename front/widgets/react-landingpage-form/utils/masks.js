export function maskPhone(value) {
    const digits = value.replace(/\D/g, "").slice(0, 11);

    if (digits.length <= 2) return digits.replace(/^(\d{0,2})/, "($1");
    if (digits.length <= 6) return digits.replace(/^(\d{2})(\d{0,4})/, "($1) $2");
    if (digits.length <= 10) return digits.replace(/^(\d{2})(\d{4})(\d{0,4})/, "($1) $2-$3");
    return digits.replace(/^(\d{2})(\d{5})(\d{0,4})/, "($1) $2-$3");
}

export function onlyDigits(value) {
    return value.replace(/\D/g, "");
}

export function onlyLetters(value) {
    return value.replace(/[^A-Za-zÀ-ÖØ-öø-ÿ\s]/g, "");
}