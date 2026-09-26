interface MatchScoreProps {
  score: number;
}

const MatchScore = ({ score }: MatchScoreProps) => {
  return (
    <span className="rounded-full bg-green-50 px-2.5 py-1 text-xs font-medium text-green-700">
      {score}% match
    </span>
  );
};

export default MatchScore;
