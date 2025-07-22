
'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { format } from 'date-fns'

import { Shift, User } from '@/types'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'

const formSchema = z.object({
  userId: z.string().min(1, 'A user must be selected'),
  userName: z.string(), // This will be populated based on the selected userId
  date: z.string(),
  startTime: z.string().regex(/^\d{2}:\d{2}$/, 'Invalid time format (HH:MM)'),
  endTime: z.string().regex(/^\d{2}:\d{2}$/, 'Invalid time format (HH:MM)'),
  title: z.string().optional(),
})

interface ShiftFormProps {
  initialData: Partial<Shift> | null
  staffUsers: User[]
  closeDialog: () => void
}

export function ShiftForm({
  initialData,
  staffUsers,
  closeDialog,
}: ShiftFormProps) {
  const { toast } = useToast()
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      userId: initialData?.userId || '',
      userName: initialData?.userName || '',
      date: initialData?.date || format(new Date(), 'yyyy-MM-dd'),
      startTime: initialData?.startTime || '',
      endTime: initialData?.endTime || '',
      title: initialData?.title || '',
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const selectedUser = staffUsers.find(u => u.id === values.userId)
    if (!selectedUser) {
        toast({
            variant: 'destructive',
            title: 'Error',
            description: 'Invalid user selected.',
        })
        return
    }

    const submissionData = {
        ...values,
        userName: selectedUser.name,
    };

    const method = initialData?.id ? 'PUT' : 'POST';
    const url = initialData?.id ? `/api/shifts/${initialData.id}` : '/api/shifts';

    try {
        const response = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(submissionData),
        });

        if (!response.ok) throw new Error('Failed to save shift.');

        toast({
            title: 'Shift Saved',
            description: 'The shift has been successfully saved.',
        });
        closeDialog();
    } catch (error) {
        toast({
            variant: 'destructive',
            title: 'Error',
            description: String(error),
        });
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="userId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Staff Member</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a staff member" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {staffUsers.map(user => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
            control={form.control}
            name="startTime"
            render={({ field }) => (
                <FormItem>
                    <FormLabel>Start Time</FormLabel>
                    <FormControl>
                        <Input type="time" {...field} />
                    </FormControl>
                    <FormMessage />
                </FormItem>
            )}
        />
        <FormField
            control={form.control}
            name="endTime"
            render={({ field }) => (
                <FormItem>
                    <FormLabel>End Time</FormLabel>
                    <FormControl>
                        <Input type="time" {...field} />
                    </FormControl>
                    <FormMessage />
                </FormItem>
            )}
        />
        <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
                <FormItem>
                    <FormLabel>Title (Optional)</FormLabel>
                    <FormControl>
                        <Input placeholder="e.g. Barista" {...field} />
                    </FormControl>
                </FormItem>
            )}
        />
        <div className="flex justify-end space-x-4">
            <Button type="button" variant="outline" onClick={closeDialog}>Cancel</Button>
            <Button type="submit">Save Shift</Button>
        </div>
      </form>
    </Form>
  )
}
