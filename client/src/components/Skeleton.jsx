const Skeleton = ({ className = '', count = 1 }) => {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className={`skeleton rounded ${className}`} />
      ))}
    </>
  );
};

export const ProductCardSkeleton = () => (
  <div className="card-luxury overflow-hidden">
    <div className="aspect-square skeleton" />
    <div className="p-5">
      <Skeleton className="h-3 w-20 mb-2" />
      <Skeleton className="h-5 w-3/4 mb-3" />
      <Skeleton className="h-5 w-24" />
    </div>
  </div>
);

export default Skeleton;
