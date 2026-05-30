import * as React from "react";
import { cn } from "@/lib/utils";
import { ClientTweetCard } from "./client-side-tweet";
import { Marquee } from "./marquee";

export interface TweetGridProps {
  tweets: string[];
  className?: string;
  speed?: "slow" | "normal" | "fast";
  columns?: number;
}

export const TweetGrid: React.FC<TweetGridProps> = ({
  tweets = [],
  className,
  speed = "slow",
  columns = 3,
}) => {
  const safeTweets = tweets ?? [];

  const getDuration = () => {
    const map = { slow: 120, normal: 30, fast: 15 };
    return `${map[speed]}s`;
  };

  const cols = Array.from({ length: columns }, (_, colIdx) =>
    safeTweets.filter((_, tweetIdx) => tweetIdx % columns === colIdx)
  );

  const mdCols = Math.min(2, columns);
  const colsMd = Array.from({ length: mdCols }, (_, colIdx) =>
    safeTweets.filter((_, tweetIdx) => tweetIdx % mdCols === colIdx)
  );

  return (
    <div className={cn("flex w-full h-full relative overflow-hidden px-4 max-w-[1240px] mx-auto", className)}>
      <div className="absolute -top-16 w-full h-1/3 z-20 bg-gradient-to-b from-[#101010] via-[#101010]/90 to-transparent"></div>
      <div className="absolute -bottom-8 w-full h-1/3 z-20 bg-gradient-to-t from-[#101010] via-[#101010]/90 to-transparent"></div>
      <div className="w-full hidden lg:flex">
        {cols.map((colTweets, colIdx) => (
          <Marquee
            key={colIdx}
            vertical
            reverse={colIdx % 2 === 1}
            repeat={2}
            className=""
            style={
              {
                "--duration": getDuration(),
              } as React.CSSProperties
            }
          >
            {colTweets.map((tweetId, i) => (
              <div
                key={`col${colIdx}-tweet${i}`}
                className="flex-none min-h-[154px] transition-transform"
              >
                <ClientTweetCard id={tweetId} />
              </div>
            ))}
          </Marquee>
        ))}
      </div>

      <div className="w-full hidden md:flex lg:hidden">
        {colsMd.map((colTweets, colIdx) => (
          <Marquee
            key={colIdx}
            vertical
            reverse={colIdx % 2 === 1}
            repeat={2}
            className=""
            style={
              {
                "--duration": getDuration(),
              } as React.CSSProperties
            }
          >
            {colTweets.map((tweetId, i) => (
              <div
                key={`col${colIdx}-tweet${i}`}
                className="flex-none min-h-[154px] transition-transform"
              >
                <ClientTweetCard id={tweetId} />
              </div>
            ))}
          </Marquee>
        ))}
      </div>

      <div className="w-full flex flex-col md:hidden items-center justify-center">
        <Marquee
          vertical
          repeat={2}
          className=""
          style={
            {
              "--duration": getDuration(),
            } as React.CSSProperties
          }
        >
          {safeTweets.map((tweetId, i) => (
            <div
              key={`col-tweet${i}`}
              className="flex-none !min-h-[154px] transition-transform"
            >
              <ClientTweetCard id={tweetId} />
            </div>
          ))}
        </Marquee>
      </div>
    </div>
  );
};

export default TweetGrid;