import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Star } from 'lucide-react';
import { insertReviewSchema } from '@shared/schema';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { z } from 'zod';

type ReviewFormData = z.infer<typeof insertReviewSchema>;

export function ReviewForm() {
  const [showForm, setShowForm] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<ReviewFormData>({
    resolver: zodResolver(insertReviewSchema),
    defaultValues: {
      reviewerName: '',
      reviewerEmail: '',
      reviewText: '',
      rating: 5,
      nurseryId: 1,
      isApproved: false,
      isFeatured: false
    },
  });

  // Fetch nurseries for the dropdown
  const { data: nurseries } = useQuery({
    queryKey: ['/api/nurseries'],
  });

  const submitReviewMutation = useMutation({
    mutationFn: (data: ReviewFormData) => apiRequest('/api/reviews', 'POST', data),
    onSuccess: () => {
      toast({
        title: 'Review Submitted',
        description: 'Thank you for your review! It will be reviewed by our team before being published.',
      });
      form.reset();
      setRating(0);
      setShowForm(false);
      // Invalidate reviews cache
      queryClient.invalidateQueries({ queryKey: ['/api/reviews'] });
    },
    onError: () => {
      toast({
        title: 'Submission Failed',
        description: 'There was an error submitting your review. Please try again.',
        variant: 'destructive',
      });
    },
  });

  const onSubmit = (data: ReviewFormData) => {
    submitReviewMutation.mutate({
      ...data,
      rating: rating || 5,
    });
  };

  const StarRating = () => (
    <div className="flex items-center gap-1 mb-4">
      <span className="text-sm font-medium mr-2">Rating:</span>
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => setRating(star)}
          onMouseEnter={() => setHoveredRating(star)}
          onMouseLeave={() => setHoveredRating(0)}
          className="p-1 hover:scale-110 transition-transform"
        >
          <Star
            className={`w-6 h-6 ${
              star <= (hoveredRating || rating)
                ? 'fill-yellow-400 text-yellow-400'
                : 'text-gray-300'
            }`}
          />
        </button>
      ))}
      <span className="ml-2 text-sm text-gray-600">
        {rating ? `${rating} star${rating !== 1 ? 's' : ''}` : 'Click to rate'}
      </span>
    </div>
  );

  if (!showForm) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <CardTitle>Share Your Experience</CardTitle>
          <CardDescription>
            We'd love to hear about your experience with our nursery
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={() => setShowForm(true)}
            className="w-full"
          >
            Write a Review
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Write a Review</CardTitle>
        <CardDescription>
          Share your experience to help other parents make informed decisions
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <StarRating />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="reviewerName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Your Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="reviewerEmail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="your.email@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="nurseryId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nursery Location</FormLabel>
                  <Select onValueChange={(value) => field.onChange(parseInt(value))}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select nursery location" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {nurseries?.map((nursery: any) => (
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
              name="reviewText"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Your Review</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Tell us about your experience..."
                      className="min-h-[120px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-4">
              <Button 
                type="submit" 
                disabled={submitReviewMutation.isPending || !rating}
                className="flex-1"
              >
                {submitReviewMutation.isPending ? 'Submitting...' : 'Submit Review'}
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setShowForm(false)}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}