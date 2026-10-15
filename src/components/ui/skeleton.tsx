import React from "react";

const skeletonColors = [colors.zinc[200], colors.zinc[300], colors.zinc[200]];

type SkeletonProps = Omit<MotiSkeletonProps, "Gradient">;

export function Skeleton({ ...props }: SkeletonProps) {
  return <MotiSkeleton {...props} colors={skeletonColors} />;
}
