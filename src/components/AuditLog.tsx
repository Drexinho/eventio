'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import type { AuditLog } from '@/types/database'

interface AuditLogProps {
  eventToken: string
}

export function AuditLog({ eventToken }: AuditLogProps) {
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [isLoading, setIsLoading] = useState(false)

  // Načtení audit logu
  const loadAuditLogs = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/events/${eventToken}/audit-logs`)
      if (!response.ok) {
        throw new Error('Nepodařilo se načíst audit logy')
      }
      const data = await response.json()
      setLogs(data)
    } catch (error) {
      console.error('Chyba při načítání audit logu:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadAuditLogs()
  }, [eventToken])

  // Formátování data
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('cs-CZ', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // Překlad akcí
  const translateAction = (action: string) => {
    const translations: Record<string, string> = {
      'INSERT': 'Přidáno',
      'UPDATE': 'Upraveno',
      'DELETE': 'Smazáno',
      'CREATE': 'Vytvořeno'
    }
    return translations[action] || action
  }

  // Překlad tabulek
  const translateTable = (table: string) => {
    const translations: Record<string, string> = {
      'events': 'Událost',
      'participants': 'Účastník',
      'transport': 'Doprava',
      'transport_assignments': 'Přiřazení dopravy',
      'inventory_items': 'Inventář'
    }
    return translations[table] || table
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>📋 Historie změn</CardTitle>
        <CardDescription>
          Přehled všech změn v události
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <p className="text-muted-foreground">Načítám historii...</p>
        ) : logs.length === 0 ? (
          <p className="text-muted-foreground">Zatím nejsou žádné změny</p>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {logs.map((log) => (
              <div
                key={log.id}
                className="flex items-start gap-3 p-3 border rounded-lg"
              >
                <div className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-sm">
                      {translateAction(log.action)}
                    </span>
                    <span className="text-muted-foreground text-sm">
                      {translateTable(log.table_name)}
                    </span>
                  </div>
                  
                  <p className="text-sm text-muted-foreground">
                    {formatDate(log.created_at)}
                  </p>
                  
                  {/* Zobrazení změn */}
                  {log.old_values && log.new_values && (
                    <div className="mt-2 text-xs">
                      {Object.keys(log.new_values).map((key) => {
                        const oldValue = log.old_values?.[key]
                        const newValue = log.new_values?.[key]
                        
                        if (oldValue !== newValue) {
                          return (
                            <div key={key} className="mb-1">
                              <span className="font-medium">{key}:</span>
                              <span className="text-red-500 line-through ml-1">
                                {String(oldValue)}
                              </span>
                              <span className="text-green-500 ml-1">
                                → {String(newValue)}
                              </span>
                            </div>
                          )
                        }
                        return null
                      })}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
} 