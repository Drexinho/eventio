'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Users, Car, Package, Search, Plus, Edit, Trash, Check, X } from 'lucide-react'

// Demo data - statická data, která se po refreshi vrátí k původnímu stavu
const DEMO_EVENT = {
  id: 'demo-event-id',
  name: 'Demo událost - jedeme na hory',
  description: 'Týdenní pobyt v horách s lyžováním, sáňkováním a večerním programem. Ubytování v chatě s plnou penzí, doprava autobusem z Prahy. Vhodné pro rodiny s dětmi i skupiny přátel.',
  start_date: '2025-02-15T00:00:00.000Z',
  end_date: '2025-02-22T00:00:00.000Z',
  max_participants: 8,
  price: '8500.00',
  access_token: 'THwjrZbQiPZrAXwfkaah',
  map_link: 'https://maps.app.goo.gl/example',
  booking_link: 'https://www.booking.com/example',
  image_url: 'https://images.unsplash.com/photo-1551632811-561732d1e306?w=800&h=600&fit=crop',
  payment_status: 'paid',
  pin_code: '1234'
}

const DEMO_PARTICIPANTS = [
  { id: '1', name: 'Jan Novák', note: 'Alergie na ořechy', stays_full_time: true },
  { id: '2', name: 'Marie Svobodová', note: 'Vegetarián', stays_full_time: true },
  { id: '3', name: 'Petr Černý', note: 'Vlastní lyže', stays_full_time: false },
  { id: '4', name: 'Anna Veselá', note: 'Dítě 8 let', stays_full_time: true },
  { id: '5', name: 'Tomáš Malý', note: 'Bezlepková dieta', stays_full_time: true },
  { id: '6', name: 'Lucie Krásná', note: 'Vlastní sáňky', stays_full_time: true },
  { id: '7', name: 'David Velký', note: 'Kouří', stays_full_time: false }
]

const DEMO_TRANSPORT = [
  {
    id: '1',
    type: 'Autobus',
    departure_location: 'Praha, Hlavní nádraží',
    departure_time: '2025-02-15T08:00:00.000Z',
    arrival_location: 'Horská chata',
    capacity: 8,
    price: '1200.00',
    notes: 'Odjezd v 8:00, příjezd cca 12:00',
    transport_assignments: [
      { participant_id: '1' },
      { participant_id: '2' },
      { participant_id: '4' },
      { participant_id: '5' },
      { participant_id: '6' }
    ]
  },
  {
    id: '2',
    type: 'Vlastní doprava',
    departure_location: 'Praha',
    departure_time: '2025-02-15T09:00:00.000Z',
    arrival_location: 'Horská chata',
    capacity: 4,
    price: '0.00',
    notes: 'Sraz na parkovišti u chaty',
    transport_assignments: [
      { participant_id: '3' },
      { participant_id: '7' }
    ]
  }
]

const DEMO_INVENTORY = [
  {
    id: '1',
    name: 'Lyže',
    quantity: 6,
    assigned_participant_name: 'Jan Novák',
    note: 'Dětské lyže k zapůjčení'
  },
  {
    id: '2',
    name: 'Sáňky',
    quantity: 4,
    assigned_participant_name: 'Anna Veselá',
    note: 'Plastové sáňky pro děti'
  },
  {
    id: '3',
    name: 'Hůlky',
    quantity: 8,
    assigned_participant_name: null,
    note: 'Lyžařské hůlky'
  }
]

const DEMO_WANTED = [
  {
    id: '1',
    name: 'Termoska',
    note: 'Pro horké nápoje na sjezdovku'
  },
  {
    id: '2',
    name: 'Čepice',
    note: 'Teplá čepice pro děti'
  },
  {
    id: '3',
    name: 'Rukavice',
    note: 'Lyžařské rukavice'
  }
]

