import { cn } from "@/lib/utils";

export default function page() {

    const something = true;

    return <div className={cn(
      "text-red-500 font-bold",
      something === true && "text-green-500"

    )}>
      Hello Wrold
    </div>
}