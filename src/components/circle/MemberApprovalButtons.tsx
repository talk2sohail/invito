"use client";

import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";
import { approveMember, rejectMember } from "@/app/actions/circles";
import { toast } from "sonner";
import { useState } from "react";

interface MemberApprovalButtonsProps {
  memberId: string;
}

export function MemberApprovalButtons({ memberId }: MemberApprovalButtonsProps) {
  const [isProcessing, setIsProcessing] = useState(false);

  const handleApprove = async () => {
    try {
      setIsProcessing(true);
      await approveMember(memberId);
      toast.success("Member approved");
    } catch {
      toast.error("Failed to approve member");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    try {
      setIsProcessing(true);
      await rejectMember(memberId);
      toast.success("Member rejected");
    } catch {
      toast.error("Failed to reject member");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex items-center gap-1">
      <Button
        size="icon"
        variant="ghost"
        onClick={handleApprove}
        disabled={isProcessing}
        className="h-8 w-8 text-green-500 hover:text-green-400 hover:bg-green-500/10"
      >
        <Check className="h-4 w-4" />
      </Button>
      <Button
        size="icon"
        variant="ghost"
        onClick={handleReject}
        disabled={isProcessing}
        className="h-8 w-8 text-red-500 hover:text-red-400 hover:bg-red-500/10"
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
}
