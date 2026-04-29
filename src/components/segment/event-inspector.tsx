"use client";

import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Radio, Users, UserCircle, Route, Calculator } from "lucide-react";
import { EventStream } from "./event-stream";
import { AudiencesPanel } from "./audiences-panel";
import { IdentityPanel } from "./identity-panel";
import { JourneyPanel } from "./journey-panel";
import { ComputedTraitsPanel } from "./computed-traits-panel";
import { useSegmentStore } from "@/stores/segment-store";

export function EventInspector() {
  const open = useSegmentStore((s) => s.inspectorOpen);
  const setOpen = useSegmentStore((s) => s.setInspectorOpen);
  const tab = useSegmentStore((s) => s.inspectorTab);
  const setTab = useSegmentStore((s) => s.setInspectorTab);
  const eventCount = useSegmentStore((s) => s.events.length);
  const audienceCount = useSegmentStore((s) => s.audiences.length);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent
        side="right"
        className="flex w-full flex-col p-0 sm:max-w-[900px] lg:max-w-[1100px]"
      >
        <header className="flex items-center justify-between border-b px-4 py-3">
          <div className="flex items-center gap-2">
            <Radio className="h-4 w-4 text-emerald-600" />
            <SheetTitle className="text-base font-semibold">
              Segment Inspector
            </SheetTitle>
            <Badge variant="secondary" className="bg-emerald-100 text-emerald-700">
              Live
            </Badge>
          </div>
        </header>

        <Tabs
          value={tab}
          onValueChange={(v) => setTab(v as typeof tab)}
          className="flex flex-1 min-h-0 flex-col gap-0"
        >
          <TabsList className="mx-4 mt-3 grid h-9 w-fit grid-cols-5">
            <TabsTrigger value="events" className="gap-1.5">
              <Radio className="h-3.5 w-3.5" />
              Events
              <span className="ml-1 rounded-full bg-muted px-1.5 text-[10px]">{eventCount}</span>
            </TabsTrigger>
            <TabsTrigger value="audiences" className="gap-1.5">
              <Users className="h-3.5 w-3.5" />
              Audiences
              <span className="ml-1 rounded-full bg-muted px-1.5 text-[10px]">{audienceCount}</span>
            </TabsTrigger>
            <TabsTrigger value="identity" className="gap-1.5">
              <UserCircle className="h-3.5 w-3.5" />
              Identity
            </TabsTrigger>
            <TabsTrigger value="journey" className="gap-1.5">
              <Route className="h-3.5 w-3.5" />
              Journey
            </TabsTrigger>
            <TabsTrigger value="computed" className="gap-1.5">
              <Calculator className="h-3.5 w-3.5" />
              Traits
            </TabsTrigger>
          </TabsList>

          <TabsContent value="events" className="flex-1 min-h-0">
            <EventStream />
          </TabsContent>
          <TabsContent value="audiences" className="flex-1 min-h-0 overflow-y-auto">
            <AudiencesPanel />
          </TabsContent>
          <TabsContent value="identity" className="flex-1 min-h-0 overflow-y-auto">
            <IdentityPanel />
          </TabsContent>
          <TabsContent value="journey" className="flex-1 min-h-0 overflow-y-auto">
            <JourneyPanel />
          </TabsContent>
          <TabsContent value="computed" className="flex-1 min-h-0 overflow-y-auto">
            <ComputedTraitsPanel />
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}
