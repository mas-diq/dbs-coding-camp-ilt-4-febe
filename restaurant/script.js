// URL API yang akan digunakan
const API_URL = 'https://restaurant-api.dicoding.dev/list';

// Fungsi untuk memformat JSON agar lebih mudah dibaca
function formatJSON(json) {
    return JSON.stringify(json, null, 2);
}

// Contoh menggunakan XMLHttpRequest
document.getElementById('fetchXHR').addEventListener('click', function () {
    const resultElement = document.getElementById('resultXHR');
    resultElement.textContent = 'Mengambil data...';

    const xhr = new XMLHttpRequest();
    xhr.open('GET', API_URL);

    xhr.onload = function () {
        if (xhr.status === 200) {
            console.log('Response:', this.responseText);
            const responseJson = JSON.parse(this.responseText);
            resultElement.textContent = formatJSON(responseJson);
        } else {
            resultElement.textContent = 'Error: ' + xhr.status;
        }
    };

    xhr.onerror = function () {
        resultElement.textContent = 'Request gagal dilakukan';
    };

    xhr.send();
});

// Contoh menggunakan Fetch API
document.getElementById('fetchAPI').addEventListener('click', function () {
    const resultElement = document.getElementById('resultFetch');
    resultElement.textContent = 'Mengambil data...';

    fetch(API_URL)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok: ' + response.status);
            }
            return response.json();
        })
        .then(data => {
            console.log('Response:', data);
            resultElement.textContent = formatJSON(data);
        })
        .catch(error => {
            resultElement.textContent = 'Error: ' + error.message;
        });
});

// Tampilkan daftar restoran dalam format yang lebih menarik
document.getElementById('showRestaurants').addEventListener('click', function () {
    const restaurantList = document.getElementById('restaurantList');
    restaurantList.innerHTML = 'Memuat data restoran...';

    fetch(API_URL)
        .then(response => response.json())
        .then(data => {
            const restaurants = data.restaurants;
            if (restaurants && restaurants.length > 0) {
                restaurantList.innerHTML = '';

                restaurants.forEach(restaurant => {
                    const restaurantCard = document.createElement('div');
                    restaurantCard.className = 'restaurant-item';

                    restaurantCard.innerHTML = `
                        <img src="https://restaurant-api.dicoding.dev/images/small/${restaurant.pictureId}" alt="${restaurant.name}">
                        <div class="restaurant-info">
                            <h3>${restaurant.name}</h3>
                            <p class="restaurant-city">Kota: ${restaurant.city}</p>
                            <p class="restaurant-rating">Rating: ⭐ ${restaurant.rating}</p>
                        </div>
                    `;

                    restaurantList.appendChild(restaurantCard);
                });
            } else {
                restaurantList.innerHTML = 'Tidak ada data restoran yang ditemukan.';
            }
        })
        .catch(error => {
            restaurantList.innerHTML = 'Error: ' + error.message;
        });
});