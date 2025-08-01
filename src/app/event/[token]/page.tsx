'use client'

import { useEffect, useState } from 'react'
import { Event } from '@/types/database'
import { ParticipantsPanel } from '@/components/ParticipantsPanel'
import { TransportPanel } from '@/components/TransportPanel'
import { InventoryPanel } from '@/components/InventoryPanel'
import { AuditLog } from '@/components/AuditLog'
import { EditEventForm } from '@/components/EditEventForm'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface EventPageProps {
  params: Promise<{ token: string }>
}

export default function EventPage({ params }: EventPageProps) {
  const [event, setEvent] = useState<Event | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [eventToken, setEventToken] = useState<string>('')
  const [participantsCount, setParticipantsCount] = useState<number>(0)
  const [paymentStatus, setPaymentStatus] = useState<'paid' | 'unpaid'>(event?.payment_status || 'unpaid')
  const [wantedItems, setWantedItems] = useState<{id: string, name: string, note?: string}[]>([])
  const [newWantedItem, setNewWantedItem] = useState<string>('')
  const [showAssignModal, setShowAssignModal] = useState(false)
  const [selectedWantedItem, setSelectedWantedItem] = useState<string>('')
  const [selectedParticipant, setSelectedParticipant] = useState<string>('')
  const [participants, setParticipants] = useState<any[]>([])
  const [wantedItemNote, setWantedItemNote] = useState<string>('')
  const [inventoryNote, setInventoryNote] = useState<string>('')
  const [editingWantedItemIndex, setEditingWantedItemIndex] = useState<number | null>(null)
  const [editItemName, setEditItemName] = useState<string>('')
  const [editItemNote, setEditItemNote] = useState<string>('')
  const [isReadOnly, setIsReadOnly] = useState(true)
  const [showPinModal, setShowPinModal] = useState(false)
  const [pinInput, setPinInput] = useState('')
  const [pinError, setPinError] = useState('')
  const [pinAttempts, setPinAttempts] = useState(0)
  const [isPinValidating, setIsPinValidating] = useState(false)
  
  // Filtr pro zobrazování sekcí
  const [visibleSections, setVisibleSections] = useState({
    participants: true,
    transport: true,
    inventory: true,
    audit: false // Historie změn je skrytá podle požadavku
  })

  // Funkce pro načítání počtu účastníků
  const loadParticipantsCount = async (token: string) => {
    try {
      const response = await fetch(`/api/events/${token}/participants`)
      if (response.ok) {
        const participants = await response.json()
        setParticipantsCount(participants.length)
        setParticipants(participants)
      }
    } catch (error) {
      console.error('Chyba při načítání počtu účastníků:', error)
    }
  }

  // Funkce pro načítání WANTED položek
  const loadWantedItems = async (token: string) => {
    try {
      const response = await fetch(`/api/events/${token}/wanted`)
      if (response.ok) {
        const items = await response.json()
        setWantedItems(items)
      }
    } catch (error) {
      console.error('Chyba při načítání wanted položek:', error)
    }
  }

  useEffect(() => {
    const loadEvent = async () => {
      try {
        const { token } = await params
        setEventToken(token)
        
        const response = await fetch(`/api/events/${token}`)
        if (!response.ok) {
          throw new Error('Událost nebyla nalezena')
        }
        
        const eventData = await response.json()
        setEvent(eventData)
        setPaymentStatus(eventData.payment_status || 'unpaid')
        
        // Zobrazit PIN modal pokud má událost PIN kód
        if (eventData.pin_code) {
          setShowPinModal(true)
        } else {
          setIsReadOnly(false) // Pokud nemá PIN, povolit editaci
        }
        
        // Načíst počet účastníků
        await loadParticipantsCount(token)
        // Načíst WANTED položky
        await loadWantedItems(token)
        // Načíst účastníky pro modal
        const participantsResponse = await fetch(`/api/events/${token}/participants`)
        if (participantsResponse.ok) {
          const participantsData = await participantsResponse.json()
          setParticipants(participantsData)
        }
      } catch (error) {
        console.error('Chyba při načítání události:', error)
        alert('Nepodařilo se načíst událost')
      } finally {
        setIsLoading(false)
      }
    }

    loadEvent()
  }, [params])

  // Automatické aktualizování počtu účastníků
  useEffect(() => {
    if (!eventToken) return

    const interval = setInterval(async () => {
      await loadParticipantsCount(eventToken)
      // Také aktualizovat seznam účastníků pro modal
      try {
        const response = await fetch(`/api/events/${eventToken}/participants`)
        if (response.ok) {
          const participantsData = await response.json()
          setParticipants(participantsData)
        }
      } catch (error) {
        console.error('Chyba při načítání účastníků:', error)
      }
    }, 5000) // Kontrola každých 5 sekund

    return () => clearInterval(interval)
  }, [eventToken])

  const handleEditSuccess = () => {
    setIsEditing(false)
    // Znovu načíst událost
    const loadEvent = async () => {
      try {
        const response = await fetch(`/api/events/${eventToken}`)
        if (response.ok) {
          const eventData = await response.json()
          setEvent(eventData)
          setPaymentStatus(eventData.payment_status || 'unpaid')
        }
      } catch (error) {
        console.error('Chyba při načítání události:', error)
      }
    }
    loadEvent()
  }

  const toggleSection = (section: keyof typeof visibleSections) => {
    setVisibleSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }

  const showAll = () => {
    setVisibleSections({
      participants: true,
      transport: true,
      inventory: true,
      audit: false
    })
  }

  // Funkce pro přesun wanted item do inventáře
  const moveToInventory = async () => {
    if (!selectedWantedItem || !selectedParticipant) return

    try {
      const response = await fetch(`/api/events/${eventToken}/inventory`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: selectedWantedItem,
          quantity: 1,
          assigned_to: selectedParticipant,
          notes: `Přesunuto z WANTED${inventoryNote ? ` - ${inventoryNote}` : ''}`
        }),
      })

      if (response.ok) {
        // Odebrat z wanted items - najít položku podle jména a smazat ji
        const itemToRemove = wantedItems.find(item => item.name === selectedWantedItem)
        if (itemToRemove) {
          try {
            const deleteResponse = await fetch(`/api/events/${eventToken}/wanted?id=${itemToRemove.id}`, {
              method: 'DELETE',
            })
            if (deleteResponse.ok) {
              await loadWantedItems(eventToken)
            }
          } catch (error) {
            console.error('Chyba při mazání wanted položky:', error)
          }
        }
        setShowAssignModal(false)
        setSelectedWantedItem('')
        setSelectedParticipant('')
      }
    } catch (error) {
      console.error('Chyba při přesunu do inventáře:', error)
      alert('Nepodařilo se přesunout do inventáře')
    }
  }

  const handleHaveItem = async (itemId: string) => {
    const item = wantedItems.find(w => w.id === itemId)
    if (item) {
      setSelectedWantedItem(item.name)
      setShowAssignModal(true)
      
      // Načíst účastníky pro modal
      try {
        const response = await fetch(`/api/events/${eventToken}/participants`)
        if (response.ok) {
          const participantsData = await response.json()
          setParticipants(participantsData)
        }
      } catch (error) {
        console.error('Chyba při načítání účastníků:', error)
      }
    }
  }

  const handleEditItem = (index: number, item: {id: string, name: string, note?: string}) => {
    setEditingWantedItemIndex(index)
    setEditItemName(item.name)
    setEditItemNote(item.note || '')
  }

  const handleSaveEdit = async () => {
    if (editingWantedItemIndex === null || !editItemName.trim()) return

    const itemToEdit = wantedItems[editingWantedItemIndex]
    if (!itemToEdit) return

    try {
      const response = await fetch(`/api/events/${eventToken}/wanted`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: itemToEdit.id,
          name: editItemName.trim(),
          note: editItemNote.trim() || null
        }),
      })

      if (response.ok) {
        await loadWantedItems(eventToken)
      }
    } catch (error) {
      console.error('Chyba při aktualizaci wanted položky:', error)
    }
    
    setEditingWantedItemIndex(null)
    setEditItemName('')
    setEditItemNote('')
  }

  const handleCancelEdit = () => {
    setEditingWantedItemIndex(null)
    setEditItemName('')
    setEditItemNote('')
  }

  const handlePinSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!pinInput.trim()) {
      setPinError('Zadejte PIN')
      return
    }

    setIsPinValidating(true)
    setPinError('')

    try {
      const response = await fetch('/api/events/verify-pin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          pin: pinInput.trim(),
          eventToken: eventToken
        }),
      })

      if (response.ok) {
        setIsReadOnly(false)
        setShowPinModal(false)
        setPinInput('')
        setPinError('')
        setPinAttempts(0)
      } else {
        const errorData = await response.json()
        setPinAttempts(prev => prev + 1)
        
        if (pinAttempts >= 2) { // 3 pokusy (0, 1, 2)
          setPinError('Příliš mnoho neúspěšných pokusů. Můžete pokračovat v read-only režimu.')
          // Modal se nezavírá automaticky - uživatel si může vybrat
        } else {
          setPinError(errorData.message || 'Nesprávný PIN')
        }
      }
    } catch (error) {
      setPinError('Nepodařilo se ověřit PIN')
    } finally {
      setIsPinValidating(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-300 text-lg">Načítám událost...</p>
        </div>
      </div>
    )
  }

  if (!event) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 bg-red-900/20 border border-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">❌</span>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Událost nebyla nalezena</h2>
          <p className="text-slate-400">Zkontrolujte prosím odkaz nebo token události.</p>
        </div>
      </div>
    )
  }

  if (isEditing) {
    return (
      <div className="min-h-screen p-4">
        <div className="container mx-auto">
          <Button 
            variant="outline" 
            onClick={() => setIsEditing(false)}
            className="mb-6 bg-slate-900/50 border border-slate-700 text-slate-300 hover:bg-slate-800 transition-all duration-300"
          >
            ← Zpět na událost
          </Button>
          <EditEventForm 
            event={event} 
            eventToken={eventToken} 
            onSuccess={handleEditSuccess}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      {/* PIN Modal */}
      {showPinModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md border border-slate-800 bg-slate-900/50 backdrop-blur-sm shadow-2xl">
            <CardHeader className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full mb-4 shadow-xl">
                <span className="text-2xl">🔒</span>
              </div>
              <CardTitle className="text-2xl font-bold text-white">
                Přístup k editaci
              </CardTitle>
              <CardDescription className="text-slate-300">
                Zadejte PIN kód pro úpravu události
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePinSubmit} className="space-y-4">
                <div>
                  <label htmlFor="pin" className="block text-sm font-medium text-slate-300 mb-2">
                    PIN kód
                  </label>
                  <Input
                    id="pin"
                    type="password"
                    value={pinInput}
                    onChange={(e) => setPinInput(e.target.value)}
                    placeholder="Zadejte 4-místný PIN"
                    className="w-full bg-slate-800/50 border border-slate-600 text-slate-100 placeholder-slate-400 focus:border-cyan-400 focus:ring-cyan-400/20 focus:bg-slate-700/50 transition-all duration-300"
                    disabled={isPinValidating}
                    maxLength={4}
                  />
                </div>

                {pinError && (
                  <div className="text-red-400 text-sm text-center p-3 bg-red-900/20 border border-red-500/30 rounded-lg">
                    {pinError}
                  </div>
                )}

                <div className="space-y-4">
                  {/* Normální PIN formulář */}
                  <div className="flex gap-3">
                    <Button
                      type="submit"
                      disabled={isPinValidating || !pinInput.trim()}
                      className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white border-0 hover:shadow-lg transition-all duration-300"
                    >
                      {isPinValidating ? (
                        <div className="flex items-center">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                          Ověřuji...
                        </div>
                      ) : (
                        <>
                          <span className="mr-2">🔓</span>
                          Ověřit PIN
                        </>
                      )}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setShowPinModal(false)
                        setPinInput('')
                        setPinError('')
                        setPinAttempts(0)
                      }}
                      className="bg-slate-800/50 border border-slate-600 text-slate-300 hover:bg-gradient-to-r hover:from-slate-700/80 hover:to-slate-600/80 hover:border-slate-500 hover:text-slate-100 transition-all duration-300"
                    >
                      Zrušit
                    </Button>
                  </div>

                  {/* Tlačítko pro pokračování v read-only - dostupné vždy */}
                  <Button
                    type="button"
                    onClick={() => {
                      setShowPinModal(false)
                      setPinInput('')
                      setPinError('')
                      setPinAttempts(0)
                      setIsReadOnly(true) // Zůstane v read-only režimu
                    }}
                    className="w-full bg-gradient-to-r from-slate-500 to-slate-600 hover:from-slate-600 hover:to-slate-700 text-white border-0 hover:shadow-lg transition-all duration-300"
                  >
                    <span className="mr-2">👁️</span>
                    Pokračovat v read-only režimu
                  </Button>

                  <div className="text-center text-sm text-slate-400">
                    {3 - pinAttempts > 0 ? `Zbývající pokusy: ${3 - pinAttempts}` : 'Pokusy vypršely'}
                  </div>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="container mx-auto p-4">
        {/* Hero Card */}
        <Card className="mb-8 border border-slate-800 bg-slate-900/50 backdrop-blur-sm shadow-2xl">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent mb-2">
                  {event.name}
                </CardTitle>
                <CardDescription className="text-lg text-slate-300">
                  📅 {new Date(event.start_date).toLocaleDateString('cs-CZ')} - {new Date(event.end_date).toLocaleDateString('cs-CZ')}
                </CardDescription>
              </div>
              <div className="flex gap-3">
                {!isReadOnly ? (
                  <Button 
                    variant="outline" 
                    onClick={() => setIsEditing(true)}
                    className="bg-slate-800/50 border border-slate-600 text-slate-300 hover:bg-gradient-to-r hover:from-slate-700/80 hover:to-slate-600/80 hover:border-slate-500 hover:text-slate-100 transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
                  >
                    ✏️ Upravit
                  </Button>
                ) : (
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setShowPinModal(true)
                      setPinInput('')
                      setPinError('')
                      setPinAttempts(0)
                    }}
                    className="bg-slate-800/50 border border-slate-600 text-slate-300 hover:bg-gradient-to-r hover:from-slate-700/80 hover:to-slate-600/80 hover:border-slate-500 hover:text-slate-100 transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
                  >
                    🔓 Zadat PIN pro edit
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Levý sloupec - informace */}
              <div className="space-y-6 flex flex-col h-full">
                {event.description && (
                  <p className="text-slate-300 text-lg leading-relaxed">{event.description}</p>
                )}

                <div className="text-center p-4 bg-slate-800/50 border border-slate-700 rounded-2xl flex flex-col items-center justify-end mt-auto relative overflow-hidden">
                  <p className="text-sm text-slate-200 mb-1 relative z-10">Maximální počet účastníků</p>
                  <p className="text-2xl font-bold text-cyan-400 relative z-10">{event.max_participants}</p>
                  <p className="text-xs text-slate-300 mt-1 relative z-10">Aktuálně: {participantsCount}</p>
                  
                  {/* Fill effect */}
                  <div 
                    className="absolute bottom-0 left-0 right-0 bg-cyan-400/8 transition-all duration-1000 ease-out"
                    style={{ 
                      height: `${Math.min((participantsCount / event.max_participants) * 100, 100)}%`
                    }}
                  ></div>
                </div>
              </div>

              {/* Pravý sloupec - obrázek */}
              {event.image_url && (
                <div className="flex justify-center lg:justify-end">
                  <div className="w-full max-w-2xl flex flex-col h-full">
                    <div className="relative group">
                      <div className="w-full aspect-[16/12] rounded-2xl shadow-2xl overflow-hidden bg-slate-800/20">
                        <img 
                          src={event.image_url} 
                          alt={event.name}
                          className="w-full h-full object-cover group-hover:shadow-cyan-500/25 transition-all duration-500 transform group-hover:scale-105"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none'
                          }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      </div>
                    </div>
                    
                    {/* Pevná mezera pod obrázkem */}
                    <div className="h-8"></div>
                    
                    {/* Tlačítka a ceny od spodu */}
                    <div className="mt-auto space-y-6 mt-8">
                      {/* Tlačítka */}
                      <div className="flex flex-row gap-3">
                        {event.booking_link && (
                          <Button asChild variant="outline" className="flex-1 bg-slate-800/50 border border-slate-600 text-slate-300 hover:bg-gradient-to-r hover:from-slate-700/80 hover:to-slate-600/80 hover:border-slate-500 hover:text-slate-100 transition-all duration-300 transform hover:scale-105 hover:shadow-lg py-3">
                            <a href={event.booking_link} target="_blank" rel="noopener noreferrer">
                              🏰 Odkaz na ubytování
                            </a>
                          </Button>
                        )}
                        
                        {event.map_link && (
                          <Button asChild variant="outline" className="flex-1 bg-slate-800/50 border border-slate-600 text-slate-300 hover:bg-gradient-to-r hover:from-slate-700/80 hover:to-slate-600/80 hover:border-slate-500 hover:text-slate-100 transition-all duration-300 transform hover:scale-105 hover:shadow-lg py-3">
                            <a href={event.map_link} target="_blank" rel="noopener noreferrer">
                              🗺️ Lokace ubytování
                            </a>
                          </Button>
                        )}
                      </div>

                      {/* Ceny */}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="text-center p-4 bg-slate-800/50 border border-slate-700 rounded-2xl flex flex-col items-center justify-end">
                          <p className="text-sm text-slate-200 mb-1">Cena na jednoho při naplnění kapacity</p>
                          <p className="text-2xl font-bold text-purple-400">{Math.round(event.price / Math.max(event.max_participants, 1))} Kč</p>
                          <p className="text-sm text-slate-200 mt-1">Aktuálně: {participantsCount > 0 ? Math.round(event.price / participantsCount) : 0} Kč</p>
                        </div>
                        <div className="text-center p-4 bg-slate-800/50 border border-slate-700 rounded-2xl flex flex-col items-center justify-end">
                          <p className="text-sm text-slate-200 mb-1">Cena celkem</p>
                          <p className="text-2xl font-bold text-blue-400">{Math.round(event.price)} Kč</p>
                          <p className="text-sm text-slate-200 mt-1">
                            Stav: {paymentStatus === 'paid' ? 
                              <span className="text-green-400">✓ Zaplaceno</span> : 
                              <span className="text-red-400">✗ Nezaplaceno</span>
                            }
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* WANTED sekce */}
        <div className="mb-8">
          <Card className="border border-slate-800 bg-slate-900/50 backdrop-blur-sm shadow-2xl">
            <CardHeader className="pb-3">
              <CardTitle className="text-xl font-bold text-amber-400 flex items-center gap-2">
                🎯 WANTED
              </CardTitle>
              <CardDescription className="text-slate-300 text-sm">
                Co potřebujeme sehnat pro tuto událost
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
                           {/* Přidání nového itemu */}
             <div className="space-y-3 mb-4">
               {!isReadOnly && (
                 <div className="flex gap-3">
                   <Input
                     value={newWantedItem}
                     onChange={(e) => setNewWantedItem(e.target.value)}
                     placeholder="Napište co potřebujete sehnat..."
                     className="flex-1 bg-slate-800/50 border border-slate-600 text-slate-100 placeholder-slate-400 focus:border-cyan-400 focus:ring-cyan-400/20 focus:bg-slate-700/50 transition-all duration-300"
                     onKeyPress={async (e) => {
                       if (e.key === 'Enter' && newWantedItem.trim()) {
                         try {
                           const response = await fetch(`/api/events/${eventToken}/wanted`, {
                             method: 'POST',
                             headers: {
                               'Content-Type': 'application/json',
                             },
                             body: JSON.stringify({
                               name: newWantedItem.trim(),
                               note: wantedItemNote.trim() || null
                             }),
                           })

                           if (response.ok) {
                             await loadWantedItems(eventToken)
                             setNewWantedItem('')
                             setWantedItemNote('')
                           }
                         } catch (error) {
                           console.error('Chyba při přidávání wanted položky:', error)
                         }
                       }
                     }}
                   />
                   <Button
                     onClick={async () => {
                       if (newWantedItem.trim()) {
                         try {
                           const response = await fetch(`/api/events/${eventToken}/wanted`, {
                             method: 'POST',
                             headers: {
                               'Content-Type': 'application/json',
                             },
                             body: JSON.stringify({
                               name: newWantedItem.trim(),
                               note: wantedItemNote.trim() || null
                             }),
                           })

                           if (response.ok) {
                             await loadWantedItems(eventToken)
                             setNewWantedItem('')
                             setWantedItemNote('')
                           }
                         } catch (error) {
                           console.error('Chyba při přidávání wanted položky:', error)
                         }
                       }
                     }}
                     className="bg-gradient-to-r from-amber-600 to-orange-600 text-white border-0 hover:from-amber-700 hover:to-orange-700 transition-all duration-300 shadow-lg"
                   >
                     Přidat
                   </Button>
                 </div>
               )}
               {!isReadOnly && (
                 <Input
                   value={wantedItemNote}
                   onChange={(e) => setWantedItemNote(e.target.value)}
                   placeholder="Poznámka (volitelně)..."
                   className="w-full bg-slate-800/50 border border-slate-600 text-slate-100 placeholder-slate-400 focus:border-cyan-400 focus:ring-cyan-400/20 focus:bg-slate-700/50 transition-all duration-300"
                 />
               )}
             </div>

              {/* Seznam wanted items */}
              <div className="space-y-2">
                {wantedItems.map((item, index) => (
                  <div key={index} className="bg-slate-800/30 border border-slate-600 rounded-lg">
                    {editingWantedItemIndex === index ? (
                      // Edit mode
                      <div className="p-3 space-y-3">
                        <div>
                          <label className="block text-sm font-medium text-slate-300 mb-2">
                            Název položky:
                          </label>
                          <Input
                            value={editItemName}
                            onChange={(e) => setEditItemName(e.target.value)}
                            placeholder="Název položky..."
                            className="w-full bg-slate-700 border border-slate-600 text-slate-100 placeholder-slate-400 focus:border-cyan-400 focus:ring-cyan-400/20"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-300 mb-2">
                            Poznámka (volitelně):
                          </label>
                          <Input
                            value={editItemNote}
                            onChange={(e) => setEditItemNote(e.target.value)}
                            placeholder="Poznámka..."
                            className="w-full bg-slate-700 border border-slate-600 text-slate-100 placeholder-slate-400 focus:border-cyan-400 focus:ring-cyan-400/20"
                          />
                        </div>
                        <div className="flex gap-2">
                          <Button
                            onClick={handleSaveEdit}
                            disabled={!editItemName.trim()}
                            size="sm"
                            className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-600 text-white border-0 hover:from-blue-700 hover:to-cyan-700 transition-all duration-300"
                          >
                            Uložit
                          </Button>
                          <Button
                            onClick={handleCancelEdit}
                            variant="outline"
                            size="sm"
                            className="bg-slate-800/50 border border-slate-600 text-slate-300 hover:bg-gradient-to-r hover:from-slate-700/80 hover:to-slate-600/80 hover:border-slate-500 hover:text-slate-100 transition-all duration-300"
                          >
                            Zrušit
                          </Button>
                        </div>
                      </div>
                    ) : (
                      // View mode
                      <div className="flex items-center justify-between p-3">
                        <div className="flex-1">
                          <span className="text-slate-200">🎯 {item.name}</span>
                          {item.note && (
                            <div className="text-slate-400 text-sm mt-1">📝 {item.note}</div>
                          )}
                        </div>
                        {!isReadOnly && (
                          <div className="flex gap-2">
                            <Button
                              onClick={() => handleHaveItem(item.id)}
                              variant="outline"
                              size="sm"
                              className="bg-slate-800/50 border border-green-400 text-green-400 hover:bg-green-600/20 hover:text-green-300 transition-all duration-300"
                            >
                              ✓ Mám
                            </Button>
                            <Button
                              onClick={() => handleEditItem(index, item)}
                              variant="outline"
                              size="sm"
                              className="bg-slate-800/50 border border-blue-400 text-blue-400 hover:bg-blue-600/20 hover:text-blue-300 transition-all duration-300"
                            >
                              ✏️
                            </Button>
                            <Button
                              onClick={async () => {
                  try {
                    const response = await fetch(`/api/events/${eventToken}/wanted?id=${item.id}`, {
                      method: 'DELETE',
                    })

                    if (response.ok) {
                      await loadWantedItems(eventToken)
                    }
                  } catch (error) {
                    console.error('Chyba při mazání wanted položky:', error)
                  }
                }}
                              variant="outline"
                              size="sm"
                              className="bg-slate-800/50 border border-red-400 text-red-400 hover:bg-red-600/20 hover:text-red-300 transition-all duration-300"
                            >
                              ✕
                            </Button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
                {wantedItems.length === 0 && (
                  <div className="text-center py-4 text-slate-400 text-sm">
                    Zatím nejsou žádné položky na seznamu
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filtr sekcí */}
        <div className="mb-8">
          <div className="grid grid-cols-4 gap-3">
            <Button
              variant={visibleSections.participants && visibleSections.transport && visibleSections.inventory ? "default" : "outline"}
              size="sm"
              onClick={showAll}
              className={`w-full bg-slate-800/50 border border-slate-600 text-slate-300 hover:bg-gradient-to-r hover:from-slate-700/80 hover:to-slate-600/80 hover:border-slate-500 hover:text-slate-100 transition-all duration-300 transform hover:scale-105 hover:shadow-lg py-4 ${(visibleSections.participants && visibleSections.transport && visibleSections.inventory) ? 'border-b-4 border-cyan-400' : ''}`}
            >
              Všechno
            </Button>
            <Button
              variant={visibleSections.participants ? "default" : "outline"}
              size="sm"
              onClick={() => toggleSection('participants')}
              className={`w-full bg-slate-800/50 border border-slate-600 text-slate-300 hover:bg-gradient-to-r hover:from-slate-700/80 hover:to-slate-600/80 hover:border-slate-500 hover:text-slate-100 transition-all duration-300 transform hover:scale-105 hover:shadow-lg py-4 ${visibleSections.participants ? 'border-b-4 border-cyan-400' : ''}`}
            >
              👥 Účastníci
            </Button>
            <Button
              variant={visibleSections.transport ? "default" : "outline"}
              size="sm"
              onClick={() => toggleSection('transport')}
              className={`w-full bg-slate-800/50 border border-slate-600 text-slate-300 hover:bg-gradient-to-r hover:from-slate-700/80 hover:to-slate-600/80 hover:border-slate-500 hover:text-slate-100 transition-all duration-300 transform hover:scale-105 hover:shadow-lg py-4 ${visibleSections.transport ? 'border-b-4 border-cyan-400' : ''}`}
            >
              🚗 Doprava
            </Button>
            <Button
              variant={visibleSections.inventory ? "default" : "outline"}
              size="sm"
              onClick={() => toggleSection('inventory')}
              className={`w-full bg-slate-800/50 border border-slate-600 text-slate-300 hover:bg-gradient-to-r hover:from-slate-700/80 hover:to-slate-600/80 hover:border-slate-500 hover:text-slate-100 transition-all duration-300 transform hover:scale-105 hover:shadow-lg py-4 ${visibleSections.inventory ? 'border-b-4 border-cyan-400' : ''}`}
            >
              📦 Inventář
            </Button>
          </div>
        </div>

        {/* Sekce - zobrazují se podle filtru */}
        {(visibleSections.participants || visibleSections.transport || visibleSections.inventory) && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-8 items-start auto-rows-min [&>*:nth-child(odd)]:mb-0 [&>*:nth-child(even)]:mb-0 [&>*:nth-child(3)]:lg:col-start-1">
            {visibleSections.participants && (
              <div className="transform hover:scale-[1.01] transition-all duration-300">
                <ParticipantsPanel eventToken={eventToken} isReadOnly={isReadOnly} />
              </div>
            )}
            {visibleSections.transport && (
              <div className="transform hover:scale-[1.01] transition-all duration-300">
                <TransportPanel eventToken={eventToken} isReadOnly={isReadOnly} />
              </div>
            )}
            {visibleSections.inventory && (
              <div className="transform hover:scale-[1.01] transition-all duration-300">
                <InventoryPanel eventToken={eventToken} isReadOnly={isReadOnly} />
              </div>
            )}
          </div>
        )}

        {/* Zobrazení když není nic vybrané */}
        {!visibleSections.participants && !visibleSections.transport && !visibleSections.inventory && (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-slate-800 border border-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">🎯</span>
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Vyberte sekci</h3>
            <p className="text-slate-400">Vyberte alespoň jednu sekci pro zobrazení</p>
          </div>
        )}

        {/* Modal pro přiřazení účastníka */}
        {showAssignModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-slate-800 border border-slate-600 rounded-xl p-6 max-w-md w-full mx-4">
              <h3 className="text-xl font-bold text-white mb-4">
                Přiřadit "{selectedWantedItem}" účastníkovi
              </h3>
              
                              <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Vyberte účastníka:
                    </label>
                    <select
                      value={selectedParticipant}
                      onChange={(e) => setSelectedParticipant(e.target.value)}
                      className="w-full p-3 bg-slate-700 border border-slate-600 rounded-lg text-slate-100 focus:border-cyan-400 focus:ring-cyan-400/20"
                    >
                      <option value="">-- Vyberte účastníka --</option>
                      {participants.map((participant) => (
                        <option key={participant.id} value={participant.id}>
                          {participant.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Poznámka (volitelně):
                    </label>
                    <Input
                      value={inventoryNote}
                      onChange={(e) => setInventoryNote(e.target.value)}
                      placeholder="Přidat poznámku k položce..."
                      className="w-full bg-slate-700 border border-slate-600 text-slate-100 placeholder-slate-400 focus:border-cyan-400 focus:ring-cyan-400/20"
                    />
                  </div>

                  <div className="flex gap-3">
                    <Button
                      onClick={moveToInventory}
                      disabled={!selectedParticipant}
                      className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 text-white border-0 hover:from-green-700 hover:to-emerald-700 transition-all duration-300"
                    >
                      Přesunout do inventáře
                    </Button>
                    <Button
                      onClick={() => {
                        setShowAssignModal(false)
                        setSelectedWantedItem('')
                        setSelectedParticipant('')
                        setInventoryNote('')
                      }}
                      variant="outline"
                      className="bg-slate-800/50 border border-slate-600 text-slate-300 hover:bg-gradient-to-r hover:from-slate-700/80 hover:to-slate-600/80 hover:border-slate-500 hover:text-slate-100 transition-all duration-300"
                    >
                      Zrušit
                    </Button>
                  </div>
                </div>
            </div>
          </div>
        )}


      </div>
    </div>
  )
} 