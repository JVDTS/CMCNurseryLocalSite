import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star, Quote } from 'lucide-react';
import { Review } from '@shared/schema';

interface ReviewsSectionProps {
  nurseryId?: number;
  showFeaturedOnly?: boolean;
  maxReviews?: number;
}

export function ReviewsSection({ nurseryId, showFeaturedOnly = false, maxReviews = 6 }: ReviewsSectionProps) {
  const queryKey = showFeaturedOnly && nurseryId
    ? [`/api/reviews/featured/${nurseryId}`]
    : ['/api/reviews', nurseryId ? { nurseryId: nurseryId.toString() } : undefined].filter(Boolean);

  const { data: reviews = [], isLoading } = useQuery<Review[]>({
    queryKey,
  });

  const displayReviews = maxReviews ? reviews.slice(0, maxReviews) : reviews;

  const StarRating = ({ rating }: { rating: number }) => (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`w-4 h-4 ${
            star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
          }`}
        />
      ))}
    </div>
  );

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="h-3 bg-gray-200 rounded"></div>
                <div className="h-3 bg-gray-200 rounded"></div>
                <div className="h-3 bg-gray-200 rounded w-3/4"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (displayReviews.length === 0) {
    return (
      <Card className="text-center py-8">
        <CardContent>
          <Quote className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No reviews yet. Be the first to share your experience!</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {displayReviews.map((review) => (
        <Card key={review.id} className="relative">
          {review.isFeatured && (
            <Badge className="absolute -top-2 -right-2 bg-yellow-500 hover:bg-yellow-600">
              Featured
            </Badge>
          )}
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold">
                {review.reviewerName}
              </CardTitle>
              <StarRating rating={review.rating} />
            </div>
            <p className="text-sm text-gray-500">
              {new Date(review.createdAt).toLocaleDateString('en-GB', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
              })}
            </p>
          </CardHeader>
          <CardContent>
            <Quote className="w-6 h-6 text-gray-300 mb-2" />
            <p className="text-gray-700 leading-relaxed">
              {review.reviewText}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

interface ReviewStatsProps {
  reviews: Review[];
}

export function ReviewStats({ reviews }: ReviewStatsProps) {
  if (reviews.length === 0) return null;

  const averageRating = reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;
  const ratingCounts = [5, 4, 3, 2, 1].map(rating => 
    reviews.filter(review => review.rating === rating).length
  );

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle className="flex items-center gap-3">
          Parent Reviews
          <Badge variant="secondary">{reviews.length} reviews</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4 mb-4">
          <div className="text-4xl font-bold">{averageRating.toFixed(1)}</div>
          <div>
            <div className="flex items-center gap-1 mb-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-5 h-5 ${
                    star <= Math.round(averageRating) 
                      ? 'fill-yellow-400 text-yellow-400' 
                      : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            <p className="text-sm text-gray-600">Based on {reviews.length} reviews</p>
          </div>
        </div>
        
        <div className="space-y-2">
          {ratingCounts.map((count, index) => {
            const rating = 5 - index;
            const percentage = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
            
            return (
              <div key={rating} className="flex items-center gap-3 text-sm">
                <span className="w-8">{rating}★</span>
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-yellow-400 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <span className="w-8 text-gray-600">{count}</span>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}