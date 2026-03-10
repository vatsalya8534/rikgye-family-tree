"use client"

import { useEffect, useRef, useState, useMemo } from "react"
import "leaflet/dist/leaflet.css";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet"
import L from "leaflet"

const members = [
  {
    id: 1,
    name: "Rahul Sharma",
    birthCity: "Delhi",
    birthLat: 28.6139,
    birthLng: 77.209,
    liveCity: "Mumbai",
    liveLat: 19.076,
    liveLng: 72.8777,
    phone: "9876543210",
  },
]

export default function FindMember() {
  const position: [number, number] = [28.6139, 77.2090]

  const [citySearch, setCitySearch] = useState("")
  const [mode, setMode] = useState<"birth" | "live">("birth")

  const filteredMembers = useMemo(() => {
    return members.filter((m) => {
      const city =
        mode === "birth" ? m.birthCity : m.liveCity
      return city
        .toLowerCase()
        .includes(citySearch.toLowerCase())
    })
  }, [citySearch, mode])

  return (
    <div className="min-h-screen p-8 space-y-8">

      <div>
        <h1 className="text-3xl font-serif mb-2">
          Find Member By City
        </h1>
        <p className="text-neutral-600">
          Search members by birthplace or residence city
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <input
          type="text"
          placeholder={`Search by ${mode === "birth"
              ? "Birthplace"
              : "Residence"
            } city...`}
          value={citySearch}
          onChange={(e) =>
            setCitySearch(e.target.value)
          }
          className="border p-3 flex-1"
        />

        <select
          value={mode}
          onChange={(e) =>
            setMode(e.target.value as "birth" | "live")
          }
          className="border p-3"
        >
          <option value="birth">Birthplace</option>
          <option value="live">Residence</option>
        </select>
      </div>

      <MapContainer
        center={position}
        zoom={6}
        style={{ height: "400px", width: "100%" }}
      >
        <TileLayer
          attribution='© OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
      </MapContainer>

      <div className="overflow-x-auto border rounded">
        <table className="w-full text-sm">
          <thead className="bg-neutral-100">
            <tr>
              <th className="p-3 text-left">Name</th>
              <th className="p-3 text-left">City</th>
              <th className="p-3 text-left">Phone</th>
            </tr>
          </thead>
          <tbody>
            {filteredMembers.map((member) => (
              <tr key={member.id} className="border-t">
                <td className="p-3">{member.name}</td>
                <td className="p-3">
                  {mode === "birth"
                    ? member.birthCity
                    : member.liveCity}
                </td>
                <td className="p-3">{member.phone}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredMembers.length === 0 && (
          <div className="p-6 text-center text-neutral-500">
            No members found.
          </div>
        )}
      </div>
    </div>
  )
}