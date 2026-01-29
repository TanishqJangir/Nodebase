import { Button } from "@/components/ui/button";
import prisma from "@/lib/db";

const Page = async () => {

  const users = await prisma.user.findMany();

    return <div className="flex justify-center items-center min-h-screen min-w-screen">
      <Button size={"lg"} className="cursor-pointer" variant={"default"} >Click Me</Button>
      {JSON.stringify(users)}
    </div>
}

export default Page;