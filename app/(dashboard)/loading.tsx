import { LoadingPanel } from "@/components/shared/loading"

export default function Loading() {
  return (
    <LoadingPanel
      bordered={false}
      className="flex-1"
      title="Loading workspace"
      description="Fetching your workflows and their latest runs."
    />
  )
}
