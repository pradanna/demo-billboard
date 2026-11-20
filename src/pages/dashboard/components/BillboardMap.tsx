import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet.markercluster';
import { Billboard, TrafficLevel } from '../../../types';
import { Compass, Layers, RefreshCw, Filter, Check } from 'lucide-react';

export type GMapStyle = 'streets' | 'hybrid' | 'terrain';

const GMAP_TILES: Record<GMapStyle, { url: string; label: string; shortLabel: string; maxZoom: number }> = {
  streets: {
    url: 'https://mt{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}',
    label: 'Google Maps Jalan',
    shortLabel: 'Jalan',
    maxZoom: 20
  },
  hybrid: {
    url: 'https://mt{s}.google.com/vt/lyrs=y&x={x}&y={y}&z={z}',
    label: 'Google Maps Satelit (Hybrid)',
    shortLabel: 'Satelit',
    maxZoom: 20
  },
  terrain: {
    url: 'https://mt{s}.google.com/vt/lyrs=p&x={x}&y={y}&z={z}',
    label: 'Google Maps Relief (Terrain)',
    shortLabel: 'Terrain',
    maxZoom: 20
  }
};

interface BillboardMapProps {
  billboards: Billboard[];
  selectedBillboard: Billboard | null;
  onSelectBillboard: (billboard: Billboard) => void;
  className?: string;
  selectedCity?: string;
}

