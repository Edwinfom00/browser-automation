"use client"

import { useCallback, useEffect, useState } from "react"
import { useOnSelectionChange, useReactFlow, type Edge } from "@xyflow/react"
import { Loader2, MoreHorizontal, Play, Trash2 } from "lucide-react"
import { toast } from "sonner"

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ResizablePanel } from "@/components/ui/resizable"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"

import { WORKFLOW_RUN_STATUS_LABELS } from "@/modules/workflows/constants"
import { useAddNode } from "@/modules/workflows/hooks/use-add-node"
import { useRunWorkflow } from "@/modules/workflows/hooks/use-run-workflow"
import {
  useSelectedNode,
  type SelectedNode,
} from "@/modules/workflows/hooks/use-selected-node"
import { serializeWorkflowGraph } from "@/modules/workflows/lib/serialize-graph"
import { validateWorkflowGraph } from "@/modules/workflows/lib/validate-graph"
import {
  nodeRegistry,
  type NodeDefinition,
  type NodeField,
  type NodeType,
  type StepNodeKind,
  type StepNodeType,
} from "@/modules/workflows/nodes/node-registry"
import { DeleteWorkflowDialog } from "@/modules/workflows/ui/components/delete-workflow-dialog"


function NodeIcon({ type, className }: { type: NodeType; className?: string }) {
  const def = nodeRegistry[type]
  const Icon = def.icon
  return (
    <span
      className={cn(
        "flex size-6 shrink-0 items-center justify-center rounded-md",
        def.accent,
        className
      )}
    >
      <Icon className="size-3.5" />
    </span>
  )
}


function Section({
  title,
  icon,
  children,
}: {
  title: string
  icon?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex items-center gap-2 border-y border-border bg-card px-3 py-1.5 text-sm font-semibold">
        {icon}
        {title}
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto">{children}</div>
    </div>
  )
}

