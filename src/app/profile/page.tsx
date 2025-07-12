<<<<<<< HEAD

'use client';

import React, { useState, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Edit3, UserCircle, Mail, Phone, Briefcase as BriefcaseIcon, ShieldCheck } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { User } from '@/types';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { MOCK_USER } from '@/lib/mock-user';


export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(MOCK_USER);
  const { toast } = useToast();
  
  const [isEditing, setIsEditing] = useState(false);
  const [editableUser, setEditableUser] = useState<User | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  
  useEffect(() => {
    setEditableUser(user);
  }, [user]);

  const getInitials = (name?: string) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditableUser(prev => prev ? { ...prev, [name]: value } : null);
  };

  const handleSave = async () => {
    if (editableUser) {
      setIsSaving(true);
      // In a real app, you'd save this to a backend.
      // For now, we just update the local state.
      console.log("Saving user (mock):", editableUser);
      setUser(editableUser);
      toast({ title: "Profile Updated", description: "Your profile information has been saved." });
      setIsEditing(false);
      setIsSaving(false);
    }
  };

  if (!user) {
    return <ProfileSkeleton />;
  }

  return (
    <div className="container mx-auto py-8">
      <Card className="max-w-2xl mx-auto shadow-xl rounded-xl">
        <CardHeader className="text-center p-8 bg-gradient-to-br from-primary/10 to-transparent">
          <Avatar className="w-32 h-32 mx-auto mb-4 border-4 border-background shadow-lg">
            <AvatarImage src={user.avatarUrl} alt={user.name} />
            <AvatarFallback className="text-4xl">{getInitials(user.name)}</AvatarFallback>
          </Avatar>
          <CardTitle className="text-3xl font-headline">{user.name}</CardTitle>
          <CardDescription className="text-lg capitalize text-muted-foreground">{user.role}</CardDescription>
        </CardHeader>
        <CardContent className="p-8 space-y-6">
          <div className="flex justify-end">
             <Dialog open={isEditing} onOpenChange={setIsEditing}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Edit3 className="mr-2 h-4 w-4" /> Edit Profile
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Edit Profile</DialogTitle>
                  <DialogDescription>
                    Make changes to your profile here. Click save when you&apos;re done.
                  </DialogDescription>
                </DialogHeader>
                {editableUser && (
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="name" className="text-right">Name</Label>
                      <Input id="name" name="name" value={editableUser.name} onChange={handleInputChange} className="col-span-3" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="email" className="text-right">Email</Label>
                      <Input id="email" name="email" type="email" value={editableUser.email} disabled className="col-span-3" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="phone" className="text-right">Phone</Label>
                      <Input id="phone" name="phone" value={editableUser.phone || ''} onChange={handleInputChange} className="col-span-3" />
                    </div>
                     <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="department" className="text-right">Department</Label>
                      <Input id="department" name="department" value={editableUser.department || ''} onChange={handleInputChange} className="col-span-3" />
                    </div>
                  </div>
                )}
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsEditing(false)} disabled={isSaving}>Cancel</Button>
                  <Button onClick={handleSave} disabled={isSaving}>
                    {isSaving ? 'Saving...' : 'Save changes'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
          
          <div className="space-y-4">
            <h3 className="text-xl font-semibold font-headline text-primary">Contact Information</h3>
            <Separator />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InfoItem icon={Mail} label="Email" value={user.email} />
              <InfoItem icon={Phone} label="Phone" value={user.phone || 'Not provided'} />
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-xl font-semibold font-headline text-primary">Work Details</h3>
            <Separator />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InfoItem icon={BriefcaseIcon} label="Department" value={user.department || 'Not specified'} />
              <InfoItem icon={ShieldCheck} label="Role" value={user.role} className="capitalize" />
            </div>
          </div>

        </CardContent>
      </Card>
    </div>
  );
}

interface InfoItemProps {
  icon: React.ElementType;
  label: string;
  value: string;
  className?: string;
}


function InfoItem({ icon: Icon, label, value, className }: InfoItemProps) {
  return (
    <div className={cn("flex items-start space-x-3 p-3 bg-secondary/30 rounded-md", className)}>
      <Icon className="h-5 w-5 mt-1 text-primary flex-shrink-0" />
      <div>
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        <p className="text-md">{value}</p>
      </div>
    </div>
  );
}

function ProfileSkeleton() {
  return (
    <div className="container mx-auto py-8">
      <Card className="max-w-2xl mx-auto shadow-xl rounded-xl">
        <CardHeader className="text-center p-8 bg-gradient-to-br from-primary/10 to-transparent">
          <Skeleton className="w-32 h-32 rounded-full mx-auto mb-4" />
          <Skeleton className="h-8 w-48 mx-auto" />
          <Skeleton className="h-6 w-32 mx-auto mt-2" />
        </CardHeader>
        <CardContent className="p-8 space-y-6">
          <div className="flex justify-end">
            <Skeleton className="h-10 w-32" />
          </div>
          <div className="space-y-4">
            <Skeleton className="h-6 w-40" />
            <Separator />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Skeleton className="h-20" />
              <Skeleton className="h-20" />
            </div>
          </div>
          <div className="space-y-4">
            <Skeleton className="h-6 w-32" />
            <Separator />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Skeleton className="h-20" />
              <Skeleton className="h-20" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
=======
export const dynamic = 'force-dynamic';

'use client';

import React, { useState, useEffect, useCallback } from 'react';
// ... rest of the file
>>>>>>> cd9f8f19f7821f90b84de55171d082541fb5f421
