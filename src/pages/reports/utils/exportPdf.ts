import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { 
  getBillboards, 
  getBillboardById, 
  getTrafficByBillboard, 
  getDemografiByBillboard 
} from '../../../lib/mockData';
import { Billboard } from '../../../types';
import { ReportConfig } from '../types';

export interface ExportPdfResult {
  fileName: string;
  fileSize: string;
  billboardCount: number;
}

export async function generatePdfReport(config: ReportConfig): Promise<ExportPdfResult> {
  // 1. Resolve Billboards in Scope
  let billboards: Billboard[] = [];
  let scopeLabel = 'Semua Titik (Nasional)';

  if (config.scopeType === 'city' && config.city) {
    billboards = getBillboards({ kota: config.city });
    scopeLabel = `Wilayah Kota ${config.city} (${billboards.length} Titik)`;
  } else if (config.scopeType === 'single' && config.billboardId) {
    const single = getBillboardById(config.billboardId);
    if (single) {
      billboards = [single];
      scopeLabel = `${single.id} - ${single.nama} (${single.kota})`;
    } else {
      billboards = getBillboards().slice(0, 1);
      scopeLabel = `${billboards[0].id} - ${billboards[0].nama}`;
    }
  } else {
    billboards = getBillboards();
    scopeLabel = `Semua Wilayah Nasional (${billboards.length} Titik)`;
  }

  const daysCount = config.timeRange === 'harian' ? 1 : config.timeRange === 'mingguan' ? 7 : 30;
  const timeRangeLabel = config.timeRange === 'harian' ? 'Harian (1 Hari Terakhir)' : 
                         config.timeRange === 'mingguan' ? 'Mingguan (7 Hari Terakhir)' : 'Bulanan (30 Hari Terakhir)';

  // 2. Aggregate Data
  let grandTotalMotor = 0;
  let grandTotalMobil = 0;
  let grandTotalPedestrian = 0;
  let grandTotalTruck = 0;

  const billboardSummaries = billboards.map(b => {
    const records = getTrafficByBillboard(b.id, daysCount);
    const latest = records[records.length - 1] || { motor: 0, mobil: 0, pejalanKaki: 0, truk: 0, total: 0 };
    
    // Calculate average over period
    const avgMotor = Math.round(records.reduce((acc, r) => acc + r.motor, 0) / records.length);
    const avgMobil = Math.round(records.reduce((acc, r) => acc + r.mobil, 0) / records.length);
    const avgPedestrian = Math.round(records.reduce((acc, r) => acc + r.pejalanKaki, 0) / records.length);
    const avgTruck = Math.round(records.reduce((acc, r) => acc + r.truk, 0) / records.length);
    const avgTotal = avgMotor + avgMobil + avgPedestrian + avgTruck;

    grandTotalMotor += avgMotor;
    grandTotalMobil += avgMobil;
    grandTotalPedestrian += avgPedestrian;
    grandTotalTruck += avgTruck;

    const demografi = getDemografiByBillboard(b.id);

    return {
      billboard: b,
      records,
      latest,
      avgMotor,
      avgMobil,
      avgPedestrian,
      avgTruck,
      avgTotal,
      demografi
    };
  });

  const grandTotalDaily = grandTotalMotor + grandTotalMobil + grandTotalPedestrian + grandTotalTruck;
  const avgPerSpot = billboards.length > 0 ? Math.round(grandTotalDaily / billboards.length) : 0;
  const motorPct = grandTotalDaily > 0 ? Math.round((grandTotalMotor / grandTotalDaily) * 100) : 0;
  const mobilPct = grandTotalDaily > 0 ? Math.round((grandTotalMobil / grandTotalDaily) * 100) : 0;

  // 3. Initialize jsPDF Document (A4 portrait)
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 14;
  let currentY = 14;

  // Header Banner
  doc.setFillColor(23, 37, 84); // dark blue (#172554)
  doc.roundedRect(margin, currentY, pageWidth - margin * 2, 28, 2, 2, 'F');

  doc.setTextColor(191, 219, 254); // light blue
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text('NEXTRAFFIC INTELLIGENCE • OOH TRAFFIC DOSSIER', margin + 6, currentY + 7);

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  const reportTitle = config.title.length > 50 ? config.title.substring(0, 47) + '...' : config.title;
  doc.text(reportTitle, margin + 6, currentY + 16);

  doc.setTextColor(226, 232, 240);
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.text(`Klien: ${config.clientName || 'Mitra Pengiklan'}  |  Target Wilayah: ${scopeLabel}`, margin + 6, currentY + 23);

  currentY += 33;

  // Metadata Box
  doc.setFillColor(248, 250, 252); // slate-50
  doc.setDrawColor(226, 232, 240); // slate-200
  doc.roundedRect(margin, currentY, pageWidth - margin * 2, 17, 1.5, 1.5, 'FD');

  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139); // slate-500
  doc.text('TANGGAL DITERBITKAN', margin + 5, currentY + 5.5);
  doc.text('RENTANG PERIODE ANALISIS', margin + 55, currentY + 5.5);
  doc.text('CAKUPAN ANALISIS', margin + 115, currentY + 5.5);

  doc.setFontSize(8.5);
  doc.setTextColor(15, 23, 42); // slate-900
  doc.setFont('helvetica', 'bold');
  
  const todayStr = new Date().toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
  doc.text(todayStr, margin + 5, currentY + 11.5);
  doc.text(timeRangeLabel, margin + 55, currentY + 11.5);
  doc.text(scopeLabel.substring(0, 32), margin + 115, currentY + 11.5);

  currentY += 22;

  // 4 Executive KPI Cards
  const cardWidth = (pageWidth - margin * 2 - 9) / 4;
  const cardHeight = 18;

  const kpis = [
    { label: 'TOTAL TITIK SPOT', value: `${billboards.length} Titik`, sub: 'Lokasi billboard aktif' },
    { label: 'EST. TRAFIK HARIAN', value: grandTotalDaily.toLocaleString('id-ID'), sub: 'Total impresi per hari' },
    { label: 'RATA-RATA PER TITIK', value: avgPerSpot.toLocaleString('id-ID'), sub: 'Volume kendaraan/spot' },
    { label: 'SEBARAN MODA UTAMA', value: `${motorPct}% Motor / ${mobilPct}% Mobil`, sub: 'Proporsi dominan' },
  ];

  kpis.forEach((kpi, idx) => {
    const x = margin + idx * (cardWidth + 3);
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(203, 213, 225); // slate-300
    doc.roundedRect(x, currentY, cardWidth, cardHeight, 1.5, 1.5, 'FD');

    // Accent line on top of each card
    doc.setFillColor(idx === 0 ? 37 : idx === 1 ? 16 : idx === 2 ? 147 : 217, 
                     idx === 0 ? 99 : idx === 1 ? 185 : idx === 2 ? 51 : 119, 
                     idx === 0 ? 235 : idx === 1 ? 129 : idx === 2 ? 234 : 6);
    doc.rect(x, currentY, cardWidth, 1.5, 'F');

    doc.setFontSize(6.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(100, 116, 139);
    doc.text(kpi.label, x + 3.5, currentY + 5.5);

    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text(kpi.value, x + 3.5, currentY + 11.5);

    doc.setFontSize(6);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(148, 163, 184);
    doc.text(kpi.sub, x + 3.5, currentY + 15.5);
  });

  currentY += cardHeight + 6;

  // Section 1: Tabel Titik Billboard
  doc.setFontSize(9.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('1. DAFTAR TITIK BILLBOARD & PROFIL LOKASI', margin, currentY + 3);
  currentY += 5;

  const billboardTableBody = billboardSummaries.map((item, index) => [
    (index + 1).toString(),
    item.billboard.id,
    item.billboard.nama,
    item.billboard.kota,
    `${item.billboard.tipe || 'LED'} (${item.billboard.ukuran || 'Standar'})`,
    item.billboard.levelTraffic.toUpperCase(),
    item.avgTotal.toLocaleString('id-ID')
  ]);

  autoTable(doc, {
    startY: currentY,
    head: [['No', 'ID', 'Nama Billboard', 'Kota', 'Tipe & Format', 'Level Trafik', 'Est. Trafik/Hari']],
    body: billboardTableBody,
    margin: { left: margin, right: margin },
    styles: {
      fontSize: 7.5,
      cellPadding: 2,
      textColor: [51, 65, 85]
    },
    headStyles: {
      fillColor: [30, 58, 138],
      textColor: 255,
      fontStyle: 'bold',
      fontSize: 7.5
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252]
    },
    columnStyles: {
      0: { cellWidth: 8, halign: 'center' },
      1: { cellWidth: 16, fontStyle: 'bold' },
      2: { cellWidth: 52 },
      3: { cellWidth: 22 },
      4: { cellWidth: 38 },
      5: { cellWidth: 20, halign: 'center' },
      6: { cellWidth: 26, halign: 'right', fontStyle: 'bold' }
    }
  });

  currentY = (doc as any).lastAutoTable.finalY + 8;

  // Check if we need a new page for Section 2 & 3
  if (currentY > pageHeight - 65) {
    doc.addPage();
    currentY = 16;
  }

  // Section 2: Breakdown Moda Transportasi (if enabled)
  if (config.includeVehicleBreakdown) {
    doc.setFontSize(9.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text('2. ESTIMASI TRAFIK HARIAN PER KATEGORI MODA TRANSPORTASI', margin, currentY + 3);
    currentY += 5;

    const vehicleTableBody = billboardSummaries.map(item => [
      item.billboard.id,
      item.billboard.nama,
      item.avgMotor.toLocaleString('id-ID'),
      item.avgMobil.toLocaleString('id-ID'),
      item.avgPedestrian.toLocaleString('id-ID'),
      item.avgTruck.toLocaleString('id-ID'),
      item.avgTotal.toLocaleString('id-ID')
    ]);

    // Add aggregate total row
    vehicleTableBody.push([
      'TOTAL',
      'Akumulasi Keseluruhan Titik',
      grandTotalMotor.toLocaleString('id-ID'),
      grandTotalMobil.toLocaleString('id-ID'),
      grandTotalPedestrian.toLocaleString('id-ID'),
      grandTotalTruck.toLocaleString('id-ID'),
      grandTotalDaily.toLocaleString('id-ID')
    ]);

    autoTable(doc, {
      startY: currentY,
      head: [['ID Titik', 'Nama Titik Billboard', 'Sepeda Motor', 'Mobil Pribadi', 'Pejalan Kaki', 'Truk / Bus', 'Total Trafik']],
      body: vehicleTableBody,
      margin: { left: margin, right: margin },
      styles: {
        fontSize: 7.2,
        cellPadding: 1.8,
        textColor: [51, 65, 85]
      },
      headStyles: {
        fillColor: [15, 118, 110], // emerald/teal
        textColor: 255,
        fontStyle: 'bold',
        fontSize: 7.2
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252]
      },
      columnStyles: {
        0: { cellWidth: 16, fontStyle: 'bold' },
        1: { cellWidth: 54 },
        2: { cellWidth: 23, halign: 'right' },
        3: { cellWidth: 23, halign: 'right' },
        4: { cellWidth: 22, halign: 'right' },
        5: { cellWidth: 20, halign: 'right' },
        6: { cellWidth: 24, halign: 'right', fontStyle: 'bold' }
      },
      didParseCell: function(data) {
        if (data.row.index === vehicleTableBody.length - 1) {
          data.cell.styles.fontStyle = 'bold';
          data.cell.styles.fillColor = [241, 245, 249];
        }
      }
    });

    currentY = (doc as any).lastAutoTable.finalY + 8;
  }

  // Check if we need a new page for Section 3
  if (currentY > pageHeight - 65) {
    doc.addPage();
    currentY = 16;
  }

  // Section 3: Analisis Demografi Sekitar (if enabled)
  if (config.includeDemographics) {
    doc.setFontSize(9.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text('3. PROFIL DEMOGRAFI & AUDIENS SEKITAR TITIK (RADIUS 1 KM)', margin, currentY + 3);
    currentY += 5;

    const demoTableBody = billboardSummaries.map(item => [
      item.billboard.id,
      item.billboard.nama,
      `${item.demografi.kepadatanPerKm2.toLocaleString('id-ID')} /km²`,
      `Kelas ${item.demografi.estimasiPendapatan.toUpperCase()}`,
      `25-34 thn (${item.demografi.distribusiUsia['25-34']}%)`,
      config.includePoi ? (item.demografi.poiTerdekat?.slice(0, 2).join(', ') || '-') : '-'
    ]);

    autoTable(doc, {
      startY: currentY,
      head: [['ID Titik', 'Nama Titik Billboard', 'Kepadatan Penduduk', 'Tingkat SES', 'Kelompok Usia Dominan', 'POI Keramaian Terdekat']],
      body: demoTableBody,
      margin: { left: margin, right: margin },
      styles: {
        fontSize: 7.2,
        cellPadding: 1.8,
        textColor: [51, 65, 85]
      },
      headStyles: {
        fillColor: [67, 56, 202], // indigo
        textColor: 255,
        fontStyle: 'bold',
        fontSize: 7.2
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252]
      },
      columnStyles: {
        0: { cellWidth: 16, fontStyle: 'bold' },
        1: { cellWidth: 50 },
        2: { cellWidth: 26, halign: 'right' },
        3: { cellWidth: 22, halign: 'center' },
        4: { cellWidth: 32 },
        5: { cellWidth: 36 }
      }
    });

    currentY = (doc as any).lastAutoTable.finalY + 8;
  }

  // Section 4: Catatan Khusus & Rekomendasi OOH
  if (currentY > pageHeight - 45) {
    doc.addPage();
    currentY = 16;
  }

  doc.setFillColor(241, 245, 249);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(margin, currentY, pageWidth - margin * 2, 24, 1.5, 1.5, 'FD');

  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 58, 138);
  doc.text('INSIGHT & REKOMENDASI PERENCANAAN IKLAN LUAR RUANG (OOH):', margin + 4, currentY + 5.5);

  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  
  const notesText = config.notes ? `Catatan Analis: ${config.notes}\n` : '';
  const recommendation = `${notesText}• Koridor dengan traffic harian di atas 300.000 sangat direkomendasikan untuk kampanye brand awareness berskala masif (FMCG, Telekomunikasi, Perbankan).
• Proporsi audiens produktif (usia 25-34 tahun mencapai 38%) dengan status ekonomi menengah-tinggi memberikan tingkat konversi tinggi untuk produk lifestyle, otomotif, dan investasi.
• Data di atas dihasilkan secara deterministik oleh engine NexTraffic Intelligence untuk keperluan evaluasi & perencanaan slot periklanan.`;

  const splitLines = doc.splitTextToSize(recommendation, pageWidth - margin * 2 - 8);
  doc.text(splitLines, margin + 4, currentY + 10.5);

  // Footer for all pages
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);

    // Separator line
    doc.setDrawColor(226, 232, 240);
    doc.line(margin, pageHeight - 11, pageWidth - margin, pageHeight - 11);

    doc.setFontSize(6.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(148, 163, 184);
    doc.text(
      'Dokumen Rahasia • NexTraffic Intelligence Dashboard • Diterbitkan untuk keperluan evaluasi penempatan iklan OOH',
      margin,
      pageHeight - 7
    );

    doc.text(
      `Halaman ${i} dari ${totalPages}`,
      pageWidth - margin - 18,
      pageHeight - 7
    );
  }

  // Generate File Name & Trigger Download
  const cleanScope = config.scopeType === 'city' ? (config.city || 'Kota') : 
                     config.scopeType === 'single' ? (config.billboardId || 'Spot') : 'Nasional';
  const cleanDate = new Date().toISOString().split('T')[0];
  const fileName = `NexTraffic_Report_${cleanScope}_${cleanDate}.pdf`;

  // Trigger browser download
  doc.save(fileName);

  // Approximate size estimate
  const pdfOutput = doc.output('arraybuffer');
  const sizeKb = Math.round(pdfOutput.byteLength / 1024);
  const fileSize = sizeKb > 1024 ? `${(sizeKb / 1024).toFixed(1)} MB` : `${sizeKb} KB`;

  return {
    fileName,
    fileSize,
    billboardCount: billboards.length
  };
}
