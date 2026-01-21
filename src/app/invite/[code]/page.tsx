import {
	getCircleByInviteCode,
	joinCircleByCode,
	getCircle,
} from "@/app/actions/circles";
import { auth } from "@/auth";
import { Button } from "@/components/ui/button";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Users, ArrowRight, CheckCircle, Clock } from "lucide-react";

interface InvitePageProps {
	params: Promise<{ code: string }>;
}

export default async function InvitePage({ params }: InvitePageProps) {
	const { code } = await params;
	const session = await auth();
	const circlePreview = await getCircleByInviteCode(code);

	if (!circlePreview) {
		return (
			<main className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 text-center relative overflow-hidden">
				{/* Ambient Background */}
				<div className="absolute top-0 right-0 w-[50vw] h-[50vh] bg-purple-600/20 blur-[120px] pointer-events-none rounded-full" />
				<div className="absolute bottom-0 left-0 w-[40vw] h-[40vh] bg-blue-600/10 blur-[100px] pointer-events-none rounded-full" />

				<div className="relative z-10 animate-fade-in-up">
					<h1 className="text-4xl font-bold mb-4 tracking-tight">
						Invalid Invite
					</h1>
					<p className="text-muted-foreground mb-8 text-lg text-balance">
						This invite link looks invalid or has expired.
					</p>
					<Link href="/">
						<Button className="rounded-full px-8 h-12" size="lg">
							Return Home
						</Button>
					</Link>
				</div>
			</main>
		);
	}

	if (!session?.user) {
		redirect(`/api/auth/signin?callbackUrl=/invite/${code}`);
	}

	// Check if user is already a member by trying to fetch full circle details
	// getCircle returns null if user is not authorized (not a member)
	const existingMembership = await getCircle(circlePreview.id);

	const joinAction = async () => {
		"use server";
		const result = await joinCircleByCode(code);
		if (result.success) {
			redirect(`/circle/${result.circleId}`);
		}
	};

	const ownerName = circlePreview.owner.name || "Hive Owner";
	const ownerInitial = ownerName.charAt(0).toUpperCase();

	return (
		<main className="min-h-screen bg-black text-white flex items-center justify-center p-4 relative overflow-hidden">
			{/* Ambient Background - Matched to Circle Page */}
			<div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-purple-600/20 rounded-full blur-[120px] mix-blend-screen opacity-50 pointer-events-none" />
			<div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] mix-blend-screen opacity-40 pointer-events-none" />

			<div className="max-w-md w-full glass rounded-[2.5rem] border-white/10 p-8 md:p-12 text-center relative z-10 shadow-2xl animate-fade-in-up">
				{/* Hive Avatar */}
				<div className="w-24 h-24 sm:w-32 sm:h-32 mx-auto mb-8 rounded-[2rem] bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-5xl font-bold text-white shadow-2xl shadow-yellow-600/40 ring-1 ring-white/10">
					{circlePreview.name.charAt(0)}
				</div>

				{/* Header */}
				<h1 className="text-3xl sm:text-4xl font-extrabold mb-3 tracking-tight text-balance leading-[1.1]">
					{circlePreview.name}
				</h1>

				{/* Invited By */}
				<div className="flex items-center justify-center gap-2 mb-8 text-muted-foreground text-lg">
					<span className="w-6 h-6 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-[10px] font-bold text-white shadow-lg">
						{ownerInitial}
					</span>
					<p>
						Invited by{" "}
						<span className="font-semibold text-white">{ownerName}</span>
					</p>
				</div>

				{/* Description or Quote */}
				{circlePreview.description && (
					<div className="mb-10 relative">
						<div className="absolute -inset-2 bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-xl blur-lg -z-10" />
						<p className="text-lg text-zinc-300 italic leading-relaxed text-balance">
							&ldquo;{circlePreview.description}&rdquo;
						</p>
					</div>
				)}

				{/* Member Count Badge */}
				<div className="inline-flex items-center gap-2 mb-10 text-sm font-medium text-zinc-400 bg-white/5 py-2 px-5 rounded-full ring-1 ring-white/5">
					<Users className="w-4 h-4" />
					<span>{circlePreview._count.members} Members</span>
				</div>

				{/* Action Button Area */}
				{existingMembership ? (
					<div className="space-y-4">
						{existingMembership.currentUserStatus === "PENDING" ? (
							<div className="bg-yellow-500/10 border border-yellow-500/20 rounded-2xl p-4 mb-4">
								<p className="text-yellow-500 font-bold flex items-center justify-center gap-2 mb-2">
									<Clock className="w-5 h-5" /> Request Pending
								</p>
								<p className="text-sm text-yellow-500/80">
									Your request to join is awaiting approval.
								</p>
							</div>
						) : (
							<div className="bg-green-500/10 border border-green-500/20 rounded-2xl p-4 mb-4">
								<p className="text-green-500 font-bold flex items-center justify-center gap-2 mb-2">
									<CheckCircle className="w-5 h-5" /> Already a Member
								</p>
								<p className="text-sm text-green-500/80">
									You are already part of this hive.
								</p>
							</div>
						)}

						<Link href={`/circle/${circlePreview.id}`}>
							<Button
								size="lg"
								className="w-full rounded-full h-14 text-lg font-bold shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300"
							>
								{existingMembership.currentUserStatus === "PENDING"
									? "View Status"
									: "Go to Hive"}
								<ArrowRight className="w-5 h-5 ml-2" />
							</Button>
						</Link>
					</div>
				) : (
					<form action={joinAction} className="space-y-4">
						<Button
							size="lg"
							className="w-full rounded-full h-14 text-lg font-bold shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300"
						>
							Join Circle
							<ArrowRight className="w-5 h-5 ml-2" />
						</Button>

						<p className="text-xs text-zinc-500">
							You will join as{" "}
							<span className="text-zinc-300">{session.user.name}</span>
						</p>
					</form>
				)}

				{/* Footer Link */}
				<div className="mt-8 pt-6 border-t border-white/5">
					<Link
						href="/"
						className="text-sm text-zinc-500 hover:text-white transition-colors"
					>
						{existingMembership
							? "Back to Dashboard"
							: "No thanks, return to Dashboard"}
					</Link>
				</div>
			</div>
		</main>
	);
}
