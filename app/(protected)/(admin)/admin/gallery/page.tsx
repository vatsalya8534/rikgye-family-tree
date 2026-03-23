"use client";

import { useEffect, useState } from "react";
import GalleryUpload from "@/components/gallery/GalleryUpload";
import GalleryList from "@/components/gallery/GalleryList";
import { getGalleries, createGallery } from "./actions";

type Gallery = {
  id: string;
  memberName: string;
  title?: string;
  images: string[];
};

export default function Page() {
  const [galleries, setGalleries] = useState<Gallery[]>([]);

  const load = async () => {
    const data = await getGalleries();
    setGalleries(data);
  };

  useEffect(() => {
    load();
  }, []);

  const handleCreate = async (data: any) => {
    await createGallery(data);
    load();
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-green-50 to-green-100">
      
      {/* LEFT (smaller) */}
      <div className="w-[320px] p-4 border-r bg-white/80 backdrop-blur-md">
        <GalleryUpload onSubmit={handleCreate} />
      </div>

      {/* RIGHT (bigger focus) */}
      <div className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-6xl mx-auto">
          <GalleryList galleries={galleries} refresh={load} />
        </div>
      </div>
    </div>
  );
}