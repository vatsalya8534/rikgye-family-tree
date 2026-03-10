"use client"

import { useEffect, useState } from "react"
import {
  Loader2,
  CheckCircle2,
  Trash2,
  Pencil,
  Settings,
  Mail,
  FileText
} from "lucide-react"

import { motion } from "framer-motion"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Card } from "@/components/ui/card"

import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent
} from "@/components/ui/tabs"

import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent
} from "@/components/ui/accordion"

import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription
} from "@/components/ui/dialog"

type Template = {
  id: string
  name: string
  description: string
}

type SettingsForm = {
  id: string
  siteTitle: string
  siteKeywords: string
  siteDescription: string
  siteUrl: string
  logo?: string
  favicon?: string
  isSMTP: boolean
  host: string
  username: string
  password: string
  port: number | null
}

export default function SettingsPage() {

  const [formData, setFormData] = useState<SettingsForm>({
    id: "",
    siteTitle: "",
    siteKeywords: "",
    siteDescription: "",
    siteUrl: "",
    logo: "",
    favicon: "",
    isSMTP: false,
    host: "",
    username: "",
    password: "",
    port: null
  })

  const [templates, setTemplates] = useState<Template[]>([])

  const [templateName, setTemplateName] = useState("")
  const [templateDescription, setTemplateDescription] = useState("")

  const [editingId, setEditingId] = useState<string | null>(null)

  const [editTemplateName, setEditTemplateName] = useState("")
  const [editTemplateDescription, setEditTemplateDescription] = useState("")

  const [editOpen, setEditOpen] = useState(false)

  const [loading, setLoading] = useState(false)
  const [templateLoading, setTemplateLoading] = useState(false)

  const [successOpen, setSuccessOpen] = useState(false)

  const handleFile = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: "logo" | "favicon"
  ) => {

    const file = e.target.files?.[0]
    if (!file) return

    const preview = URL.createObjectURL(file)

    setFormData({
      ...formData,
      [field]: preview
    })
  }

  const getData = async () => {
    const res = await fetch("/api/settings")
    const data = await res.json()
    if (data) setFormData(data)
  }

  const handleSave = async () => {

    setLoading(true)

    await fetch("/api/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData)
    })

    setLoading(false)
    setSuccessOpen(true)
  }

  const fetchTemplates = async () => {
    const res = await fetch("/api/templates")
    const data = await res.json()
    if (Array.isArray(data)) setTemplates(data)
  }

  const createTemplate = async () => {

    if (!templateName) return

    setTemplateLoading(true)

    await fetch("/api/templates", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: templateName,
        description: templateDescription
      })
    })

    setTemplateName("")
    setTemplateDescription("")

    fetchTemplates()

    setTemplateLoading(false)
  }

  const deleteTemplate = async (id: string) => {

    await fetch(`/api/templates/${id}`, { method: "DELETE" })

    fetchTemplates()
  }

  const openEditDialog = (template: Template) => {

    setEditingId(template.id)

    setEditTemplateName(template.name)
    setEditTemplateDescription(template.description)

    setEditOpen(true)
  }

  const updateTemplate = async () => {

    if (!editingId) return

    await fetch(`/api/templates/${editingId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: editTemplateName,
        description: editTemplateDescription
      })
    })

    setEditOpen(false)
    setEditingId(null)

    setEditTemplateName("")
    setEditTemplateDescription("")

    fetchTemplates()
  }

  useEffect(() => {
    getData()
    fetchTemplates()
  }, [])

  return (

    <div className="p-8 space-y-6">

      <div>
        <h1 className="text-2xl font-semibold">Settings</h1>
        <p className="text-muted-foreground text-sm">
          Manage your application settings
        </p>
      </div>

      <Tabs defaultValue="general">

        <TabsList className="grid grid-cols-3 w-[400px]">

          <TabsTrigger value="general">
            <Settings className="w-4 h-4 mr-2" />
            General
          </TabsTrigger>

          <TabsTrigger value="mail">
            <Mail className="w-4 h-4 mr-2" />
            Mail
          </TabsTrigger>

          <TabsTrigger value="templates">
            <FileText className="w-4 h-4 mr-2" />
            Templates
          </TabsTrigger>

        </TabsList>

        <TabsContent value="general">

          <Card className="p-6 space-y-6 max-w-3xl">

            <div className="grid gap-4">

              <div className="space-y-2">
                <label className="text-sm font-medium">Site Title</label>
                <Input
                  placeholder="Site Title"
                  value={formData.siteTitle}
                  onChange={(e) =>
                    setFormData({ ...formData, siteTitle: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Site URL</label>
                <Input
                  placeholder="Site URL"
                  value={formData.siteUrl}
                  onChange={(e) =>
                    setFormData({ ...formData, siteUrl: e.target.value })
                  }
                />
              </div>

              <div className="grid grid-cols-2 gap-6">

                <div className="space-y-2">
                  <label className="text-sm font-medium">Logo</label>

                  {formData.logo && (
                    <div className="border rounded-md p-2 w-fit">
                      <img
                        src={formData.logo}
                        alt="logo"
                        className="h-12 object-contain"
                      />
                    </div>
                  )}

                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFile(e, "logo")}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Favicon</label>

                  {formData.favicon && (
                    <div className="border rounded-md p-2 w-fit">
                      <img
                        src={formData.favicon}
                        alt="favicon"
                        className="h-8 w-8 object-contain"
                      />
                    </div>
                  )}

                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFile(e, "favicon")}
                  />
                </div>

              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Site Keywords</label>
                <Input
                  placeholder="Site Keywords"
                  value={formData.siteKeywords}
                  onChange={(e) =>
                    setFormData({ ...formData, siteKeywords: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Site Description</label>
                <Textarea
                  placeholder="Site Description"
                  value={formData.siteDescription}
                  onChange={(e) =>
                    setFormData({ ...formData, siteDescription: e.target.value })
                  }
                />
              </div>

            </div>

            <Button onClick={handleSave} disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="animate-spin mr-2" />
                  Saving
                </>
              ) : "Save Changes"}
            </Button>

          </Card>

        </TabsContent>

        <TabsContent value="mail">

          <Card className="p-6 space-y-6 max-w-3xl">

            <div className="flex items-center justify-between border rounded-lg p-4">

              <div>
                <p className="font-medium">Enable SMTP</p>
                <p className="text-sm text-muted-foreground">
                  Use external SMTP mail server
                </p>
              </div>

              <Switch
                checked={formData.isSMTP}
                onCheckedChange={(v) =>
                  setFormData({ ...formData, isSMTP: v })
                }
              />

            </div>

            <div className="grid gap-4">

              <div className="space-y-2">
                <label className="text-sm font-medium">SMTP Host</label>
                <Input
                  placeholder="SMTP Host"
                  disabled={!formData.isSMTP}
                  value={formData.host}
                  onChange={(e) =>
                    setFormData({ ...formData, host: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Username</label>
                <Input
                  placeholder="Username"
                  disabled={!formData.isSMTP}
                  value={formData.username}
                  onChange={(e) =>
                    setFormData({ ...formData, username: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Password</label>
                <Input
                  type="password"
                  placeholder="Password"
                  disabled={!formData.isSMTP}
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Port</label>
                <Input
                  type="number"
                  placeholder="Port"
                  disabled={!formData.isSMTP}
                  value={formData.port ?? ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      port: e.target.value ? Number(e.target.value) : null
                    })
                  }
                />
              </div>

            </div>

            <Button onClick={handleSave}>
              Save Mail Settings
            </Button>

          </Card>

        </TabsContent>

        <TabsContent value="templates">

          <Card className="p-6 space-y-6 max-w-3xl">

            <Accordion type="multiple">

              <AccordionItem value="create">

                <AccordionTrigger>
                  Create Template
                </AccordionTrigger>

                <AccordionContent className="space-y-4">

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Template Name</label>
                    <Input
                      placeholder="Template Name"
                      value={templateName}
                      onChange={(e) => setTemplateName(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Description</label>
                    <Textarea
                      placeholder="Description"
                      value={templateDescription}
                      onChange={(e) => setTemplateDescription(e.target.value)}
                    />
                  </div>

                  <Button
                    onClick={createTemplate}
                    disabled={templateLoading}
                  >
                    {templateLoading ? (
                      <>
                        <Loader2 className="animate-spin mr-2" />
                        Creating
                      </>
                    ) : "Create Template"}
                  </Button>

                </AccordionContent>

              </AccordionItem>

            </Accordion>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">

              {templates.map((t) => (
                <Card key={t.id} className="p-4 relative">

                  <h4 className="font-semibold">{t.name}</h4>

                  <p className="text-sm text-muted-foreground mt-2">
                    {t.description}
                  </p>

                  <div className="absolute top-3 right-3 flex gap-2">

                    <Button
                      size="icon"
                      variant="secondary"
                      onClick={() => openEditDialog(t)}
                    >
                      <Pencil size={16} />
                    </Button>

                    <Button
                      size="icon"
                      variant="destructive"
                      onClick={() => deleteTemplate(t.id)}
                    >
                      <Trash2 size={16} />
                    </Button>

                  </div>

                </Card>
              ))}

            </div>

          </Card>

        </TabsContent>

      </Tabs>

      <Dialog open={successOpen} onOpenChange={setSuccessOpen}>

        <DialogContent>

          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="text-center py-6"
          >

            <CheckCircle2 className="text-green-600 w-14 h-14 mx-auto mb-4" />

            <DialogTitle>
              Settings Saved 🎉
            </DialogTitle>

            <DialogDescription>
              Your changes were saved successfully.
            </DialogDescription>

            <Button
              className="mt-6"
              onClick={() => setSuccessOpen(false)}
            >
              Close
            </Button>

          </motion.div>

        </DialogContent>

      </Dialog>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>

        <DialogContent>

          <DialogTitle>
            Edit Template
          </DialogTitle>

          <div className="space-y-4 mt-4">

            <div className="space-y-2">
              <label className="text-sm font-medium">Template Name</label>
              <Input
                placeholder="Template Name"
                value={editTemplateName}
                onChange={(e) => setEditTemplateName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <Textarea
                placeholder="Description"
                value={editTemplateDescription}
                onChange={(e) => setEditTemplateDescription(e.target.value)}
              />
            </div>

            <div className="flex justify-end gap-2">

              <Button
                variant="outline"
                onClick={() => setEditOpen(false)}
              >
                Cancel
              </Button>

              <Button onClick={updateTemplate}>
                Update Template
              </Button>

            </div>

          </div>

        </DialogContent>

      </Dialog>

    </div>
  )
}