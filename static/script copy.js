let schools = [];
let filteredData = [];
let currentPage = 1;
const entriesPerPage = 20;

// Fungsi Haversine untuk menghitung jarak antara dua titik koordinat
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius Bumi dalam kilometer
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Fungsi untuk mendapatkan lokasi pengguna
function getUserLocation(callback) {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition((position) => {
      callback(position.coords.latitude, position.coords.longitude);
    });
  } else {
    alert("Geolocation tidak didukung oleh browser ini.");
  }
}



// Fungsi untuk memuat data untuk tampilan umum (index.html)
function loadSchoolData() {
  fetch("http://127.0.0.1:5000/api/sekolah")
    .then((response) => response.json())
    .then((data) => {
      console.log(data);  // Pastikan data terlihat di console
      schools = data.map((school) => ({
        no: school.no,
        name: school.sekolah,
        latitude: parseFloat(school.latitude),
        longitude: parseFloat(school.longitude),
        mapLink: `https://www.google.com/maps?q=${school.latitude},${school.longitude}`,
        img: `/assets/${school.nama_gambar}`,
      }));

      // Mengambil lokasi pengguna dan menghitung jarak
      getUserLocation((userLat, userLon) => {
        schools = schools.map((school) => {
          school.distance = calculateDistance(
            userLat,
            userLon,
            school.latitude,
            school.longitude
          ).toFixed(2); // jarak dalam km
          return school;
        });
        filteredData = schools;  // Menetapkan filteredData
        displayTableData(); // Menampilkan data pada halaman biasa
      });
    })
    .catch((error) => {
      console.error("Error loading data:", error);
    });
}

// Fungsi untuk memuat data untuk tampilan admin (admin_dashboard.html)
function loadSchoolDataAdmin() {
  fetch("http://127.0.0.1:5000/api/sekolah")
    .then((response) => response.json())
    .then((data) => {
      console.log(data);  // Pastikan data terlihat di console
      schools = data.map((school) => ({
        no: school.no,
        name: school.sekolah,
        latitude: parseFloat(school.latitude),
        longitude: parseFloat(school.longitude),
        mapLink: `https://www.google.com/maps?q=${school.latitude},${school.longitude}`,
        img: `/assets/${school.nama_gambar}`,
      }));

      // Mengambil lokasi pengguna dan menghitung jarak
      getUserLocation((userLat, userLon) => {
        schools = schools.map((school) => {
          school.distance = calculateDistance(
            userLat,
            userLon,
            school.latitude,
            school.longitude
          ).toFixed(2); // jarak dalam km
          return school;
        });
        filteredData = schools;  // Menetapkan filteredData
        displayTableDataAdmin(); // Menampilkan data pada halaman admin
      });
    })
    .catch((error) => {
      console.error("Error loading data:", error);
    });
}

// Panggil fungsi yang sesuai berdasarkan halaman yang dimuat
if (document.getElementById("adminPage")) {
  // Jika ada elemen dengan ID 'adminPage', berarti ini adalah halaman admin
  loadSchoolDataAdmin();
} else {
  // Jika tidak, panggil loadSchoolData untuk tampilan umum
  loadSchoolData();
}



// Fungsi untuk menampilkan data di tabel dengan pagination
function displayTableData() {
  const tableBody = document.getElementById("schoolTable");
  tableBody.innerHTML = "";  // Pastikan tabel kosong sebelum mengisi

  const startIndex = (currentPage - 1) * entriesPerPage;
  const endIndex = Math.min(startIndex + entriesPerPage, filteredData.length);

  for (let i = startIndex; i < endIndex; i++) {
    const school = filteredData[i];
    const row = document.createElement("tr");

    row.innerHTML = `
      <td class="px-4 py-2 border-b border-gray-200 text-center">${school.no}</td>
      <td class="px-4 py-2 border-b border-gray-200">${school.name}</td>
      <td class="px-4 py-2 border-b border-gray-200 text-center">
        <a href="${school.mapLink}" target="_blank" class="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-1 px-3 rounded-full text-sm">Buka Map</a>
      </td>
      <td class="px-4 py-2 border-b border-gray-200 text-center">${school.distance} km</td>
      <td class="px-4 py-2 border-b border-gray-200 text-center">
        <img src="${school.img}" alt="${school.name}" class="w-16 h-12 rounded-md object-cover">
      </td>
    `;

    tableBody.appendChild(row);
  }

  document.getElementById("entriesInfo").textContent = `Showing ${
    startIndex + 1
  } to ${endIndex} of ${filteredData.length} entries`;

  document.getElementById("prevButton").disabled = currentPage === 1;
  document.getElementById("nextButton").disabled =
    currentPage === Math.ceil(filteredData.length / entriesPerPage);
}

