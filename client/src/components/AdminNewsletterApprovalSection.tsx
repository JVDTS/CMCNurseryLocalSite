import React, { useEffect, useState } from "react";


interface Newsletter {
  id: number;
  title: string;
  description: string;
  filename: string;
  month: string;
  year: number;
  approvalStatus: string;
  nurseryId: number;
  fileUrl: string;
}

const getNurseryNameById = (id: number): string => {
  switch(id) {
    case 1: return 'Hayes';
    case 2: return 'Uxbridge';
    case 3: return 'Hounslow';
    default: return 'Unknown Nursery';
  }
};

const AdminNewsletterApprovalSection: React.FC = () => {
  const [pendingNewsletters, setPendingNewsletters] = useState<Newsletter[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchPendingNewsletters();
  }, []);

  const fetchPendingNewsletters = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/newsletters", {
        credentials: "include"
      });
      const newsletters = await res.json();
      setPendingNewsletters(newsletters.filter((n: Newsletter) => n.approvalStatus === "pending"));
    } catch (err) {
      setError("Failed to load pending newsletters.");
    } finally {
      setLoading(false);
    }
  };


  const approveNewsletter = async (id: number) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/newsletters/${id}/approve`, {
        method: "POST",
        credentials: "include"
      });
      if (res.ok) {
        fetchPendingNewsletters();
      } else {
        setError("Failed to approve newsletter.");
      }
    } catch (err) {
      setError("Failed to approve newsletter.");
    } finally {
      setLoading(false);
    }
  };

  // Decline logic
  const declineNewsletter = async (id: number) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/newsletters/${id}/decline`, {
        method: "POST",
        credentials: "include"
      });
      if (res.ok) {
        fetchPendingNewsletters();
      } else {
        setError('Failed to decline newsletter.');
      }
    } catch (err) {
      setError('Failed to decline newsletter.');
    } finally {
      setLoading(false);
    }
  };


  // Group newsletters by nurseryId
  const newslettersByNursery: { [nurseryId: number]: Newsletter[] } = {};
  pendingNewsletters.forEach(n => {
    if (!newslettersByNursery[n.nurseryId]) newslettersByNursery[n.nurseryId] = [];
    newslettersByNursery[n.nurseryId].push(n);
  });

  return (
    <div className="admin-newsletter-approval-section">
      <h2 className="text-lg font-semibold mb-4">Pending Newsletter Upload Requests</h2>
      {loading && <p>Loading...</p>}
      {error && <p className="text-red-500">{error}</p>}
      {Object.keys(newslettersByNursery).length === 0 && !loading && (
        <p>No pending newsletter requests.</p>
      )}
      <div className="space-y-8">
        {Object.entries(newslettersByNursery).map(([nurseryId, newsletters]) => (
          <div key={nurseryId} className="border rounded-lg p-4 bg-gray-50">
            <h3 className="text-md font-bold mb-3 flex items-center gap-2">
              <span className="inline-block bg-primary/10 p-1 rounded-full">
                <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-file-text"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M10 9H8"/><path d="M16 13H8"/><path d="M16 17H8"/></svg>
              </span>
              {getNurseryNameById(Number(nurseryId))}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {newsletters.map(n => (
                <div key={n.id} className="rounded-lg bg-white shadow p-4 flex flex-col items-center border hover:shadow-lg transition-shadow">
                  <div className="w-20 h-24 bg-red-100 rounded flex items-center justify-center mb-3 border">
                    <svg width="40" height="40" fill="none" stroke="#dc2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-file-text">
                      <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/>
                      <path d="M14 2v4a2 2 0 0 0 2 2h4"/>
                      <path d="M10 9H8"/>
                      <path d="M16 13H8"/>
                      <path d="M16 17H8"/>
                    </svg>
                  </div>
                  <div className="w-full flex flex-col items-center mb-2 text-center">
                    <span className="font-medium text-base mb-1">{n.title}</span>
                    <span className="text-xs text-gray-500 mb-1">{n.month} {n.year}</span>
                    {n.description && (
                      <span className="text-xs text-gray-400 mb-1 line-clamp-2">{n.description}</span>
                    )}
                    <span className="text-xs text-gray-500 mb-1">Status: <span className="capitalize font-semibold text-yellow-600">{n.approvalStatus}</span></span>
                  </div>
                  {n.fileUrl && (
                    <a 
                      href={n.fileUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-xs text-blue-600 hover:underline mb-2"
                    >
                      View PDF
                    </a>
                  )}
                  <div className="flex gap-2 w-full mt-2">
                    <button
                      className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded transition-colors w-full font-semibold"
                      onClick={() => approveNewsletter(n.id)}
                      disabled={loading}
                    >
                      Approve
                    </button>
                    <button
                      className="bg-red-500 hover:bg-red-600 text-white px-5 py-2 rounded transition-colors w-full font-semibold"
                      onClick={() => declineNewsletter(n.id)}
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

export default AdminNewsletterApprovalSection;
