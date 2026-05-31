import * as React from "react";
import { Tweet } from "react-tweet";
import { cn } from "@/lib/utils";

export interface TweetGridProps {
  tweets: string[];
  className?: string;
  speed?: "slow" | "normal" | "fast";
}

export const TweetGrid: React.FC<TweetGridProps> = ({
  tweets = [],
  className,
  speed = "normal",
}) => {
  const safeTweets = tweets ?? [];
  const midpoint = Math.ceil(safeTweets.length / 2);
  const topRowTweets = safeTweets.slice(0, midpoint);
  const bottomRowTweets = safeTweets.slice(midpoint);

  const getTweetsAnimationDuration = (numTweets: number) => {
    const baseSpeed = {
      slow: 30,
      normal: 15,
      fast: 10,
    };
    return `${baseSpeed[speed] * (numTweets / 5)}s`;
  };

  return (
    <div className={cn("w-full overflow-hidden", className)}>
      {/* Top row */}
      <div className="relative mb-2">
        <div
          className="flex"
          style={{
            ["--duration" as string]: getTweetsAnimationDuration(
              topRowTweets.length
            ),
            width: "fit-content",
          }}
        >
          <div className="flex animate-scrollRight [&:hover>div]:animate-none">
            {/* Original tweets */}
            {topRowTweets.map((tweetId, i) => (
              <div
                key={`top-${tweetId}-${i}`}
                className="flex-none mx-2 hover:scale-105 transition-transform"
                style={{ minWidth: "320px" }}
              >
                <Tweet id={tweetId} />
              </div>
            ))}
            {/* Duplicate set for seamless loop */}
            {topRowTweets.map((tweetId, i) => (
              <div
                key={`top-duplicate-${tweetId}-${i}`}
                className="flex-none mx-2 hover:scale-105 transition-transform"
                style={{ minWidth: "320px" }}
              >
                <Tweet id={tweetId} />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom row */}
      <div className="relative">
        <div
          className="flex"
          style={{
            ["--duration" as string]: getTweetsAnimationDuration(
              bottomRowTweets.length
            ),
            width: "fit-content",
          }}
        >
          <div className="flex animate-scrollLeft [&:hover>div]:animate-none">
            {/* Original tweets */}
            {bottomRowTweets.map((tweetId, i) => (
              <div
                key={`bottom-${tweetId}-${i}`}
                className="flex-none mx-2 hover:scale-105 transition-transform"
                style={{ minWidth: "320px" }}
              >
                <Tweet id={tweetId} />
              </div>
            ))}
            {/* Duplicate set for seamless loop */}
            {bottomRowTweets.map((tweetId, i) => (
              <div
                key={`bottom-duplicate-${tweetId}-${i}`}
                className="flex-none mx-2 hover:scale-105 transition-transform"
                style={{ minWidth: "320px" }}
              >
                <Tweet id={tweetId} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TweetGrid;
