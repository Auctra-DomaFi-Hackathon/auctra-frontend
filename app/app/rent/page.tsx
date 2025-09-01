import FilterBar from "./_components/FilterBar";
import ListingsGrid from "./_components/ListingsGrid";

export default function RentPage() {
  return (
    <div className="container mx-auto px-6 py-8 pt-30">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Rent Domains
        </h1>
        <p className="text-gray-600">
          Discover and rent premium domains for your projects
        </p>
      </div>

      <FilterBar />
      <ListingsGrid />
    </div>
  );
}