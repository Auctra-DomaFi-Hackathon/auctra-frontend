"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ListingsTable from "./ListingsTable";
import MyRentalsTable from "./MyRentalsTable";

export default function ManageTabs() {
  return (
    <Tabs defaultValue="listings" className="w-full">
      <TabsList className="mb-6">
        <TabsTrigger value="listings">My Listings</TabsTrigger>
        <TabsTrigger value="rentals">My Rentals</TabsTrigger>
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