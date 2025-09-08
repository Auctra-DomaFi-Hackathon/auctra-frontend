"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ListingsTable from "./ListingsTable";
import MyRentalsTable from "./MyRentalsTable";

export default function ManageTabs() {
  return (
    <Tabs defaultValue="listings" className="w-full">
      <TabsList className="mb-6 bg-gray-100 dark:bg-gray-800">
        <TabsTrigger value="listings" className="data-[state=active]:bg-white data-[state=active]:text-gray-900 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 dark:data-[state=active]:bg-gray-700 dark:data-[state=active]:text-gray-100">My Listings</TabsTrigger>
        <TabsTrigger value="rentals" className="data-[state=active]:bg-white data-[state=active]:text-gray-900 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 dark:data-[state=active]:bg-gray-700 dark:data-[state=active]:text-gray-100">My Rentals</TabsTrigger>
      </TabsList>

      <TabsContent value="listings" className="space-y-6">
        <ListingsTable />
      </TabsContent>

      <TabsContent value="rentals" className="space-y-6">
        <MyRentalsTable />
      </TabsContent>
    </Tabs>
  );
}