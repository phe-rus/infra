export const statusVariant = (status: string): "outline" | "destructive" | "secondary" => {
    if (status === "completed") return "outline"
    if (status === "failed" || status === "cancelled") return "destructive"
    return "secondary"
}
