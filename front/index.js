import React, { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const timeRanges = ["10m", "1h", "1d", "1w"];

export default function BusDashboard() {
  const [busStatus, setBusStatus] = useState([]);
  const [selectedBusId, setSelectedBusId] = useState("0");
  const [selectedTimeRange, setSelectedTimeRange] = useState("10m");
  const [busStatistics, setBusStatistics] = useState(null);

  useEffect(() => {
    fetch("http://0.0.0.0:8008/api/bus/status")
      .then((res) => res.json())
      .then((data) => setBusStatus(data));
  }, []);

  const fetchStatistics = () => {
    fetch(
      `http://0.0.0.0:8008/api/bus/statistics/${selectedBusId}?time_range=${selectedTimeRange}`
    )
      .then((res) => res.json())
      .then((data) => setBusStatistics(data));
  };

  return (
    <div className="p-4 space-y-6">
      <h1 className="text-3xl font-bold text-center">🚌 Bus Monitoring Dashboard</h1>

      <Card>
        <CardContent className="p-4">
          <h2 className="text-xl font-semibold mb-4">Live Bus Status</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {busStatus.map((bus) => (
              <Card key={bus.bus_id} className="bg-blue-50">
                <CardContent className="p-4 space-y-2">
                  <p className="font-medium">Bus ID: {bus.bus_id}</p>
                  <p>Status: {bus.status}</p>
                  <p>Passengers: {bus.current_count_passengers}/{bus.max_capacity}</p>
                  <p>Revenue: ${bus.revenue.toFixed(2)}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4 space-y-4">
          <h2 className="text-xl font-semibold">Get Bus Statistics</h2>
          <div className="flex flex-wrap gap-4 items-end">
            <div>
              <label className="block mb-1">Bus ID</label>
              <Input
                type="number"
                min="0"
                max="9"
                value={selectedBusId}
                onChange={(e) => setSelectedBusId(e.target.value)}
              />
            </div>

            <div>
              <label className="block mb-1">Time Range</label>
              <Select value={selectedTimeRange} onValueChange={setSelectedTimeRange}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="Select time range" />
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

            <Button onClick={fetchStatistics}>Get Statistics</Button>
          </div>

          {busStatistics && (
            <Card className="mt-4 bg-green-50">
              <CardContent className="p-4 space-y-2">
                <p><strong>Bus ID:</strong> {busStatistics.bus_id}</p>
                <p><strong>Total Passengers:</strong> {busStatistics.total_passengers}</p>
                <p><strong>Total Revenue:</strong> ${busStatistics.total_revenue.toFixed(2)}</p>
                <p><strong>Max Capacity:</strong> {busStatistics.max_capacity}</p>
                <p><strong>Last Update:</strong> {new Date(busStatistics.last_update).toLocaleString()}</p>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
