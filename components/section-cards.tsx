import { IconTrendingDown, IconTrendingUp } from "@tabler/icons-react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function SectionCards() {
  return (
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
      <Card className="@container/card" data-slot="card">
        <CardHeader>
          <CardDescription>Total Alerts</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            2,340
          </CardTitle>
          <div>
            <Badge variant="outline" style={{ backgroundColor: 'hsl(210, 70%, 50%, 0.1)' }}>
              <IconTrendingUp className="h-4 w-4 mr-1" />
              +15.2%
            </Badge>
          </div>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Increased alerts this week <IconTrendingUp className="size-4" />
          </div>
          <div className="text-muted-foreground">
            Alerts over the last 7 days
          </div>
        </CardFooter>
      </Card>
      <Card className="@container/card" data-slot="card">
        <CardHeader>
          <CardDescription>Threats Detected</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            156
          </CardTitle>
          <div>
            <Badge variant="outline" style={{ backgroundColor: 'hsl(120, 70%, 50%, 0.1)' }}>
              <IconTrendingDown className="h-4 w-4 mr-1" />
              -10.5%
            </Badge>
          </div>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Fewer threats detected <IconTrendingDown className="size-4" />
          </div>
          <div className="text-muted-foreground">
            Threat detection trends
          </div>
        </CardFooter>
      </Card>
      <Card className="@container/card" data-slot="card">
        <CardHeader>
          <CardDescription>Active Connections</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            12,789
          </CardTitle>
          <div>
            <Badge variant="outline" style={{ backgroundColor: 'hsl(0, 70%, 50%, 0.1)' }}>
              <IconTrendingUp className="h-4 w-4 mr-1" />
              +8.3%
            </Badge>
          </div>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Stable network activity <IconTrendingUp className="size-4" />
          </div>
          <div className="text-muted-foreground">
            Connections over 24 hours
          </div>
        </CardFooter>
      </Card>
      <Card className="@container/card" data-slot="card">
        <CardHeader>
          <CardDescription>Incident Response Rate</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            92.4%
          </CardTitle>
          <div>
            <Badge variant="outline" style={{ backgroundColor: 'hsl(270, 70%, 50%, 0.1)' }}>
              <IconTrendingUp className="h-4 w-4 mr-1" />
              +3.1%
            </Badge>
          </div>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Improved response times <IconTrendingUp className="size-4" />
          </div>
          <div className="text-muted-foreground">
            Response rate last 30 days
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}