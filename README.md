# Delivery Cost Service

Микросервис для расчёта стоимости доставки. Принимает данные о корзине и адресе, параллельно опрашивает провайдеров
доставки и возвращает единый список вариантов.

---

## Запуск

```bash
npm install
npm run start:dev
```

Сервер запустится на `http://localhost:3000`.

---

## API

### `POST /api/v1/delivery/calculate`

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
    "addressLine1": "ул. Тверская, 1",
    "addressLine2": "кв. 10",
    "city": "Москва",
    "state": "Московская область",
    "zipCode": "101000"
  }
}
```

| Поле                   | Тип    | Обязательное | Описание               |
|------------------------|--------|--------------|------------------------|
| `basket.weight`        | number | да           | Вес в кг               |
| `basket.dimensions`    | object | да           | Габариты в см          |
| `basket.total`         | number | да           | Сумма корзины в рублях |
| `address.addressLine1` | string | да           | Улица и номер дома     |
| `address.addressLine2` | string | нет          | Квартира, офис и т.д.  |
| `address.city`         | string | да           | Город                  |
| `address.state`        | string | нет          | Регион / область       |
| `address.zipCode`      | string | да           | Почтовый индекс        |

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
      }
    },
    {
      "providerId": "boxberry",
      "providerName": "Boxberry",
      "price": 300,
      "currency": "RUB",
      "estimatedDays": {
        "min": 3,
        "max": 5
      }
    }
  ]
}
```

Решения по контрактам:

- Если провайдер недоступен или превысил таймаут — его вариант отсутствует в списке, ответ не блокируется
- `options` всегда массив, может быть пустым
- Нет поля `error` при частичном успехе — клиент видит то, что удалось получить

---

## Примеры запросов

### Москва

```bash
curl -X POST http://localhost:3000/api/v1/delivery/calculate \
  -H "Content-Type: application/json" \
  -d '{
    "basket": {
      "weight": 2.5,
      "dimensions": { "length": 30, "width": 20, "height": 15 },
      "total": 4990
    },
    "address": {
      "addressLine1": "ул. Тверская, 1",
      "city": "Москва",
      "zipCode": "101000"
    }
  }'
```

Ожидаемый ответ: СДЭК = 250 руб (2.5 кг × 100), Boxberry = 300 руб (фиксированный тариф).

---

### Казань

```bash
curl -X POST http://localhost:3000/api/v1/delivery/calculate \
  -H "Content-Type: application/json" \
  -d '{
    "basket": {
      "weight": 1,
      "dimensions": { "length": 20, "width": 15, "height": 10 },
      "total": 1500
    },
    "address": {
      "addressLine1": "ул. Баумана, 5",
      "city": "Казань",
      "zipCode": "420000"
    }
  }'
```

Ожидаемый ответ: СДЭК = 100 руб, Boxberry = 500 руб.

---

### Неизвестный город

```bash
curl -X POST http://localhost:3000/api/v1/delivery/calculate \
  -H "Content-Type: application/json" \
  -d '{
    "basket": {
      "weight": 0.5,
      "dimensions": { "length": 10, "width": 10, "height": 5 },
      "total": 800
    },
    "address": {
      "addressLine1": "ул. Ленина, 1",
      "city": "Владивосток",
      "zipCode": "690000"
    }
  }'
```

Ожидаемый ответ: СДЭК = 50 руб, Boxberry = 700 руб (тариф по умолчанию).

---

### Невалидный запрос (ValidationPipe вернёт 400)

```bash
curl -X POST http://localhost:3000/api/v1/delivery/calculate \
  -H "Content-Type: application/json" \
  -d '{
    "basket": { "weight": "не число" },
    "address": {}
  }'
```

---

## Архитектура

**Интерфейс провайдера (`DeliveryProvider`):**

```typescript
interface DeliveryProvider {
  readonly id: string;
  readonly name: string;
  readonly timeoutMs: number;

  calculate(dto: CalculateDeliveryDto): Promise<DeliveryOption[]>;
}
```

**Как добавить нового провайдера (например, Яндекс Доставка):**

1. Создать `src/modules/delivery/providers/yandex.provider.ts`, реализовать `DeliveryProvider`
2. Добавить экземпляр в массив в `delivery.module.ts`

Больше ничего менять не нужно. `DeliveryService` работает с абстракцией и не знает о конкретных реализациях.

---

## Что будет в случае падения или невалидного ответа от одного из провайдеров?

Каждый провайдер сейчас конфигурируется в коде, конфигурацию можно будет вынести в .env,
есть поле timeoutMs, если основной метод calculate не резолвит промис в течение указанного времени, промис реджектится,
провайдер не включается в ответ.
Unit-test: `src/modules/delivery/delivery.service.spec.ts:119`

---

## Тесты

```bash
npm test          # unit-тесты
```

> PASS src/modules/delivery/delivery.controller.spec.ts
> PASS src/modules/delivery/delivery.service.spec.ts
> PASS src/modules/delivery/providers/boxberry.provider.spec.ts
> PASS src/modules/delivery/providers/cdek.provider.spec.ts

Test Suites: 4 passed, 4 total
Tests:       16 passed, 16 total
Snapshots:   0 total
Time:        0.531 s, estimated 1 s
Ran all test suites.

---

## Что можно улучшить

- Добавил на будущее estimatedDays, можно обсудить формат или удалить, кажется нужная информация для клиента
- Кэш последнего успешного ответа — устаревшие данные лучше, чем пустой список
- Метрики по каждому провайдеру (latency, error rate)
- Завернуть в сервис в Docker для деплоя в прод
- Добавить список валидных городов в зависимости от потребностей бизнеса, либо в код, либо в БД
- Продумать механизм взаимодействия основного приложения с микросервисом. Нужно ли защищать эндпоинт авторизацией или
  сервис будет доступен только во внутренней сети? При масштабировании возможен переход на Event-Driven архитектуру.
