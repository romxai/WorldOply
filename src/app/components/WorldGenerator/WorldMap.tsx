// WorldMap.tsx - Main component for rendering the procedurally generated world map
"use client";

import React, {
  useRef,
  useEffect,
  useState,
  useMemo,
  useCallback,
} from "react";
import {
  WINDOW_WIDTH,
  WINDOW_HEIGHT,
  DEFAULT_TILE_SIZE,
  DEFAULT_SEED,
  NOISE_DETAIL,
  NOISE_FALLOFF,
  INITIAL_ZOOM,
  MIN_ZOOM,
  MAX_ZOOM,
  CAMERA_SPEED,
  INITIAL_OFFSET_X,
  INITIAL_OFFSET_Y,
  DEBUG_MODE,
  SHOW_GRID,
  SHOW_COORDS,
  WORLD_GRID_WIDTH,
  WORLD_GRID_HEIGHT,
  GRID_VISIBLE_THRESHOLD,
  COORDS_VISIBLE_THRESHOLD,
  BiomeType,
  VisualizationMode,
  LOW_ZOOM_THRESHOLD,
  LOW_ZOOM_TILE_FACTOR,
  DEFAULT_OCTAVES,
  DEFAULT_ELEVATION_SCALE,
  DEFAULT_MOISTURE_SCALE,
  DEFAULT_OCTAVE_WEIGHT,
  BIOME_NAMES,
  DEFAULT_EQUATOR_POSITION,
  DEFAULT_TEMPERATURE_VARIANCE,
  DEFAULT_ELEVATION_TEMP_EFFECT,
  DEFAULT_TEMPERATURE_BAND_SCALE,
  DEFAULT_TEMPERATURE_PARAMS,
  RGB,
  MOISTURE_THRESHOLDS,
  TEMPERATURE_THRESHOLDS,
} from "./config";
import { WorldGenerator, WorldGeneratorConfig } from "./worldGenerator";
import { rgbToString } from "./terrainUtils";
import ProgressBar from "./UI/ProgressBar";
import NavigationControls from "./UI/NavigationControls";
import TileInfoPanel from "./UI/TileInfoPanel";
import tileGenerationService from "@/services/tileGenerationService";
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

// Define the ContinentalFalloffParams interface
export interface ContinentalFalloffParams {
  enabled: boolean;
  falloffRate: number;
  centerX: number;
  centerY: number;
}

// Define default continental falloff parameters
export const DEFAULT_CONTINENTAL_PARAMS: ContinentalFalloffParams = {
  enabled: false,
  falloffRate: 0.8,
  centerX: 0.5,
  centerY: 0.5,
};

interface WorldMapProps {
  width?: number;
  height?: number;
  tileSize?: number;
  seed?: number;
  debug?: boolean;
  noiseDetail?: number;
  noiseFalloff?: number;
  visualizationMode?: VisualizationMode;
  // New properties for advanced generation
  elevationOctaves?: number;
  moistureOctaves?: number;
  elevationScale?: number;
  moistureScale?: number;
  elevationPersistence?: number;
  moisturePersistence?: number;
  // Temperature parameters
  temperatureParams?: {
    equatorPosition: number;
    temperatureVariance: number;
    elevationEffect: number;
    polarTemperature?: number;
    equatorTemperature?: number;
    bandScale: number;
    // New temperature parameters
    noiseScale?: number;
    noiseOctaves?: number;
    noisePersistence?: number;
    noiseSeed?: number;
  };
  // Radial gradient parameters for ocean effect
  radialGradientParams?: {
    centerX: number;
    centerY: number;
    radius: number;
    falloffExponent: number;
    strength: number;
  };
  // Continental falloff parameters
  continentalFalloffParams?: ContinentalFalloffParams;
  // Add threshold parameters
  moistureThresholds?: typeof MOISTURE_THRESHOLDS;
  temperatureThresholds?: typeof TEMPERATURE_THRESHOLDS;
  // Progress tracking
  isGenerating?: boolean;
  generationProgress?: number;
}

interface CameraState {
  x: number;
  y: number;
  zoom: number;
}

