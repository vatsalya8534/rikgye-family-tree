"use client"

<<<<<<< HEAD
import { useEffect, useRef, useState, useMemo } from "react"
import "leaflet/dist/leaflet.css";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet"

=======
import { useState, useMemo, useEffect } from "react"
import "leaflet/dist/leaflet.css"
import dynamic from "next/dynamic"
import { useMap } from "react-leaflet"
import L from "leaflet"
 
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
})

const MapContainer = dynamic(
  () => import("react-leaflet").then((m) => m.MapContainer),
  { ssr: false }
)

const TileLayer = dynamic(
  () => import("react-leaflet").then((m) => m.TileLayer),
  { ssr: false }
)

const Marker = dynamic(
  () => import("react-leaflet").then((m) => m.Marker),
  { ssr: false }
)

const Popup = dynamic(
  () => import("react-leaflet").then((m) => m.Popup),
  { ssr: false }
)

 
function FitBounds({ members, mode }: any) {
  const map = useMap()

  useEffect(() => {
    if (!members.length) return

    const bounds = members.map((m: any) => [
      mode === "birth" ? m.birthLat : m.liveLat,
      mode === "birth" ? m.birthLng : m.liveLng,
    ])

    map.fitBounds(bounds, { padding: [50, 50],maxZoom: 10   })
  }, [members, mode, map])

  return null
}
>>>>>>> 740aef27f9702e0c47884b80daa5eb9ea0d520b9

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
  const position: [number, number] = [28.6139, 77.209]

  const [citySearch, setCitySearch] = useState("")
  const [mode, setMode] = useState<"birth" | "live">("birth")

  const filteredMembers = useMemo(() => {
    return members.filter((m) => {
      const city = mode === "birth" ? m.birthCity : m.liveCity
      return city.toLowerCase().includes(citySearch.toLowerCase())
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
          placeholder={`Search by ${
            mode === "birth" ? "Birthplace" : "Residence"
          } city...`}
          value={citySearch}
          onChange={(e) => setCitySearch(e.target.value)}
          className="border p-3 flex-1 rounded"
        />

        <div className="flex gap-2">

          <button
            onClick={() => setMode("birth")}
            className={`px-4 py-3 border rounded ${
              mode === "birth"
                ? "bg-black text-white"
                : "bg-white"
            }`}
          >
            Birthplace
          </button>

          <button
            onClick={() => setMode("live")}
            className={`px-4 py-3 border rounded ${
              mode === "live"
                ? "bg-black text-white"
                : "bg-white"
            }`}
          >
            Residence
          </button>

        </div>

      </div>

      <MapContainer
        center={position}
        zoom={5}
        style={{ height: "400px", width: "100%" }}
      >
        <TileLayer
          attribution="© OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <FitBounds members={filteredMembers} mode={mode} />

        {filteredMembers.map((member) => {
          const lat =
            mode === "birth" ? member.birthLat : member.liveLat
          const lng =
            mode === "birth" ? member.birthLng : member.liveLng

          return (
            <Marker key={member.id} position={[lat, lng]}>
              <Popup>
                <strong>{member.name}</strong>
                <br />
                {mode === "birth"
                  ? member.birthCity
                  : member.liveCity}
                <br />
                {member.phone}
              </Popup>
            </Marker>
          )
        })}
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