export interface CompanyData {
  name: string
  cnpj: string
  address: string
  cityState: string
  phone: string
  email: string
}

export const defaultCompanyData: CompanyData = {
  name: "Sua Empresa de TI",
  cnpj: "00.000.000/0001-00",
  address: "Rua da Tecnologia, 123 - Centro",
  cityState: "Curitiba - PR",
  phone: "(41) 99999-9999",
  email: "contato@suaempresa.com",
}