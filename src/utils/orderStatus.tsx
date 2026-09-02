import React from "react";
import { OrderStatus } from "@/types";
import {
  CheckCircle2,
  Clock,
  Truck,
  RotateCcw,
  XCircle,
} from "lucide-react";

export const getOrderStatusBadge = (status: OrderStatus | string) => {
  switch (status) {
    case "confirmed":
      return {
        label: "Confirmed",
        color: "bg-blue-50 text-blue-700 border-blue-200",
        icon: <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />,
      };
    case "processing":
      return {
        label: "Processing",
        color: "bg-indigo-50 text-indigo-700 border-indigo-200",
        icon: <Clock className="w-3.5 h-3.5 text-indigo-600" />,
      };
    case "shipped":
      return {
        label: "Shipped",
        color: "bg-purple-50 text-purple-700 border-purple-200",
        icon: <Truck className="w-3.5 h-3.5 text-purple-600" />,
      };
    case "delivered":
      return {
        label: "Delivered",
        color: "bg-emerald-50 text-emerald-700 border-emerald-200",
        icon: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />,
      };
    case "returned":
      return {
        label: "Returned",
        color: "bg-amber-50 text-amber-700 border-amber-200",
        icon: <RotateCcw className="w-3.5 h-3.5 text-amber-600" />,
      };
    case "cancelled":
    default:
      return {
        label: "Cancelled",
        color: "bg-rose-50 text-rose-700 border-rose-200",
        icon: <XCircle className="w-3.5 h-3.5 text-rose-600" />,
      };
  }
};
