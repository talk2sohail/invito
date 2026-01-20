import { auth } from "@/auth";
import { getCircle, getPendingMembers } from "@/app/actions/circles";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Users, ArrowLeft, MoreHorizontal, Plus } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { EmptyState } from "@/components/ui/empty-state";
import Image from "next/image";
import { InviteMemberDialog } from "@/components/circle/InviteMemberDialog";
import { CircleSettingsMenu } from "@/components/circle/CircleSettingsMenu";
import { CreateInviteDialog } from "@/components/invites/create-invite-dialog";
import { PendingMembersList } from "@/components/circle/PendingMembersList";
import { MembersList } from "@/components/circle/MembersList";

interface CirclePageProps {
  params: Promise<{ id: string }>;
}

export default async function CirclePage({ params }: CirclePageProps) {
  const { id } = await params;
  const [session, circle] = await Promise.all([auth(), getCircle(id)]);

  if (!circle) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
        <h1 className="text-4xl font-bold mb-4">Circle Not Found</h1>
        <p className="text-muted-foreground mb-8">
          This circle doesn&#39;t exist or you don&#39;t have permission to view
          it.
        </p>
        <Link href="/">
          <Button className="rounded-full">Return Home</Button>
        </Link>
      </div>
    );
  }

  if (circle.currentUserStatus === "PENDING") {
    return (
      <main className="min-h-screen bg-background relative overflow-hidden flex flex-col items-center justify-center p-6 text-center">
        <div className="absolute top-0 right-0 w-[50vw] h-[50vh] bg-linear-to-b from-purple-500/10 to-transparent pointer-events-none blur-3xl" />
        
        <div className="relative z-10 max-w-md w-full">
          <div className="w-20 h-20 rounded-full bg-yellow-500/10 text-yellow-500 flex items-center justify-center mx-auto mb-6">
            <Users className="w-10 h-10" />
          </div>
          
          <h1 className="text-3xl font-bold mb-2">Request Pending</h1>
          <p className="text-muted-foreground mb-8 text-lg">
            Your request to join <span className="font-bold text-foreground">{circle.name}</span> has been sent.
            <br />
            You'll be notified when {circle.owner.name} approves your request.
          </p>
          
          <Card className="glass border-white/10 mb-8 p-4 flex items-center gap-4 text-left">
             <div className="w-12 h-12 rounded-full bg-linear-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-lg font-bold text-white">
                {circle.owner.name?.charAt(0)}
             </div>
             <div>
               <p className="font-bold">{circle.owner.name}</p>
               <p className="text-sm text-muted-foreground">Circle Owner</p>
             </div>
          </Card>

          <Link href="/">
            <Button variant="outline" className="rounded-full w-full">Back to Dashboard</Button>
          </Link>
        </div>
      </main>
    );
  }

  const isOwner = session?.user?.id === circle.ownerId;
  let pendingMembers: any[] = [];
  if (isOwner) {
    pendingMembers = await getPendingMembers(circle.id);
  }

  return (
    <main className="min-h-screen bg-background relative overflow-hidden pb-20">
      {/* Background radial gradients */}
      <div className="absolute top-0 right-0 w-[50vw] h-[50vh] bg-linear-to-b from-purple-500/10 to-transparent pointer-events-none blur-3xl" />

      <div className="max-w-5xl mx-auto px-6 pt-12 relative z-10">
        <nav className="flex items-center justify-between mb-8">
          <Link
            href="/"
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors group"
          >
            <div className="w-8 h-8 rounded-full flex items-center justify-center group-hover:bg-white/5 transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </div>
            <span className="font-medium">Back to Dashboard</span>
          </Link>
          <div className="flex gap-2">
            {isOwner && (
              <CircleSettingsMenu
                circleId={circle.id}
                circleName={circle.name}
              />
            )}
          </div>
        </nav>

        {/* Circle Header */}
        <section className="mb-12 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-16 h-16 rounded-3xl bg-linear-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-3xl font-bold text-white shadow-xl shadow-purple-500/20">
                {circle.name.charAt(0)}
              </div>
              <div>
                <h1 className="text-4xl font-extrabold tracking-tight">
                  {circle.name}
                </h1>
                <p className="text-muted-foreground font-medium flex items-center gap-2">
                  Created by {circle.owner.name} •{" "}
                  {format(new Date(circle.createdAt), "MMMM yyyy")}
                </p>
              </div>
            </div>
            {circle.description && (
              <p className="text-lg text-foreground/80 mt-4 max-w-2xl leading-relaxed">
                {circle.description}
              </p>
            )}
          </div>

          <div className="flex gap-3">
            {isOwner && (
              <CreateInviteDialog
                circles={[{ id: circle.id, name: circle.name }]}
                defaultCircleId={circle.id}
              >
                <Button className="rounded-full h-12 px-6 font-bold shadow-lg shadow-primary/25">
                  <Plus className="w-4 h-4 mr-2" />
                  New Invite
                </Button>
              </CreateInviteDialog>
            )}

            <InviteMemberDialog
              circleId={circle.id}
              inviteCode={circle.inviteCode}
              isOwner={isOwner}
            >
              <Button className="rounded-full h-12 px-6 font-bold shadow-lg shadow-primary/25">
                <Plus className="w-4 h-4 mr-2" />
                Invite Members
              </Button>
            </InviteMemberDialog>
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Members Column */}
          <div className="lg:col-span-1 space-y-6">
            <Card className="rounded-[2.5rem] glass border-white/10 overflow-hidden shadow-xl">
              <CardHeader className="pb-4 bg-white/5 border-b border-white/5 flex flex-row items-center justify-between">
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                  <Users className="w-5 h-5 text-purple-500" />
                  Members ({circle.members.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                {/* Pending Members */}
                {isOwner && (
                  <PendingMembersList
                    members={pendingMembers}
                    circleId={circle.id}
                  />
                )}

                {/* Active Members */}
                <MembersList
                  members={circle.members}
                  currentUserId={session?.user?.id}
                  isOwner={isOwner}
                  circleId={circle.id}
                />
              </CardContent>
            </Card>
          </div>

          {/* Events Column */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-bold flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-500" />
                Circle Events
              </h3>
            </div>

            {circle.invites.length === 0 ? (
              <div className="flex flex-col items-center">
                <EmptyState
                  icon={Calendar}
                  title="No events yet"
                  description="Start planning your first gathering for this circle!"
                />
                {isOwner && (
                  <div className="mt-6">
                    <CreateInviteDialog
                      circles={[{ id: circle.id, name: circle.name }]}
                      defaultCircleId={circle.id}
                    />
                  </div>
                )}
              </div>
            ) : (
              <div className="grid gap-4">
                {circle.invites.map((invite) => (
                  <Link
                    key={invite.id}
                    href={`/event/${invite.id}`}
                    className="block"
                  >
                    <div className="glass p-6 rounded-3xl border-white/5 hover:border-blue-500/30 hover:bg-white/5 transition-all cursor-pointer flex items-center justify-between group">
                      <div className="flex items-center gap-5">
                        <div className="flex flex-col items-center justify-center w-14 h-14 rounded-2xl bg-white/5 border border-white/10">
                          <span className="text-xs text-muted-foreground uppercase font-bold">
                            {format(new Date(invite.eventDate), "MMM")}
                          </span>
                          <span className="text-xl font-bold">
                            {format(new Date(invite.eventDate), "d")}
                          </span>
                        </div>
                        <div>
                          <h4 className="font-bold text-lg group-hover:text-blue-400 transition-colors">
                            {invite.title}
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            {format(new Date(invite.eventDate), "h:mm a")} •{" "}
                            {invite.location || "TBD"}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right hidden sm:block">
                          <span className="text-xs font-bold bg-white/10 px-2 py-1 rounded-full">
                            {invite._count?.rsvps || 0} Guests
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
