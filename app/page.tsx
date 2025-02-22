"use client"

import type React from "react"

import { useState, useMemo, useEffect, useRef } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { invitees, type Invitee } from "../data/invitees"

interface Table {
  id: number | string
  shape: "circle" | "square"
  guests: Invitee[]
  capacity: number
}

const initialTables: Table[] = [
    { id: 1, shape: "square", guests: [], capacity:8},
    { id: 2, shape: "square", guests: [], capacity:10},
    { id: 3, shape: "circle", guests: [], capacity:8},
    { id: 4, shape: "square", guests: [], capacity:8},
    { id: 5, shape: "circle", guests: [], capacity:8},
    { id: 6, shape: "square", guests: [], capacity:10},
    { id: 7, shape: "circle", guests: [], capacity:10},
    { id: 8, shape: "square", guests: [], capacity:8},
    { id: 9, shape: "circle", guests: [], capacity:10},
    { id: 10, shape: "square", guests: [], capacity:8},
    { id: 11, shape: "circle", guests: [], capacity:8},
    { id: 12, shape: "circle", guests: [], capacity:8},
    { id: 13, shape: "square", guests: [], capacity:10},
    { id: 14, shape: "circle", guests: [], capacity:10},
    { id: 15, shape: "square", guests: [], capacity:8},
    { id: 16, shape: "circle", guests: [], capacity:10},
    { id: 17, shape: "square", guests: [], capacity:8},
    { id: 18, shape: "square", guests: [], capacity:8},
    { id: 19, shape: "square", guests: [], capacity:10},
    { id: 20, shape: "circle", guests: [], capacity:8},
    { id: 21, shape: "square", guests: [], capacity:8},
    { id: 22, shape: "circle", guests: [], capacity:8},
    { id: 'Novixs', shape: "circle", guests: [], capacity:10},
  ]

  const saveToLocalStorage = (tables: Table[], unallocatedInvitees: Invitee[]) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("seatingChartTables", JSON.stringify(tables))
      localStorage.setItem("seatingChartUnallocated", JSON.stringify(unallocatedInvitees))
    }
  }
  
  const loadFromLocalStorage = (): { tables: Table[]; unallocatedInvitees: Invitee[] } | null => {
    if (typeof window === "undefined") return null
  
    const tablesJson = localStorage.getItem("seatingChartTables")
    const unallocatedJson = localStorage.getItem("seatingChartUnallocated")
  
    if (tablesJson && unallocatedJson) {
      return {
        tables: JSON.parse(tablesJson),
        unallocatedInvitees: JSON.parse(unallocatedJson),
      }
    }
  
    return null
  }
  
  export default function SeatingChart() {
    const [tables, setTables] = useState<Table[]>(initialTables)
    const [unallocatedInvitees, setUnallocatedInvitees] = useState<Invitee[]>(invitees)
    const [selectedTable, setSelectedTable] = useState<Table | null>(null)
    const [searchQuery, setSearchQuery] = useState("")
    const [tableSearchQuery, setTableSearchQuery] = useState("")
    
    const fileInputRef = useRef<HTMLInputElement>(null)
  
    useEffect(() => {
      const savedData = loadFromLocalStorage()
      if (savedData) {
        setTables(savedData.tables)
        setUnallocatedInvitees(savedData.unallocatedInvitees)
      }
    }, [])

const allocateInvitee = (invitee: Invitee, tableId: number | string) => {
  const newTables = tables.map((table) =>
  table.id === tableId && table.guests.length < table.capacity
    ? { ...table, guests: [...table.guests, invitee] }
    : table,
    )
    const newUnallocatedInvitees = unallocatedInvitees.filter((i) => i.id !== invitee.id)

    setTables(newTables)
    setUnallocatedInvitees(newUnallocatedInvitees)
    saveToLocalStorage(newTables, newUnallocatedInvitees)
  }


  const deallocateInvitee = (invitee: Invitee, tableId: number) => {
    const newTables = tables.map((table) =>
        table.id === tableId ? { ...table, guests: table.guests.filter((g) => g.id !== invitee.id) } : table,
        )
        const newUnallocatedInvitees = [...unallocatedInvitees, invitee]
    
        setTables(newTables)
        setUnallocatedInvitees(newUnallocatedInvitees)
        saveToLocalStorage(newTables, newUnallocatedInvitees)
      }
  
  const updateTableCapacity = (tableId: number | string, newCapacity: number) => {
    const newTables = tables.map((table) => (table.id === tableId ? { ...table, capacity: newCapacity } : table))
        setTables(newTables)
        saveToLocalStorage(newTables, unallocatedInvitees)
      }
    

  const clearSavedData = () => {
    if (typeof window !== "undefined") {
        localStorage.removeItem("seatingChartTables")
        localStorage.removeItem("seatingChartUnallocated")

    }
    setTables(initialTables)
    setUnallocatedInvitees(invitees)
  }

  const searchResults = useMemo(() => {
    if (!searchQuery) return []

    const results: { invitee: Invitee; tableId: number | string | null }[] = []

    // Search in unallocated invitees
    unallocatedInvitees.forEach((invitee) => {
      if (invitee.name.toLowerCase().includes(searchQuery.toLowerCase())) {
        results.push({ invitee, tableId: null })
      }
    })

    // Search in allocated invitees
    tables.forEach((table) => {
      table.guests.forEach((invitee) => {
        if (invitee.name.toLowerCase().includes(searchQuery.toLowerCase())) {
          results.push({ invitee, tableId: table.id })
        }
      })
    })

    return results
  }, [searchQuery, tables, unallocatedInvitees])

  const filteredTableGuests = useMemo(() => {
    if (!selectedTable) return []
    return selectedTable.guests.filter((guest) => guest.name.toLowerCase().includes(tableSearchQuery.toLowerCase()))
  }, [selectedTable, tableSearchQuery])

  const filteredUnallocatedInvitees = useMemo(() => {
    return unallocatedInvitees.filter((invitee) => invitee.name.toLowerCase().includes(tableSearchQuery.toLowerCase()))
  }, [unallocatedInvitees, tableSearchQuery])

  const generateCSV = () => {
    let csvContent = "Table,Guest Name\n"

    tables.forEach((table) => {
      if (table.guests.length > 0) {
        table.guests.forEach((guest) => {
          csvContent += `${table.id},${guest.name}\n`
        })
      } else {
        csvContent += `${table.id},No guests assigned\n`
      }
    })

    unallocatedInvitees.forEach((invitee) => {
      csvContent += `Unallocated,${invitee.name}\n`
    })

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", "seating_chart.csv")
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const content = e.target?.result as string
        const lines = content.split("\n")
        const newTables = [...initialTables]
        const newUnallocatedInvitees: Invitee[] = []

        lines.slice(1).forEach((line) => {
          const [tableId, guestName] = line.split(",")
          if (tableId && guestName) {
            const trimmedTableId = tableId.trim()
            const trimmedGuestName = guestName.trim()

            if (trimmedTableId === "Unallocated") {
              newUnallocatedInvitees.push({ id: `u${newUnallocatedInvitees.length}`, name: trimmedGuestName })
            } else {
              const tableIndex = newTables.findIndex((t) => t.id.toString() === trimmedTableId)
              if (tableIndex !== -1 && trimmedGuestName !== "No guests assigned") {
                const guest = { id: `g${newTables[tableIndex].guests.length}`, name: trimmedGuestName }
                newTables[tableIndex].guests.push(guest)
              }
            }
          }
        })

        setTables(newTables)
        setUnallocatedInvitees(newUnallocatedInvitees)
        saveToLocalStorage(newTables, newUnallocatedInvitees)
      }
      reader.readAsText(file)
    }
  }

  return (
    <div className="mx-auto max-w-4xl p-4">
      <Input
        type="text"
        placeholder="Search invitee..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="mb-4"
      />

      {searchResults.length > 0 && (
        <div className="mb-4 p-4 border rounded-md bg-muted">
          <h3 className="font-semibold mb-2">Search Results:</h3>
          {searchResults.map(({ invitee, tableId }) => (
            <div key={invitee.id} className="flex justify-between items-center mb-2">
              <span>{invitee.name}</span>
              <span>{tableId ? `Table ${tableId}` : "Unallocated"}</span>
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-5 gap-4">
        {/* Row 1 */}
        <TableShape
          table={tables[0]}
          onClick={setSelectedTable}
          highlight={searchResults.some((r) => r.tableId === tables[0].id)}
        />
        <TableShape
          table={tables[5]}
          onClick={setSelectedTable}
          highlight={searchResults.some((r) => r.tableId === tables[5].id)}
        />
        <div className="invisible" />
        <TableShape
          table={tables[12]}
          onClick={setSelectedTable}
          highlight={searchResults.some((r) => r.tableId === tables[12].id)}
        />
        <TableShape
          table={tables[17]}
          onClick={setSelectedTable}
          highlight={searchResults.some((r) => r.tableId === tables[17].id)}
        />

        {/* Row 2 */}
        <TableShape
          table={tables[1]}
          onClick={setSelectedTable}
          highlight={searchResults.some((r) => r.tableId === tables[1].id)}
        />
        <TableShape
          table={tables[6]}
          onClick={setSelectedTable}
          highlight={searchResults.some((r) => r.tableId === tables[6].id)}
        />
        <div className="invisible" />
        <TableShape
          table={tables[13]}
          onClick={setSelectedTable}
          highlight={searchResults.some((r) => r.tableId === tables[13].id)}
        />
        <TableShape
          table={tables[18]}
          onClick={setSelectedTable}
          highlight={searchResults.some((r) => r.tableId === tables[18].id)}
        />

        {/* Row 3 */}
        <TableShape
          table={tables[2]}
          onClick={setSelectedTable}
          highlight={searchResults.some((r) => r.tableId === tables[2].id)}
        />
        <TableShape
          table={tables[7]}
          onClick={setSelectedTable}
          highlight={searchResults.some((r) => r.tableId === tables[7].id)}
        />
        <TableShape
          table={tables[10]}
          onClick={setSelectedTable}
          highlight={searchResults.some((r) => r.tableId === tables[10].id)}
        />
        <TableShape
          table={tables[14]}
          onClick={setSelectedTable}
          highlight={searchResults.some((r) => r.tableId === tables[14].id)}
        />
        <TableShape
          table={tables[19]}
          onClick={setSelectedTable}
          highlight={searchResults.some((r) => r.tableId === tables[19].id)}
        />

        {/* Row 4 */}
        <TableShape
          table={tables[3]}
          onClick={setSelectedTable}
          highlight={searchResults.some((r) => r.tableId === tables[3].id)}
        />
        <TableShape
          table={tables[8]}
          onClick={setSelectedTable}
          highlight={searchResults.some((r) => r.tableId === tables[8].id)}
        />
        <TableShape
          table={tables[11]}
          onClick={setSelectedTable}
          highlight={searchResults.some((r) => r.tableId === tables[11].id)}
        />
        <TableShape
          table={tables[15]}
          onClick={setSelectedTable}
          highlight={searchResults.some((r) => r.tableId === tables[15].id)}
        />
        <TableShape
          table={tables[20]}
          onClick={setSelectedTable}
          highlight={searchResults.some((r) => r.tableId === tables[20].id)}
        />

        {/* Row 5 */}
        <TableShape
          table={tables[4]}
          onClick={setSelectedTable}
          highlight={searchResults.some((r) => r.tableId === tables[4].id)}
        />
        <TableShape
          table={tables[9]}
          onClick={setSelectedTable}
          highlight={searchResults.some((r) => r.tableId === tables[9].id)}
        />
        <TableShape
          table={tables[22]}
          onClick={setSelectedTable}
          highlight={searchResults.some((r) => r.tableId === tables[22].id)}
        />
        <TableShape
          table={tables[16]}
          onClick={setSelectedTable}
          highlight={searchResults.some((r) => r.tableId === tables[16].id)}
        />
        <TableShape
          table={tables[21]}
          onClick={setSelectedTable}
          highlight={searchResults.some((r) => r.tableId === tables[21].id)}
        />

      </div>

      <Dialog
        open={!!selectedTable}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedTable(null)
            setTableSearchQuery("")
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Table {selectedTable?.id} Guests</DialogTitle>
          </DialogHeader>
          <div className="flex items-center space-x-2 mb-4">
            <label htmlFor="capacity" className="text-sm font-medium">
              Capacity:
            </label>
            <Input
              id="capacity"
              type="number"
              value={selectedTable?.capacity}
              onChange={(e) =>
                selectedTable && updateTableCapacity(selectedTable.id, Number.parseInt(e.target.value, 10))
              }
              className="w-20"
            />
          </div>
          <Input
            type="text"
            placeholder="Search guests..."
            value={tableSearchQuery}
            onChange={(e) => setTableSearchQuery(e.target.value)}
            className="mb-4"
          />
          <ScrollArea className="h-[300px] pr-4">
            <div className="space-y-4">
              {filteredTableGuests.map((guest) => (
                <div key={guest.id} className="flex items-center justify-between">
                  <span>{guest.name}</span>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => selectedTable && deallocateInvitee(guest, selectedTable.id)}
                  >
                    Remove
                  </Button>
                </div>
              ))}
            </div>
          </ScrollArea>
          <DialogHeader>
            <DialogTitle>Unallocated Guests</DialogTitle>
          </DialogHeader>
          <ScrollArea className="h-[300px] pr-4">
            <div className="space-y-4">
              {filteredUnallocatedInvitees.map((invitee) => (
                <div key={invitee.id} className="flex items-center justify-between">
                  <span>{invitee.name}</span>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => selectedTable && allocateInvitee(invitee, selectedTable.id)}
                    disabled={selectedTable && selectedTable.guests.length >= selectedTable.capacity}
                  >
                    Add to Table
                  </Button>
                </div>
              ))}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      <Dialog>
        <DialogTrigger asChild>
          <Button className="mt-8 w-full">View All Tables</Button>
        </DialogTrigger>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Table Assignments</DialogTitle>
          </DialogHeader>
          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-4">
              {tables.map((table) => (
                <div key={table.id} className="flex items-start justify-between">
                  <div>
                    <h4 className="font-medium">Table {table.id}</h4>
                    <p className="text-sm text-muted-foreground">
                      {table.guests.length ? table.guests.map((g) => g.name).join(", ") : "No guests assigned"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
      <div className="mt-4 flex space-x-4">
        <Button onClick={generateCSV} className="flex-1">
          Download CSV
        </Button>
        <Button onClick={() => fileInputRef.current?.click()} className="flex-1">
          Upload CSV
        </Button>
        <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept=".csv" className="hidden" />
      </div>
    </div>
  )
}

function TableShape({
  table,
  onClick,
  highlight,
}: {
  table: Table
  onClick: (table: Table) => void
  highlight: boolean
}) {
  const commonClasses =
    "h-20 flex items-center justify-center border-2 border-primary hover:bg-primary/10 cursor-pointer transition-colors"

  return (
    <div
      onClick={() => onClick(table)}
      className={`${commonClasses} ${table.shape === "circle" ? "rounded-full" : "rounded-md"} ${
        highlight ? "bg-yellow-200" : ""
      }`}
    >
      <div className="text-center">
        <div>{table.id}</div>
        <div className="text-xs text-muted-foreground">
          {table.guests.length}/{table.capacity} guests
        </div>
      </div>
    </div>
  )
}

