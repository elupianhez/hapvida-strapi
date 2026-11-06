/**
 * Simula as APIs core da operadora (cadastro, contrato, agendamentos).
 * Identidade vem do Keycloak; dados de negócio vêm daqui (em produção, via BFF/API gateway).
 * Todos os dados são fictícios.
 */
export type Beneficiario = {
  carteirinha: string
  plano: string
  acomodacao: string
  validade: string
  proximaConsulta?: { especialidade: string; data: string; local: string }
}

const base: Record<string, Beneficiario> = {
  'maria@hapvida.poc': {
    carteirinha: '0000 0000 1234 5678',
    plano: 'Plano Essencial (fictício)',
    acomodacao: 'Enfermaria',
    validade: '12/2027',
    proximaConsulta: { especialidade: 'Clínica geral', data: '05/11 às 09:30', local: 'Teleconsulta' },
  },
}

export const buscarBeneficiario = async (email: string): Promise<Beneficiario> =>
  base[email] || {
    carteirinha: '0000 0000 0000 0001',
    plano: 'Plano Completo (fictício)',
    acomodacao: 'Apartamento',
    validade: '06/2028',
  }