export default function DemoPage() {
  // Lokální state - všechny změny se vrátí po refreshi
  const [event] = useState(DEMO_EVENT)
  const [participants, setParticipants] = useState(DEMO_PARTICIPANTS)
  const [transport, setTransport] = useState(DEMO_TRANSPORT)
  const [inventory, setInventory] = useState(DEMO_INVENTORY)
  const [wantedItems, setWantedItems] = useState(DEMO_WANTED)
  
  const [visibleSections, setVisibleSections] = useState({
    participants: true,
    transport: true,
    inventory: true
  })

  const [isEditing, setIsEditing] = useState(false)
  const [newParticipant, setNewParticipant] = useState({ name: '', note: '', stays_full_time: true })
  const [newTransport, setNewTransport] = useState({
    type: '', departure_location: '', departure_time: '', arrival_location: '', capacity: '', price: '', notes: ''
  })
  const [newInventory, setNewInventory] = useState({ name: '', quantity: '', note: '' })
  const [newWantedItem, setNewWantedItem] = useState({ name: '', note: '' })

  const participantsCount = participants.length
  const totalPrice = parseFloat(event.price)
  const pricePerPerson = participantsCount > 0 ? Math.round(totalPrice / participantsCount) : 0

  const handleAddParticipant = () => {
    if (newParticipant.name.trim()) {
      setParticipants([...participants, { 
        id: Date.now().toString(), 
        ...newParticipant 
      }])
      setNewParticipant({ name: '', note: '', stays_full_time: true })
    }
  }

  const handleAddTransport = () => {
    if (newTransport.type.trim() && newTransport.departure_location.trim()) {
      setTransport([...transport, { 
        id: Date.now().toString(), 
        ...newTransport,
        capacity: parseInt(newTransport.capacity) || 0,
        transport_assignments: []
      }])
      setNewTransport({
        type: '', departure_location: '', departure_time: '', arrival_location: '', capacity: '', price: '', notes: ''
      })
    }
  }

  const handleAddInventory = () => {
    if (newInventory.name.trim()) {
      setInventory([...inventory, { 
        id: Date.now().toString(), 
        ...newInventory,
        quantity: parseInt(newInventory.quantity) || 0,
        assigned_participant_name: null
      }])
      setNewInventory({ name: '', quantity: '', note: '' })
    }
  }

  const handleAddWantedItem = () => {
    if (newWantedItem.name.trim()) {
      setWantedItems([...wantedItems, { 
        id: Date.now().toString(), 
        ...newWantedItem
      }])
      setNewWantedItem({ name: '', note: '' })
    }
  }

  const handleDeleteParticipant = (id: string) => {
    setParticipants(participants.filter(p => p.id !== id))
  }

  const handleDeleteTransport = (id: string) => {
    setTransport(transport.filter(t => t.id !== id))
  }

  const handleDeleteInventory = (id: string) => {
    setInventory(inventory.filter(i => i.id !== id))
  }

  const handleDeleteWantedItem = (id: string) => {
    setWantedItems(wantedItems.filter(w => w.id !== id))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{event.name}</h1>
              <p className="text-gray-600 mt-2">{event.description}</p>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500">Demo režim</div>
              <div className="text-xs text-gray-400">Změny se po refreshi vrátí k původnímu stavu</div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <div className="bg-blue-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">{participantsCount}</div>
              <div className="text-sm text-blue-800">Účastníků</div>
              <div className="text-xs text-blue-600">z {event.max_participants}</div>
            </div>
            <div className="bg-green-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-green-600">{pricePerPerson} Kč</div>
              <div className="text-sm text-green-800">Na jednoho</div>
              <div className="text-xs text-green-600">Aktuálně</div>
            </div>
            <div className="bg-purple-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-purple-600">{Math.round(totalPrice)} Kč</div>
              <div className="text-sm text-purple-800">Cena celkem</div>
              <div className="text-xs text-purple-600">Stav: {event.payment_status === 'paid' ? 'Zaplaceno' : 'Nezaplaceno'}</div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex flex-wrap gap-2 mb-6">
          <Button
            variant={visibleSections.participants ? "default" : "outline"}
            onClick={() => setVisibleSections({...visibleSections, participants: !visibleSections.participants})}
            className="flex items-center gap-2"
          >
            <Users className="w-4 h-4" />
            Účastníci ({participantsCount})
          </Button>
          <Button
            variant={visibleSections.transport ? "default" : "outline"}
            onClick={() => setVisibleSections({...visibleSections, transport: !visibleSections.transport})}
            className="flex items-center gap-2"
          >
            <Car className="w-4 h-4" />
            Doprava ({transport.length})
          </Button>
          <Button
            variant={visibleSections.inventory ? "default" : "outline"}
            onClick={() => setVisibleSections({...visibleSections, inventory: !visibleSections.inventory})}
            className="flex items-center gap-2"
          >
            <Package className="w-4 h-4" />
            Inventář ({inventory.length})
          </Button>
        </div>

        {/* WANTED Section */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="w-5 h-5" />
              WANTED - Potřebujeme sehnat
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {wantedItems.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                  <div className="flex-1">
                    <div className="font-medium text-yellow-800">{item.name}</div>
                    {item.note && <div className="text-sm text-yellow-600">{item.note}</div>}
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="text-green-600 border-green-600 hover:bg-green-50">
                      <Check className="w-4 h-4 mr-1" />
                      Mám
                    </Button>
                    <Button size="sm" variant="outline" className="text-blue-600 border-blue-600 hover:bg-blue-50">
                      <Edit className="w-4 h-4 mr-1" />
                      Edit
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="text-red-600 border-red-600 hover:bg-red-50"
                      onClick={() => handleDeleteWantedItem(item.id)}
                    >
                      <X className="w-4 h-4 mr-1" />
                      Zrušit
                    </Button>
                  </div>
                </div>
              ))}
              
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="Název předmětu"
                    value={newWantedItem.name}
                    onChange={(e) => setNewWantedItem({...newWantedItem, name: e.target.value})}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddWantedItem()}
                  />
                  <Input
                    placeholder="Poznámka (volitelně)"
                    value={newWantedItem.note}
                    onChange={(e) => setNewWantedItem({...newWantedItem, note: e.target.value})}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddWantedItem()}
                  />
                  <Button onClick={handleAddWantedItem} className="flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    Přidat
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Participants */}
          {visibleSections.participants && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Účastníci
                  </span>
                  <Button size="sm" onClick={() => setIsEditing(!isEditing)}>
                    {isEditing ? 'Uložit' : 'Upravit'}
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {participants.map((participant) => (
                  <div key={participant.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <div className="font-medium">{participant.name}</div>
                      {participant.note && <div className="text-sm text-gray-600">{participant.note}</div>}
                      <div className="text-xs text-gray-500">
                        {participant.stays_full_time ? 'Zůstává celý čas' : 'Částečná účast'}
                      </div>
                    </div>
                    {isEditing && (
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="text-red-600 border-red-600 hover:bg-red-50"
                        onClick={() => handleDeleteParticipant(participant.id)}
                      >
                        <Trash className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ))}
                
                {isEditing && (
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                    <div className="space-y-3">
                      <Input
                        placeholder="Jméno účastníka"
                        value={newParticipant.name}
                        onChange={(e) => setNewParticipant({...newParticipant, name: e.target.value})}
                      />
                      <Input
                        placeholder="Poznámka (volitelně)"
                        value={newParticipant.note}
                        onChange={(e) => setNewParticipant({...newParticipant, note: e.target.value})}
                      />
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id="stays_full_time"
                          checked={newParticipant.stays_full_time}
                          onChange={(e) => setNewParticipant({...newParticipant, stays_full_time: e.target.checked})}
                        />
                        <Label htmlFor="stays_full_time">Zůstává celý čas</Label>
                      </div>
                      <Button onClick={handleAddParticipant} className="w-full">
                        <Plus className="w-4 h-4 mr-2" />
                        Přidat účastníka
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Transport */}
          {visibleSections.transport && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Car className="w-5 h-5" />
                    Doprava
                  </span>
                  <Button size="sm" onClick={() => setIsEditing(!isEditing)}>
                    {isEditing ? 'Uložit' : 'Upravit'}
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {transport.map((item) => (
                  <div key={item.id} className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-center justify-between mb-2">
                      <div className="font-medium text-blue-800">{item.type}</div>
                      <div className="text-sm text-blue-600">{item.price === '0.00' ? 'Zdarma' : `${item.price} Kč`}</div>
                    </div>
                    <div className="text-sm text-blue-700">
                      <div>Odjezd: {item.departure_location} - {new Date(item.departure_time).toLocaleString()}</div>
                      <div>Příjezd: {item.arrival_location}</div>
                      <div>Kapacita: {item.transport_assignments.length}/{item.capacity}</div>
                    </div>
                    {item.notes && <div className="text-xs text-blue-600 mt-1">{item.notes}</div>}
                    {isEditing && (
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="text-red-600 border-red-600 hover:bg-red-50 mt-2"
                        onClick={() => handleDeleteTransport(item.id)}
                      >
                        <Trash className="w-4 h-4 mr-1" />
                        Smazat
                      </Button>
                    )}
                  </div>
                ))}
                
                {isEditing && (
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                    <div className="space-y-3">
                      <Input
                        placeholder="Typ dopravy"
                        value={newTransport.type}
                        onChange={(e) => setNewTransport({...newTransport, type: e.target.value})}
                      />
                      <Input
                        placeholder="Místo odjezdu"
                        value={newTransport.departure_location}
                        onChange={(e) => setNewTransport({...newTransport, departure_location: e.target.value})}
                      />
                      <Input
                        placeholder="Místo příjezdu"
                        value={newTransport.arrival_location}
                        onChange={(e) => setNewTransport({...newTransport, arrival_location: e.target.value})}
                      />
                      <div className="grid grid-cols-2 gap-2">
                        <Input
                          placeholder="Kapacita"
                          type="number"
                          value={newTransport.capacity}
                          onChange={(e) => setNewTransport({...newTransport, capacity: e.target.value})}
                        />
                        <Input
                          placeholder="Cena"
                          type="number"
                          value={newTransport.price}
                          onChange={(e) => setNewTransport({...newTransport, price: e.target.value})}
                        />
                      </div>
                      <Button onClick={handleAddTransport} className="w-full">
                        <Plus className="w-4 h-4 mr-2" />
                        Přidat dopravu
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Inventory */}
          {visibleSections.inventory && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Package className="w-5 h-5" />
                    Inventář
                  </span>
                  <Button size="sm" onClick={() => setIsEditing(!isEditing)}>
                    {isEditing ? 'Uložit' : 'Upravit'}
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {inventory.map((item) => (
                  <div key={item.id} className="p-3 bg-green-50 rounded-lg border border-green-200">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="font-medium text-green-800">{item.name}</div>
                        <div className="text-sm text-green-700">Množství: {item.quantity}</div>
                        {item.assigned_participant_name && (
                          <div className="text-xs text-green-600">Přiřazeno: {item.assigned_participant_name}</div>
                        )}
                        {item.note && <div className="text-xs text-green-600">{item.note}</div>}
                      </div>
                      {isEditing && (
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="text-red-600 border-red-600 hover:bg-red-50"
                          onClick={() => handleDeleteInventory(item.id)}
                        >
                          <Trash className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
                
                {isEditing && (
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                    <div className="space-y-3">
                      <Input
                        placeholder="Název položky"
                        value={newInventory.name}
                        onChange={(e) => setNewInventory({...newInventory, name: e.target.value})}
                      />
                      <div className="grid grid-cols-2 gap-2">
                        <Input
                          placeholder="Množství"
                          type="number"
                          value={newInventory.quantity}
                          onChange={(e) => setNewInventory({...newInventory, quantity: e.target.value})}
                        />
                        <Input
                          placeholder="Poznámka"
                          value={newInventory.note}
                          onChange={(e) => setNewInventory({...newInventory, note: e.target.value})}
                        />
                      </div>
                      <Button onClick={handleAddInventory} className="w-full">
                        <Plus className="w-4 h-4 mr-2" />
                        Přidat položku
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Demo Info */}
        <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h3 className="font-semibold text-yellow-800 mb-2">Demo režim</h3>
          <p className="text-yellow-700 text-sm">
            Toto je demo verze aplikace. Všechny změny jsou pouze lokální a po obnovení stránky se vrátí k původnímu stavu. 
            Můžete vyzkoušet všechny funkce včetně přidávání, editace a mazání položek.
          </p>
        </div>
      </div>
    </div>
  )
} 