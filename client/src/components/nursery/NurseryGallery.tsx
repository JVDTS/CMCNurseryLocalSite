import { motion } from "framer-motion";
import { fadeUp, staggerContainer, childFadeIn } from "@/lib/animations";
import { Instagram } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface NurseryGalleryProps {
  nurseryLocation: string;
}

interface GalleryImage {
  id: number;
  title: string;
  description?: string;
  filename: string;
  imageUrl: string;
  nurseryId: number;
}

export default function NurseryGallery({ nurseryLocation }: NurseryGalleryProps) {
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);

  // Fetch gallery images for this specific nursery
  const { data: galleryData, isLoading } = useQuery<{ images: GalleryImage[] }>({
    queryKey: [`/api/nurseries/${nurseryLocation}/gallery`],
    queryFn: async () => {
      const response = await fetch(`/api/nurseries/${nurseryLocation}/gallery`);
      if (!response.ok) {
        throw new Error('Failed to fetch gallery');
      }
      return response.json();
    }
  });

  const images = galleryData?.images || [];

  if (isLoading) {
    return (
      <section className="py-16 px-4 md:px-10 lg:px-20 bg-gray-50">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4 text-primary">Gallery</h2>
          <div className="w-20 h-1 bg-primary mx-auto mb-6"></div>
          <p>Loading gallery...</p>
        </div>
      </section>
    );
  }

  if (images.length === 0) {
    return (
      <section className="py-16 px-4 md:px-10 lg:px-20 bg-gray-50">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4 text-primary">Gallery</h2>
          <div className="w-20 h-1 bg-primary mx-auto mb-6"></div>
          <a href="https://www.instagram.com/cmcnursery/?hl=en-gb" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 mb-6 hover:text-primary transition-colors">
            <Instagram className="text-primary w-5 h-5" />
            <p className="text-gray-700">Follow us on Instagram for more updates</p>
          </a>
          <p className="text-gray-600">No images available yet. Check back soon for new photos!</p>
        </div>
      </section>
    );
  }
  return (
    <section className="py-16 px-4 md:px-10 lg:px-20 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <motion.div 
          className="text-center mb-12"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeUp}
        >
          <h2 className="text-3xl font-bold mb-4 text-primary">Gallery</h2>
          <div className="w-20 h-1 bg-primary mx-auto mb-6"></div>
          <a href="https://www.instagram.com/cmcnursery/?hl=en-gb" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 mb-6 hover:text-primary transition-colors">
            <Instagram className="text-primary w-5 h-5" />
            <p className="text-gray-700">Follow us on Instagram for more updates</p>
          </a>
        </motion.div>

        <motion.div 
          className="grid grid-cols-2 md:grid-cols-3 gap-4"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          {images.map((image, index) => (
            <motion.div
              key={image.id}
              className="relative overflow-hidden rounded-xl aspect-square group cursor-pointer"
              variants={childFadeIn}
              custom={index}
              onClick={() => setSelectedImage(image)}
            >
              <img
                src={image.imageUrl}
                alt={image.title || `Gallery image ${index + 1}`}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                <button
                  onClick={(event) => {
                    event.stopPropagation();
                    setSelectedImage(image);
                  }}
                  className="bg-white text-primary px-4 py-2 rounded-full font-medium transform -translate-y-4 group-hover:translate-y-0 transition-transform duration-300"
                >
                  View Larger
                </button>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>

      <Dialog open={!!selectedImage} onOpenChange={(open) => !open && setSelectedImage(null)}>
        <DialogContent className="max-w-4xl">
          {selectedImage && (
            <>
              <DialogHeader>
                <DialogTitle className="text-xl font-heading">{selectedImage.title || "Gallery Image"}</DialogTitle>
                {selectedImage.description && (
                  <DialogDescription className="text-sm md:text-base mt-2">
                    {selectedImage.description}
                  </DialogDescription>
                )}
              </DialogHeader>

              <div className="mt-2 h-full w-full max-h-[70vh] overflow-hidden rounded-md bg-muted">
                <img
                  src={selectedImage.imageUrl}
                  alt={selectedImage.title || "Gallery image"}
                  className="w-full h-full object-contain"
                />
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
}