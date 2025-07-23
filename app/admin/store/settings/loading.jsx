import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function StoreSettingsLoading() {
	return (
		<div className="space-y-6">
			<Skeleton className="h-9 w-48" />

			<Card>
				<CardHeader>
					<Skeleton className="h-6 w-64" />
				</CardHeader>
				<CardContent className="space-y-6">
					{/* Toggle Settings */}
					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
						{[...Array(4)].map((_, i) => (
							<div key={i} className="flex items-center justify-between">
								<Skeleton className="h-4 w-32" />
								<Skeleton className="h-6 w-11 rounded-full" />
							</div>
						))}
					</div>

					{/* Input Fields */}
					<div className="space-y-4">
						{[...Array(6)].map((_, i) => (
							<div key={i} className="space-y-2">
								<Skeleton className="h-4 w-24" />
								<Skeleton className="h-10 w-full" />
							</div>
						))}
					</div>

					<div className="flex justify-end pt-6">
						<Skeleton className="h-10 w-20" />
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
