"use client";

import { Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";

interface RemoveItemButtonProps {
  itemName: string;
  onConfirm: () => void;
  className?: string;
  iconClassName?: string;
  size?: "sm" | "md";
}

export function RemoveItemButton({
  itemName,
  onConfirm,
  className,
  iconClassName,
  size = "md",
}: RemoveItemButtonProps) {
  const dim = size === "sm" ? "h-8 w-8" : "h-9 w-9";
  const iconDim = size === "sm" ? "h-3.5 w-3.5" : "h-4 w-4";

  return (
    <AlertDialog>
      <AlertDialogTrigger
        aria-label={`Remove ${itemName}`}
        className={cn(
          "flex flex-shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-destructive/40 active:scale-90",
          dim,
          className,
        )}
      >
        <Trash2 className={cn(iconDim, iconClassName)} />
      </AlertDialogTrigger>
      <AlertDialogContent size="sm">
        <AlertDialogHeader>
          <AlertDialogMedia>
            <Trash2 className="text-destructive" />
          </AlertDialogMedia>
          <AlertDialogTitle>Remove {itemName}?</AlertDialogTitle>
          <AlertDialogDescription>
            This will remove the item from your order. You can always add it
            back from the menu.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Keep</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className="bg-destructive text-white hover:bg-destructive/90"
          >
            Remove
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
