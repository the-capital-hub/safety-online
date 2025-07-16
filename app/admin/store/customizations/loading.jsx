import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function StoreCustomizationsLoading() {
	return (
		<div className="space-y-6">
			<Skeleton className="h-9 w-64" />

			<Card>
				<CardContent className="p-6">
					{/* Tabs Skeleton */}
					<div className="grid grid-cols-6 gap-2 mb-6">
						{[...Array(6)].map((_, i) => (
							<Skeleton key={i} className="h-10 w-full" />
						))}
					</div>

					{/* Form Sections Skeleton */}
					<div className="space-y-6">
						{[...Array(5)].map((_, i) => (
							<Card key={i}>
								<CardHeader className="flex flex-row items-center justify-between">
									<Skeleton className="h-6 w-32" />
									<Skeleton className="h-8 w-20" />
								</CardHeader>
								<CardContent className="space-y-4">
									{[...Array(3)].map((_, j) => (
										<div key={j} className="space-y-2">
											<Skeleton className="h-4 w-24" />
											<Skeleton className="h-10 w-full" />
										</div>
									))}
								</CardContent>
							</Card>
						))}
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
