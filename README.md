# Delivery Cost Service

Микросервис для расчёта стоимости доставки. Принимает данные о корзине и адресе, параллельно опрашивает провайдеров доставки и возвращает единый список вариантов.

---

### API

**POST** `/api/delivery/calculate`

**Request:**
```json
{
  "basket": {
    "weight": 2.5,
    "dimensions": {
      "length": 30,
      "width": 20,
      "height": 15
    },
    "total": 4990
  },
  "address": {
    "city": "Москва",
    "region": "Московская область",
    "postalCode": "101000"
  }
}
```

(?) Total - это сумма корзины?

**Response:**
```json
{
  "options": [
    {
      "providerId": "cdek",
      "providerName": "СДЭК",
      "price": 250,
      "currency": "RUB",
      "estimatedDays": {
        "min": 2,
        "max": 4
      },
      "type": "courier"
    },
    {
      "providerId": "boxberry",
      "providerName": "Boxberry",
      "price": 300,
      "currency": "RUB",
      "estimatedDays": {
        "min": 3,
        "max": 5
      },
      "type": "pickup_point"
    }
  ]
}
```

Решения по контрактам:
- Если провайдер недоступен, его вариант просто отсутствует в списке (не блокирует ответ)
- `options` всегда массив, может быть пустым (обсудил бы с бизнесом, для мобильные апки предпочитают null вместо пустого массива)
- Нет поля `error` при частичном успехе — клиент видит то, что удалось получить

---

**Интерфейс провайдера (`IDeliveryProvider`):**
```typescript
interface IDeliveryProvider {
  readonly id: string;
  readonly name: string;
  calculate(request: DeliveryRequest): Promise<DeliveryOption[]>;
}
```

**Как добавить нового провайдера (например, Яндекс Доставка):**
1. Создать `src/providers/YandexDeliveryProvider.ts`, реализовать `IDeliveryProvider`
2. Зарегистрировать экземпляр в `app.ts` в массиве провайдеров

Больше ничего менять не нужно. `DeliveryService` работает с абстракцией и не знает о конкретных реализациях.

**`DeliveryService` — параллельный опрос:**
```typescript
// Упрощённо
const results = await Promise.allSettled(
  providers.map(p => p.calculate(request))
);
// Берём только fulfilled, rejected — логируем и пропускаем
```

---

**Что делал бы дальше:**
- Кэш последнего успешного ответа - возможно, возвращать устаревшие данные лучше, чем ничего
- Метрики по каждому провайдеру (latency, error rate)

---

**Пример запроса:**
```bash
curl -X POST http://localhost:3000/api/delivery/calculate \
  -H "Content-Type: application/json" \
  -d '{
    "basket": { "weight": 2.5, "dimensions": { "length": 30, "width": 20, "height": 15 }, "total": 4990 },
    "address": { "city": "Москва" }
  }'
```
