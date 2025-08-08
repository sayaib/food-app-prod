import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import MapComponent from "../../components/MapBox/MapComponent";
import { motion } from "framer-motion";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { CheckCircle, XCircle, ArrowLeft, MapPin, Mail, Phone, Calendar, Percent, Star, ShoppingBag, FileText, Image, Menu, Clock, Utensils, ExternalLink, MessageSquare, ShieldCheck, Loader2, ImageOff, Building, User, DollarSign, Tag } from "lucide-react";
import AdminLayout, { AdminButton } from "../../components/Admin/AdminLayout";
import AdminCard from "../../components/Admin/AdminCard";


const VerifyRestaurant = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const restaurant = state?.restaurant;

  const [remarks, setRemarks] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAction = async (status) => {
    if (!remarks.trim()) {
      toast.error("Please enter remarks.");
      return;
    }
    
    setLoading(true);
    try {
      const res = await fetch("/api/restaurant/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          restaurantId: restaurant._id,
          status,
          remarks,
        }),
      });

      const data = await res.json();
      setLoading(false);
      if (data.success) {
        // Update the restaurant status in the state passed from AdminDashboard
        if (state?.restaurant) {
          state.restaurant.status = status;
        }
        
        // Invalidate the restaurants query cache to trigger a refetch
        queryClient.invalidateQueries(["restaurants-admin"]);
        
        toast.success(`Restaurant has been ${status}.`);
        navigate("/admin");
      } else {
        toast.error("Action failed. " + (data.message || ""));
      }
    } catch (error) {
      console.error("Verification error:", error);
      setLoading(false);
      toast.error("Something went wrong.");
    }
  };

  if (!restaurant) {
    return (
      <AdminLayout title="Restaurant Verification">
        <AdminCard className="p-8 text-center">
          <p className="text-red-600 text-lg font-medium mb-4">
            No restaurant data found. Please go back.
          </p>
          <AdminButton
            variant="primary"
            onClick={() => navigate(-1)}
            icon={<ArrowLeft className="h-4 w-4" />}
          >
            Go Back
          </AdminButton>
        </AdminCard>
      </AdminLayout>
    );
  }

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.1,
        duration: 0.3 
      } 
    }
  };
  
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  // Status badge colors
  const statusColors = {
    pending: "bg-yellow-100 text-yellow-800 border border-yellow-300",
    active: "bg-green-100 text-green-800 border border-green-300",
    suspended: "bg-orange-100 text-orange-800 border border-orange-300",
    rejected: "bg-red-100 text-red-800 border border-red-300",
  };

  // Format status badge
  const StatusBadge = ({ status }) => (
    <span
      className={`px-3 py-1 text-xs font-medium rounded-full inline-block ${statusColors[status] || ""}`}
    >
      {status?.toUpperCase()}
    </span>
  );

  return (
    <AdminLayout 
      title="Verify Restaurant"
      description={restaurant.name}
      loading={loading}
      actions={
        <AdminButton
          variant="outline"
          onClick={() => navigate(-1)}
          icon={<ArrowLeft className="h-4 w-4" />}
        >
          Back
        </AdminButton>
      }
    >
      <motion.div
        className="space-y-8"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        {/* Restaurant Header Card */}
        <AdminCard className="p-6 border-l-4 border-primary-500">
          <motion.div 
            className="flex items-center gap-4 flex-wrap md:flex-nowrap"
            variants={itemVariants}
          >
            <div className="h-16 w-16 rounded-full bg-primary-100 flex items-center justify-center overflow-hidden border-2 border-primary-200">
              {restaurant.logo_images?.[0] ? (
                <img 
                  src={`/api/file/${restaurant.logo_images[0]}`} 
                  alt="Restaurant Logo" 
                  className="h-full w-full object-cover"
                />
              ) : (
                <ShoppingBag className="h-8 w-8 text-primary-500" />
              )}
            </div>
            <div className="flex-1">
              <h2 className="font-bold text-xl text-gray-800">{restaurant.name}</h2>
              <p className="text-sm text-gray-500">{restaurant?.cuisine_types || 'No cuisine types'}</p>
            </div>
            <div className="flex items-center gap-2">
              <StatusBadge status={restaurant.status} />
            </div>
          </motion.div>
        </AdminCard>
        
        <div className="space-y-8">

        {/* Basic Info */}
        <AdminCard>
          <motion.div variants={itemVariants} className="space-y-6">
            <div className="flex items-center gap-2 mb-4 border-b border-gray-100 pb-3">
              <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-600">
                <FileText className="h-5 w-5" />
              </div>
              <h2 className="text-lg font-bold text-gray-800">
                Basic Information
              </h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <motion.div 
                className="flex items-start gap-3 p-4 rounded-lg bg-gray-50 border border-gray-100 hover:shadow-md transition-all"
                variants={itemVariants}
              >
                <Mail className="h-5 w-5 text-primary-500 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Email</p>
                  <p className="font-medium text-gray-900 break-words">{restaurant.email || "N/A"}</p>
                </div>
              </motion.div>
              
              <motion.div 
                className="flex items-start gap-3 p-4 rounded-lg bg-gray-50 border border-gray-100 hover:shadow-md transition-all"
                variants={itemVariants}
              >
                <Phone className="h-5 w-5 text-green-500 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Phone</p>
                  <p className="font-medium text-gray-900">{restaurant.phone || "N/A"}</p>
                </div>
              </motion.div>
              
              <motion.div 
                className="flex items-start gap-3 p-4 rounded-lg bg-gray-50 border border-gray-100 hover:shadow-md transition-all"
                variants={itemVariants}
              >
                <Star className="h-5 w-5 text-yellow-500 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Rating</p>
                  <p className="font-medium text-gray-900 flex items-center gap-1">
                    {restaurant.rating || "0"} 
                    <span className="text-yellow-500 text-sm">★</span>
                  </p>
                </div>
              </motion.div>
              
              <motion.div 
                className="flex items-start gap-3 p-4 rounded-lg bg-gray-50 border border-gray-100 hover:shadow-md transition-all"
                variants={itemVariants}
              >
                <ShoppingBag className="h-5 w-5 text-purple-500 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Total Orders</p>
                  <p className="font-medium text-gray-900">{restaurant.total_orders || "0"}</p>
                </div>
              </motion.div>
            
            <motion.div 
              className="flex items-start gap-3 p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
              variants={itemVariants}
            >
              <Percent className="h-5 w-5 text-indigo-500 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-500">Commission</p>
                <p className="font-medium text-gray-900">{restaurant.commission_percentage || "0"}%</p>
              </div>
            </motion.div>
            
            <motion.div 
              className="flex items-start gap-3 p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
              variants={itemVariants}
            >
              <Calendar className="h-5 w-5 text-red-500 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-500">Registration Date</p>
                <p className="font-medium text-gray-900">
                  {restaurant.registration_date ? new Date(restaurant.registration_date).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : "N/A"}
                </p>
              </div>
            </motion.div>
          </div>
        </motion.div>
        </AdminCard>

        {/* Address */}
        <motion.section variants={itemVariants} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-6">
            <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center text-green-500">
              <MapPin className="h-5 w-5" />
            </div>
            <h2 className="text-xl font-bold text-gray-800">
              Restaurant Location
            </h2>
          </div>
          
          <div className="flex flex-col md:flex-row gap-6">
            <div className="md:w-1/3">
              <div className="p-4 bg-green-50 rounded-lg border border-green-100">
                <h3 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-green-500" /> Address Details
                </h3>
                <div className="space-y-2 text-gray-700">
                  <p className="font-medium">{restaurant.addresses?.[0]?.addressLine || "No address line"}</p>
                  <p>
                    {restaurant.addresses?.[0]?.city || "City"},{" "}
                    {restaurant.addresses?.[0]?.state || "State"} -{" "}
                    {restaurant.addresses?.[0]?.pincode || "Pincode"}
                  </p>
                </div>
                
                <div className="mt-4 pt-4 border-t border-green-200">
                  <h4 className="text-sm font-medium text-gray-700 mb-1">Coordinates</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="bg-white p-2 rounded border border-gray-200">
                      <span className="text-gray-500">Latitude</span>
                      <p className="font-mono font-medium">{restaurant.addresses?.[0]?.location?.coordinates[1]?.toFixed(6) || "N/A"}</p>
                    </div>
                    <div className="bg-white p-2 rounded border border-gray-200">
                      <span className="text-gray-500">Longitude</span>
                      <p className="font-mono font-medium">{restaurant.addresses?.[0]?.location?.coordinates[0]?.toFixed(6) || "N/A"}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="md:w-2/3 rounded-xl overflow-hidden shadow-md border border-gray-200">
              <MapComponent
                lat={restaurant.addresses?.[0]?.location?.coordinates[1]}
                lon={restaurant.addresses?.[0]?.location?.coordinates[0]}
              />
            </div>
          </div>
        </motion.section>

        {/* Documents */}
        <motion.section variants={itemVariants} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-6">
            <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-500">
              <FileText className="h-5 w-5" />
            </div>
            <h2 className="text-xl font-bold text-gray-800">
              Legal Documents
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <motion.div 
              className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
              variants={itemVariants}
              whileHover={{ y: -5 }}
            >
              <div className="bg-blue-50 p-4 border-b border-blue-100">
                <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                  <div className="h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-500">
                    <FileText className="h-4 w-4" />
                  </div>
                  FSSAI License
                </h3>
              </div>
              
              <div className="p-4">
                {restaurant.documents?.fssai ? (
                  <div className="space-y-4">
                    <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center">
                      <img 
                        src={`/api/file/${restaurant.documents.fssai}`}
                        alt="FSSAI License"
                        className="max-h-full max-w-full object-contain"
                      />
                    </div>
                    <a
                      href={`/api/file/${restaurant.documents.fssai}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block w-full py-2 bg-blue-500 hover:bg-blue-600 text-white text-center rounded-lg transition-colors font-medium"
                    >
                      View Full Document
                    </a>
                  </div>
                ) : (
                  <div className="py-8 text-center">
                    <p className="text-red-500 font-medium">Document Not Uploaded</p>
                    <p className="text-sm text-gray-500 mt-1">The restaurant has not provided this document</p>
                  </div>
                )}
              </div>
            </motion.div>
            
            <motion.div 
              className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
              variants={itemVariants}
              whileHover={{ y: -5 }}
            >
              <div className="bg-green-50 p-4 border-b border-green-100">
                <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                  <div className="h-6 w-6 rounded-full bg-green-100 flex items-center justify-center text-green-500">
                    <FileText className="h-4 w-4" />
                  </div>
                  GST Certificate
                </h3>
              </div>
              
              <div className="p-4">
                {restaurant.documents?.gst ? (
                  <div className="space-y-4">
                    <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center">
                      <img 
                        src={`/api/file/${restaurant.documents.gst}`}
                        alt="GST Certificate"
                        className="max-h-full max-w-full object-contain"
                      />
                    </div>
                    <a
                      href={`/api/file/${restaurant.documents.gst}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block w-full py-2 bg-green-500 hover:bg-green-600 text-white text-center rounded-lg transition-colors font-medium"
                    >
                      View Full Document
                    </a>
                  </div>
                ) : (
                  <div className="py-8 text-center">
                    <p className="text-red-500 font-medium">Document Not Uploaded</p>
                    <p className="text-sm text-gray-500 mt-1">The restaurant has not provided this document</p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </motion.section>

        {/* Images */}
        <motion.section variants={itemVariants} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-6">
            <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-500">
              <Image className="h-5 w-5" />
            </div>
            <h2 className="text-xl font-bold text-gray-800">
              Brand Images
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <motion.div 
              className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
              variants={itemVariants}
              whileHover={{ y: -5 }}
            >
              <div className="bg-purple-50 p-4 border-b border-purple-100">
                <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                  <div className="h-6 w-6 rounded-full bg-purple-100 flex items-center justify-center text-purple-500">
                    <Image className="h-4 w-4" />
                  </div>
                  Restaurant Logo
                </h3>
              </div>
              
              <div className="p-4">
                {restaurant.logo_images?.[0] ? (
                  <div className="space-y-4">
                    <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center p-4">
                      <img 
                        src={`/api/file/${restaurant.logo_images[0]}`}
                        alt="Restaurant Logo"
                        className="max-h-full max-w-full object-contain"
                      />
                    </div>
                    <a
                      href={`/api/file/${restaurant.logo_images[0]}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block w-full py-2 bg-purple-500 hover:bg-purple-600 text-white text-center rounded-lg transition-colors font-medium"
                    >
                      View Full Image
                    </a>
                  </div>
                ) : (
                  <div className="py-8 text-center">
                    <p className="text-red-500 font-medium">Image Not Uploaded</p>
                    <p className="text-sm text-gray-500 mt-1">The restaurant has not provided a logo</p>
                  </div>
                )}
              </div>
            </motion.div>
            
            <motion.div 
              className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
              variants={itemVariants}
              whileHover={{ y: -5 }}
            >
              <div className="bg-indigo-50 p-4 border-b border-indigo-100">
                <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                  <div className="h-6 w-6 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-500">
                    <Image className="h-4 w-4" />
                  </div>
                  Theme Image
                </h3>
              </div>
              
              <div className="p-4">
                {restaurant.theme_images?.[0] ? (
                  <div className="space-y-4">
                    <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center">
                      <img 
                        src={`/api/file/${restaurant.theme_images[0]}`}
                        alt="Theme Image"
                        className="max-h-full max-w-full object-contain"
                      />
                    </div>
                    <a
                      href={`/api/file/${restaurant.theme_images[0]}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block w-full py-2 bg-indigo-500 hover:bg-indigo-600 text-white text-center rounded-lg transition-colors font-medium"
                    >
                      View Full Image
                    </a>
                  </div>
                ) : (
                  <div className="py-8 text-center">
                    <p className="text-red-500 font-medium">Image Not Uploaded</p>
                    <p className="text-sm text-gray-500 mt-1">The restaurant has not provided a theme image</p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </motion.section>

        {/* Menu Images */}
        <motion.section variants={itemVariants} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-6">
            <div className="h-8 w-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-500">
              <Menu className="h-5 w-5" />
            </div>
            <h2 className="text-xl font-bold text-gray-800">
              Menu Gallery
            </h2>
          </div>
          
          {restaurant.menu_images?.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {restaurant.menu_images.map((imageId, index) => (
                <motion.div 
                  key={index}
                  className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all"
                  variants={itemVariants}
                  whileHover={{ y: -5, scale: 1.02 }}
                >
                  <div className="aspect-video bg-gray-100 overflow-hidden">
                    <img 
                      src={`/api/file/${imageId}`}
                      alt={`Menu Image ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  <div className="p-3 bg-gradient-to-r from-amber-50 to-orange-50 border-t border-amber-100">
                    <div className="flex justify-between items-center">
                      <h3 className="font-medium text-gray-800 flex items-center gap-1">
                        <Menu className="h-3.5 w-3.5 text-amber-500" />
                        Menu Image {index + 1}
                      </h3>
                      
                      <a
                        href={`/api/file/${imageId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm font-medium text-amber-600 hover:text-amber-700 flex items-center gap-1"
                      >
                        View
                      </a>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="bg-amber-50 rounded-xl p-8 text-center border border-amber-100">
              <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-amber-100 text-amber-500 mb-4">
                <Image className="h-8 w-8" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">No Menu Images Available</h3>
              <p className="text-gray-600">The restaurant has not uploaded any menu images yet.</p>
            </div>
          )}
        </motion.section>

        {/* Admin Action */}
        <AdminCard>
          <motion.div variants={itemVariants} className="space-y-6">
            <div className="flex items-center gap-2 mb-4 border-b border-gray-100 pb-3">
              <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-600">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <h2 className="text-lg font-bold text-gray-800">
                Admin Verification
              </h2>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="mb-6">
                <label
                  htmlFor="remarks"
                  className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2"
                >
                  <MessageSquare className="h-4 w-4 text-primary-500" />
                  Verification Remarks
                </label>
                <textarea
                  id="remarks"
                  rows="4"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 shadow-sm"
                  placeholder="Add any remarks, feedback or notes about this restaurant verification..."
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                />
                <p className="mt-2 text-xs text-gray-500">These remarks will be visible to the restaurant owner</p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <AdminButton
                  variant="success"
                  size="lg"
                  className="flex-1"
                  onClick={() => handleAction("active")}
                  disabled={loading}
                  icon={loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <CheckCircle className="h-5 w-5" />}
                >
                  {loading ? "Processing..." : "Approve Restaurant"}
                ) : (
                </AdminButton>
                
                <AdminButton
                  variant="danger"
                  size="lg"
                  className="flex-1"
                  onClick={() => handleAction("rejected")}
                  disabled={loading}
                  icon={loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <XCircle className="h-5 w-5" />}
                >
                  {loading ? "Processing..." : "Reject Restaurant"}
                </AdminButton>
              </div>
            </div>
          </motion.div>
        </AdminCard>
      </div>
      </motion.div>
    </AdminLayout>
  );
};

const Info = ({ label, value, icon }) => (
  <div className="mb-2 flex items-start gap-2">
    {icon && <span className="text-gray-500 mt-0.5">{icon}</span>}
    <div>
      <span className="font-medium text-gray-700 block">{label}</span>
      <span className="text-gray-900">{value || "N/A"}</span>
    </div>
  </div>
);

const DocumentItem = ({ label, url, icon, color = "blue" }) => {
  const colorClasses = {
    blue: {
      bg: "bg-blue-50",
      border: "border-blue-100",
      text: "text-blue-500",
      button: "bg-blue-500 hover:bg-blue-600",
    },
    green: {
      bg: "bg-green-50",
      border: "border-green-100",
      text: "text-green-500",
      button: "bg-green-500 hover:bg-green-600",
    },
    amber: {
      bg: "bg-amber-50",
      border: "border-amber-100",
      text: "text-amber-500",
      button: "bg-amber-500 hover:bg-amber-600",
    },
    purple: {
      bg: "bg-purple-50",
      border: "border-purple-100",
      text: "text-purple-500",
      button: "bg-purple-500 hover:bg-purple-600",
    },
  };
  
  const colors = colorClasses[color] || colorClasses.blue;
  
  return (
    <motion.div 
      className={`bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow`}
      whileHover={{ y: -5 }}
    >
      <div className={`${colors.bg} p-4 border-b ${colors.border}`}>
        <h3 className="font-semibold text-gray-800 flex items-center gap-2">
          {icon && (
            <div className={`h-6 w-6 rounded-full ${colors.bg} flex items-center justify-center ${colors.text}`}>
              {icon}
            </div>
          )}
          {label}
        </h3>
      </div>
      
      <div className="p-4">
        {url ? (
          <div className="space-y-4">
            <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center">
              <img 
                src={url}
                alt={label}
                className="max-h-full max-w-full object-contain"
              />
            </div>
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className={`block w-full py-2 ${colors.button} text-white text-center rounded-lg transition-colors font-medium`}
            >
              View Full Document
            </a>
          </div>
        ) : (
          <div className="py-8 text-center">
            <p className="text-red-500 font-medium">Document Not Uploaded</p>
            <p className="text-sm text-gray-500 mt-1">This document is not available</p>
          </div>
        )}
      </div>
    </motion.div>
  );
};

const ImagePreview = ({ title, imageId, icon, color = "purple" }) => {
  const colorClasses = {
    blue: {
      bg: "bg-blue-50",
      border: "border-blue-100",
      text: "text-blue-500",
      button: "bg-blue-500 hover:bg-blue-600",
    },
    green: {
      bg: "bg-green-50",
      border: "border-green-100",
      text: "text-green-500",
      button: "bg-green-500 hover:bg-green-600",
    },
    amber: {
      bg: "bg-amber-50",
      border: "border-amber-100",
      text: "text-amber-500",
      button: "bg-amber-500 hover:bg-amber-600",
    },
    purple: {
      bg: "bg-purple-50",
      border: "border-purple-100",
      text: "text-purple-500",
      button: "bg-purple-500 hover:bg-purple-600",
    },
    indigo: {
      bg: "bg-indigo-50",
      border: "border-indigo-100",
      text: "text-indigo-500",
      button: "bg-indigo-500 hover:bg-indigo-600",
    },
  };
  
  const colors = colorClasses[color] || colorClasses.purple;
  
  return (
    <motion.div 
      className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all"
      whileHover={{ y: -5, scale: 1.02 }}
    >
      <div className="aspect-video bg-gray-100 overflow-hidden">
        {imageId ? (
          <img 
            src={`/api/file/${imageId}`}
            alt={title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="h-full w-full flex flex-col items-center justify-center">
            <Image className="h-8 w-8 text-gray-400 mb-2" />
            <p className="text-gray-500 text-sm">No image available</p>
          </div>
        )}
      </div>
      
      <div className={`p-3 ${colors.bg} border-t ${colors.border}`}>
        <div className="flex justify-between items-center">
          <h3 className="font-medium text-gray-800 flex items-center gap-1">
            {icon || <Image className={`h-3.5 w-3.5 ${colors.text}`} />}
            {title}
          </h3>
          
          {imageId && (
            <a
              href={`/api/file/${imageId}`}
              target="_blank"
              rel="noopener noreferrer"
              className={`text-sm font-medium ${colors.text} hover:underline flex items-center gap-1`}
            >
              View
            </a>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default VerifyRestaurant;
