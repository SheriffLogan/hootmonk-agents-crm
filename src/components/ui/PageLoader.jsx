export default function PageLoader() {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="relative w-10 h-10">
        <div className="absolute inset-0 rounded-full border-2 border-primary-200" />
        <div className="absolute inset-0 rounded-full border-2 border-primary-600 border-t-transparent animate-spin" />
      </div>
    </div>
  );
}
