"use client";

import { useState } from "react";
import { Member } from "@/types";
import { Button } from "@/components/ui/button";
import { Check, X, Loader2 } from "lucide-react";
import { approveMember, removeMember } from "@/app/actions/circles";
import Image from "next/image";
import { toast } from "sonner";

interface PendingMembersListProps {
  members: Member[];
  circleId: string;
}

export function PendingMembersList({ members, circleId }: PendingMembersListProps) {
  const [processing, setProcessing] = useState<string | null>(null);

  const handleApprove = async (memberId: string, userId: string) => {
    setProcessing(memberId);
    try {
      await approveMember(circleId, userId);
      toast.success("Member approved");
    } catch (e) {
      toast.error("Failed to approve member");
    } finally {
      setProcessing(null);
    }
  };

  const handleReject = async (memberId: string, userId: string) => {
      setProcessing(memberId);
      try {
        await removeMember(circleId, userId);
        toast.success("Member request rejected");
      } catch (e) {
        toast.error("Failed to reject member");
      } finally {
        setProcessing(null);
      }
    };

  if (members.length === 0) return null;

  return (
    <div className="mb-6">
      <h3 className="text-lg font-bold mb-3 flex items-center gap-2 text-amber-500">
        Pending Requests ({members.length})
      </h3>
      <div className="space-y-3">
        {members.map((member) => (
            <div key={member.id} className="flex items-center justify-between p-3 glass rounded-2xl border-amber-500/20 bg-amber-500/5">
                 <div className="flex items-center gap-3">
                    <div className="relative w-10 h-10 rounded-full overflow-hidden border border-white/10">
                      {member.user.image ? (
                        <Image
                          src={member.user.image}
                          alt={member.user.name || "User"}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-muted flex items-center justify-center font-bold">
                          {member.user.name?.[0]}
                        </div>
                      )}
                    </div>
                    <div>
                        <p className="text-sm font-bold">{member.user.name}</p>
                        <p className="text-xs text-muted-foreground">{member.user.email}</p>
                    </div>
                 </div>
                 <div className="flex gap-2">
                    <Button 
                        size="icon" 
                        variant="ghost" 
                        className="h-8 w-8 text-red-400 hover:text-red-300 hover:bg-red-900/20"
                        onClick={() => handleReject(member.id, member.user.id)}
                        disabled={!!processing}
                    >
                        {processing === member.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <X className="w-4 h-4" />}
                    </Button>
                     <Button 
                        size="icon" 
                        variant="ghost" 
                        className="h-8 w-8 text-green-400 hover:text-green-300 hover:bg-green-900/20"
                        onClick={() => handleApprove(member.id, member.user.id)}
                        disabled={!!processing}
                    >
                       {processing === member.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                    </Button>
                 </div>
            </div>
        ))}
      </div>
    </div>
  )
}
