import React, { useEffect, useState } from "react";


interface GalleryImage {
  id: number;
  title: string;
  filename: string;
  approvalStatus: string;
  nurseryId: number;
  imageUrl: string;
}

const getNurseryNameById = (id: number): string => {
  switch(id) {
    case 1: return 'Hayes';
    case 2: return 'Uxbridge';
    case 3: return 'Hounslow';
    default: return 'Unknown Nursery';
  }
};

const AdminImageApprovalSection: React.FC = () => {
  const [pendingImages, setPendingImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchPendingImages();
  }, []);

  const fetchPendingImages = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/gallery?approvalStatus=pending", {
        credentials: "include"
      });
      const images = await res.json();
      setPendingImages(images.filter((img: GalleryImage) => img.approvalStatus === "pending"));
    } catch (err) {
      setError("Failed to load pending images.");
    } finally {
      setLoading(false);
    }
  };


  const approveImage = async (id: number) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/gallery/${id}/approve`, {
        method: "POST",
        credentials: "include"
      });
      if (res.ok) {
        fetchPendingImages();
      } else {
        setError("Failed to approve image.");
      }
    } catch (err) {
      setError("Failed to approve image.");
    } finally {
      setLoading(false);
    }
  };

  // Decline logic (no reason)
  const declineImage = async (id: number) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/gallery/${id}/decline`, {
        method: "POST",
        credentials: "include"
      });
      if (res.ok) {
        fetchPendingImages();
      } else {
        setError('Failed to decline image.');
      }
    } catch (err) {
      setError('Failed to decline image.');
    } finally {
      setLoading(false);
    }
  };


  // Group images by nurseryId
  const imagesByNursery: { [nurseryId: number]: GalleryImage[] } = {};
  pendingImages.forEach(img => {
    if (!imagesByNursery[img.nurseryId]) imagesByNursery[img.nurseryId] = [];
    imagesByNursery[img.nurseryId].push(img);
  });

  return (
    <div className="admin-image-approval-section">
      <h2 className="text-lg font-semibold mb-4">Pending Image Upload Requests</h2>
      {loading && <p>Loading...</p>}
      {error && <p className="text-red-500">{error}</p>}
      {Object.keys(imagesByNursery).length === 0 && !loading && (
        <p>No pending image requests.</p>
      )}
      <div className="space-y-8">
        {Object.entries(imagesByNursery).map(([nurseryId, images]) => (
          <div key={nurseryId} className="border rounded-lg p-4 bg-gray-50">
            <h3 className="text-md font-bold mb-3 flex items-center gap-2">
              <span className="inline-block bg-primary/10 p-1 rounded-full">
                <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-users"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
              </span>
              {getNurseryNameById(Number(nurseryId))}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {images.map(img => (
                <div key={img.id} className="rounded-lg bg-white shadow p-4 flex flex-col items-center border hover:shadow-lg transition-shadow">
                  <img src={img.imageUrl} alt={img.title} className="w-40 h-40 object-cover rounded mb-3 border" />
                  <div className="w-full flex flex-col items-center mb-2">
                    <span className="font-medium text-base mb-1">{img.title}</span>
                    <span className="text-xs text-gray-500 mb-1">Filename: {img.filename}</span>
                    <span className="text-xs text-gray-500 mb-1">Status: <span className="capitalize font-semibold text-yellow-600">{img.approvalStatus}</span></span>
                  </div>
                  <div className="flex gap-2 w-full mt-2">
                    <button
                      className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded transition-colors w-full font-semibold"
                      onClick={() => approveImage(img.id)}
                      disabled={loading}
                    >
                      Approve
                    </button>
                    <button
                      className="bg-red-500 hover:bg-red-600 text-white px-5 py-2 rounded transition-colors w-full font-semibold"
                      onClick={() => declineImage(img.id)}
                      disabled={loading}
                    >
                      Decline
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminImageApprovalSection;
