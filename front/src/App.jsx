import React, { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

const timeRanges = ["10m", "1h", "1d", "1w"];

export default function BusDashboard() {
  const [busStatus, setBusStatus] = useState([]);
  const [selectedBusId, setSelectedBusId] = useState("0");
  const [selectedTimeRange, setSelectedTimeRange] = useState("10m");
  const [busStatistics, setBusStatistics] = useState(null);

  const fetchBusStatus = () => {
    fetch("http://localhost:8008/api/bus/status")
      .then((res) => res.json())
      .then((data) => setBusStatus(data))
      .catch((error) => console.error("Ошибка при получении статуса автобусов:", error));
  };

  useEffect(() => {
    fetchBusStatus(); // Первоначальная загрузка
    const interval = setInterval(fetchBusStatus, 500); // Обновление каждые 3 секунды
    
    return () => clearInterval(interval); // Очистка интервала при размонтировании
  }, []);

  const fetchStatistics = () => {
    fetch(
      `http://localhost:8008/api/bus/statistics/${selectedBusId}?time_range=${selectedTimeRange}`
    )
      .then((res) => res.json())
      .then((data) => setBusStatistics(data))
      .catch((error) => console.error("Ошибка при получении статистики:", error));
  };

  const resetDatabase = async () => {
    try {
      await fetch("http://localhost:8008/api/reset-database", { method: "POST" });
      fetchBusStatus();
      setBusStatistics(null);
    } catch (error) {
      console.error("Ошибка при сбросе базы данных:", error);
    }
  };

  return (
    <div className="p-4 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">🚌 Мониторинг автобусов</h1>
        <Button onClick={resetDatabase} variant="destructive">Сбросить базу данных</Button>
      </div>

      <div className="bg-amber-200 border-2 border-amber-300 rounded-lg shadow-md">
        <div className="p-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Общая статистика</h2>
            <p className="text-lg font-medium">
              Общий доход: ₽{busStatus.reduce((sum, bus) => sum + bus.revenue, 0).toFixed(2)}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-sky-200 border-2 border-sky-300 rounded-lg shadow-md">
        <div className="p-4">
          <h2 className="text-xl font-semibold mb-4">Текущий статус автобусов</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {busStatus.map((bus) => (
              <div key={bus.bus_id} className="bg-sky-100 border-2 border-sky-200 rounded-lg shadow-sm">
                <div className="p-4 space-y-2">
                  <p className="font-medium">Автобус #{bus.bus_id}</p>
                  <p>Статус: {bus.status}</p>
                  <p>Пассажиры: {bus.current_count_passengers}/{bus.max_capacity}</p>
                  <p>Доход: ₽{bus.revenue.toFixed(2)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-emerald-200 border-2 border-emerald-300 rounded-lg shadow-md">
        <div className="p-4 space-y-4">
          <h2 className="text-xl font-semibold">Статистика автобуса</h2>
          <div className="flex flex-wrap gap-4 items-end">
            <div className="w-[120px]">
              <label className="block mb-1">ID автобуса</label>
              <Select value={selectedBusId} onValueChange={setSelectedBusId}>
                <SelectTrigger>
                  <SelectValue placeholder="Выберите автобус" />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 10 }, (_, i) => (
                    <SelectItem key={i} value={(i+1).toString()}>
                      {i+1}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="w-[120px]">
              <label className="block mb-1">Период</label>
              <Select value={selectedTimeRange} onValueChange={setSelectedTimeRange}>
                <SelectTrigger>
                  <SelectValue placeholder="Выберите период" />
                </SelectTrigger>
                <SelectContent>
                  {timeRanges.map((range) => (
                    <SelectItem key={range} value={range}>
                      {range}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button onClick={fetchStatistics}>Получить статистику</Button>
          </div>

          <div className="mt-4 bg-emerald-100 border-2 border-emerald-200 rounded-lg shadow-sm">
            <div className="p-4 space-y-2">
              <p><strong>ID автобуса:</strong> {busStatistics?.bus_id || '-'}</p>
              <p><strong>Всего пассажиров:</strong> {busStatistics?.total_passengers || '0'}</p>
              <p><strong>Общий доход:</strong> ₽{busStatistics?.total_revenue?.toFixed(2) || '0.00'}</p>
              <p><strong>Последнее обновление:</strong> {busStatistics?.last_update ? new Date(busStatistics.last_update).toLocaleString() : '-'}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
