export interface BankConfig {
  bankName: string
  accountHolder: string
  accountType: string
  accountNumber: string
  rut: string
  paymentEmail: string
}

export const bankConfig: BankConfig = {
  bankName: "Banco Santander",
  accountHolder: "Maria Jesus Chavez San Luis",
  accountType: "Cuenta Corriente",
  accountNumber: "0 000 93 30636 8",
  rut: "20.366.864-3",
  paymentEmail: "sanluismaria05@gmail.com",
}

