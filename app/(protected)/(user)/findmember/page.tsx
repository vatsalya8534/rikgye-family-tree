"use client";

import { useState, useMemo, useEffect } from "react";
import dynamic from "next/dynamic";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useMap } from "react-leaflet";
import { useFamilyContext } from "@/context/FamilyContext";

// Fix leaflet icon issue
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// Dynamic imports (SSR fix)
const MapContainer = dynamic(
  () => import("react-leaflet").then((m) => m.MapContainer),
  { ssr: false }
);

const TileLayer = dynamic(
  () => import("react-leaflet").then((m) => m.TileLayer),
  { ssr: false }
);

const Marker = dynamic(
  () => import("react-leaflet").then((m) => m.Marker),
  { ssr: false }
);

const Popup = dynamic(
  () => import("react-leaflet").then((m) => m.Popup),
  { ssr: false }
);

// -------- TYPES --------
type Member = {
  id: string;
  name: string;
  birthPlace?: string;
  currentResidence?: string;
  phone?: string;
};

// -------- FIT BOUNDS --------
function FitBounds({
  members,
  mode,
  coordsMap,
}: {
  members: Member[];
  mode: "birth" | "live";
  coordsMap: Record<string, [number, number]>;
}) {
  const map = useMap();

  useEffect(() => {
    const bounds = members
      .map((m) => {
        const city =
          mode === "birth" ? m.birthPlace : m.currentResidence;
        return city ? coordsMap[city] : null;
      })
      .filter(Boolean);

    if (bounds.length > 0) {
      map.fitBounds(bounds as any, {
        padding: [50, 50],
        maxZoom: 10,
      });
    }
  }, [members, mode, coordsMap, map]);

  return null;
}

// -------- MAIN --------
export default function FindMember() {

  const { activeFamily } = useFamilyContext();

  const members: Member[] = activeFamily?.members ?? [];

  const [citySearch, setCitySearch] = useState("");
  const [mode, setMode] = useState<"birth" | "live">("live");

  const [coordsMap, setCoordsMap] = useState<Record<string, [number, number]>>({});

  const position: [number, number] = [28.6139, 77.209]; // fallback center

  const [filteredMembers, setFilteredMembers] = useState<any>([]);

  // -------- FILTER --------
  const filteredMembersFunc = async () => {
    let filterData = members.filter((m) => {
      const city =
        mode === "birth" ? m.birthPlace : m.currentResidence;

      if (!city) return false;

      return city.toLowerCase().includes(citySearch.toLowerCase());
    });

    setFilteredMembers(filterData);

    // ✅ Fetch coords for all cities
    for (const m of filterData) {
      const city =
        mode === "birth" ? m.birthPlace : m.currentResidence;

      if (city && !coordsMap[city]) {
        await getLatLngFromCity(city);
      }
    }
  };
  // -------- GEOCODING --------
  const getLatLngFromCity = async (city: string) => {
    if (coordsMap[city]) return coordsMap[city];

    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          city + ", India"
        )}`
      );

      const data = await res.json();

      if (data && data.length > 0) {
        const lat = parseFloat(data[0].lat);
        const lng = parseFloat(data[0].lon);

        setCoordsMap((prev) => ({
          ...prev,
          [city]: [lat, lng],
        }));

        return [lat, lng];
      }
    } catch (err) {
      console.error("Geocoding error:", err);
    }

    return null;
  };

  useEffect(() => {
    filteredMembersFunc();
  }, [mode, citySearch]);

  return (
    <div className="min-h-screen p-8 space-y-8">
      {/* HEADER */}
      <div>
        <h1 className="text-3xl font-serif mb-2 text-emerald-900">
          Find Member By City
        </h1>
        <p className="text-emerald-700">
          Search members by birthplace or residence city
        </p>
      </div>

      {/* SEARCH */}
      <div className="flex flex-col md:flex-row gap-4">
        <input
          type="text"
          placeholder={`Search by ${mode === "birth" ? "Birthplace" : "Residence"
            } city...`}
          value={citySearch}
          onChange={(e) => setCitySearch(e.target.value)}
          className="border border-emerald-300 bg-white p-3 flex-1 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
        />

        <div className="flex gap-2">
          <button
            onClick={() => setMode("birth")}
            className={`px-4 py-3 rounded-lg font-medium ${mode === "birth"
              ? "bg-emerald-700 text-white"
              : "bg-white border border-emerald-300"
              }`}
          >
            Birthplace
          </button>

          <button
            onClick={() => setMode("live")}
            className={`px-4 py-3 rounded-lg font-medium ${mode === "live"
              ? "bg-emerald-700 text-white"
              : "bg-white border border-emerald-300"
              }`}
          >
            Residence
          </button>
        </div>
      </div>

      {/* TABLE */}
      <div className="overflow-x-auto border rounded-xl bg-white shadow">
        <table className="w-full text-sm">
          <thead className="bg-emerald-100">
            <tr>
              <th className="p-3 text-left">Name</th>
              <th className="p-3 text-left">City</th>
              <th className="p-3 text-left">Phone</th>
            </tr>
          </thead>

          <tbody>
            {filteredMembers.map((m: any) => {
              const city =
                mode === "birth"
                  ? m.birthPlace
                  : m.currentResidence;

              return (
                <tr key={m.id} className="border-t">
                  <td className="p-3">{m.name}</td>
                  <td className="p-3">{city}</td>
                  <td className="p-3">{m.phone || "-"}</td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {filteredMembers.length === 0 && (
          <div className="p-6 text-center">
            No members found.
          </div>
        )}
      </div>

      {/* MAP */}
      <div className="rounded-xl overflow-hidden shadow border">
        <MapContainer
          center={position}
          zoom={5}
          style={{ height: "420px", width: "100%" }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png"
          />

          <FitBounds
            members={filteredMembers}
            mode={mode}
            coordsMap={coordsMap}
          />

          {filteredMembers.map((member: any) => {
            const city =
              mode === "birth"
                ? member.birthPlace
                : member.currentResidence;

            if (!city) return null;

            const coords = coordsMap[city];
            if (!coords) return null;

            return (
              <Marker key={member.id} position={coords}>
                <Popup>
                  <strong>{member.name}</strong>
                  <br />
                  {city}
                  <br />
                  {member.phone || "No phone"}
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
      </div>
    </div>
  );git
}