"use client";

import { useEffect } from "react";
import { useCartStore } from "@/stores/cart";

export default function CartAvailabilitySync() {
  const items = useCartStore((state) => state.items);
  const syncAvailability = useCartStore((state) => state.syncAvailability);

  useEffect(() => {
    void syncAvailability();
  }, [items, syncAvailability]);

  return null;
}
