"use client"

import { PageKey, useNavigationStore } from "../../store/navigation.store"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import style from "./NaviguationBar.module.css"

export function NavigationTabs() {
  const { activePage, setActivePage } = useNavigationStore()

  return (
    <Tabs className={style.menuBar} value={activePage} onValueChange={(value) => setActivePage(value as PageKey)}>
      <TabsList>
        <TabsTrigger  className={style.tabTrigger} value="default">Dashboard</TabsTrigger>
        <TabsTrigger className={style.tabTrigger} value="ondes">Ondes</TabsTrigger>
        <TabsTrigger className={style.tabTrigger} value="packets">Packets d'ondes</TabsTrigger>
      </TabsList>
    </Tabs>
  )
}