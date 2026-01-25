export default function Benchmark() {
  return (
    <div className="h-[calc(100vh-64px)] w-full overflow-hidden">
      <iframe
        src="https://artificialanalysis.ai/embed/llm-performance-leaderboard"
        title="LLM Benchmark Leaderboard"
        className="w-full h-full border-0"
        loading="lazy"
        allowFullScreen
      />
    </div>
  );
}
