import { Header } from '@/components/layout/Header'
import { NovaPageForm } from './_form'

export default function NovaPaginaPage() {
  return (
    <div className="flex flex-col flex-1 overflow-auto">
      <Header title="Nova página com IA" subtitle="Responda algumas perguntas e a IA cria sua landing page" />
      <NovaPageForm />
    </div>
  )
}
