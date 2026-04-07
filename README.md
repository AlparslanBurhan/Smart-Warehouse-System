# 📦 Akıllı Depo Yönetimi Sistemi (WMS)

[![.NET 9.0](https://img.shields.io/badge/.NET-9.0-512bd4?style=for-the-badge&logo=dotnet)](https://dotnet.microsoft.com/en-us/download/dotnet/9.0)
[![React 19](https://img.shields.io/badge/React-19-61dafb?style=for-the-badge&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-6.0-3178c6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![MUI 6](https://img.shields.io/badge/MUI-6.0-007fff?style=for-the-badge&logo=mui)](https://mui.com/)
[![License: MIT](https://img.shields.io/badge/Lisans-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

Bu proje; modern, ölçeklenebilir ve yüksek performanslı bir **Çoklu Şirket (Multi-Tenant)** Akıllı Depo Yönetimi Sistemi olarak geliştirilmiştir. En güncel teknolojiler ve katı mimari kurallar kullanılarak "State-of-the-art" bir kullanıcı deneyimi sunar.

---

## ✨ Temel Özellikler

-   🌐 **Multi-Tenant (Çoklu Şirket) Yapısı**: Her şirket için `CompanyId` bazlı tam veri izolasyonu.
-   🏗️ **N-Tier (Katmanlı) Mimari**: Repository, Manager ve Controller katmanları ile temiz ve sürdürülebilir kod yapısı.
-   ⚡ **Toplu Lokasyon Üretimi**: Saniyeler içinde binlerce raf ve bölge (Örn: A-1'den T-10'a) otomatik tanımlama.
-   📊 **Gelişmiş Envanter Takibi**: Veritabanı seviyesinde optimize edilmiş gerçek zamanlı stok hesaplamaları.
-   🔄 **Esnek Stok Hareketleri**: Stok Giriş, Stok Çıkış ve Depolar Arası Transfer işlemleri.
-   📜 **Detaylı İşlem Geçmişi**: Tüm depo hareketleri için renk kodlu ve filtreleyebilir log sistemi.
-   💎 **Premium Arayüz (UI/UX)**: Glassmorphism tasarımı, karanlık mod desteği ve Framer Motion ile mikro animasyonlar.
-   🔍 **Sunucu Taraflı (Server-Side) İşlemler**: Büyük veri setleri için optimize edilmiş sayfalama, arama ve filtreleme.

---

## 🛠️ Teknoloji Yığını

### **Backend (Sunucu)**
-   **.NET 9.0** (Web API)
-   **Entity Framework Core 9.0**
-   **MS SQL Server**
-   **Kısıtlı HTTP Stratejisi**: Güvenlik gereği `PUT` ve `DELETE` metodları yasaktır. Tüm güncellemeler ve yumuşak silme (soft-delete) işlemleri `POST` üzerinden `EntityState.Modified` zorunluluğu ile yapılır.

### **Frontend (Arayüz)**
-   **React 19** & **TypeScript**
-   **Vite 8.0**
-   **Material UI (MUI 6)** & **@mui/x-data-grid**
-   **Framer Motion** (Animasyonlar)
-   **Axios**: PascalCase <-> camelCase otonom veri dönüşüm interceptor yapısı.

---

## 🚀 Başlangıç

### Gereksinimler
-   [.NET 9.0 SDK](https://dotnet.microsoft.com/download/dotnet/9.0)
-   [Node.js (v22+)](https://nodejs.org/)
-   [Docker Desktop](https://www.docker.com/products/docker-desktop/) (SQL Server için)

### 1. Veritabanı Kurulumu
Sistem MS SQL Server kullanmaktadır. Docker üzerinden hızlıca ayağa kaldırabilirsiniz:
```bash
docker run -e "ACCEPT_EULA=Y" -e "MSSQL_SA_PASSWORD=<Sifreniz123!>" -p 1433:1433 --name sqlserver -d mcr.microsoft.com/mssql/server:2022-latest
```

### 2. Backend (API) Kurulumu
1.  API klasörüne gidin:
    ```bash
    cd WarehouseManagement.Api
    ```
2.  Gerekirse `appsettings.json` içindeki bağlantı dizesini güncelleyin.
3.  Migration'ları uygulayın ve başlatın:
    ```bash
    dotnet ef database update
    dotnet run
    ```
    *API adresi: http://localhost:5051*

### 3. Frontend (Arayüz) Kurulumu
1.  UI klasörüne gidin:
    ```bash
    cd warehouse-management-ui
    ```
2.  Bağımlılıkları yükleyin:
    ```bash
    npm install
    ```
3.  Geliştirici sunucusunu başlatın:
    ```bash
    npm run dev
    ```
    *Arayüz adresi: http://localhost:5173* (Varsayılan Vite portu)

---

## 🧠 Yapay Zeka (AI) Odaklı Geliştirme
Bu proje, Yapay Zeka (Gemini 3 Flash) desteği ile "Mimari Denetçi" ve "Tasarım Danışmanı" rehberliğinde geliştirilmiştir:
-   Multi-tenant mantığının stratejik planlanması.
-   HTTP metod kısıtlamalarının (PUT/DELETE yasağı) uygulanması.
-   Premium Glassmorphism arayüz bileşenlerinin tasarımı.
-   EF Core performans analizleri ve LINQ sorgu optimizasyonları.
