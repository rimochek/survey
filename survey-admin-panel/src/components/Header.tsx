import { Button } from "@/components/ui/button"
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@/components/ui/navigation-menu"
import { useRouter } from "next/navigation"

export default function Header() {
  const router = useRouter()
  const handleLogout = () => {
    localStorage.removeItem("admin_token")
    router.push("/login")
  }

  return (
    <div className="w-full p-2 md:p-5 flex justify-between items-center">
      <h1 className="text-xl sm:text-xl md:text-2xl lg:text-3xl font-bold">
        Admin Panel
      </h1>

      <NavigationMenu>
        <NavigationMenuList>
          <NavigationMenuItem className="flex">
            <NavigationMenuLink
              href="/"
              className="font-bold text-lg sm:text-lg md:text-xl"
            >
              Redact responses
            </NavigationMenuLink>
            <NavigationMenuLink
              href="/edit-questions"
              className="font-bold text-lg sm:text-lg md:text-xl"
            >
              Edit questions
            </NavigationMenuLink>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>

      <Button onClick={handleLogout}>Logout</Button>
    </div>
  )
}
