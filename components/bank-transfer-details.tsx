"use client"

import { useState } from "react"
import { Copy, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { bankConfig } from "@/lib/bank-config"

interface BankTransferDetailsProps {
  amount?: string
}

export function BankTransferDetails({ amount }: BankTransferDetailsProps) {
  const [copiedField, setCopiedField] = useState<string | null>(null)

  const handleCopy = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedField(field)
      setTimeout(() => setCopiedField(null), 2000)
    } catch (error) {
      console.error("Error al copiar:", error)
    }
  }

  const CopyButton = ({ text, field }: { text: string; field: string }) => (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      onClick={() => handleCopy(text, field)}
      className="h-7 w-7 p-0 hover:bg-muted"
      aria-label={`Copiar ${field}`}
    >
      {copiedField === field ? (
        <Check className="h-3.5 w-3.5 text-green-600" />
      ) : (
        <Copy className="h-3.5 w-3.5" />
      )}
    </Button>
  )

  return (
    <div className="bg-muted/30 rounded-xl p-4 space-y-3 border border-border/50">
      <div className="flex items-center justify-between">
        <h3 className="font-medium text-foreground text-sm">Datos para transferencia bancaria</h3>
      </div>

      {amount && (
        <div className="bg-accent/10 border border-accent/20 rounded-lg p-3 text-center">
          <p className="text-xs text-muted-foreground mb-1">Monto a transferir</p>
          <p className="text-2xl font-bold text-foreground">${amount} CLP</p>
        </div>
      )}

      <div className="space-y-2.5 text-sm">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-muted-foreground">Banco:</span>
            <span className="ml-2 font-medium text-foreground">{bankConfig.bankName}</span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <span className="text-muted-foreground">Titular:</span>
            <span className="ml-2 font-medium text-foreground">{bankConfig.accountHolder}</span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <span className="text-muted-foreground">Tipo de cuenta:</span>
            <span className="ml-2 font-medium text-foreground">{bankConfig.accountType}</span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <span className="text-muted-foreground">Número de cuenta:</span>
            <span className="ml-2 font-medium text-foreground font-mono">{bankConfig.accountNumber}</span>
          </div>
          <CopyButton text={bankConfig.accountNumber} field="account" />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <span className="text-muted-foreground">RUT:</span>
            <span className="ml-2 font-medium text-foreground font-mono">{bankConfig.rut}</span>
          </div>
          <CopyButton text={bankConfig.rut} field="rut" />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <span className="text-muted-foreground">Email para comprobante:</span>
            <span className="ml-2 font-medium text-foreground break-all">{bankConfig.paymentEmail}</span>
          </div>
          <CopyButton text={bankConfig.paymentEmail} field="email" />
        </div>
      </div>
    </div>
  )
}

