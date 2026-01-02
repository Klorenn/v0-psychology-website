"use client"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
// Usar div con overflow en lugar de ScrollArea si no existe

interface TermsAndConditionsProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function TermsAndConditions({ open, onOpenChange }: TermsAndConditionsProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] bg-background border-border/50">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl">Términos y Condiciones</DialogTitle>
          <DialogDescription>
            Por favor, lea cuidadosamente los siguientes términos y condiciones
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-[60vh] overflow-y-auto pr-4">
          <div className="space-y-6 text-sm text-foreground">
            <section>
              <h3 className="font-semibold text-base mb-2">1. Confidencialidad y Privacidad</h3>
              <p className="text-muted-foreground mb-3">
                Toda la información compartida durante las sesiones de terapia es estrictamente confidencial. 
                Me Compromento a proteger su privacidad y mantener la confidencialidad de acuerdo con 
                las leyes y códigos éticos profesionales vigentes.
              </p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-2">
                <li>La información personal y clínica será utilizada únicamente para fines terapéuticos.</li>
                <li>No comparto su información con terceros sin su consentimiento explícito, excepto en casos legales requeridos.</li>
                <li>Los registros de sesiones se mantendrán de forma segura y confidencial.</li>
              </ul>
            </section>

            <section>
              <h3 className="font-semibold text-base mb-2">2. Reserva y Cancelación</h3>
              <p className="text-muted-foreground mb-3">
                Al realizar una reserva, usted acepta los siguientes términos:
              </p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-2">
                <li>La reserva se confirma únicamente después de recibir el comprobante de pago por correo electrónico.</li>
                <li>El pago debe realizarse antes de la confirmación de la cita.</li>
                <li>Las cancelaciones deben realizarse con al menos 24 horas de anticipación para poder reagendar.</li>
                <li>Las cancelaciones con menos de 24 horas de anticipación no son reembolsables.</li>
              </ul>
            </section>

            <section>
              <h3 className="font-semibold text-base mb-2">3. Modalidad de Sesiones</h3>
              <p className="text-muted-foreground mb-3">
                Ofrecemos sesiones online y presenciales:
              </p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-2">
                <li><strong>Sesiones Online:</strong> Se realizan mediante videollamada. Es responsabilidad del paciente asegurar una conexión estable y un espacio privado.</li>
                <li><strong>Sesiones Presenciales:</strong> Se realizan en el consultorio. El paciente debe llegar puntualmente.</li>
                <li>La modalidad seleccionada no puede cambiarse una vez confirmada la cita.</li>
              </ul>
            </section>

            <section>
              <h3 className="font-semibold text-base mb-2">4. Pago y Reembolsos</h3>
              <p className="text-muted-foreground mb-3">
                El pago de las sesiones se realiza mediante transferencia bancaria:
              </p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-2">
                <li>El monto debe transferirse antes de la confirmación de la cita.</li>
                <li>El comprobante de transferencia debe enviarse por correo electrónico.</li>
                <li><strong>Política de Devoluciones:</strong> En caso de solicitar la devolución del dinero después de haber realizado el pago, solo se devolverá el 50% del monto pagado. Esto se debe a que se reserva el tiempo de la psicóloga y se arrienda un espacio físico para la atención, recursos que no pueden ser recuperados.</li>
                <li>Los reembolsos solo se aplican en casos excepcionales y a consideración del terapeuta.</li>
                <li>No se realizan reembolsos por sesiones ya confirmadas y no asistidas.</li>
              </ul>
            </section>

            <section>
              <h3 className="font-semibold text-base mb-2">5. Responsabilidades del Paciente</h3>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-2">
                <li>Proporcionar información veraz y completa sobre su situación.</li>
                <li>Asistir puntualmente a las sesiones programadas.</li>
                <li>Notificar con anticipación cualquier cambio o cancelación.</li>
                <li>Respetar el espacio terapéutico y mantener un ambiente de respeto mutuo.</li>
                <li>En sesiones online, asegurar un espacio privado y sin interrupciones.</li>
              </ul>
            </section>

            <section>
              <h3 className="font-semibold text-base mb-2">6. Limitaciones de la Terapia</h3>
              <p className="text-muted-foreground mb-3">
                Es importante entender que:
              </p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-2">
                <li>La terapia es un proceso que requiere tiempo y compromiso.</li>
                <li>Los resultados pueden variar según cada individuo.</li>
                <li>En casos de emergencia o crisis, debe contactar servicios de emergencia (131, 132, etc.).</li>
                <li>La terapia no sustituye atención médica cuando es necesaria.</li>
              </ul>
            </section>

            <section>
              <h3 className="font-semibold text-base mb-2">7. Protección de Datos</h3>
              <p className="text-muted-foreground mb-3">
                De acuerdo con la Ley de Protección de Datos Personales:
              </p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-2">
                <li>Sus datos personales serán tratados con la máxima confidencialidad.</li>
                <li>Tiene derecho a acceder, rectificar y eliminar sus datos personales.</li>
                <li>Sus datos se utilizarán únicamente para fines terapéuticos y administrativos necesarios.</li>
                <li>No compartiremos su información con fines comerciales o de marketing.</li>
              </ul>
            </section>

            <section>
              <h3 className="font-semibold text-base mb-2">8. Aceptación de Términos</h3>
              <p className="text-muted-foreground">
                Al marcar la casilla de aceptación, usted confirma que ha leído, entendido y acepta 
                todos los términos y condiciones aquí establecidos. Si no está de acuerdo con alguno 
                de estos términos, le recomendamos no proceder con la reserva.
              </p>
            </section>

            <div className="pt-4 border-t border-border/50">
              <p className="text-xs text-muted-foreground">
                Última actualización: {new Date().toLocaleDateString('es-CL', { year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

