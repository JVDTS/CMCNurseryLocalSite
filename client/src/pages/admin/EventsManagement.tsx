import React, { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import NewDashboardLayout from '@/components/admin/NewDashboardLayout';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { useToast } from '@/hooks/use-toast';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Calendar,
  Plus,
  Search,
  Filter,
  MapPin,
  Clock,
  Users,
  User,
  Check,
  X,
  MoreHorizontal,
  Edit,
  Trash2,
  Copy,
  EyeIcon,
  ChevronDown,
  CalendarDays,
  CalendarClock,
  AlertCircle
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";

// Define event interface based on updated database schema
interface Nursery {
  id: number;
  name: string;
  location: string;
  address: string;
  phoneNumber: string;
  email: string;
  description: string;
  openingHours: Record<string, string>;
  heroImage: string | null;
  createdAt: string;
  updatedAt: string;
}

interface Event {
  id: number;
  title: string;
  description: string;
  location: string;
  date: string;
  time: string;
  duration?: string;
  startDate: string;
  endDate: string;
  allDay: boolean;
  status: 'draft' | 'published' | 'cancelled';
  capacity?: number | null;
  registrations?: number | null;
  organizer?: string;
  nurseryId: number;
  nursery: Nursery;
  createdBy: number;
  createdAt: string;
  updatedAt: string;
}

// Define event status constants
const EventStatus = {
  UPCOMING: 'upcoming',
  ACTIVE: 'active', 
  COMPLETED: 'completed',
  CANCELLED: 'cancelled'
} as const;

type EventStatusType = typeof EventStatus[keyof typeof EventStatus];

// Form schema for creating events
const eventFormSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  location: z.string().min(3, "Location is required"),
  startDate: z.date({ required_error: "Start date is required" }),
  endDate: z.date({ required_error: "End date is required" }),
  allDay: z.boolean().default(false),
  nurseryId: z.number().int().positive("Nursery must be selected"),
}).refine((data) => data.endDate >= data.startDate, {
  message: "End date must be after start date",
  path: ["endDate"],
});

type EventFormValues = z.infer<typeof eventFormSchema>;

