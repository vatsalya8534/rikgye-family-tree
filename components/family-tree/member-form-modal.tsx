"use client";

import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FamilyMember } from "@/types";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Form, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";
import { CalendarIcon, UploadCloud, X } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { useRouter } from "next/navigation";
import { createFamilyMember, updateFamilyMember } from "@/lib/actions/family-member";
import { Gender } from "@/lib/generated/prisma/enums";
import { familyMemberSchema } from "@/lib/validators";
import { familyMemberDefaultValues } from "@/lib/contants";
import { useEffect } from "react";
import z from "zod";

type FormData = z.infer<typeof familyMemberSchema>;

interface MemberFormModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: FamilyMember) => void;
  existingMembers: FamilyMember[];
  editingMember: FamilyMember | null;
  defaultParentId: string | null;
  parentName: string;
  title: string;
  description: string;
  initialMode: "person" | "spouse";
  parentGender: Gender | null;
}

const getGenderFromRelation = (relation: string): Gender => {
  switch (relation) {
    case "FATHER":
    case "SON":
    case "HUSBAND":
    case "EX_HUSBAND":
      return Gender.MALE;
    case "MOTHER":
    case "DAUGHTER":
    case "WIFE":
    case "EX_WIFE":
      return Gender.FEMALE;
    default:
      return Gender.MALE;
  }
};

