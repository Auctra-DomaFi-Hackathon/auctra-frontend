import ManageHeader from "../_components/ManageHeader";
import ManageTabs from "../_components/ManageTabs";

export default function RentManagePage() {
  return (
    <div className="container mx-auto px-6 py-8 pt-30">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Manage Rentals
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Create and manage your domain rental listings
        </p>
      </div>

      <ManageHeader />
      <ManageTabs />
    </div>
  );
}