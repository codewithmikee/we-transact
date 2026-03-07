import { NavConfig, NavItemContent } from "@/types/nav.types";

export const ORGANiZATION_USER_NAV_ITEMS: NavConfig[] = [
    {
        link: '/org',
        title: "Dashboard",
        icon: 'LayoutDashboard',
    },
    {
        link: '/org/integrations',
        title: "Integrations",
        icon: 'LinkIcon',
    },
    {
        title: "Management",
        items: [
            {
                link: '/org/agents',
                title: "Agents",
                icon: 'Users',
            },
            {
                link: '/org/payment-setting',
                title: "Payment Setting",
                icon: 'CreditCard',
                preventerUserRoles: [ "org_admin" ]
            },
        ]
    },
    {
        link: '/org/admins',
        title: 'Admins',
        icon: 'UserCog',
        preventerUserRoles: [ "org_admin" ]
    }
]

export const SYSTEM_ADMIN_NAV_ITEMS: NavItemContent[] = [
    {
        link: '/system',
        title: "Dashboard",
        icon: 'LayoutDashboard',
    },
    {
        link: '/system/organizations',
        title: "Organizations",
        icon: 'Building2',
    },
    {
        link: '/system/users',
        title: "Users",
        icon: 'Users',
    },
    {
        link: '/system/banks',
        title: "Banks",
        icon: 'Banknote',
    }
]