export const BillboardMap: React.FC<BillboardMapProps> = ({
  billboards,
  selectedBillboard,
  onSelectBillboard,
  className = '',
  selectedCity = 'Semua'
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const clusterGroupRef = useRef<L.MarkerClusterGroup | null>(null);
  const markersMapRef = useRef<Map<string, L.Marker>>(new Map());

  const [activeTileLayer, setActiveTileLayer] = useState<GMapStyle>('streets');
  const [showLayerMenu, setShowLayerMenu] = useState(false);
  const [levelFilter, setLevelFilter] = useState<'all' | TrafficLevel>('all');
  const [isMapReady, setIsMapReady] = useState(false);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    // Center of Indonesia (default overview)
    const map = L.map(mapContainerRef.current, {
      center: [-2.5489, 118.0149],
      zoom: 5,
      minZoom: 4,
      maxZoom: 20,
      zoomControl: false
    });

    // Custom Zoom Control at Top-Right
    L.control.zoom({ position: 'topright' }).addTo(map);

    // Google Maps Tile Layer (Free, Direct Tile Server, No API Key needed)
    const tileLayer = L.tileLayer(GMAP_TILES.streets.url, {
      subdomains: ['0', '1', '2', '3'],
      maxZoom: 20,
      attribution: '&copy; Google Maps'
    });
    tileLayer.addTo(map);
    tileLayerRef.current = tileLayer;

    // Marker Cluster Group setup with custom cluster icon
    const clusterGroup = L.markerClusterGroup({
      showCoverageOnHover: false,
      zoomToBoundsOnClick: true,
      spiderfyOnMaxZoom: true,
      maxClusterRadius: 45,
      iconCreateFunction: (cluster) => {
        const count = cluster.getChildCount();
        let sizeClass = 'cluster-small';
        let size = 38;
        if (count >= 10) {
          sizeClass = 'cluster-large';
          size = 50;
        } else if (count >= 5) {
          sizeClass = 'cluster-medium';
          size = 44;
        }
        return L.divIcon({
          html: `<span>${count}</span>`,
          className: `custom-cluster-marker ${sizeClass}`,
          iconSize: L.point(size, size)
        });
      }
    });

    map.addLayer(clusterGroup);

    mapInstanceRef.current = map;
    clusterGroupRef.current = clusterGroup;
    setIsMapReady(true);

    // Resize observer to handle container size changes smoothly
    const resizeObserver = new ResizeObserver(() => {
      map.invalidateSize();
    });
    resizeObserver.observe(mapContainerRef.current);

    return () => {
      resizeObserver.disconnect();
      map.remove();
      mapInstanceRef.current = null;
      clusterGroupRef.current = null;
      tileLayerRef.current = null;
    };
  }, []);

  // Update Tile Layer when layer style changes
  useEffect(() => {
    if (tileLayerRef.current) {
      tileLayerRef.current.setUrl(GMAP_TILES[activeTileLayer].url);
    }
  }, [activeTileLayer]);

  // Filter billboards by traffic level
  const displayedBillboards = billboards.filter((b) => {
    if (levelFilter === 'all') return true;
    return b.levelTraffic === levelFilter;
  });

  // Render & Update Markers
  useEffect(() => {
    if (!mapInstanceRef.current || !clusterGroupRef.current || !isMapReady) return;

    const clusterGroup = clusterGroupRef.current;
    const map = mapInstanceRef.current;

    // Clear existing markers
    clusterGroup.clearLayers();
    markersMapRef.current.clear();

    if (displayedBillboards.length === 0) return;

    const bounds = L.latLngBounds([]);

    displayedBillboards.forEach((b) => {
      bounds.extend([b.lat, b.lng]);

      // Custom marker DivIcon
      const pinIcon = L.divIcon({
        className: 'billboard-marker-wrapper',
        html: `
          <div class="billboard-marker-pin ${b.levelTraffic}">
            <svg style="width:16px;height:16px;fill:none;stroke:currentColor;stroke-width:2.2;" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918" />
            </svg>
          </div>
        `,
        iconSize: [36, 36],
        iconAnchor: [18, 18],
        popupAnchor: [0, -20]
      });

      const marker = L.marker([b.lat, b.lng], { icon: pinIcon });

      // Clean HTML Tooltip
      const badgeColor =
        b.levelTraffic === 'tinggi'
          ? '#e11d48'
          : b.levelTraffic === 'sedang'
          ? '#d97706'
          : '#059669';

      marker.bindTooltip(
        `
        <div style="font-family:'Plus Jakarta Sans',sans-serif;">
          <div style="font-weight:700;color:#0f172a;font-size:12px;">${b.nama}</div>
          <div style="display:flex;align-items:center;gap:6px;margin-top:2px;font-size:11px;color:#64748b;">
            <span>${b.kota}</span>
            <span>•</span>
            <span style="font-weight:700;color:${badgeColor};text-transform:capitalize;">Trafik ${b.levelTraffic}</span>
          </div>
        </div>
      `,
        {
          direction: 'top',
          className: 'custom-map-tooltip',
          offset: [0, -14]
        }
      );

      // Popup content
      const popupHtml = `
        <div style="min-width:220px;font-family:'Plus Jakarta Sans',sans-serif;">
          ${
            b.foto
              ? `<div style="margin:-12px -14px 8px -14px;height:100px;overflow:hidden;border-radius:14px 14px 0 0;">
                   <img src="${b.foto}" alt="${b.nama}" style="width:100%;height:100%;object-fit:cover;display:block;" />
                 </div>`
              : ''
          }
          <div style="display:flex;align-items:center;justify-content:between;gap:6px;margin-bottom:6px;">
            <span style="font-family:monospace;font-size:10px;font-weight:700;background:#eff6ff;color:#1d4ed8;padding:2px 6px;border-radius:4px;border:1px solid #bfdbfe;">
              ${b.id}
            </span>
            <span style="font-size:11px;font-weight:700;color:${badgeColor};text-transform:capitalize;">
              ● Trafik ${b.levelTraffic}
            </span>
          </div>
          <h4 style="font-size:13px;font-weight:700;color:#0f172a;margin:0 0 4px 0;line-height:1.3;">
            ${b.nama}
          </h4>
          <p style="font-size:11px;color:#64748b;margin:0 0 8px 0;line-height:1.3;">
            📍 ${b.alamat}, ${b.kota}
          </p>
          <div style="display:flex;gap:6px;margin-top:8px;">
            <button id="btn-drawer-${b.id}" style="flex:1;background:#2563eb;color:#ffffff;border:none;border-radius:6px;padding:6px 10px;font-size:11px;font-weight:700;cursor:pointer;">
              Lihat Detail Analisis
            </button>
          </div>
        </div>
      `;

      marker.bindPopup(popupHtml);

      // Click on marker
      marker.on('click', () => {
        onSelectBillboard(b);
      });

      // Handle popup button click
      marker.on('popupopen', () => {
        const btn = document.getElementById(`btn-drawer-${b.id}`);
        if (btn) {
          btn.onclick = () => {
            onSelectBillboard(b);
            marker.closePopup();
          };
        }
      });

      clusterGroup.addLayer(marker);
      markersMapRef.current.set(b.id, marker);
    });

    // Auto-fit camera bounds to active markers
    if (displayedBillboards.length > 0 && bounds.isValid()) {
      if (displayedBillboards.length === 1) {
        map.setView([displayedBillboards[0].lat, displayedBillboards[0].lng], 14, { animate: true });
      } else {
        map.fitBounds(bounds, {
          padding: [50, 50],
          maxZoom: selectedCity === 'Semua' ? 12 : 14,
          animate: true
        });
      }
    }
  }, [displayedBillboards, isMapReady, onSelectBillboard, selectedCity]);

  // Center on billboard if selectedBillboard changes
  useEffect(() => {
    if (!selectedBillboard || !mapInstanceRef.current) return;
    const map = mapInstanceRef.current;
    map.flyTo([selectedBillboard.lat, selectedBillboard.lng], Math.max(map.getZoom(), 14), {
      duration: 1.2
    });

    const marker = markersMapRef.current.get(selectedBillboard.id);
    if (marker && clusterGroupRef.current) {
      clusterGroupRef.current.zoomToShowLayer(marker, () => {
        marker.openPopup();
      });
    }
  }, [selectedBillboard]);

  // Reset view to bounds
  const handleResetBounds = () => {
    if (!mapInstanceRef.current || displayedBillboards.length === 0) return;
    const bounds = L.latLngBounds(displayedBillboards.map((b) => [b.lat, b.lng]));
    if (bounds.isValid()) {
      mapInstanceRef.current.fitBounds(bounds, { padding: [50, 50], animate: true });
    }
  };

  return (
    <div className={`relative w-full rounded-2xl overflow-hidden border border-slate-200 shadow-xs bg-slate-100 ${className}`}>
      {/* Leaflet Map Canvas with Google Maps Tiles */}
      <div ref={mapContainerRef} className="w-full h-full min-h-[460px] z-10" />

      {/* Floating Top-Left Controls: Traffic Level Filter & Controls */}
      <div className="absolute top-3 left-3 z-20 flex flex-wrap items-center gap-2">
        {/* Google Maps Layer Type Switcher Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowLayerMenu(!showLayerMenu)}
            className="flex items-center gap-1.5 bg-white/95 backdrop-blur-md hover:bg-white text-slate-800 font-bold px-3 py-1.5 rounded-full border border-slate-200/90 shadow-md text-xs transition-all"
          >
            <Layers className="w-3.5 h-3.5 text-blue-600" />
            <span>{GMAP_TILES[activeTileLayer].shortLabel}</span>
          </button>

          {showLayerMenu && (
            <div className="absolute top-full left-0 mt-1.5 bg-white rounded-xl shadow-xl border border-slate-200 p-1.5 min-w-[170px] z-30 animate-in fade-in zoom-in-95 duration-150">
              <div className="text-[10px] font-bold text-slate-400 px-2 py-1 uppercase tracking-wider">
                Tipe Google Maps
              </div>
              {(Object.keys(GMAP_TILES) as GMapStyle[]).map((key) => {
                const isSelected = activeTileLayer === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => {
                      setActiveTileLayer(key);
                      setShowLayerMenu(false);
                    }}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-semibold text-left transition-colors ${
                      isSelected
                        ? 'bg-blue-50 text-blue-700 font-bold'
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span>{GMAP_TILES[key].label}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-blue-600" />}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Traffic Level Filter Pill Group */}
        <div className="flex items-center bg-white/95 backdrop-blur-md p-1 rounded-full border border-slate-200/90 shadow-md text-xs">
          <span className="px-2.5 text-slate-400 font-medium flex items-center gap-1">
            <Filter className="w-3 h-3 text-slate-500" />
            <span className="hidden sm:inline">Level:</span>
          </span>
          <button
            type="button"
            onClick={() => setLevelFilter('all')}
            className={`px-2.5 py-1 rounded-full font-bold transition-all ${
              levelFilter === 'all'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Semua ({billboards.length})
          </button>
          <button
            type="button"
            onClick={() => setLevelFilter('tinggi')}
            className={`px-2.5 py-1 rounded-full font-bold flex items-center gap-1 transition-all ${
              levelFilter === 'tinggi'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-rose-600'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-rose-500 inline-block" />
            Tinggi
          </button>
          <button
            type="button"
            onClick={() => setLevelFilter('sedang')}
            className={`px-2.5 py-1 rounded-full font-bold flex items-center gap-1 transition-all ${
              levelFilter === 'sedang'
                ? 'bg-amber-500 text-white shadow-xs'
                : 'text-slate-600 hover:text-amber-600'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-amber-400 inline-block" />
            Sedang
          </button>
          <button
            type="button"
            onClick={() => setLevelFilter('rendah')}
            className={`px-2.5 py-1 rounded-full font-bold flex items-center gap-1 transition-all ${
              levelFilter === 'rendah'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-emerald-600'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />
            Rendah
          </button>
        </div>

        {/* Fit Bounds Button */}
        <button
          type="button"
          onClick={handleResetBounds}
          title="Fokuskan Semua Titik di Peta"
          className="bg-white/95 backdrop-blur-md hover:bg-white text-slate-700 font-semibold p-2 rounded-full border border-slate-200/90 shadow-md transition-all flex items-center gap-1.5 text-xs px-3"
        >
          <RefreshCw className="w-3.5 h-3.5 text-blue-600" />
          <span className="hidden md:inline">Reset Posisi</span>
        </button>
      </div>

      {/* Floating Bottom-Left Legend Overlay */}
      <div className="absolute bottom-4 left-4 z-20 bg-white/95 backdrop-blur-md rounded-xl p-3 border border-slate-200 shadow-lg text-[11px] space-y-1.5 max-w-xs">
        <div className="font-bold text-slate-800 flex items-center justify-between border-b border-slate-100 pb-1.5 mb-1.5">
          <span>Kategori Volume Traffic</span>
          <span className="text-[10px] font-normal text-slate-400">Harian (OTS)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-rose-500 shadow-xs shrink-0" />
          <span className="font-semibold text-slate-700">Trafik Tinggi</span>
          <span className="text-slate-400 ml-auto">&gt; 350.000 / hari</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-amber-500 shadow-xs shrink-0" />
          <span className="font-semibold text-slate-700">Trafik Sedang</span>
          <span className="text-slate-400 ml-auto">200k – 350k / hari</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-emerald-500 shadow-xs shrink-0" />
          <span className="font-semibold text-slate-700">Trafik Rendah</span>
          <span className="text-slate-400 ml-auto">&lt; 200.000 / hari</span>
        </div>
        <div className="pt-1.5 border-t border-slate-100 text-[10px] text-slate-400 flex items-center gap-1">
          <Compass className="w-3 h-3 text-blue-500" />
          <span>Peta Google Maps • Klik pin untuk detail</span>
        </div>
      </div>

      {/* Floating Bottom-Right Google Maps Brand & Active Count Pill */}
      <div className="absolute bottom-4 right-4 z-20 flex items-center gap-2">
        <div className="bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-full border border-slate-200 shadow-md text-[11px] font-bold text-slate-700 flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
          <span>
            {displayedBillboards.length} Titik Ditampilkan
          </span>
        </div>
      </div>
    </div>
  );
};