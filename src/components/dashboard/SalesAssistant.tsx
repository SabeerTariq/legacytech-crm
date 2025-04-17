
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Robot } from "lucide-react";

export const SalesAssistant = () => {
  return (
    <Card className="col-span-4">
      <CardHeader>
        <CardTitle>Sales Assistant</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center p-6 text-center">
        <Robot className="h-12 w-12 text-primary mb-4" />
        <h3 className="text-lg font-semibold mb-2">Need help with your sales data?</h3>
        <p className="text-muted-foreground mb-4">
          Get insights and answers from our AI sales assistant, Better Ask Saul.
        </p>
        <Button asChild>
          <Link to="/better-ask-saul">Ask Saul</Link>
        </Button>
      </CardContent>
    </Card>
  );
};
