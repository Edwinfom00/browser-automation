import { LoadingPanel } from "@/components/shared/loading"

export default function Loading() {
  return (
    <div className="flex flex-1 flex-col p-6 sm:p-8">
      <LoadingPanel
        bordered={false}
        className="flex-1"
        title="Loading workspace"
        description="Fetching your workflows and their latest runs."
      />
    </div>
  )
}
