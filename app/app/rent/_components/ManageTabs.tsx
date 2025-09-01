"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import NewListingForm from "./NewListingForm";
import ListingsTable from "./ListingsTable";

export default function ManageTabs() {
  return (
    <Tabs defaultValue="listings" className="w-full">
      <TabsList className="mb-6">
        <TabsTrigger value="listings">My Listings</TabsTrigger>
        <TabsTrigger value="new">New Listing</TabsTrigger>
      </TabsList>

      <TabsContent value="listings" className="space-y-6">
        <ListingsTable />
      </TabsContent>

      <TabsContent value="new" className="space-y-6">
        <NewListingForm />
      </TabsContent>
    </Tabs>
  );
}