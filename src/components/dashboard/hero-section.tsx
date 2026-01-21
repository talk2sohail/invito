import { CirclePreview } from "@/types";
import { CreateInviteDialog } from "@/components/invites/create-invite-dialog";
import { CreateCircleDialog } from "@/components/circles/create-circle-dialog";
import { use } from "react";

interface HeroSectionProps {
	circlesPromise: Promise<CirclePreview[]>;
	userId: string;
}

export function HeroSection({ circlesPromise, userId }: HeroSectionProps) {
	const circles = use(circlesPromise);
	const ownedCircles = circles
		.filter((c) => c.ownerId === userId)
		.map((c) => ({ id: c.id, name: c.name }));

	return (
		<div>
			<h2 className="text-5xl sm:text-7xl font-extrabold tracking-tight mb-6 leading-[1.1]">
				<span className="bg-linear-to-r from-foreground to-foreground/50 bg-clip-text text-transparent text-balance block">
					Celebrate moments that matter.
				</span>
			</h2>
			<p className="text-lg text-muted-foreground mb-8 max-w-lg">
				Organize gatherings, manage your close hives, and creating lasting
				memories without the chaos.
			</p>
			<div className="flex flex-wrap gap-4 justify-center sm:justify-start">
				<CreateInviteDialog circles={ownedCircles} />
				<CreateCircleDialog />
			</div>
		</div>
	);
}
