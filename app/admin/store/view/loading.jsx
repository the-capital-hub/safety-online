import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function ViewStoreLoading() {
	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<Skeleton className="h-9 w-48" />
				<Skeleton className="h-6 w-16" />
			</div>

			{/* Store Overview Skeletons */}
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
				{[...Array(4)].map((_, i) => (
					<Card key={i}>
						<CardContent className="p-6">
							<div className="flex items-center justify-between">
								<div className="space-y-2">
									<Skeleton className="h-4 w-16" />
									<Skeleton className="h-8 w-12" />
								</div>
								<Skeleton className="h-8 w-8 rounded" />
							</div>
						</CardContent>
					</Card>
				))}
			</div>

			{/* Quick Actions Skeleton */}
			<Card>
				<CardHeader>
					<Skeleton className="h-6 w-32" />
				</CardHeader>
				<CardContent>
					<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
						{[...Array(3)].map((_, i) => (
							<Skeleton key={i} className="h-10 w-full" />
						))}
					</div>
				</CardContent>
			</Card>

			{/* Store Preview and Activity Skeletons */}
			<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
				<Card>
					<CardHeader>
						<Skeleton className="h-6 w-32" />
					</CardHeader>
					<CardContent>
						<Skeleton className="aspect-video w-full mb-4" />
						<div className="flex gap-2">
							<Skeleton className="h-9 flex-1" />
							<Skeleton className="h-9 flex-1" />
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<Skeleton className="h-6 w-32" />
					</CardHeader>
					<CardContent>
						<div className="space-y-4">
							{[...Array(4)].map((_, i) => (
								<div key={i} className="flex items-center justify-between py-2">
									<div className="space-y-1">
										<Skeleton className="h-4 w-24" />
										<Skeleton className="h-3 w-32" />
									</div>
									<Skeleton className="h-3 w-16" />
								</div>
							))}
						</div>
					</CardContent>
				</Card>
			</div>

			{/* Performance Metrics Skeleton */}
			<Card>
				<CardHeader>
					<Skeleton className="h-6 w-40" />
				</CardHeader>
				<CardContent>
					<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
						{[...Array(3)].map((_, i) => (
							<div key={i} className="text-center space-y-2">
								<Skeleton className="h-8 w-20 mx-auto" />
								<Skeleton className="h-4 w-24 mx-auto" />
							</div>
						))}
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
