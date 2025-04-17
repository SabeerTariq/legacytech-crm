
import React from 'react';
import { BetterAskSaul as BetterAskSaulComponent } from "@/components/chat/BetterAskSaul";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import MainLayout from "@/components/layout/MainLayout";

const BetterAskSaulPage = () => {
  return (
    <MainLayout>
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Better Ask Saul</h2>
        </div>
        <div className="grid gap-4">
          <Card className="col-span-4">
            <CardHeader>
              <CardTitle>Sales Assistant</CardTitle>
            </CardHeader>
            <CardContent>
              <BetterAskSaulComponent />
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
};

export default BetterAskSaulPage;
