"use client";

import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FamilyMember } from "@/types";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import { Input } from "@/components/ui/input";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Button } from "@/components/ui/button";
import {
  createFamilyMember,
  updateFamilyMember,
} from "@/lib/actions/family-member";
import { Gender } from "@/lib/generated/prisma/enums";
import { familyMemberSchema } from "@/lib/validators";
import { familyMemberDefaultValues } from "@/lib/contants";
import { Switch } from "@/components/ui/switch";
import { X } from "lucide-react";
import z from "zod";
import { useEffect } from "react";

type FormData = z.infer<typeof familyMemberSchema>;

interface MemberFormModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: FamilyMember) => void;
  existingMembers: FamilyMember[];
  editingMember: FamilyMember | null;
  defaultParentId: string | null;
}

const MemberFormModal = ({
  open,
  onClose,
  onSubmit,
  existingMembers,
  editingMember,
  defaultParentId,
}: MemberFormModalProps) => {
  const form = useForm<FormData>({
    resolver: zodResolver(familyMemberSchema) as any,
    defaultValues: editingMember
      ? { ...familyMemberDefaultValues, ...editingMember }
      : {
          ...familyMemberDefaultValues,
          parentId: defaultParentId ?? null,
          relation: "",
        },
  });

  useEffect(() => {
    if (editingMember) {
      const formatDate = (date: any) => {
        if (!date) return "";
        if (typeof date === "string") return date.split("T")[0];
        return new Date(date).toISOString().split("T")[0];
      };

      form.reset({
        ...editingMember,
        relation: (editingMember as any)?.relation ?? "",
        birthDate: formatDate(editingMember.birthDate),
        marriageDate: formatDate(editingMember.marriageDate),
      });
    } else {
      form.reset({
        ...familyMemberDefaultValues,
        parentId: defaultParentId ?? null,
        relation: "",
      });
    }
  }, [editingMember, defaultParentId]);

  // ================= SUBMIT =================
  const handleFormSubmit: SubmitHandler<FormData> = async (values) => {
    const imageUrl = typeof values.image === "string" ? values.image : "";

    let parentId :any = values.parentId ?? null;
    let spouseId: string | null = null;
    const relation = values.relation;

    // ===== RELATION LOGIC =====
    if (relation === "CHILD" || relation === "STEP_CHILD") {
      parentId = values.parentId;
    }

    if (relation === "FATHER" || relation === "MOTHER") {
      parentId = null;
    }

    if (relation === "WIFE" || relation === "SPOUSE") {
      spouseId = values.parentId ?? null;
      parentId = null;
    }

    if (relation === "EX_WIFE") {
      spouseId = values.parentId ?? null;
      parentId = null;
    }

    // ===== CREATE / UPDATE =====
    if (!editingMember) {
      const isParent = relation === "FATHER" || relation === "MOTHER";

      const newMember: any = await createFamilyMember({
        ...values,
        relation,
        spouseId,
        parentId: isParent ? null : parentId,
        image: imageUrl,
        gender: values.gender ?? Gender.OTHER,
        userId: values.userId ?? null,
      });

      // 🔥 FIX: link child to new parent
      if (isParent && values.parentId) {
        await updateFamilyMember({
          id: values.parentId, // child
          parentId: newMember.id, // new parent
        });
      }

      onSubmit(newMember);
    } else {
      const updatedMember: any = await updateFamilyMember({
        ...editingMember,
        ...values,
        relation,
        spouseId,
        parentId,
        image: imageUrl,
        gender: values.gender ?? Gender.OTHER,
        userId: values.userId ?? null,
      });

      onSubmit(updatedMember);
    }

    onClose();
  };

  const isAlive = form.watch("isAlive");

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="theme-scrollbar sm:max-w-lg max-h-[90vh] overflow-y-auto rounded-xl border border-emerald-200 bg-emerald-50 p-0 shadow-lg [&>button]:hidden">
        {/* HEADER */}
        <DialogHeader className="bg-emerald-700 text-white px-6 py-4">
          <div className="flex items-center justify-between w-full">
            <DialogTitle className="text-lg font-semibold">
              {editingMember ? "Edit Member" : "Add Family Member"}
            </DialogTitle>

            <button onClick={onClose} className="ml-auto">
              <X className="h-5 w-5 text-white" />
            </button>
          </div>
        </DialogHeader>

        {/* FORM */}
        <div className="p-6">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleFormSubmit)}
              className="space-y-4"
            >
              <div className="grid grid-cols-2 gap-4">
                {/* NAME */}
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <Input {...field} />
                    </FormItem>
                  )}
                />

                {/* IMAGE */}
                <FormField
                  control={form.control}
                  name="image"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Image</FormLabel>
                      <Input
                        type="file"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          const reader = new FileReader();
                          reader.onloadend = () =>
                            field.onChange(reader.result as string);
                          reader.readAsDataURL(file);
                        }}
                      />
                    </FormItem>
                  )}
                />

                {/* RELATION */}
                <FormField
                  control={form.control}
                  name="relation"
                  render={({ field }) => (
                    <FormItem className="col-span-2">
                      <FormLabel>Relation</FormLabel>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select relation" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="FATHER">Father</SelectItem>
                          <SelectItem value="MOTHER">Mother</SelectItem>
                          <SelectItem value="CHILD">Child</SelectItem>
                          <SelectItem value="STEP_CHILD">Step Child</SelectItem>
                          <SelectItem value="WIFE">Wife</SelectItem>
                          <SelectItem value="EX_WIFE">Ex Wife</SelectItem>
                          <SelectItem value="SPOUSE">Spouse</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />

                {/* GENDER */}
                <FormField
                  control={form.control}
                  name="gender"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Gender</FormLabel>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value={Gender.MALE}>Male</SelectItem>
                          <SelectItem value={Gender.FEMALE}>Female</SelectItem>
                          <SelectItem value={Gender.OTHER}>Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />

                {/* BIRTH */}
                <FormField
                  control={form.control}
                  name="birthDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Birth Date</FormLabel>
                      <Input type="date" {...field} />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="birthPlace"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Birth Place</FormLabel>
                      <Input {...field} />
                    </FormItem>
                  )}
                />

                {/* ALIVE */}
                <FormField
                  control={form.control}
                  name="isAlive"
                  render={({ field }) => (
                    <FormItem className="flex justify-between p-3 border rounded-lg">
                      <FormLabel>Is Alive</FormLabel>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormItem>
                  )}
                />

                {!isAlive && (
                  <>
                    <FormField
                      control={form.control}
                      name="causeOfDeath"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Cause of Death</FormLabel>
                          <Input {...field} />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="deathDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Date of Death</FormLabel>
                          <Input type="date" {...field} />
                        </FormItem>
                      )}
                    />
                  </>
                )}

                {/* REST FIELDS */}
                <FormField
                  control={form.control}
                  name="currentResidence"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Current Residence</FormLabel>
                      <Input {...field} />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="marriageDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Marriage Date</FormLabel>
                      <Input type="date" {...field} />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="marriagePlace"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Marriage Place</FormLabel>
                      <Input {...field} />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="spouseMaidenName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Spouse Maiden Name</FormLabel>
                      <Input {...field} />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="spouseFather"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Spouse Father</FormLabel>
                      <Input {...field} />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="spouseMother"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Spouse Mother</FormLabel>
                      <Input {...field} />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="profession"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Profession</FormLabel>
                      <Input {...field} />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <Input type="email" {...field} />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone</FormLabel>
                      <Input {...field} />
                    </FormItem>
                  )}
                />

                {/* PARENT */}
                <FormField
                  control={form.control}
                  name="parentId"
                  render={() => (
                    <FormItem className="col-span-2">
                      <FormLabel>Select Person</FormLabel>
                      <Select
                        value={form.getValues("parentId") ?? "__none__"}
                        onValueChange={(v) =>
                          form.setValue("parentId", v === "__none__" ? null : v)
                        }
                      >
                        <SelectTrigger>
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

              {/* BUTTONS */}
              <div className="flex justify-end gap-3 pt-3">
                <Button type="button" variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingMember ? "Save Changes" : "Add Member"}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MemberFormModal;