export default function EventsManagement() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedNursery, setSelectedNursery] = useState<string | undefined>(undefined);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [viewType, setViewType] = useState<'list' | 'calendar'>('list');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Form setup
  const form = useForm<EventFormValues>({
    resolver: zodResolver(eventFormSchema),
    defaultValues: {
      title: '',
      description: '',
      location: '',
      allDay: false,
    },
  });

  // Fetch events - filtered by user's assigned nurseries
  const { data: eventsData, isLoading, error } = useQuery<{events: Event[]}>({
    queryKey: ['/api/admin/events/assigned'],
    queryFn: async () => {
      // First get user's assigned nurseries
      const nurseriesResponse = await fetch('/api/admin/me/nurseries');
      if (!nurseriesResponse.ok) throw new Error('Failed to fetch nurseries');
      const assignedNurseries = await nurseriesResponse.json();
      
      // Then get all events
      const eventsResponse = await fetch('/api/events');
      if (!eventsResponse.ok) throw new Error('Failed to fetch events');
      const allEvents = await eventsResponse.json();
      
      // Filter events to only show those from assigned nurseries
      const assignedNurseryIds = assignedNurseries.map((n: any) => n.id);
      const filteredEvents = allEvents.filter((event: any) => 
        assignedNurseryIds.includes(event.nurseryId)
      );
      
      return { events: filteredEvents };
    }
  });

  const events = eventsData?.events || [];

  // Fetch nurseries for dropdown - only assigned nurseries for non-super admins
  const { data: nurseries = [] } = useQuery<{id: number, name: string, location: string}[]>({
    queryKey: ['/api/admin/me/nurseries'],
  });

  // Add event mutation
  const addEventMutation = useMutation({
    mutationFn: async (data: EventFormValues) => {
      const response = await fetch('/api/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          createdBy: user?.id,
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create event');
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Event created successfully',
        variant: 'default',
      });
      setIsAddDialogOpen(false);
      form.reset();
      queryClient.invalidateQueries({ queryKey: ['/api/admin/events/assigned'] });
    },
    onError: (error) => {
      toast({
        title: 'Error creating event',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Delete event mutation
  const deleteEventMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/events/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete event');
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Event deleted successfully',
        variant: 'default',
      });
      setIsDeleteDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ['/api/admin/events/assigned'] });
    },
    onError: (error) => {
      toast({
        title: 'Error deleting event',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Handle form submission
  const onSubmit = (values: EventFormValues) => {
    addEventMutation.mutate(values);
  };

  // Handle delete event
  const handleDelete = () => {
    if (!selectedEvent) return;
    deleteEventMutation.mutate(selectedEvent.id);
  };

  // Get nursery name by ID
  const getNurseryName = (nurseryId: number) => {
    const nursery = nurseries.find(n => n.id === nurseryId);
    return nursery ? nursery.location : 'Unknown Nursery';
  };

  // Filter events based on search and nursery
  const filteredEvents = events.filter(event => {
    const matchesSearch = searchQuery === '' || 
      event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.description.toLowerCase().includes(searchQuery.toLowerCase());
      
    const matchesNursery = !selectedNursery || selectedNursery === 'all' || getNurseryName(event.nurseryId) === selectedNursery;
    
    return matchesSearch && matchesNursery;
  });

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  // Get status badge variant
  const getStatusVariant = (status: string) => {
    switch(status) {
      case EventStatus.UPCOMING:
        return 'default';
      case EventStatus.COMPLETED:
        return 'secondary';
      case EventStatus.CANCELLED:
        return 'destructive';
      default:
        return 'default';
    }
  };

  // Get status badge style
  const getStatusStyle = (status: EventStatus) => {
    switch(status) {
      case EventStatus.UPCOMING:
        return 'bg-green-500 hover:bg-green-600';
      case EventStatus.COMPLETED:
        return '';
      case EventStatus.CANCELLED:
        return '';
      default:
        return '';
    }
  };

  // Calculate registration percentage
  const calculateRegistrationPercentage = (registrations: number, capacity: number) => {
    return Math.round((registrations / capacity) * 100);
  };

  return (
    <ProtectedRoute>
      <NewDashboardLayout>
        <div className="flex flex-col gap-6">
          {/* Page header */}
          <div className="flex flex-col gap-2">
            <h1 className="text-2xl font-bold tracking-tight">Events Management</h1>
            <p className="text-gray-500">
              Schedule and manage events across all nurseries.
            </p>
          </div>

          {/* Filters and actions */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex w-full max-w-sm items-center space-x-2">
              <Input
                placeholder="Search events..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-9"
              />
              <Button variant="outline" type="submit" className="h-9 px-3 flex-shrink-0">
                <Search className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Tabs
                value={viewType}
                onValueChange={(v) => setViewType(v as 'list' | 'calendar')}
                className="hidden sm:block"
              >
                <TabsList>
                  <TabsTrigger value="list" className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" /> List
                  </TabsTrigger>
                  <TabsTrigger value="calendar" className="flex items-center gap-1">
                    <CalendarDays className="h-4 w-4" /> Calendar
                  </TabsTrigger>
                </TabsList>
              </Tabs>
              
              <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as EventStatus | 'all')}>
                <SelectTrigger className="w-[140px] h-9">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value={EventStatus.UPCOMING}>Upcoming</SelectItem>
                  <SelectItem value={EventStatus.COMPLETED}>Completed</SelectItem>
                  <SelectItem value={EventStatus.CANCELLED}>Cancelled</SelectItem>
                </SelectContent>
              </Select>
              
              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="ml-auto flex items-center">
                    <Plus className="h-4 w-4 mr-2" />
                    <span>New Event</span>
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[600px]">
                  <DialogHeader>
                    <DialogTitle>Create New Event</DialogTitle>
                    <DialogDescription>
                      Add a new event for your nursery.
                    </DialogDescription>
                  </DialogHeader>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                      <FormField
                        control={form.control}
                        name="title"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Event Title</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter event title" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Describe your event..."
                                className="resize-none"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="startDate"
                          render={({ field }) => (
                            <FormItem className="flex flex-col">
                              <FormLabel>Start Date</FormLabel>
                              <Popover>
                                <PopoverTrigger asChild>
                                  <FormControl>
                                    <Button
                                      variant="outline"
                                      className={cn(
                                        "w-full pl-3 text-left font-normal",
                                        !field.value && "text-muted-foreground"
                                      )}
                                    >
                                      {field.value ? (
                                        format(field.value, "PPP")
                                      ) : (
                                        <span>Pick a date</span>
                                      )}
                                      <CalendarDays className="ml-auto h-4 w-4 opacity-50" />
                                    </Button>
                                  </FormControl>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                  <CalendarComponent
                                    mode="single"
                                    selected={field.value}
                                    onSelect={field.onChange}
                                    disabled={(date) =>
                                      date < new Date() || date < new Date("1900-01-01")
                                    }
                                    initialFocus
                                  />
                                </PopoverContent>
                              </Popover>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="endDate"
                          render={({ field }) => (
                            <FormItem className="flex flex-col">
                              <FormLabel>End Date</FormLabel>
                              <Popover>
                                <PopoverTrigger asChild>
                                  <FormControl>
                                    <Button
                                      variant="outline"
                                      className={cn(
                                        "w-full pl-3 text-left font-normal",
                                        !field.value && "text-muted-foreground"
                                      )}
                                    >
                                      {field.value ? (
                                        format(field.value, "PPP")
                                      ) : (
                                        <span>Pick a date</span>
                                      )}
                                      <CalendarDays className="ml-auto h-4 w-4 opacity-50" />
                                    </Button>
                                  </FormControl>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                  <CalendarComponent
                                    mode="single"
                                    selected={field.value}
                                    onSelect={field.onChange}
                                    disabled={(date) =>
                                      date < new Date() || date < new Date("1900-01-01")
                                    }
                                    initialFocus
                                  />
                                </PopoverContent>
                              </Popover>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name="location"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Location</FormLabel>
                            <FormControl>
                              <Input placeholder="Event location" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="nurseryId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nursery</FormLabel>
                            <Select 
                              onValueChange={(value) => field.onChange(parseInt(value))} 
                              value={field.value ? field.value.toString() : undefined}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select a nursery" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {nurseries.map((nursery) => (
                                  <SelectItem key={nursery.id} value={nursery.id.toString()}>
                                    {nursery.location}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="allDay"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel>
                                All day event
                              </FormLabel>
                            </div>
                          </FormItem>
                        )}
                      />

                      <DialogFooter>
                        <Button 
                          type="button" 
                          variant="outline" 
                          onClick={() => setIsAddDialogOpen(false)}
                        >
                          Cancel
                        </Button>
                        <Button 
                          type="submit" 
                          disabled={addEventMutation.isPending}
                        >
                          {addEventMutation.isPending ? 'Creating...' : 'Create Event'}
                        </Button>
                      </DialogFooter>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* Events view - List */}
          {viewType === 'list' && (
            <Card>
              <CardHeader className="px-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <CardTitle>Events</CardTitle>
                    <CardDescription>
                      All upcoming and past events
                    </CardDescription>
                  </div>
                  <Select value={selectedNursery || 'all'} onValueChange={setSelectedNursery}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="All Nurseries" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Nurseries</SelectItem>
                      <SelectItem value="Hayes">Hayes</SelectItem>
                      <SelectItem value="Uxbridge">Uxbridge</SelectItem>
                      <SelectItem value="Hounslow">Hounslow</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Event</TableHead>
                      <TableHead>Date & Time</TableHead>
                      <TableHead>Nursery</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Registrations</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredEvents.length > 0 ? (
                      filteredEvents.map((event) => (
                        <TableRow key={event.id}>
                          <TableCell className="font-medium max-w-[200px]">
                            <div className="truncate">{event.title}</div>
                            <div className="text-xs text-gray-500 truncate">{event.description}</div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <CalendarDays className="h-4 w-4 text-gray-500" />
                              <div>
                                <div className="text-sm">{formatDate(event.date)}</div>
                                <div className="text-xs text-gray-500">{event.time} ({event.duration})</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {event.nursery.name}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge 
                              variant={getStatusVariant(event.status)} 
                              className={getStatusStyle(event.status)}
                            >
                              {event.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col gap-1">
                              <div className="text-sm">
                                {event.registrations}/{event.capacity}
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div 
                                  className="bg-primary h-2 rounded-full" 
                                  style={{ width: `${calculateRegistrationPercentage(event.registrations, event.capacity)}%` }}
                                />
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => {
                                  setSelectedEvent(event);
                                  setIsViewDialogOpen(true);
                                }}>
                                  <EyeIcon className="mr-2 h-4 w-4" />
                                  View Details
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Edit className="mr-2 h-4 w-4" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Copy className="mr-2 h-4 w-4" />
                                  Duplicate
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem 
                                  className="text-destructive focus:text-destructive"
                                  onClick={() => {
                                    setSelectedEvent(event);
                                    setIsDeleteDialogOpen(true);
                                  }}
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} className="h-24 text-center">
                          No events found.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
              <CardFooter className="flex items-center justify-between border-t px-6 py-4">
                <div className="text-sm text-gray-500">
                  Showing <span className="font-medium">{filteredEvents.length}</span> of{" "}
                  <span className="font-medium">{events.length}</span> events
                </div>
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm" disabled>
                    Previous
                  </Button>
                  <Button variant="outline" size="sm" disabled={filteredEvents.length === events.length}>
                    Next
                  </Button>
                </div>
              </CardFooter>
            </Card>
          )}

          {/* Events view - Calendar (placeholder) */}
          {viewType === 'calendar' && (
            <Card>
              <CardHeader>
                <CardTitle>Calendar View</CardTitle>
                <CardDescription>
                  View events in a monthly calendar layout
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-center border rounded-md h-[400px] bg-gray-50 p-4">
                  <div className="text-center">
                    <CalendarClock className="h-12 w-12 text-primary/40 mx-auto mb-4" />
                    <h3 className="text-lg font-medium">Calendar View Coming Soon</h3>
                    <p className="text-sm text-gray-500 max-w-md mt-2">
                      The calendar view is under development. Use the list view to manage events for now.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Event Management Tips */}
          <Card className="bg-primary/5 border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                Event Planning Tips
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <div className="flex flex-col gap-2">
                  <h3 className="font-medium">Preparation Timeline</h3>
                  <p className="text-sm text-gray-500">
                    Start planning large events at least 6-8 weeks in advance. Send invitations 3-4 weeks before the event.
                  </p>
                </div>
                <div className="flex flex-col gap-2">
                  <h3 className="font-medium">Resource Allocation</h3>
                  <p className="text-sm text-gray-500">
                    Assign specific resources and materials needed for the event well in advance to ensure everything is prepared.
                  </p>
                </div>
                <div className="flex flex-col gap-2">
                  <h3 className="font-medium">Parent Communication</h3>
                  <p className="text-sm text-gray-500">
                    Send reminders 1 week and again 1 day before the event. Include all necessary details like what to bring.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* View Event Dialog */}
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Event Details</DialogTitle>
              <DialogDescription>
                View complete information about this event.
              </DialogDescription>
            </DialogHeader>

            {selectedEvent && (
              <div className="space-y-4 mt-2">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold">{selectedEvent.title}</h2>
                  <Badge 
                    variant={getStatusVariant(selectedEvent.status)} 
                    className={getStatusStyle(selectedEvent.status)}
                  >
                    {selectedEvent.status}
                  </Badge>
                </div>

                <p className="text-gray-600">{selectedEvent.description}</p>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <h3 className="text-sm font-medium text-gray-500">Date & Time</h3>
                    <div className="flex items-center gap-2">
                      <CalendarDays className="h-4 w-4 text-primary" />
                      <span>{formatDate(selectedEvent.date)}</span>
                    </div>
                    <div className="flex items-center gap-2 pl-6">
                      <Clock className="h-4 w-4 text-primary" />
                      <span>{selectedEvent.time} ({selectedEvent.duration})</span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-sm font-medium text-gray-500">Location</h3>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-primary" />
                      <span>{selectedEvent.location}</span>
                    </div>
                    <div className="flex items-center gap-2 pl-6">
                      <div className="h-4 w-4 rounded-full bg-primary/20 flex items-center justify-center">
                        <span className="text-[10px] text-primary font-bold">N</span>
                      </div>
                      <span>{selectedEvent.nursery} Nursery</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-1">
                  <h3 className="text-sm font-medium text-gray-500">Registrations</h3>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-primary" />
                      <span>{selectedEvent.registrations} of {selectedEvent.capacity} spots filled</span>
                    </div>
                    <span className="text-sm font-medium">
                      {calculateRegistrationPercentage(selectedEvent.registrations, selectedEvent.capacity)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                    <div 
                      className="bg-primary h-2 rounded-full" 
                      style={{ width: `${calculateRegistrationPercentage(selectedEvent.registrations, selectedEvent.capacity)}%` }}
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <h3 className="text-sm font-medium text-gray-500">Organizer</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <User className="h-4 w-4 text-primary" />
                    <span>{selectedEvent.organizer}</span>
                  </div>
                </div>
              </div>
            )}

            <DialogFooter className="flex justify-between sm:justify-between">
              <Button
                type="button" 
                variant="outline" 
                onClick={() => setIsViewDialogOpen(false)}
              >
                Close
              </Button>
              <div className="space-x-2">
                <Button variant="outline">
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </Button>
                <Button>
                  <Users className="mr-2 h-4 w-4" />
                  Manage Attendees
                </Button>
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-destructive" />
                Confirm Deletion
              </DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this event? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            
            {selectedEvent && (
              <div className="border rounded-md p-3 bg-gray-50">
                <h3 className="font-medium">{selectedEvent.title}</h3>
                <p className="text-sm text-gray-500">{formatDate(selectedEvent.date)} at {selectedEvent.time}</p>
                <p className="text-sm text-gray-500">{selectedEvent.nursery} Nursery</p>
              </div>
            )}

            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                type="button" 
                variant="outline" 
                onClick={() => setIsDeleteDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button variant="destructive">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Event
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </NewDashboardLayout>
    </ProtectedRoute>
  );
}