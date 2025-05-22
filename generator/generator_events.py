import requests
import random
import time
import logging
import os

# Настройка логирования
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Конфигурация
API_URL = os.getenv("API_URL", "http://0.0.0.0:8008/api/bus/passengers")
TOTAL_BUSES = 10  # Общее количество автобусов
MIN_PASSENGERS = 1  # Минимальное количество пассажиров
MAX_PASSENGERS = 15  # Максимальное количество пассажиров
MIN_INTERVAL = 1  # Минимальный интервал между запросами (в секундах)
MAX_INTERVAL = 3  # Максимальный интервал между запросами (в секундах)

def generate_passenger_event():
    """Генерирует случайное событие прибытия пассажиров"""
    bus_id = random.randint(1, TOTAL_BUSES)
    entered = random.randint(MIN_PASSENGERS, MAX_PASSENGERS)
    exited = random.randint(MIN_PASSENGERS, MAX_PASSENGERS)
    
    return {
        "bus_id": bus_id,
        "entered": entered,
        "exited": exited
    }

def send_passenger_event(event):
    """Отправляет событие на сервер"""
    try:
        response = requests.post(API_URL, json=event)
        if response.status_code == 200:
            logger.info(f"Успешно отправлено событие для автобуса {event['bus_id']}: "
                       f"вошло {event['entered']}, вышло {event['exited']}")
        else:
            logger.error(f"Ошибка при отправке события: {response.text}")
    except Exception as e:
        logger.error(f"Ошибка при отправке запроса: {str(e)}")

def simulate_bus_system():
    """Основная функция симуляции"""
    logger.info(f"Запуск симуляции системы автобусов... API URL: {API_URL}")
    
    try:
        while True:
            # Генерируем и отправляем событие
            event = generate_passenger_event()
            send_passenger_event(event)
            
            # Ждем случайное время перед следующим событием
            wait_time = random.uniform(MIN_INTERVAL, MAX_INTERVAL)
            logger.info(f"Ожидание {wait_time:.1f} секунд перед следующим событием...")
            time.sleep(wait_time)
            
    except KeyboardInterrupt:
        logger.info("Симуляция остановлена пользователем")
    except Exception as e:
        logger.error(f"Произошла ошибка: {str(e)}")

if __name__ == "__main__":
    simulate_bus_system()
