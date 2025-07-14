import React, { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight } from "lucide-react";

export const usePrevNextButtons = (emblaApi) => {
	const [prevBtnDisabled, setPrevBtnDisabled] = useState(true);
	const [nextBtnDisabled, setNextBtnDisabled] = useState(true);

	const onPrevButtonClick = useCallback(() => {
		if (!emblaApi) return;
		emblaApi.scrollPrev();
	}, [emblaApi]);

	const onNextButtonClick = useCallback(() => {
		if (!emblaApi) return;
		emblaApi.scrollNext();
	}, [emblaApi]);

	const onSelect = useCallback((emblaApi) => {
		setPrevBtnDisabled(!emblaApi.canScrollPrev());
		setNextBtnDisabled(!emblaApi.canScrollNext());
	}, []);

	useEffect(() => {
		if (!emblaApi) return;

		onSelect(emblaApi);
		emblaApi.on("reInit", onSelect).on("select", onSelect);
	}, [emblaApi, onSelect]);

	return {
		prevBtnDisabled,
		nextBtnDisabled,
		onPrevButtonClick,
		onNextButtonClick,
	};
};

export const PrevButton = ({ onClick, disabled }) => {
	return (
		<Button
			variant="outline"
			size="icon"
			onClick={onClick}
			disabled={disabled}
			className="w-10 h-10 rounded-full border-2 border-black hover:border-black hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
		>
			<ArrowLeft className="h-5 w-5" />
		</Button>
	);
};

export const NextButton = ({ onClick, disabled }) => {
	return (
		<Button
			variant="outline"
			size="icon"
			onClick={onClick}
			disabled={disabled}
			className="w-fit h-10 px-4 rounded-full border-2 border-black hover:border-black bg-black text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
		>
			Next
			<ArrowRight className="h-5 w-5" />
		</Button>
	);
};
