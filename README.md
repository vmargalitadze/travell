# 🚀 Система Бронирования Путешествий

Современная веб-платформа для управления туристическими пакетами, бронированиями и транспортными услугами.

## 📋 Описание Системы

Это полнофункциональная система управления туристическим бизнесом, построенная на Next.js с использованием Prisma ORM и PostgreSQL. Система поддерживает многоязычность, современный UI/UX дизайн и полный набор административных функций.

## 🗄️ Структура Базы Данных (Prisma Schema)

### 🏢 **Company (Компания)**
```prisma
model Company {
  id          Int       @id @default(autoincrement())
  name        String    // Название компании
  description String?   // Описание компании (опционально)
  logoUrl     String?   // URL логотипа компании
  packages    Package[] // Связь с пакетами путешествий
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
}
```
**Назначение:** Управление туристическими компаниями-партнерами. Каждая компания может предлагать множество пакетов путешествий.

---

### 🏷️ **Category (Категория)**
```prisma
model Category {
  id       Int       @id @default(autoincrement())
  name     String    // Название категории
  packages Package[] // Связь с пакетами
}
```
**Назначение:** Классификация пакетов путешествий (например: "Приключения", "Культурный туризм", "Пляжный отдых").

---

### 📍 **Location (Местоположение)**
```prisma
model Location {
  id       Int       @id @default(autoincrement())
  name     String    // Название места
  country  String    // Страна
  packages Package[] // Связь с пакетами
}
```
**Назначение:** Географические локации для путешествий (например: "Мачу-Пикчу, Перу").

---

### 🎒 **Package (Пакет Путешествия)**
```prisma
model Package {
  id          Int    @id @default(autoincrement())
  title       String // Название пакета
  description String // Описание
  price       Float  // Цена
  duration    String // Продолжительность
  maxPeople   Int    // Максимальное количество людей

  category   Category       @relation(fields: [categoryId], references: [id])
  categoryId Int
  location   Location       @relation(fields: [locationId], references: [id])
  locationId Int
  gallery    GalleryImage[] // Галерея изображений
  bookings   Booking[]      // Бронирования

  bus       Bus?     // Связанный автобус (опционально)
  busId     Int?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```
**Назначение:** Основная сущность системы - пакет путешествия. Содержит всю информацию о туре, включая цену, описание, связанную компанию, категорию и местоположение.

---

### 🖼️ **GalleryImage (Изображение Галереи)**
```prisma
model GalleryImage {
  id        Int     @id @default(autoincrement())
  url       String  // URL изображения
  package   Package @relation(fields: [packageId], references: [id])
  packageId Int
}
```
**Назначение:** Хранение изображений для галереи каждого пакета путешествия.

---

### 📅 **Booking (Бронирование)**
```prisma
model Booking {
  id           Int       @id @default(autoincrement())
  package      Package   @relation(fields: [packageId], references: [id])
  packageId    Int
  name         String    // Имя клиента
  email        String    // Email клиента
  phone        String?   // Телефон (опционально)
  adults       Int       // Количество взрослых
  children     Int       // Количество детей
  date         DateTime  // Дата путешествия
  totalPrice   Float     // Общая стоимость
  seatNumber   String?   // Номер места (опционально)
  seatSelected Boolean   @default(false) // Выбрано ли место
  seat         Seat?     @relation(fields: [seatId], references: [id])
  seatId       Int?      @unique
  payment      Payment?  // Информация об оплате
  discount     Discount? @relation(fields: [discountId], references: [id])
  discountId   Int?
  createdAt    DateTime  @default(now())
}
```
**Назначение:** Записи о бронированиях клиентов. Содержит всю информацию о заказе, включая данные клиента, количество путешественников, выбранные места и стоимость.

---

### 🚌 **Bus (Автобус)**
```prisma
model Bus {
  id        Int    @id @default(autoincrement())
  name      String // Название автобуса
  seatCount Int    // Количество мест
  seats     Seat[] // Список мест

  package   Package @relation(fields: [packageId], references: [id])
  packageId Int     @unique
}
```
**Назначение:** Управление транспортными средствами для каждого пакета путешествия. Каждый автобус имеет определенное количество мест.

---

