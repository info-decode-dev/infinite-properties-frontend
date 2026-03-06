"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Building2, Plus, TrendingUp, MessageSquare, Grid3x3, List, Star, ArrowRight, Mail, Phone, Eye, Filter, X, Users, Clock, CheckCircle, XCircle, MapPin, ExternalLink, ChevronDown } from "lucide-react";
import apiClient from "@/lib/api";
import { Enquiry, EnquiryStats } from "@/types/enquiry";

interface DashboardStats {
  totalProperties: number;
  newThisMonth: number;
  featured: number;
  testimonials: number;
  monthlyData: { [key: string]: number };
  bhkStats: { type: string; count: number }[];
  statusStats: { status: string; count: number }[];
}

export default function AdminDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [enquiryStats, setEnquiryStats] = useState<EnquiryStats | null>(null);
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedEnquiry, setSelectedEnquiry] = useState<Enquiry | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      const [statsRes, enquiryStatsRes, enquiriesRes] = await Promise.all([
        apiClient.get("/api/properties/stats/dashboard"),
        apiClient.get("/api/enquiries/stats"),
        apiClient.get("/api/enquiries"),
      ]);

      if (statsRes.data.success) {
        setStats(statsRes.data.data);
      }

      if (enquiryStatsRes.data.success) {
        setEnquiryStats(enquiryStatsRes.data.data);
      }

      if (enquiriesRes.data.success) {
        setEnquiries(enquiriesRes.data.data);
      }
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredEnquiries = enquiries.filter((enquiry) => {
    const matchesStatus = statusFilter === "all" || enquiry.status === statusFilter;
    const matchesSearch =
      !searchQuery ||
      enquiry.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      enquiry.userEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      enquiry.property.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const formatDate = (date: Date | string) => {
    const d = typeof date === "string" ? new Date(date) : date;
    return d.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
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

  const updateStatus = async (id: string, status: string) => {
    try {
      await apiClient.put(`/api/enquiries/${id}/status`, { status });
      // Refresh enquiries list
      const response = await apiClient.get("/api/enquiries");
      if (response.data.success) {
        setEnquiries(response.data.data);
      }
      // Update selected enquiry if modal is open
      if (selectedEnquiry && selectedEnquiry.id === id) {
        setSelectedEnquiry({ ...selectedEnquiry, status: status as any });
      }
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to update status");
    }
  };

  const handlePropertyClick = (propertyId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    router.push(`/admin/properties/${propertyId}`);
  };

  // Chart data preparation
  const monthlyLabels = stats?.monthlyData ? Object.keys(stats.monthlyData).sort() : [];
  const monthlyValues = stats?.monthlyData ? monthlyLabels.map((key) => stats.monthlyData[key]) : [];
  const maxMonthlyValue = monthlyValues.length > 0 ? Math.max(...monthlyValues) : 1;

  const enquiryMonthlyLabels = enquiryStats?.monthlyData ? Object.keys(enquiryStats.monthlyData).sort() : [];
  const enquiryMonthlyValues = enquiryStats?.monthlyData ? enquiryMonthlyLabels.map((key) => enquiryStats.monthlyData[key]) : [];
  const maxEnquiryValue = enquiryMonthlyValues.length > 0 ? Math.max(...enquiryMonthlyValues) : 1;

  return (
    <div className="p-4 sm:p-6 lg:p-8 mx-auto space-y-6 sm:space-y-8">
      <div className="mb-6 sm:mb-10">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-3">
          Dashboard
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm sm:text-base lg:text-lg">
          Overview of your property listings and content
        </p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <>
          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700/50 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">
                    Total Properties
                  </p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
                    {stats?.totalProperties || 0}
                  </p>
                </div>
                <div className="p-2.5 rounded-lg bg-blue-500/10 dark:bg-blue-500/20">
                  <Building2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700/50 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">
                    New This Month
                  </p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
                    {stats?.newThisMonth || 0}
                  </p>
                </div>
                <div className="p-2.5 rounded-lg bg-green-500/10 dark:bg-green-500/20">
                  <Plus className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700/50 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">
                    Featured
                  </p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
                    {stats?.featured || 0}
                  </p>
                </div>
                <div className="p-2.5 rounded-lg bg-purple-500/10 dark:bg-purple-500/20">
                  <TrendingUp className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700/50 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">
                    Testimonials
                  </p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
                    {stats?.testimonials || 0}
                  </p>
                </div>
                <div className="p-2.5 rounded-lg bg-orange-500/10 dark:bg-orange-500/20">
                  <MessageSquare className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                </div>
              </div>
            </div>
          </div>

          {/* Enquiries Table */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700/50 shadow-sm">
            <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700/50">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-1">
                    Recent Enquiries
                  </h2>
                  <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                    {enquiryStats && (
                      <>
                        Total: {enquiryStats.total} | Pending: {enquiryStats.pending} | Contacted: {enquiryStats.contacted} | Closed: {enquiryStats.closed}
                      </>
                    )}
                  </p>
                </div>
                <Link
                  href="/admin/enquiries"
                  className="text-sm text-blue-600 dark:text-blue-400 hover:underline font-medium"
                >
                  View All
                </Link>
              </div>

              {/* Filters */}
              <div className="flex flex-wrap gap-3 items-center">
                <div className="flex-1 min-w-[200px]">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search by name, email, or property..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
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
                <div className="flex gap-2">
                  {["all", "pending", "contacted", "closed"].map((status) => (
                    <button
                      key={status}
                      onClick={() => setStatusFilter(status)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        statusFilter === status
                          ? "bg-blue-600 text-white"
                          : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                      }`}
                    >
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Desktop Table View */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700/50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Property
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredEnquiries.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center">
                        <p className="text-gray-500 dark:text-gray-400">
                          {searchQuery || statusFilter !== "all"
                            ? "No enquiries match your filters"
                            : "No enquiries yet"}
                        </p>
                      </td>
                    </tr>
                  ) : (
                    filteredEnquiries.slice(0, 10).map((enquiry) => (
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
                          <div>
                            <div className="font-medium text-gray-900 dark:text-white">
                              {enquiry.property.title}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {enquiry.property.location.city}, {enquiry.property.location.state}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(
                              enquiry.status
                            )}`}
                          >
                            {enquiry.status.charAt(0).toUpperCase() + enquiry.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                          {formatDate(enquiry.createdAt)}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => openEnquiryModal(enquiry.id)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 text-sm text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/20 rounded-lg transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                            View
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="lg:hidden p-4 space-y-4">
              {filteredEnquiries.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500 dark:text-gray-400">
                    {searchQuery || statusFilter !== "all"
                      ? "No enquiries match your filters"
                      : "No enquiries yet"}
                  </p>
                </div>
              ) : (
                filteredEnquiries.slice(0, 10).map((enquiry) => (
                  <div
                    key={enquiry.id}
                    className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-4 border border-gray-200 dark:border-gray-600"
                  >
                    <div className="space-y-3">
                      <div>
                        <h3 className="font-medium text-gray-900 dark:text-white mb-1">
                          {enquiry.userName}
                        </h3>
                        <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2">
                          <Mail className="w-3 h-3" />
                          <span className="break-all">{enquiry.userEmail}</span>
                        </div>
                        {enquiry.userPhone && (
                          <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2 mt-1">
                            <Phone className="w-3 h-3" />
                            <span>{enquiry.userPhone}</span>
                          </div>
                        )}
                      </div>
                      <div className="pt-2 border-t border-gray-200 dark:border-gray-600">
                        <div className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                          {enquiry.property.title}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {enquiry.property.location.city}, {enquiry.property.location.state}
                        </div>
                      </div>
                      <div className="flex items-center justify-between pt-2 border-t border-gray-200 dark:border-gray-600">
                        <span
                          className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(
                            enquiry.status
                          )}`}
                        >
                          {enquiry.status.charAt(0).toUpperCase() + enquiry.status.slice(1)}
                        </span>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {formatDate(enquiry.createdAt)}
                        </div>
                      </div>
                      <div className="pt-2 border-t border-gray-200 dark:border-gray-600">
                        <button
                          onClick={() => openEnquiryModal(enquiry.id)}
                          className="w-full inline-flex items-center justify-center gap-1 px-3 py-2 text-sm text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/20 rounded-lg transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                          View Details
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700/50 shadow-sm p-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                  Quick Actions
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Common tasks and shortcuts
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <Link
                href="/admin/properties/new"
                className="group flex items-center gap-4 p-5 rounded-xl border border-gray-200 dark:border-gray-700/50 bg-white dark:bg-gray-800 hover:border-blue-300 dark:hover:border-blue-700 hover:bg-blue-50/50 dark:hover:bg-blue-950/10 transition-all duration-200"
              >
                <div className="p-3 rounded-lg bg-blue-500/10 dark:bg-blue-500/20 group-hover:bg-blue-500 dark:group-hover:bg-blue-600 transition-colors">
                  <Plus className="w-5 h-5 text-blue-600 dark:text-blue-400 group-hover:text-white transition-colors" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    Add New Property
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Create a new listing
                  </p>
                </div>
                <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors shrink-0" />
              </Link>

              <Link
                href="/admin/testimonials/new"
                className="group flex items-center gap-4 p-5 rounded-xl border border-gray-200 dark:border-gray-700/50 bg-white dark:bg-gray-800 hover:border-green-300 dark:hover:border-green-700 hover:bg-green-50/50 dark:hover:bg-green-950/10 transition-all duration-200"
              >
                <div className="p-3 rounded-lg bg-green-500/10 dark:bg-green-500/20 group-hover:bg-green-500 dark:group-hover:bg-green-600 transition-colors">
                  <Star className="w-5 h-5 text-green-600 dark:text-green-400 group-hover:text-white transition-colors" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 dark:text-white group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
                    Add Testimonial
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Add customer review
                  </p>
                </div>
                <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors shrink-0" />
              </Link>

              <Link
                href="/admin/collections"
                className="group flex items-center gap-4 p-5 rounded-xl border border-gray-200 dark:border-gray-700/50 bg-white dark:bg-gray-800 hover:border-purple-300 dark:hover:border-purple-700 hover:bg-purple-50/50 dark:hover:bg-purple-950/10 transition-all duration-200"
              >
                <div className="p-3 rounded-lg bg-purple-500/10 dark:bg-purple-500/20 group-hover:bg-purple-500 dark:group-hover:bg-purple-600 transition-colors">
                  <Grid3x3 className="w-5 h-5 text-purple-600 dark:text-purple-400 group-hover:text-white transition-colors" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                    Collections & Reels
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Manage content
                  </p>
                </div>
                <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors shrink-0" />
              </Link>

              <Link
                href="/admin/properties"
                className="group flex items-center gap-4 p-5 rounded-xl border border-gray-200 dark:border-gray-700/50 bg-white dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-all duration-200"
              >
                <div className="p-3 rounded-lg bg-gray-100 dark:bg-gray-700 group-hover:bg-gray-600 dark:group-hover:bg-gray-500 transition-colors">
                  <List className="w-5 h-5 text-gray-600 dark:text-gray-400 group-hover:text-white transition-colors" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 dark:text-white group-hover:text-gray-700 dark:group-hover:text-gray-200 transition-colors">
                    All Properties
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    View all listings
                  </p>
                </div>
                <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors shrink-0" />
              </Link>

              <Link
                href="/admin/testimonials"
                className="group flex items-center gap-4 p-5 rounded-xl border border-gray-200 dark:border-gray-700/50 bg-white dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-all duration-200"
              >
                <div className="p-3 rounded-lg bg-gray-100 dark:bg-gray-700 group-hover:bg-gray-600 dark:group-hover:bg-gray-500 transition-colors">
                  <MessageSquare className="w-5 h-5 text-gray-600 dark:text-gray-400 group-hover:text-white transition-colors" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 dark:text-white group-hover:text-gray-700 dark:group-hover:text-gray-200 transition-colors">
                    All Testimonials
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    View all reviews
                  </p>
                </div>
                <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors shrink-0" />
              </Link>
            </div>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Properties Chart */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700/50 shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Properties Added (Last 6 Months)
              </h3>
              {monthlyLabels.length > 0 ? (
                <div className="space-y-3">
                  {monthlyLabels.map((label, index) => {
                    const value = monthlyValues[index];
                    const percentage = (value / maxMonthlyValue) * 100;
                    return (
                      <div key={label} className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600 dark:text-gray-400">{label}</span>
                          <span className="font-medium text-gray-900 dark:text-white">{value}</span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div
                            className="bg-blue-600 dark:bg-blue-500 h-2 rounded-full transition-all duration-500"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-8">
                  No data available
                </p>
              )}
            </div>

            {/* Enquiries Chart */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700/50 shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Client Enquiries (Last 6 Months)
              </h3>
              {enquiryMonthlyLabels.length > 0 ? (
                <div className="space-y-3">
                  {enquiryMonthlyLabels.map((label, index) => {
                    const value = enquiryMonthlyValues[index];
                    const percentage = (value / maxEnquiryValue) * 100;
                    return (
                      <div key={label} className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600 dark:text-gray-400">{label}</span>
                          <span className="font-medium text-gray-900 dark:text-white">{value}</span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div
                            className="bg-green-600 dark:bg-green-500 h-2 rounded-full transition-all duration-500"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-8">
                  No data available
                </p>
              )}
            </div>
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
