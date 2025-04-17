
import { BetterAskSaul } from "../chat/BetterAskSaul";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const SalesAssistant = () => {
  return (
    <Card className="col-span-4">
      <CardHeader>
        <CardTitle>Sales Assistant</CardTitle>
      </CardHeader>
      <CardContent>
        <BetterAskSaul />
      </CardContent>
    </Card>
  );
};
