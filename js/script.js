const city = document.querySelector('.weather_city'),
    day = document.querySelector('.weather_day'),
    humidityEl = document.querySelector('.weather_indicator--humidity>.value'),
    windEl = document.querySelector('.weather_indicator--wind>.value'),
    pressureEl = document.querySelector('.weather_indicator--pressure>.value'),
    image = document.querySelector('.weather_image'),
    temperature = document.querySelector('.weather_temperature>.value'),
    searchInput = document.querySelector('.weather_search'),
    forcastEl = document.querySelector('.weather__forecast'),
    suggestions = document.querySelector('#suggestion');

// Api and api key
const weatherAPI_KEY = 'b6ec82a4924378820dc831e38280dc64';
// weather current api
const weatherBasedEndPoint = `https://api.openweathermap.org/data/2.5/weather?units=metric&appid=${weatherAPI_KEY}`;
// forcast weather api link
const forcastBasedEndPoint = `https://api.openweathermap.org/data/2.5/forecast?&units=metric&appid=${weatherAPI_KEY}`;
// For getting city name in search, api
const cityBasedEndPoint = 'https://api.teleport.org/api/cities/?search=';

let weatherImages = [{
        url: 'images/clear-sky.png',
        ids: [800]
    },
    {
        url: 'images/few-clouds.png',
        ids: [801]
    },
    {
        url: 'images/rain.png',
        ids: [500, 501, 502, 503, 504]
    },
    {
        url: 'images/scattered-clouds.png',
        ids: [802]
    },
    {
        url: 'images/broken-clouds.png',
        ids: [803, 804]
    },
    {
        url: 'images/shower-rain.png',
        ids: [520, 521, 522, 531, 300, 301, 302, 310, 311, 313, 314, 321]
    },
    {
        url: 'images/snow.png',
        ids: [511, 600, 601, 602, 611, 612, 613, 615, 616, 620, 621, 622]
    },
    {
        url: 'images/thunderstorm.png',
        ids: [200, 201, 202, 210, 211, 212, 221, 230, 231, 232]
    },
    {
        url: 'images/mist.png',
        ids: [701, 711, 721, 731, 741, 751, 761, 762, 771, 781]
    }
];

// Fetching data from api
const getWeatherByCityName = async(cityString) => {
    let city;
    if (cityString.includes(',')) {
        city = cityString.substring(0, cityString.indexOf(',')) + cityString.substring(cityString.lastIndexOf(','))
    } else {
        city = cityString;
    }
    const endpoint = weatherBasedEndPoint + '&q=' + city;

    const response = await fetch(endpoint);
    if (response.status !== 200) {
        alert('City not found!');
    }
    const weather = await response.json();

    return weather;
}

// Getting Forcast by city
const getForcastByCityId = async(id) => {
    const forCastEndPoint = `${forcastBasedEndPoint}&id=${id}`;

    const result = await fetch(forCastEndPoint);

    const forCast = await result.json();

    const forcastList = forCast.list;

    let daily = [];

    forcastList.forEach((day) => {
        const date = new Date(day.dt_txt.replace(' ', 'T'));

        const hours = date.getHours();

        if (hours === 12) {
            daily.push(day);
        }
    })

    return daily;
}

const weatherForCity = async(city) => {
    let weather = await getWeatherByCityName(city);
    if (!weather) {
        return
    };
    updateCurrentWeather(weather);
    const cityID = weather.id;
    const forcast = await getForcastByCityId(cityID);
    updateForcast(forcast);
}

const init = () => {
    weatherForCity('Bangladesh').then(() => document.body.style.filter = 'blur(0)');
}
init();


// If we enter any city name in search input? that's gonna fetch the data
searchInput.addEventListener('keydown', async(e) => {
    if (e.keyCode === 13) {
        weatherForCity(e.target.value)
    }
});

searchInput.addEventListener('input', async() => {
    const endpoint = cityBasedEndPoint + searchInput.value;
    const result = await (await fetch(endpoint)).json();

    suggestions.innerHTML = '';
    const cities = result._embedded['city:search-results'];
    const length = cities.length > 10 ? 10 : cities.length;

    for (let i = 0; i < length; i++) {
        const option = document.createElement('option');
        option.value = cities[i].matching_full_name;
        suggestions.appendChild(option);
    }
})

// Update the current weather condition in the DOM
const updateCurrentWeather = (data) => {
    const { humidity, pressure, temp } = data.main;
    city.textContent = `${data.name}, ${data.sys.country}`;
    day.textContent = dayOfWeek();
    temperature.textContent = temp > 0 ? '+' + Math.round(temp) : Math.round(temp);
    humidityEl.textContent = humidity;
    pressureEl.textContent = pressure;

    let windDirection;
    const deg = data.wind.deg;

    if (deg > 45 && deg <= 135) {
        windDirection = 'East';
    } else if (deg > 135 && deg <= 225) {
        windDirection = 'South';
    } else if (deg > 225 && deg <= 315) {
        windDirection = 'West';
    } else {
        windDirection = 'North';
    }
    windEl.textContent = `${windDirection}, ${data.wind.speed}`;

    const imgID = data.weather[0].id;

    weatherImages.forEach((obj) => {
        if (obj.ids.includes(imgID)) {
            image.src = obj.url;
        }
    });
};

// Update forcast

const updateForcast = (forcast) => {
    forcastEl.innerHTML = '';

    forcast.forEach((day) => {
        const iconUrl = 'http://openweathermap.org/img/wn/';
        const icon = `${iconUrl}${day.weather[0].icon}@2x.png`;
        const weekdays = dayOfWeek(day.dt * 1000);
        const temps = day.main.temp > 0 ? '+' + Math.round(day.main.temp) : Math.round(day.main.temp);

        const forcastItem = `
            <article class="weather__forecast__item">
                <img src="${icon}" alt="${day.weather[0].description}" class="weather__forecast__icon">
                <h3 class="weather__forecast__day">${weekdays}</h3>
                <p class="weather__forecast__temperature"><span class="value">${temps}</span> &deg;C</p>
            </article>
        `
        forcastEl.insertAdjacentHTML('beforeend', forcastItem);
    });
}

// Getting the day of week 
const dayOfWeek = (dt = new Date().getTime()) => {
    return new Date(dt).toLocaleDateString('en-EN', { 'weekday': 'long' });
}