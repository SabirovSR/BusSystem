from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from database import bus_system_db
from models import PassengerArrival, BusStatus, BusStatistics
from datetime import datetime, timedelta
from typing import List

app = FastAPI(
    title="Bus System API",
    description="FastAPI-приложение для сбора информации об остановках",
    version="1.0.0")

# Настройка CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Конфигурация
BUS_CAPACITY = 10  # Общее количество автобусов
MAX_CAPACITY = {
    "micro_bus": 20,
    "bus": 30,
    "large_bus": 50
}
  # Максимальная вместимость автобуса по умолчанию
TARIFFS = {  # Тарифы в рублях за проезд
    "normal": 45
}

# Инициализация автобусов
def initialize_bus(busCapacity = BUS_CAPACITY):
    if bus_system_db.bus_entity.count_documents({}) == 0:
        buses = []
        for i in range(busCapacity):
            if i < 5:
                buses.append({
                    "bus_id": i+1,
                    "bus_type": "micro_bus",
                    "status": "free",
                    "current_count_passengers": 0,
                    "max_capacity": MAX_CAPACITY["micro_bus"],
                    "revenue": 0
                })
            elif i < 8:
                buses.append({
                    "bus_id": i+1,
                    "bus_type": "bus",
                    "status": "free",
                    "current_count_passengers": 0,
                    "max_capacity": MAX_CAPACITY["bus"],
                    "revenue": 0
                })
            elif i < 10:
                buses.append({
                    "bus_id": i+1,
                    "bus_type": "large_bus",
                    "status": "free",
                    "current_count_passengers": 0,
                    "max_capacity": MAX_CAPACITY["large_bus"],
                    "revenue": 0
                })
        bus_system_db.bus_entity.insert_many(buses)

initialize_bus()

@app.post("/api/bus/passengers", response_model=BusStatus)
async def update_passengers(arrival: PassengerArrival):
    # Проверяем существование автобуса
    bus = bus_system_db.bus_entity.find_one({"bus_id": arrival.bus_id})
    if not bus:
        raise HTTPException(status_code=404, detail="Автобус не найден")
    
    # Рассчитываем доход от новых пассажиров
    revenue = arrival.entered * TARIFFS["normal"]
    
    # Обновляем информацию об автобусе
    new_passenger_count = bus["current_count_passengers"] + arrival.entered - arrival.exited
    if new_passenger_count < 0:
        raise HTTPException(status_code=400, detail="Некорректное количество пассажиров")
    
    # Проверяем, не превышает ли количество пассажиров максимальную вместимость
    if new_passenger_count > bus["max_capacity"]:
        raise HTTPException(
            status_code=400, 
            detail=f"Превышена максимальная вместимость автобуса ({bus['max_capacity']} пассажиров)"
        )
    
    update_data = {
        "current_count_passengers": new_passenger_count,
        "revenue": bus["revenue"] + revenue,
        "status": "in_service"
    }
    
    bus_system_db.bus_entity.update_one(
        {"bus_id": arrival.bus_id},
        {"$set": update_data}
    )
    
    # Записываем информацию о прибытии
    bus_system_db.passenger_arrivals.insert_one(arrival.dict())
    
    return BusStatus(
        bus_id=arrival.bus_id,
        status=update_data["status"],
        current_count_passengers=new_passenger_count,
        max_capacity=bus["max_capacity"],
        revenue=update_data["revenue"]
    )

@app.get("/api/bus/statistics/{bus_id}", response_model=BusStatistics)
async def get_bus_statistics(bus_id: int, time_range: str = "1d"):
    # Проверяем существование автобуса
    bus = bus_system_db.bus_entity.find_one({"bus_id": bus_id})
    if not bus:
        raise HTTPException(status_code=404, detail="Автобус не найден")
    
    # Определяем временной диапазон
    now = datetime.now()
    if time_range == "10m":
        start_time = now - timedelta(minutes=10)
    elif time_range == "1h":
        start_time = now - timedelta(hours=1)
    elif time_range == "1d":
        start_time = now - timedelta(days=1)
    elif time_range == "1w":
        start_time = now - timedelta(weeks=1)
    else:
        raise HTTPException(status_code=400, detail="Некорректный временной диапазон")
    
    # Получаем статистику по пассажирам
    arrivals = list(bus_system_db.passenger_arrivals.find({
        "bus_id": bus_id,
        "timestamp": {"$gte": start_time}
    }))
    
    total_passengers = sum(arrival["entered"] for arrival in arrivals)
    total_revenue = total_passengers * TARIFFS["normal"]  # Считаем доход только за выбранный период
    
    return BusStatistics(
        bus_id=bus_id,
        total_passengers=total_passengers,
        total_revenue=total_revenue,
        max_capacity=bus["max_capacity"],
        last_update=now
    )

@app.get("/api/bus/status", response_model=List[BusStatus])
async def get_all_buses_status():
    buses = list(bus_system_db.bus_entity.find())
    return [
        BusStatus(
            bus_id=bus["bus_id"],
            status=bus["status"],
            current_count_passengers=bus["current_count_passengers"],
            max_capacity=bus["max_capacity"],
            revenue=bus["revenue"]
        )
        for bus in buses
    ]

@app.post("/api/reset-database")
async def reset_database():
    # Очищаем все коллекции
    bus_system_db.bus_entity.delete_many({})
    bus_system_db.passenger_arrivals.delete_many({})
    
    # Заново инициализируем автобусы
    initialize_bus()
    
    return {"message": "База данных успешно сброшена"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8008)