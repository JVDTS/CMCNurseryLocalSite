import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { format } from 'date-fns';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from '@/components/ui/textarea';

import {
  Image as ImageIcon,
  Plus,
  Trash2,
  FileEdit,
  Eye,
  Download,
  MoreHorizontal,
  Loader2,
  Search,
  AlertCircle,
  Calendar,
  X,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

// Gallery image type definition
interface GalleryImage {
  id: number;
  title: string;
  description: string;
  filename: string;
  nurseryId: number;
  nurseryName: string;
  categoryId?: number;
  categoryName?: string;
  createdAt: string;
  updatedAt: string;
}

// Form schema for gallery image
const galleryImageFormSchema = z.object({
  title: z.string().min(3, { message: "Title must be at least 3 characters" }),
  description: z.string().min(5, { message: "Description must be at least 5 characters" }),
  nurseryId: z.string().min(1, { message: "Please select a nursery" }),
  categoryId: z.string().optional(),
});

type GalleryImageFormValues = z.infer<typeof galleryImageFormSchema>;

export default function ManageGallery() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedNursery, setSelectedNursery] = useState<string>('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);
  const [fileToUpload, setFileToUpload] = useState<File | null>(null);
  const [filesToUpload, setFilesToUpload] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});
  const [isBulkUpload, setIsBulkUpload] = useState(false);
  
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch gallery images - filtered by user's assigned nurseries
  const { data: galleryImagesData, isLoading, error } = useQuery<{images: GalleryImage[]}>({
    queryKey: ['/api/admin/gallery/assigned'],
    queryFn: async () => {
      // First get user's assigned nurseries
      const nurseriesResponse = await fetch('/api/admin/me/nurseries');
      if (!nurseriesResponse.ok) throw new Error('Failed to fetch nurseries');
      const assignedNurseries = await nurseriesResponse.json();
      
      // Then get all gallery images
      const galleryResponse = await fetch('/api/gallery');
      if (!galleryResponse.ok) throw new Error('Failed to fetch gallery');
      const allImages = await galleryResponse.json();
      
      // Filter images to only show those from assigned nurseries
      const assignedNurseryIds = assignedNurseries.map((n: any) => n.id);
      const filteredImages = allImages.filter((image: any) => 
        assignedNurseryIds.includes(image.nurseryId)
      );
      
      return { images: filteredImages };
    }
  });

  const galleryImages = galleryImagesData?.images || [];

  // Add gallery image mutation (single file)
  const addGalleryImageMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const response = await fetch('/api/gallery', {
        method: 'POST',
        body: data,
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to add image');
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Image added successfully',
        variant: 'default',
      });
      setIsAddDialogOpen(false);
      setFileToUpload(null);
      addForm.reset();
      queryClient.invalidateQueries({ queryKey: ['/api/admin/gallery/assigned'] });
    },
    onError: (error) => {
      toast({
        title: 'Error adding image',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Bulk upload mutation for multiple files
  const bulkUploadMutation = useMutation({
    mutationFn: async ({ files, formData }: { files: File[], formData: GalleryImageFormValues }) => {
      const results = [];
      const totalFiles = files.length;
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const data = new FormData();
        
        // Use file name as title if multiple files, or use the form title
        const title = totalFiles > 1 ? file.name.split('.')[0] : formData.title;
        
        data.append('title', title);
        data.append('description', formData.description || '');
        data.append('nurseryId', formData.nurseryId || '1');
        if (formData.categoryId && formData.categoryId !== 'none') {
          data.append('categoryId', formData.categoryId);
        }
        data.append('image', file);
        
        // Update progress
        setUploadProgress(prev => ({ ...prev, [file.name]: 0 }));
        
        try {
          const response = await fetch('/api/gallery', {
            method: 'POST',
            body: data,
          });
          
          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to upload image');
          }
          
          const result = await response.json();
          setUploadProgress(prev => ({ ...prev, [file.name]: 100 }));
          results.push({ success: true, file: file.name, result });
        } catch (error) {
          setUploadProgress(prev => ({ ...prev, [file.name]: -1 })); // -1 indicates error
          results.push({ success: false, file: file.name, error: error.message });
        }
      }
      
      return results;
    },
    onSuccess: (results) => {
      const successful = results.filter(r => r.success).length;
      const failed = results.filter(r => !r.success).length;
      
      if (successful > 0) {
        toast({
          title: `${successful} image(s) uploaded successfully`,
          description: failed > 0 ? `${failed} upload(s) failed` : undefined,
          variant: 'default',
        });
      }
      
      if (failed > 0 && successful === 0) {
        toast({
          title: 'Upload failed',
          description: `${failed} image(s) could not be uploaded`,
          variant: 'destructive',
        });
      }
      
      setIsAddDialogOpen(false);
      setFilesToUpload([]);
      setUploadProgress({});
      setIsBulkUpload(false);
      addForm.reset();
      queryClient.invalidateQueries({ queryKey: ['/api/admin/gallery/assigned'] });
    },
    onError: (error) => {
      toast({
        title: 'Bulk upload failed',
        description: error.message,
        variant: 'destructive',
      });
      setUploadProgress({});
    },
  });

  // Delete gallery image mutation
  const deleteGalleryImageMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/gallery/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete image');
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Image deleted successfully',
        variant: 'default',
      });
      setIsDeleteDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ['/api/admin/gallery/assigned'] });
    },
    onError: (error) => {
      toast({
        title: 'Error deleting image',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Add gallery image form
  const addForm = useForm<GalleryImageFormValues>({
    resolver: zodResolver(galleryImageFormSchema),
    defaultValues: {
      title: '',
      description: '',
      nurseryId: '',
      categoryId: '',
    },
  });

  // Handle add gallery image submission
  const onAddSubmit = (values: GalleryImageFormValues) => {
    // Check if it's bulk upload or single upload
    if (isBulkUpload && filesToUpload.length > 0) {
      if (filesToUpload.length > 8) {
        toast({
          title: 'Too many files',
          description: 'Please select up to 8 images only',
          variant: 'destructive',
        });
        return;
      }
      
      // Bulk upload
      bulkUploadMutation.mutate({ files: filesToUpload, formData: values });
      return;
    }
    
    // Single upload
    if (!fileToUpload) {
      toast({
        title: 'Please upload an image',
        variant: 'destructive',
      });
      return;
    }

    const formData = new FormData();
    formData.append('title', values.title);
    formData.append('description', values.description || '');
    formData.append('nurseryId', values.nurseryId || '1');
    if (values.categoryId && values.categoryId !== 'none') {
      formData.append('categoryId', values.categoryId);
    }
    formData.append('filename', fileToUpload.name);
    formData.append('image', fileToUpload);

    addGalleryImageMutation.mutate(formData);
  };

  // Handle file selection
  const handleFileSelect = (files: FileList) => {
    const selectedFiles = Array.from(files);
    
    // Validate file types
    const validFiles = selectedFiles.filter(file => {
      const isValidType = file.type.startsWith('image/');
      const isValidSize = file.size <= 10 * 1024 * 1024; // 10MB limit
      
      if (!isValidType) {
        toast({
          title: 'Invalid file type',
          description: `${file.name} is not an image file`,
          variant: 'destructive',
        });
        return false;
      }
      
      if (!isValidSize) {
        toast({
          title: 'File too large',
          description: `${file.name} is larger than 10MB`,
          variant: 'destructive',
        });
        return false;
      }
      
      return true;
    });

    if (validFiles.length > 8) {
      toast({
        title: 'Too many files',
        description: 'Please select up to 8 images only',
        variant: 'destructive',
      });
      return;
    }

    if (validFiles.length > 1) {
      setIsBulkUpload(true);
      setFilesToUpload(validFiles);
      setFileToUpload(null);
    } else if (validFiles.length === 1) {
      setIsBulkUpload(false);
      setFileToUpload(validFiles[0]);
      setFilesToUpload([]);
    }
  };

  // Remove individual file from bulk upload
  const removeFile = (index: number) => {
    const newFiles = filesToUpload.filter((_, i) => i !== index);
    setFilesToUpload(newFiles);
    
    if (newFiles.length === 0) {
      setIsBulkUpload(false);
    } else if (newFiles.length === 1) {
      setIsBulkUpload(false);
      setFileToUpload(newFiles[0]);
      setFilesToUpload([]);
    }
  };

  // Handle delete gallery image
  const handleDelete = () => {
    if (!selectedImage) return;
    deleteGalleryImageMutation.mutate(selectedImage.id);
  };

  // Filter gallery images based on search and nursery selection
  const filteredImages = galleryImages.filter((image) => {
    const matchesSearch = searchQuery === '' || 
      image.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      image.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesNursery = selectedNursery === 'all' || selectedNursery === 'none' || !selectedNursery || image.nurseryId.toString() === selectedNursery;
    return matchesSearch && matchesNursery;
  });

  // Fetch nurseries for dropdown - only assigned nurseries for non-super admins
  const { data: nurseries = [] } = useQuery<{id: number, name: string, location: string}[]>({
    queryKey: ['/api/admin/me/nurseries'],
  });

  // Fetch gallery categories for dropdown
  const { data: categories = [] } = useQuery<{id: number, name: string}[]>({
    queryKey: ['/api/gallery/categories'],
  });

  // Format date for display
  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'MMM d, yyyy');
  };

  // Handle file change
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileSelect(e.target.files);
    }
  };

  // Handle viewing image
  const handleViewImage = (image: GalleryImage) => {
    setSelectedImage(image);
    setIsViewDialogOpen(true);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Page header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold tracking-tight">Manage Gallery</h1>
        <p className="text-gray-500">
          Add and remove images for the nursery gallery.
        </p>
      </div>

      {/* Filters and actions */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex w-full max-w-sm items-center space-x-2">
          <Input
            placeholder="Search images..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-9"
          />
          <Button variant="outline" type="submit" className="h-9 px-3 flex-shrink-0">
            <Search className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="flex items-center gap-2 w-full sm:w-auto">
{nurseries.length > 1 ? (
            <Select value={selectedNursery} onValueChange={setSelectedNursery}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Assigned" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Assigned</SelectItem>
                {nurseries.map((nursery) => (
                  <SelectItem key={nursery.id} value={nursery.id.toString()}>
                    {nursery.location}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-sm">
                {nurseries.length > 0 ? nurseries[0].location : 'Your Nursery'}
              </Badge>
            </div>
          )}
          
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="ml-auto flex items-center">
                <Plus className="h-4 w-4 mr-2" />
                <span>Add Image</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[550px]">
              <DialogHeader>
                <DialogTitle>Add Gallery Images</DialogTitle>
                <DialogDescription>
                  Upload one or multiple images to the gallery (up to 8 at once).
                </DialogDescription>
              </DialogHeader>
              
              <Form {...addForm}>
                <form onSubmit={addForm.handleSubmit(onAddSubmit)} className="space-y-4">
                  <FormField
                    control={addForm.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Title</FormLabel>
                        <FormControl>
                          <Input placeholder="Children's Art Activity" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={addForm.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="A brief description of this image..." 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={addForm.control}
                      name="nurseryId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nursery</FormLabel>
                          <Select
                            value={field.value}
                            onValueChange={field.onChange}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select nursery" />
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
                      control={addForm.control}
                      name="categoryId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Category (Optional)</FormLabel>
                          <Select
                            value={field.value}
                            onValueChange={field.onChange}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select category" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="none">None</SelectItem>
                              {categories.map((category) => (
                                <SelectItem key={category.id} value={category.id.toString()}>
                                  {category.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormItem>
                    <FormLabel>Image(s)</FormLabel>
                    <FormControl>
                      <Input 
                        type="file" 
                        accept="image/*" 
                        multiple
                        onChange={handleFileChange}
                      />
                    </FormControl>
                    <FormDescription>
                      Upload 1-8 images (JPEG, PNG or GIF, max 10MB each)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                  
                  {/* Single file preview */}
                  {fileToUpload && !isBulkUpload && (
                    <div className="relative border rounded-md p-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute top-2 right-2 h-6 w-6 rounded-full bg-background/80"
                        onClick={() => setFileToUpload(null)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                      <p className="text-sm font-medium">Selected image:</p>
                      <p className="text-xs text-muted-foreground mb-2">{fileToUpload.name}</p>
                      <div className="relative aspect-video w-full overflow-hidden rounded-md">
                        <img
                          src={URL.createObjectURL(fileToUpload)}
                          alt="Preview"
                          className="h-full w-full object-cover"
                        />
                      </div>
                    </div>
                  )}

                  {/* Bulk upload preview */}
                  {isBulkUpload && filesToUpload.length > 0 && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium">
                          Selected images ({filesToUpload.length}/8):
                        </p>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setFilesToUpload([]);
                            setIsBulkUpload(false);
                          }}
                        >
                          Clear All
                        </Button>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2">
                        {filesToUpload.map((file, index) => (
                          <div key={index} className="relative border rounded-md p-2">
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="absolute top-1 right-1 h-5 w-5 rounded-full bg-background/80"
                              onClick={() => removeFile(index)}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                            <p className="text-xs text-muted-foreground mb-1 pr-6 truncate">
                              {file.name}
                            </p>
                            <div className="relative aspect-video w-full overflow-hidden rounded-md">
                              <img
                                src={URL.createObjectURL(file)}
                                alt={`Preview ${index + 1}`}
                                className="h-full w-full object-cover"
                              />
                            </div>
                            
                            {/* Upload progress for bulk upload */}
                            {uploadProgress[file.name] !== undefined && (
                              <div className="mt-1">
                                {uploadProgress[file.name] === -1 ? (
                                  <div className="text-xs text-destructive flex items-center">
                                    <AlertCircle className="h-3 w-3 mr-1" />
                                    Failed
                                  </div>
                                ) : uploadProgress[file.name] === 100 ? (
                                  <div className="text-xs text-green-600 flex items-center">
                                    <div className="h-3 w-3 mr-1 rounded-full bg-green-600" />
                                    Complete
                                  </div>
                                ) : (
                                  <div className="space-y-1">
                                    <div className="text-xs text-muted-foreground">
                                      Uploading...
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-1">
                                      <div 
                                        className="bg-primary h-1 rounded-full transition-all duration-300" 
                                        style={{ width: `${uploadProgress[file.name]}%` }}
                                      />
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                      
                      {isBulkUpload && (
                        <div className="text-xs text-muted-foreground">
                          Note: For bulk uploads, titles will be generated from filenames. 
                          You can edit individual titles after upload.
                        </div>
                      )}
                    </div>
                  )}
                  
                  <DialogFooter>
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => {
                        setIsAddDialogOpen(false);
                        setFileToUpload(null);
                        setFilesToUpload([]);
                        setIsBulkUpload(false);
                        setUploadProgress({});
                        addForm.reset();
                      }}
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit"
                      disabled={
                        addGalleryImageMutation.isPending || 
                        bulkUploadMutation.isPending ||
                        (!fileToUpload && filesToUpload.length === 0)
                      }
                    >
                      {(addGalleryImageMutation.isPending || bulkUploadMutation.isPending) && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      {isBulkUpload && filesToUpload.length > 1 
                        ? `Upload ${filesToUpload.length} Images` 
                        : 'Add Image'
                      }
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      
      {/* Gallery grid */}
      <Card>
        <CardContent className="p-6">
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2">Loading gallery...</span>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center h-64 text-destructive">
              <AlertCircle className="h-10 w-10 mb-2" />
              <p>Error loading gallery images</p>
            </div>
          ) : filteredImages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
              <ImageIcon className="h-10 w-10 mb-2 opacity-20" />
              <p>No gallery images found</p>
              <Button 
                variant="outline" 
                size="sm" 
                className="mt-4"
                onClick={() => setIsAddDialogOpen(true)}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add First Image
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredImages.map((image: GalleryImage) => (
                <div key={image.id} className="group relative overflow-hidden rounded-md border bg-background">
                  <div className="relative aspect-video w-full">
                    <img
                      src={`/uploads/${image.filename}`}
                      alt={image.title}
                      className="h-full w-full object-cover transition-all group-hover:scale-105"
                    />
                  </div>
                  
                  <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/60 to-transparent p-4 opacity-100 transition-opacity group-hover:opacity-100">
                    <h3 className="text-sm font-medium text-white">{image.title}</h3>
                    <p className="line-clamp-1 text-xs text-white/80">
                      {image.description}
                    </p>
                    <div className="mt-2 flex items-center gap-2">
                      <Badge 
                        variant="outline" 
                        className="bg-white/10 text-white border-white/20 text-xs"
                      >
                        {image.nurseryName}
                      </Badge>
                      {image.categoryName && (
                        <Badge 
                          variant="outline" 
                          className="bg-white/10 text-white border-white/20 text-xs"
                        >
                          {image.categoryName}
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  <div className="absolute top-2 right-2 opacity-0 transition-opacity group-hover:opacity-100">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="secondary" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleViewImage(image)}>
                          <Eye className="mr-2 h-4 w-4" />
                          View
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <a 
                            href={`/uploads/${image.filename}`} 
                            download
                          >
                            <Download className="mr-2 h-4 w-4" />
                            Download
                          </a>
                        </DropdownMenuItem>
                        {user?.role === 'super_admin' && (
                          <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              className="text-destructive focus:text-destructive"
                              onClick={() => {
                                setSelectedImage(image);
                                setIsDeleteDialogOpen(true);
                              }}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
        {filteredImages.length > 0 && (
          <CardFooter className="flex items-center justify-between border-t px-6 py-4">
            <div className="text-sm text-gray-500">
              Showing <span className="font-medium">{filteredImages.length}</span> of{" "}
              <span className="font-medium">{galleryImages.length}</span> images
            </div>
          </CardFooter>
        )}
      </Card>
      
      {/* View image dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>
              {selectedImage?.title}
            </DialogTitle>
            <DialogDescription>
              {selectedImage?.description}
            </DialogDescription>
          </DialogHeader>
          
          {selectedImage && (
            <div className="space-y-4">
              <div className="overflow-hidden rounded-md border">
                <img
                  src={`/uploads/${selectedImage.filename}`}
                  alt={selectedImage.title}
                  className="w-full object-contain max-h-[500px]"
                />
              </div>
              
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline">
                  {selectedImage.nurseryName}
                </Badge>
                {selectedImage.categoryName && (
                  <Badge variant="outline">
                    {selectedImage.categoryName}
                  </Badge>
                )}
                <Badge variant="outline" className="ml-auto">
                  <Calendar className="h-3 w-3 mr-1" />
                  {formatDate(selectedImage.createdAt)}
                </Badge>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsViewDialogOpen(false)}
            >
              Close
            </Button>
            {selectedImage && (
              <Button asChild>
                <a 
                  href={`/uploads/${selectedImage.filename}`} 
                  download
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download
                </a>
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Delete confirmation dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-destructive flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Confirm Deletion
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this image? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          {selectedImage && (
            <div className="space-y-2">
              <div className="relative aspect-video w-full overflow-hidden rounded-md border">
                <img
                  src={`/uploads/${selectedImage.filename}`}
                  alt={selectedImage.title}
                  className="h-full w-full object-cover"
                />
              </div>
              <p className="font-medium">{selectedImage.title}</p>
              <p className="text-sm text-muted-foreground">
                {selectedImage.nurseryName}
              </p>
            </div>
          )}
          
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteGalleryImageMutation.isPending}
            >
              {deleteGalleryImageMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Delete Image
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}