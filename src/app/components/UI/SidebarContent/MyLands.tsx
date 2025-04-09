/**
 * MyLands.tsx
 * 
 * Component for displaying and managing user-owned lands/tiles
 * Allows viewing details, upgrading resources, and managing lands
 */

import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import apiService from "@/services/apiService";
import tileGenerationService from "@/services/tileGenerationService";

// Resource type interfaces
interface Farm {
  level: number;
  yield: number;
  fertility: number;
  lastHarvested: string | null;
}

interface Mine {
  level: number;
  yield: number;
  richness: number;
  depletionRate: number;
  lastHarvested: string | null;
}

interface OilField {
  level: number;
  yield: number;
  capacity: number;
  depletionRate: number;
  lastHarvested: string | null;
}

// Land/Tile interface with resources
interface LandTile {
  id: string;
  name?: string;
  location: {
    x: number;
    y: number;
  };
  biomeType: string;
  terrainType: string;
  acquiredDate: string;
  resources: {
    fertility: number;
    mineralWealth: number;
    oilPotential: number;
    availableResources: string[];
    farm?: Farm;
    mine?: Mine;
    oilField?: OilField;
  };
  color: {
    r: number;
    g: number;
    b: number;
  };
}

// API response interfaces
interface LandsResponse {
  lands: any[];
  [key: string]: any;
}

interface ResourceActionResponse {
  success: boolean;
  data?: {
    amount: number;
    resourceType: string;
  };
  message?: string;
  error?: string;
  [key: string]: any;
}

// Component states
type TabType = "lands" | "collection";
type ResourceTabType = "info" | "resources" | "actions" | "upgrades";
type ResourceActionType = "harvest" | "upgrade" | "build" | "destroy";

