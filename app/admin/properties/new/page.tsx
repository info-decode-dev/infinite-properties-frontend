"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import PropertyForm from "@/components/PropertyForm";
import apiClient from "@/lib/api";
import { Snackbar, Alert, AlertTitle } from "@mui/material";

export default function NewPropertyPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [validationErrors, setValidationErrors] = useState<Array<{ field: string; message: string }>>([]);

  const handleSubmit = async (data: any) => {
    try {
      setIsSubmitting(true);
      setError("");
      setValidationErrors([]);
      setSnackbarOpen(false);

      // Create FormData for file uploads
      const formData = new FormData();

      // Append text fields
      formData.append("title", data.title);
      formData.append("description", data.description);
      formData.append("actualPrice", data.actualPrice.toString());
      if (data.offerPrice) {
        formData.append("offerPrice", data.offerPrice.toString());
      }
      formData.append("propertyType", data.propertyType);
      
      // Only append non-Plot fields if propertyType is not Plot
      if (data.propertyType !== "Plot") {
        if (data.bhkType) {
          formData.append("bhkType", data.bhkType);
        }
        if (data.constructionStatus) {
          formData.append("constructionStatus", data.constructionStatus);
        }
        if (data.builtUpArea) {
          formData.append("builtUpArea", data.builtUpArea.toString());
        }
      }
      
      formData.append("landArea", (data.landArea ?? 0).toString());
      formData.append("landAreaUnit", data.landAreaUnit ?? "cent");
      
      // Append Plot-specific fields if propertyType is Plot
      if (data.propertyType === "Plot") {
        if (data.landType) {
          formData.append("landType", data.landType);
        }
        if (data.plotSize) {
          formData.append("plotSize", data.plotSize.toString());
        }
        if (data.plotSizeUnit) {
          formData.append("plotSizeUnit", data.plotSizeUnit);
        }
        if (data.ownership) {
          formData.append("ownership", data.ownership);
        }
      }
      if (data.furnishedStatus) {
        formData.append("furnishedStatus", data.furnishedStatus);
      }
      if (data.negotiation) {
        formData.append("negotiation", data.negotiation);
      }
      if (data.nearbyLandmarks && data.nearbyLandmarks.length > 0) {
        formData.append("nearbyLandmarks", JSON.stringify(data.nearbyLandmarks));
      }
      if (data.accessibility && data.accessibility.length > 0) {
        formData.append("accessibility", JSON.stringify(data.accessibility.map((a: any) => ({
          name: a.name,
          distance: a.distance,
          unit: a.unit,
        }))));
      }
      
      // Append tags as JSON array
      formData.append("tags", JSON.stringify(data.tags || []));

      // Append location
      formData.append("location", JSON.stringify({
        exactLocation: data.location.exactLocation,
        city: data.location.city,
        state: data.location.state,
        country: data.location.country,
        latitude: data.location.latitude?.toString() || "",
        longitude: data.location.longitude?.toString() || "",
      }));

      // Append developer info (only for non-Plot properties)
      if (data.propertyType !== "Plot") {
        formData.append("developerInfo", JSON.stringify({
          name: data.developerInfo?.name || "",
          email: data.developerInfo?.email || "",
          phone: data.developerInfo?.phone || "",
          website: data.developerInfo?.website || "",
          description: data.developerInfo?.description || "",
        }));
      }

      // Append amenities
      formData.append("amenities", JSON.stringify(
        (data.amenities || []).map((a: any) => ({
          name: a.name,
          icon: a.icon || "",
        }))
      ));

      // Append collection IDs if provided
      if (data.collectionIds && data.collectionIds.length > 0) {
        formData.append("collectionIds", JSON.stringify(data.collectionIds));
      }

      // Append images
      data.images.forEach((file: File) => {
        formData.append("images", file);
      });

      const response = await apiClient.post("/api/properties", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.data.success) {
        router.push("/admin/properties");
      }
    } catch (err: any) {
      // Handle validation errors
      if (err.response?.data?.errors && Array.isArray(err.response.data.errors)) {
        const errors = err.response.data.errors.map((error: any) => {
          const field = error.path || error.param || "Field";
          const message = error.msg || error.message || "Invalid value";
          // Format field name (e.g., "location.city" -> "City", "builtUpArea" -> "Built Up Area")
          const formattedField = field
            .split(".")
            .pop()
            ?.replace(/([A-Z])/g, " $1")
            .replace(/^./, (str: string) => str.toUpperCase())
            .trim() || field;
          return { field: formattedField, message };
        });
        setValidationErrors(errors);
        setSnackbarMessage(`Validation failed: ${errors.length} error${errors.length > 1 ? 's' : ''} found`);
        setSnackbarOpen(true);
        setError("Please fix the validation errors below");
      } else {
        const message = err.response?.data?.message || err.message || "Failed to create property";
        setError(message);
        setSnackbarMessage(message);
        setSnackbarOpen(true);
      }
      console.error("Error creating property:", err);
      console.error("Error response:", err.response?.data);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
    // Optionally clear validation errors when snackbar is closed
    // setValidationErrors([]);
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Add New Property
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Create a new property listing with all details
        </p>
      </div>
      {error && validationErrors.length > 0 && (
        <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-sm font-medium text-red-600 dark:text-red-400 mb-2">{error}</p>
          <ul className="list-disc list-inside space-y-1">
            {validationErrors.map((err, index) => (
              <li key={index} className="text-sm text-red-600 dark:text-red-400">
                <span className="font-medium">{err.field}:</span> {err.message}
              </li>
            ))}
          </ul>
        </div>
      )}
      {error && validationErrors.length === 0 && (
        <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}
      <PropertyForm onSubmit={handleSubmit} isSubmitting={isSubmitting} />
      
      {/* MUI Snackbar for toast notifications */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity="error" 
          variant="filled"
          sx={{ width: '100%' }}
        >
          <AlertTitle>Error</AlertTitle>
          {snackbarMessage}
          {validationErrors.length > 0 && (
            <ul style={{ marginTop: '8px', marginBottom: 0, paddingLeft: '20px' }}>
              {validationErrors.slice(0, 3).map((err, index) => (
                <li key={index} style={{ fontSize: '0.875rem', marginTop: '4px' }}>
                  <strong>{err.field}:</strong> {err.message}
                </li>
              ))}
              {validationErrors.length > 3 && (
                <li style={{ fontSize: '0.875rem', marginTop: '4px' }}>
                  and {validationErrors.length - 3} more error{validationErrors.length - 3 > 1 ? 's' : ''}...
                </li>
              )}
            </ul>
          )}
        </Alert>
      </Snackbar>
    </div>
  );
}

