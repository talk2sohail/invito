import { CirclePreview, InviteWithRelations } from "@/types";
import { Calendar, CircleUser } from "lucide-react";
import { use } from "react";

interface StatsCardsProps {
	circlesPromise: Promise<CirclePreview[]>;
	invitesPromise: Promise<InviteWithRelations[]>;
}

export function StatsCards({
	circlesPromise,
	invitesPromise,
}: StatsCardsProps) {
	const circles = use(circlesPromise);
	const invites = use(invitesPromise);

	const upcomingInvites = invites.filter(
		(i) => new Date(i.eventDate) > new Date(),
	);

	return (
		<div className="grid grid-cols-2 gap-4 w-full max-w-md">
			<div className="glass p-6 rounded-3xl aspect-square flex flex-col justify-between hover:scale-[1.02] transition-transform duration-300">
				<div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500">
					<Calendar className="w-5 h-5" />
				</div>
				<div>
					<p className="text-3xl font-bold">{upcomingInvites.length}</p>
					<p className="text-sm text-muted-foreground">Upcoming</p>
				</div>
			</div>
			<div className="glass p-6 rounded-3xl aspect-square flex flex-col justify-between hover:scale-[1.02] transition-transform duration-300">
				<div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-500">
					<CircleUser className="w-5 h-5" />
				</div>
				<div>
					<p className="text-3xl font-bold">{circles.length}</p>
					<p className="text-sm text-muted-foreground">Hives</p>
				</div>
			</div>
		</div>
	);
}
