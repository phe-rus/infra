import { Activity01Icon, Bone01Icon, Comet01Icon, Download01Icon, Message02Icon, PackageIcon, Settings01Icon, TerminalIcon, Upload01Icon, UserIcon } from "@hugeicons/core-free-icons";

export const config = [
    {
        label: "Users",
        path: "/users",
        Icon: UserIcon,
    },
    {
        label: "Console",
        path: "/console",
        Icon: TerminalIcon,
    },
    {
        label: "Storage",
        path: "/storage",
        Icon: PackageIcon,
    },
    {
        label: "Logs",
        path: "/logs",
        Icon: Activity01Icon,
    },
    {
        isDev: true,
        label: "Messaging",
        path: "/messaging",
        Icon: Message02Icon,
    },
    {
        label: "System",
        items: [
            {
                isDev: true,
                label: "Application",
                path: "/settings",
                Icon: Settings01Icon,
            },
            {
                label: "Metrics",
                path: "/settings/metrics",
                Icon: Comet01Icon,
            },
            {
                isDev: true,
                label: "Crons",
                path: "/settings/crons",
                Icon: Bone01Icon,
            },
        ],
    },
    {
        label: "Sync",
        items: [
            {
                isDev: true,
                label: "Export store",
                path: "/settings/sync#export",
                Icon: Download01Icon,
            },
            {
                isDev: true,
                label: "Import store",
                path: "/settings/sync#import",
                Icon: Upload01Icon,
            },
        ],
    },
    {
        label: "Debug",
        items: [
            {
                isDev: true,
                label: "SQL console",
                path: "/settings/sql",
                Icon: Download01Icon,
            },
        ],
    },
]