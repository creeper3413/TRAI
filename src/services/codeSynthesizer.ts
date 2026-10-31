// TRAİ High-Reliability Code & Game Synthesizer
// Provides verified working algorithms, games, and modules with human-crafted clarity

import {
  SPACE_ARCADE_2099_HTML,
  CYBER_SNAKE_2099_HTML,
  CYBER_BREAKOUT_HTML,
} from '../data/gameTemplates.ts';

export interface SynthesizedCode {
  code: string;
  explanation: string;
  filename: string;
  language: string;
  category: string;
  runnable: boolean;
}

export function synthesizeFallbackCode(
  prompt: string,
  requestedLanguage: string = 'python',
  userTitle: string = 'Efendim'
): SynthesizedCode {
  const p = prompt.toLowerCase();
  const isGame =
    requestedLanguage === 'game' ||
    p.includes('oyun') ||
    p.includes('game') ||
    p.includes('arcade') ||
    p.includes('canvas') ||
    p.includes('snake') ||
    p.includes('uzay') ||
    p.includes('breakout');

  // 1. GAME GENERATION
  if (isGame) {
    if (p.includes('yılan') || p.includes('snake')) {
      return {
        code: CYBER_SNAKE_2099_HTML,
        explanation: `${userTitle}, sizin için akıcı bir Cyber Yılan oyunu hazırladım. Neon ızgara, hızlanan enerji orbları, en yüksek skor takibi ve hem klavye (yön tuşları / WASD) hem de dokunmatik butonlarla çok rahat oynayabilirsiniz.`,
        filename: 'CyberSnake2099.html',
        language: 'game',
        category: 'game',
        runnable: true,
      };
    }

    if (p.includes('breakout') || p.includes('tuğla') || p.includes('kırıcı') || p.includes('top')) {
      return {
        code: CYBER_BREAKOUT_HTML,
        explanation: `${userTitle}, Quantum Breakout tuğla kırma oyununu hazırladım. Foton enerji topu, raket açı fiziği ve renkli tuğla parçalanma efektleri içeriyor. Keyifle oynayabilirsiniz!`,
        filename: 'QuantumBreakout.html',
        language: 'game',
        category: 'game',
        runnable: true,
      };
    }

    // Default: Space Arcade 2099
    return {
      code: SPACE_ARCADE_2099_HTML,
      explanation: `${userTitle}, Space Arcade retro uzay savaşı oyununu eksiksiz olarak hazırladım. 60 FPS Canvas grafikleri, lazer sesleri, patlama efektleri ve kalkan sistemi bulunuyor. Yön tuşları veya ekrandaki butonlarla doğrudan oynayabilirsiniz.`,
      filename: 'SpaceArcade2099.html',
      language: 'game',
      category: 'game',
      runnable: true,
    };
  }

  // 2. PYTHON ALGORITHMS & SCRIPTS
  if (requestedLanguage === 'python' || p.includes('python')) {
    if (p.includes('matematik') || p.includes('hesap') || p.includes('fibonacci')) {
      return {
        code: `"""
TRAİ Matematik & Algoritma Modülü
Net, anlaşılır ve optimize edilmiş Python çözümü
"""

import time
from typing import List, Generator

def fibonacci_generator(n: int) -> Generator[int, None, None]:
    """Hafıza dostu (O(1) space) Fibonacci üreteci."""
    a, b = 0, 1
    for _ in range(n):
        yield a
        a, b = b, a + b

def calculate_math_metrics(numbers: List[float]) -> dict:
    """Temel istatistiksel ve matematiksel metrik analizi."""
    if not numbers:
        return {"error": "Boş liste"}
    
    total = sum(numbers)
    count = len(numbers)
    mean = total / count
    variance = sum((x - mean) ** 2 for x in numbers) / count
    std_dev = variance ** 0.5
    
    return {
        "eleman_sayisi": count,
        "toplam": round(total, 4),
        "ortalama": round(mean, 4),
        "standart_sapma": round(std_dev, 4),
        "en_kucuk": min(numbers),
        "en_buyuk": max(numbers)
    }

if __name__ == "__main__":
    print("[TRAİ] Matematik ve Algoritma Motoru Çalıştırılıyor...")
    
    # 1. Fibonacci ilk 15 terim
    fib_series = list(fibonacci_generator(15))
    print(f"Fibonacci İlk 15 Terim: {fib_series}")
    
    # 2. Metrik Analizi
    sample_data = [12.5, 45.0, 78.2, 33.1, 90.4, 22.8]
    metrics = calculate_math_metrics(sample_data)
    print("İstatistiksel Metrik Raporu:")
    for key, val in metrics.items():
        print(f" - {key}: {val}")
    
    print("[TRAİ] Yürütme başarıyla tamamlandı. Exit Code: 0")`,
        explanation: `${userTitle}, yüksek performanslı Fibonacci üreteci ve istatistiksel metrik hesaplama sınıfı Python ile yazıldı. O(1) bellek karmaşıklığı ile optimize edildi.`,
        filename: 'math_engine.py',
        language: 'python',
        category: 'ai',
        runnable: true,
      };
    }

    // Python REST / FastAPI or Data Analysis
    return {
      code: `"""
TRAİ Veri İşleme & Algoritma Çekirdeği
Python 3.12+ Tip Güvenlikli Veri Yapıları
"""

import json
from dataclasses import dataclass, asdict
from datetime import datetime

@dataclass
class TelemetryPacket:
    sensor_id: str
    voltage: float
    temperature: float
    status: str
    timestamp: str = datetime.now().isoformat()

class TraiDataProcessor:
    def __init__(self, name: str = "Primary-Core"):
        self.name = name
        self.packets = []

    def ingest_packet(self, sensor_id: str, voltage: float, temperature: float) -> TelemetryPacket:
        status = "NOMINAL"
        if voltage < 11.5 or voltage > 14.5:
            status = "CRITICAL_VOLTAGE"
        elif temperature > 75.0:
            status = "OVERHEAT_WARNING"
            
        packet = TelemetryPacket(sensor_id, voltage, temperature, status)
        self.packets.append(packet)
        return packet

    def generate_report(self) -> str:
        report = {
            "core": self.name,
            "total_packets": len(self.packets),
            "telemetry": [asdict(p) for p in self.packets]
        }
        return json.dumps(report, indent=2, ensure_ascii=False)

if __name__ == "__main__":
    processor = TraiDataProcessor()
    processor.ingest_packet("AKILLI_CEKIRDEK_01", 12.4, 48.2)
    processor.ingest_packet("ISLEM_BOLUMU", 14.8, 62.1)
    print(processor.generate_report())`,
      explanation: `${userTitle}, Python dataclass ve tip güvenliği ile donatılmış telemetri analiz motoru yazıldı.`,
      filename: 'data_processor.py',
      language: 'python',
      category: 'ai',
      runnable: true,
    };
  }

  // 3. REACT / FRONTEND COMPONENT
  if (requestedLanguage === 'react' || requestedLanguage === 'typescript' || p.includes('react')) {
    return {
      code: `import React, { useState } from 'react';
import { Shield, Zap, Activity, RefreshCw } from 'lucide-react';

export const FuturisticTelemetryCard: React.FC = () => {
  const [corePower, setCorePower] = useState(98.4);
  const [isOverclocked, setIsOverclocked] = useState(false);

  const handleToggleOverclock = () => {
    setIsOverclocked(!isOverclocked);
    setCorePower(isOverclocked ? 98.4 : 124.6);
  };

  return (
    <div className="p-6 rounded-2xl bg-slate-950 border border-cyan-500/30 shadow-[0_0_25px_rgba(6,182,212,0.15)] text-slate-100 max-w-md mx-auto font-mono">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2 text-cyan-400">
          <Activity className="w-5 h-5 animate-pulse" />
          <span className="font-bold tracking-wider text-xs">STARK HUD ÇEKİRDEĞİ</span>
        </div>
        <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
          ONLINE
        </span>
      </div>

      <div className="my-5 text-center">
        <div className="text-4xl font-extrabold text-cyan-300 tracking-tight">
          {corePower}%
        </div>
        <div className="text-xs text-slate-400 mt-1">Reaktör Çıkış Verimliliği</div>
      </div>

      <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden mb-6 border border-slate-800">
        <div
          style={{ width: \`\${Math.min(100, (corePower / 130) * 100)}%\` }}
          className={\`h-full transition-all duration-500 \${isOverclocked ? 'bg-amber-400' : 'bg-cyan-400'}\`}
        />
      </div>

      <button
        onClick={handleToggleOverclock}
        className="w-full py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md"
      >
        <Zap className="w-4 h-4" />
        <span>{isOverclocked ? 'Nominal Güce Dön' : 'Hız Aşırtmayı (Overclock) Başlat'}</span>
      </button>
    </div>
  );
};
export default FuturisticTelemetryCard;`,
      explanation: `${userTitle}, React, Tailwind CSS ve Lucide ikonlarıyla tasarlanmış fütüristik durum monitörü bileşeni hazırlandı.`,
      filename: 'FuturisticTelemetryCard.tsx',
      language: 'react',
      category: 'web',
      runnable: true,
    };
  }

  // 4. SQL QUERIES
  if (requestedLanguage === 'sql' || p.includes('sql') || p.includes('veritabanı')) {
    return {
      code: `-- J.A.R.V.I.S. Yüksek Hızlı PostgreSQL Güvenli Etkinlik Günlüğü Şeması
CREATE TABLE IF NOT EXISTS system_event_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_type VARCHAR(64) NOT NULL,
    severity VARCHAR(16) CHECK (severity IN ('INFO', 'WARNING', 'CRITICAL')),
    payload JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Hızlı JSONB sorguları için GIN indeksi
CREATE INDEX IF NOT EXISTS idx_event_payload ON system_event_logs USING GIN (payload);
CREATE INDEX IF NOT EXISTS idx_event_time_severity ON system_event_logs (created_at DESC, severity);

-- Son 24 saatteki kritik anomali analiz sorgusu
SELECT 
    event_type,
    COUNT(*) as total_occurrences,
    MIN(created_at) as first_seen,
    MAX(created_at) as last_seen
FROM system_event_logs
WHERE severity = 'CRITICAL'
  AND created_at >= NOW() - INTERVAL '24 hours'
GROUP BY event_type
ORDER BY total_occurrences DESC
LIMIT 50;`,
      explanation: `${userTitle}, PostgreSQL için JSONB indeksli optimize edilmiş etkinlik günlüğü tablosu ve analiz sorgusu yazıldı.`,
      filename: 'schema_and_query.sql',
      language: 'sql',
      category: 'backend',
      runnable: true,
    };
  }

  // Default: Universal JS/TS
  return {
    code: `// TRAİ Universal Logic Engine
export function executeNeuralAnalysis<T>(dataset: T[], predicate: (item: T) => boolean): { matched: T[]; total: number } {
  console.log('[TRAİ] Veri kümesi inceleniyor, toplam kayıt:', dataset.length);
  const matched = dataset.filter(predicate);
  return {
    matched,
    total: dataset.length
  };
}

// Test yürütmesi
const testScores = [92, 45, 88, 72, 99, 61];
const passed = executeNeuralAnalysis(testScores, score => score >= 70);
console.log('Başarılı Sonuçlar:', passed);`,
    explanation: `${userTitle}, tip korumalı TypeScript veri filtreleme ve analiz fonksiyonu derlendi.`,
    filename: 'neural_logic.ts',
    language: 'typescript',
    category: 'systems',
    runnable: true,
  };
}