### 💺 **Seat (Место)**
```prisma
model Seat {
  id      Int      @id @default(autoincrement())
  number  String   // Номер места
  bus     Bus      @relation(fields: [busId], references: [id])
  busId   Int
  booking Booking? // Связь с бронированием (если место забронировано)
}
```
**Назначение:** Индивидуальные места в автобусе. Позволяет клиентам выбирать конкретные места за дополнительную плату.

---

### 💳 **Payment (Оплата)**
```prisma
model Payment {
  id        Int      @id @default(autoincrement())
  booking   Booking  @relation(fields: [bookingId], references: [id])
  bookingId Int      @unique
  amount    Float    // Сумма оплаты
  status    String   // Статус: 'pending', 'paid', 'failed'
  createdAt DateTime @default(now())
}
```
**Назначение:** Отслеживание платежей за бронирования. Хранит информацию о сумме, статусе и времени оплаты.

---

### 🎫 **Discount (Скидка)**
```prisma
model Discount {
  id        Int       @id @default(autoincrement())
  code      String    @unique // Уникальный код скидки
  amount    Float     // Размер скидки
  expiresAt DateTime  // Дата истечения скидки
  bookings  Booking[] // Бронирования с этой скидкой
}
```
**Назначение:** Система скидок и промокодов. Позволяет применять скидки к бронированиям с ограничением по времени.

## 🔗 Связи Между Моделями

### Основные Связи:
- **Company → Package**: Один ко многим (компания может предлагать много пакетов)
- **Category → Package**: Один ко многим (категория может содержать много пакетов)
- **Location → Package**: Один ко многим (локация может быть в разных пакетах)
- **Package → Booking**: Один ко многим (пакет может иметь много бронирований)
- **Package → Bus**: Один к одному (каждый пакет может иметь один автобус)
- **Bus → Seat**: Один ко многим (автобус имеет много мест)
- **Booking → Seat**: Один к одному (бронирование может иметь одно место)
- **Booking → Payment**: Один к одному (бронирование имеет одну оплату)
- **Booking → Discount**: Многие к одному (много бронирований могут использовать одну скидку)

## 🚀 Функциональность Системы

### 👥 Для Клиентов:
- Просмотр доступных пакетов путешествий
- Фильтрация по категориям, компаниям, локациям
- Бронирование пакетов с указанием количества путешественников
- Выбор конкретных мест в автобусе (за дополнительную плату)
- Применение промокодов и скидок
- Просмотр истории бронирований

### 👨‍💼 Для Администраторов:
- Полное управление пакетами путешествий
- Управление компаниями-партнерами
- Создание и редактирование категорий и локаций
- Управление автобусами и местами
- Просмотр всех бронирований
- Управление системой скидок
- Аналитика и отчеты

### 🌐 Технические Особенности:
- Многоязычность (русский, английский, грузинский)
- Современный адаптивный дизайн
- Загрузка изображений через Cloudinary
- Валидация данных с помощью Zod
- Серверные действия (Server Actions)
- Реальное время обновления данных

## 🛠️ Технологический Стек

- **Frontend**: Next.js 14, React, TypeScript
- **Styling**: Tailwind CSS
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: NextAuth.js
- **Image Upload**: Cloudinary
- **Icons**: Lucide React
- **Validation**: Zod
- **UI Components**: Custom components with modern design

## 📊 Статистика и Аналитика

Система предоставляет администраторам:
- Общее количество пакетов, бронирований, компаний
- Общую выручку от всех бронирований
- Статистику по категориям и локациям
- Информацию о загруженности автобусов

## 🔒 Безопасность

- Валидация всех входных данных
- Защита от SQL-инъекций через Prisma
- Безопасная загрузка файлов
- Контроль доступа к административным функциям

Эта система представляет собой полноценное решение для управления туристическим бизнесом с современным интерфейсом и мощной функциональностью.#   t r a v e l  
 #   t r a v e l  
 #   t r a v e l  
 #   t r a v e l  
 #   t r a v e l  
 #   t r a v e l  
 #   t r a v e l  
 #   t r a v e l l  
 #   t r a v e l  
 #   t r a v e l  
 #   t r a v e l  
 #   t r a v e l l  
 