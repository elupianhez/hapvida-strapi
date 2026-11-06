import { STATES_CITIES } from "./statesCities";

export const STEPS = [
    {
        id: "name",
        label: "Para começarmos, pode nos dizer seu nome?",
        type: "text",
        placeholder: "*Nome do contato",
    },
    {
        id: "phone",
        label: "Seu melhor telefone",
        type: "tel",
        placeholder: "*(00) 00000-0000",
    },
    {
        id: "email",
        label: "Seu melhor e-mail",
        type: "email",
        placeholder: "*email@email.com.br",
    },
    {
        id: "planQuantityUsers",
        label: "Quantas pessoas, aproximadamente, irão usar o plano?",
        type: "text",
        placeholder: "*Digite quantas pessoas usarão o plano",
    },
    {
        id: "stateCity",
        label:
            "Informe o seu estado e a cidade onde deseja contratar os nossos serviços",
        type: "stateCity",
        states: Object.keys(STATES_CITIES),
    },
];