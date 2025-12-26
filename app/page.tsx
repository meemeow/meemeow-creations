export default function Home() {
	return (
		<main className="min-h-[70vh] bg-gradient-to-b from-[#0f1112] to-[#191b1d] text-white flex items-center justify-center px-4 overflow-hidden">
			<div className="construction-wrap relative w-full">
				<div className="construction-tape" aria-hidden="true"></div>
				<div className="construction-tape second" aria-hidden="true"></div>
				<div className="construction-tape fourth" aria-hidden="true"></div>
				<div className="construction-tape third" aria-hidden="true"></div>
				<div className="flex flex-col sm:flex-row items-center gap-2 relative z-20 justify-center max-w-3xl mx-auto construction-content">
					<img
						src="/assets/images/cat_construction.png"
						alt="Construction cat"
						className="w-28 h-28 object-contain drop-shadow-lg pulse-glow"
					/>

					<div className="flex flex-col items-center justify-center ml-2 text-center">
						<p className="text-2xl rye-font whitespace-nowrap pulse-glow">Page under construction...</p>
						<p className="text-xl rye-font whitespace-nowrap pulse-glow">Try another page for now!</p>
					</div>
				</div>
			</div>
		</main>
	);
}
