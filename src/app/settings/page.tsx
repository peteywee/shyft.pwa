'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Fingerprint, KeyRound, Loader2, AlertTriangle } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Passkey } from '@/lib/webauthn';
import { webAuthnRegistration } from '@/lib/webauthn';

export default function SecuritySettingsPage() {
  const { user, listPasskeys } = useAuth();
  const { toast } = useToast();
  const [passkeys, setPasskeys] = useState<Passkey[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);

  const fetchPasskeys = useCallback(async () => {
    setIsLoading(true);
    try {
      const keys = await listPasskeys();
      setPasskeys(keys);
    } catch (error) {
      toast({ variant: 'destructive', title: 'Error', description: 'Could not fetch your passkeys.' });
    } finally {
      setIsLoading(false);
    }
  }, [listPasskeys, toast]);

  useEffect(() => {
    if (user) {
      fetchPasskeys();
    }
  }, [user, fetchPasskeys]);

  const handleCreatePasskey = async () => {
    if (!user?.email) {
      toast({ variant: 'destructive', title: 'Error', description: 'User email is not available.' });
      return;
    }
    setIsCreating(true);
    try {
      await webAuthnRegistration(user.email);
      toast({ title: 'Passkey Created', description: 'You can now use this passkey to sign in.' });
      await fetchPasskeys(); // Refresh the list
    } catch (error) {
      toast({ variant: 'destructive', title: 'Creation Failed', description: 'Could not create new passkey.' });
    } finally {
      setIsCreating(false);
    }
  };
  
  const handleRevokePasskey = async (keyId: string) => {
    // Revoking requires a call to the backend extension, which is not yet implemented in the provided extension.
    // For now, this is a placeholder.
    toast({
       title: "Feature Not Implemented",
       description: "Passkey revocation is not yet supported by the extension.",
    });
     console.log("Attempted to revoke passkey:", keyId);
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Passkeys</CardTitle>
          <CardDescription>
            Use biometrics or a hardware security key to sign in to your account. Passkeys are a more secure and easier way to sign in than passwords.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <ul className="space-y-3">
                {passkeys.map(key => (
                   <li key={key.id} className="flex items-center justify-between rounded-md border p-4">
                     <div className="flex items-center gap-4">
                       <KeyRound className="h-6 w-6 text-primary" />
                       <div>
                         <p className="font-semibold">Passkey</p>
                         <p className="text-sm text-muted-foreground">
                           Created: {new Date(key.created).toLocaleDateString()}
                         </p>
                       </div>
                     </div>
                     <AlertDialog>
                        <AlertDialogTrigger asChild>
                           <Button variant="destructive-outline" size="sm">Revoke</Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                             <AlertDialogTitle className="flex items-center gap-2"><AlertTriangle/>Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This action is not yet implemented. In a full implementation, this would permanently remove the passkey.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleRevokePasskey(key.id)} disabled>
                              Revoke
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                   </li>
                ))}
              </ul>
            )}
            
            { !isLoading && passkeys.length === 0 && (
                <div className="text-center text-muted-foreground py-6">
                    <p>You have no passkeys registered.</p>
                </div>
            )}

             <Button onClick={handleCreatePasskey} disabled={isCreating || !user}>
              {isCreating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Please follow browser prompts...
                </>
              ) : (
                <>
                  <Fingerprint className="mr-2 h-4 w-4" />
                  Create a New Passkey
                </>
              )}
            </Button>
        </CardContent>
      </Card>
    </div>
  );
}
