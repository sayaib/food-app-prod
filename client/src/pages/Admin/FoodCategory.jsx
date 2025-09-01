import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { FiPlus, FiTrash2, FiGlobe, FiMapPin, FiGrid } from "react-icons/fi";
import { Utensils, MapPin, Globe, Building2 } from "lucide-react";

import AdminLayout, { AdminButton } from "../../components/Admin/AdminLayout";
import AdminCard, { AdminCardGrid } from "../../components/Admin/AdminCard";

const API = "/api/menu";

const FoodCategoryDashboard = () => {
  const [categories, setCategories] = useState([]);
  const [countries, setCountries] = useState([]);
  const [cities, setCities] = useState([]);
  const [cuisineTypes, setCuisineTypes] = useState([]);
  const [name, setName] = useState("");
  const [countryName, setCountryName] = useState("");
  const [cityName, setCityName] = useState("");
  const [cuisineName, setCuisineName] = useState("");
  const [activeTab, setActiveTab] = useState("categories");

  const fetchCategories = async () => {
    const res = await fetch(`${API}/get-category`);
    const { data } = await res.json();
    setCategories(data);
  };

  const fetchCountries = async () => {
    try {
      const response = await fetch('/api/menu/get-countries');
      const data = await response.json();
      if (data.success) {
        setCountries(data.data);
      }
    } catch (error) {
      console.error('Error fetching countries:', error);
      toast.error('Failed to fetch countries');
    }
  };

  const fetchCities = async () => {
    try {
      const response = await fetch('/api/menu/get-cities');
      const data = await response.json();
      if (data.success) {
        setCities(data.data);
      }
    } catch (error) {
      console.error('Error fetching cities:', error);
      toast.error('Failed to fetch cities');
    }
  };

  const fetchCuisineTypes = async () => {
    try {
      const response = await fetch('/api/menu/get-cuisines');
      const data = await response.json();
      if (data.success) {
        setCuisineTypes(data.data);
      }
    } catch (error) {
      console.error('Error fetching cuisine types:', error);
      toast.error('Failed to fetch cuisine types');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    const res = await fetch(`${API}/add-category`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    await res.json();
    setName("");
    fetchCategories();
    toast.success("Category added successfully!");
  };

  const handleCountrySubmit = async (e) => {
    e.preventDefault();
    if (!countryName.trim()) return;
    
    try {
      const response = await fetch('/api/menu/add-country', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          name: countryName,
          code: countryName.substring(0, 2).toUpperCase()
        }),
      });
      const data = await response.json();
      if (data.success) {
        setCountries([...countries, data.data]);
        setCountryName('');
        toast.success('Country added successfully!');
      } else {
        toast.error(data.msg || 'Failed to add country');
      }
    } catch (error) {
      console.error('Error adding country:', error);
      toast.error('Failed to add country');
    }
  };

  const handleCitySubmit = async (e) => {
    e.preventDefault();
    if (!cityName.trim()) return;
    
    try {
      // For now, we'll use the first country as default
      // In a real app, you'd have a country selector
      const defaultCountry = countries[0]?._id;
      if (!defaultCountry) {
        toast.error('Please add a country first');
        return;
      }

      const response = await fetch('/api/menu/add-city', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          name: cityName,
          country: defaultCountry,
          state: 'Unknown'
        }),
      });
      const data = await response.json();
      if (data.success) {
        // Fetch cities again to get populated country data
        fetchCities();
        setCityName('');
        toast.success('City added successfully!');
      } else {
        toast.error(data.msg || 'Failed to add city');
      }
    } catch (error) {
      console.error('Error adding city:', error);
      toast.error('Failed to add city');
    }
  };

  const handleCuisineSubmit = async (e) => {
    e.preventDefault();
    if (!cuisineName.trim()) return;
    
    try {
      const response = await fetch('/api/menu/add-cuisine', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          name: cuisineName,
          description: `Traditional ${cuisineName} cuisine`,
          origin: 'Unknown'
        }),
      });
      const data = await response.json();
      if (data.success) {
        setCuisineTypes([...cuisineTypes, data.data]);
        setCuisineName('');
        toast.success('Cuisine type added successfully!');
      } else {
        toast.error(data.msg || 'Failed to add cuisine type');
      }
    } catch (error) {
      console.error('Error adding cuisine type:', error);
      toast.error('Failed to add cuisine type');
    }
  };

  const handleDelete = async (id) => {
    const confirmDelete = confirm(
      "Are you sure you want to delete this category?"
    );
    if (!confirmDelete) return;

    await fetch(`${API}/delete-category/${id}`, { method: "DELETE" });
    fetchCategories();
    toast.success("Category deleted successfully!");
  };

  const handleCountryDelete = async (id) => {
    const confirmDelete = confirm(
      "Are you sure you want to delete this country?"
    );
    if (!confirmDelete) return;
    
    try {
      const response = await fetch(`/api/menu/delete-country/${id}`, {
        method: 'DELETE',
      });
      const data = await response.json();
      if (data.success) {
        setCountries(countries.filter(country => country._id !== id));
        toast.success('Country deleted successfully!');
      } else {
        toast.error(data.msg || 'Failed to delete country');
      }
    } catch (error) {
      console.error('Error deleting country:', error);
      toast.error('Failed to delete country');
    }
  };

  const handleCityDelete = async (id) => {
    const confirmDelete = confirm(
      "Are you sure you want to delete this city?"
    );
    if (!confirmDelete) return;
    
    try {
      const response = await fetch(`/api/menu/delete-city/${id}`, {
        method: 'DELETE',
      });
      const data = await response.json();
      if (data.success) {
        setCities(cities.filter(city => city._id !== id));
        toast.success('City deleted successfully!');
      } else {
        toast.error(data.msg || 'Failed to delete city');
      }
    } catch (error) {
      console.error('Error deleting city:', error);
      toast.error('Failed to delete city');
    }
  };

  const handleCuisineDelete = async (id) => {
    const confirmDelete = confirm(
      "Are you sure you want to delete this cuisine type?"
    );
    if (!confirmDelete) return;
    
    try {
      const response = await fetch(`/api/menu/delete-cuisine/${id}`, {
        method: 'DELETE',
      });
      const data = await response.json();
      if (data.success) {
        setCuisineTypes(cuisineTypes.filter(cuisine => cuisine._id !== id));
        toast.success('Cuisine type deleted successfully!');
      } else {
        toast.error(data.msg || 'Failed to delete cuisine type');
      }
    } catch (error) {
      console.error('Error deleting cuisine type:', error);
      toast.error('Failed to delete cuisine type');
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchCountries();
    fetchCities();
    fetchCuisineTypes();
  }, []);

  const tabs = [
    { id: 'categories', label: 'Food Categories', icon: <Utensils className="h-4 w-4" />, count: categories.length },
    { id: 'countries', label: 'Countries', icon: <Globe className="h-4 w-4" />, count: countries.length },
    { id: 'cities', label: 'Cities', icon: <MapPin className="h-4 w-4" />, count: cities.length },
    { id: 'cuisines', label: 'Cuisine Types', icon: <FiGrid className="h-4 w-4" />, count: cuisineTypes.length }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'categories':
        return (
          <>
            {/* Add Category Form */}
            <AdminCard className="mb-6">
              <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                <FiPlus className="text-red-600" />
                Add New Category
              </h3>
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  placeholder="Category Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="flex-grow px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 shadow-sm"
                />
                <AdminButton
                  variant="primary"
                  onClick={handleSubmit}
                  icon={<FiPlus className="h-5 w-5" />}
                >
                  Add Category
                </AdminButton>
              </div>
            </AdminCard>

            {/* Categories Grid */}
            <AdminCardGrid>
              {categories.length > 0 ? (
                categories.map((cat) => (
                  <div
                    key={cat._id}
                    className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 flex justify-between items-center hover:shadow-md transition-all duration-200 group hover:border-red-200"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-red-50 rounded-lg">
                        <Utensils className="h-4 w-4 text-red-600" />
                      </div>
                      <span className="font-medium text-gray-800">{cat.name}</span>
                    </div>
                    <button
                      onClick={() => handleDelete(cat._id)}
                      className="text-gray-400 hover:text-red-500 focus:outline-none transition-colors duration-200 opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-red-50"
                      aria-label={`Delete ${cat.name} category`}
                    >
                      <FiTrash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))
              ) : (
                <div className="col-span-full text-center py-12 text-gray-500 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border border-gray-200">
                  <Utensils className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-600 mb-2">No categories found</h3>
                  <p className="text-sm text-gray-500">Add your first category above to get started.</p>
                </div>
              )}
            </AdminCardGrid>
          </>
        );
      
      case 'countries':
        return (
          <>
            {/* Add Country Form */}
            <AdminCard className="mb-6">
              <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                <FiPlus className="text-blue-600" />
                Add New Country
              </h3>
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  placeholder="Country Name"
                  value={countryName}
                  onChange={(e) => setCountryName(e.target.value)}
                  className="flex-grow px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                />
                <AdminButton
                  variant="primary"
                  onClick={handleCountrySubmit}
                  icon={<FiPlus className="h-5 w-5" />}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Add Country
                </AdminButton>
              </div>
            </AdminCard>

            {/* Countries Grid */}
            <AdminCardGrid>
              {countries.length > 0 ? (
                countries.map((country) => (
                  <div
                    key={country._id}
                    className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 flex justify-between items-center hover:shadow-md transition-all duration-200 group hover:border-blue-200"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-50 rounded-lg">
                        <Globe className="h-4 w-4 text-blue-600" />
                      </div>
                      <span className="font-medium text-gray-800">{country.name}</span>
                    </div>
                    <button
                      onClick={() => handleCountryDelete(country._id)}
                      className="text-gray-400 hover:text-red-500 focus:outline-none transition-colors duration-200 opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-red-50"
                      aria-label={`Delete ${country.name} country`}
                    >
                      <FiTrash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))
              ) : (
                <div className="col-span-full text-center py-12 text-gray-500 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200">
                  <Globe className="h-12 w-12 text-blue-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-600 mb-2">No countries found</h3>
                  <p className="text-sm text-gray-500">Add your first country above to get started.</p>
                </div>
              )}
            </AdminCardGrid>
          </>
        );
      
      case 'cities':
        return (
          <>
            {/* Add City Form */}
            <AdminCard className="mb-6">
              <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                <FiPlus className="text-green-600" />
                Add New City
              </h3>
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  placeholder="City Name"
                  value={cityName}
                  onChange={(e) => setCityName(e.target.value)}
                  className="flex-grow px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 shadow-sm"
                />
                <AdminButton
                  variant="primary"
                  onClick={handleCitySubmit}
                  icon={<FiPlus className="h-5 w-5" />}
                  className="bg-green-600 hover:bg-green-700"
                >
                  Add City
                </AdminButton>
              </div>
            </AdminCard>

            {/* Cities Grid */}
            <AdminCardGrid>
              {cities.length > 0 ? (
                cities.map((city) => (
                  <div
                    key={city._id}
                    className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 flex justify-between items-center hover:shadow-md transition-all duration-200 group hover:border-green-200"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-green-50 rounded-lg">
                        <MapPin className="h-4 w-4 text-green-600" />
                      </div>
                      <span className="font-medium text-gray-800">{city.name}</span>
                    </div>
                    <button
                      onClick={() => handleCityDelete(city._id)}
                      className="text-gray-400 hover:text-red-500 focus:outline-none transition-colors duration-200 opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-red-50"
                      aria-label={`Delete ${city.name} city`}
                    >
                      <FiTrash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))
              ) : (
                <div className="col-span-full text-center py-12 text-gray-500 bg-gradient-to-br from-green-50 to-green-100 rounded-xl border border-green-200">
                  <MapPin className="h-12 w-12 text-green-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-600 mb-2">No cities found</h3>
                  <p className="text-sm text-gray-500">Add your first city above to get started.</p>
                </div>
              )}
            </AdminCardGrid>
          </>
        );
      
      case 'cuisines':
        return (
          <>
            {/* Add Cuisine Form */}
            <AdminCard className="mb-6">
              <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                <FiPlus className="text-purple-600" />
                Add New Cuisine Type
              </h3>
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  placeholder="Cuisine Type Name"
                  value={cuisineName}
                  onChange={(e) => setCuisineName(e.target.value)}
                  className="flex-grow px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 shadow-sm"
                />
                <AdminButton
                  variant="primary"
                  onClick={handleCuisineSubmit}
                  icon={<FiPlus className="h-5 w-5" />}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  Add Cuisine
                </AdminButton>
              </div>
            </AdminCard>

            {/* Cuisines Grid */}
            <AdminCardGrid>
              {cuisineTypes.length > 0 ? (
                cuisineTypes.map((cuisine) => (
                  <div
                    key={cuisine._id}
                    className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 flex justify-between items-center hover:shadow-md transition-all duration-200 group hover:border-purple-200"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-purple-50 rounded-lg">
                        <FiGrid className="h-4 w-4 text-purple-600" />
                      </div>
                      <span className="font-medium text-gray-800">{cuisine.name}</span>
                    </div>
                    <button
                      onClick={() => handleCuisineDelete(cuisine._id)}
                      className="text-gray-400 hover:text-red-500 focus:outline-none transition-colors duration-200 opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-red-50"
                      aria-label={`Delete ${cuisine.name} cuisine`}
                    >
                      <FiTrash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))
              ) : (
                <div className="col-span-full text-center py-12 text-gray-500 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl border border-purple-200">
                  <FiGrid className="h-12 w-12 text-purple-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-600 mb-2">No cuisine types found</h3>
                  <p className="text-sm text-gray-500">Add your first cuisine type above to get started.</p>
                </div>
              )}
            </AdminCardGrid>
          </>
        );
      
      default:
        return null;
    }
  };

  return (
    <AdminLayout
      title="Food Management Dashboard"
      description="Manage food categories, countries, cities, and cuisine types"
      loading={false}
    >
      {/* Enhanced Tab Navigation */}
      <div className="mb-8">
        <div className="border-b border-gray-200 bg-white rounded-t-xl">
          <nav className="-mb-px flex space-x-8 px-6 py-4" aria-label="Tabs">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`${
                  activeTab === tab.id
                    ? 'border-red-500 text-red-600 bg-red-50'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                } whitespace-nowrap py-3 px-4 border-b-2 font-medium text-sm rounded-t-lg transition-all duration-200 flex items-center gap-2`}
              >
                {tab.icon}
                {tab.label}
                <span className={`${
                  activeTab === tab.id ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600'
                } ml-2 py-0.5 px-2 rounded-full text-xs font-medium`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      <div className="animate-fade-in">
        {renderTabContent()}
      </div>
    </AdminLayout>
  );
};

export default FoodCategoryDashboard;