const WorldMap: React.FC<WorldMapProps> = ({
  width = WINDOW_WIDTH,
  height = WINDOW_HEIGHT,
  tileSize = DEFAULT_TILE_SIZE,
  seed = DEFAULT_SEED,
  debug = DEBUG_MODE,
  noiseDetail = NOISE_DETAIL,
  noiseFalloff = NOISE_FALLOFF,
  visualizationMode = VisualizationMode.BIOME,
  // New properties with defaults
  elevationOctaves = DEFAULT_OCTAVES,
  moistureOctaves = DEFAULT_OCTAVES,
  elevationScale = DEFAULT_ELEVATION_SCALE,
  moistureScale = DEFAULT_MOISTURE_SCALE,
  elevationPersistence = DEFAULT_OCTAVE_WEIGHT,
  moisturePersistence = DEFAULT_OCTAVE_WEIGHT,
  // Temperature parameters
  temperatureParams = {
    equatorPosition: DEFAULT_EQUATOR_POSITION,
    temperatureVariance: DEFAULT_TEMPERATURE_VARIANCE,
    elevationEffect: DEFAULT_ELEVATION_TEMP_EFFECT,
    bandScale: DEFAULT_TEMPERATURE_BAND_SCALE,
    // Add new temperature parameter defaults
    noiseScale: DEFAULT_TEMPERATURE_PARAMS.noiseScale,
    noiseOctaves: DEFAULT_TEMPERATURE_PARAMS.noiseOctaves,
    noisePersistence: DEFAULT_TEMPERATURE_PARAMS.noisePersistence,
    polarTemperature: DEFAULT_TEMPERATURE_PARAMS.polarTemperature,
    equatorTemperature: DEFAULT_TEMPERATURE_PARAMS.equatorTemperature,
  },
  // Radial gradient parameters for ocean effect
  radialGradientParams = {
    centerX: 0.5,
    centerY: 0.5,
    radius: 0.5,
    falloffExponent: 2.0,
    strength: 0.5,
  },
  // Continental falloff parameters
  continentalFalloffParams = DEFAULT_CONTINENTAL_PARAMS,
  // Add threshold parameters with defaults
  moistureThresholds = MOISTURE_THRESHOLDS,
  temperatureThresholds = TEMPERATURE_THRESHOLDS,
  // Progress tracking
  isGenerating = false,
  generationProgress = 0,
}) => {
  // Add the router inside the component
  const router = useRouter();
  const { user } = useAuth();

  // Canvas and rendering references
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const offscreenCanvasRef = useRef<HTMLCanvasElement | null>(null);
  // Add animation reference for handling animation frames
  const animationRequestRef = useRef<number | null>(null);

  // Camera state for position and zoom
  const [camera, setCamera] = useState<CameraState>({
    x: INITIAL_OFFSET_X,
    y: INITIAL_OFFSET_Y,
    zoom: INITIAL_ZOOM,
  });

  // Tracking state
  const [mapChanged, setMapChanged] = useState<boolean>(true);
  const [debugInfo, setDebugInfo] = useState<string>("");
  const [mousePos, setMousePos] = useState<{ x: number; y: number }>({
    x: 0,
    y: 0,
  });
  // Drag state for mouse panning
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStartPos, setDragStartPos] = useState<{ x: number; y: number }>({
    x: 0,
    y: 0,
  });

  // Visualization state
  const [currentVisualizationMode, setVisualizationMode] =
    useState<string>(visualizationMode);

  // Tracking state for tile information
  const [hoverTileInfo, setHoverTileInfo] = useState<string | null>(null);
  const [hoverTileCoords, setHoverTileCoords] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const [selectedTileInfo, setSelectedTileInfo] = useState<string | null>(null);
  const [selectedTileCoords, setSelectedTileCoords] = useState<{
    x: number;
    y: number;
  } | null>(null);
  // Add new state for multiple selected tiles
  const [selectedTiles, setSelectedTiles] = useState<
    Array<{ x: number; y: number; info: string }>
  >([]);
  // Add state for highlighting animation
  const [selectionHighlight, setSelectionHighlight] = useState<{
    active: boolean;
    x: number;
    y: number;
    progress: number;
  }>({ active: false, x: 0, y: 0, progress: 0 });

  // Add state for tile ownership info
  const [selectedTileOwnership, setSelectedTileOwnership] = useState<{
    owned: boolean;
    inAuction: boolean;
    owner?: string;
  }>({
    owned: false,
    inAuction: false
  });

  // Create world generator with specified parameters
  const worldGeneratorRef = useRef<WorldGenerator>(
    new WorldGenerator({
      seed,
      elevationOctaves,
      moistureOctaves,
      elevationScale,
      moistureScale,
      elevationPersistence,
      moisturePersistence,
      temperatureParams: {
        equatorPosition: temperatureParams.equatorPosition,
        temperatureVariance: temperatureParams.temperatureVariance,
        elevationEffect: temperatureParams.elevationEffect,
        polarTemperature: temperatureParams.polarTemperature || 0.0,
        equatorTemperature: temperatureParams.equatorTemperature || 1.0,
        bandScale: temperatureParams.bandScale,
        noiseScale: temperatureParams.noiseScale,
        noiseOctaves: temperatureParams.noiseOctaves,
        noisePersistence: temperatureParams.noisePersistence,
        noiseSeed: temperatureParams.noiseSeed || seed + 2000,
      },
      radialGradientParams,
      moistureThresholds,
      temperatureThresholds,
    })
  );

  // Key states for camera movement
  const keyStates = useRef<{ [key: string]: boolean }>({
    ArrowUp: false,
    ArrowDown: false,
    ArrowLeft: false,
    ArrowRight: false,
  });

  // Handle zoom action from zoom buttons
  const handleZoom = useCallback(
    (zoomIn: boolean) => {
      const zoomFactor = zoomIn ? 1.2 : 0.8;
      let newZoom = camera.zoom * zoomFactor;

      // Calculate the minimum zoom required to keep the map filling the viewport
      const minZoomX = width / (WORLD_GRID_WIDTH * tileSize);
      const minZoomY = height / (WORLD_GRID_HEIGHT * tileSize);
      const dynamicMinZoom = Math.max(minZoomX, minZoomY);

      // Clamp zoom to calculated min and defined max range
      newZoom = Math.max(
        Math.max(dynamicMinZoom, MIN_ZOOM),
        Math.min(MAX_ZOOM, newZoom)
      );

      if (newZoom !== camera.zoom) {
        setCamera((prevCamera) => ({ ...prevCamera, zoom: newZoom }));
        setMapChanged(true);
      }
    },
    [camera.zoom, width, height, tileSize]
  );

  // New method to zoom to specific coordinates using a sectional approach
  const handleZoomToCoordinates = useCallback(
    (x: number, y: number, targetZoom?: number) => {
      // Target zoom level - use provided or default to a reasonable zoom
      const finalZoom = targetZoom || Math.min(2.0, MAX_ZOOM);
      
      // Calculate visible tiles at target zoom for boundary checking
      const newVisibleTilesX = width / (tileSize * finalZoom);
      const newVisibleTilesY = height / (tileSize * finalZoom);
      
      // Apply camera boundaries to ensure we don't go beyond map edges
      const minX = newVisibleTilesX / 2;
      const maxX = WORLD_GRID_WIDTH - newVisibleTilesX / 2;
      const minY = newVisibleTilesY / 2;
      const maxY = WORLD_GRID_HEIGHT - newVisibleTilesY / 2;
      
      // Clamp x and y to ensure the camera stays within map bounds
      const boundedX = Math.max(minX, Math.min(maxX, x));
      const boundedY = Math.max(minY, Math.min(maxY, y));
      
      // Directly set new camera position centered on the target tile
      const newCamera = {
        x: boundedX,
        y: boundedY,
        zoom: finalZoom,
      };
      
      // Clean up any existing animation
      if (animationRequestRef.current) {
        cancelAnimationFrame(animationRequestRef.current);
        animationRequestRef.current = null;
      }
      
      // Animation setup
      const startCamera = { ...camera };
      const endCamera = newCamera;
      
      // Animation duration and frame counting
      const duration = 30;
      let frame = 0;
      
      const animateZoom = () => {
        frame++;
        const progress = Math.min(frame / duration, 1);
        
        // Use easeInOutCubic easing function for smooth animation
        const easeProgress = progress < 0.5
          ? 4 * progress * progress * progress
          : 1 - Math.pow(-2 * progress + 2, 3) / 2;
        
        // Interpolate camera values
        const newCamera = {
          x: startCamera.x + (endCamera.x - startCamera.x) * easeProgress,
          y: startCamera.y + (endCamera.y - startCamera.y) * easeProgress,
          zoom: startCamera.zoom + (endCamera.zoom - startCamera.zoom) * easeProgress,
        };
        
        setCamera(newCamera);
        setMapChanged(true);
        
        if (frame < duration) {
          animationRequestRef.current = requestAnimationFrame(animateZoom);
        } else {
          animationRequestRef.current = null;
        }
      };
      
      // Start animation
      animationRequestRef.current = requestAnimationFrame(animateZoom);
    },
    [camera, width, height, tileSize]
  );

  // Handle reset zoom to show the entire map
  const handleResetZoom = useCallback(() => {
    // Use the initial zoom level from config instead of calculating minimum zoom
    const resetZoom = INITIAL_ZOOM;
    
    // Center the camera on the map
    const centerX = WORLD_GRID_WIDTH / 2;
    const centerY = WORLD_GRID_HEIGHT / 2;
    
    // Use the zoom to coordinates function with the initial zoom value
    handleZoomToCoordinates(centerX, centerY, resetZoom);
  }, [handleZoomToCoordinates]);

  // Handle pan action from navigation buttons - defined BEFORE the keyboard useEffect
  const handlePan = useCallback(
    (direction: "up" | "down" | "left" | "right") => {
      // Determine camera movement speed based on zoom level
      const speed = CAMERA_SPEED / camera.zoom;

      let newX = camera.x;
      let newY = camera.y;

      switch (direction) {
        case "up":
          newY -= speed;
          break;
        case "down":
          newY += speed;
          break;
        case "left":
          newX -= speed;
          break;
        case "right":
          newX += speed;
          break;
      }

      // Calculate how many tiles are visible at current zoom level
      const currentTileSize = tileSize * camera.zoom;
      const visibleTilesX = width / currentTileSize;
      const visibleTilesY = height / currentTileSize;

      // Calculate boundaries to ensure map stays visible
      // This ensures we can't pan beyond half the visible tiles from the map edge
      const minX = visibleTilesX / 2;
      const maxX = WORLD_GRID_WIDTH - visibleTilesX / 2;
      const minY = visibleTilesY / 2;
      const maxY = WORLD_GRID_HEIGHT - visibleTilesY / 2;

      // Clamp camera position to keep map in view
      newX = Math.max(minX, Math.min(maxX, newX));
      newY = Math.max(minY, Math.min(maxY, newY));

      setCamera((prevCamera) => ({ ...prevCamera, x: newX, y: newY }));
      setMapChanged(true);
    },
    [camera.zoom, width, height, tileSize]
  );

  // Handle keyboard events for camera movement - now defined AFTER handlePan
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (Object.keys(keyStates.current).includes(e.key)) {
        keyStates.current[e.key] = true;
        // Trigger rendering update when a key is pressed
        setMapChanged(true);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (Object.keys(keyStates.current).includes(e.key)) {
        keyStates.current[e.key] = false;
      }
    };

    // Process keyboard input for camera movement
    const updateCameraFromKeyboard = () => {
      // Convert keyboard input to direction
      if (keyStates.current.ArrowUp) handlePan("up");
      if (keyStates.current.ArrowDown) handlePan("down");
      if (keyStates.current.ArrowLeft) handlePan("left");
      if (keyStates.current.ArrowRight) handlePan("right");

      // Request next frame update if any key is pressed
      if (Object.values(keyStates.current).some((value) => value)) {
        requestAnimationFrame(updateCameraFromKeyboard);
      }
    };

    // Start animation loop if any key is pressed
    const checkKeyboardInput = () => {
      if (Object.values(keyStates.current).some((value) => value)) {
        updateCameraFromKeyboard();
      }

      // Continue checking for keyboard input
      animationFrameId = requestAnimationFrame(checkKeyboardInput);
    };

    // Start the keyboard check loop
    let animationFrameId = requestAnimationFrame(checkKeyboardInput);

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      cancelAnimationFrame(animationFrameId);
    };
  }, [handlePan]); // handlePan is now defined before this useEffect

  // When generation parameters change, update the world generator
  useEffect(() => {
    worldGeneratorRef.current.updateConfig({
      seed,
      elevationOctaves,
      moistureOctaves,
      elevationScale,
      moistureScale,
      elevationPersistence,
      moisturePersistence,
      temperatureParams,
      radialGradientParams,
      moistureThresholds,
      temperatureThresholds,
    });
    setMapChanged(true);
  }, [
    seed,
    elevationOctaves,
    moistureOctaves,
    elevationScale,
    moistureScale,
    elevationPersistence,
    moisturePersistence,
    temperatureParams,
    radialGradientParams,
    moistureThresholds,
    temperatureThresholds,
  ]);

  // Re-render map when visualization mode or biome weights change
  useEffect(() => {
    setMapChanged(true);
    setVisualizationMode(visualizationMode);
  }, [visualizationMode]);

  // Setup offscreen canvas for rendering
  useEffect(() => {
    offscreenCanvasRef.current = document.createElement("canvas");
    offscreenCanvasRef.current.width = width;
    offscreenCanvasRef.current.height = height;
  }, [width, height]);

  // Calculate tile size based on zoom level
  const calculateTileSize = useCallback(
    (zoom: number): number => {
      return tileSize * zoom;
    },
    [tileSize]
  );

  // Calculate which grid cells are visible in the current view
  const getVisibleGridCells = useCallback(
    (
      camera: CameraState,
      zoom: number,
      isLowZoom: boolean
    ): {
      startX: number;
      startY: number;
      endX: number;
      endY: number;
      skipFactor: number;
    } => {
      // Calculate actual tile size with zoom applied
      const currentTileSize = calculateTileSize(zoom);

      // Determine skip factor for low zoom levels
      // This reduces the number of tiles rendered at low zoom levels
      const skipFactor = isLowZoom ? LOW_ZOOM_TILE_FACTOR : 1;

      // Adjust for skip factor when calculating how many tiles to render
      const tilesX = Math.ceil(width / currentTileSize) + 1; // +1 to handle partial tiles
      const tilesY = Math.ceil(height / currentTileSize) + 1;

      // Calculate the starting tile based on camera position
      // Camera position is center of view, so offset by half the visible tiles
      // We need to adjust for the skip factor to ensure we get the right starting point
      const startX = Math.max(
        0,
        Math.floor((camera.x - tilesX / 2) / skipFactor) * skipFactor
      );
      const startY = Math.max(
        0,
        Math.floor((camera.y - tilesY / 2) / skipFactor) * skipFactor
      );

      // Calculate the ending tile, clamped to world boundaries
      const endX = Math.min(WORLD_GRID_WIDTH - 1, startX + tilesX * skipFactor);
      const endY = Math.min(
        WORLD_GRID_HEIGHT - 1,
        startY + tilesY * skipFactor
      );

      return { startX, startY, endX, endY, skipFactor };
    },
    [calculateTileSize, width, height]
  );

  // Get world coordinates from screen coordinates
  const screenToWorldCoords = useCallback(
    (screenX: number, screenY: number) => {
      if (!canvasRef.current) return null;

      const rect = canvasRef.current.getBoundingClientRect();
      const canvasX = screenX - rect.left;
      const canvasY = screenY - rect.top;

      // Calculate actual tile size with zoom
      const currentTileSize = calculateTileSize(camera.zoom);

      // Get visible grid cells to determine start coordinates
      const isLowZoom = camera.zoom < LOW_ZOOM_THRESHOLD;
      const { startX, startY } = getVisibleGridCells(
        camera,
        camera.zoom,
        isLowZoom
      );

      // Calculate camera offset in pixels
      const offsetX = (camera.x - startX) * currentTileSize;
      const offsetY = (camera.y - startY) * currentTileSize;

      // Convert screen coordinates to world coordinates
      const mouseWorldX =
        startX + (canvasX - width / 2 + offsetX) / currentTileSize;
      const mouseWorldY =
        startY + (canvasY - height / 2 + offsetY) / currentTileSize;

      // Round to get the tile coordinates
      const tileX = Math.floor(mouseWorldX);
      const tileY = Math.floor(mouseWorldY);

      // Check if mouse is over a valid tile
      if (
        tileX < 0 ||
        tileX >= WORLD_GRID_WIDTH ||
        tileY < 0 ||
        tileY >= WORLD_GRID_HEIGHT
      ) {
        return null;
      }

      return { x: tileX, y: tileY };
    },
    [camera, tileSize, width, height, calculateTileSize, getVisibleGridCells]
  );

  // Add a function to draw selected tiles highlight with improved coordinate transformation
  const drawSelectedTiles = useCallback(
    (ctx: CanvasRenderingContext2D) => {
      if (selectedTiles.length === 0) return;

      // Calculate which grid cells are visible
      const isLowZoom = camera.zoom < LOW_ZOOM_THRESHOLD;
      const { startX, startY } = getVisibleGridCells(
        camera,
        camera.zoom,
        isLowZoom
      );

      // Calculate actual tile size with zoom
      const currentTileSize = calculateTileSize(camera.zoom);

      // Calculate camera offset in pixels
      const offsetX = (camera.x - startX) * currentTileSize;
      const offsetY = (camera.y - startY) * currentTileSize;

      selectedTiles.forEach((tile) => {
        // Calculate screen position for this tile - using the same transformation as for rendering tiles
        const screenX = (tile.x - startX) * currentTileSize - offsetX + width / 2;
        const screenY = (tile.y - startY) * currentTileSize - offsetY + height / 2;
        const size = currentTileSize;

        // Draw selection border
        ctx.strokeStyle = "rgba(255, 255, 255, 0.8)";
        ctx.lineWidth = 2;
        ctx.strokeRect(screenX, screenY, size, size);

        // Draw corner indicators
        const cornerSize = size / 5;
        ctx.strokeStyle = "rgba(50, 205, 50, 0.9)";
        ctx.lineWidth = 3;
        
        // Top-left corner
        ctx.beginPath();
        ctx.moveTo(screenX, screenY + cornerSize);
        ctx.lineTo(screenX, screenY);
        ctx.lineTo(screenX + cornerSize, screenY);
        ctx.stroke();
        
        // Top-right corner
        ctx.beginPath();
        ctx.moveTo(screenX + size - cornerSize, screenY);
        ctx.lineTo(screenX + size, screenY);
        ctx.lineTo(screenX + size, screenY + cornerSize);
        ctx.stroke();
        
        // Bottom-right corner
        ctx.beginPath();
        ctx.moveTo(screenX + size, screenY + size - cornerSize);
        ctx.lineTo(screenX + size, screenY + size);
        ctx.lineTo(screenX + size - cornerSize, screenY + size);
        ctx.stroke();
        
        // Bottom-left corner
        ctx.beginPath();
        ctx.moveTo(screenX + cornerSize, screenY + size);
        ctx.lineTo(screenX, screenY + size);
        ctx.lineTo(screenX, screenY + size - cornerSize);
        ctx.stroke();
      });

      // Draw highlight animation if active
      if (selectionHighlight.active) {
        const { x, y, progress } = selectionHighlight;
        
        // Calculate screen position using the same transformation
        const screenX = (x - startX) * currentTileSize - offsetX + width / 2;
        const screenY = (y - startY) * currentTileSize - offsetY + height / 2;
        const size = currentTileSize;
        
        // Calculate animation values
        const animSize = size * (1 + progress * 0.2);
        const animOffset = (animSize - size) / 2;
        
        ctx.strokeStyle = `rgba(255, 215, 0, ${0.8 - progress * 0.8})`;
        ctx.lineWidth = 3;
        ctx.strokeRect(
          screenX - animOffset,
          screenY - animOffset,
          animSize,
          animSize
        );
        
        // Update animation progress using requestAnimationFrame
        // to avoid setState during render cycle
        if (progress < 1) {
          if (!animationRequestRef.current) {
            animationRequestRef.current = requestAnimationFrame(() => {
              setSelectionHighlight({
                ...selectionHighlight,
                progress: progress + 0.05,
              });
              setMapChanged(true);
              animationRequestRef.current = null;
            });
          }
        } else {
          if (!animationRequestRef.current) {
            animationRequestRef.current = requestAnimationFrame(() => {
              setSelectionHighlight({
                ...selectionHighlight,
                active: false,
                progress: 0,
              });
              animationRequestRef.current = null;
            });
          }
        }
      }
    },
    [
      camera, 
      tileSize, 
      selectedTiles, 
      selectionHighlight, 
      calculateTileSize, 
      getVisibleGridCells,
      width,
      height
    ]
  );
  
  // Handle mouse drag for panning
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    // Only start dragging on left mouse button (button 0)
    if (e.button === 0) {
      setIsDragging(true);
      setDragStartPos({ x: e.clientX, y: e.clientY });
    }
  }, []);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      // Update hover info
      const coords = screenToWorldCoords(e.clientX, e.clientY);
      if (!coords) {
        setHoverTileInfo(null);
        setHoverTileCoords(null);
        return;
      }

      const { x, y } = coords;
      setHoverTileCoords({ x, y });

      // Get detailed info for this tile
      const tileInfo = worldGeneratorRef.current.getDebugInfo(x, y);
      setHoverTileInfo(tileInfo);

      // Handle dragging
      if (isDragging) {
        const dx = e.clientX - dragStartPos.x;
        const dy = e.clientY - dragStartPos.y;

        // Calculate the new camera position - move in the opposite direction of drag
        const newX = camera.x - dx / (tileSize * camera.zoom);
        const newY = camera.y - dy / (tileSize * camera.zoom);

        // Calculate how many tiles are visible at current zoom level
        const currentTileSize = tileSize * camera.zoom;
        const visibleTilesX = width / currentTileSize;
        const visibleTilesY = height / currentTileSize;

        // Calculate boundaries to ensure map stays visible
        const minX = visibleTilesX / 2;
        const maxX = WORLD_GRID_WIDTH - visibleTilesX / 2;
        const minY = visibleTilesY / 2;
        const maxY = WORLD_GRID_HEIGHT - visibleTilesY / 2;

        // Clamp camera position to keep map in view
        const clampedX = Math.max(minX, Math.min(maxX, newX));
        const clampedY = Math.max(minY, Math.min(maxY, newY));

        setCamera((prevCamera) => ({
          ...prevCamera,
          x: clampedX,
          y: clampedY,
        }));
        setDragStartPos({ x: e.clientX, y: e.clientY }); // Update drag start position
        setMapChanged(true);
      }
    },
    [
      isDragging,
      dragStartPos,
      camera.x,
      camera.y,
      camera.zoom,
      tileSize,
      width,
      height,
      screenToWorldCoords,
    ]
  );

  const handleMouseUp = useCallback((e: React.MouseEvent) => {
    if (e.button === 0) {
      // Only handle left mouse button
      setIsDragging(false);
    }
  }, []);

  // Global mouse up handler to release drag even if mouse up occurs outside canvas
  useEffect(() => {
    const handleGlobalMouseUp = () => {
      setIsDragging(false);
    };

    // Add the event listener to the window
    window.addEventListener("mouseup", handleGlobalMouseUp);

    // Clean up
    return () => {
      window.removeEventListener("mouseup", handleGlobalMouseUp);
    };
  }, []);

  // Handle mouse click to select a tile
  const handleCanvasClick = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (!canvasRef.current) return;

      // Skip tile selection if we've been dragging
      if (isDragging) {
        return;
      }

      // Use the same screenToWorldCoords function that the hover functionality uses
      const coords = screenToWorldCoords(e.clientX, e.clientY);
      if (!coords) {
        return;
      }

      const { x, y } = coords;
      
      // Get the tile info - using the correct WorldGenerator methods
      const biome = worldGeneratorRef.current.getBiome(x, y);
      const elevation = worldGeneratorRef.current.getElevation(x, y);
      const moisture = worldGeneratorRef.current.getMoisture(x, y);
      const temperature = worldGeneratorRef.current.getTemperature(x, y, elevation);

      // Format the tile info as a string
      const tileInfo = 
        `Biome: ${BIOME_NAMES[biome as keyof typeof BIOME_NAMES] || biome}\n` +
        `Coordinates: (${x}, ${y})\n` +
        `Elevation: ${elevation.toFixed(3)}\n` +
        `Moisture: ${moisture.toFixed(3)}\n` +
        `Temperature: ${temperature.toFixed(3)}`;

      // Add the tile to selected tiles if not already selected, or remove if clicked again
      const tileIndex = selectedTiles.findIndex(
        (tile) => tile.x === x && tile.y === y
      );

      let newSelectedTiles = [...selectedTiles];
      
      if (tileIndex === -1) {
        // If holding shift, add to selection without removing others
        if (e.shiftKey) {
          newSelectedTiles.push({
            x,
            y,
            info: tileInfo,
          });
        } else {
          // Replace selection with just this tile
          newSelectedTiles = [{
            x,
            y,
            info: tileInfo,
          }];
        }
      } else if (e.shiftKey) {
        // If holding shift and clicking on already selected tile, remove it
        newSelectedTiles.splice(tileIndex, 1);
      } else {
        // If clicking on already selected tile without shift, make it the only selection
        newSelectedTiles = [{
          x,
          y,
          info: tileInfo,
        }];
      }

      setSelectedTiles(newSelectedTiles);
      
      // Update primary selected tile info (the last selected one)
      if (newSelectedTiles.length > 0) {
        const lastSelected = newSelectedTiles[newSelectedTiles.length - 1];
        setSelectedTileCoords({ x: lastSelected.x, y: lastSelected.y });
        setSelectedTileInfo(lastSelected.info);

        // Trigger the selection highlight animation
        setSelectionHighlight({
          active: true,
          x: lastSelected.x,
          y: lastSelected.y,
          progress: 0,
        });
      } else {
        setSelectedTileCoords(null);
        setSelectedTileInfo(null);
      }

      // Force a redraw to show the selection
      setMapChanged(true);
    },
    [camera, tileSize, selectedTiles, isDragging, screenToWorldCoords]
  );

  // Check ownership status when a tile is selected
  useEffect(() => {
    if (selectedTileCoords) {
      const checkOwnership = async () => {
        try {
          const { x, y } = selectedTileCoords;
          const tileInfo = await tileGenerationService.checkTileAvailability(x, y);
          setSelectedTileOwnership({
            owned: tileInfo.owned,
            inAuction: tileInfo.inAuction,
            owner: tileInfo.owner
          });
        } catch (error) {
          console.error('Error checking tile ownership:', error);
          setSelectedTileOwnership({
            owned: false,
            inAuction: false
          });
        }
      };
      
      checkOwnership();
    }
  }, [selectedTileCoords]);

  // Main rendering loop - updates the canvas when needed
  useEffect(() => {
    // Skip rendering if nothing changed
    if (!mapChanged) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const offscreenCanvas = offscreenCanvasRef.current;
    if (!offscreenCanvas) return;

    const offCtx = offscreenCanvas.getContext("2d");
    if (!offCtx) return;

    // Clear the canvas
    offCtx.clearRect(0, 0, width, height);

    // Calculate which grid cells are visible
    const isLowZoom = camera.zoom < LOW_ZOOM_THRESHOLD;
    const { startX, startY, endX, endY, skipFactor } = getVisibleGridCells(
      camera,
      camera.zoom,
      isLowZoom
    );

    // Calculate actual tile size with zoom
    const currentTileSize = calculateTileSize(camera.zoom);

    // Calculate camera offset in pixels
    const offsetX = (camera.x - startX) * currentTileSize;
    const offsetY = (camera.y - startY) * currentTileSize;

    // Generate only the visible tiles (lazy loading)
    // We only generate tiles that are actually visible in the viewport
    for (let worldY = startY; worldY <= endY; worldY += skipFactor) {
      for (let worldX = startX; worldX <= endX; worldX += skipFactor) {
        // Get color for this tile based on visualization mode
        const color = worldGeneratorRef.current.getColorForMode(
          worldX,
          worldY,
          currentVisualizationMode as VisualizationMode
        );

        // Calculate screen position for this tile
        const screenX =
          (worldX - startX) * currentTileSize - offsetX + width / 2;
        const screenY =
          (worldY - startY) * currentTileSize - offsetY + height / 2;

        // For low zoom levels, we draw larger tiles to improve performance
        const renderSize = isLowZoom
          ? currentTileSize * skipFactor
          : currentTileSize;

        // Draw the tile with the calculated color
        offCtx.fillStyle = rgbToString(color);
        offCtx.fillRect(screenX, screenY, renderSize, renderSize);

        // Draw grid lines if enabled and zoom level is high enough
        if (
          debug &&
          SHOW_GRID &&
          camera.zoom >= GRID_VISIBLE_THRESHOLD &&
          !isLowZoom
        ) {
          offCtx.strokeStyle = "rgba(0, 0, 0, 0.2)";
          offCtx.strokeRect(screenX, screenY, renderSize, renderSize);
        }

        // Show coordinates in debug mode when zoomed in far enough
        if (
          debug &&
          SHOW_COORDS &&
          camera.zoom >= COORDS_VISIBLE_THRESHOLD &&
          !isLowZoom
        ) {
          offCtx.fillStyle = "rgba(0, 0, 0, 0.5)";
          offCtx.font = `${Math.max(8, currentTileSize / 4)}px Arial`;
          offCtx.fillText(
            `${worldX},${worldY}`,
            screenX + 2,
            screenY + Math.max(8, currentTileSize / 4)
          );
        }
      }
    }

    // Additional visualization mode overlay indicators
    if (currentVisualizationMode !== VisualizationMode.BIOME) {
      offCtx.fillStyle = "rgba(0, 0, 0, 0.7)";
      offCtx.font = "14px Arial";
      offCtx.fillText(
        `Visualization Mode: ${currentVisualizationMode.toUpperCase()}`,
        10,
        30
      );
    }

    // Copy from offscreen canvas to visible canvas
    ctx.clearRect(0, 0, width, height);
    ctx.drawImage(offscreenCanvas, 0, 0);

    // After rendering everything else, draw the selected tiles
    drawSelectedTiles(ctx);

    // Rendering complete, reset the change flag
    setMapChanged(false);
  }, [
    mapChanged,
    width,
    height,
    tileSize,
    camera,
    debug,
    currentVisualizationMode,
    drawSelectedTiles,
  ]);

  // Handle mouse wheel for zooming
  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      e.preventDefault();

      // Determine zoom direction from wheel delta
      const zoomIn = e.deltaY < 0;
      const zoomFactor = zoomIn ? 1.05 : 0.95; // Smaller factor for smoother zooming
      let newZoom = camera.zoom * zoomFactor;

      // Calculate the minimum zoom required to keep the map filling the viewport
      const minZoomX = width / (WORLD_GRID_WIDTH * tileSize);
      const minZoomY = height / (WORLD_GRID_HEIGHT * tileSize);
      const dynamicMinZoom = Math.max(minZoomX, minZoomY);

      // Clamp zoom to calculated min and defined max range
      newZoom = Math.max(
        Math.max(dynamicMinZoom, MIN_ZOOM),
        Math.min(MAX_ZOOM, newZoom)
      );

      if (newZoom !== camera.zoom) {
        setCamera((prevCamera) => ({ ...prevCamera, zoom: newZoom }));
        setMapChanged(true);
      }
    },
    [camera.zoom, width, height, tileSize]
  );

  // Handler for TileInfoPanel zoom to tile action
  const handleZoomToTile = useCallback(
    (x: number, y: number) => {
      handleZoomToCoordinates(x, y, 2.0); // Use a higher zoom level (2.0) for better detail
    },
    [handleZoomToCoordinates]
  );

  // Handler for claim tile action - placeholder for now
  const handleClaimTile = useCallback(async (x: number, y: number) => {
    if (!user) {
      alert('You must be logged in to claim a tile');
      return;
    }
    
    try {
      // Check if the tile is available
      const tileInfo = await tileGenerationService.checkTileAvailability(x, y);
      
      if (tileInfo.owned) {
        alert('This tile is already owned');
        return;
      }
      
      if (tileInfo.inAuction) {
        // If the tile is in an auction, let the user know
        alert('This tile is currently up for auction');
        if (tileInfo.auctionId) {
          router.push(`/auctions/${tileInfo.auctionId}`);
        }
        return;
      }
      
      // If tile doesn't exist in the backend yet, make a note of this
      if (!tileInfo.exists) {
        console.log('Tile does not exist in the database yet, will need to be created');
        // This is handled by the backend when claiming
      }
      
      // Call the claim API
      const response = await fetch('/api/land/claim', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          x, 
          y
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to claim tile');
      }
      
      const data = await response.json();
      
      // Show success message
      alert('Tile claimed successfully!');
      
      // Refresh the tile data
      const updatedTileInfo = await tileGenerationService.checkTileAvailability(x, y);
      
      // Update UI to show ownership
      // This would need to be implemented with additional UI state
      
    } catch (error: any) {
      console.error('Error claiming tile:', error);
      alert(`Failed to claim tile: ${error.message}`);
    }
  }, [user, router]);

  // Add/update the handleViewAuction function
  const handleViewAuction = useCallback(async (x: number, y: number) => {
    try {
      // Check if the tile is in an auction
      const tileInfo = await tileGenerationService.checkTileAvailability(x, y);
      
      if (tileInfo.inAuction && tileInfo.auctionId) {
        // If the tile is in an auction, navigate to the auction page
        router.push(`/auctions/${tileInfo.auctionId}`);
      } else if (tileInfo.exists) {
        // If the tile exists but isn't in an auction, show message or open sidebar
        console.log('Tile exists but is not currently in an auction');
        
        // Toggle the auction sidebar (you would need to implement this state)
        // setShowAuctionSidebar(true);
      } else {
        // If the tile doesn't exist in the database, it's not available for auction
        console.log('This tile is not registered in the system');
      }
    } catch (error) {
      console.error('Error checking auction status:', error);
    }
  }, [router]);

  // Clean up any animation frames on unmount
  useEffect(() => {
    return () => {
      if (animationRequestRef.current) {
        cancelAnimationFrame(animationRequestRef.current);
        animationRequestRef.current = null;
      }
    };
  }, []);

  // Add useEffect to set the world generator in tileGenerationService
  useEffect(() => {
    if (worldGeneratorRef.current) {
      tileGenerationService.setWorldGenerator(worldGeneratorRef.current);
      console.log('World generator set in tileGenerationService');
    }
  }, [worldGeneratorRef.current]); // Only run when worldGenerator is initialized

  return (
    <div className="relative w-full h-full">
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        onMouseMove={handleMouseMove}
        onClick={handleCanvasClick}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        style={{ cursor: isDragging ? "grabbing" : "grab" }}
      />
      {/*
      {debug && (
        <div className="absolute top-2 left-2 bg-black bg-opacity-50 p-2 rounded text-white text-xs">
          <div>Seed: {seed}</div>
          <div>Zoom: {camera.zoom.toFixed(2)}</div>
        </div>
      )}
      */}

      {/* Tile Info Panel - Selected Tile */}
      {selectedTileInfo && selectedTileCoords && (
        <TileInfoPanel
          tileInfo={selectedTileInfo}
          position="selected"
          coordinates={selectedTileCoords}
          onZoomToTile={handleZoomToTile}
          onClaimTile={handleClaimTile}
          onViewAuction={handleViewAuction}
          // Pass the ownership information
          isOwned={selectedTileOwnership.owned}
          isForSale={selectedTileOwnership.inAuction}
          owner={selectedTileOwnership.owner}
        />
      )}

      {/* Tile Info Panel - Hover */}
      {hoverTileInfo && hoverTileCoords && !isDragging && (
        <TileInfoPanel
          tileInfo={hoverTileInfo}
          position="hover"
          coordinates={hoverTileCoords}
        />
      )}

      {/* Navigation Controls */}
      <NavigationControls
        onPan={handlePan}
        onZoom={handleZoom}
        onZoomToCoordinates={handleZoomToCoordinates}
        onResetZoom={handleResetZoom}
        selectedTileCoords={selectedTileCoords}
        hasSelection={selectedTiles.length > 0}
      />

      {/* Progress bar overlay */}
      {isGenerating && <ProgressBar progress={generationProgress} />}
    </div>
  );
};

export default WorldMap;