function displayTableDataAdmin() {
  const tableBody = document.getElementById("schoolTableadmin");
  tableBody.innerHTML = "";  // Pastikan tabel kosong sebelum mengisi

  const startIndex = (currentPage - 1) * entriesPerPage;
  const endIndex = Math.min(startIndex + entriesPerPage, filteredData.length);

  for (let i = startIndex; i < endIndex; i++) {
    const school = filteredData[i];
    const row = document.createElement("tr");

    // Membuat baris dengan data sekolah
    row.innerHTML = `
      <td class="px-4 py-2 border-b border-gray-200 text-center">${school.no}</td>
      <td class="px-4 py-2 border-b border-gray-200">${school.name}</td>
      <td class="px-4 py-2 border-b border-gray-200 text-center">
        <a href="${school.mapLink}" target="_blank" class="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-1 px-3 rounded-full text-sm">Buka Map</a>
      </td>
      <td class="px-4 py-2 border-b border-gray-200 text-center">${school.distance} km</td>
      <td class="px-4 py-2 border-b border-gray-200 text-center">
        <img src="${school.img}" alt="${school.name}" class="w-16 h-12 rounded-md object-cover">
      </td>
      <td class="px-4 py-2 border-b border-gray-200 text-center">
        <a href="/admin/edit_school/${school.no}" class="text-yellow-500 hover:text-yellow-700">Edit</a> | 
        <a href="/admin/delete_school/${school.no}" class="text-red-500 hover:text-red-700" onclick="return confirm('Apakah Anda yakin ingin menghapus sekolah ini?')">Hapus</a>
      </td>
    `;

    tableBody.appendChild(row);
  }

  document.getElementById("entriesInfoAdmin").textContent = `Showing ${
    startIndex + 1
  } to ${endIndex} of ${filteredData.length} entries`;
  
  document.getElementById("prevButtonAdmin").disabled = currentPage === 1;
  document.getElementById("nextButtonAdmin").disabled =
    currentPage === Math.ceil(filteredData.length / entriesPerPage);
  
}



function prevPageAdmin() {
  if (currentPage > 1) {
    currentPage--;
    displayTableDataAdmin();
  }
}

function nextPageAdmin() {
  if (currentPage < Math.ceil(filteredData.length / entriesPerPage)) {
    currentPage++;
    displayTableDataAdmin();
  }
}

// Fungsi untuk navigasi halaman sebelumnya
function prevPage() {
  if (currentPage > 1) {
    currentPage--;
    displayTableData();
  }
}

// Fungsi untuk navigasi halaman berikutnya
function nextPage() {
  if (currentPage < Math.ceil(filteredData.length / entriesPerPage)) {
    currentPage++;
    displayTableData();
  }
}

// Fungsi untuk mencari data berdasarkan input pada search bar
function searchFunction() {
  const searchQuery = document.getElementById("search").value.toLowerCase();
  filteredData = schools.filter((school) =>
    school.name.toLowerCase().includes(searchQuery)
  );
  currentPage = 1; // Reset ke halaman pertama saat mencari
  displayTableData();
}

function searchFunctionAdmin() {
  const searchQuery = document.getElementById("search").value.toLowerCase();
  filteredData = schools.filter((school) =>
    school.name.toLowerCase().includes(searchQuery)
  );
  currentPage = 1; // Reset ke halaman pertama saat mencari
  displayTableDataAdmin();
}



// Muat data dari API saat halaman pertama kali dimuat
window.onload = loadSchoolData;