const MyLands: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>("lands");
  const [activeResourceTab, setActiveResourceTab] = useState<ResourceTabType>("info");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [lands, setLands] = useState<LandTile[]>([]);
  const [selectedLand, setSelectedLand] = useState<LandTile | null>(null);
  const [currentAction, setCurrentAction] = useState<ResourceActionType | null>(null);
  const [worldMapRef, setWorldMapRef] = useState<any>(null);

  // Fetch user's lands from the API
  const fetchLands = useCallback(async () => {
    if (!user) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Step 1: Get all lands owned by the current user
      const response = await apiService.get<{ lands: any[] }>('/api/land/me');
      
      if (response && Array.isArray(response.lands)) {
        // Step 2: Fetch detailed resource information for each land
        const landsWithResources = await Promise.all(
          response.lands.map(async (land) => {
            try {
              // Get detailed resource information for this land
              const resourcesResponse = await apiService.get<any>(`/api/tiles/${land._id || land.id}/resources`);
              
              // Combine land data with resource data
              return {
                id: land._id || land.id,
                name: land.name || `${land.biomeType} at (${land.location.x}, ${land.location.y})`,
                location: land.location,
                biomeType: land.biomeType,
                terrainType: land.terrainType || 'Unknown',
                acquiredDate: land.createdAt || new Date().toISOString(),
                resources: resourcesResponse.data || {
                  fertility: land.resources?.fertility || 0,
                  mineralWealth: land.resources?.mineralWealth || 0,
                  oilPotential: land.resources?.oilPotential || 0,
                  availableResources: land.resources?.availableResources || [],
                  farm: land.resources?.farm || null,
                  mine: land.resources?.mine || null,
                  oilField: land.resources?.oilField || null
                },
                color: land.visualData?.color || { r: 100, g: 100, b: 100 }
              };
            } catch (err) {
              console.error(`Error fetching resources for land ${land._id || land.id}:`, err);
              // Return land with default resource values if resource fetch fails
              return {
                id: land._id || land.id,
                name: land.name || `${land.biomeType} at (${land.location.x}, ${land.location.y})`,
                location: land.location,
                biomeType: land.biomeType,
                terrainType: land.terrainType || 'Unknown',
                acquiredDate: land.createdAt || new Date().toISOString(),
                resources: {
                  fertility: land.resources?.fertility || 0,
                  mineralWealth: land.resources?.mineralWealth || 0,
                  oilPotential: land.resources?.oilPotential || 0,
                  availableResources: land.resources?.availableResources || [],
                  farm: land.resources?.farm || null,
                  mine: land.resources?.mine || null,
                  oilField: land.resources?.oilField || null
                },
                color: land.visualData?.color || { r: 100, g: 100, b: 100 }
              };
            }
          })
        );
        
        setLands(landsWithResources);
      } else {
        // Handle empty response
        setLands([]);
      }
    } catch (err: any) {
      console.error("Error fetching lands:", err);
      setError(err.message || "Failed to fetch your lands");
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Handle resource actions (harvest, upgrade, etc)
  const handleResourceAction = useCallback(async (land: LandTile, resourceType: string, action: ResourceActionType) => {
    if (!land || !resourceType) return;
    
    setCurrentAction(action);
    
    try {
      // Different API calls based on action type
      if (action === 'harvest') {
        // POST /api/tiles/:tileId/resources/harvest
        const result = await apiService.post<ResourceActionResponse>(`/api/tiles/${land.id}/resources/harvest`, {
          resourceType: resourceType.toLowerCase()
        });
        
        // If successful, refresh the land data
        if (result.success) {
          await fetchLands();
          alert(`Harvested ${result.data?.amount || 0} ${resourceType}`);
        }
      } else if (action === 'upgrade') {
        // For upgrades, we use the generic resource endpoint
        const result = await apiService.post<ResourceActionResponse>(`/api/tiles/${land.id}/resources/${resourceType.toLowerCase()}/upgrade`, {});
        
        // If successful, refresh the land data
        if (result.success) {
          await fetchLands();
          alert(`Upgraded ${resourceType}`);
        }
      } else if (action === 'build') {
        // POST /api/tiles/:tileId/resources/initialize with specific resource type
        const result = await apiService.post<ResourceActionResponse>(`/api/tiles/${land.id}/resources/initialize`, {
          resourceTypes: [resourceType.toUpperCase()]  // Using uppercase to match the backend enum format
        });
        
        // If successful, refresh the land data
        if (result.success) {
          await fetchLands();
          alert(`Built ${resourceType}`);
        }
      }
    } catch (err: any) {
      console.error(`Error performing ${action} on ${resourceType}:`, err);
      alert(`Failed to ${action} ${resourceType}: ${err.message}`);
    } finally {
      setCurrentAction(null);
    }
  }, [fetchLands]);

  // Update resource yields for a specific land
  const updateResourceYields = useCallback(async (land: LandTile) => {
    if (!land) return;
    
    try {
      // Call the update yields endpoint for this specific tile
      const result = await apiService.post<ResourceActionResponse>(`/api/tiles/${land.id}/resources/update`, {});
      
      if (result.success) {
        // After updating yields, fetch the latest resource data for this specific land
        const resourcesResponse = await apiService.get<any>(`/api/tiles/${land.id}/resources`);
        
        if (resourcesResponse && resourcesResponse.data) {
          // Update only this land's resources in the state
          setLands(prevLands => 
            prevLands.map(prevLand => 
              prevLand.id === land.id 
                ? { ...prevLand, resources: resourcesResponse.data } 
                : prevLand
            )
          );
          console.log('Updated resource yields for land', land.id);
        }
      }
    } catch (err: any) {
      console.error('Error updating resource yields:', err);
    }
  }, []);

  // Load lands when component mounts or user changes
  useEffect(() => {
    fetchLands();
  }, [fetchLands]);
  
  // Update resource yields for the selected land when it changes
  useEffect(() => {
    if (selectedLand) {
      updateResourceYields(selectedLand);
    }
  }, [selectedLand, updateResourceYields]);

  // Determine a color for land tiles based on biome type
  const getLandColor = (biomeType: string): string => {
    switch (biomeType.toLowerCase()) {
      case 'desert':
        return 'bg-yellow-200';
      case 'grassland':
      case 'plains':
        return 'bg-green-300';
      case 'forest':
        return 'bg-green-600';
      case 'mountains':
        return 'bg-gray-500';
      case 'beach':
      case 'coastal':
        return 'bg-yellow-100';
      case 'rainforest':
        return 'bg-green-500';
      case 'taiga':
        return 'bg-emerald-700';
      case 'tundra':
        return 'bg-blue-100';
      case 'snow':
        return 'bg-white';
      case 'marsh':
      case 'swamp':
        return 'bg-green-700';
      case 'volcanic':
        return 'bg-red-800';
      case 'savanna':
        return 'bg-amber-300';
      default:
        return 'bg-gray-300';
    }
  };

  // Handle zooming to a land on the world map
  const handleZoomToLand = useCallback((land: LandTile) => {
    if (window && typeof window.dispatchEvent === 'function') {
      // Create a custom event to communicate with WorldMap
      const zoomEvent = new CustomEvent('zoomToTile', {
        detail: { x: land.location.x, y: land.location.y }
      });
      window.dispatchEvent(zoomEvent);
    }
  }, []);

  // Calculate next harvest time
  const getNextHarvestTime = (lastHarvested: string | null, resourceType: string): string => {
    if (!lastHarvested) return 'Ready to harvest';
    
    const lastHarvestedDate = new Date(lastHarvested);
    const now = new Date();
    
    // Different cooling periods based on resource type
    let cooldownHours = 0;
    if (resourceType === 'farm') {
      cooldownHours = 24; // 24 hours for farms
    } else if (resourceType === 'mine') {
      cooldownHours = 48; // 48 hours for mines
    } else if (resourceType === 'oilField') {
      cooldownHours = 72; // 72 hours for oil fields
    }
    
    const nextHarvestDate = new Date(lastHarvestedDate);
    nextHarvestDate.setHours(nextHarvestDate.getHours() + cooldownHours);
    
    if (nextHarvestDate <= now) {
      return 'Ready to harvest';
    }
    
    // Calculate remaining time
    const diffMs = nextHarvestDate.getTime() - now.getTime();
    const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    return `Ready in ${diffHrs}h ${diffMins}m`;
  };

  return (
    <div className="font-pixel text-xs">
      <h1 className="pixel-heading text-sm mb-3">My Lands</h1>
      
      {/* Tab Navigation */}
      <div className="mb-3 flex">
        <button
          className={`flex-1 py-1 text-xxs ${
            activeTab === "lands"
              ? "bg-yellow-700 text-yellow-100"
              : "bg-yellow-200 text-yellow-900"
          }`}
          onClick={() => setActiveTab("lands")}
        >
          My Lands
        </button>
        <button
          className={`flex-1 py-1 text-xxs ${
            activeTab === "collection"
              ? "bg-yellow-700 text-yellow-100"
              : "bg-yellow-200 text-yellow-900"
          }`}
          onClick={() => setActiveTab("collection")}
        >
          Collection
        </button>
      </div>
      
      {/* Loading indicator */}
      {isLoading && (
        <div className="text-center py-8">
          <div className="w-8 h-8 border-2 border-yellow-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          <p className="text-yellow-800">Loading your lands...</p>
        </div>
      )}
      
      {/* Error message */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p>{error}</p>
        </div>
      )}

      {/* Main content based on active tab */}
      {!isLoading && !error && (
        <>
          {activeTab === "lands" && (
            <div>
              {/* Lands count summary */}
              <div className="mb-4 text-center">
                <div className="bg-yellow-100/50 border-2 border-yellow-900 inline-block px-3 py-1 rounded">
                  <span className="text-yellow-900">You own {lands.length} {lands.length === 1 ? 'land' : 'lands'}</span>
                </div>
              </div>
              
              {/* Lands list */}
              {lands.length === 0 ? (
                <div className="text-center py-6 bg-yellow-100/30 border-2 border-yellow-800 rounded">
                  <p className="mb-2 text-yellow-900">You don't own any lands yet!</p>
                  <button 
                    className="px-3 py-1 bg-yellow-600 text-yellow-100 rounded border-2 border-yellow-800"
                    onClick={() => setActiveTab("collection")}
                  >
                    Explore the Collection
                  </button>
                </div>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto px-1 pixel-scroll">
                  {lands.map((land) => (
                    <div
                      key={land.id}
                      className={`p-2 border-2 border-yellow-800 ${
                        selectedLand?.id === land.id 
                          ? 'bg-yellow-200/80' 
                          : 'bg-yellow-100/50'
                      } cursor-pointer hover:bg-yellow-200/50 transition-colors`}
                      onClick={() => setSelectedLand(land)}
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-8 h-8 border-1 border-yellow-900 ${getLandColor(land.biomeType)} flex items-center justify-center`}
                        >
                          <span className="text-yellow-900 text-xxs">
                            {land.biomeType.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        
                        <div className="flex-1 overflow-hidden">
                          <h3 className="truncate text-yellow-900 font-medium">
                            {land.name || `Land #${land.id.substring(0, 6)}`}
                          </h3>
                          <p className="text-xxs text-yellow-800 truncate">
                            {land.biomeType.charAt(0).toUpperCase() + land.biomeType.slice(1)} at ({land.location.x}, {land.location.y})
                          </p>
                        </div>
                      </div>
                      
                      {/* Resources indicators */}
                      <div className="flex gap-1 mt-1">
                        {land.resources.availableResources?.includes("FARM") && (
                          <div className="bg-green-500 w-2 h-2 rounded-full" title="Has Farm"></div>
                        )}
                        {land.resources.availableResources?.includes("MINE") && (
                          <div className="bg-gray-500 w-2 h-2 rounded-full" title="Has Mine"></div>
                        )}
                        {land.resources.availableResources?.includes("OIL_FIELD") && (
                          <div className="bg-black w-2 h-2 rounded-full" title="Has Oil Field"></div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              {/* Selected land details */}
              {selectedLand && (
                <div className="mt-4 border-t-2 border-yellow-800 pt-4">
                  {/* Land detail header with back button */}
                  <div className="flex justify-between items-start mb-3">
                    <h2 className="text-sm text-yellow-900 font-bold truncate flex-1">
                      {selectedLand.name}
                    </h2>
                    <button
                      className="bg-yellow-800 text-yellow-100 w-5 h-5 flex items-center justify-center"
                      onClick={() => setSelectedLand(null)}
                    >
                      ×
                    </button>
                  </div>
                  
                  {/* Land information panel */}
                  <div className="flex flex-col sm:flex-row gap-3 mb-3">
                    <div
                      className={`w-20 h-20 mx-auto sm:mx-0 border-2 border-yellow-900 ${getLandColor(selectedLand.biomeType)}`}
                    >
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-yellow-900 text-xs">
                          {selectedLand.biomeType.charAt(0).toUpperCase() + selectedLand.biomeType.slice(1)}
                        </span>
                      </div>
                    </div>

                    <div className="flex-1">
                      <div className="grid grid-cols-2 gap-1 text-xxs">
                        <div>Type:</div>
                        <div className="text-yellow-900 capitalize">
                          {selectedLand.biomeType}
                        </div>

                        <div>Terrain:</div>
                        <div className="text-yellow-900 capitalize">
                          {selectedLand.terrainType}
                        </div>

                        <div>Location:</div>
                        <div className="text-yellow-900">
                          ({selectedLand.location.x}, {selectedLand.location.y})
                        </div>

                        <div>Acquired:</div>
                        <div className="text-yellow-900">
                          {new Date(selectedLand.acquiredDate).toLocaleDateString()}
                        </div>
                      </div>
                      
                      {/* Actions for the land */}
                      <div className="flex gap-2 mt-2">
                        <button
                          className="bg-yellow-700 hover:bg-yellow-600 text-amber-100 py-1 px-2 text-xxs border-2 border-amber-900 flex-1"
                          onClick={() => handleZoomToLand(selectedLand)}
                        >
                          Zoom to Land
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  {/* Resource tabs */}
                  <div className="flex gap-0 mb-2 w-full">
                    <button
                      className={`py-1 px-3 text-xxs border-2 border-amber-900 flex-1 ${
                        activeResourceTab === 'info'
                          ? 'bg-amber-800 text-amber-100 border-b-0'
                          : 'bg-amber-600 text-amber-200 border-b-2'
                      }`}
                      onClick={() => setActiveResourceTab('info')}
                    >
                      Info
                    </button>
                    <button
                      className={`py-1 px-3 text-xxs border-2 border-l-0 border-amber-900 flex-1 ${
                        activeResourceTab === 'resources'
                          ? 'bg-amber-800 text-amber-100 border-b-0'
                          : 'bg-amber-600 text-amber-200 border-b-2'
                      }`}
                      onClick={() => setActiveResourceTab('resources')}
                    >
                      Resources
                    </button>
                    <button
                      className={`py-1 px-3 text-xxs border-2 border-l-0 border-amber-900 flex-1 ${
                        activeResourceTab === 'upgrades'
                          ? 'bg-amber-800 text-amber-100 border-b-0'
                          : 'bg-amber-600 text-amber-200 border-b-2'
                      }`}
                      onClick={() => setActiveResourceTab('upgrades')}
                    >
                      Upgrades
                    </button>
                  </div>
                  
                  {/* Resource tab content */}
                  <div className="bg-amber-800/80 border-2 border-amber-900 p-2 w-full">
                    {/* Info tab */}
                    {activeResourceTab === 'info' && (
                      <div>
                        <h3 className="text-xxs text-amber-200 mb-2">Land Information</h3>
                        <div className="grid grid-cols-2 gap-1">
                          <div className="text-amber-200">Fertility:</div>
                          <div className="text-amber-100">
                            {Math.round(selectedLand.resources.fertility * 100)}%
                          </div>
                          <div className="text-amber-200">Mineral Wealth:</div>
                          <div className="text-amber-100">
                            {Math.round(selectedLand.resources.mineralWealth * 100)}%
                          </div>
                          <div className="text-amber-200">Oil Potential:</div>
                          <div className="text-amber-100">
                            {Math.round(selectedLand.resources.oilPotential * 100)}%
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {/* Resources tab */}
                    {activeResourceTab === 'resources' && (
                      <div>
                        <h3 className="text-xxs text-amber-200 mb-2">Available Resources</h3>
                        
                        {selectedLand.resources.availableResources?.length === 0 ? (
                          <p className="text-amber-100 text-xxs italic mb-2">
                            No resources have been developed on this land yet.
                          </p>
                        ) : (
                          <div className="space-y-2">
                            {/* Farm info */}
                            {selectedLand.resources.farm && (
                              <div className="bg-amber-700/80 border-2 border-amber-900 p-2">
                                <div className="flex justify-between items-center mb-1">
                                  <h4 className="text-amber-100">Farm (Level {selectedLand.resources.farm.level})</h4>
                                  <button
                                    className="bg-amber-600 text-xxs text-amber-100 px-2 py-0.5 rounded"
                                    onClick={() => handleResourceAction(selectedLand, 'farm', 'harvest')}
                                    disabled={currentAction !== null}
                                  >
                                    {currentAction === 'harvest' ? 'Harvesting...' : 'Harvest'}
                                  </button>
                                </div>
                                <div className="grid grid-cols-2 gap-1 text-xxs">
                                  <div className="text-amber-200">Yield:</div>
                                  <div className="text-amber-100">{selectedLand.resources.farm.yield}</div>
                                  <div className="text-amber-200">Fertility:</div>
                                  <div className="text-amber-100">{Math.round(selectedLand.resources.farm.fertility * 100)}%</div>
                                  <div className="text-amber-200">Status:</div>
                                  <div className="text-amber-100">
                                    {getNextHarvestTime(selectedLand.resources.farm.lastHarvested, 'farm')}
                                  </div>
                                </div>
                              </div>
                            )}
                            
                            {/* Mine info */}
                            {selectedLand.resources.mine && (
                              <div className="bg-amber-700/80 border-2 border-amber-900 p-2">
                                <div className="flex justify-between items-center mb-1">
                                  <h4 className="text-amber-100">Mine (Level {selectedLand.resources.mine.level})</h4>
                                  <button
                                    className="bg-amber-600 text-xxs text-amber-100 px-2 py-0.5 rounded"
                                    onClick={() => handleResourceAction(selectedLand, 'mine', 'harvest')}
                                    disabled={currentAction !== null}
                                  >
                                    {currentAction === 'harvest' ? 'Harvesting...' : 'Harvest'}
                                  </button>
                                </div>
                                <div className="grid grid-cols-2 gap-1 text-xxs">
                                  <div className="text-amber-200">Yield:</div>
                                  <div className="text-amber-100">{selectedLand.resources.mine.yield}</div>
                                  <div className="text-amber-200">Richness:</div>
                                  <div className="text-amber-100">{Math.round(selectedLand.resources.mine.richness * 100)}%</div>
                                  <div className="text-amber-200">Depletion Rate:</div>
                                  <div className="text-amber-100">{Math.round(selectedLand.resources.mine.depletionRate * 100)}%</div>
                                  <div className="text-amber-200">Status:</div>
                                  <div className="text-amber-100">
                                    {getNextHarvestTime(selectedLand.resources.mine.lastHarvested, 'mine')}
                                  </div>
                                </div>
                              </div>
                            )}
                            
                            {/* Oil Field info */}
                            {selectedLand.resources.oilField && (
                              <div className="bg-amber-700/80 border-2 border-amber-900 p-2">
                                <div className="flex justify-between items-center mb-1">
                                  <h4 className="text-amber-100">Oil Field (Level {selectedLand.resources.oilField.level})</h4>
                                  <button
                                    className="bg-amber-600 text-xxs text-amber-100 px-2 py-0.5 rounded"
                                    onClick={() => handleResourceAction(selectedLand, 'oilField', 'harvest')}
                                    disabled={currentAction !== null}
                                  >
                                    {currentAction === 'harvest' ? 'Harvesting...' : 'Harvest'}
                                  </button>
                                </div>
                                <div className="grid grid-cols-2 gap-1 text-xxs">
                                  <div className="text-amber-200">Yield:</div>
                                  <div className="text-amber-100">{selectedLand.resources.oilField.yield}</div>
                                  <div className="text-amber-200">Capacity:</div>
                                  <div className="text-amber-100">{selectedLand.resources.oilField.capacity}</div>
                                  <div className="text-amber-200">Depletion Rate:</div>
                                  <div className="text-amber-100">{Math.round(selectedLand.resources.oilField.depletionRate * 100)}%</div>
                                  <div className="text-amber-200">Status:</div>
                                  <div className="text-amber-100">
                                    {getNextHarvestTime(selectedLand.resources.oilField.lastHarvested, 'oilField')}
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                    
                    {/* Upgrades tab */}
                    {activeResourceTab === 'upgrades' && (
                      <div>
                        <h3 className="text-xxs text-amber-200 mb-2">Build & Upgrade Resources</h3>
                        
                        {/* Farm section */}
                        <div className="bg-amber-700/80 border-2 border-amber-900 p-2 mb-2">
                          <h4 className="text-amber-100 mb-1">Farm</h4>
                          
                          {selectedLand.resources.fertility < 0.3 ? (
                            <p className="text-amber-100 text-xxs italic">
                              Land fertility too low for farming (min. 30% required)
                            </p>
                          ) : selectedLand.resources.farm ? (
                            <div>
                              <p className="text-amber-100 text-xxs mb-1">
                                Current level: {selectedLand.resources.farm.level}
                              </p>
                              <button
                                className="bg-amber-600 text-xxs text-amber-100 px-3 py-1 w-full"
                                onClick={() => handleResourceAction(selectedLand, 'farm', 'upgrade')}
                                disabled={currentAction !== null}
                              >
                                {currentAction === 'upgrade' ? 'Upgrading...' : `Upgrade (500 coins)`}
                              </button>
                            </div>
                          ) : (
                            <div>
                              <p className="text-amber-100 text-xxs mb-1">
                                Build a farm to harvest crops
                              </p>
                              <button
                                className="bg-amber-600 text-xxs text-amber-100 px-3 py-1 w-full"
                                onClick={() => handleResourceAction(selectedLand, 'farm', 'build')}
                                disabled={currentAction !== null}
                              >
                                {currentAction === 'build' ? 'Building...' : `Build Farm (300 coins)`}
                              </button>
                            </div>
                          )}
                        </div>
                        
                        {/* Mine section */}
                        <div className="bg-amber-700/80 border-2 border-amber-900 p-2 mb-2">
                          <h4 className="text-amber-100 mb-1">Mine</h4>
                          
                          {selectedLand.resources.mineralWealth < 0.3 ? (
                            <p className="text-amber-100 text-xxs italic">
                              Mineral wealth too low for mining (min. 30% required)
                            </p>
                          ) : selectedLand.resources.mine ? (
                            <div>
                              <p className="text-amber-100 text-xxs mb-1">
                                Current level: {selectedLand.resources.mine.level}
                              </p>
                              <button
                                className="bg-amber-600 text-xxs text-amber-100 px-3 py-1 w-full"
                                onClick={() => handleResourceAction(selectedLand, 'mine', 'upgrade')}
                                disabled={currentAction !== null}
                              >
                                {currentAction === 'upgrade' ? 'Upgrading...' : `Upgrade (800 coins)`}
                              </button>
                            </div>
                          ) : (
                            <div>
                              <p className="text-amber-100 text-xxs mb-1">
                                Build a mine to extract minerals
                              </p>
                              <button
                                className="bg-amber-600 text-xxs text-amber-100 px-3 py-1 w-full"
                                onClick={() => handleResourceAction(selectedLand, 'mine', 'build')}
                                disabled={currentAction !== null}
                              >
                                {currentAction === 'build' ? 'Building...' : `Build Mine (500 coins)`}
                              </button>
                            </div>
                          )}
                        </div>
                        
                        {/* Oil Field section */}
                        <div className="bg-amber-700/80 border-2 border-amber-900 p-2">
                          <h4 className="text-amber-100 mb-1">Oil Field</h4>
                          
                          {selectedLand.resources.oilPotential < 0.3 ? (
                            <p className="text-amber-100 text-xxs italic">
                              Oil potential too low for drilling (min. 30% required)
                            </p>
                          ) : selectedLand.resources.oilField ? (
                            <div>
                              <p className="text-amber-100 text-xxs mb-1">
                                Current level: {selectedLand.resources.oilField.level}
                              </p>
                              <button
                                className="bg-amber-600 text-xxs text-amber-100 px-3 py-1 w-full"
                                onClick={() => handleResourceAction(selectedLand, 'oilField', 'upgrade')}
                                disabled={currentAction !== null}
                              >
                                {currentAction === 'upgrade' ? 'Upgrading...' : `Upgrade (1000 coins)`}
                              </button>
                            </div>
                          ) : (
                            <div>
                              <p className="text-amber-100 text-xxs mb-1">
                                Build an oil field to extract oil
                              </p>
                              <button
                                className="bg-amber-600 text-xxs text-amber-100 px-3 py-1 w-full"
                                onClick={() => handleResourceAction(selectedLand, 'oilField', 'build')}
                                disabled={currentAction !== null}
                              >
                                {currentAction === 'build' ? 'Building...' : `Build Oil Field (800 coins)`}
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
          
          {activeTab === "collection" && (
            <div className="text-center my-3 text-xxs text-yellow-800">
              <p className="mb-3">Collection view coming soon!</p>
              <div className="grid grid-cols-3 gap-2">
                {[
                  "Grassland",
                  "Desert",
                  "Mountain",
                  "Coast",
                  "Forest",
                  "Special",
                ].map((type, idx) => (
                  <div key={idx} className="pixel-panel p-1 bg-yellow-100/50">
                    <div className="text-center text-xxs mb-1">{type}</div>
                    <div className="w-8 h-8 mx-auto mb-1 border-1 border-yellow-800 bg-gray-200 flex items-center justify-center">
                      <span className="text-yellow-900 text-xxs">?</span>
                    </div>
                    <div className="text-center text-xxs">0/10</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default MyLands; 