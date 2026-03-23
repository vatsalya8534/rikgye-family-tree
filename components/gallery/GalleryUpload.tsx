"use client";

import { useState } from "react";
import { UploadCloud, X } from "lucide-react";

type Props = {
  onSubmit: (data: {
    memberName: string;
    title: string;
    images: string[];
  }) => void;
};

export default function GalleryUpload({ onSubmit }: Props) {
  const [memberName, setMemberName] = useState("");
  const [title, setTitle] = useState("");
  const [images, setImages] = useState<string[]>([]);

  // ✅ Base64 conversion
  const handleImageChange = async (files: FileList | null) => {
    if (!files) return;

    const base64Images = await Promise.all(
      Array.from(files).map((file) => {
        return new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.readAsDataURL(file);
          reader.onload = () => resolve(reader.result as string);
        });
      })
    );

    setImages((prev) => [...prev, ...base64Images]);
  };

  const removeImage = (idx: number) => {
    setImages((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = () => {
    if (!memberName || images.length === 0) return;

    onSubmit({ memberName, title, images });

    setMemberName("");
    setTitle("");
    setImages([]);
  };

  return (
    <div className="h-full flex flex-col justify-between pt-4">
      {/* TOP */}
      <div className="space-y-6">
        <div>
          <h1 className="text-xl font-semibold text-gray-800 ">
            Family Gallery
          </h1>
          <p className="text-sm text-gray-500">
            Store memories beautifully
          </p>
        </div>

        {/* INPUTS */}
        <div className="space-y-4">
          <div className="relative">
            <input
              value={memberName}
              onChange={(e) => setMemberName(e.target.value)}
              className="peer w-full border rounded-lg px-3 pt-5 pb-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <label className="absolute left-3 top-2 text-xs text-gray-500">
              Member Name
            </label>
          </div>

          <div className="relative">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="peer w-full border rounded-lg px-3 pt-5 pb-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <label className="absolute left-3 top-2 text-xs text-gray-500">
              Title (optional)
            </label>
          </div>
        </div>

        {/* UPLOAD BOX */}
        <label className="border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-gray-50 transition">
          <UploadCloud className="mb-2 text-gray-500" />
          <p className="text-sm text-gray-600">
            Click or drag images here
          </p>
          <span className="text-xs text-gray-400">
            Multiple files supported
          </span>

          <input
            type="file"
            multiple
            className="hidden"
            onChange={(e) => handleImageChange(e.target.files)}
          />
        </label>

        {/* PREVIEW */}
        {images.length > 0 && (
          <div>
            <div className="flex justify-between text-xs text-gray-500 mb-2">
              <span>{images.length} images selected</span>
              <button
                onClick={() => setImages([])}
                className="text-red-500"
              >
                Clear all
              </button>
            </div>

            <div className="grid grid-cols-3 gap-2 max-h-40 overflow-y-auto">
              {images.map((img, i) => (
                <div key={i} className="relative">
                  <img
                    src={img}
                    className="h-20 w-full object-cover rounded-xl"
                  />
                  <button
                    onClick={() => removeImage(i)}
                    className="absolute top-1 right-1 bg-black/70 text-white p-1 rounded-full"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* BOTTOM BUTTON */}
      <button
        onClick={handleSubmit}
        className=" w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-medium transition shadow"
      >
        Save Gallery
      </button>
    </div>
  );
}