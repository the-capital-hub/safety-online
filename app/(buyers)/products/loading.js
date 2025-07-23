export default function Loading() {
	return (
		<div className="min-h-screen bg-gray-50">
			<div className="container mx-auto px-4 py-8">
				<div className="flex flex-col lg:flex-row gap-8">
					{/* Filters Skeleton */}
					<div className="lg:w-80 flex-shrink-0">
						<div className="bg-white rounded-lg p-6 shadow-sm">
							<div className="animate-pulse space-y-4">
								<div className="h-6 bg-gray-200 rounded w-1/2"></div>
								<div className="space-y-2">
									{[...Array(5)].map((_, i) => (
										<div key={i} className="h-4 bg-gray-200 rounded"></div>
									))}
								</div>
							</div>
						</div>
					</div>

					{/* Products Grid Skeleton */}
					<div className="flex-1">
						<div className="bg-white rounded-lg p-6 shadow-sm mb-6">
							<div className="animate-pulse">
								<div className="h-8 bg-gray-200 rounded w-1/3 mb-2"></div>
								<div className="h-4 bg-gray-200 rounded w-1/4"></div>
							</div>
						</div>

						<div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
							{[...Array(9)].map((_, i) => (
								<div
									key={i}
									className="bg-white rounded-lg shadow-sm overflow-hidden"
								>
									<div className="animate-pulse">
										<div className="h-64 bg-gray-200"></div>
										<div className="p-6 space-y-3">
											<div className="h-4 bg-gray-200 rounded"></div>
											<div className="h-4 bg-gray-200 rounded w-2/3"></div>
											<div className="h-6 bg-gray-200 rounded w-1/3"></div>
										</div>
									</div>
								</div>
							))}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
