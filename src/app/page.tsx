import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function page() {

    const something = true;

    return <div className="flex justify-center items-center min-h-screen min-w-screen">
      <Button size={"lg"} className="cursor-pointer" variant={"default"} >Click Me</Button>
    </div>
}