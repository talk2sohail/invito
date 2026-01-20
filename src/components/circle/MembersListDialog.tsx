"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Users } from "lucide-react";
import { MembersList } from "./MembersList";
import { Member } from "@/types";

interface MembersListDialogProps {
  members: Member[];
  currentUserId?: string;
  isOwner: boolean;
  circleId: string;
  children?: React.ReactNode;
}

export function MembersListDialog({
  members,
  currentUserId,
  isOwner,
  circleId,
  children,
}: MembersListDialogProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        {children || (
          <Button
            variant="ghost"
            className="w-full mt-2 text-muted-foreground hover:text-white hover:bg-white/5"
          >
            View all {members.length} members
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="w-[95vw] sm:w-full sm:max-w-lg md:max-w-2xl bg-zinc-950/90 border-white/10 text-white backdrop-blur-xl shadow-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-purple-500" />
            Circle Members
          </DialogTitle>
          <DialogDescription className="text-zinc-400">
            {members.length} people in this circle
          </DialogDescription>
        </DialogHeader>
        <div className="max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
          <MembersList
            members={members}
            currentUserId={currentUserId}
            isOwner={isOwner}
            circleId={circleId}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
