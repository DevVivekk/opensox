"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { useSubscription } from "@/hooks/useSubscription";

const ProRefsPage = (): JSX.Element | null => {
  const { isPaidUser, isLoading } = useSubscription();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isPaidUser) {
      router.push("/pricing");
    }
  }, [isPaidUser, isLoading, router]);

  if (isLoading) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-ox-content">
        <p className="text-text-primary">Loading...</p>
      </div>
    );
  }

  if (!isPaidUser) {
    return null;
  }

  return (
    <div className="w-full h-full flex items-center justify-center bg-ox-content p-6">
      <div className="max-w-2xl mx-auto text-center">
        <h1 className="text-2xl md:text-3xl font-semibold text-text-primary">
          a consolidated place of the best hand-picked resources and references
          on the internet. coming soon..
        </h1>
      </div>
    </div>
  );
};

export default ProRefsPage;
