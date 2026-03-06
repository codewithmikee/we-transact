"use client";

import * as React from "react";
import { 
  CreditCard, 
  UserPlus, 
  Zap, 
} from "lucide-react";
import { motion } from "motion/react";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { 
  Table, 
  TableHeader, 
  TableBody, 
  TableHead, 
  TableRow, 
  TableCell 
} from "@/components/ui/Table";
import { Skeleton } from "@/components/ui/Skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { Spinner } from "@/components/ui/Spinner";

// Extracted Layout & Page Components
import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";
import { Footer } from "@/components/layout/Footer";
import { ThemePalette } from "@/components/demo/ThemePalette";
import { FormElements } from "@/components/demo/FormElements";
import { FeatureCard } from "@/components/cards/FeatureCard";
import { ListCard } from "@/components/cards/ListCard";
import { ProductCard } from "@/components/cards/ProductCard";
import { ProfileCard } from "@/components/cards/ProfileCard";

export default function Home() {
  const [activeTab, setActiveTab] = React.useState("account");

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 overflow-x-hidden">
      <Navbar />

      <div className="max-w-screen-2xl mx-auto flex flex-1 w-full min-w-0">
        <Sidebar />

        {/* Main Content */}
        <main className="flex-1 p-4 md:p-6 lg:p-10 space-y-12 md:space-y-16 max-w-5xl mx-auto min-w-0 w-full">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Typography Section */}
            <section id="typography" className="scroll-mt-24">
              <header className="mb-8 border-b border-slate-200 pb-4">
                <h1 className="text-3xl font-bold text-slate-900">Typography</h1>
                <p className="text-slate-500 mt-1">Standardized text styles for consistent visual hierarchy.</p>
              </header>
              
              <ThemePalette />

              <Card>
                <CardContent className="p-4 sm:p-6 md:p-8 space-y-6">
                  <div>
                    <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest">Page Header</span>
                    <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight mt-1">Main Page Heading (h1)</h1>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest">Card Title</span>
                    <h3 className="text-xl font-semibold text-slate-800 mt-1">Featured Component Title</h3>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest">Description Text</span>
                    <p className="text-base text-slate-600 leading-relaxed mt-1">
                      This is a standard description paragraph used for longer blocks of text. It uses a line-height that ensures readability across all device sizes.
                    </p>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest">Caption</span>
                    <p className="text-sm text-slate-400 italic mt-1">Last updated 2 hours ago by System</p>
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* Buttons Section */}
            <section id="buttons" className="mt-16 scroll-mt-24">
              <header className="mb-8 border-b border-slate-200 pb-4">
                <h2 className="text-2xl font-bold text-slate-900">Buttons</h2>
                <p className="text-slate-500 mt-1">Interactive elements for actions and triggers.</p>
              </header>
              
              <Card>
                <CardContent className="p-4 sm:p-6 md:p-8 grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
                  <div className="space-y-4">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">VARIANTS</h4>
                    <div className="flex flex-wrap gap-4">
                      <Button variant="primary">Primary</Button>
                      <Button variant="outline">Secondary</Button>
                      <Button variant="ghost">Link Action</Button>
                      <Button variant="danger">Danger</Button>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">STATES</h4>
                    <div className="flex flex-wrap gap-4 items-center">
                      <Button disabled>Disabled</Button>
                      <Button isLoading>Loading</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* Forms Section */}
            <section id="forms" className="mt-16 scroll-mt-24">
              <header className="mb-8 border-b border-slate-200 pb-4">
                <h2 className="text-2xl font-bold text-slate-900">Forms</h2>
                <p className="text-slate-500 mt-1">Input components for data collection.</p>
              </header>
              
              <Card>
                <CardContent className="p-4 sm:p-6 md:p-8 grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
                  <div className="space-y-6">
                    <Input label="Email Address" placeholder="you@example.com" type="email" />
                    <Input label="Password" type="password" defaultValue="secret" />
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-slate-700">Custom Select</label>
                      <select className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                        <option>Select an option...</option>
                        <option>Option 1</option>
                        <option>Option 2</option>
                      </select>
                    </div>
                  </div>
                  
                  <FormElements />
                </CardContent>
              </Card>
            </section>

            {/* Navigation Section */}
            <section id="navigation" className="mt-16 scroll-mt-24">
              <header className="mb-8 border-b border-slate-200 pb-4">
                <h2 className="text-2xl font-bold text-slate-900">Navigation</h2>
                <p className="text-slate-500 mt-1">Components for wayfinding and structure.</p>
              </header>
              
              <Card>
                <CardContent className="p-4 sm:p-6 md:p-8 space-y-8 md:space-y-12">
                  <div>
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Breadcrumbs</h4>
                    <Breadcrumbs 
                      items={[
                        { label: "Dashboard", href: "#" },
                        { label: "Settings", href: "#" },
                        { label: "Security", isCurrent: true },
                      ]} 
                    />
                  </div>

                  <div>
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Tabs</h4>
                    <Tabs 
                      selectedIndex={["account", "preferences", "notifications"].indexOf(activeTab)} 
                      onChange={(index) => setActiveTab(["account", "preferences", "notifications"][index])}
                    >
                      <TabsList>
                        <TabsTrigger>Account</TabsTrigger>
                        <TabsTrigger>Preferences</TabsTrigger>
                        <TabsTrigger>Notifications</TabsTrigger>
                      </TabsList>
                    </Tabs>
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* Data Display Section */}
            <section id="data-display" className="mt-16 scroll-mt-24">
              <header className="mb-8 border-b border-slate-200 pb-4">
                <h2 className="text-2xl font-bold text-slate-900">Data Display</h2>
                <p className="text-slate-500 mt-1">Components for presenting structured data sets.</p>
              </header>
              
              <Card className="overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Email</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell className="font-medium">Jane Cooper</TableCell>
                      <TableCell><Badge variant="success">Active</Badge></TableCell>
                      <TableCell className="text-slate-500">Lead Developer</TableCell>
                      <TableCell className="text-slate-500">jane.cooper@example.com</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Cody Fisher</TableCell>
                      <TableCell><Badge variant="secondary">Inactive</Badge></TableCell>
                      <TableCell className="text-slate-500">Product Designer</TableCell>
                      <TableCell className="text-slate-500">cody.fisher@example.com</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </Card>
            </section>

            {/* Loaders Section */}
            <section id="loaders" className="mt-16 scroll-mt-24">
              <header className="mb-8 border-b border-slate-200 pb-4">
                <h2 className="text-2xl font-bold text-slate-900">Loaders & Skeletons</h2>
                <p className="text-slate-500 mt-1">Visual feedback for asynchronous operations.</p>
              </header>
              
              <Card>
                <CardContent className="p-4 sm:p-6 md:p-8 grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
                  <div className="space-y-4">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Card Skeleton</h4>
                    <div className="p-4 border border-slate-100 rounded-lg space-y-3">
                      <Skeleton className="h-6 w-1/3" />
                      <div className="space-y-2">
                        <Skeleton className="h-3 w-full" />
                        <Skeleton className="h-3 w-5/6" />
                      </div>
                      <Skeleton className="h-8 w-24 mt-4" />
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-center justify-center gap-6">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 self-start">Spinners</h4>
                    <div className="flex gap-8">
                      <Spinner variant="indigo" size="md" />
                      <Spinner variant="slate" size="lg" />
                    </div>
                    <p className="text-xs text-slate-400">Loading your content...</p>
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* Application UI Section */}
            <section id="cards" className="mt-16 scroll-mt-24">
              <header className="mb-8 border-b border-slate-200 pb-4">
                <h2 className="text-2xl font-bold text-slate-900">Application UI</h2>
                <p className="text-slate-500 mt-1">Composite components for display and layout.</p>
              </header>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <FeatureCard 
                  title="Performance Monitor"
                  description="Analyze real-time data flow and system bottlenecks with automated alerting."
                  status="Active"
                  icon={<Zap className="w-6 h-6" />}
                />

                <ListCard 
                  title="Recent Transactions"
                  items={[
                    { title: "Stripe Payment", sub: "Invoice #22401", amount: "+$240.00", icon: CreditCard, color: "text-blue-600", bg: "bg-blue-100" },
                    { title: "New Subscription", sub: "Basic Plan", amount: "+$49.00", icon: UserPlus, color: "text-indigo-600", bg: "bg-indigo-100" }
                  ]}
                />

                <ProductCard 
                  title="Nexus Pro Monitor"
                  description="4K Ultra HD resolution with true-to-life color accuracy for professionals."
                  price="$599"
                  image="https://picsum.photos/seed/tech/800/450"
                />

                <ProfileCard 
                  name="Sarah Connor"
                  role="Security Specialist & Analyst"
                  initials="SC"
                  isOnline={true}
                />
              </div>
            </section>
          </motion.div>
        </main>
      </div>

      <Footer />
    </div>
  );
}
