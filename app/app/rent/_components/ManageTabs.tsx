"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ListingsTable from "./ListingsTable";

export default function ManageTabs() {
  return (
    <Tabs defaultValue="listings" className="w-full">
      <TabsList className="mb-6">
        <TabsTrigger value="listings">My Listings</TabsTrigger>
      </TabsList>

      <TabsContent value="listings" className="space-y-6">
        <ListingsTable />
      </TabsContent>
    </Tabs>
  );
}