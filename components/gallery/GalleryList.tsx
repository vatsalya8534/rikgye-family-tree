"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Pencil, Trash2, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  deleteGallery,
  updateGallery,
} from "@/app/(protected)/(admin)/admin/gallery/actions";

type Gallery = {
  id: string;
  memberName: string;
  title?: string;
  images: string[];
};

export default function GalleryList({
  galleries,
  refresh,
}: {
  galleries: Gallery[];
  refresh: () => void;
}) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [title, setTitle] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [indexMap, setIndexMap] = useState<Record<string, number>>({});
  const [preview, setPreview] = useState<string | null>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndexMap((prev) => {
        const updated: any = {};
        galleries.forEach((g) => {
          if (!g.images.length) return;
          updated[g.id] = ((prev[g.id] || 0) + 1) % g.images.length;
        });
        return { ...prev, ...updated };
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [galleries]);

  const handleDelete = async (id: string) => {
    await deleteGallery(id);
    refresh();
  };

  const startEdit = (g: Gallery) => {
    setEditingId(g.id);
    setName(g.memberName);
    setTitle(g.title || "");
    setImages(g.images);
    setIndexMap((prev) => ({ ...prev, [g.id]: 0 }));
  };

  const saveEdit = async (id: string) => {
    await updateGallery({
      id,
      memberName: name,
      title,
      images,
    });
    setEditingId(null);
    refresh();
  };

  const handleAddImages = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);

    const base64Images = await Promise.all(
      files.map(
        (file) =>
          new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result as string);
          }),
      ),
    );

    setImages((prev) => [...prev, ...base64Images]);
  };

  const removeImage = (idx: number) => {
    setImages((prev) => prev.filter((_, i) => i !== idx));
  };

  const next = (id: string, length: number) => {
    setIndexMap((prev) => ({
      ...prev,
      [id]: ((prev[id] || 0) + 1) % length,
    }));
  };

  const prev = (id: string, length: number) => {
    setIndexMap((prev) => ({
      ...prev,
      [id]: (prev[id] || 0) === 0 ? length - 1 : (prev[id] || 0) - 1,
    }));
  };

  return (
    <>
      <div className="space-y-10">
        {galleries.map((g) => {
          const currentIndex = indexMap[g.id] || 0;

          const getIndex = (offset: number) =>
            (currentIndex + offset + g.images.length) % g.images.length;

          return (
            <div
              key={g.id}
              className="bg-white/80 backdrop-blur border rounded-2xl p-5 shadow"
            >
              {/* HEADER */}
              <div className="flex justify-between mb-4">
                <div>
                  <h2 className="text-lg font-semibold">{g.memberName}</h2>
                  <p className="text-sm text-gray-500">{g.title}</p>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => startEdit(g)}
                    className="p-4 bg-blue-100 rounded-full"
                  >
                    <Pencil size={16} />
                  </button>

                  <button
                    onClick={() => handleDelete(g.id)}
                    className="p-4 bg-red-100 rounded-full"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              <div className="relative flex items-center justify-center h-72">
                {g.images.length === 1 && (
                  <img
                    src={g.images[0]}
                    onClick={() => setPreview(g.images[0])}
                    className="w-72 h-80 object-cover rounded-2xl shadow-lg cursor-pointer"
                  />
                )}

                {g.images.length === 2 && (
                  <div className="flex gap-6">
                    {g.images.map((img, i) => (
                      <img
                        key={i}
                        src={img}
                        onClick={() => setPreview(img)}
                        className="w-60 h-72 object-cover rounded-2xl shadow cursor-pointer hover:scale-105 transition"
                      />
                    ))}
                  </div>
                )}

                {g.images.length >= 3 && (
                  <div className="relative w-[500px] h-[260px] flex items-center justify-center">
                    {[getIndex(-1), currentIndex, getIndex(1)].map((i, idx) => {
                      const position =
                        idx === 1 ? "center" : idx === 0 ? "left" : "right";

                      return (
                        <motion.img
                          key={i}
                          src={g.images[i]}
                          onClick={() => setPreview(g.images[i])}
                          className="absolute rounded-2xl object-cover cursor-pointer shadow-md"
                          animate={{
                            scale: position === "center" ? 1.1 : 0.85,
                            opacity: position === "center" ? 1 : 0.6,
                            x:
                              position === "left"
                                ? -180
                                : position === "right"
                                  ? 180
                                  : 0,
                            zIndex: position === "center" ? 10 : 5,
                          }}
                          transition={{
                            type: "spring",
                            stiffness: 250,
                            damping: 25,
                          }}
                          style={{
                            width: position === "center" ? 240 : 180,
                            height: position === "center" ? 280 : 220,
                          }}
                        />
                      );
                    })}

                    <button
                      onClick={() => prev(g.id, g.images.length)}
                      className="absolute left-[-40] top-1/2 -translate-y-1/2 z-20
                                flex items-center justify-center
                                w-10 h-10 rounded-full
                              bg-white/90 backdrop-blur
                                shadow-md hover:scale-110 hover:bg-white
                                transition"
                    >
                      <ChevronLeft size={20} />
                    </button>

                    <button
                      onClick={() => next(g.id, g.images.length)}
                      className="absolute right-[-40] top-1/2 -translate-y-1/2 z-20
                                    flex items-center justify-center
                                    w-10 h-10 rounded-full
                                  bg-white/90 backdrop-blur
                                    shadow-md hover:scale-110 hover:bg-white
                                    transition" 
                    >
                      <ChevronRight size={20} />
                    </button>
                  </div>
                )}
              </div>

              {editingId === g.id && (
                <div className="mt-6 space-y-4 border-t pt-4">
                  <div className="flex gap-3">
                    <input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="flex-1 border px-3 py-2 rounded"
                    />
                    <input
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="flex-1 border px-3 py-2 rounded"
                    />
                  </div>

                  <div className="flex items-center justify-center gap-4">
                    {images.length === 1 && (
                      <div className="relative">
                        <img src={images[0]} className="w-32 h-40 rounded" />
                        <button
                          onClick={() => removeImage(0)}
                          className="absolute top-1 right-1 bg-black text-white text-xs px-1 rounded"
                        >
                          ✕
                        </button>
                      </div>
                    )}

                    {images.length === 2 &&
                      images.map((img, i) => (
                        <div key={i} className="relative">
                          <img src={img} className="w-28 h-36 rounded" />
                          <button
                            onClick={() => removeImage(i)}
                            className="absolute top-1 right-1 bg-black text-white text-xs px-1 rounded"
                          >
                            ✕
                          </button>
                        </div>
                      ))}

                    {images.length >= 3 && (
                      <>
                        <img
                          src={
                            images[
                              (currentIndex - 1 + images.length) % images.length
                            ]
                          }
                          className="w-24 h-32 opacity-50 rounded"
                        />

                        <div className="relative">
                          <img
                            src={images[currentIndex]}
                            className="w-32 h-40 rounded"
                          />
                          <button
                            onClick={() => removeImage(currentIndex)}
                            className="absolute top-1 right-1 bg-black text-white text-xs px-1 rounded"
                          >
                            ✕
                          </button>
                        </div>

                        <img
                          src={images[(currentIndex + 1) % images.length]}
                          className="w-24 h-32 opacity-50 rounded"
                        />
                      </>
                    )}
                  </div>

                  <div className="flex justify-center gap-4">
                    <button onClick={() => prev(g.id, images.length)}>◀</button>
                    <button onClick={() => next(g.id, images.length)}>▶</button>
                  </div>

                  <input type="file" multiple onChange={handleAddImages} />

                  <div className="flex justify-end">
                    <button
                      onClick={() => saveEdit(g.id)}
                      className="bg-green-600 text-white px-5 py-2 rounded"
                    >
                      Save Changes
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <AnimatePresence>
        {preview && (
          <motion.div
            className="fixed inset-0 bg-black/80 flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <img src={preview} className="max-h-[80%] max-w-[80%] rounded-xl" />
            <button
              onClick={() => setPreview(null)}
              className="absolute top-5 right-5 text-white"
            >
              <X size={28} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
