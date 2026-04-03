import { Header } from '@/components/layout/Header'
import { CreationPicker } from './_picker'

export default function NovaPaginaPage() {
  return (
    <div className="flex flex-col flex-1 overflow-auto">
      <Header title="Nova página" subtitle="Escolha como deseja criar sua landing page" />
      <CreationPicker />
    </div>
  )
}
