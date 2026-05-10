# Sınıf Modülü ve Canlı Ders Sistemi (Plan)

Yaptığım analizlere göre, şu anda **"Stüdyo"** ekranında bir ders hazırlayıp "Yayın Başlat" dediğinizde altyapı zaten **rastgele 6 haneli bir PIN numarası** oluşturuyor ve öğrenciler ana sayfadan veya `/play` üzerinden PIN girip aynen **Kahoot mantığıyla** anlık olarak bağlanabiliyor. Tahtaya çizim veya şıklı sorular anlık olarak aktarılıyor.

Ancak isteğinizi detaylandırdığımda, sanırım **uçucu (geçici) bir Kahoot** lobisinden ziyade, **kalıcı ve yönetilebilir "Sınıflar" (Google Classroom vb.)** kurmak istediğinizi anlıyorum. 

## User Review Required

> [!IMPORTANT]
> **Öğretmenler için iki ayrı sistem yapılandırmayı planlıyorum:**
> 1. **Anlık Yayın (Şu anki Stüdyo):** Kayıt/Kuyruk derdi olmadan derse giren herkese saniyesinde 6 haneli PIN atar (Tam Kahoot mantığı).
> 2. **Kalıcı Sınıflar (Klasik Sınıf):** Öğretmen panelinde "**Sınıflarım**" diye bir sekme olacak. Öğretmen "11-A Sınıfı" oluşturacak ve sistem buna özel kalıcı bir 6 haneli kod üretecek.
>    - Öğrenciler ana sayfadan veya kendi panellerinden "**Sınıfa Katıl**" kısmına bu kalıcı kodu girip o hocanın öğrencisi (Roster/Liste) olacaklar.
>    - Öğretmen canlı ders açtığında, bu sınıfa kayıtlı öğrenciler otomatik bildirim alacak veya direkt kendi panellerindeki "Canlı Dersler" listesinden tek tıkla katılabilecek. Canlı yayınlar 1'e 1 eşzamanlı izlenecek. 
> 
> *Gerçekleştirmemi istediğiniz mimari tam olarak bu "Kalıcı Sınıf" yapısı mı?*

## Proposed Changes

Eğer yukarıdaki plan onaylanırsa:
### 1. Veritabanı Genişletmesi
- `schema.prisma` içerisine `Classroom` (Kalıcı Sınıf) ve `ClassroomStudent` (Kayıtlı Öğrenciler) tabloları eklenecek.
- Her `Classroom` kendi benzersiz `classCode`'una (6 haneli harf/rakam karması) sahip olacak.

### 2. Öğretmen Paneli (Dashboard)
- Sol menüye "Sınıflarım" (Classrooms) linki eklenecek.
- Öğretmenler kalıcı sınıf oluşturup, kayıtlı olan öğrencilerin Puan/QP skorlarını o sınıfa özel listede görüntüleyebilecekler (Liderlik Tablosu).

### 3. Öğrenci Paneli
- "Bir Sınıfa Katıl" butonu ile kodu yazıp hocalarının sistemine tam kayıt olma özelliği (Kalıcı).
- O sınıf aktif olduğunda "Hocanız Yayında!" uyarısı yapılması.

## Open Questions
- Stüdyo'da var olan mevcut 6 haneli kodla geçici Kahoot yapısı dilediğiniz gibi mi çalışıyor yoksa onda da tasarımsal olarak (Örneğin lobi ekranı) değişiklikler yapmamı ister misiniz?
- Kalıcı Sınıf kodları rastgele mi üretilmeli yoksa öğretmen kodu kendi mi belirlesin (Örn: `TARİH-101`)?
