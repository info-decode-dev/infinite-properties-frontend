"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Eye, Mail, Phone, Calendar, Filter, X, Users, Clock, CheckCircle, XCircle, Building2, MapPin, MessageSquare, ExternalLink, ChevronDown } from "lucide-react";
import { Enquiry } from "@/types/enquiry";
import apiClient from "@/lib/api";
import { Select, MenuItem, FormControl, SelectChangeEvent } from "@mui/material";

export default function EnquiriesPage() {
  const router = useRouter();
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [propertyFilter, setPropertyFilter] = useState<string>("all");
  const [selectedEnquiry, setSelectedEnquiry] = useState<Enquiry | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchEnquiries();
  }, [statusFilter, searchQuery]);

  const fetchEnquiries = async () => {
    try {
      setIsLoading(true);
      setError("");
      const params: any = {};
      if (statusFilter !== "all") params.status = statusFilter;
      if (searchQuery) params.search = searchQuery;

      const response = await apiClient.get("/api/enquiries", { params });
      if (response.data && response.data.success) {
        const data = response.data.data;
        // Ensure data is an array
        setEnquiries(Array.isArray(data) ? data : []);
      } else {
        setEnquiries([]);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to fetch enquiries");
      console.error("Error fetching enquiries:", err);
      setEnquiries([]);
    } finally {
      setIsLoading(false);
    }
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      await apiClient.put(`/api/enquiries/${id}/status`, { status });
      fetchEnquiries();
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to update status");
    }
  };

  const filteredEnquiries = enquiries.filter((enquiry) => {
    if (propertyFilter !== "all" && enquiry.propertyId !== propertyFilter) {
      return false;
    }
    return true;
  });

  const formatDate = (date: Date | string) => {
    const d = typeof date === "string" ? new Date(date) : date;
    return d.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="w-4 h-4" />;
      case "contacted":
        return <CheckCircle className="w-4 h-4" />;
      case "closed":
        return <XCircle className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800";
      case "contacted":
        return "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-800";
      case "closed":
        return "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border-green-200 dark:border-green-800";
      default:
        return "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-600";
    }
  };

  const uniqueProperties = Array.from(
    new Map(enquiries.filter((e) => e.property).map((e) => [e.property.id, e.property])).values()
  );

  const openEnquiryModal = async (enquiryId: string) => {
    try {
      const response = await apiClient.get(`/api/enquiries/${enquiryId}`);
      if (response.data.success) {
        setSelectedEnquiry(response.data.data);
        setIsModalOpen(true);
      }
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to fetch enquiry details");
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedEnquiry(null);
  };

  const handlePropertyClick = (propertyId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    router.push(`/admin/properties/${propertyId}`);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Enquiries
          </h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
            Manage property enquiries from clients
          </p>
        </div>
        <Link
          href="/admin"
          className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors text-sm sm:text-base"
        >
          <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
          <span className="hidden sm:inline">Back to Dashboard</span>
          <span className="sm:hidden">Back</span>
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700/50 shadow-sm p-4 sm:p-6 mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Search
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="Search by name, email, or property..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2"
                >
                  <X className="w-4 h-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" />
                </button>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="contacted">Contacted</option>
              <option value="closed">Closed</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Property
            </label>
            <select
              value={propertyFilter}
              onChange={(e) => setPropertyFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Properties</option>
              {uniqueProperties.map((property) => (
                <option key={property.id} value={property.id}>
                  {property.title}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* Enquiries Table */}
      {isLoading ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700/50 shadow-sm p-12 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading enquiries...</p>
        </div>
      ) : filteredEnquiries.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700/50 shadow-sm p-12 text-center">
          <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            No enquiries found
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            {searchQuery || statusFilter !== "all" || propertyFilter !== "all"
              ? "Try adjusting your filters"
              : "No enquiries have been submitted yet"}
          </p>
        </div>
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="hidden lg:block bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700/50 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700/50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    User Details
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Property
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredEnquiries.map((enquiry) => (
                  <tr
                    key={enquiry.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">
                          {enquiry.userName}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2 mt-1">
                          <Mail className="w-3 h-3" />
                          {enquiry.userEmail}
                        </div>
                        {enquiry.userPhone && (
                          <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2 mt-1">
                            <Phone className="w-3 h-3" />
                            {enquiry.userPhone}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {enquiry.property ? (
                        <div 
                          className="flex items-center gap-3 cursor-pointer group"
                          onClick={(e) => handlePropertyClick(enquiry.property.id, e)}
                        >
                          {enquiry.property?.images && enquiry.property.images.length > 0 && (
                            <img
                              src={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}${enquiry.property.images[0]}`}
                              alt={enquiry.property?.title || 'Property'}
                              className="w-12 h-12 object-cover rounded-lg border border-gray-200 dark:border-gray-700 group-hover:border-blue-500 transition-colors"
                              onError={(e) => {
                                (e.target as HTMLImageElement).style.display = 'none';
                              }}
                            />
                          )}
                          <div className="flex-1">
                            <div className="font-medium text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors flex items-center gap-1">
                              {enquiry.property?.title || 'N/A'}
                              <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                            {enquiry.property?.location && (
                              <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1 mt-1">
                                <MapPin className="w-3 h-3" />
                                {enquiry.property.location.city || ''}, {enquiry.property.location.state || ''}
                              </div>
                            )}
                            {enquiry.property && (
                              <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                                ₹{enquiry.property.offerPrice?.toLocaleString('en-IN') || enquiry.property.actualPrice?.toLocaleString('en-IN') || '0'}
                              </div>
                            )}
                          </div>
                        </div>
                      ) : (
                        <span className="text-gray-400">N/A</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <FormControl size="small" sx={{ minWidth: 140 }}>
                        <Select
                          value={enquiry.status}
                          onChange={(e: SelectChangeEvent) => updateStatus(enquiry.id, e.target.value)}
                          sx={{
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            height: '32px',
                            borderRadius: '8px',
                            '& .MuiOutlinedInput-notchedOutline': {
                              borderWidth: '2px',
                            },
                            '& .MuiSelect-select': {
                              display: 'flex',
                              alignItems: 'center',
                              paddingLeft: '36px',
                              paddingRight: '32px',
                            },
                            ...(enquiry.status === 'pending' && {
                              backgroundColor: 'rgba(254, 243, 199, 0.5)',
                              color: '#92400e',
                              borderColor: '#fde68a',
                              '&:hover': {
                                backgroundColor: 'rgba(254, 243, 199, 0.7)',
                              },
                              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                borderColor: '#fbbf24',
                              },
                              '@media (prefers-color-scheme: dark)': {
                                backgroundColor: 'rgba(113, 63, 18, 0.3)',
                                color: '#fcd34d',
                                borderColor: '#92400e',
                                '&:hover': {
                                  backgroundColor: 'rgba(113, 63, 18, 0.5)',
                                },
                              },
                            }),
                            ...(enquiry.status === 'contacted' && {
                              backgroundColor: 'rgba(219, 234, 254, 0.5)',
                              color: '#1e40af',
                              borderColor: '#93c5fd',
                              '&:hover': {
                                backgroundColor: 'rgba(219, 234, 254, 0.7)',
                              },
                              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                borderColor: '#60a5fa',
                              },
                              '@media (prefers-color-scheme: dark)': {
                                backgroundColor: 'rgba(30, 64, 175, 0.3)',
                                color: '#93c5fd',
                                borderColor: '#1e40af',
                                '&:hover': {
                                  backgroundColor: 'rgba(30, 64, 175, 0.5)',
                                },
                              },
                            }),
                            ...(enquiry.status === 'closed' && {
                              backgroundColor: 'rgba(209, 250, 229, 0.5)',
                              color: '#065f46',
                              borderColor: '#86efac',
                              '&:hover': {
                                backgroundColor: 'rgba(209, 250, 229, 0.7)',
                              },
                              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                borderColor: '#34d399',
                              },
                              '@media (prefers-color-scheme: dark)': {
                                backgroundColor: 'rgba(6, 95, 70, 0.3)',
                                color: '#6ee7b7',
                                borderColor: '#065f46',
                                '&:hover': {
                                  backgroundColor: 'rgba(6, 95, 70, 0.5)',
                                },
                              },
                            }),
                            '& .MuiSelect-icon': {
                              color: 'inherit',
                              opacity: 0.5,
                            },
                          }}
                          startAdornment={
                            <span style={{ 
                              position: 'absolute', 
                              left: '8px', 
                              display: 'flex', 
                              alignItems: 'center',
                              pointerEvents: 'none',
                              zIndex: 1
                            }}>
                              {getStatusIcon(enquiry.status)}
                            </span>
                          }
                          MenuProps={{
                            PaperProps: {
                              sx: {
                                mt: 1,
                                borderRadius: '8px',
                                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                                '& .MuiMenuItem-root': {
                                  fontSize: '0.75rem',
                                  padding: '8px 16px',
                                  '&:hover': {
                                    backgroundColor: 'rgba(0, 0, 0, 0.04)',
                                  },
                                },
                              },
                            },
                          }}
                        >
                          <MenuItem value="pending">
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4" />
                              <span>Pending</span>
                            </div>
                          </MenuItem>
                          <MenuItem value="contacted">
                            <div className="flex items-center gap-2">
                              <CheckCircle className="w-4 h-4" />
                              <span>Contacted</span>
                            </div>
                          </MenuItem>
                          <MenuItem value="closed">
                            <div className="flex items-center gap-2">
                              <XCircle className="w-4 h-4" />
                              <span>Closed</span>
                            </div>
                          </MenuItem>
                        </Select>
                      </FormControl>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {formatDate(enquiry.createdAt)}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => openEnquiryModal(enquiry.id)}
                        className="inline-flex items-center gap-2 px-4 py-2 text-sm text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/20 rounded-lg transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          </div>

          {/* Mobile Card View */}
          <div className="lg:hidden space-y-4">
            {filteredEnquiries.map((enquiry) => (
              <div
                key={enquiry.id}
                className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700/50 shadow-sm p-4"
              >
                <div className="space-y-4">
                  {/* User Details */}
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white mb-2">
                      {enquiry.userName}
                    </h3>
                    <div className="space-y-1 text-sm">
                      <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                        <Mail className="w-4 h-4" />
                        <span className="break-all">{enquiry.userEmail}</span>
                      </div>
                      {enquiry.userPhone && (
                        <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                          <Phone className="w-4 h-4" />
                          <span>{enquiry.userPhone}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Property */}
                  {enquiry.property ? (
                    <div 
                      className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors"
                      onClick={(e) => handlePropertyClick(enquiry.property.id, e)}
                    >
                      {enquiry.property?.images && enquiry.property.images.length > 0 && (
                        <img
                          src={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}${enquiry.property.images[0]}`}
                          alt={enquiry.property?.title || 'Property'}
                          className="w-16 h-16 object-cover rounded-lg border border-gray-200 dark:border-gray-700"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-gray-900 dark:text-white flex items-center gap-1">
                          {enquiry.property?.title || 'N/A'}
                          <ExternalLink className="w-3 h-3" />
                        </div>
                        {enquiry.property?.location && (
                          <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1 mt-1">
                            <MapPin className="w-3 h-3" />
                            {enquiry.property.location.city || ''}, {enquiry.property.location.state || ''}
                          </div>
                        )}
                        {enquiry.property && (
                          <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                            ₹{enquiry.property.offerPrice?.toLocaleString('en-IN') || enquiry.property.actualPrice?.toLocaleString('en-IN') || '0'}
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="text-sm text-gray-400">No property</div>
                  )}

                  {/* Status and Date */}
                  <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-700">
                    <div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Status</div>
                      <FormControl size="small" sx={{ minWidth: 120 }}>
                        <Select
                          value={enquiry.status}
                          onChange={(e: SelectChangeEvent) => updateStatus(enquiry.id, e.target.value)}
                          sx={{
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            height: '32px',
                            borderRadius: '8px',
                            '& .MuiOutlinedInput-notchedOutline': {
                              borderWidth: '2px',
                            },
                            '& .MuiSelect-select': {
                              display: 'flex',
                              alignItems: 'center',
                              paddingLeft: '36px',
                              paddingRight: '32px',
                            },
                            ...(enquiry.status === 'pending' && {
                              backgroundColor: 'rgba(254, 243, 199, 0.5)',
                              color: '#92400e',
                              borderColor: '#fde68a',
                              '&:hover': {
                                backgroundColor: 'rgba(254, 243, 199, 0.7)',
                              },
                              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                borderColor: '#fbbf24',
                              },
                            }),
                            ...(enquiry.status === 'contacted' && {
                              backgroundColor: 'rgba(219, 234, 254, 0.5)',
                              color: '#1e40af',
                              borderColor: '#93c5fd',
                              '&:hover': {
                                backgroundColor: 'rgba(219, 234, 254, 0.7)',
                              },
                              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                borderColor: '#60a5fa',
                              },
                            }),
                            ...(enquiry.status === 'closed' && {
                              backgroundColor: 'rgba(209, 250, 229, 0.5)',
                              color: '#065f46',
                              borderColor: '#86efac',
                              '&:hover': {
                                backgroundColor: 'rgba(209, 250, 229, 0.7)',
                              },
                              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                borderColor: '#34d399',
                              },
                            }),
                            '& .MuiSelect-icon': {
                              color: 'inherit',
                              opacity: 0.5,
                            },
                          }}
                          startAdornment={
                            <span style={{ 
                              position: 'absolute', 
                              left: '8px', 
                              display: 'flex', 
                              alignItems: 'center',
                              pointerEvents: 'none',
                              zIndex: 1
                            }}>
                              {getStatusIcon(enquiry.status)}
                            </span>
                          }
                        >
                          <MenuItem value="pending">
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4" />
                              <span>Pending</span>
                            </div>
                          </MenuItem>
                          <MenuItem value="contacted">
                            <div className="flex items-center gap-2">
                              <CheckCircle className="w-4 h-4" />
                              <span>Contacted</span>
                            </div>
                          </MenuItem>
                          <MenuItem value="closed">
                            <div className="flex items-center gap-2">
                              <XCircle className="w-4 h-4" />
                              <span>Closed</span>
                            </div>
                          </MenuItem>
                        </Select>
                      </FormControl>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Date</div>
                      <div className="text-sm text-gray-900 dark:text-white">
                        {formatDate(enquiry.createdAt)}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                    <button
                      onClick={() => openEnquiryModal(enquiry.id)}
                      className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/20 rounded-lg transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Enquiry Details Modal */}
      {isModalOpen && selectedEnquiry && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200"
          onClick={closeModal}
        >
          <div 
            className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Minimal Header */}
            <div className="px-8 py-6 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Enquiry Details</h2>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  {formatDate(selectedEnquiry.createdAt)}
                </p>
              </div>
              <button
                onClick={closeModal}
                className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-400 dark:text-gray-500" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto px-8 py-6 space-y-5">
              {/* User Information - Minimal Card */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-3">
                  <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-950/20">
                    <Users className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wide">Contact</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-10">
                  <div className="space-y-1">
                    <p className="text-xs text-gray-500 dark:text-gray-400">Name</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{selectedEnquiry.userName}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-gray-500 dark:text-gray-400">Email</p>
                    <a 
                      href={`mailto:${selectedEnquiry.userEmail}`}
                      className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 flex items-center gap-1.5 group"
                    >
                      <Mail className="w-3.5 h-3.5" />
                      <span className="group-hover:underline">{selectedEnquiry.userEmail}</span>
                    </a>
                  </div>
                  {selectedEnquiry.userPhone && (
                    <div className="space-y-1">
                      <p className="text-xs text-gray-500 dark:text-gray-400">Phone</p>
                      <a 
                        href={`tel:${selectedEnquiry.userPhone}`}
                        className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 flex items-center gap-1.5 group"
                      >
                        <Phone className="w-3.5 h-3.5" />
                        <span className="group-hover:underline">{selectedEnquiry.userPhone}</span>
                      </a>
                    </div>
                  )}
                  <div className="space-y-1">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1.5">Status</p>
                    <div className="relative inline-block w-full">
                      <select
                        value={selectedEnquiry.status}
                        onChange={(e) => {
                          updateStatus(selectedEnquiry.id, e.target.value);
                          setSelectedEnquiry({ ...selectedEnquiry, status: e.target.value as any });
                        }}
                        className={`appearance-none px-3 py-2 pl-7 pr-7 rounded-lg text-xs font-semibold border-2 transition-all w-full ${getStatusColor(
                          selectedEnquiry.status
                        )} focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-500/20 cursor-pointer`}
                      >
                        <option value="pending">Pending</option>
                        <option value="contacted">Contacted</option>
                        <option value="closed">Closed</option>
                      </select>
                      <div className="absolute left-2 top-1/2 -translate-y-1/2 pointer-events-none">
                        {getStatusIcon(selectedEnquiry.status)}
                      </div>
                      <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 pointer-events-none opacity-40" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Message - Minimal Card */}
              {selectedEnquiry.message && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-purple-50 dark:bg-purple-950/20">
                      <MessageSquare className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                    </div>
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wide">Message</h3>
                  </div>
                  <div className="pl-10">
                    <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 border border-gray-100 dark:border-gray-800">
                      {selectedEnquiry.message}
                    </p>
                  </div>
                </div>
              )}

              {/* Property Information - Minimal Card */}
              {selectedEnquiry.property && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-lg bg-green-50 dark:bg-green-950/20">
                        <Building2 className="w-4 h-4 text-green-600 dark:text-green-400" />
                      </div>
                      <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wide">Property</h3>
                    </div>
                    <button
                      onClick={(e) => handlePropertyClick(selectedEnquiry.property.id, e)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/20 rounded-lg transition-colors"
                    >
                      View
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-10">
                    <div className="space-y-1">
                      <p className="text-xs text-gray-500 dark:text-gray-400">Title</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{selectedEnquiry.property.title}</p>
                    </div>
                    {selectedEnquiry.property.location && (
                      <div className="space-y-1">
                        <p className="text-xs text-gray-500 dark:text-gray-400">Location</p>
                        <p className="text-sm text-gray-900 dark:text-white flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-gray-400" />
                          {selectedEnquiry.property.location.city}, {selectedEnquiry.property.location.state}
                        </p>
                      </div>
                    )}
                    <div className="space-y-1">
                      <p className="text-xs text-gray-500 dark:text-gray-400">Price</p>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">
                        ₹{selectedEnquiry.property.offerPrice?.toLocaleString('en-IN') || selectedEnquiry.property.actualPrice?.toLocaleString('en-IN') || '0'}
                      </p>
                    </div>
                    {selectedEnquiry.property.propertyType === "Plot" ? (
                      <>
                        {selectedEnquiry.property.landType && (
                          <div className="space-y-1">
                            <p className="text-xs text-gray-500 dark:text-gray-400">Land Type</p>
                            <p className="text-sm text-gray-900 dark:text-white">{selectedEnquiry.property.landType}</p>
                          </div>
                        )}
                        {selectedEnquiry.property.ownership && (
                          <div className="space-y-1">
                            <p className="text-xs text-gray-500 dark:text-gray-400">Ownership</p>
                            <p className="text-sm text-gray-900 dark:text-white">{selectedEnquiry.property.ownership}</p>
                          </div>
                        )}
                      </>
                    ) : (
                      selectedEnquiry.property.bhkType && (
                        <div className="space-y-1">
                          <p className="text-xs text-gray-500 dark:text-gray-400">BHK Type</p>
                          <p className="text-sm text-gray-900 dark:text-white">{selectedEnquiry.property.bhkType}</p>
                        </div>
                      )
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

