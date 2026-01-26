"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Copy, RefreshCw, Check, Trash2, Plus } from "lucide-react";
import { useState, useEffect } from "react";
import {
  regenerateInviteCode,
  updateCircleSettings,
  createLimitedInviteLink,
  getLimitedInviteLinks,
  revokeLimitedInviteLink,
} from "@/app/actions/circles";
import { toast } from "sonner";

interface InviteMemberDialogProps {
  circleId: string;
  inviteCode: string; // Pre-generated code
  isInviteLinkEnabled?: boolean;
  children: React.ReactNode;
  isOwner?: boolean;
}

interface LimitedInviteLink {
  id: string;
  code: string;
  maxUses: number;
  usedCount: number;
  createdAt: Date;
}

export function InviteMemberDialog({
  circleId,
  inviteCode: initialInviteCode,
  isInviteLinkEnabled: initialIsEnabled = true,
  children,
  isOwner = false,
}: InviteMemberDialogProps) {
  const [inviteCode, setInviteCode] = useState(initialInviteCode);
  const [isCopied, setIsCopied] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [open, setOpen] = useState(false);
  const [isInviteLinkEnabled, setIsInviteLinkEnabled] =
    useState(initialIsEnabled);
  const [isTogglingLink, setIsTogglingLink] = useState(false);
  const [limitedLinks, setLimitedLinks] = useState<LimitedInviteLink[]>([]);
  const [maxUses, setMaxUses] = useState<number>(5);
  const [isCreatingLink, setIsCreatingLink] = useState(false);
  const [isLoadingLinks, setIsLoadingLinks] = useState(false);

  useEffect(() => {
    const loadLinks = async () => {
      try {
        setIsLoadingLinks(true);
        const links = await getLimitedInviteLinks(circleId);
        setLimitedLinks(links as LimitedInviteLink[]);
      } catch {
        toast.error("Failed to load limited links");
      } finally {
        setIsLoadingLinks(false);
      }
    };

    if (open && isOwner) {
      loadLinks();
    }
  }, [open, isOwner, circleId]);

  const loadLimitedLinks = async () => {
    try {
      setIsLoadingLinks(true);
      const links = await getLimitedInviteLinks(circleId);
      setLimitedLinks(links as LimitedInviteLink[]);
    } catch {
      toast.error("Failed to load limited links");
    } finally {
      setIsLoadingLinks(false);
    }
  };

  const inviteLink =
    typeof window !== "undefined"
      ? `${window.location.origin}/invite/${inviteCode}`
      : `https://invito.app/invite/${inviteCode}`;

  const getLimitedLinkUrl = (code: string) =>
    typeof window !== "undefined"
      ? `${window.location.origin}/invite/${code}`
      : `https://invito.app/invite/${code}`;

  const copyToClipboard = async (text: string, linkType: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setIsCopied(true);
      toast.success(`${linkType} link copied to clipboard`);
      setTimeout(() => setIsCopied(false), 2000);
    } catch {
      toast.error("Failed to copy link");
    }
  };

  const handleRegenerate = async () => {
    try {
      setIsRegenerating(true);
      const newCode = await regenerateInviteCode(circleId);
      setInviteCode(newCode);
      toast.success("New invite link generated");
    } catch {
      toast.error("Failed to generate new link");
    } finally {
      setIsRegenerating(false);
    }
  };

  const handleToggleInviteLink = async (enabled: boolean) => {
    try {
      setIsTogglingLink(true);
      await updateCircleSettings(circleId, { isInviteLinkEnabled: enabled });
      setIsInviteLinkEnabled(enabled);
      toast.success(
        enabled ? "Invite link enabled" : "Invite link disabled",
      );
    } catch {
      toast.error("Failed to update settings");
    } finally {
      setIsTogglingLink(false);
    }
  };

  const handleCreateLimitedLink = async () => {
    if (!maxUses || maxUses < 1 || isNaN(maxUses)) {
      toast.error("Please enter a valid number of uses");
      return;
    }

    try {
      setIsCreatingLink(true);
      await createLimitedInviteLink(circleId, maxUses);
      toast.success("Limited link created");
      setMaxUses(5); // Reset to default
      await loadLimitedLinks();
    } catch {
      toast.error("Failed to create limited link");
    } finally {
      setIsCreatingLink(false);
    }
  };

  const handleRevokeLink = async (linkId: string) => {
    try {
      await revokeLimitedInviteLink(linkId);
      toast.success("Link revoked");
      await loadLimitedLinks();
    } catch {
      toast.error("Failed to revoke link");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-xl bg-zinc-900 border-white/10 text-white">
        <DialogHeader>
          <DialogTitle>Invite Members</DialogTitle>
          <DialogDescription className="text-zinc-400">
            Share invite links to grow your circle.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="general" className="mt-4">
          <TabsList className="grid w-full grid-cols-2 bg-black/30">
            <TabsTrigger value="general">General Link</TabsTrigger>
            <TabsTrigger value="limited">Limited Links</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-4">
            {isOwner && (
              <div className="flex items-center justify-between p-3 bg-black/30 rounded-lg">
                <div className="flex-1">
                  <Label htmlFor="enable-link" className="text-sm font-medium">
                    Enable Invite Link
                  </Label>
                  <p className="text-xs text-zinc-500 mt-1">
                    When disabled, this link will not accept new members
                  </p>
                </div>
                <Switch
                  id="enable-link"
                  checked={isInviteLinkEnabled}
                  onCheckedChange={handleToggleInviteLink}
                  disabled={isTogglingLink}
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="link" className="text-sm">
                Invite Link
              </Label>
              <div className="flex items-center space-x-2">
                <Input
                  id="link"
                  type="text"
                  readOnly
                  className={`bg-black/50 border-white/10 h-11 ${
                    !isInviteLinkEnabled ? "text-zinc-500" : "text-zinc-300"
                  }`}
                  value={inviteLink}
                  disabled={!isInviteLinkEnabled}
                />
                <Button
                  type="button"
                  size="icon"
                  onClick={() => copyToClipboard(inviteLink, "General")}
                  disabled={!isInviteLinkEnabled}
                  className="h-11 w-11 shrink-0 bg-white/10 hover:bg-white/20 text-white border-0"
                >
                  {isCopied ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                  <span className="sr-only">Copy</span>
                </Button>
              </div>
              {!isInviteLinkEnabled && (
                <p className="text-xs text-zinc-500">
                  Link is currently disabled
                </p>
              )}
              <p className="text-xs text-zinc-500">
                Members joining via this link will need approval
              </p>
            </div>

            {isOwner && (
              <div className="flex justify-end">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleRegenerate}
                  disabled={isRegenerating || !isInviteLinkEnabled}
                  className="text-xs text-zinc-500 hover:text-white"
                >
                  <RefreshCw
                    className={`w-3 h-3 mr-2 ${isRegenerating ? "animate-spin" : ""}`}
                  />
                  {isRegenerating ? "Generating..." : "Generate new link"}
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="limited" className="space-y-4">
            {isOwner ? (
              <>
                <div className="p-4 bg-black/30 rounded-lg space-y-3">
                  <Label htmlFor="max-uses" className="text-sm font-medium">
                    Create Limited Link
                  </Label>
                  <p className="text-xs text-zinc-500">
                    Members joining via limited links are auto-approved
                  </p>
                  <div className="flex items-end gap-2">
                    <div className="flex-1">
                      <Label htmlFor="max-uses" className="text-xs text-zinc-400">
                        How many people can join?
                      </Label>
                      <Input
                        id="max-uses"
                        type="number"
                        min="1"
                        value={maxUses}
                        onChange={(e) => {
                          const value = parseInt(e.target.value, 10);
                          setMaxUses(isNaN(value) ? 1 : Math.max(1, value));
                        }}
                        className="bg-black/50 border-white/10 text-zinc-300 h-10 mt-1"
                        placeholder="5"
                      />
                    </div>
                    <Button
                      onClick={handleCreateLimitedLink}
                      disabled={isCreatingLink}
                      className="h-10 bg-primary hover:bg-primary/90"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      {isCreatingLink ? "Creating..." : "Generate"}
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">Active Links</Label>
                  {isLoadingLinks ? (
                    <div className="text-center text-zinc-500 py-8">
                      Loading...
                    </div>
                  ) : limitedLinks.length === 0 ? (
                    <div className="text-center text-zinc-500 py-8 bg-black/20 rounded-lg">
                      <p className="text-sm">No active limited links.</p>
                      <p className="text-xs mt-1">
                        Create a link to allow specific people to join instantly.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {limitedLinks.map((link) => {
                        const isExpired = link.usedCount >= link.maxUses;
                        const progress = (link.usedCount / link.maxUses) * 100;

                        return (
                          <div
                            key={link.id}
                            className="p-3 bg-black/30 rounded-lg space-y-2"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1 min-w-0">
                                <p className="text-xs text-zinc-400 font-mono truncate">
                                  {link.code}
                                </p>
                                <div className="flex items-center gap-2 mt-1">
                                  <span
                                    className={`text-xs ${isExpired ? "text-red-400" : "text-green-400"}`}
                                  >
                                    {link.usedCount}/{link.maxUses} joined
                                  </span>
                                  {isExpired && (
                                    <span className="text-xs text-red-400 bg-red-400/10 px-2 py-0.5 rounded">
                                      Expired
                                    </span>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center gap-1">
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  onClick={() =>
                                    copyToClipboard(
                                      getLimitedLinkUrl(link.code),
                                      "Limited",
                                    )
                                  }
                                  disabled={isExpired}
                                  className="h-8 w-8 text-zinc-400 hover:text-white"
                                >
                                  <Copy className="h-3 w-3" />
                                </Button>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  onClick={() => handleRevokeLink(link.id)}
                                  className="h-8 w-8 text-red-400 hover:text-red-300"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                            <div className="w-full bg-black/50 rounded-full h-1.5 overflow-hidden">
                              <div
                                className={`h-full transition-all ${isExpired ? "bg-red-500" : "bg-green-500"}`}
                                style={{ width: `${progress}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="text-center text-zinc-500 py-8">
                Only the circle owner can manage limited links.
              </div>
            )}
          </TabsContent>
        </Tabs>

        <div className="flex justify-end mt-4">
          <DialogClose asChild>
            <Button type="button" variant="secondary">
              Close
            </Button>
          </DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  );
}
