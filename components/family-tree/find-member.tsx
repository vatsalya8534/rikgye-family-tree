"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useMap } from "react-leaflet";
import { useFamilyContext } from "@/context/FamilyContext";

// -------- LEAFLET FIX --------
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// -------- DYNAMIC IMPORTS --------
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

// -------- PREMIUM DROPDOWN --------
const ModeDropdown = ({
  mode,
  setMode,
}: {
  mode: "birth" | "live";
  setMode: (val: "birth" | "live") => void;
}) => {
  const [open, setOpen] = useState(false);

  const options = [
    { value: "live", label: "Residence", icon: "🏠" },
    { value: "birth", label: "Birthplace", icon: "📍" },
  ];

  const selected = options.find((o) => o.value === mode);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest(".mode-dropdown")) setOpen(false);
    };
    window.addEventListener("mousedown", handleClick);
    return () => window.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div className="relative mode-dropdown w-48">
      <div
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between px-4 py-2 rounded-xl cursor-pointer 
        bg-white/70 backdrop-blur-md border border-emerald-200 shadow hover:shadow-lg"
      >
        <div className="flex items-center gap-2">
          <span>{selected?.icon}</span>
          <span>{selected?.label}</span>
        </div>
        <span className={`${open ? "rotate-180" : ""}`}>⌄</span>
      </div>

      {open && (
        <div className="absolute mt-2 w-full bg-white border rounded-xl shadow-xl z-[9999]">
          {options.map((opt) => (
            <div
              key={opt.value}
              onClick={() => {
                setMode(opt.value as "birth" | "live");
                setOpen(false);
              }}
              className={`px-4 py-3 cursor-pointer hover:bg-emerald-50 ${
                mode === opt.value ? "bg-emerald-100" : ""
              }`}
            >
              {opt.icon} {opt.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// -------- FIT BOUNDS --------
function FitBounds({
  members,
  coordsMap,
  mode,
}: {
  members: Member[];
  coordsMap: Record<string, [number, number]>;
  mode: "birth" | "live";
}) {
  const map = useMap();

  useEffect(() => {
    const coords = members
      .map((m) => {
        const city =
          mode === "birth" ? m.birthPlace : m.currentResidence;
        return city ? coordsMap[city] : null;
      })
      .filter(Boolean);

    if (coords.length === 1) {
      map.setView(coords[0] as [number, number], 8);
    } else if (coords.length > 1) {
      map.fitBounds(coords as any, { padding: [50, 50], maxZoom: 10 });
    }
  }, [members, coordsMap, mode, map]);

  return null;
}

// -------- MAIN --------
export default function FindMember() {
  const { activeFamily } = useFamilyContext();
  const members: Member[] = activeFamily?.members ?? [];

  const [citySearch, setCitySearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [mode, setMode] = useState<"birth" | "live">("live");

  const [coordsMap, setCoordsMap] = useState<
    Record<string, [number, number]>
  >({});
  const [filteredMembers, setFilteredMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(false);

  const [suggestions, setSuggestions] = useState<Member[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);

  const position: [number, number] = [28.6139, 77.209];

  // -------- DEBOUNCE --------
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(citySearch);
    }, 400);
    return () => clearTimeout(timer);
  }, [citySearch]);

  // -------- CLICK OUTSIDE --------
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest(".search-container")) {
        setShowDropdown(false);
      }
    };
    window.addEventListener("mousedown", handleClick);
    return () => window.removeEventListener("mousedown", handleClick);
  }, []);

  // -------- GEO FETCH --------
  const getLatLngFromCity = async (city: string) => {
    if (coordsMap[city]) return;

    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          city + ", India"
        )}`
      );
      const data = await res.json();

      if (data?.length) {
        const lat = parseFloat(data[0].lat);
        const lng = parseFloat(data[0].lon);

        setCoordsMap((prev) => ({
          ...prev,
          [city]: [lat, lng],
        }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  // -------- FILTER FIXED --------
  useEffect(() => {
    const run = async () => {
      if (!debouncedSearch.trim()) {
        setFilteredMembers([]);
        return;
      }

      setLoading(true);

      const filtered = members.filter((m) => {
        const city =
          mode === "birth" ? m.birthPlace : m.currentResidence;

        return (
          city?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
          m.name.toLowerCase().includes(debouncedSearch.toLowerCase())
        );
      });

      setFilteredMembers(filtered);

      const uniqueCities = [
        ...new Set(
          filtered.map((m) =>
            mode === "birth" ? m.birthPlace : m.currentResidence
          )
        ),
      ].filter(Boolean) as string[];

      await Promise.all(uniqueCities.map(getLatLngFromCity));

      setLoading(false);
    };

    run();
  }, [debouncedSearch, mode, members]);

  // -------- SUGGESTIONS --------
  const updateSuggestions = (value: string) => {
    if (!value.trim()) {
      setSuggestions([]);
      setShowDropdown(false);
      return;
    }

    const result = members
      .filter((m) => {
        const city =
          mode === "birth" ? m.birthPlace : m.currentResidence;

        return (
          city?.toLowerCase().includes(value.toLowerCase()) ||
          m.name.toLowerCase().includes(value.toLowerCase())
        );
      })
      .slice(0, 6);

    setSuggestions(result);
    setShowDropdown(true);
  };

  return (
    <div className="min-h-screen p-8 space-y-6 bg-gradient-to-br from-emerald-50 to-white">
      <div>
        <h1 className="text-3xl font-bold text-emerald-900">
          Find Member
        </h1>
        <p className="text-gray-600">
          Search by birthplace or residence
        </p>
      </div>

      {/* SEARCH + DROPDOWN */}
      <div className="flex flex-col md:flex-row gap-4 relative">
        <div className="w-full relative z-[9999] search-container">
          <input
            value={citySearch}
            onChange={(e) => {
              setCitySearch(e.target.value);
              updateSuggestions(e.target.value);
            }}
            placeholder="Search by name or city..."
            className="p-3 rounded-xl border w-full"
          />

          {showDropdown && suggestions.length > 0 && (
            <div className="absolute mt-1 w-full bg-white border rounded-xl shadow-lg max-h-60 overflow-y-auto">
              {suggestions.map((s) => {
                const city =
                  mode === "birth"
                    ? s.birthPlace
                    : s.currentResidence;

                return (
                  <div
                    key={s.id}
                    onClick={() => {
                      setCitySearch(city || s.name);
                      setDebouncedSearch(city || s.name);
                      setShowDropdown(false);
                    }}
                    className="p-3 hover:bg-emerald-50 cursor-pointer border-b"
                  >
                    <div className="font-medium">{s.name}</div>
                    <div className="text-sm text-gray-500">
                      {city}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <ModeDropdown mode={mode} setMode={setMode} />
      </div>

      {/* MAP */}
      <div className="rounded-xl overflow-hidden shadow-lg border">
        <MapContainer center={position} zoom={5} style={{ height: 420 }}>
          <TileLayer url="https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png" />

          <FitBounds
            members={filteredMembers}
            coordsMap={coordsMap}
            mode={mode}
          />

          {filteredMembers.map((m) => {
            const city =
              mode === "birth" ? m.birthPlace : m.currentResidence;

            const coords = city ? coordsMap[city] : null;
            if (!coords) return null;

            return (
              <Marker key={m.id} position={coords}>
                <Popup>
                  <strong>{m.name}</strong>
                  <br />
                  {city}
                  <br />
                  {m.phone || "No phone"}
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-xl shadow border overflow-hidden">
        {loading && (
          <div className="p-4 text-center text-emerald-600">
            Loading...
          </div>
        )}

        <table className="w-full text-sm">
          <thead className="bg-emerald-100">
            <tr>
              <th className="p-3 text-left">Name</th>
              <th className="p-3 text-left">City</th>
              <th className="p-3 text-left">Phone</th>
            </tr>
          </thead>

          <tbody>
            {filteredMembers.map((m) => {
              const city =
                mode === "birth"
                  ? m.birthPlace
                  : m.currentResidence;

              return (
                <tr key={m.id} className="border-t hover:bg-emerald-50">
                  <td className="p-3 font-medium">{m.name}</td>
                  <td className="p-3">{city}</td>
                  <td className="p-3">{m.phone || "-"}</td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {!loading && (
          <div className="p-6 text-center text-gray-500">
            {!debouncedSearch
              ? "Start typing to search members..."
              : filteredMembers.length === 0
              ? "No members found"
              : ""}
          </div>
        )}
      </div>
    </div>
  );
}