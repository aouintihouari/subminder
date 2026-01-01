import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function App() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4 dark:bg-slate-900">
      <Card className="w-[400px] shadow-lg">
        <CardHeader>
          <CardTitle className="text-center text-2xl font-bold">
            SubMinder Setup
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email Test</Label>
            <Input id="email" placeholder="Tailwind v4 is working..." />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Button>Primary Action</Button>
            <Button variant="outline">Secondary</Button>
          </div>

          <div className="text-muted-foreground mt-2 text-center text-xs">
            Si tu vois du style, c'est gagné.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
