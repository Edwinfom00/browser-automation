import Link from "next/link"
import { LuHouse } from "react-icons/lu"

import { SystemState } from "@/components/system-state"
import { Button } from "@/components/ui/button"

export default function NotFound() {
  return (
    <>
      <title>Page not found | Browser Automation</title>
      <SystemState
        kind="not-found"
        code="404"
        title="This route has no next step."
        description="The address does not point to an automation page. Return home and choose a workflow from there."
        actions={
          <Button asChild size="lg" className="h-11 rounded-xl px-5">
            <Link href="/">
              <LuHouse aria-hidden data-icon="inline-start" />
              Return home
            </Link>
          </Button>
        }
      />
    </>
  )
}
