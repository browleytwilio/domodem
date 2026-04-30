"use client";

import { useState } from "react";
import { MapPin, Plus, Pencil, Trash2 } from "lucide-react";
import { AuthGuard } from "@/components/auth/auth-guard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface Address {
  id: string;
  label: string;
  line1: string;
  line2: string;
  suburb: string;
  state: string;
  postcode: string;
  isDefault: boolean;
}

const initialAddresses: Address[] = [
  {
    id: "addr-1",
    label: "Home",
    line1: "42 Wallaby Way",
    line2: "Apt 3",
    suburb: "Sydney",
    state: "NSW",
    postcode: "2000",
    isDefault: true,
  },
  {
    id: "addr-2",
    label: "Work",
    line1: "100 George Street",
    line2: "Level 5",
    suburb: "Sydney",
    state: "NSW",
    postcode: "2000",
    isDefault: false,
  },
];

function formatAddress(addr: Address): string {
  const parts = [addr.line1];
  if (addr.line2) parts.push(addr.line2);
  parts.push(`${addr.suburb} ${addr.state} ${addr.postcode}`);
  return parts.join(", ");
}

export default function AddressesPage() {
  const [addresses, setAddresses] = useState<Address[]>(initialAddresses);

  function handleDelete(id: string) {
    setAddresses((prev) => prev.filter((a) => a.id !== id));
  }

  return (
    <div className="bg-[var(--dominos-light-gray)]">
      <AuthGuard>
          <div className="mx-auto max-w-3xl px-4 py-10">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold">Saved Addresses</h1>
                <p className="mt-1 text-sm text-muted-foreground">
                  Manage your delivery addresses for faster checkout.
                </p>
              </div>
              <Button className="gap-1.5 bg-[var(--dominos-red)] text-white hover:bg-[var(--dominos-red)]/90">
                <Plus className="h-4 w-4" />
                Add New Address
              </Button>
            </div>

            {addresses.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center gap-4 py-16">
                  <MapPin className="h-16 w-16 text-muted-foreground/30" />
                  <p className="text-lg font-medium text-muted-foreground">
                    No saved addresses
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Add an address to speed up your next order.
                  </p>
                  <Button className="gap-1.5 bg-[var(--dominos-red)] text-white hover:bg-[var(--dominos-red)]/90">
                    <Plus className="h-4 w-4" />
                    Add Address
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {addresses.map((address) => (
                  <Card key={address.id}>
                    <CardHeader className="pb-2">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-[var(--dominos-blue)]" />
                        <CardTitle className="text-sm font-semibold">
                          {address.label}
                        </CardTitle>
                        {address.isDefault && (
                          <Badge
                            variant="secondary"
                            className="bg-[var(--dominos-blue)]/10 text-[var(--dominos-blue)]"
                          >
                            Default
                          </Badge>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        {formatAddress(address)}
                      </p>
                      <div className="mt-4 flex gap-2 border-t pt-4">
                        <Button variant="outline" size="sm" className="gap-1.5">
                          <Pencil className="h-3.5 w-3.5" />
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-1.5 text-destructive hover:bg-destructive/10 hover:text-destructive"
                          onClick={() => handleDelete(address.id)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          Delete
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </AuthGuard>
    </div>
  );
}
