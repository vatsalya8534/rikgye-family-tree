"use client";

import { useState } from "react";
import { Loader2, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

type Tab = "general" | "mail";

type SettingsForm = {
  siteTitle: string;
  siteKeywords: string;
  siteDescription: string;
  siteUrl: string;
  isSMTP: boolean;
  host: string;
  username: string;
  password: string;
  port: number | null;
  auth: boolean;
  encryption: string;
};

export default function SettingsPage() {
  const [formData, setFormData] = useState<SettingsForm>({
    siteTitle: "",
    siteKeywords: "",
    siteDescription: "",
    siteUrl: "",
    isSMTP: false,
    host: "",
    username: "",
    password: "",
    port: null,
    auth: false,
    encryption: "none",
  });

  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("general");

  const tabs: readonly Tab[] = ["general", "mail"];

  const handleSave = async () => {
    setLoading(true);

    try {
      const res = await fetch("/api/settings", {
        method: "POST", 
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const errorData = await res.json();
        console.error("SERVER ERROR:", errorData);
        throw new Error("Failed to save settings");
      }

      setOpen(true);
 
      setFormData({
        siteTitle: "",
        siteKeywords: "",
        siteDescription: "",
        siteUrl: "",
        isSMTP: false,
        host: "",
        username: "",
        password: "",
        port: null,
        auth: false,
        encryption: "none",
      });

    } catch (err) {
      console.error("SAVE ERROR:", err);
    }

    setLoading(false);
  };

  return (
    <div className="bg-gray-50 py-12 px-6 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <Card className="rounded-2xl shadow-sm border bg-white">
          
          <div className="px-10 py-8 border-b">
            <h1 className="text-3xl font-semibold">Settings</h1>
            <p className="text-sm text-muted-foreground mt-2">
              Manage your application configuration.
            </p>
          </div>

          <div className="px-10 pt-6 border-b flex gap-8">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-4 text-sm font-medium capitalize ${
                  activeTab === tab
                    ? "border-b-2 border-black text-black"
                    : "text-muted-foreground"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="px-10 py-10 space-y-10">

            {activeTab === "general" && (
              <div className="space-y-6">
                <Input
                  placeholder="Site Title"
                  value={formData.siteTitle}
                  onChange={(e) =>
                    setFormData({ ...formData, siteTitle: e.target.value })
                  }
                />

                <Input
                  placeholder="Site URL"
                  value={formData.siteUrl}
                  onChange={(e) =>
                    setFormData({ ...formData, siteUrl: e.target.value })
                  }
                />

                <Input
                  placeholder="Keywords"
                  value={formData.siteKeywords}
                  onChange={(e) =>
                    setFormData({ ...formData, siteKeywords: e.target.value })
                  }
                />

                <Textarea
                  rows={4}
                  placeholder="Description"
                  value={formData.siteDescription}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      siteDescription: e.target.value,
                    })
                  }
                />
              </div>
            )}

            {activeTab === "mail" && (
              <div className="space-y-6">

                <div className="flex justify-between items-center border p-4 rounded-xl bg-gray-50">
                  <span className="font-medium">Enable SMTP</span>
                  <Switch
                    checked={formData.isSMTP}
                    onCheckedChange={(val) =>
                      setFormData({ ...formData, isSMTP: val })
                    }
                  />
                </div>

                <Input
                  placeholder="Host"
                  disabled={!formData.isSMTP}
                  value={formData.host}
                  onChange={(e) =>
                    setFormData({ ...formData, host: e.target.value })
                  }
                />

                <Input
                  placeholder="Username"
                  disabled={!formData.isSMTP}
                  value={formData.username}
                  onChange={(e) =>
                    setFormData({ ...formData, username: e.target.value })
                  }
                />

                <Input
                  type="password"
                  placeholder="Password"
                  disabled={!formData.isSMTP}
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                />

                <Input
                  type="number"
                  placeholder="Port"
                  disabled={!formData.isSMTP}
                  value={formData.port ?? ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      port: e.target.value
                        ? Number(e.target.value)
                        : null,
                    })
                  }
                />

                <Select
                  disabled={!formData.isSMTP}
                  value={formData.auth ? "true" : "false"}
                  onValueChange={(val) =>
                    setFormData({
                      ...formData,
                      auth: val === "true",
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">Auth Enabled</SelectItem>
                    <SelectItem value="false">Auth Disabled</SelectItem>
                  </SelectContent>
                </Select>

                <Select
                  disabled={!formData.isSMTP}
                  value={formData.encryption}
                  onValueChange={(val) =>
                    setFormData({
                      ...formData,
                      encryption: val,
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    <SelectItem value="tls">TLS</SelectItem>
                    <SelectItem value="ssl">SSL</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="flex justify-end border-t pt-6">
              <Button onClick={handleSave} disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="animate-spin mr-2" />
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </div>
          </div>
        </Card>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="text-center py-6"
          >
            <CheckCircle2 className="text-green-600 w-14 h-14 mx-auto mb-4" />
            <DialogTitle>Saved Successfully 🎉</DialogTitle>
            <DialogDescription>
              Your settings have been saved.
            </DialogDescription>
            <div className="mt-6">
              <Button onClick={() => setOpen(false)}>Close</Button>
            </div>
          </motion.div>
        </DialogContent>
      </Dialog>
    </div>
  );
}