"use client";

import { Member } from "@/types";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Trash2, Loader2 } from "lucide-react";
import Image from "next/image";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { removeMember } from "@/app/actions/circles";
import { toast } from "sonner";
import { useState } from "react";

interface MembersListProps {
    members: Member[];
    currentUserId?: string;
    isOwner: boolean;
    circleId: string;
}

export function MembersList({ members, currentUserId, isOwner, circleId }: MembersListProps) {
    const [removing, setRemoving] = useState<string | null>(null);

    const handleRemove = async (memberId: string, userId: string) => {
        setRemoving(memberId);
        try {
            await removeMember(circleId, userId);
            toast.success("Member removed");
        } catch (e) {
            toast.error("Failed to remove member");
        } finally {
            setRemoving(null);
        }
    }

    return (
        <div className="space-y-4">
            {members.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center gap-3 group"
                  >
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
                    <div className="flex-1">
                      <p className="text-sm font-bold">{member.user.name}</p>
                      <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">
                        {member.role}
                      </p>
                    </div>
                    {isOwner && member.userId !== currentUserId && (
                       <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                             <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                {removing === member.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <MoreHorizontal className="w-4 h-4" />}
                              </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem 
                                className="text-red-500 focus:text-red-500 focus:bg-red-500/10 cursor-pointer"
                                onClick={() => handleRemove(member.id, member.user.id)}
                            >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Remove Member
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                       </DropdownMenu>
                    )}
                  </div>
                ))}
        </div>
    )
}
