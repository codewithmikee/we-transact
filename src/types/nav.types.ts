import { UserRole } from "./api.types";

export interface NavItemContent {
    title: string,
    link: string,
    icon?: string,
    preventerUserRoles?: UserRole[],
    exact?: boolean
}

export interface NavGroup {
    title: string,
    items: NavItemContent[]
}
 

export type NavConfig = NavGroup|NavItemContent