function FieldInput({
  field,
  value,
  onChange,
}: {
  field: NodeField
  value: string
  onChange: (value: string) => void
}) {
  if (field.multiline) {
    return (
      <Textarea
        id={field.key}
        value={value}
        placeholder={field.placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="max-h-64"
      />
    )
  }

  return (
    <Input
      id={field.key}
      value={value}
      placeholder={field.placeholder}
      onChange={(e) => onChange(e.target.value)}
    />
  )
}


function Inspector({ node }: { node: SelectedNode | null }) {
  const { updateNodeData } = useReactFlow<StepNodeType>()

  if (!node) {
    return (
      <Section title="Editor">
        <p className="p-3 text-sm text-muted-foreground">No node selected</p>
      </Section>
    )
  }

  const { type, title, values } = node.data
  const def: NodeDefinition = nodeRegistry[type]

  return (
    <Section title={title} icon={<NodeIcon type={type} />}>
      <div className="flex flex-col gap-3 p-3">
        {def.fields.length === 0 ? (
          <p className="text-xs text-muted-foreground">No properties</p>
        ) : (
          def.fields.map((field) => (
            <div key={field.key} className="flex flex-col gap-1.5">
              <Label htmlFor={field.key} className="text-xs">
                {field.label}
                {field.required && <span className="text-destructive">*</span>}
              </Label>
              <FieldInput
                field={field}
                value={values[field.key] ?? ""}
                onChange={(value) =>
                  updateNodeData(node.id, (current) => ({
                    values: { ...current.data.values, [field.key]: value },
                  }))
                }
              />
            </div>
          ))
        )}
      </div>
    </Section>
  )
}


const sections: { kind: StepNodeKind; label: string }[] = [
  { kind: "trigger", label: "Triggers" },
  { kind: "action", label: "Actions" },
]

const definitions = Object.values(nodeRegistry)

function Palette() {
  const add = useAddNode()

  return (
    <Section title="Toolbar">
      <Accordion
        type="multiple"
        defaultValue={sections.map((s) => s.kind)}
        className="px-3 py-2"
      >
        {sections.map((section) => (
          <AccordionItem
            key={section.kind}
            value={section.kind}
            className="not-last:border-b-0"
          >
            <AccordionTrigger className="py-2 text-xs font-medium text-muted-foreground hover:no-underline">
              {section.label}
            </AccordionTrigger>
            <AccordionContent className="flex flex-col gap-0.5">
              {definitions
                .filter((def) => def.kind === section.kind)
                .map((def) => (
                  <Button
                    key={def.type}
                    variant="ghost"
                    onClick={() => add(def.type as NodeType)}
                    className="justify-start gap-2.5 px-1.5 text-xs"
                  >
                    <NodeIcon type={def.type as NodeType} />
                    {def.label}
                  </Button>
                ))}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </Section>
  )
}

function ActionsMenu({ workflowId }: { workflowId: string }) {
  const [isConfirming, setIsConfirming] = useState(false)

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button size="icon" variant="ghost">
            <MoreHorizontal />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="min-w-48">
          <DropdownMenuItem
            variant="destructive"
            className="text-xs [&_svg:not([class*='size-'])]:size-3.5"
            onSelect={() => setIsConfirming(true)}
          >
            <Trash2 />
            Delete workflow
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>


      <DeleteWorkflowDialog
        workflow={isConfirming ? { id: workflowId } : null}
        onOpenChange={(open) => {
          if (!open) {
            setIsConfirming(false)
          }
        }}
      />
    </>
  )
}


function RunButton({ workflowId }: { workflowId: string }) {
  const { getNodes, getEdges } = useReactFlow<StepNodeType, Edge>()

  const { start, isPending, error, clearError } = useRunWorkflow({
    onFinished: (status) => {
      const label = WORKFLOW_RUN_STATUS_LABELS[status] ?? status

      if (status === "COMPLETED") {
        toast.success("Workflow run completed")
        return
      }

      toast.error(`Workflow run ${label.toLowerCase()}`)
    },
  })

 
  useEffect(() => {
    if (!error) {
      return
    }

    toast.error(error)
    clearError()
  }, [error, clearError])

  const run = useCallback(async () => {
   
    const graph = serializeWorkflowGraph(getNodes(), getEdges())
    const validation = validateWorkflowGraph(graph)

    if (!validation.ok) {
      const [first, ...rest] = validation.issues

      toast.error(first?.message ?? "This workflow can't run yet", {
        description:
          rest.length > 0
            ? `And ${rest.length} other ${rest.length === 1 ? "issue" : "issues"} to fix.`
            : undefined,
      })
      return
    }

    await start(workflowId)
  }, [getEdges, getNodes, start, workflowId])

  return (
    <Button size="sm" variant="secondary" disabled={isPending} onClick={run}>
      {isPending ? <Loader2 className="animate-spin" /> : <Play fill="primary" />}
      {isPending ? "Running" : "Run"}
    </Button>
  )
}

export function RightSidebar({ workflowId }: { workflowId: string }) {
  const [tab, setTab] = useState("toolbar")
  const selected = useSelectedNode()

  const onChange = useCallback(({ nodes }: { nodes: StepNodeType[] }) => {
    if (nodes.length > 0) {
      setTab("editor")
    }
  }, [])

  useOnSelectionChange<StepNodeType>({ onChange })

  const [prevSelected, setPrevSelected] = useState(selected?.id)
  if (selected?.id !== prevSelected) {
    setPrevSelected(selected?.id)
    setTab("editor")
  }

  return (
    <ResizablePanel
      className="bg-background"
      defaultSize="16rem"
      minSize="14rem"
      maxSize="36rem"
      groupResizeBehavior="preserve-pixel-size"
    >
      <Tabs value={tab} onValueChange={setTab} className="size-full gap-0">
        <div className="flex items-center justify-between border-b border-border p-2">
          <ActionsMenu workflowId={workflowId} />
          <RunButton workflowId={workflowId} />
        </div>
        <TabsList className="m-2 w-fit bg-background">
          <TabsTrigger
            value="toolbar"
            className="flex-none rounded-sm data-active:bg-accent! data-active:text-accent-foreground! data-active:shadow-none! dark:data-active:border-transparent!"
          >
            Toolbar
          </TabsTrigger>
          <TabsTrigger
            value="editor"
            className="flex-none rounded-sm data-active:bg-accent! data-active:text-accent-foreground! data-active:shadow-none! dark:data-active:border-transparent!"
          >
            Editor
          </TabsTrigger>
        </TabsList>
        <TabsContent value="toolbar" className="flex min-h-0 flex-col">
          <Palette />
        </TabsContent>
        <TabsContent value="editor" className="flex min-h-0 flex-col">
          <Inspector node={selected} />
        </TabsContent>
      </Tabs>
    </ResizablePanel>
  )
}