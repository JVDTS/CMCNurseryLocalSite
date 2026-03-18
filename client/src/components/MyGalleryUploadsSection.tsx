import React, { useEffect, useState } from "react";

interface GalleryImage {
  id: number;
  title: string;
  filename: string;
  approvalStatus: string;
  nurseryId: number;
  imageUrl: string;
}

const MyGalleryUploadsSection: React.FC = () => {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchMyUploads();
  }, []);

  const fetchMyUploads = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/gallery/my-uploads", {
        credentials: "include"
      });
      const imgs = await res.json();
      setImages(imgs);
    } catch (err) {
      setError("Failed to load uploads.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="my-gallery-uploads-section">
      <h2>My Gallery Upload Requests</h2>
      {loading && <p>Loading...</p>}
      {error && <p className="text-red-500">{error}</p>}
      <ul>
        {images.map(img => (
          <li key={img.id} className="mb-4 border p-2 rounded">
            <img src={img.imageUrl} alt={img.title} className="w-32 h-32 object-cover mb-2" />
            <div><strong>{img.title}</strong></div>
            <div>Status: {img.approvalStatus}</div>
          </li>
        ))}
      </ul>
      {images.length === 0 && !loading && <p>No uploads found.</p>}
    </div>
  );
};

export default MyGalleryUploadsSection;
