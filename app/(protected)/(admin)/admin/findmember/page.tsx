"use client"

import { useEffect, useRef, useState, useMemo } from "react"
import maplibregl from "maplibre-gl"

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
  const mapContainer = useRef<HTMLDivElement | null>(null)
  const mapRef = useRef<maplibregl.Map | null>(null)

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

  useEffect(() => {
    if (!mapContainer.current) return

    mapRef.current = new maplibregl.Map({
      container: mapContainer.current,
      style: "https://demotiles.maplibre.org/style.json",
      center: [78.9629, 20.5937],
      zoom: 4,
    })

    mapRef.current.addControl(
      new maplibregl.NavigationControl(),
      "top-right"
    )

    return () => {
      mapRef.current?.remove()
    }
  }, [])

  useEffect(() => {
    if (!mapRef.current) return

    // Remove old markers
    document
      .querySelectorAll(".custom-marker")
      .forEach((el) => el.remove())

    filteredMembers.forEach((member) => {
      const lat =
        mode === "birth"
          ? member.birthLat
          : member.liveLat

      const lng =
        mode === "birth"
          ? member.birthLng
          : member.liveLng

      const el = document.createElement("div")
      el.className =
        "custom-marker bg-black w-3 h-3 rounded-full"

      new maplibregl.Marker(el)
        .setLngLat([lng, lat])
        .setPopup(
          new maplibregl.Popup().setHTML(`
            <strong>${member.name}</strong><br/>
            ${mode === "birth"
              ? member.birthCity
              : member.liveCity}<br/>
            ${member.phone}
          `)
        )
        .addTo(mapRef.current!)
    })
  }, [filteredMembers, mode])

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
            mode === "birth"
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

      <div
        ref={mapContainer}
        className="w-full h-[500px] border rounded"
      />

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