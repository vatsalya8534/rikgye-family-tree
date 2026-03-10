"use client"

import { useState } from "react"

export default function AddMember() {
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: any) => {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.target)

    const res = await fetch("/api/member", {
      method: "POST",
      body: formData,
    })

    if (res.ok) {
      alert("Member Added Successfully!")
      e.target.reset()
    } else {
      alert("Error adding member")
    }

    setLoading(false)
  }

  return (
    <div className="max-w-xl mx-auto mt-20">
      <h2 className="text-3xl font-serif mb-6">
        Add Family Member
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">

        <input
          type="text"
          name="name"
          placeholder="Full Name"
          required
          className="w-full border p-3"
        />

        <input
          type="text"
          name="role"
          placeholder="Role / Title"
          required
          className="w-full border p-3"
        />

        <textarea
          name="bio"
          placeholder="Biography"
          required
          rows={4}
          className="w-full border p-3"
        />

        <input
          type="file"
          name="image"
          accept="image/png, image/jpeg"
          required
          className="w-full"
        />

        <button
          type="submit"
          disabled={loading}
          className="bg-black text-white px-6 py-3"
        >
          {loading ? "Uploading..." : "Add Member"}
        </button>
      </form>
    </div>
  )
}