// Data villa disimpan dalam array berisi objek.
const villas = [
  {
    id: "villa-pinus",
    name: "Villa Pinus Asri",
    type: "Villa keluarga",
    location: "Puncak, Bogor",
    price: 850000,
    facilities: ["2 kamar tidur", "Dapur", "Area taman"],
    capacity: 6,
    available: true,
    symbol: "⌂"
  },
  {
    id: "villa-danau",
    name: "Villa Danau Indah",
    type: "Villa premium",
    location: "Cisarua, Bogor",
    price: 1250000,
    facilities: ["3 kamar tidur", "Kolam renang", "Pemandangan danau"],
    capacity: 8,
    available: true,
    symbol: "⌁"
  },
  {
    id: "villa-bukit",
    name: "Villa Bukit Cemara",
    type: "Villa minimalis",
    location: "Sentul, Bogor",
    price: 650000,
    facilities: ["2 kamar tidur", "Wi-Fi", "Balkon"],
    capacity: 4,
    available: true,
    symbol: "♧"
  }
];

const villaList = document.getElementById("villa-list");
const villaSelect = document.getElementById("villa-select");
const searchInput = document.getElementById("search-villa");
const emptyMessage = document.getElementById("empty-message");
const bookingForm = document.getElementById("booking-form");
const checkButton = document.getElementById("check-button");
const formMessage = document.getElementById("form-message");
const priceSummary = document.getElementById("price-summary");
const orderList = document.getElementById("order-list");

const rupiah = (amount) => new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0
}).format(amount);

// Membuat kartu villa dari data JavaScript menggunakan DOM.
function renderVillas(keyword = "") {
  villaList.replaceChildren();
  const normalizedKeyword = keyword.trim().toLowerCase();

  const filteredVillas = villas.filter((villa) => {
    const searchableText = `${villa.name} ${villa.location} ${villa.type}`.toLowerCase();
    return searchableText.includes(normalizedKeyword);
  });

  filteredVillas.forEach((villa) => {
    const card = document.createElement("article");
    card.className = "villa-card";

    const art = document.createElement("div");
    art.className = "villa-art";
    art.setAttribute("aria-hidden", "true");
    art.textContent = villa.symbol;

    const details = document.createElement("div");
    details.className = "villa-details";

    const type = document.createElement("p");
    type.className = "villa-type";
    type.textContent = villa.type;

    const title = document.createElement("h3");
    title.textContent = villa.name;

    const location = document.createElement("p");
    location.className = "villa-location";
    location.textContent = `📍 ${villa.location}`;

    const facilities = document.createElement("p");
    facilities.className = "villa-facilities";
    facilities.textContent = `Fasilitas: ${villa.facilities.join(", ")}`;

    const bottom = document.createElement("div");
    bottom.className = "villa-bottom";

    const price = document.createElement("div");
    price.className = "villa-price";
    const priceStrong = document.createElement("strong");
    priceStrong.textContent = rupiah(villa.price);
    const priceSmall = document.createElement("span");
    priceSmall.textContent = "per malam";
    price.append(priceStrong, priceSmall);

    const availability = document.createElement("span");
    availability.className = "availability";
    availability.textContent = villa.available ? "Tersedia" : "Tidak tersedia";

    bottom.append(price, availability);
    details.append(type, title, location, facilities, bottom);
    card.append(art, details);
    villaList.appendChild(card);
  });

  emptyMessage.hidden = filteredVillas.length !== 0;
}

// Mengisi pilihan villa pada dropdown berdasarkan array villa.
function populateVillaOptions() {
  villas.forEach((villa) => {
    const option = document.createElement("option");
    option.value = villa.id;
    option.textContent = `${villa.name} - ${rupiah(villa.price)}/malam`;
    villaSelect.appendChild(option);
  });
}

// Mengambil data dan memeriksa validitas formulir.
function validasiForm() {
  const name = document.getElementById("guest-name").value.trim();
  const checkInValue = document.getElementById("check-in").value;
  const checkOutValue = document.getElementById("check-out").value;
  const guestCount = Number(document.getElementById("guest-count").value);
  const villaId = villaSelect.value;

  if (!name) {
    return { valid: false, message: "Nama tamu wajib diisi." };
  }
  if (!checkInValue || !checkOutValue) {
    return { valid: false, message: "Tanggal check-in dan check-out wajib dipilih." };
  }

  // Tanggal dibandingkan pada format YYYY-MM-DD.
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayString = [
    today.getFullYear(),
    String(today.getMonth() + 1).padStart(2, "0"),
    String(today.getDate()).padStart(2, "0")
  ].join("-");

  if (checkInValue < todayString) {
    return { valid: false, message: "Tanggal check-in tidak boleh di masa lalu." };
  }
  if (checkOutValue <= checkInValue) {
    return { valid: false, message: "Tanggal check-out harus setelah check-in." };
  }
  if (!Number.isInteger(guestCount) || guestCount < 1 || guestCount > 10) {
    return { valid: false, message: "Jumlah tamu harus antara 1 sampai 10 orang." };
  }
  if (!villaId) {
    return { valid: false, message: "Silakan pilih villa terlebih dahulu." };
  }

  const selectedVilla = villas.find((villa) => villa.id === villaId);
  if (!selectedVilla) {
    return { valid: false, message: "Pilihan villa tidak valid." };
  }
  if (!selectedVilla.available) {
    return { valid: false, message: "Maaf, villa tersebut sedang tidak tersedia." };
  }
  if (guestCount > selectedVilla.capacity) {
    return {
      valid: false,
      message: `Kapasitas ${selectedVilla.name} maksimal ${selectedVilla.capacity} orang.`
    };
  }

  return {
    valid: true,
    data: { name, checkInValue, checkOutValue, guestCount, selectedVilla }
  };
}