const MemberFormModal = ({
  open,
  onClose,
  onSubmit,
  existingMembers,
  editingMember,
  defaultParentId,
  parentName,
  title,
  description,
  initialMode,
  parentGender

}: MemberFormModalProps) => {
  const router = useRouter();

  // Set default relation for spouse mode
  let defaultRelation = "";
  if (initialMode === "spouse") {
    if (parentGender === Gender.MALE) {
      defaultRelation = "WIFE";
    } else if (parentGender === Gender.FEMALE) {
      defaultRelation = "HUSBAND";
    }
  }

  const form = useForm<FormData>({
    resolver: zodResolver(familyMemberSchema) as any,
    defaultValues: editingMember
      ? {
        ...familyMemberDefaultValues,
        ...editingMember,
        image: Array.isArray(editingMember.image)
          ? editingMember.image
          : editingMember.image
            ? [editingMember.image]
            : [],
        relation: editingMember.relation ?? "",
        parentId: editingMember.parentId ?? defaultParentId ?? null,
        birthDate: editingMember.birthDate,
        marriageDate: editingMember.marriageDate
          ? editingMember.marriageDate.split("T")[0]
          : "",
        type: editingMember.type ?? "",
      }
      : {
        ...familyMemberDefaultValues,
        image: [],
        parentId: defaultParentId ?? null,
        relation: defaultRelation,
        type: "",
      },
  });

  let relationWatch = form.watch("relation");

  useEffect(() => {
    if (relationWatch) {
      if (relationWatch.toLowerCase().includes("ex")) {
        form.setValue("type", "ex");
      } else {
        form.setValue("type", "current");
      }
    } else {
      form.setValue("type", "");
    }
  }, [relationWatch]);

  useEffect(() => {
    if (editingMember) {
      const formatDate = (date?: string | Date | null) => {
        if (!date) return "";
        if (typeof date === "string") return date.split("T")[0];
        return new Date(date).toISOString().split("T")[0];
      };

      form.reset({
        ...editingMember,
        image: Array.isArray(editingMember.image)
          ? editingMember.image
          : editingMember.image
            ? [editingMember.image]
            : [],
        relation: editingMember.relation ?? defaultRelation,
        parentId: editingMember.parentId ?? defaultParentId ?? null,
        birthDate: formatDate(editingMember.birthDate),
        marriageDate: formatDate(editingMember.marriageDate),
        type: editingMember.type ?? "",
      });
    } else {
      form.reset({
        ...familyMemberDefaultValues,
        image: [],
        parentId: defaultParentId ?? null,
        relation: defaultRelation,
        type: "",
      });
    }

  }, [editingMember, defaultParentId, defaultRelation]);

  const handleFormSubmit: SubmitHandler<FormData> = async (values) => {

    const uploadedUrls: string[] = [];
    if (values.image) {
      for (const img of values.image) {
        if (!(img instanceof File)) continue;
        const formData = new FormData();
        formData.append("file", img);
        formData.append("key", "file");
        const res = await fetch("/api/upload", { method: "POST", body: formData });
        const data = await res.json();
        uploadedUrls.push(data.url);
      }
    }

    // Replace File objects with uploaded URLs
    if (values.image) {
      values.image = values.image.map((img) => (img instanceof File ? uploadedUrls.shift()! : img));
    }

    let parentId: string | null = values.parentId ?? null;
    let spouseId: string | null = null;
    const relation = values.relation || '';
    const isEditingSpouse = editingMember && initialMode === "spouse";

    // For spouse editing, treat parentId as spouseId
    if (isEditingSpouse) {
      spouseId = values.parentId ?? null;
      parentId = null;
    } else if (["WIFE", "SPOUSE", "EX_WIFE", "HUSBAND", "EX_HUSBAND"].includes(relation)) {
      spouseId = values.parentId ?? null;
      parentId = null;
    }

    const derivedGender = getGenderFromRelation(relation);

    if (!editingMember) {
      const newMember: any = await createFamilyMember({
        ...values,
        relation,
        spouseId,
        parentId,
        image: values.image ?? [],
        gender: derivedGender,
        userId: values.userId ?? null,
      });

      form.reset();
      router.refresh();
      onSubmit(newMember);
    } else {
      const updatedMember: any = await updateFamilyMember({
        ...editingMember,
        ...values,
        relation,
        spouseId,
        parentId,
        image: values.image,
        gender: derivedGender,
        userId: values.userId ?? null,
      });

      form.reset();
      router.refresh();
      onSubmit(updatedMember);
    }

    onClose();
  };

  const isAlive = form.watch("isAlive");

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-xl h-[92vh] flex flex-col overflow-hidden rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50 via-white to-emerald-100 p-0 shadow-2xl [&>button]:hidden">
        <DialogHeader className="bg-gradient-to-r from-emerald-600 to-emerald-800 text-white px-6 py-5 shadow-md">
          <div className="flex items-center justify-between w-full">
            <DialogTitle className="text-xl font-semibold">
              {title} {parentName && `for ${parentName}`}
            </DialogTitle>
            <button onClick={onClose} className="p-1 rounded-full hover:bg-white/20 transition">
              <X className="h-5 w-5" />
            </button>

          </div>
          <DialogDescription className="text-white">
            Fill in the details to add a new family member.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleFormSubmit, (error) => console.error(error))} className="flex flex-col flex-1 overflow-hidden">
            <div className="flex-1 overflow-hidden p-5">
              <Tabs defaultValue="general" className="flex flex-col h-full">
                <div className="sticky top-0 z-40 bg-gradient-to-b from-emerald-50 to-transparent pb-2">
                  <TabsList className="flex w-full bg-emerald-100/70 backdrop-blur-md rounded-xl p-1 shadow-inner border border-emerald-200 gap-1">
                    {["general", "images", "relation", "live"].map((tab) => (
                      <TabsTrigger
                        key={tab}
                        value={tab}
                        className="flex-1 rounded-lg px-3 py-2 text-sm font-medium text-gray-600 data-[state=active]:bg-emerald-600 data-[state=active]:text-white transition-all"
                      >
                        {tab === "live" ? "Life Status" : tab.charAt(0).toUpperCase() + tab.slice(1)}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                </div>

                {/* GENERAL TAB */}
                <TabsContent value="general">
                  <div className="grid grid-cols-2 gap-5">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Name</FormLabel>
                          <Input  {...field} className="rounded-lg shadow-sm" />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="birthDate"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>Birth Date</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                type="button"
                                variant="outline"
                                className={cn(
                                  "w-full justify-start text-left font-normal rounded-lg shadow-sm",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {field.value ? format(new Date(field.value), "dd MMM yyyy") : "Select birth date"}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={field.value ? new Date(field.value + "T00:00:00") : undefined}
                                onSelect={(date) => {
                                  if (!date) return;
                                  field.onChange(format(date, "yyyy-MM-dd"));
                                }}
                                disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                                captionLayout="dropdown"
                                fromYear={1900}
                                toYear={new Date().getFullYear()}
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="birthPlace"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Birth Place</FormLabel>
                          <Input {...field} value={field.value ?? ""} className="rounded-lg shadow-sm" />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="currentResidence"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Current Residence</FormLabel>
                          <Input {...field} value={field.value ?? ""} className="rounded-lg shadow-sm" />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="profession"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Profession</FormLabel>
                          <Input {...field} value={field.value ?? ""} className="rounded-lg shadow-sm" />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <Input {...field} value={field.value ?? ""} className="rounded-lg shadow-sm" />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone</FormLabel>
                          <Input {...field} value={field.value ?? ""} className="rounded-lg shadow-sm" />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="parentId"
                      render={() => (
                        <FormItem className="col-span-2">
                          <FormLabel>Select Person</FormLabel>
                          <Select
                            disabled
                            value={form.getValues("parentId") ?? "__none__"}
                            onValueChange={(v) => form.setValue("parentId", v === "__none__" ? null : v)}
                          >
                            <SelectTrigger className="rounded-lg shadow-sm">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="__none__">None</SelectItem>
                              {existingMembers.map((m) => (
                                <SelectItem key={m.id} value={m.id}>
                                  {m.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormItem>
                      )}
                    />
                  </div>
                </TabsContent>

                {/* IMAGES TAB */}
                <TabsContent value="images">
                  <FormField
                    control={form.control}
                    name="image"
                    render={({ field }) => (
                      <FormItem className="flex flex-col gap-4">
                        <label className="border-2 border-dashed rounded-2xl p-8 flex flex-col items-center cursor-pointer bg-white hover:shadow-lg transition">
                          <UploadCloud className="text-emerald-500 mb-2" />
                          <p>Upload Images</p>
                          <input
                            type="file"
                            multiple
                            className="hidden"
                            onChange={(e) => {
                              if (!e.target.files) return;
                              field.onChange([...(field.value || []), ...Array.from(e.target.files)]);
                            }}
                          />
                        </label>
                        {(field.value?.length ?? 0) > 0 && (
                          <div className="flex flex-wrap gap-3">
                            {field.value?.map((img: File | string, idx) => {
                              const src = img instanceof File ? URL.createObjectURL(img) : img;
                              return (
                                <div key={idx} className="relative w-24 h-24 rounded-xl overflow-hidden shadow-md">
                                  <img src={src} className="w-full h-full object-cover" />
                                  <button
                                    type="button"
                                    className="absolute top-1 right-1 bg-white rounded-full p-1"
                                    onClick={() => field.onChange((field.value || []).filter((_, i) => i !== idx))}
                                  >
                                    <X className="w-3 h-3 text-red-500" />
                                  </button>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </FormItem>
                    )}
                  />
                </TabsContent>

                {/* RELATION TAB */}
                <TabsContent value="relation">
                  <div className="grid grid-cols-2 gap-5">
                    <FormField
                      control={form.control}
                      name="relation"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Relation</FormLabel>
                          <Select value={field.value} onValueChange={field.onChange}>
                            <SelectTrigger className="rounded-lg shadow-sm w-full">
                              <SelectValue placeholder="Select relation" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="FATHER">Father</SelectItem>
                              <SelectItem value="MOTHER">Mother</SelectItem>
                              <SelectItem value="SON">SON</SelectItem>
                              <SelectItem value="DAUGHTER">DAUGHTER</SelectItem>
                              <SelectItem value="WIFE">Wife</SelectItem>
                              <SelectItem value="EX_WIFE">Ex Wife</SelectItem>
                              <SelectItem value="HUSBAND">Husband</SelectItem>
                              <SelectItem value="EX_HUSBAND">Ex Husband</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormItem>
                      )}
                    />

                    <FormField control={form.control} name="marriagePlace" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Marriage Place</FormLabel>
                        <Input {...field} value={field.value ?? ""} className="rounded-lg shadow-sm" />
                      </FormItem>
                    )} />

                    <FormField control={form.control} name="marriageDate" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Marriage Date</FormLabel>
                        <Input type="date"  {...field} className="rounded-lg shadow-sm" />
                      </FormItem>
                    )} />

                    <FormField control={form.control} name="spouseMaidenName" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Spouse Maiden Name</FormLabel>
                        <Input {...field} value={field.value ?? ""} className="rounded-lg shadow-sm" />
                      </FormItem>
                    )} />

                    <FormField control={form.control} name="spouseFather" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Spouse Father</FormLabel>
                        <Input {...field} value={field.value ?? ""} className="rounded-lg shadow-sm" />
                      </FormItem>
                    )} />

                    <FormField control={form.control} name="spouseMother" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Spouse Mother</FormLabel>
                        <Input {...field} value={field.value ?? ""} className="rounded-lg shadow-sm" />
                      </FormItem>
                    )} />
                  </div>
                </TabsContent>

                {/* LIFE TAB */}
                <TabsContent value="live">
                  <div className="grid grid-cols-2 gap-5">
                    <FormField control={form.control} name="isAlive" render={({ field }) => (
                      <FormItem className="flex justify-between p-4 border rounded-xl bg-white shadow-sm">
                        <FormLabel>Is Alive</FormLabel>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormItem>
                    )} />
                    {!isAlive && (
                      <>
                        <FormField control={form.control} name="causeOfDeath" render={({ field }) => (
                          <FormItem>
                            <FormLabel>Cause of Death</FormLabel>
                            <Input {...field} value={field.value ?? ""} className="rounded-lg shadow-sm" />
                          </FormItem>
                        )} />
                        <FormField control={form.control} name="deathDate" render={({ field }) => (
                          <FormItem>
                            <FormLabel>Date of Death</FormLabel>
                            <Input type="date" {...field} value={field.value ?? ""} className="rounded-lg shadow-sm" />
                          </FormItem>
                        )} />
                      </>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </div>

            <div className="shrink-0 border-t p-4 flex justify-end gap-3 bg-white shadow-[0_-6px_20px_rgba(0,0,0,0.06)]">
              <Button variant="outline" onClick={onClose}>Cancel</Button>
              <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700">
                {editingMember ? "Save Changes" : "Add Member"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default MemberFormModal;
