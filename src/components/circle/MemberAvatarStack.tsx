"use client";

import { Member } from "@/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MembersListDialog } from "./MembersListDialog";
import { cn } from "@/lib/utils";

interface MemberAvatarStackProps {
  members: Member[];
  circleId: string;
  currentUserId?: string;
  isOwner: boolean;
}

export function MemberAvatarStack({
  members,
  circleId,
  currentUserId,
  isOwner,
}: MemberAvatarStackProps) {
  if (members.length === 0) return null;

  const displayCount = 5;
  const visibleMembers = members.slice(0, displayCount);
  const remainingCount = Math.max(0, members.length - displayCount);

  return (
    <div className="flex items-center gap-4 py-2">
      <MembersListDialog
        members={members}
        circleId={circleId}
        currentUserId={currentUserId}
        isOwner={isOwner}
      >
        <div className="flex items-center -space-x-3 hover:scale-105 transition-transform cursor-pointer p-1">
          {visibleMembers.map((member, i) => (
            <Avatar
              key={member.id}
              className={cn(
                "w-10 h-10 border-2 border-black ring-2 ring-white/5 transition-transform hover:z-10 hover:-translate-y-1",
                "bg-zinc-800"
              )}
            >
              <AvatarImage src={member.user.image} alt={member.user.name} />
              <AvatarFallback className="text-[10px] font-bold bg-zinc-800 text-zinc-400">
                {member.user.name?.[0]}
              </AvatarFallback>
            </Avatar>
          ))}
          {remainingCount > 0 && (
            <div className="w-10 h-10 rounded-full border-2 border-black bg-zinc-800 flex items-center justify-center ring-2 ring-white/5 z-10">
              <span className="text-xs font-bold text-zinc-400">+{remainingCount}</span>
            </div>
          )}
        </div>
      </MembersListDialog>
      <div className="text-sm text-muted-foreground">
        <span className="font-bold text-white">{members.length}</span> members
      </div>
    </div>
  );
}