// Menghitung jumlah malam dan total biaya pemesanan.
function hitungTotalHarga(data) {
  const checkIn = new Date(`${data.checkInValue}T00:00:00`);
  const checkOut = new Date(`${data.checkOutValue}T00:00:00`);
  const millisecondsPerDay = 1000 * 60 * 60 * 24;
  const nights = Math.round((checkOut - checkIn) / millisecondsPerDay);
  const total = data.selectedVilla.price * nights;

  return { nights, total };
}

function showPriceSummary(data, calculation) {
  document.getElementById("summary-villa").textContent = data.selectedVilla.name;
  document.getElementById("summary-nights").textContent = `${calculation.nights} malam`;
  document.getElementById("summary-rate").textContent = rupiah(data.selectedVilla.price);
  document.getElementById("summary-total").textContent = rupiah(calculation.total);
  priceSummary.hidden = false;
}

function showMessage(message, isSuccess = false) {
  formMessage.textContent = message;
  formMessage.classList.toggle("success", isSuccess);
}

// Menyimpan pesanan pada localStorage agar tetap ada setelah halaman dimuat ulang.
function saveOrder(order) {
  try {
    const existingOrders = JSON.parse(localStorage.getItem("vilaPermaiOrders")) || [];
    existingOrders.push(order);
    localStorage.setItem("vilaPermaiOrders", JSON.stringify(existingOrders));
    localStorage.setItem("vilaPermaiLastGuest", order.guestName);
    return true;
  } catch (error) {
    console.error("Gagal menyimpan pesanan:", error);
    showMessage("Pesanan tidak dapat disimpan pada browser ini. Periksa pengaturan penyimpanan.");
    return false;
  }
}

function renderOrders() {
  try {
    const orders = JSON.parse(localStorage.getItem("vilaPermaiOrders")) || [];
    orderList.replaceChildren();

    if (orders.length === 0) {
      const empty = document.createElement("p");
      empty.className = "empty-message";
      empty.textContent = "Belum ada pesanan yang tersimpan di perangkat ini.";
      orderList.appendChild(empty);
      return;
    }

    orders.slice().reverse().forEach((order) => {
      const item = document.createElement("article");
      item.className = "order-item";

      const information = document.createElement("div");
      const title = document.createElement("strong");
      title.textContent = `${order.villaName} — ${order.guestName}`;
      const dates = document.createElement("p");
      dates.textContent = `${order.checkIn} sampai ${order.checkOut} • ${order.nights} malam • ${order.guestCount} tamu`;
      information.append(title, dates);

      const total = document.createElement("span");
      total.className = "order-total";
      total.textContent = rupiah(order.total);

      item.append(information, total);
      orderList.appendChild(item);
    });
  } catch (error) {
    console.error("Gagal membaca riwayat pesanan:", error);
    orderList.textContent = "Riwayat pesanan tidak dapat dibaca.";
  }
}

// Tombol cek ketersediaan melakukan validasi dan menampilkan estimasi biaya.
checkButton.addEventListener("click", () => {
  const validation = validasiForm();
  if (!validation.valid) {
    priceSummary.hidden = true;
    showMessage(validation.message);
    return;
  }

  const calculation = hitungTotalHarga(validation.data);
  showPriceSummary(validation.data, calculation);
  showMessage("Villa tersedia berdasarkan data contoh. Berikut estimasi biayanya.", true);
});

// Event submit memproses pemesanan dan menyimpannya.
bookingForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const validation = validasiForm();
  if (!validation.valid) {
    priceSummary.hidden = true;
    showMessage(validation.message);
    return;
  }

  const data = validation.data;
  const calculation = hitungTotalHarga(data);
  showPriceSummary(data, calculation);

  const order = {
    guestName: data.name,
    villaId: data.selectedVilla.id,
    villaName: data.selectedVilla.name,
    checkIn: data.checkInValue,
    checkOut: data.checkOutValue,
    guestCount: data.guestCount,
    nights: calculation.nights,
    total: calculation.total,
    createdAt: new Date().toISOString()
  };

  if (saveOrder(order)) {
    showMessage("Pesanan berhasil disimpan pada browser ini.", true);
    renderOrders();
  }
});

searchInput.addEventListener("input", () => {
  renderVillas(searchInput.value);
});

// Mengatur tanggal minimum agar pengguna tidak memilih tanggal lampau.
function setMinimumDate() {
  const now = new Date();
  const localDate = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, "0"),
    String(now.getDate()).padStart(2, "0")
  ].join("-");
  document.getElementById("check-in").min = localDate;
  document.getElementById("check-out").min = localDate;
}

document.getElementById("check-in").addEventListener("change", (event) => {
  document.getElementById("check-out").min = event.target.value || "";
});

// Inisialisasi halaman.
try {
  renderVillas();
  populateVillaOptions();
  renderOrders();
  setMinimumDate();

  const lastGuest = localStorage.getItem("vilaPermaiLastGuest");
  if (lastGuest) {
    document.getElementById("guest-name").value = lastGuest;
  }
} catch (error) {
  console.error("Terjadi kesalahan saat memuat aplikasi:", error);
  showMessage("Aplikasi gagal dimuat. Silakan muat ulang halaman.");
}
