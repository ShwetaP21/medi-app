interface EmptyStateProps {
  icon: string
  title: string
  description?: string
  action?: React.ReactNode
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="text-center py-20 text-stone-400">
      <p className="text-5xl mb-4">{icon}</p>
      <p className="font-medium text-stone-600 text-base">{title}</p>
      {description && <p className="text-sm mt-1.5 text-stone-400">{description}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  )
}
