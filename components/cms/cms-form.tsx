"use client";

import { cmsSchema } from '@/lib/validators'
import { CMS } from '@/types'
import { zodResolver } from '@hookform/resolvers/zod'
import React, { useEffect, useState } from 'react'
import { SubmitHandler, useForm } from 'react-hook-form'
import { toast } from 'sonner'
import z from 'zod'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form'
import { Input } from '../ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { Button } from '../ui/button'
import { ArrowRight, Loader } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { cmsDefaultValues } from '@/lib/contants'
import { Status } from '@/lib/generated/prisma/enums'
import { createPage, updatePage } from '@/lib/actions/cms-action'
import { Textarea } from '../ui/textarea'

type CMSFormProps = {
  data?: CMS
  update?: boolean
}

const CMSForm = ({ data, update = false }: CMSFormProps) => {

  const [mounted, setMounted] = useState(false)

  const router = useRouter()
  const id = data?.id

  const form = useForm<z.infer<typeof cmsSchema>>({
    resolver: zodResolver(cmsSchema) as any,
    defaultValues: data || cmsDefaultValues
  })

  const [isPending, startTransition] = React.useTransition()

  const onSubmit: SubmitHandler<z.infer<typeof cmsSchema>> = async (values: any) => {

    startTransition(async () => {

      let res

      if (values.pageIcon instanceof File) {

        const formData = new FormData()
        formData.append("pageIcon", values.pageIcon)
        formData.append("key", "pageIcon")

        const fileUploadRes = await fetch("/api/upload", {
          method: "POST",
          body: formData
        })

        const data = await fileUploadRes.json()
        values.pageIcon = data.url
      }

      if (update && id) {
        res = await updatePage(values, id)
      } else {
        res = await createPage(values)
      }

      if (!res?.success) {
        toast.error("Error", {
          description: res?.message
        })
      } else {
        router.push("/admin/cms")
      }

    })

  }

  useEffect(() => {
    setMounted(true)
  }, [])
  if (mounted) {
    
    return (
      <Form {...form}>
        <form
          className="space-y-6"
          onSubmit={form.handleSubmit(onSubmit, (errors) => console.log(errors))}
        >
          <div className="grid grid-cols-2 gap-6">
            <div className="flex flex-col gap-2 col-span-2">
              <FormField
                control={form.control}
                name="pageTitle"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel htmlFor="pageTitle" className="text-emerald-900 dark:text-emerald-200">
                      Page Title
                    </FormLabel>
                    <FormControl>
                      <Input
                        id="pageTitle"
                        placeholder="Enter Page Title"
                        className="focus-visible:ring-emerald-500"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="flex flex-col gap-2">
              <FormField
                control={form.control}
                name="pageIcon"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-emerald-900 dark:text-emerald-200">
                      Page Icon
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="file"
                        className="cursor-pointer focus-visible:ring-emerald-500"
                        onChange={(e) => field.onChange(e.target.files?.[0])}
                      />
                    </FormControl>
                    <FormMessage />
                    {data?.pageIcon && (
                      <div className="mt-3">
                        <img
                          src={data.pageIcon}
                          alt=""
                          className="h-16 w-16 rounded-md border border-emerald-200 object-cover"
                        />
                      </div>
                    )}

                  </FormItem>
                )}
              />
            </div>
            <div className="flex flex-col gap-2">
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-emerald-900 dark:text-emerald-200">
                      Status
                    </FormLabel>
                    <FormControl>
                      <Select
                        defaultValue={field.value}
                        onValueChange={(v) => field.onChange(v as Status)}
                      >
                        <SelectTrigger className="w-full focus:ring-emerald-500">
                          <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value={Status.ACTIVE}>Active</SelectItem>
                          <SelectItem value={Status.INACTIVE}>Inactive</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="flex flex-col gap-2 col-span-2">
              <FormField
                control={form.control}
                name="pageContent"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel htmlFor="pageContent" className="text-emerald-900 dark:text-emerald-200">
                      Page Content
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        id="pageContent"
                        placeholder="Enter Page Content"
                        className="min-h-[120px] focus-visible:ring-emerald-500"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
          <div className="flex gap-3 pt-2">

            <Button
              type="submit"
              disabled={isPending}
              className="bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-2"
            >

              {isPending
                ? <Loader className="w-4 h-4 animate-spin" />
                : <ArrowRight className="w-4 h-4" />
              }

              Save

            </Button>

          </div>

        </form>

      </Form>
    )
  }
}

export default CMSForm