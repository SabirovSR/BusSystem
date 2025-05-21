from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class PassengerArrival(BaseModel):
    bus_id: int
    entered: int
    exited: int
    timestamp: datetime = datetime.now()

class BusStatus(BaseModel):
    bus_id: int
    status: str
    current_count_passengers: int
    max_capacity: int
    revenue: float

class BusStatistics(BaseModel):
    bus_id: int
    total_passengers: int
    total_revenue: float
    max_capacity: int
    last_update: datetime
