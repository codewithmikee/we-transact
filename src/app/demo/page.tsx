"use client";

import * as React from "react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Skeleton } from "@/components/ui/Skeleton";
import { Toggle } from "@/components/ui/Toggle";
import { Tabs, TabsList, TabsTrigger, TabsContent, TabsPanel } from "@/components/ui/Tabs";
import { Modal } from "@/components/ui/Dialog";
import { DropdownMenu, DropdownMenuItem } from "@/components/ui/Menu";
import { Select } from "@/components/ui/Select";

interface SelectOption {
  id: string | number;
  name: string;
}

const selectOptions: SelectOption[] = [
  { id: 1, name: "Wade Cooper" },
  { id: 2, name: "Arlene Mccoy" },
  { id: 3, name: "Devon Webb" },
  { id: 4, name: "Tom Cook" },
  { id: 5, name: "Tanya Fox" },
  { id: 6, name: "Hellen Schmidt" },
];

export default function DemoPage() {
  const [isToggled, setIsToggled] = React.useState(false);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [selectedPerson, setSelectedPerson] = React.useState<SelectOption>(selectOptions[0]);

  return (
    <div className="p-8 space-y-12 max-w-4xl mx-auto pb-24">
      <header className="space-y-2 border-b pb-8">
        <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">Component Gallery</h1>
        <p className="text-lg text-slate-600">Enhanced with Headless UI for accessibility and performance.</p>
      </header>

      <section>
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          Interactive Components <Badge variant="success">Headless UI</Badge>
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle>Tabs</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultIndex={0}>
                <TabsList>
                  <TabsTrigger>Overview</TabsTrigger>
                  <TabsTrigger>Details</TabsTrigger>
                  <TabsTrigger>Settings</TabsTrigger>
                </TabsList>
                <TabsContent>
                  <TabsPanel className="p-4 bg-slate-50 rounded-lg text-sm">
                    This is the overview content rendered inside a Headless UI TabPanel.
                  </TabsPanel>
                  <TabsPanel className="p-4 bg-slate-50 rounded-lg text-sm">
                    More specific details about the component or feature go here.
                  </TabsPanel>
                  <TabsPanel className="p-4 bg-slate-50 rounded-lg text-sm">
                    Configuration and preference settings for the current context.
                  </TabsPanel>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Forms & Selection</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Headless Switch</span>
                <Toggle checked={isToggled} onChange={setIsToggled} />
              </div>
              
              <Select 
                label="Assigned to" 
                value={selectedPerson} 
                onChange={setSelectedPerson} 
                options={selectOptions} 
              />

              <div className="flex gap-4">
                <DropdownMenu label="Actions">
                  <DropdownMenuItem onClick={() => alert("Edit clicked")}>Edit Profile</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => alert("Duplicate clicked")}>Duplicate</DropdownMenuItem>
                  <DropdownMenuItem className="text-red-600" onClick={() => alert("Delete clicked")}>Delete</DropdownMenuItem>
                </DropdownMenu>

                <Button variant="outline" onClick={() => setIsModalOpen(true)}>
                  Open Modal
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-6">Standard UI Components</h2>
        <div className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Buttons & States</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4">
                <Button variant="primary">Primary</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="outline">Outline</Button>
                <Button variant="danger">Danger</Button>
                <Button variant="primary" isLoading>Loading</Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Badges</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4">
                <Badge>Default</Badge>
                <Badge variant="secondary">Secondary</Badge>
                <Badge variant="destructive">Destructive</Badge>
                <Badge variant="success">Success</Badge>
                <Badge variant="outline">Outline</Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Inputs & Feedback</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <Input label="Email Address" placeholder="Enter your email" />
              <div className="space-y-2">
                <p className="text-sm font-medium text-slate-500">Loading Skeleton</p>
                <Skeleton className="h-4 w-[250px]" />
                <Skeleton className="h-4 w-[200px]" />
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        title="Welcome to Headless UI"
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-500">
            This modal is built using Headless UI's Dialog component. It features focus trapping, 
            keyboard navigation, and smooth transitions.
          </p>
          <div className="flex justify-end gap-3 mt-6">
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button variant="primary" onClick={() => setIsModalOpen(false)}>Confirm</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
