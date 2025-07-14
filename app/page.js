"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";

const Home = () => {
	const router = useRouter();

	// On page mount redirect to /home
	useEffect(() => {
		router.push("/home");
	});

	return <div>Redirecting to home page</div>;
};

export default Home;
