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

import { createFamilyMember } from "@/lib/actions/family-member";
import { Gender, Gender as GenderEnum } from "@/lib/generated/prisma/enums";
import { familyMemberSchema } from "@/lib/validators";
import { familyMemberDefaultValues } from "@/lib/contants";
import { Switch } from "@/components/ui/switch";
import z from "zod";
import { useEffect } from "react";
import { updateFamilyMember } from "@/lib/actions/family-member";


type FormData = z.infer<typeof familyMemberSchema>

interface MemberFormModalProps {
  open: boolean;
  onClose: () => void;
  // onSubmit: (data: Omit<FamilyMember, "id">) => void;
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
      : { ...familyMemberDefaultValues, parentId: defaultParentId ?? null },
  });

  useEffect(() => {
    if (editingMember) {
      form.reset(editingMember);
    } else {
      form.reset({
        ...familyMemberDefaultValues,
        parentId: defaultParentId ?? null,
      });
    }
  }, [editingMember, defaultParentId]);

  const handleFormSubmit: SubmitHandler<FormData> = async (values) => {
    const imageUrl = typeof values.image === "string" ? values.image : "";
    const newMember: any = await createFamilyMember({
      ...values,
      image: imageUrl,
      gender: values.gender ?? Gender.OTHER,
      parentId: values.parentId ?? null,
      userId: values.userId ?? null,
    });
    onSubmit(newMember);
    onClose();
  }

    return (
      <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">

          <DialogHeader>
            <DialogTitle className="font-display text-xl">
              {editingMember ? "Edit Member" : "Add Family Member"}
            </DialogTitle>
          </DialogHeader>

          <Form {...form}>
            <form
              className="space-y-4 mt-2"
              onSubmit={form.handleSubmit(handleFormSubmit)}
            >

              <div className="grid grid-cols-2 gap-4">

                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Full name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="image"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Image</FormLabel>
                      <FormControl>
                        <Input
                          type="file"
                          onChange={(e) => {
                            const file = e.target.files?.[0];

                            if (!file) return;

                            const reader = new FileReader();

                            reader.onloadend = () => {
                              field.onChange(reader.result as string);
                            };

                            reader.readAsDataURL(file);
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="gender"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Gender</FormLabel>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value={Gender.MALE}>Male</SelectItem>
                          <SelectItem value={Gender.FEMALE}>Female</SelectItem>
                          <SelectItem value={Gender.OTHER}>Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="birthDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Birth Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="birthPlace"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Birth Place</FormLabel>
                      <FormControl>
                        <Input placeholder="Birth place" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="isAlive"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between space-x-4">
                      <FormLabel className="m-0">Is Alive</FormLabel>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="currentResidence"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Current Residence</FormLabel>
                      <FormControl>
                        <Input placeholder="City / Country" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* EXTRA FIELDS */}
                <FormField
                  control={form.control}
                  name="causeOfDeath"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cause of Death</FormLabel>
                      <FormControl>
                        <Input placeholder="Cause of death" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="marriageDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Marriage Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="marriagePlace"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Marriage Place</FormLabel>
                      <FormControl>
                        <Input placeholder="Marriage place" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="spouseMaidenName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Spouse Maiden Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Spouse maiden name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="spouseFather"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Spouse Father</FormLabel>
                      <FormControl>
                        <Input placeholder="Spouse father name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="spouseMother"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Spouse Mother</FormLabel>
                      <FormControl>
                        <Input placeholder="Spouse mother name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="deathDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Death Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="deathPlace"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Death Place</FormLabel>
                      <FormControl>
                        <Input placeholder="Death place" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="profession"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Profession</FormLabel>
                      <FormControl>
                        <Input placeholder="Profession" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="Email" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone</FormLabel>
                      <FormControl>
                        <Input placeholder="Phone number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="parentId"
                  render={({ field }) => (
                    <FormItem className="col-span-2">
                      <FormLabel>Parent</FormLabel>

                      <Select
                        value={form.getValues("parentId") ?? "__none__"}
                        onValueChange={(v) => form.setValue("parentId", v === "__none__" ? null : v)}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="None (root)" />
                          </SelectTrigger>
                        </FormControl>

                        <SelectContent>
                          <SelectItem value="__none__">None (root)</SelectItem>
                          {/* {existingMembers.map((m) => (
                          <SelectItem key={m.id} value={m.id}>
                            {m.name}
                          </SelectItem>
                        ))} */}

                          {existingMembers
                            .filter((m) => m && m.id)
                            .map((m) => (
                              <SelectItem key={m.id} value={m.id}>
                                {m.name}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>

                      <FormMessage />
                    </FormItem>
                  )}
                />

              </div>

              <div className="flex gap-2 justify-end pt-2">
                <Button type="button" variant="outline" onClick={onClose}>
                  Cancel
                </Button>

                <Button type="submit">
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


