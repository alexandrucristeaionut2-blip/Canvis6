"use client";

import * as React from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { COUNTRIES, SHIPPING_ZONES, resolveZone } from "@/lib/shipping";
import { formatMoneyRonBani } from "@/lib/currency";

export function ShippingEstimator() {
  const [country, setCountry] = React.useState<string>("RO");
  const zone = resolveZone(country);
  const data = SHIPPING_ZONES[zone];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Estimate shipping</CardTitle>
        <CardDescription>Mock zones • fixed table</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="mb-2 text-sm font-medium">Country</div>
          <Select value={country} onValueChange={setCountry}>
            <SelectTrigger aria-label="Select country">
              <SelectValue placeholder="Select" />
            </SelectTrigger>
            <SelectContent>
              {COUNTRIES.map((c) => (
                <SelectItem key={c.code} value={c.code}>
                  {c.name}
                </SelectItem>
              ))}
              <SelectItem value="XX">Other / Unknown</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="rounded-2xl border bg-background p-4 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Zone</span>
            <span className="font-medium">{data.label}</span>
          </div>
          <div className="mt-2 flex items-center justify-between">
            <span className="text-muted-foreground">Shipping</span>
            <span className="font-medium">{formatMoneyRonBani(data.costRonBani)}</span>
          </div>
          <div className="mt-2 flex items-center justify-between">
            <span className="text-muted-foreground">ETA</span>
            <span className="font-medium">{data.eta}</span>
          </div>
        </div>

        <div className="text-xs text-muted-foreground">
          Disclaimer: customs/taxes may apply depending on destination.
        </div>
      </CardContent>
    </Card>
  );
}
