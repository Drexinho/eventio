import { CreateEventForm } from '@/components/CreateEventForm'

export default function CreateEventPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Vytvořit novou událost</h1>
          <p className="text-muted-foreground">
            Vyplňte základní informace o vaší události
          </p>
        </div>
        
        <CreateEventForm />
      </div>
    </div>
  )
} 